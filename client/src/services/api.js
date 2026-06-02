import axios from 'axios';

// Get backend API URL (resolves dynamically: points to port 5000 in local dev, and uses relative path /api in production)
const API_URL = import.meta.env.VITE_API_URL || (
  window.location.port === '5173'
    ? `http://${window.location.hostname || 'localhost'}:5000/api`
    : '/api'
);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
