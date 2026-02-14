const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ResumeSchema = new Schema({
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    extractedText: { type: String },
    jobDescription: { type: String },
    analysis: {
        score: { type: Number },
        keywordsMatched: [String],
        keywordsMissing: [String],
        suggestions: [String]
    }
});

module.exports = mongoose.model('Resume', ResumeSchema);
