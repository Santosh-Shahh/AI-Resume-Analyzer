import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = '/api/auth';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Helper: set auth state from token
    const setAuthFromToken = async (newToken) => {
        try {
            const res = await axios.get(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${newToken}` }
            });
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(res.data.user);
            return res.data.user;
        } catch {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            return null;
        }
    };

    // On mount: restore session + handle OAuth callback tokens in URL
    useEffect(() => {
        const initAuth = async () => {
            // Check for OAuth callback token in URL (from GitHub/LinkedIn redirect)
            const params = new URLSearchParams(window.location.search);
            const authToken = params.get('auth_token');
            const authError = params.get('auth_error');

            if (authToken) {
                // Clean URL
                window.history.replaceState({}, '', window.location.pathname);
                await setAuthFromToken(authToken);
                setLoading(false);
                return;
            }

            if (authError) {
                window.history.replaceState({}, '', window.location.pathname);
                console.error('OAuth error:', authError);
            }

            // Restore from localStorage
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                await setAuthFromToken(storedToken);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/login`, { email, password });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (name, email, password) => {
        const res = await axios.post(`${API_URL}/register`, { name, email, password });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    // Google social login — sends credential to backend for verification
    const googleLogin = async (credential) => {
        const res = await axios.post(`${API_URL}/google`, { credential });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
