// Re-export models using the same schemas from the backend
const mongoose = require('mongoose');

// ─── User Schema ─────────────────────────────────────────────────────────────
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    avatar: { type: String },
    provider: { type: String, default: 'local' },
    providerId: { type: String },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

// ─── Resume Schema ───────────────────────────────────────────────────────────
const ResumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    jobDescription: { type: String },
    analysis: {
        score: Number,
        scoreRationale: String,
        inferredRole: String,
        keywordsMatched: [String],
        keywordsMissing: [String],
        suggestions: [String],
        breakdown: {
            formatting: Number,
            keywords: Number,
            projects: Number,
            experience: Number,
            readability: Number,
            contactInfo: Number,
            education: Number,
            achievements: Number,
        },
        sectionFeedback: [{
            name: String,
            score: Number,
            maxScore: Number,
            status: String,
            tips: [String],
        }],
        rewrites: [{
            before: String,
            after: String,
            reason: String,
        }],
        atsWarnings: [String],
        jdMatch: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Resume = mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);

module.exports = { User, Resume };
