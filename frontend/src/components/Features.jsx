import React from 'react';
import { FileText, Layout, Brain, Layers, Palette, Check } from 'lucide-react';

const Features = () => {
    const featureCategories = [
        {
            category: "Content",
            icon: FileText,
            description: "Analyze what you say",
            checks: [
                "ATS parse rate",
                "Word repetition detection",
                "Spelling & grammar",
                "Impact quantification"
            ]
        },
        {
            category: "Format",
            icon: Layout,
            description: "Check how it looks",
            checks: [
                "File format & size",
                "Resume length",
                "Bullet point optimization"
            ]
        },
        {
            category: "Skills",
            icon: Brain,
            description: "Match your expertise",
            checks: [
                "Hard skills detection",
                "Soft skills identification"
            ]
        },
        {
            category: "Sections",
            icon: Layers,
            description: "Verify completeness",
            checks: [
                "Contact information",
                "Essential sections",
                "Personality showcase"
            ]
        },
        {
            category: "Style",
            icon: Palette,
            description: "Polish your tone",
            checks: [
                "Resume design",
                "Professional email",
                "Active voice usage",
                "Buzzword avoidance"
            ]
        }
    ];

    return (
        <div className="section-light section-padding">
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
                {/* Section Header */}
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <div className="badge-mint" style={{ marginBottom: 24 }}>
                        <span>16 AI-POWERED CHECKS</span>
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                        fontWeight: 900,
                        marginBottom: 24,
                        lineHeight: 1.15,
                        letterSpacing: '-0.03em',
                        color: '#0f172a'
                    }}>
                        We Catch What Humans Miss
                    </h2>
                    <p style={{
                        fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                        color: '#64748b',
                        maxWidth: 600,
                        margin: '0 auto',
                        lineHeight: 1.7
                    }}>
                        Our AI analyzes your resume the same way Fortune 500 ATS systems do—then tells you exactly how to fix it.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid-5">
                    {featureCategories.map((category, idx) => (
                        <div key={idx} className="feature-card">
                            {/* Icon */}
                            <div className="feature-icon" style={{ marginBottom: 20 }}>
                                <category.icon size={24} />
                            </div>

                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4, color: '#0f172a' }}>
                                {category.category}
                            </h4>
                            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, marginTop: 0 }}>
                                {category.description}
                            </p>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {category.checks.map((check, checkIdx) => (
                                    <li key={checkIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
                                        <div className="checkmark-icon">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span style={{ color: '#475569' }}>{check}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;
