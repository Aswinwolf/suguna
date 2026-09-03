import axios from 'axios';

// Normalise VITE_API_URL so the baseURL is always "<host>/api".
// Handles three common env-var formats:
//   "https://suguna-1.onrender.com"        → appends /api
//   "https://suguna-1.onrender.com/"       → strips trailing slash, appends /api
//   "https://suguna-1.onrender.com/api"    → already correct, kept as-is
//   "https://suguna-1.onrender.com/api/"   → strips trailing slash, kept as-is
const rawBase = (import.meta.env.VITE_API_URL || 'https://suguna-1.onrender.com')
  .replace(/\/+$/, '');           // strip any trailing slashes
const baseURL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;