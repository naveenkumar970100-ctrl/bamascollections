const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal API Client for Bamas Collections MERN Backend
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message?: string; data: T }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bamas_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Failed to parse JSON response from server',
  }));

  if (!response.ok || data.success === false) {
    const errorMessage = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export const api = {
  // Auth endpoints
  auth: {
    async register(payload: { name: string; email?: string; phone?: string; password: string; confirmPassword?: string }) {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.data?.token) {
        localStorage.setItem('bamas_token', res.data.token);
        localStorage.setItem('bamas_user', JSON.stringify(res.data));
      }
      return res;
    },

    async login(payload: { email?: string; phone?: string; identifier?: string; password: string }) {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.data?.token) {
        localStorage.setItem('bamas_token', res.data.token);
        localStorage.setItem('bamas_user', JSON.stringify(res.data));
      }
      return res;
    },

    async google(payload: { email: string; name?: string; avatar?: string; googleId?: string }) {
      const res = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.data?.token) {
        localStorage.setItem('bamas_token', res.data.token);
        localStorage.setItem('bamas_user', JSON.stringify(res.data));
      }
      return res;
    },

    async getProfile() {
      return apiRequest('/auth/profile', { method: 'GET' });
    },

    async updateProfile(payload: { name?: string; phone?: string; address?: any; password?: string }) {
      return apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    logout() {
      localStorage.removeItem('bamas_token');
      localStorage.removeItem('bamas_user');
    },

    getCurrentUser() {
      try {
        const stored = localStorage.getItem('bamas_user');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    },
  },

  // Admin Dashboard endpoints (Protected by role === 'admin')
  admin: {
    async getStats() {
      return apiRequest('/admin/stats', { method: 'GET' });
    },

    async getUsers() {
      return apiRequest('/admin/users', { method: 'GET' });
    },

    async updateUserRole(id: string, role: 'customer' | 'admin') {
      return apiRequest(`/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    },

    async deleteUser(id: string) {
      return apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
    },

    async getOrders() {
      return apiRequest('/admin/orders', { method: 'GET' });
    },

    async updateOrderStatus(id: string, status: string) {
      return apiRequest(`/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },

    async createProduct(productData: any) {
      return apiRequest('/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    },

    async updateProduct(id: string, productData: any) {
      return apiRequest(`/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    },

    async deleteProduct(id: string) {
      return apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
    },

    async getInquiries() {
      return apiRequest('/admin/inquiries', { method: 'GET' });
    },
  },

  // Product endpoints
  products: {
    async getAll(params: { category?: string; keyword?: string; sort?: string } = {}) {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'All') query.set('category', params.category);
      if (params.keyword) query.set('keyword', params.keyword);
      if (params.sort) query.set('sort', params.sort);

      const qs = query.toString();
      return apiRequest(`/products${qs ? `?${qs}` : ''}`, { method: 'GET' });
    },

    async getFeatured() {
      return apiRequest('/products/featured', { method: 'GET' });
    },

    async getBySlugOrId(idOrSlug: string) {
      return apiRequest(`/products/${idOrSlug}`, { method: 'GET' });
    },
  },

  // Order endpoints
  orders: {
    async create(orderData: any) {
      return apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },

    async getMyOrders() {
      return apiRequest('/orders/myorders', { method: 'GET' });
    },

    async getById(id: string) {
      return apiRequest(`/orders/${id}`, { method: 'GET' });
    },
  },

  // Inquiry endpoints (Contact / Drape consultation)
  inquiries: {
    async create(payload: {
      name: string;
      email: string;
      phone?: string;
      subject?: string;
      message: string;
      sareeInterest?: string;
    }) {
      return apiRequest('/inquiries', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  // Site Configuration & Branding from MongoDB
  siteConfig: {
    async get() {
      return apiRequest('/site-config', { method: 'GET' });
    },
    async update(data: any) {
      return apiRequest('/site-config', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  // Real-time Notification endpoints (Admin <-> Customer)
  notifications: {
    async getAll() {
      return apiRequest<{ notifications: any[]; unreadCount: number }>('/notifications', { method: 'GET' });
    },
    async markRead(id: string) {
      return apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
    },
    async markAllRead() {
      return apiRequest('/notifications/read-all', { method: 'PUT' });
    },
    async send(payload: {
      recipientId?: string;
      recipientRole?: 'admin' | 'customer' | 'all';
      title: string;
      message: string;
      type?: string;
      targetUrl?: string;
    }) {
      return apiRequest('/notifications/send', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  // Cloudinary direct upload via backend
  upload: {
    async uploadImage(file: File, folder = 'bamascollections/products') {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const token = localStorage.getItem('bamas_token');
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Image upload failed');
      }
      return data;
    },
  },

  // Health check
  async checkHealth() {
    return apiRequest('/health', { method: 'GET' });
  },
};
