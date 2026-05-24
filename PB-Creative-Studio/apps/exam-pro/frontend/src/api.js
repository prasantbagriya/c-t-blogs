import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const adminToken = localStorage.getItem('admin_token');
  const studentToken = localStorage.getItem('student_token');
  const token = adminToken || studentToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('student_token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
