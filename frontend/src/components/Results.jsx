import React, { useState } from 'react';
import {
    FileText, CheckCircle, AlertTriangle, Lightbulb, TrendingUp,
    BarChart3, Target, RefreshCw, BookOpen, ChevronDown, ChevronUp,
    Zap, Star, ArrowRight
} from 'lucide-react';

const Results = ({ result }) => {
    if (!result) return null;

    const {
        atsScore, overallAssessment, matchedKeywords, missingKeywords, suggestions,
        breakdown, sectionFeedback, rewrites, jdMatch, extractedData,
        atsCompatibility, quantifiableAchievements, actionVerbs
    } = result;

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreMessage = (score) => {
        if (score >= 80) return 'Excellent! Your resume is highly optimized for ATS.';
        if (score >= 60) return 'Good start, but there\'s room for improvement.';
        return 'Needs work. Follow the suggestions below.';
    };

    const scoreColor = getScoreColor(atsScore);

    // Card style helper
    const cardStyle = {
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    };

    const sectionHeaderStyle = (icon, title, color) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 24,
        }}>
            {icon}
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {title}
            </h3>
        </div>
    );

    return (
        <div>
            {/* Section Header */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h2 style={{
                    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: 12,
                    letterSpacing: '-0.02em'
                }}>
                    Your Analysis Results
                </h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                    Here's how your resume performs against ATS systems
                </p>
            </div>

            {/* Row 1: ATS Score + ATS Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 24 }}>
                {/* ATS Score Card */}
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                    {sectionHeaderStyle(
                        <TrendingUp size={22} style={{ color: scoreColor }} />,
                        'ATS Score'
                    )}
                    <div style={{
                        width: 130,
                        height: 130,
                        borderRadius: '50%',
                        border: `6px solid ${scoreColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        background: `${scoreColor}10`,
                        position: 'relative',
                    }}>
                        <span style={{
                            fontSize: '2.8rem',
                            fontWeight: 800,
                            color: scoreColor
                        }}>
                            {atsScore}%
                        </span>
                    </div>
                    <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                        {getScoreMessage(atsScore)}
                    </p>
                </div>

                {/* ATS Score Breakdown Card */}
                {breakdown && (
                    <div style={cardStyle}>
                        {sectionHeaderStyle(
                            <BarChart3 size={22} style={{ color: '#6366f1' }} />,
                            'Score Breakdown'
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { label: 'Formatting', value: breakdown.formatting, icon: '📐' },
                                { label: 'Keywords', value: breakdown.keywords, icon: '🔑' },
                                { label: 'Projects', value: breakdown.projects, icon: '🚀' },
                                { label: 'Experience', value: breakdown.experience, icon: '💼' },
                                { label: 'Readability', value: breakdown.readability, icon: '📖' },
                                { label: 'Contact Info', value: breakdown.contactInfo || 0, icon: '📧' },
                                { label: 'Education', value: breakdown.education || 0, icon: '🎓' },
                                { label: 'Achievements', value: breakdown.achievements || 0, icon: '🏆' },
                            ].map(({ label, value, icon }) => {
                                const pct = (value / 10) * 100;
                                const barColor = value >= 7 ? '#10b981' : value >= 4 ? '#f59e0b' : '#ef4444';
                                return (
                                    <div key={label}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 6,
                                        }}>
                                            <span style={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: '#334155',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                            }}>
                                                <span>{icon}</span> {label}
                                            </span>
                                            <span style={{
                                                fontSize: 14,
                                                fontWeight: 700,
                                                color: barColor,
                                            }}>
                                                {value}/10
                                            </span>
                                        </div>
                                        <div style={{
                                            height: 8,
                                            background: '#f1f5f9',
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${pct}%`,
                                                background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                                                borderRadius: 4,
                                                transition: 'width 1s ease',
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Row 2: JD Match (if available) */}
            {jdMatch && (
                <div style={{ ...cardStyle, marginBottom: 24, background: 'linear-gradient(135deg, #fafafe, #f0f0ff)' }}>
                    {sectionHeaderStyle(
                        <Target size={22} style={{ color: '#6366f1' }} />,
                        'Job Description Match'
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32 }}>
                        {/* Match percentage circle */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                border: `6px solid ${jdMatch.matchPercentage >= 70 ? '#10b981' : jdMatch.matchPercentage >= 40 ? '#f59e0b' : '#ef4444'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 12px',
                                background: '#fff',
                            }}>
                                <span style={{
                                    fontSize: '2.2rem',
                                    fontWeight: 800,
                                    color: jdMatch.matchPercentage >= 70 ? '#10b981' : jdMatch.matchPercentage >= 40 ? '#f59e0b' : '#ef4444',
                                }}>
                                    {jdMatch.matchPercentage}%
                                </span>
                            </div>
                            <p style={{ fontSize: 13, color: '#64748b', margin: 0, fontWeight: 600 }}>JD Match</p>
                        </div>

                        <div>
                            {/* Missing skills */}
                            {jdMatch.missingSkills && jdMatch.missingSkills.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                        Missing Skills
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {jdMatch.missingSkills.map((skill, i) => (
                                            <span key={i} style={{
                                                padding: '5px 12px',
                                                background: '#fef2f2',
                                                borderRadius: 8,
                                                fontSize: 13,
                                                fontWeight: 500,
                                                color: '#991b1b',
                                                border: '1px solid #fecaca',
                                            }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommended keywords */}
                            {jdMatch.recommendedKeywords && jdMatch.recommendedKeywords.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                        Recommended Keywords
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {jdMatch.recommendedKeywords.map((kw, i) => (
                                            <span key={i} style={{
                                                padding: '5px 12px',
                                                background: '#eef2ff',
                                                borderRadius: 8,
                                                fontSize: 13,
                                                fontWeight: 500,
                                                color: '#3730a3',
                                                border: '1px solid #c7d2fe',
                                            }}>
                                                + {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tips */}
                            {jdMatch.tips && jdMatch.tips.length > 0 && (
                                <div>
                                    {jdMatch.tips.map((tip, i) => (
                                        <p key={i} style={{
                                            fontSize: 14,
                                            color: '#475569',
                                            marginBottom: 4,
                                            marginTop: 0,
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 8,
                                            lineHeight: 1.5,
                                        }}>
                                            <ArrowRight size={14} style={{ color: '#6366f1', flexShrink: 0, marginTop: 3 }} />
                                            {tip}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Row 3: Skills Detected + Suggestions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                {/* Skills Detected Card */}
                <div style={cardStyle}>
                    {sectionHeaderStyle(
                        <CheckCircle size={22} style={{ color: '#10b981' }} />,
                        'Skills Detected'
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {matchedKeywords.map((keyword, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 14px',
                                background: '#ecfdf5',
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#065f46'
                            }}>
                                <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                                {keyword}
                            </div>
                        ))}
                    </div>

                    {missingKeywords && missingKeywords.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <p style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: 10
                            }}>
                                Missing Keywords
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {missingKeywords.map((keyword, index) => (
                                    <span key={index} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '6px 12px',
                                        background: '#fef3c7',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#92400e'
                                    }}>
                                        <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggestions Card */}
                <div style={cardStyle}>
                    {sectionHeaderStyle(
                        <Lightbulb size={22} style={{ color: '#f59e0b' }} />,
                        'Suggestions'
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {suggestions.map((suggestion, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12,
                                padding: '12px 14px',
                                background: '#f8fafc',
                                borderRadius: 10,
                                borderLeft: '3px solid #10b981'
                            }}>
                                <span style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                    marginTop: 1
                                }}>
                                    {index + 1}
                                </span>
                                <p style={{
                                    fontSize: 14,
                                    color: '#475569',
                                    margin: 0,
                                    lineHeight: 1.6
                                }}>
                                    {suggestion}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 4: AI Rewrite Suggestions */}
            {rewrites && rewrites.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: 24 }}>
                    {sectionHeaderStyle(
                        <RefreshCw size={22} style={{ color: '#8b5cf6' }} />,
                        'AI Rewrite Suggestions'
                    )}
                    <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20, marginTop: -12 }}>
                        Weak bullet points detected — here's how to improve them:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {rewrites.map((rw, i) => (
                            <div key={i} style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 12,
                                overflow: 'hidden',
                            }}>
                                {/* Before */}
                                <div style={{
                                    padding: '14px 18px',
                                    background: '#fef2f2',
                                    borderBottom: '1px solid #fecaca',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <span style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: '#991b1b',
                                            background: '#fee2e2',
                                            padding: '2px 8px',
                                            borderRadius: 4,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                        }}>Before</span>
                                        <span style={{ fontSize: 12, color: '#dc2626' }}>{rw.reason}</span>
                                    </div>
                                    <p style={{
                                        fontSize: 14,
                                        color: '#7f1d1d',
                                        margin: 0,
                                        lineHeight: 1.5,
                                        textDecoration: 'line-through',
                                        opacity: 0.8,
                                    }}>
                                        {rw.before}
                                    </p>
                                </div>
                                {/* After */}
                                <div style={{
                                    padding: '14px 18px',
                                    background: '#f0fdf4',
                                }}>
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: '#166534',
                                        background: '#dcfce7',
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: 6,
                                        display: 'inline-block',
                                    }}>After</span>
                                    <p style={{
                                        fontSize: 14,
                                        color: '#14532d',
                                        margin: '6px 0 0',
                                        lineHeight: 1.5,
                                        fontWeight: 500,
                                    }}>
                                        ✨ {rw.after}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Row 5: Resume Section Feedback */}
            {sectionFeedback && sectionFeedback.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: 24 }}>
                    {sectionHeaderStyle(
                        <BookOpen size={22} style={{ color: '#0ea5e9' }} />,
                        'Resume Section Feedback'
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {sectionFeedback.map((section, i) => {
                            const statusColor = section.status === 'strong' ? '#10b981' :
                                section.status === 'moderate' ? '#f59e0b' : '#ef4444';
                            const statusBg = section.status === 'strong' ? '#ecfdf5' :
                                section.status === 'moderate' ? '#fffbeb' : '#fef2f2';
                            const statusIcon = section.status === 'strong' ? '✅' :
                                section.status === 'moderate' ? '⚠️' : '❌';
                            return (
                                <div key={i} style={{
                                    padding: 20,
                                    background: statusBg,
                                    borderRadius: 12,
                                    border: `1px solid ${statusColor}22`,
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 12,
                                    }}>
                                        <span style={{
                                            fontSize: 15,
                                            fontWeight: 700,
                                            color: '#0f172a',
                                        }}>
                                            {statusIcon} {section.name}
                                        </span>
                                        <span style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: statusColor,
                                        }}>
                                            {section.score}/{section.maxScore}
                                        </span>
                                    </div>
                                    {/* Score bar */}
                                    <div style={{
                                        height: 6,
                                        background: '#e2e8f0',
                                        borderRadius: 3,
                                        marginBottom: 12,
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(section.score / section.maxScore) * 100}%`,
                                            background: statusColor,
                                            borderRadius: 3,
                                            transition: 'width 0.8s ease',
                                        }} />
                                    </div>
                                    {/* Tips */}
                                    {section.tips && section.tips.length > 0 && (
                                        <div>
                                            {section.tips.map((tip, j) => (
                                                <p key={j} style={{
                                                    fontSize: 13,
                                                    color: '#475569',
                                                    margin: '0 0 4px',
                                                    lineHeight: 1.5,
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 6,
                                                }}>
                                                    <Zap size={12} style={{ color: statusColor, flexShrink: 0, marginTop: 3 }} />
                                                    {tip}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Overall Assessment */}
            {overallAssessment && (
                <div style={{ ...cardStyle, marginBottom: 24, background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
                    {sectionHeaderStyle(
                        <Star size={22} style={{ color: '#0ea5e9' }} />,
                        'Overall Assessment'
                    )}
                    <p style={{ fontSize: 15, color: '#0c4a6e', lineHeight: 1.7, margin: 0 }}>
                        {overallAssessment}
                    </p>
                </div>
            )}

            {/* ATS Compatibility */}
            {atsCompatibility && atsCompatibility.score !== undefined && (
                <div style={{ ...cardStyle, marginBottom: 24 }}>
                    {sectionHeaderStyle(
                        <Target size={22} style={{ color: '#8b5cf6' }} />,
                        'ATS Compatibility Analysis'
                    )}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>ATS Compatibility Score</span>
                            <span style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: atsCompatibility.score >= 7 ? '#10b981' : atsCompatibility.score >= 4 ? '#f59e0b' : '#ef4444'
                            }}>
                                {atsCompatibility.score}/10
                            </span>
                        </div>
                        <div style={{
                            height: 8,
                            background: '#f1f5f9',
                            borderRadius: 4,
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${(atsCompatibility.score / 10) * 100}%`,
                                background: atsCompatibility.score >= 7 ? '#10b981' : atsCompatibility.score >= 4 ? '#f59e0b' : '#ef4444',
                                borderRadius: 4,
                            }} />
                        </div>
                    </div>
                    
                    {atsCompatibility.issues && atsCompatibility.issues.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                Issues Found
                            </p>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {atsCompatibility.issues.map((issue, i) => (
                                    <li key={i} style={{ fontSize: 14, color: '#475569', marginBottom: 6, lineHeight: 1.5 }}>
                                        {issue}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {atsCompatibility.recommendations && atsCompatibility.recommendations.length > 0 && (
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                Recommendations
                            </p>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {atsCompatibility.recommendations.map((rec, i) => (
                                    <li key={i} style={{ fontSize: 14, color: '#475569', marginBottom: 6, lineHeight: 1.5 }}>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Quantifiable Achievements */}
            {quantifiableAchievements && quantifiableAchievements.count !== undefined && (
                <div style={{ ...cardStyle, marginBottom: 24 }}>
                    {sectionHeaderStyle(
                        <TrendingUp size={22} style={{ color: '#10b981' }} />,
                        'Quantifiable Achievements'
                    )}
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Achievements Found</span>
                            <span style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: quantifiableAchievements.count >= 5 ? '#10b981' : quantifiableAchievements.count >= 2 ? '#f59e0b' : '#ef4444'
                            }}>
                                {quantifiableAchievements.count}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Score</span>
                            <span style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: quantifiableAchievements.score >= 7 ? '#10b981' : quantifiableAchievements.score >= 4 ? '#f59e0b' : '#ef4444'
                            }}>
                                {quantifiableAchievements.score}/10
                            </span>
                        </div>
                    </div>
                    
                    {quantifiableAchievements.examples && quantifiableAchievements.examples.length > 0 && (
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                Examples Found
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {quantifiableAchievements.examples.map((example, i) => (
                                    <div key={i} style={{
                                        padding: '10px 14px',
                                        background: '#f0fdf4',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        color: '#166534',
                                        borderLeft: '3px solid #10b981'
                                    }}>
                                        ✓ {example}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Action Verbs */}
            {actionVerbs && actionVerbs.count !== undefined && (
                <div style={{ ...cardStyle, marginBottom: 24 }}>
                    {sectionHeaderStyle(
                        <Zap size={22} style={{ color: '#f59e0b' }} />,
                        'Action Verbs Analysis'
                    )}
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Strong Action Verbs Found</span>
                            <span style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: actionVerbs.count >= 10 ? '#10b981' : actionVerbs.count >= 5 ? '#f59e0b' : '#ef4444'
                            }}>
                                {actionVerbs.count}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Score</span>
                            <span style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: actionVerbs.score >= 7 ? '#10b981' : actionVerbs.score >= 4 ? '#f59e0b' : '#ef4444'
                            }}>
                                {actionVerbs.score}/10
                            </span>
                        </div>
                    </div>
                    
                    {actionVerbs.examples && actionVerbs.examples.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                Action Verbs Used
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {actionVerbs.examples.map((verb, i) => (
                                    <span key={i} style={{
                                        padding: '6px 12px',
                                        background: '#fef3c7',
                                        borderRadius: 6,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#92400e'
                                    }}>
                                        {verb}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {actionVerbs.recommendations && actionVerbs.recommendations.length > 0 && (
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                Recommendations
                            </p>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {actionVerbs.recommendations.map((rec, i) => (
                                    <li key={i} style={{ fontSize: 14, color: '#475569', marginBottom: 6, lineHeight: 1.5 }}>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Extracted Data */}
            {extractedData && Object.keys(extractedData).length > 0 && (
                <div style={{ ...cardStyle, marginBottom: 24 }}>
                    {sectionHeaderStyle(
                        <FileText size={22} style={{ color: '#6366f1' }} />,
                        'Extracted Resume Information'
                    )}
                    
                    {extractedData.contactInfo && Object.keys(extractedData.contactInfo).length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 12 }}>Contact Information</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                {extractedData.contactInfo.email && (
                                    <span style={{
                                        padding: '8px 14px',
                                        background: '#ecfdf5',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#065f46'
                                    }}>
                                        📧 {extractedData.contactInfo.email}
                                    </span>
                                )}
                                {extractedData.contactInfo.phone && (
                                    <span style={{
                                        padding: '8px 14px',
                                        background: '#ecfdf5',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#065f46'
                                    }}>
                                        📱 {extractedData.contactInfo.phone}
                                    </span>
                                )}
                                {extractedData.contactInfo.linkedin && (
                                    <span style={{
                                        padding: '8px 14px',
                                        background: '#e0f2fe',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#0c4a6e'
                                    }}>
                                        💼 {extractedData.contactInfo.linkedin}
                                    </span>
                                )}
                                {extractedData.contactInfo.github && (
                                    <span style={{
                                        padding: '8px 14px',
                                        background: '#f3f4f6',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#374151'
                                    }}>
                                        💻 {extractedData.contactInfo.github}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {extractedData.targetRole && (
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Target Role</p>
                            <p style={{ fontSize: 15, color: '#475569', margin: 0 }}>{extractedData.targetRole}</p>
                        </div>
                    )}

                    {extractedData.skills && (
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 12 }}>Skills Detected</p>
                            {extractedData.skills.technical && extractedData.skills.technical.length > 0 && (
                                <div style={{ marginBottom: 12 }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Technical Skills</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {extractedData.skills.technical.map((skill, i) => (
                                            <span key={i} style={{
                                                padding: '5px 10px',
                                                background: '#eef2ff',
                                                borderRadius: 6,
                                                fontSize: 12,
                                                color: '#3730a3'
                                            }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {extractedData.skills.soft && extractedData.skills.soft.length > 0 && (
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Soft Skills</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {extractedData.skills.soft.map((skill, i) => (
                                            <span key={i} style={{
                                                padding: '5px 10px',
                                                background: '#fef3c7',
                                                borderRadius: 6,
                                                fontSize: 12,
                                                color: '#92400e'
                                            }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Results;
