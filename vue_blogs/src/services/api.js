import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    let message = 'An error occurred. Please try again.';
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = 'Unauthorized or invalid token.';
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          message = 'Access forbidden.';
          break;
        case 404:
          message = error.response.data?.message || 'Resource not found.';
          break;
        case 422:
          message = error.response.data?.message || 'Invalid data provided.';
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        default:
          message = error.response.data?.message || message;
      }
      return Promise.reject({
        success: false,
        message,
        errors: error.response.data?.errors || {},
        status: error.response.status,
      });
    }
    return Promise.reject({ success: false, message: error.message || message });
  }
);

export default api;
