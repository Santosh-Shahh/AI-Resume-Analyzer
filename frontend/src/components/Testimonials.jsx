import React from 'react';
import { Star, CheckCircle, Shield } from 'lucide-react';

const Testimonials = () => {


    const testimonials = [
        {
            quote: "I was sending out resumes for months with no response. After using this tool, I got 4 interview calls in the first week!",
            name: "Sarah M.",
            role: "Marketing Manager",
            initials: "SM"
        },
        {
            quote: "The ATS score feature was a game-changer. I had no idea my resume was getting filtered out by automated systems.",
            name: "David L.",
            role: "Software Developer",
            initials: "DL"
        },
        {
            quote: "Simple, fast, and incredibly useful. The keyword suggestions helped me tailor my resume perfectly for the job I wanted.",
            name: "Emily R.",
            role: "UX Designer",
            initials: "ER"
        }
    ];

    return (
        <div className="section-dark section-padding">
            <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1, padding: '0 24px' }}>
                {/* Testimonials Header */}
                <h3 style={{
                    fontSize: 'clamp(1.6rem, 3vw, 2.5rem)',
                    fontWeight: 900,
                    textAlign: 'center',
                    marginBottom: 48,
                    marginTop: 48,
                    color: '#fff',
                    letterSpacing: '-0.03em'
                }}>
                    What Job Seekers Say
                </h3>

                {/* Testimonial Cards */}
                <div className="grid-3" style={{ marginBottom: 64 }}>
                    {testimonials.map((testimonial, idx) => (
                        <div key={idx} className="card-glass" style={{ padding: 32 }}>
                            {/* Stars */}
                            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="star-filled" size={16} />
                                ))}
                            </div>

                            <p style={{ color: '#cbd5e1', marginBottom: 24, lineHeight: 1.7, fontStyle: 'italic' }}>
                                "{testimonial.quote}"
                            </p>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                paddingTop: 16,
                                borderTop: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#34d399',
                                    fontWeight: 700,
                                    fontSize: 14
                                }}>
                                    {testimonial.initials}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{testimonial.name}</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ATS Compatibility Badge */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 32
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#94a3b8' }}>
                        <CheckCircle style={{ color: '#10b981' }} size={18} />
                        <span>Compatible with <strong style={{ color: '#fff' }}>95+ ATS Systems</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#94a3b8' }}>
                        <Shield style={{ color: '#10b981' }} size={18} />
                        <span><strong style={{ color: '#fff' }}>GDPR Compliant</strong> • Data never shared</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Testimonials;
