import api from './api.js';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  profile: () => api.get('/auth/profile'),
};

export const productApi = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
};

export const categoryApi = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const subCategoryApi = {
  list: (params) => api.get('/subcategories', { params }),
  create: (data) => api.post('/subcategories', data),
  update: (id, data) => api.put(`/subcategories/${id}`, data),
  remove: (id) => api.delete(`/subcategories/${id}`),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (productId, data) => api.put(`/cart/${productId}`, data),
  remove: (productId) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart'),
};

export const orderApi = {
  place: () => api.post('/orders'),
  myOrders: () => api.get('/orders/my'),
  all: () => api.get('/orders'),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};
