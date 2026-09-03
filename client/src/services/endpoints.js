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

// ─── Service booking module ──────────────────────────────────────────────────

export const addressApi = {
  list: () => api.get('/addresses'),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  remove: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.patch(`/addresses/${id}/default`),
};

export const serviceCategoryApi = {
  list: (params) => api.get('/service-categories', { params }),
  get: (id) => api.get(`/service-categories/${id}`),
  create: (data) => api.post('/service-categories', data),
  update: (id, data) => api.put(`/service-categories/${id}`, data),
  toggle: (id) => api.patch(`/service-categories/${id}/toggle`),
  remove: (id) => api.delete(`/service-categories/${id}`),
};

export const repairServiceApi = {
  list: (params) => api.get('/repair-services', { params }),
  create: (data) => api.post('/repair-services', data),
  update: (id, data) => api.put(`/repair-services/${id}`, data),
  remove: (id) => api.delete(`/repair-services/${id}`),
};

export const sparePartApi = {
  list: (params) => api.get('/spare-parts', { params }),
  create: (data) => api.post('/spare-parts', data),
  update: (id, data) => api.put(`/spare-parts/${id}`, data),
  remove: (id) => api.delete(`/spare-parts/${id}`),
};

export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  myBookings: () => api.get('/bookings/my'),
  get: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  // admin
  all: (params) => api.get('/bookings', { params }),
  assign: (id, data) => api.patch(`/bookings/${id}/assign`, data),
  // technician
  assigned: (params) => api.get('/bookings/assigned', { params }),
  technicianSummary: () => api.get('/bookings/technician/summary'),
  accept: (id) => api.patch(`/bookings/${id}/accept`),
  start: (id) => api.patch(`/bookings/${id}/start`),
  complete: (id, data) => api.patch(`/bookings/${id}/complete`, data),
};

export const technicianApi = {
  list: () => api.get('/technicians'),
  create: (data) => api.post('/technicians', data),
  update: (id, data) => api.put(`/technicians/${id}`, data),
  remove: (id) => api.delete(`/technicians/${id}`),
};

export const paymentApi = {
  createOrder: (data) => api.post('/payments/order', data),
  verify: (data) => api.post('/payments/verify', data),
  my: () => api.get('/payments/my'),
  all: () => api.get('/payments'),
};

export const invoiceApi = {
  byBooking: (bookingId) => api.get(`/invoices/booking/${bookingId}`),
  my: () => api.get('/invoices/my'),
  all: () => api.get('/invoices'),
};

export const serviceStatsApi = {
  get: () => api.get('/service-stats'),
};
