export type UserRole = 'student' | 'staff' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  categoryId: string;
  name: string;
  description: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
}

export interface MenuItem {
  itemId: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  imageUrl: string;
  available: boolean;
  preparationTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'placed' | 'accepted' | 'preparing' | 'ready' | 'collected' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'test_mode' | 'razorpay';

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  actorUid: string;
  actorRole: string;
  note?: string;
}

export interface Order {
  orderId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  items: OrderItem[];
  instructions?: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
  collectedAt?: string | null;
}

export interface NotificationItem {
  notificationId: string;
  recipientId: string;
  orderId: string;
  title: string;
  message: string;
  type: 'order_status' | 'system';
  read: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalOrders: number;
  ordersToday: number;
  ordersPreparing: number;
  ordersReady: number;
  ordersCollected: number;
  totalRevenue: number;
  realizedRevenue: number;
  grossOrderValue: number;
  averageOrderValue: number;
  distinctStudents: number;
}

export interface DailyTrendPoint {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface HourlyDistributionPoint {
  hour: string;
  orderCount: number;
}

export interface CategorySalesPoint {
  category: string;
  revenue: number;
  itemCount: number;
}

export interface PopularFoodItem {
  itemId: string;
  name: string;
  imageUrl: string;
  category: string;
  quantityOrdered: number;
  orderCount: number;
  revenue: number;
}

export interface HighestOrderedFoodResponse {
  date: string;
  hasOrders: boolean;
  highestItems: PopularFoodItem[];
}

export interface EarningsBreakdown {
  today: number;
  yesterday: number;
  last7Days: number;
  last30Days: number;
  averageOrderValue: number;
  realizedRevenue: number;
  grossRevenue: number;
  byCategory: Record<string, number>;
  byItem: { itemId: string; name: string; revenue: number; quantity: number }[];
}
