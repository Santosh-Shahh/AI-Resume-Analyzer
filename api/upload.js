const { IncomingForm } = require('formidable');
const fs = require('fs');
const pdf = require('pdf-parse');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');
const connectDB = require('./_lib/db');
const { Resume } = require('./_lib/models');
const { verifyAuth } = require('./_lib/auth');

// Disable body parser — formidable handles multipart
module.exports.config = { api: { bodyParser: false } };

// ─── Groq Setup ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are a senior technical recruiter and ATS (Applicant Tracking System) specialist with 15+ years at top tech companies.

CRITICAL RULES:
- Be brutally honest. NEVER default to a "safe" score of 75-85.
- Only reference content that ACTUALLY exists in the resume. Never hallucinate.
- The overall "score" MUST be computed as a weighted average of the 8 breakdown categories (formula below). Do NOT pick a score independently.

BREAKDOWN CATEGORIES — Score each 0-10:
1. formatting (weight 10%): Section structure, bullet points, consistency, length
2. keywords (weight 20%): Relevant technical skills and industry terms
3. experience (weight 20%): Work experience with quantified impact
4. projects (weight 15%): Project descriptions with tech stack and outcomes
5. achievements (weight 10%): Quantifiable achievements with metrics
6. education (weight 5%): Degree, institution, relevant details
7. contactInfo (weight 5%): Email, phone, LinkedIn, GitHub, portfolio
8. readability (weight 15%): Action verbs, conciseness, clarity

SCORE COMPUTATION (MANDATORY):
score = round(formatting*1.0 + keywords*2.0 + experience*2.0 + projects*1.5 + achievements*1.0 + education*0.5 + contactInfo*0.5 + readability*1.5)

OUTPUT: Return a single valid JSON object matching this schema exactly. No markdown.
{
  "inferredRole": "string",
  "score": 0-100,
  "scoreRationale": "2-3 sentences explaining the score",
  "keywordsMatched": ["skills found"],
  "keywordsMissing": ["missing skills"],
  "suggestions": ["specific tips (3-5)"],
  "breakdown": { "formatting": 0-10, "keywords": 0-10, "experience": 0-10, "projects": 0-10, "achievements": 0-10, "education": 0-10, "contactInfo": 0-10, "readability": 0-10 },
  "sectionFeedback": [{ "name": "string", "score": 0-10, "maxScore": 10, "status": "strong|moderate|weak", "tips": ["string"] }],
  "rewrites": [{ "before": "string", "after": "string", "reason": "string" }],
  "atsWarnings": ["string"],
  "jdMatch": null
}`;

function computeWeightedScore(bd) {
    const weighted =
        (bd.formatting || 0) * 1.0 +
        (bd.keywords || 0) * 2.0 +
        (bd.experience || 0) * 2.0 +
        (bd.projects || 0) * 1.5 +
        (bd.achievements || 0) * 1.0 +
        (bd.education || 0) * 0.5 +
        (bd.contactInfo || 0) * 0.5 +
        (bd.readability || 0) * 1.5;
    return Math.max(0, Math.min(100, Math.round(weighted)));
}

function validateAndFill(data) {
    const bdDefaults = { formatting: 0, keywords: 0, projects: 0, experience: 0, readability: 0, contactInfo: 0, education: 0, achievements: 0 };
    const defaults = {
        inferredRole: 'Unknown', score: 0, scoreRationale: 'Analysis incomplete.',
        keywordsMatched: [], keywordsMissing: [], suggestions: [],
        breakdown: bdDefaults, sectionFeedback: [], rewrites: [], atsWarnings: [], jdMatch: null,
    };
    for (const [key, val] of Object.entries(defaults)) {
        if (!(key in data)) data[key] = val;
    }
    const bd = data.breakdown || {};
    for (const [k, v] of Object.entries(bdDefaults)) {
        if (!(k in bd)) bd[k] = v;
        bd[k] = Math.max(0, Math.min(10, Math.round(Number(bd[k]) || 0)));
    }
    data.breakdown = bd;
    data.score = computeWeightedScore(bd);
    return data;
}

// ─── Handler ─────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    try {
        // Parse multipart form
        const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024, keepExtensions: true });
        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

        const file = files.resume?.[0] || files.resume;
        if (!file) return res.status(400).json({ message: 'No resume file uploaded' });

        const jobDescription = (Array.isArray(fields.jobDescription) ? fields.jobDescription[0] : fields.jobDescription) || '';

        // Extract text from PDF
        const fileBuffer = fs.readFileSync(file.filepath || file.path);
        let resumeText = '';

        const ext = (file.originalFilename || file.name || '').split('.').pop().toLowerCase();
        if (ext === 'pdf') {
            const pdfData = await pdf(fileBuffer);
            resumeText = pdfData.text || '';
        } else if (ext === 'txt') {
            resumeText = fileBuffer.toString('utf-8');
        } else {
            return res.status(415).json({ message: 'Only PDF and TXT files are supported' });
        }

        // Clean text
        resumeText = resumeText.replace(/\r\n|\r/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

        if (resumeText.length < 100) {
            return res.status(422).json({ message: 'Resume text is too short to analyze' });
        }

        // Call Groq AI
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const resumeSnippet = resumeText.substring(0, 12000);
        const jdSnippet = jobDescription.trim() ? jobDescription.substring(0, 4000) : 'Not provided. Analyze based on inferred role.';

        const userPrompt = `--- RESUME TEXT START ---\n${resumeSnippet}\n--- RESUME TEXT END ---\n\n--- JOB DESCRIPTION START ---\n${jdSnippet}\n--- JOB DESCRIPTION END ---\n\nNow execute the chain-of-thought steps and return the JSON analysis.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 2048,
            response_format: { type: 'json_object' },
        });

        let analysis;
        try {
            analysis = JSON.parse(completion.choices[0].message.content);
            analysis = validateAndFill(analysis);
        } catch {
            analysis = {
                inferredRole: 'Unknown', score: 0, scoreRationale: 'Failed to parse AI response.',
                keywordsMatched: [], keywordsMissing: [], suggestions: ['Error: AI response was not valid JSON'],
                breakdown: { formatting: 0, keywords: 0, projects: 0, experience: 0, readability: 0, contactInfo: 0, education: 0, achievements: 0 },
                sectionFeedback: [], rewrites: [], atsWarnings: [], jdMatch: null,
            };
        }

        // Send response
        const resumeId = new mongoose.Types.ObjectId();
        res.status(201).json({ message: 'Resume analyzed successfully', resumeId, analysis });

        // Save to MongoDB (non-blocking, after response)
        try {
            await connectDB();
            const userId = verifyAuth(req);
            await Resume.create({
                _id: resumeId,
                userId,
                originalName: file.originalFilename || file.name || 'resume.pdf',
                filename: `${resumeId}.${ext}`,
                path: file.filepath || file.path,
                jobDescription,
                analysis: {
                    score: analysis.score,
                    scoreRationale: analysis.scoreRationale || '',
                    inferredRole: analysis.inferredRole || '',
                    keywordsMatched: analysis.keywordsMatched || [],
                    keywordsMissing: analysis.keywordsMissing || [],
                    suggestions: analysis.suggestions || [],
                    breakdown: analysis.breakdown || {},
                    sectionFeedback: analysis.sectionFeedback || [],
                    rewrites: analysis.rewrites || [],
                    atsWarnings: analysis.atsWarnings || [],
                },
            });
        } catch (dbErr) {
            console.log('MongoDB save error (non-blocking):', dbErr.message);
        }

        // Clean up temp file
        try { fs.unlinkSync(file.filepath || file.path); } catch { }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
