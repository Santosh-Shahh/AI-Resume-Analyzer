import React from 'react';

const Result = ({ result }) => {
    if (!result) return null;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md mt-6">
            <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
            <div className="mb-4">
                <span className="text-lg font-semibold">ATS Score: </span>
                <span className={`text-xl font-bold ${result.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.score}%
                </span>
            </div>

            <div className="mb-4">
                <h3 className="font-semibold text-lg">Matched Keywords:</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {result.keywordsMatched.map((kw, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {kw}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <h3 className="font-semibold text-lg">Missing Keywords:</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {result.keywordsMissing.map((kw, index) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                            {kw}
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-lg">Suggestions:</h3>
                <ul className="list-disc list-inside mt-2 text-gray-700">
                    {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="mb-1">{suggestion}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Result;
