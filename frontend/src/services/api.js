import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fc_token');
      localStorage.removeItem('fc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// ─── Clients ─────────────────────────────────────────────────────────────────
export const clientsAPI = {
  list: (params) => api.get('/clients', { params }),
  get: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// ─── Portfolios ──────────────────────────────────────────────────────────────
export const portfoliosAPI = {
  list: (params) => api.get('/portfolios', { params }),
  get: (id) => api.get(`/portfolios/${id}`),
  create: (data) => api.post('/portfolios', data),
};

// ─── Documents ───────────────────────────────────────────────────────────────
export const documentsAPI = {
  list: (params) => api.get('/documents', { params }),
  upload: (formData) => api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  query: (data) => api.post('/documents/query', data),
  delete: (id) => api.delete(`/documents/${id}`),
};

// ─── Plans ───────────────────────────────────────────────────────────────────
export const plansAPI = {
  list: (params) => api.get('/plans', { params }),
  get: (id) => api.get(`/plans/${id}`),
  update: (id, data) => api.put(`/plans/${id}`, data),
};

// ─── Tax ─────────────────────────────────────────────────────────────────────
export const taxAPI = {
  opportunities: (clientId) => api.get(`/tax/opportunities/${clientId}`),
  summary: (params) => api.get('/tax/summary', { params }),
};

// ─── AI ──────────────────────────────────────────────────────────────────────
export const aiAPI = {
  recommendations: (clientId) => api.get(`/ai/recommendations/${clientId}`),
  generatePlan: (data) => api.post('/ai/plan', data),
  generateReport: (data) => api.post('/ai/report', data),
  simulate: (clientId) => api.get(`/ai/simulate/${clientId}`),
};

// ─── Compliance ──────────────────────────────────────────────────────────────
export const complianceAPI = {
  logs: (params) => api.get('/compliance/logs', { params }),
  resolve: (id) => api.patch(`/compliance/logs/${id}/resolve`),
  create: (data) => api.post('/compliance/logs', data),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsAPI = {
  summary: () => api.get('/analytics/summary'),
  riskModel: () => api.get('/analytics/risk-model'),
  simulate: (clientId) => api.get(`/analytics/simulate/${clientId}`),
};

export default api;
