import os
import re
import json
import time
import base64
import hashlib
import logging
import tempfile
from pathlib import Path
from functools import lru_cache
from flask import Flask, request, jsonify  # type: ignore[import]
from flask_cors import CORS  # type: ignore[import]
from flask_limiter import Limiter  # type: ignore[import]
from flask_limiter.util import get_remote_address  # type: ignore[import]
from PyPDF2 import PdfReader  # type: ignore[import]
from docx import Document  # type: ignore[import]
from groq import Groq  # type: ignore[import]
from dotenv import load_dotenv  # type: ignore[import]

# ─── Setup ────────────────────────────────────────────────────────────────────

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["60 per hour", "10 per minute"],
    storage_uri="memory://"
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise EnvironmentError("GROQ_API_KEY is not set in environment variables.")

client = Groq(api_key=GROQ_API_KEY)

# Use the most capable model available on Groq for best analysis quality
MODEL = "llama-3.3-70b-versatile"

# ─── Text Extraction ──────────────────────────────────────────────────────────

def extract_text(file_path: str) -> str:
    """Extract and clean text from PDF or TXT file."""
    path = Path(file_path).resolve()

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    suffix = path.suffix.lower()

    if suffix == ".txt":
        try:
            return _clean_text(path.read_text(encoding="utf-8"))
        except Exception as e:
            logger.error(f"TXT read error: {e}")
            raise

    if suffix == ".pdf":
        try:
            reader = PdfReader(str(path))
            raw = "\n".join(
                page.extract_text() or ""
                for page in reader.pages
            )
            return _clean_text(raw)
        except Exception as e:
            logger.error(f"PDF read error: {e}")
            raise

    if suffix == ".docx":
        try:
            doc = Document(str(path))
            raw = "\n".join(paragraph.text for paragraph in doc.paragraphs)
            return _clean_text(raw)
        except Exception as e:
            logger.error(f"DOCX read error: {e}")
            raise

    raise ValueError(f"Unsupported file type: {suffix}. Only .pdf, .docx, and .txt are supported.")


def _clean_text(text: str) -> str:
    """Normalize whitespace and remove junk characters from extracted text."""
    text = re.sub(r'\r\n|\r', '\n', text)           # normalize line endings
    text = re.sub(r'[ \t]+', ' ', text)              # collapse horizontal whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)           # max 2 consecutive newlines
    text = re.sub(r'[^\x20-\x7E\n]', '', text)      # strip non-printable ASCII
    return text.strip()


# ─── Prompt Engineering ───────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are a senior technical recruiter and ATS (Applicant Tracking System) specialist with 15+ years at top tech companies.

CRITICAL RULES:
- Be brutally honest. NEVER default to a "safe" score of 75-85.
- Only reference content that ACTUALLY exists in the resume. Never hallucinate.
- The overall "score" MUST be computed as a weighted average of the 8 breakdown categories (formula below). Do NOT pick a score independently.

════════════════════════════════════════
BREAKDOWN CATEGORIES — Score each 0-10
════════════════════════════════════════

1. formatting (weight 10%)
   1-2: Wall of text, no sections, no bullet points, inconsistent fonts
   3-4: Some sections but poor hierarchy, mixing formats
   5-6: Clear sections and bullet points but minor issues (inconsistent spacing, too long/short)
   7-8: Well-structured, consistent formatting, good use of whitespace
   9-10: Professional, ATS-perfect formatting, ideal length (1-2 pages)

2. keywords (weight 20%)
   1-2: Almost no relevant technical skills or industry terms
   3-4: Few keywords, missing most critical ones for the role
   5-6: Some relevant keywords but missing several important ones
   7-8: Good keyword coverage, missing a few nice-to-haves
   9-10: Comprehensive keyword coverage matching role requirements perfectly

