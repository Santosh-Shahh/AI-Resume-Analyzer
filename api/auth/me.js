const connectDB = require('../_lib/db');
const { User } = require('../_lib/models');
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
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json({ user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};
