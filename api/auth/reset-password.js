const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const connectDB = require('../_lib/db');
const { User } = require('../_lib/models');

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'PUT') return res.status(405).json({ message: 'Method not allowed' });

    await connectDB();

    try {
        // Extract token from URL: /api/auth/reset-password?token=xxx
        const resetToken = req.query.token;
        if (!resetToken) return res.status(400).json({ message: 'Reset token is required' });

        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = generateToken(user._id);
        res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
