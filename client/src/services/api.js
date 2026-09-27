import axios from 'axios';

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '')
    : '';

  const isBrowser = typeof window !== 'undefined';
  const isLocalHost =
    isBrowser &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '');

  // In production browser environments (e.g. on Vercel)
  if (isBrowser && !isLocalHost) {
    // If an explicit non-localhost URL is provided, use it
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    }
    // Otherwise automatically route to the deployed Render production backend
    return 'https://campus-connect-project-uwdc.onrender.com/api';
  }

  // In local development
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const reqUrl = error.config?.url || '';
      // Don't auto-redirect if 401 was returned by an explicit login or register action
      const isAuthAction = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register');

      if (
        !isAuthAction &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        localStorage.removeItem('campusconnect_token');
        localStorage.removeItem('campusconnect_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
