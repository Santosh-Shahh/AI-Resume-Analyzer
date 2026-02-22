import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, FileText, TrendingUp, Clock, BarChart3,
    ArrowUpRight, ArrowDownRight, Calendar, Award
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const { user, token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchDashboard();
        else setLoading(false);
    }, [token]);

    if (!user) {
        return (
            <div style={{
                maxWidth: 600,
                margin: '80px auto',
                textAlign: 'center',
                padding: 40,
            }}>
                <LayoutDashboard size={48} style={{ color: '#94a3b8', marginBottom: 16 }} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
                    Dashboard
                </h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: 24 }}>
                    Log in to see your resume analysis history, score trends, and improvements.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <div style={{
                    width: 48,
                    height: 48,
                    border: '4px solid #d1fae5',
                    borderTopColor: '#10b981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#ef4444', fontSize: '1.1rem' }}>{error}</p>
            </div>
        );
    }

    const stats = data?.stats || {};
    const resumes = data?.resumes || [];

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleResumeClick = (resume) => {
        if (!resume.analysis) return;
        const a = resume.analysis;
        const analysisResult = {
            atsScore: a.score || 0,
            overallAssessment: a.scoreRationale || '',
            matchedKeywords: a.keywordsMatched || [],
            missingKeywords: a.keywordsMissing || [],
            suggestions: a.suggestions || [],
            breakdown: a.breakdown || {},
            sectionFeedback: a.sectionFeedback || [],
            rewrites: a.rewrites || [],
            jdMatch: a.jdMatch || null,
            atsCompatibility: a.atsCompatibility || null,
            quantifiableAchievements: a.quantifiableAchievements || null,
            actionVerbs: a.actionVerbs || null,
        };
        navigate('/', { state: { analysisResult } });
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
            {/* Header */}
            <div style={{ marginBottom: 40 }}>
                <h2 style={{
                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: 8,
                }}>
                    Welcome back, {user.name?.split(' ')[0]} 👋
                </h2>
                <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
                    Track your resume score over time
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 20,
                marginBottom: 40,
            }}>
                {/* Total Resumes */}
                <div style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                            Uploaded
                        </span>
                        <FileText size={20} style={{ color: '#6366f1' }} />
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {stats.totalResumes || 0}
                    </p>
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>resumes</p>
                </div>

                {/* Avg Score */}
                <div style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                            Avg Score
                        </span>
                        <Award size={20} style={{ color: '#10b981' }} />
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(stats.avgScore), margin: 0 }}>
                        {stats.avgScore || 0}%
                    </p>
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>ATS score</p>
                </div>

                {/* Improvement */}
                <div style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                            Improvement
                        </span>
                        <TrendingUp size={20} style={{ color: stats.improvement >= 0 ? '#10b981' : '#ef4444' }} />
                    </div>
                    <p style={{
                        fontSize: '2rem', fontWeight: 800, margin: 0,
                        color: stats.improvement >= 0 ? '#10b981' : '#ef4444',
                        display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                        {stats.improvement >= 0 ? (
                            <ArrowUpRight size={22} />
                        ) : (
                            <ArrowDownRight size={22} />
                        )}
                        {Math.abs(stats.improvement || 0)}
                    </p>
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>points since first</p>
                </div>

                {/* Last Analyzed */}
                <div style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                            Last Analyzed
                        </span>
                        <Calendar size={20} style={{ color: '#f59e0b' }} />
                    </div>
                    <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {stats.lastAnalyzed ? formatDate(stats.lastAnalyzed) : 'Never'}
                    </p>
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>date</p>
                </div>
            </div>

            {/* Resume History */}
            <div style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }}>
                    <Clock size={20} style={{ color: '#6366f1' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Resume History
                    </h3>
                </div>

                {resumes.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center' }}>
                        <FileText size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
                        <p style={{ color: '#94a3b8', fontSize: 15 }}>
                            No resumes uploaded yet. Upload your first resume to get started!
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                                    Resume
                                </th>
                                <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                                    Score
                                </th>
                                <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                                    Breakdown
                                </th>
                                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {resumes.map((resume, i) => (
                                <tr key={resume.id} style={{
                                    borderTop: '1px solid #f1f5f9',
                                    transition: 'background 0.2s',
                                    cursor: resume.analysis ? 'pointer' : 'default',
                                }}
                                    onClick={() => handleResumeClick(resume)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 8,
                                                background: '#eef2ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <FileText size={18} style={{ color: '#6366f1' }} />
                                            </div>
                                            <span style={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: '#0f172a',
                                                maxWidth: 250,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {resume.fileName}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <span style={{
                                            fontSize: 16,
                                            fontWeight: 800,
                                            color: getScoreColor(resume.score),
                                            padding: '4px 14px',
                                            background: `${getScoreColor(resume.score)}15`,
                                            borderRadius: 8,
                                        }}>
                                            {resume.score}%
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        {resume.breakdown ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                                                {['formatting', 'keywords', 'experience', 'projects', 'achievements', 'education', 'contactInfo', 'readability'].map(key => (
                                                    <div key={key} style={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: 6,
                                                        background: (resume.breakdown[key] || 0) >= 7 ? '#ecfdf5' :
                                                            (resume.breakdown[key] || 0) >= 4 ? '#fffbeb' : '#fef2f2',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        color: (resume.breakdown[key] || 0) >= 7 ? '#059669' :
                                                            (resume.breakdown[key] || 0) >= 4 ? '#d97706' : '#dc2626',
                                                    }} title={key}>
                                                        {resume.breakdown[key] || 0}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={{ color: '#cbd5e1', fontSize: 13 }}>—</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: 13, color: '#94a3b8' }}>
                                        {formatDate(resume.uploadDate)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
