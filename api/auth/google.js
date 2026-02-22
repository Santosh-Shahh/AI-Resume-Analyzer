const jwt = require('jsonwebtoken');
const connectDB = require('../_lib/db');
const { User } = require('../_lib/models');

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    await connectDB();

    try {
        const { credential, profile } = req.body;
        if (!credential) return res.status(400).json({ message: 'Google credential is required.' });

        let email, name, picture, googleId;

        // Verify by fetching userinfo from Google with the access token
        const verifyRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${credential}` },
        });
        if (!verifyRes.ok) return res.status(401).json({ message: 'Invalid Google access token.' });

        const verified = await verifyRes.json();
        email = verified.email;
        name = verified.name;
        picture = verified.picture;
        googleId = verified.sub;

        // Find or create user
        let user = await User.findOne({ provider: 'google', providerId: googleId });
        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                user.provider = 'google';
                user.providerId = googleId;
                if (picture && !user.avatar) user.avatar = picture;
                await user.save();
            } else {
                user = await User.create({ name, email, avatar: picture, provider: 'google', providerId: googleId });
            }
        }

        const token = generateToken(user._id);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ message: 'Google authentication failed.' });
    }
};
