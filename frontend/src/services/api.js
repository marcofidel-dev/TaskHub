import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