3. experience (weight 20%)
   1-2: No work experience or completely irrelevant experience
   3-4: Some experience but reads like job descriptions, zero metrics
   5-6: Relevant experience present but lacks quantified impact
   7-8: Strong experience with some metrics and clear impact
   9-10: Rich experience with quantified achievements (%, $, #, time)

4. projects (weight 15%)
   1-2: No projects section at all
   3-4: Projects listed but no descriptions or impact
   5-6: Projects with basic descriptions but no metrics
   7-8: Well-described projects with tech stack and outcomes
   9-10: Impressive projects with measurable impact and clear technical depth

5. achievements (weight 10%)
   1-2: No quantifiable achievements anywhere in the resume
   3-4: One or two vague achievements without numbers
   5-6: A few achievements with some metrics
   7-8: Multiple quantified achievements (%, $, users, time saved)
   9-10: Every bullet point has measurable impact with specific numbers

6. education (weight 5%)
   1-2: No education section
   3-4: Education listed but missing details (degree, dates, institution)
   5-6: Education present with basic details
   7-8: Education with relevant coursework or honors
   9-10: Strong education with GPA, honors, relevant certifications

7. contactInfo (weight 5%)
   1-2: No contact information at all
   3-4: Only one contact method (just email or just phone)
   5-6: Email and phone present
   7-8: Email, phone, and LinkedIn/portfolio
   9-10: Complete: email, phone, LinkedIn, GitHub/portfolio, location

8. readability (weight 15%)
   1-2: Incoherent, grammatical errors, jargon-heavy with no context
   3-4: Readable but verbose, passive voice, weak action verbs
   5-6: Decent readability, some passive voice or generic language
   7-8: Clear, concise bullets with strong action verbs
   9-10: Exceptionally clear, every bullet starts with a power verb, concise and impactful

════════════════════════════════════════
SCORE COMPUTATION (MANDATORY)
════════════════════════════════════════

score = round(
  formatting * 1.0 +
  keywords * 2.0 +
  experience * 2.0 +
  projects * 1.5 +
  achievements * 1.0 +
  education * 0.5 +
  contactInfo * 0.5 +
  readability * 1.5
)

The score MUST equal this formula. Do NOT round up or adjust.

EXPECTED SCORE RANGES:
  85-100: Only for resumes with metrics in most bullets, comprehensive keywords, perfect formatting
  65-84:  Good resumes with some gaps
  40-64:  Average resumes, missing metrics or key sections
  20-39:  Weak resumes, mostly job descriptions not achievements
  0-19:   Nearly empty or completely irrelevant

CHAIN OF THOUGHT:
  1. Identify the target role.
  2. Extract every hard skill/tool explicitly mentioned.
  3. Identify critical MISSING skills for that role.
  4. Scan each bullet for metrics (%, $, #). Count how many have none.
  5. Check contact info completeness.
  6. Check education section presence and detail.
  7. Score each of the 8 breakdown categories using the rubrics above.
  8. Compute score using the weighted formula.
  9. Write rewrites for the 2-3 weakest bullets.

OUTPUT: Return a single valid JSON object matching this schema exactly. No markdown.

{
  "inferredRole": "string",
  "score": 0-100,
  "scoreRationale": "2-3 sentences explaining the score with specific evidence",
  "keywordsMatched": ["skills/tools found in resume"],
  "keywordsMissing": ["critical skills for the role that are absent"],
  "suggestions": [
    "Specific tip quoting actual resume text",
    "...(3-5 tips total)"
  ],
  "breakdown": {
    "formatting": 0-10,
    "keywords": 0-10,
    "experience": 0-10,
    "projects": 0-10,
    "achievements": 0-10,
    "education": 0-10,
    "contactInfo": 0-10,
    "readability": 0-10
  },
  "sectionFeedback": [
    {
      "name": "section name",
      "score": 0-10,
      "maxScore": 10,
      "status": "strong | moderate | weak",
      "tips": ["specific tip referencing actual content"]
    }
  ],
  "rewrites": [
    {
      "before": "exact bullet from resume",
      "after": "improved version with metrics",
      "reason": "what was improved"
    }
  ],
  "atsWarnings": ["ATS parsing issues"],
  "jdMatch": null
}
"""

def build_user_prompt(resume_text: str, job_description: str) -> str:
    resume_snippet = resume_text[:12000]  # type: ignore[index]
    jd_snippet = job_description[:4000] if job_description.strip() else "Not provided. Perform general analysis based on inferred target role."  # type: ignore[index]

    return f"""
--- RESUME TEXT START ---
{resume_snippet}
--- RESUME TEXT END ---

--- JOB DESCRIPTION START ---
{jd_snippet}
--- JOB DESCRIPTION END ---

Now execute the chain-of-thought steps and return the JSON analysis.
""".strip()


# ─── AI Analysis ──────────────────────────────────────────────────────────────

# Simple in-memory cache: keyed on (resume_hash, jd_hash)
_analysis_cache: dict[tuple, dict] = {}

def _hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]  # type: ignore[index]


def analyze_with_ai(resume_text: str, job_description: str = "") -> dict:
    """Call Groq API with retry logic and response validation."""
    cache_key = (_hash(resume_text), _hash(job_description))
    if cache_key in _analysis_cache:
        logger.info("Cache hit — returning cached analysis.")
        return _analysis_cache[cache_key]

    user_prompt = build_user_prompt(resume_text, job_description)

    max_retries = 3
    backoff = 2

    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Groq API call — attempt {attempt}/{max_retries}, model={MODEL}")
            completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                model=MODEL,
                temperature=0.3,        # Moderate variation for differentiated scoring
                max_tokens=2048,
                response_format={"type": "json_object"}
            )

            raw = completion.choices[0].message.content
            result = json.loads(raw)

            # Basic schema validation
            result = _validate_and_fill(result)

            logger.info(f"Analysis complete — score={result.get('score')}")
            _analysis_cache[cache_key] = result
            return result

        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error on attempt {attempt}: {e}")
        except Exception as e:
            logger.error(f"API error on attempt {attempt}: {e}")
            if attempt < max_retries:
                time.sleep(backoff ** attempt)

    # Graceful fallback
    return _fallback_response("Max retries exceeded. The AI service may be temporarily unavailable.")


def _validate_and_fill(data: dict) -> dict:
    """Ensure required keys exist with sane defaults, recompute score from breakdown."""
    breakdown_defaults = {
        "formatting": 0, "keywords": 0, "projects": 0, "experience": 0,
        "readability": 0, "contactInfo": 0, "education": 0, "achievements": 0
    }
    defaults = {
        "inferredRole": "Unknown",
        "score": 0,
        "scoreRationale": "Analysis incomplete.",
        "keywordsMatched": [],
        "keywordsMissing": [],
        "suggestions": [],
        "breakdown": breakdown_defaults,
        "sectionFeedback": [],
        "rewrites": [],
        "atsWarnings": [],
        "jdMatch": None
    }
    for key, default_val in defaults.items():
        if key not in data:
            data[key] = default_val

    # Ensure all 8 breakdown keys exist
    bd = data.get("breakdown", {})
    for k, v in breakdown_defaults.items():
        if k not in bd:
            bd[k] = v
        bd[k] = max(0, min(10, int(bd[k])))
    data["breakdown"] = bd

    # Recompute score from weighted breakdown (override LLM's score)
    data["score"] = _compute_weighted_score(bd)

    return data


def _compute_weighted_score(bd: dict) -> int:
    """Compute ATS score from breakdown using fixed weights."""
    weighted = (
        bd.get("formatting", 0) * 1.0 +
        bd.get("keywords", 0) * 2.0 +
        bd.get("experience", 0) * 2.0 +
        bd.get("projects", 0) * 1.5 +
        bd.get("achievements", 0) * 1.0 +
        bd.get("education", 0) * 0.5 +
        bd.get("contactInfo", 0) * 0.5 +
        bd.get("readability", 0) * 1.5
    )
    return max(0, min(100, round(weighted)))


def _fallback_response(reason: str) -> dict:
    return {
        "inferredRole": "Unknown",
        "score": 0,
        "scoreRationale": reason,
        "keywordsMatched": [],
        "keywordsMissing": [],
        "suggestions": [f"Error: {reason}"],
        "breakdown": {
            "formatting": 0, "keywords": 0, "projects": 0, "experience": 0,
            "readability": 0, "contactInfo": 0, "education": 0, "achievements": 0
        },
        "sectionFeedback": [],
        "rewrites": [],
        "atsWarnings": [],
        "jdMatch": None,
        "error": reason
    }


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": MODEL})


@app.route("/analyze", methods=["POST"])
@limiter.limit("10 per minute")
def analyze_resume():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    file_content_b64 = data.get("fileContent", "").strip()
    file_name = data.get("fileName", "resume.pdf").strip()
    job_description = data.get("jobDescription", "").strip()

    if not file_content_b64:
        return jsonify({"error": "fileContent (base64) is required."}), 400

    logger.info(f"Analyze request: file={file_name}, jd_provided={bool(job_description)}")

    # Decode base64 content into a temporary file
    tmp_path = None
    try:
        file_bytes = base64.b64decode(file_content_b64)
        suffix = Path(file_name).suffix.lower() or ".pdf"
        if suffix not in (".pdf", ".docx", ".txt"):
            return jsonify({"error": f"Unsupported file type: {suffix}. Only .pdf, .docx, and .txt are supported."}), 415

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        logger.info(f"Wrote temp file: {tmp_path} ({len(file_bytes)} bytes)")
    except Exception as e:
        logger.error(f"Failed to decode file content: {e}")
        return jsonify({"error": "Failed to decode file content. Ensure it is valid base64."}), 400

    try:
        resume_text = extract_text(tmp_path)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 415
    except Exception as e:
        logger.exception("Unexpected error during text extraction")
        return jsonify({"error": "Failed to extract text from file."}), 500
    finally:
        # Always clean up temp file
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception:
                pass

    if len(resume_text.strip()) < 100:
        return jsonify({"error": "Resume text is too short to analyze. Check the file contents."}), 422

    logger.info(f"Extracted {len(resume_text)} chars from resume.")

    try:
        result = analyze_with_ai(resume_text, job_description)
        return jsonify(result), 200
    except Exception as e:
        logger.exception("Unexpected error during AI analysis")
        return jsonify({"error": "AI analysis failed unexpectedly."}), 500


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    logger.info(f"Starting Resume Analyzer on port {port} | debug={debug} | model={MODEL}")
    app.run(host="0.0.0.0", port=port, debug=debug)