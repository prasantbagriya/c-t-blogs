import axios from 'axios';

// FIX: Token security helpers
// Validates that a stored token looks like a real JWT (3 base64 parts)
const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(p => p.length > 0);
};

// FIX: Check token age — automatically expire tokens older than 8 hours
// This prevents stale tokens from persisting indefinitely in localStorage
const isTokenExpired = (key) => {
  const timestamp = localStorage.getItem(`${key}_time`);
  if (!timestamp) return false; // No timestamp = old token, don't expire
  const age = Date.now() - parseInt(timestamp, 10);
  return age > 8 * 60 * 60 * 1000; // 8 hours
};

// Clear expired tokens on app start
['admin_token', 'student_token'].forEach(key => {
  if (isTokenExpired(key)) {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_time`);
  }
});

const api = axios.create({
  baseURL: '/api',
  // FIX: Added timeout — prevents requests from hanging indefinitely
  timeout: 15000, // 15 seconds
});

api.interceptors.request.use(config => {
  const adminToken = localStorage.getItem('admin_token');
  const studentToken = localStorage.getItem('student_token');
  // FIX: Validate JWT format before using to prevent XSS token injection
  const token = isValidJWT(adminToken) ? adminToken : (isValidJWT(studentToken) ? studentToken : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      // FIX: Smarter redirect — go to the correct login page based on which token existed
      const wasAdmin = !!localStorage.getItem('admin_token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_token_time');
      localStorage.removeItem('student_token');
      localStorage.removeItem('student_token_time');
      // Redirect to appropriate login
      window.location.href = wasAdmin ? '/admin/login' : '/student/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// FIX: Export helper to save tokens with timestamp for expiry tracking
export const saveToken = (key, value) => {
  if (!isValidJWT(value)) {
    console.warn('[api] Refusing to save invalid token');
    return;
  }
  localStorage.setItem(key, value);
  localStorage.setItem(`${key}_time`, Date.now().toString());
};

export const clearTokens = () => {
  ['admin_token', 'student_token'].forEach(key => {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_time`);
  });
};

