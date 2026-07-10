import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, Shield, Zap, FileText, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Upload = ({ setAnalysisResult }) => {
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [showJD, setShowJD] = useState(false);
    const { token } = useAuth();

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        setFileName(file.name);
        const formData = new FormData();
        formData.append('resume', file);
        if (jobDescription.trim()) {
            formData.append('jobDescription', jobDescription.trim());
        }

        setUploading(true);
        try {
            const headers = { 'Content-Type': 'multipart/form-data' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await api.post('/api/upload', formData, { headers });

            const analysis = response.data?.analysis;
            const resumeId = response.data?.resumeId;

            if (!analysis || typeof analysis.score === 'undefined') {
                throw new Error('Invalid analysis response from server.');
            }

            setAnalysisResult({
                atsScore: analysis.score,
                overallAssessment: analysis.overallAssessment || analysis.scoreRationale || '',
                matchedKeywords: analysis.keywordsMatched || [],
                missingKeywords: analysis.keywordsMissing || [],
                suggestions: analysis.suggestions || [],
                breakdown: analysis.breakdown || null,
                sectionFeedback: analysis.sectionFeedback || [],
                rewrites: analysis.rewrites || [],
                extractedData: analysis.extractedData || {},
                atsCompatibility: analysis.atsCompatibility || {},
                quantifiableAchievements: analysis.quantifiableAchievements || {},
                actionVerbs: analysis.actionVerbs || {},
                jdMatch: analysis.jdMatch || null,
                resumeId: resumeId
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            setFileName('');
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error';
            alert(`Upload failed: ${msg}`);
        } finally {
            setUploading(false);
        }
    }, [setAnalysisResult, jobDescription, token]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: false
    });

    return (
        <div>
            {/* Job Description Toggle */}
            <div style={{ marginBottom: 16 }}>
                <button
                    type="button"
                    onClick={() => setShowJD(!showJD)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 20px',
                        background: showJD ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#fff',
                        color: showJD ? '#fff' : '#6366f1',
                        border: showJD ? 'none' : '2px solid #6366f1',
                        borderRadius: 12,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 14,
                        transition: 'all 0.3s ease',
                        width: '100%',
                        justifyContent: 'center',
                        boxShadow: showJD ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
                    }}
                >
                    <Briefcase size={18} />
                    {showJD ? 'Hide Job Description' : 'Paste Job Description for JD Matching'}
                    {showJD ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showJD && (
                    <div style={{
                        marginTop: 12,
                        animation: 'fadeIn 0.3s ease',
                    }}>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the full job description here... We'll compare your resume against it and show match %, missing skills, and specific tips to improve your chances."
                            style={{
                                width: '100%',
                                minHeight: 140,
                                padding: 16,
                                border: '2px solid #e2e8f0',
                                borderRadius: 12,
                                fontSize: 14,
                                lineHeight: 1.6,
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                background: '#f8fafc',
                                color: '#334155',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                        {jobDescription.trim() && (
                            <p style={{
                                fontSize: 13,
                                color: '#10b981',
                                marginTop: 6,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}>
                                <CheckCircle size={14} />
                                JD loaded — upload your resume to see the match analysis
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Upload Zone */}
            <div
                {...getRootProps()}
                className={`upload-zone ${isDragActive ? 'active' : ''}`}
                style={{ padding: '64px 32px', textAlign: 'center', cursor: 'pointer' }}
            >
                <input {...getInputProps()} />

                {/* Upload Icon */}
                <div className="animate-float" style={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 32px',
                    background: '#ecfdf5',
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <UploadCloud style={{ color: '#10b981' }} size={40} strokeWidth={1.5} />
                </div>

                {uploading ? (
                    <div className="loading-state">
                        <div style={{
                            width: 48,
                            height: 48,
                            margin: '0 auto 16px',
                            border: '4px solid #d1fae5',
                            borderTopColor: '#10b981',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#10b981', marginBottom: 8 }}>
                            Analyzing your resume...
                        </p>
                        <p style={{ fontSize: 14, color: '#64748b' }}>
                            {jobDescription.trim()
                                ? 'Comparing against job description and running full analysis...'
                                : 'Our AI is checking 16 factors.'}
                        </p>
                    </div>
                ) : (
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>
                            {fileName || 'Drop Your Resume Here'}
                        </h3>
                        <p style={{ color: '#64748b', marginBottom: 32 }}>
                            or click to browse • PDF or DOCX • Max 2MB
                        </p>

                        <button className="btn-mint btn-mint-lg" style={{ marginBottom: 32 }}>
                            <FileText size={20} />
                            Analyze My Resume Free
                        </button>

                        {/* Trust Row */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 24,
                            fontSize: 14,
                            color: '#94a3b8'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Shield size={15} />
                                <span>100% Private</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Zap size={15} />
                                <span>Real-Time ATS Analysis</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CheckCircle size={15} />
                                <span>No Signup Required</span>
                            </div>
                        </div>

                        {fileName && (
                            <p style={{
                                marginTop: 24,
                                color: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                fontWeight: 500
                            }}>
                                <CheckCircle size={20} /> {fileName} uploaded successfully
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Upload;
