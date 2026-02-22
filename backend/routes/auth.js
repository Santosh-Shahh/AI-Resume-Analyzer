const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper: find or create social user
const findOrCreateSocialUser = async ({ email, name, avatar, provider, providerId }) => {
    // Check if user exists with this provider + providerId
    let user = await User.findOne({ provider, providerId });
    if (user) return user;

    // Check if email already exists (link accounts)
    user = await User.findOne({ email });
    if (user) {
        // Update existing user with social info if they used local before
        user.provider = provider;
        user.providerId = providerId;
        if (avatar && !user.avatar) user.avatar = avatar;
        await user.save();
        return user;
    }

    // Create new user
    user = await User.create({ name, email, avatar, provider, providerId });
    return user;
};

// ─── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        const user = await User.create({ name, email, password, provider: 'local' });
        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        });
    } catch (error) {
        console.error('Register error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// ─── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        if (user.provider !== 'local') {
            return res.status(400).json({
                message: `This account uses ${user.provider} sign-in. Please use the ${user.provider} button.`
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = generateToken(user._id);

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({
            user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
//  SOCIAL AUTH: GOOGLE
// ═══════════════════════════════════════════════════════════════════════════

router.post('/google', async (req, res) => {
    try {
        const { credential, profile } = req.body;
        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required.' });
        }

        let email, name, picture, googleId;

        // If profile data is provided (implicit flow with access token)
        if (profile && profile.sub) {
            // Verify by fetching userinfo from Google with the access token
            try {
                const verifyRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${credential}` }
                });
                const verified = verifyRes.data;
                email = verified.email;
                name = verified.name;
                picture = verified.picture;
                googleId = verified.sub;
            } catch {
                return res.status(401).json({ message: 'Invalid Google access token.' });
            }
        } else if (process.env.GOOGLE_CLIENT_ID) {
            // ID token flow (credential is a JWT)
            const { OAuth2Client } = require('google-auth-library');
            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
            googleId = payload.sub;
        } else {
            return res.status(503).json({ message: 'Google sign-in is not configured.' });
        }

        const user = await findOrCreateSocialUser({
            email,
            name,
            avatar: picture,
            provider: 'google',
            providerId: googleId,
        });

        const token = generateToken(user._id);

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ message: 'Google authentication failed. Please try again.' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
//  SOCIAL AUTH: GITHUB
// ═══════════════════════════════════════════════════════════════════════════

// Step 1: Redirect to GitHub
router.get('/github', (req, res) => {
    if (!process.env.GITHUB_CLIENT_ID) {
        return res.status(503).json({ message: 'GitHub sign-in is not configured. Set GITHUB_CLIENT_ID in .env.' });
    }

    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/github/callback`,
        scope: 'user:email',
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// Step 2: GitHub callback
router.get('/github/callback', async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}?auth_error=No+code+from+GitHub`);
        }

        // Exchange code for access token
        const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        }, {
            headers: { Accept: 'application/json' }
        });

        const accessToken = tokenRes.data.access_token;
        if (!accessToken) {
            return res.redirect(`${process.env.FRONTEND_URL}?auth_error=GitHub+token+exchange+failed`);
        }

        // Fetch user profile
        const [profileRes, emailsRes] = await Promise.all([
            axios.get('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${accessToken}` }
            }),
            axios.get('https://api.github.com/user/emails', {
                headers: { Authorization: `Bearer ${accessToken}` }
            }),
        ]);

        const profile = profileRes.data;
        const primaryEmail = emailsRes.data.find(e => e.primary)?.email || emailsRes.data[0]?.email;

        if (!primaryEmail) {
            return res.redirect(`${process.env.FRONTEND_URL}?auth_error=No+email+from+GitHub`);
        }

        const user = await findOrCreateSocialUser({
            email: primaryEmail,
            name: profile.name || profile.login,
            avatar: profile.avatar_url,
            provider: 'github',
            providerId: String(profile.id),
        });

        const token = generateToken(user._id);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}?auth_token=${token}`);
    } catch (error) {
        console.error('GitHub auth error:', error.message);
        res.redirect(`${process.env.FRONTEND_URL}?auth_error=GitHub+authentication+failed`);
    }
});

// ═══════════════════════════════════════════════════════════════════════════
//  SOCIAL AUTH: LINKEDIN
// ═══════════════════════════════════════════════════════════════════════════

// Step 1: Redirect to LinkedIn
router.get('/linkedin', (req, res) => {
    if (!process.env.LINKEDIN_CLIENT_ID) {
        return res.status(503).json({ message: 'LinkedIn sign-in is not configured. Set LINKEDIN_CLIENT_ID in .env.' });
    }

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.LINKEDIN_CLIENT_ID,
        redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/linkedin/callback`,
        scope: 'openid profile email',
    });

    res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
});

// Step 2: LinkedIn callback
router.get('/linkedin/callback', async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}?auth_error=No+code+from+LinkedIn`);
        }

        // Exchange code for access token
        const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET,
            redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/linkedin/callback`,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenRes.data.access_token;
        if (!accessToken) {
            return res.redirect(`${process.env.FRONTEND_URL}?auth_error=LinkedIn+token+exchange+failed`);
        }

        // Fetch user profile using OpenID Connect userinfo
        const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const profile = profileRes.data;

        if (!profile.email) {
            return res.redirect(`${process.env.FRONTEND_URL}?auth_error=No+email+from+LinkedIn`);
        }

        const user = await findOrCreateSocialUser({
            email: profile.email,
            name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim(),
            avatar: profile.picture,
            provider: 'linkedin',
            providerId: profile.sub,
        });

        const token = generateToken(user._id);

        res.redirect(`${process.env.FRONTEND_URL}?auth_token=${token}`);
    } catch (error) {
        console.error('LinkedIn auth error:', error.message);
        res.redirect(`${process.env.FRONTEND_URL}?auth_error=LinkedIn+authentication+failed`);
    }
});

// ═══════════════════════════════════════════════════════════════════════════
//  PASSWORD RECOVERY
// ═══════════════════════════════════════════════════════════════════════════

const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Create reset url
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            const emailSent = await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message
            });

            res.status(200).json({
                success: true,
                data: 'Email sent',
                // DEV ONLY: Return link if SMTP is missing (emailSent is explicitly false)
                devLink: emailSent === false ? resetUrl : undefined
            });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
router.put('/reset-password/:resetToken', async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            console.log('Password reset failed: Invalid or expired token', { resetPasswordToken });
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        // Log user in directly
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
