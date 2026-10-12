import axios from 'axios';

const base = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

const api = axios.create({ baseURL: `${base}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLogin = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) =>
  e.response?.data?.message || (e.request ? 'Cannot reach the server. Please try again.' : e.message);

export default api;
