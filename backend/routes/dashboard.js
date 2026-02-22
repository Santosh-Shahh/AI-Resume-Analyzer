const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Resume = require('../models/Resume');

// Auth middleware
function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId || decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

// GET /api/dashboard — user's resume history
router.get('/', requireAuth, async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.userId })
            .sort({ uploadDate: -1 })
            .select('originalName uploadDate analysis')
            .limit(50);

        // Compute stats
        const totalResumes = resumes.length;
        const avgScore = totalResumes > 0
            ? Math.round(resumes.reduce((sum, r) => sum + (r.analysis?.score || 0), 0) / totalResumes)
            : 0;

        // Score trend (last vs first)
        let improvement = 0;
        if (totalResumes >= 2) {
            const latest = resumes[0]?.analysis?.score || 0;
            const oldest = resumes[totalResumes - 1]?.analysis?.score || 0;
            improvement = latest - oldest;
        }

        res.json({
            stats: {
                totalResumes,
                avgScore,
                improvement,
                lastAnalyzed: resumes.length > 0 ? resumes[0].uploadDate : null,
            },
            resumes: resumes.map(r => ({
                id: r._id,
                fileName: r.originalName,
                uploadDate: r.uploadDate,
                score: r.analysis?.score || 0,
                breakdown: r.analysis?.breakdown || null,
            }))
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/dashboard/:id — single resume full analysis
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.json({
            id: resume._id,
            fileName: resume.originalName,
            uploadDate: resume.uploadDate,
            jobDescription: resume.jobDescription || '',
            analysis: resume.analysis || {},
        });
    } catch (error) {
        console.error('Resume detail error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
