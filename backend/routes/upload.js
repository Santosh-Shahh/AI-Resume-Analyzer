const express = require('express');
const router = express.Router();
const multer = require('multer');
const Resume = require('../models/Resume');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Helper: extract userId from token (optional auth)
function getUserId(req) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.userId || decoded.id || null;
    } catch {
        return null;
    }
}

// Upload Endpoint
router.post('/', upload.single('resume'), async (req, res) => {
    // Wrap MongoDB operations to prevent blocking response
    let mongoSavePromise = null;

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { jobDescription } = req.body;
        const userId = getUserId(req);

        let resumeId = new mongoose.Types.ObjectId();

        // Call NLP service for real analysis
        let analysis = null;
        try {
            const nlpResponse = await axios.post(`${process.env.NLP_SERVICE_URL}/analyze`, {
                filePath: path.resolve(req.file.path),
                jobDescription: jobDescription || ''
            }, { timeout: 60000 });

            analysis = nlpResponse.data;
            console.log(`NLP analysis complete. Score: ${analysis.score}`);
        } catch (nlpError) {
            console.error('NLP service error:', nlpError.message);
            // Return error to frontend so it knows analysis failed
            return res.status(503).json({
                message: 'Analysis service unavailable. Make sure the NLP service is running on port 8001.',
                error: nlpError.message
            });
        }

        // Normalize jdMatch - ensure it's an object or null/undefined
        let normalizedJdMatch = null;
        if (analysis.jdMatch) {
            if (typeof analysis.jdMatch === 'object' && !Array.isArray(analysis.jdMatch) && analysis.jdMatch !== null) {
                normalizedJdMatch = analysis.jdMatch;
            } else {
                // If it's a string or other type, set to null
                normalizedJdMatch = null;
            }
        }

        // Return analysis results to frontend FIRST (before MongoDB save)
        const response = {
            message: 'Resume analyzed successfully',
            resumeId: resumeId,
            analysis: analysis
        };

        // Send response immediately
        res.status(201).json(response);

        // Save to MongoDB if connected (non-blocking, after response is sent)
        if (mongoose.connection.readyState === 1) {
            // Store the save operation but don't await it
            const mongoSavePromise = (async () => {
                try {
                    // Save the full analysis object directly
                    const analysisData = {
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
                    };

                    // Only add jdMatch if it's a valid object
                    if (normalizedJdMatch && typeof normalizedJdMatch === 'object') {
                        analysisData.jdMatch = normalizedJdMatch;
                    }

                    const newResume = new Resume({
                        _id: resumeId,
                        userId: userId,
                        originalName: req.file.originalname,
                        filename: req.file.filename,
                        path: req.file.path,
                        jobDescription: jobDescription,
                        analysis: analysisData
                    });

                    await newResume.save();
                    console.log('Resume saved to MongoDB');
                } catch (dbError) {
                    console.log('MongoDB save error (non-blocking):', dbError.message);
                }
            })();

            mongoSavePromise.catch(() => { }); // Suppress unhandled promise rejection
        } else {
            console.log('MongoDB not connected. Skipping DB save.');
        }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
