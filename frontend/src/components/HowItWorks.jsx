import React from 'react';
import { Upload, Sparkles, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            number: "1",
            icon: Upload,
            title: "Upload Your Resume",
            description: "Drag, drop, done. No signup required. We accept PDF and DOCX formats.",
            time: "5 seconds"
        },
        {
            number: "2",
            icon: Sparkles,
            title: "AI Scans Like ATS Does",
            description: "We check 16 factors that hiring managers and ATS software actually care about.",
            time: "~10 seconds"
        },
        {
            number: "3",
            icon: CheckCircle2,
            title: "Get Instant Fixes",
            description: "See your score, missing keywords, and specific improvements to land interviews.",
            time: "Instant results"
        }
    ];

    return (
        <div className="section-dark section-padding">
            <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1, padding: '0 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <div className="badge-mint" style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        marginBottom: 24
                    }}>
                        <span>SIMPLE 3-STEP PROCESS</span>
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                        fontWeight: 900,
                        marginBottom: 24,
                        color: '#fff',
                        lineHeight: 1.15,
                        letterSpacing: '-0.03em'
                    }}>
                        Three Steps to a Better Resume
                    </h2>
                    <p style={{
                        fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                        color: '#94a3b8',
                        maxWidth: 600,
                        margin: '0 auto',
                        lineHeight: 1.7
                    }}>
                        From upload to actionable feedback in under a minutes.
                    </p>
                </div>

                <div className="grid-3">
                    {steps.map((step, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                            {/* Step Card */}
                            <div className="card-glass" style={{ padding: 32, height: '100%' }}>
                                {/* Step Number */}
                                <div className="step-number" style={{ marginBottom: 24 }}>
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div className="feature-icon-dark" style={{ marginBottom: 24 }}>
                                    <step.icon size={26} />
                                </div>

                                {/* Content */}
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12, color: '#fff' }}>
                                    {step.title}
                                </h3>
                                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 24 }}>
                                    {step.description}
                                </p>

                                {/* Time Indicator */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: 14,
                                    color: '#34d399',
                                    fontWeight: 500,
                                    paddingTop: 16,
                                    borderTop: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <Clock size={14} />
                                    <span>{step.time}</span>
                                </div>
                            </div>

                            {/* Arrow Connector */}
                            {idx < steps.length - 1 && (
                                <div style={{
                                    position: 'absolute',
                                    right: -16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 10,
                                    color: 'rgba(16, 185, 129, 0.4)',
                                    display: 'none'
                                }}
                                    className="arrow-connector"
                                >
                                    <ArrowRight size={24} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
