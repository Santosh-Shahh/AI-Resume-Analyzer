import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/auth';

const ResetPassword = () => {
    const { resetToken } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/reset-password/${resetToken}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to reset password');

            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                padding: 20
            }}>
                <div style={{
                    background: '#fff',
                    borderRadius: 20,
                    padding: 40,
                    maxWidth: 400,
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                    <div style={{
                        width: 60,
                        height: 60,
                        background: '#dcfce7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        color: '#16a34a'
                    }}>
                        <CheckCircle size={32} />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                        Password Reset!
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: 20 }}>
                        Your password has been successfully updated. Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            padding: 20
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 20,
                padding: '40px',
                width: '100%',
                maxWidth: 420,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                        Reset Password
                    </h2>
                    <p style={{ color: '#64748b', fontSize: 14 }}>
                        Enter your new password below
                    </p>
                </div>

                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 16px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: 10,
                        marginBottom: 20,
                        fontSize: 14,
                        color: '#dc2626',
                    }}>
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            New Password
                        </label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '12px 16px',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: 10,
                            background: '#f8fafc',
                            transition: 'all 0.2s'
                        }}>
                            <Lock size={18} style={{ color: '#94a3b8' }} />
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
                                    width: '100%',
                                    fontSize: 15,
                                    color: '#0f172a'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 30 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            Confirm Password
                        </label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '12px 16px',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: 10,
                            background: '#f8fafc',
                            transition: 'all 0.2s'
                        }}>
                            <Lock size={18} style={{ color: '#94a3b8' }} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                required
                                minLength={6}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    width: '100%',
                                    fontSize: 15,
                                    color: '#0f172a'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            opacity: loading ? 0.8 : 1,
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.1)'
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                Updating...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
