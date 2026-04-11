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
    api.post('/auth/register', { email, username, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const tasks = {
  create: (taskData) => api.post('/tasks/create', taskData),
  list: () => api.get('/tasks'),
  listFull: (filterData = {}) => api.post('/tasks/filter', filterData),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  complete: (id) => api.patch(`/tasks/${id}/complete`),
  filter: (filterData) => api.post('/tasks/filter', filterData),
  addTag: (taskId, tagId) => api.post(`/tasks/${taskId}/tags/${tagId}`),
  removeTag: (taskId, tagId) => api.delete(`/tasks/${taskId}/tags/${tagId}`),
};

export const categories = {
  create: (catData) => api.post('/categories', catData),
  list: () => api.get('/categories'),
  update: (id, catData) => api.put(`/categories/${id}`, catData),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const tags = {
  create: (tagData) => api.post('/tags', tagData),
  list: () => api.get('/tags'),
  delete: (id) => api.delete(`/tags/${id}`),
};

export default api;
