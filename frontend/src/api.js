import axios from 'axios';

// In production (Vercel), use the full backend URL from env var.
// In development, the Vite proxy handles /api/* → localhost:5001,
// so an empty baseURL works fine (relative paths used).
const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_BASE,
});

export default api;
