import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sparkles, FileText, Shield, TrendingUp, ArrowRight, LogOut } from 'lucide-react';
import Logo from './components/Logo';
import Upload from './components/Upload';
import Results from './components/Results';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import AuthModal from './components/AuthModal';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function AppContent() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const location = useLocation();

  // Pick up analysis from Dashboard navigation
  React.useEffect(() => {
    if (location.state?.analysisResult) {
      setAnalysisResult(location.state.analysisResult);
      // Clear the state so refreshing doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout, loading } = useAuth();

  // Helper to handle navigation without full reload
  const navigate = (path) => {
    window.location.href = path;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Navbar */}
      <nav style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1f5f9',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1
            onClick={() => navigate('/')}
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#0f172a',
              margin: 0,
              cursor: 'pointer'
            }}>
            <Logo size={32} />
            AI Resume Analyzer
          </h1>

          {!loading && (
            user ? (
              /* Logged-in state */
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {/* Dashboard Link */}
                <a href="/dashboard" style={{
                  textDecoration: 'none',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <TrendingUp size={16} />
                  Dashboard
                </a>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                  }}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.name}
                  </span>
                  <button
                    onClick={logout}
                    style={{
                      background: 'none',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      color: '#64748b',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#ef4444';
                      e.target.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.color = '#64748b';
                    }}
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              /* Logged-out state */
              <button
                className="btn-outline"
                onClick={() => setShowAuthModal(true)}
              >
                Login
              </button>
            )
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          <>
            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            {/* Hero Section */}
            <section className="section-light section-padding" style={{ paddingBottom: 32 }}>
              <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                <div className="badge-mint" style={{ marginBottom: 32 }}>
                  <span>AI-Powered Resume Intelligence</span>
                </div>

                <h2 style={{
                  fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
                  fontWeight: 900,
                  marginBottom: 24,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  color: '#0f172a'
                }}>
                  Beat the ATS.
                  <br />
                  <span className="text-mint">Land More Interviews.</span>
                </h2>

                <p style={{
                  fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
                  color: '#64748b',
                  maxWidth: 700,
                  margin: '0 auto 40px',
                  lineHeight: 1.7
                }}>
                  AI-powered analysis catches what you miss. Get your ATS score,
                  missing keywords, and actionable fixes—instantly.
                </p>

                {/* Stats Row */}
                <div className="grid-hero-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, maxWidth: 600, margin: '0 auto' }}>
                  <div className="animate-count">
                    <div className="stat-label" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>AI-Powered ATS Analysis</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Scans for keywords & formatting</div>
                  </div>
                  <div className="animate-count" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-label" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Based on Industry Rules</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Optimized for modern hiring</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Upload Section */}
            <section className="section-subtle section-padding" style={{ paddingTop: 48, paddingBottom: 64 }}>
              <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <Upload setAnalysisResult={setAnalysisResult} />
              </div>
            </section>

            {/* Results Section */}
            {analysisResult && (
              <section className="section-light section-padding">
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                  <Results result={analysisResult} />
                </div>
              </section>
            )}

            {/* Features Section */}
            <Features />

            {/* How It Works Section */}
            <HowItWorks />

            {/* Testimonials & Social Proof */}
            <Testimonials />

            {/* CTA Section */}
            <section className="section-light section-padding">
              <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                <div className="badge-mint" style={{ marginBottom: 24 }}>
                  <span>FREE • NO SIGNUP • 5 SECONDS</span>
                </div>

                <h2 style={{
                  fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                  fontWeight: 900,
                  marginBottom: 24,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  color: '#0f172a'
                }}>
                  Stop Guessing.
                  <br />
                  Start <span className="text-mint">Landing Interviews.</span>
                </h2>

                <p style={{
                  fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                  color: '#64748b',
                  marginBottom: 40,
                  maxWidth: 600,
                  margin: '0 auto 40px',
                  lineHeight: 1.7
                }}>
                  Upgrade your resume with advanced AI technology.
                  See your ATS score and get instant fixes—completely free.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                  <button
                    className="btn-mint btn-mint-lg"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                  >
                    <FileText size={22} />
                    Analyze My Resume Now
                    <ArrowRight size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, color: '#94a3b8' }}>
                  <Shield size={16} />
                  <span>No credit card required • 100% private</span>
                </div>

                {/* Micro-testimonial */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  background: '#fff',
                  padding: '16px 24px',
                  borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  marginTop: 40,
                  textAlign: 'left',
                  maxWidth: 420,
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    background: '#ecfdf5',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                    fontWeight: 700,
                    fontSize: 14,
                    flexShrink: 0
                  }}>
                    JK
                  </div>
                  <div>
                    <p style={{ fontSize: 14, color: '#475569', marginBottom: 4, marginTop: 0 }}>
                      "Got 3 interview calls in 2 weeks after fixing my resume with this tool!"
                    </p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Jake K., Software Engineer</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        } />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
      </Routes>

      {/* Footer */}
      <footer className="section-dark" style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Logo size={32} />
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>AI Resume Analyzer</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 14, color: '#94a3b8' }}>
              <span>Built & Designed by Santosh Shah</span>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid #1e293b',
            marginTop: 32,
            paddingTop: 32,
            textAlign: 'center',
            fontSize: 14,
            color: '#475569'
          }}>
            © 2026 AI Resume Analyzer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
