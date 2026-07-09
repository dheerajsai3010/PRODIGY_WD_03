const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  health: () => request('/health'),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products?${query}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  getProductReviews: (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products/${id}/reviews?${query}`);
  },
  addReview: (id, body) => request(`/products/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
  search: (q, limit = 20) => request(`/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  autocomplete: (q) => request(`/search/autocomplete?q=${encodeURIComponent(q)}`),
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrder: (id) => request(`/orders/${id}`),
  trackOrder: (id) => request(`/orders/track/${id}`),
  getUserOrders: (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders/user/${userId}?${query}`);
  },
  createPayment: (body) => request('/payment/create-order', { method: 'POST', body: JSON.stringify(body) }),
  verifyPayment: (body) => request('/payment/verify-payment', { method: 'POST', body: JSON.stringify(body) }),
};

export default api;
