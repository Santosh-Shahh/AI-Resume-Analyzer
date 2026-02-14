import React from 'react';
import { FileText, CheckCircle, Lightbulb } from 'lucide-react';

const Results = ({ result }) => {
    // Default state when no file uploaded
    const displayResult = result || {
        atsScore: 78,
        matchedKeywords: ['React', 'Node.js', 'MongoDB', 'Python'],
        suggestions: [
            'Add measurable achievements',
            'Include more keywords',
            'Improve summary section'
        ]
    };

    const { atsScore, matchedKeywords, suggestions } = displayResult;

    return (
        <div className="grid md:grid-cols-3 gap-6">
            {/* ATS Score Card */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                    <FileText className="text-white" size={24} />
                    <h3 className="text-xl font-semibold">ATS Score</h3>
                </div>
                <p className="text-5xl font-bold mb-4">{atsScore}%</p>
                <p className="text-slate-400 text-sm">
                    {atsScore >= 80 ? 'Excellent! Your resume is highly optimized.' :
                        atsScore >= 60 ? 'Good optimization, can improve further.' :
                            'Needs improvement. Follow suggestions.'}
                </p>
            </div>

            {/* Skills Detected */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                <h3 className="text-xl font-semibold mb-6">Skills Detected</h3>
                <div className="space-y-3">
                    {matchedKeywords.map((keyword, index) => (
                        <div key={index} className="text-slate-300">
                            {keyword}
                        </div>
                    ))}
                </div>
            </div>

            {/* Suggestions */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                <h3 className="text-xl font-semibold mb-6">Suggestions</h3>
                <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                        <div key={index} className="text-slate-300 text-sm">
                            {suggestion}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Results;
