import React from 'react';
import { TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';

const Results = ({ result }) => {
    if (!result) {
        return (
            <div className="card-white p-12 text-center">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-slate-50 rounded-lg p-8 mb-8">
                        <h3 className="text-2xl font-bold mb-3 text-slate-700">Sample Analysis Results</h3>
                        <p className="text-slate-600">
                            Upload your resume above to get your personalized ATS score and improvement suggestions
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 text-left">
                        <div className="p-6 bg-mint/5 rounded-lg border-2 border-mint/20">
                            <div className="text-3xl font-bold text-mint mb-2">78%</div>
                            <div className="text-sm text-slate-600">Sample ATS Score</div>
                        </div>
                        <div className="p-6 bg-mint/5 rounded-lg border-2 border-mint/20">
                            <div className="text-3xl font-bold text-mint mb-2">16</div>
                            <div className="text-sm text-slate-600">Resume Checks</div>
                        </div>
                        <div className="p-6 bg-mint/5 rounded-lg border-2 border-mint/20">
                            <div className="text-3xl font-bold text-mint mb-2">AI</div>
                            <div className="text-sm text-slate-600">Powered Analysis</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const scorePercentage = result.atsScore;
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-mint';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreMessage = (score) => {
        if (score >= 80) return 'Excellent! Your resume is well-optimized';
        if (score >= 60) return 'Good optimization, can improve further';
        return 'Needs improvement for better ATS performance';
    };

    return (
        <div className="space-y-8">
            {/* ATS Score Section */}
            <div className="card-white p-10">
                <h2 className="text-3xl font-bold mb-8 text-center">Your Resume Analysis</h2>

                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Score Circle */}
                    <div className="flex-shrink-0">
                        <div className="progress-circle mx-auto relative">
                            <svg width="120" height="120">
                                <circle
                                    className="progress-circle-bg"
                                    cx="60"
                                    cy="60"
                                    r="54"
                                />
                                <circle
                                    className="progress-circle-fill"
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-4xl font-bold ${getScoreColor(scorePercentage)}`}>
                                    {scorePercentage}%
                                </span>
                            </div>
                        </div>
                        <p className="text-center mt-4 font-semibold text-slate-700">ATS Score</p>
                    </div>

                    {/* Score Description */}
                    <div className="flex-1">
                        <p className="text-lg text-slate-600 mb-4">
                            {getScoreMessage(scorePercentage)}
                        </p>
                        <p className="text-slate-500">
                            Your resume has been analyzed across 16 crucial criteria including ATS compatibility,
                            keyword optimization, formatting, and content quality.
                        </p>
                    </div>
                </div>
            </div>

            {/* Keywords Section */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Matched Keywords */}
                <div className="card-white p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-mint" size={24} />
                        <h3 className="text-xl font-bold">Skills Detected</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {result.matchedKeywords.map((kw, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-mint/10 text-mint rounded-full text-sm font-medium border border-mint/20"
                            >
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Missing Keywords */}
                <div className="card-white p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingDown className="text-orange-500" size={24} />
                        <h3 className="text-xl font-bold">Suggested Skills to Add</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {result.missingKeywords.map((kw, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium border border-orange-200"
                            >
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Suggestions */}
            <div className="card-white p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Lightbulb className="text-mint" size={24} />
                    <h3 className="text-xl font-bold">Improvement Suggestions</h3>
                </div>
                <ul className="space-y-4">
                    {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-4 number-bg" data-number={index + 1}>
                            <div className="checkmark-circle mt-1 relative z-10">
                                <span className="text-xs font-bold">{index + 1}</span>
                            </div>
                            <span className="text-slate-700 flex-1 relative z-10">{suggestion}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Results;
