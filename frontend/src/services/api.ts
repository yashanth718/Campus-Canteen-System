import { auth } from '../config/firebase';
import {
  Category,
  MenuItem,
  Order,
  NotificationItem,
  AnalyticsSummary,
  DailyTrendPoint,
  HourlyDistributionPoint,
  CategorySalesPoint,
  PopularFoodItem,
  HighestOrderedFoodResponse,
  EarningsBreakdown,
  UserProfile,
  UserRole,
  OrderStatus,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    // Check if demo user token is set in sessionStorage for instant reviewer testing
    const demoToken = sessionStorage.getItem('canteen_demo_token');
    if (demoToken) {
      return demoToken;
    }

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        return await currentUser.getIdToken();
      } catch (err) {
        console.warn('Failed to retrieve Firebase ID token:', err);
      }
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data.error || `HTTP error ${response.status}`;
      throw new Error(errorMsg);
    }

    return data.data !== undefined ? data.data : data;
  }

  // Auth & Profile
  async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me');
  }

  async registerFcmToken(token: string): Promise<void> {
    return this.request<void>('/auth/fcm-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Menu
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/menu/categories');
  }

  async getMenuItems(params?: { category?: string; available?: boolean; search?: string }): Promise<MenuItem[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.available !== undefined) query.set('available', String(params.available));
    if (params?.search) query.set('search', params.search);

    const qs = query.toString();
    return this.request<MenuItem[]>(`/menu/items${qs ? `?${qs}` : ''}`);
  }

  async getMenuItem(id: string): Promise<MenuItem> {
    return this.request<MenuItem>(`/menu/items/${id}`);
  }

  async createMenuItem(data: Partial<MenuItem>): Promise<MenuItem> {
    return this.request<MenuItem>('/menu/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    return this.request<MenuItem>(`/menu/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMenuItem(id: string): Promise<void> {
    return this.request<void>(`/menu/items/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleAvailability(id: string, available: boolean): Promise<MenuItem> {
    return this.request<MenuItem>(`/menu/items/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    });
  }

  // Orders
  async createOrder(payload: {
    items: { itemId: string; quantity: number }[];
    instructions?: string;
    paymentMethod: string;
    idempotencyKey?: string;
  }): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMyOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders/my');
  }

  async getAllOrders(filters?: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (filters?.status) query.set('status', filters.status);
    if (filters?.paymentStatus) query.set('paymentStatus', filters.paymentStatus);
    if (filters?.search) query.set('search', filters.search);
    if (filters?.startDate) query.set('startDate', filters.startDate);
    if (filters?.endDate) query.set('endDate', filters.endDate);
    if (filters?.limit) query.set('limit', String(filters.limit));

    const qs = query.toString();
    return this.request<Order[]>(`/orders${qs ? `?${qs}` : ''}`);
  }

  async getOrderById(orderId: string): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications');
  }

  async markNotificationAsRead(id: string): Promise<void> {
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.request<void>('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // Analytics (Admin)
  async getAnalyticsSummary(params?: { startDate?: string; endDate?: string }): Promise<AnalyticsSummary> {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    const qs = query.toString();
    return this.request<AnalyticsSummary>(`/analytics/summary${qs ? `?${qs}` : ''}`);
  }

  async getAnalyticsCharts(params: {
    range?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    dailyTrends: DailyTrendPoint[];
    hourlyDistribution: HourlyDistributionPoint[];
    categorySales: CategorySalesPoint[];
    popularItems: PopularFoodItem[];
    statusDistribution: { status: string; count: number }[];
    range: string;
    startDate: string;
    endDate: string;
  }> {
    const query = new URLSearchParams();
    if (params.range) query.set('range', params.range);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    const qs = query.toString();
    return this.request<any>(`/analytics/charts${qs ? `?${qs}` : ''}`);
  }

  async getHighestFoodOfDay(date?: string): Promise<HighestOrderedFoodResponse> {
    const query = new URLSearchParams();
    if (date) query.set('date', date);
    const qs = query.toString();
    return this.request<HighestOrderedFoodResponse>(`/analytics/highest-food${qs ? `?${qs}` : ''}`);
  }

  async getEarnings(): Promise<EarningsBreakdown> {
    return this.request<EarningsBreakdown>('/analytics/earnings');
  }

  // Payments
  async createPaymentOrder(orderId: string, amount: number): Promise<{
    mode: 'test_mode' | 'razorpay';
    data: any;
  }> {
    return this.request<any>('/payments/create', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount }),
    });
  }

  async verifyPayment(payload: {
    orderId: string;
    paymentId: string;
    providerReference: string;
    amount?: number;
    signature?: string;
  }): Promise<any> {
    return this.request<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Users (Admin)
  async getAllUsers(): Promise<UserProfile[]> {
    return this.request<UserProfile[]>('/users');
  }

  async updateUserRole(uid: string, role: UserRole): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${uid}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async updateUserActive(uid: string, active: boolean): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${uid}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
  }
}

export const api = new ApiClient();
