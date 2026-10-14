export type NotificationType = 'order_status' | 'system';

export interface NotificationItem {
  notificationId: string;
  recipientId: string;
  orderId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
}
