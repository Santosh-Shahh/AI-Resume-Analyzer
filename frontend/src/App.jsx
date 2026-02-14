import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Upload from './components/Upload';
import Results from './components/Results';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar */}
      <div className="flex justify-between items-center px-8 py-4 bg-slate-800/50 border-b border-slate-700/50">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="text-indigo-400" size={24} />
          AI Resume Analyzer
        </h1>
        <button className="bg-white text-slate-900 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition">
          Login with Google
        </button>
      </div>

      {/* Hero Section */}
      <div className="text-center mt-16 px-6 mb-12">
        <h2 className="text-5xl font-bold mb-4">
          Optimize your resume with AI
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Upload your resume and get ATS score, keyword suggestions, and improvement tips instantly.
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-4xl mx-auto px-6 mb-16">
        <Upload setAnalysisResult={setAnalysisResult} />
      </div>

      {/* Results Section - Always visible below upload */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <Results result={analysisResult} />
      </div>
    </div>
  );
}

export default App;
