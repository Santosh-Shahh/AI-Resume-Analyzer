import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api';

// SVG icons for social providers
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const GitHubIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const API_URL = '/api/auth';

// Isolated component for Google Login using ID token (credential) flow
// This flow only needs Authorized JavaScript Origins — no redirect URIs required
const GoogleLoginButton = ({ onLogin, setLoading, setError }) => {
    return (
        <GoogleLogin
            onSuccess={async (credentialResponse) => {
                setLoading('google');
                setError('');
                try {
                    await onLogin(credentialResponse.credential);
                } catch (err) {
                    setError(err.message || 'Google sign-in failed.');
                } finally {
                    setLoading('');
                }
            }}
            onError={() => {
                setError('Google sign-in was cancelled or failed.');
                setLoading('');
            }}
            width="100%"
            text="continue_with"
            shape="rectangular"
            theme="outline"
            size="large"
        />
    );
};

const AuthModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState('');
    const { login, register } = useAuth(); // googleLogin removed from here, logic moved to backend call

    // Early return is safe here because AuthModal has no conditional hooks (useState/useAuth are consistent)
    if (!isOpen) return null;

    const onGoogleBackendLogin = async (credential) => {
        try {
            const res = await api.post(`${API_URL}/google`, { credential });
            localStorage.setItem('token', res.data.token);
            window.location.reload();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Google sign-in failed.';
            setError(msg);
            setSocialLoading('');
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'register') {
                if (!name.trim()) {
                    setError('Name is required');
                    setLoading(false);
                    return;
                }
                await register(name, email, password);
            } else {
                await login(email, password);
            }
            onClose();
            setName('');
            setEmail('');
            setPassword('');
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // GitHub/LinkedIn — redirect to backend OAuth
    const handleOAuthRedirect = (provider) => {
        setSocialLoading(provider);
        window.location.href = `${API_URL}/${provider}`;
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError('');
    };

    const socialButtonStyle = {
        width: '100%',
        padding: '12px',
        borderRadius: 10,
        border: '1.5px solid #e2e8f0',
        background: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        fontSize: 14,
        fontWeight: 600,
        color: '#374151',
        transition: 'all 0.2s ease',
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post(`${API_URL}/forgot-password`, { email });
            if (res.data.devLink) {
                alert(`DEV MODE: Password reset link (normally sent via email):\n\n${res.data.devLink}`);
            } else {
                alert('Password reset link sent to your email.');
            }
            setMode('login');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 20,
                    padding: '36px 40px',
                    width: '100%',
                    maxWidth: 420,
                    margin: '0 16px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                    position: 'relative',
                    animation: 'fadeInUp 0.3s ease',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: 4,
                    }}
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        marginBottom: 8,
                    }}>
                        {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: 14 }}>
                        {mode === 'login'
                            ? 'Log in to access your analysis history'
                            : mode === 'register'
                                ? 'Sign up to save your resume analyses'
                                : 'Enter your email to receive a reset link'}
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 14px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: 10,
                        marginBottom: 16,
                        fontSize: 13,
                        color: '#dc2626',
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        {error}
                    </div>
                )}

                {/* Forgot Password View */}
                {mode === 'forgot-password' ? (
                    <form onSubmit={handleForgotPassword}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: 6,
                            }}>
                                Email
                            </label>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '11px 14px',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: 10,
                                background: '#f8fafc',
                            }}>
                                <Mail size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        fontSize: 14,
                                        width: '100%',
                                        color: '#0f172a',
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-mint"
                            style={{
                                width: '100%',
                                padding: '13px',
                                fontSize: 15,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                    Sending Link...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14 }}>
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Back to Login
                            </button>
                        </p>
                    </form>
                ) : (
                    <>
                        {/* Social Login Buttons - only show in login/register */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                                <GoogleLoginButton
                                    onLogin={onGoogleBackendLogin}
                                    setLoading={setSocialLoading}
                                    setError={setError}
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setError('Google Sign-In is not configured (missing VITE_GOOGLE_CLIENT_ID).')}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 10,
                                        border: '1.5px solid #e2e8f0',
                                        background: '#f8fafc',
                                        cursor: 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 10,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: '#94a3b8',
                                    }}
                                >
                                    <GoogleIcon />
                                    Continue with Google (Setup Required)
                                </button>
                            )}

                        </div>

                        {/* Divider */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 20,
                        }}>
                            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                                or
                            </span>
                            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleSubmit}>
                            {mode === 'register' && (
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#374151',
                                        marginBottom: 6,
                                    }}>
                                        Full Name
                                    </label>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '11px 14px',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: 10,
                                        background: '#f8fafc',
                                    }}>
                                        <User size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Santosh Shah"
                                            style={{
                                                border: 'none',
                                                outline: 'none',
                                                background: 'transparent',
                                                fontSize: 14,
                                                width: '100%',
                                                color: '#0f172a',
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: 14 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: 6,
                                }}>
                                    Email
                                </label>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '11px 14px',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: 10,
                                    background: '#f8fafc',
                                }}>
                                    <Mail size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontSize: 14,
                                            width: '100%',
                                            color: '#0f172a',
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: 6,
                                }}>
                                    Password
                                </label>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '11px 14px',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: 10,
                                    background: '#f8fafc',
                                }}>
                                    <Lock size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        required
                                        minLength={6}
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            fontSize: 14,
                                            width: '100%',
                                            color: '#0f172a',
                                        }}
                                    />
                                </div>
                                {mode === 'login' && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                console.log('Forgot password clicked');
                                                setMode('forgot-password');
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#64748b',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                padding: '4px 8px',
                                            }}
                                            onMouseEnter={(e) => e.target.style.color = '#10b981'}
                                            onMouseLeave={(e) => e.target.style.color = '#64748b'}
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-mint"
                                style={{
                                    width: '100%',
                                    padding: '13px',
                                    fontSize: 15,
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                        {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                                    </>
                                ) : (
                                    mode === 'login' ? 'Log In' : 'Create Account'
                                )}
                            </button>
                        </form>

                        {/* Switch mode */}
                        <p style={{
                            textAlign: 'center',
                            marginTop: 18,
                            fontSize: 14,
                            color: '#64748b',
                        }}>
                            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                onClick={switchMode}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#10b981',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontSize: 14,
                                }}
                            >
                                {mode === 'login' ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
