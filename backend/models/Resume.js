const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ResumeSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    extractedText: { type: String },
    jobDescription: { type: String },
    analysis: {
        score: { type: Number },
        overallAssessment: { type: String },
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
            found: [String],
            missing: [String],
        }],
        rewrites: [{
            before: String,
            after: String,
            reason: String,
            section: String,
        }],
        extractedData: {
            contactInfo: {
                email: String,
                phone: String,
                linkedin: String,
                github: String,
                portfolio: String,
            },
            targetRole: String,
            yearsOfExperience: Number,
            education: [{
                degree: String,
                institution: String,
                year: String,
            }],
            workExperience: [{
                company: String,
                role: String,
                duration: String,
            }],
            skills: {
                technical: [String],
                soft: [String],
                languages: [String],
                tools: [String],
            },
            certifications: [String],
            projects: [{
                name: String,
                description: String,
            }],
        },
        atsCompatibility: {
            score: Number,
            issues: [String],
            recommendations: [String],
            usesTables: Boolean,
            usesImages: Boolean,
            usesColumns: Boolean,
            fontCompatibility: String,
        },
        quantifiableAchievements: {
            count: Number,
            examples: [String],
            score: Number,
        },
        actionVerbs: {
            count: Number,
            examples: [String],
            score: Number,
            recommendations: [String],
        },
        jdMatch: {
            type: Schema.Types.Mixed,
            required: false,
            default: null
        }
    }
}, {
    strict: false  // Allow fields not defined in schema
});

module.exports = mongoose.model('Resume', ResumeSchema);
