import axios from 'axios';

// DEV: .env.development → http://localhost:8081/api
// PROD: .env.production → /api (relativo, nginx redirige)
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

// Single-flight refresh: concurrent 401s share one /auth/refresh call.
// The backend rotates refresh tokens (the old one is blacklisted), so BOTH
// tokens must be stored from the response. Uses bare axios to bypass the
// interceptors below and avoid refresh loops.
let refreshPromise = null;
function refreshTokens() {
  if (!refreshPromise) {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) return Promise.reject(new Error('No refresh token'));
    refreshPromise = axios
      .post(`${API_BASE}/v1/auth/refresh`, { refreshToken: rt })
      .then((res) => {
        const { accessToken, refreshToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Response interceptor: on 401 try one silent refresh, then retry the request.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.includes('/v1/auth/');

    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        const accessToken = await refreshTokens();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        clearSession();
        if (window.location.pathname !== '/login') window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (email, username, password) =>
    api.post('/v1/auth/register', { email, username, password }),
  login: (email, password) =>
    api.post('/v1/auth/login', { email, password }),
  refresh: (refreshToken) =>
    api.post('/v1/auth/refresh', { refreshToken }),
};

export const tasks = {
  create: (taskData) => api.post('/v1/tasks/create', taskData),
  list: () => api.get('/v1/tasks'),
  listFull: (filterData = {}) => api.post('/v1/tasks/filter', filterData),
  getById: (id) => api.get(`/v1/tasks/${id}`),
  update: (id, taskData) => api.put(`/v1/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/v1/tasks/${id}`),
  complete: (id) => api.patch(`/v1/tasks/${id}/complete`),
  filter: (filterData) => api.post('/v1/tasks/filter', filterData),
  addTag: (taskId, tagId) => api.post(`/v1/tasks/${taskId}/tags/${tagId}`),
  removeTag: (taskId, tagId) => api.delete(`/v1/tasks/${taskId}/tags/${tagId}`),
};

export const categories = {
  create: (catData) => api.post('/v1/categories', catData),
  list: () => api.get('/v1/categories'),
  update: (id, catData) => api.put(`/v1/categories/${id}`, catData),
  delete: (id) => api.delete(`/v1/categories/${id}`),
};

export const tags = {
  create: (tagData) => api.post('/v1/tags', tagData),
  list: () => api.get('/v1/tags'),
  delete: (id) => api.delete(`/v1/tags/${id}`),
};

export default api;
