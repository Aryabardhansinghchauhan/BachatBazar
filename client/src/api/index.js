import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bachat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: clear auth if expired
      // localStorage.removeItem('bachat_token');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Products API
export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  search: (q, category) => api.get('/products/search', { params: { q, category } }),
  getByIdOrSlug: (idOrSlug) => api.get(`/products/${idOrSlug}`),
  getPriceHistory: (id, days = 180) => api.get(`/products/${id}/history`, { params: { days } }),
  getFeaturedDeals: () => api.get('/products/deals/featured'),
  getCategories: () => api.get('/products/categories'),
};

// Wishlist API
export const wishlistApi = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post(`/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
};

// Alerts API
export const alertApi = {
  getAlerts: () => api.get('/alerts'),
  createAlert: (data) => api.post('/alerts', data),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
  testTrigger: (id) => api.post(`/alerts/${id}/test-trigger`),
};

export default api;
