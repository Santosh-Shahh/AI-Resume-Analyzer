const connectDB = require('../_lib/db');
const { Resume } = require('../_lib/models');
const { verifyAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

    const userId = verifyAuth(req);
    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    await connectDB();

    try {
        const resumes = await Resume.find({ userId })
            .sort({ uploadDate: -1 })
            .select('originalName uploadDate analysis')
            .limit(50);

        const totalResumes = resumes.length;
        const avgScore = totalResumes > 0
            ? Math.round(resumes.reduce((sum, r) => sum + (r.analysis?.score || 0), 0) / totalResumes)
            : 0;

        let improvement = 0;
        if (totalResumes >= 2) {
            improvement = (resumes[0]?.analysis?.score || 0) - (resumes[totalResumes - 1]?.analysis?.score || 0);
        }

        res.json({
            stats: { totalResumes, avgScore, improvement, lastAnalyzed: resumes.length > 0 ? resumes[0].uploadDate : null },
            resumes: resumes.map(r => ({
                id: r._id,
                fileName: r.originalName,
                uploadDate: r.uploadDate,
                score: r.analysis?.score || 0,
                breakdown: r.analysis?.breakdown || null,
                analysis: r.analysis || null,
            }))
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
