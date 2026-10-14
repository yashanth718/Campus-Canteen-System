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

// Allowed state transitions lookup table
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['collected'],
  collected: [],
  cancelled: [],
};

export function isValidStatusTransition(current: OrderStatus, target: OrderStatus): boolean {
  const allowed = ALLOWED_STATUS_TRANSITIONS[current] || [];
  return allowed.includes(target);
}
