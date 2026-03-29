import axios from 'axios';

const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();

const api = axios.create({
  baseURL: isNative 
    ? (process.env.NEXT_PUBLIC_API_URL || 'https://api.hellopayapp.com/api')
    : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : (process.env.NEXT_PUBLIC_API_URL || 'https://api.hellopayapp.com/api')),
});

// Add interceptor for auth token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
