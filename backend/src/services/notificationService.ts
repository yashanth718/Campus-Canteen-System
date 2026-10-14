import { db, messaging } from '../config/firebase';
import { NotificationItem, NotificationType } from '../types/notification';

export class NotificationService {
  private collection = db.collection('notifications');

  async createNotification(params: {
    recipientId: string;
    orderId: string;
    title: string;
    message: string;
    type?: NotificationType;
  }): Promise<NotificationItem> {
    const docRef = this.collection.doc();
    const notification: NotificationItem = {
      notificationId: docRef.id,
      recipientId: params.recipientId,
      orderId: params.orderId,
      title: params.title,
      message: params.message,
      type: params.type || 'order_status',
      read: false,
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    await docRef.set(notification);

    // Attempt push notification via FCM if user has tokens
    this.sendPushNotification(params.recipientId, params.title, params.message, params.orderId).catch((err) => {
      console.warn('[FCM] Push notification send skipped or failed:', err.message || err);
    });

    return notification;
  }

  async getNotificationsForUser(recipientId: string, limit: number = 50): Promise<NotificationItem[]> {
    const snapshot = await this.collection
      .where('recipientId', '==', recipientId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as NotificationItem);
  }

  async markAsRead(notificationId: string, recipientId: string): Promise<boolean> {
    const docRef = this.collection.doc(notificationId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return false;
    }

    const data = doc.data() as NotificationItem;
    if (data.recipientId !== recipientId) {
      throw new Error('Unauthorized to modify this notification');
    }

    await docRef.update({
      read: true,
      readAt: new Date().toISOString(),
    });

    return true;
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    const snapshot = await this.collection
      .where('recipientId', '==', recipientId)
      .where('read', '==', false)
      .get();

    if (snapshot.empty) {
      return 0;
    }

    const batch = db.batch();
    const now = new Date().toISOString();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true, readAt: now });
    });

    await batch.commit();
    return snapshot.size;
  }

  private async sendPushNotification(recipientId: string, title: string, body: string, orderId: string) {
    if (!messaging) return;

    try {
      const userDoc = await db.collection('users').doc(recipientId).get();
      if (!userDoc.exists) return;

      const fcmTokens: string[] = userDoc.data()?.fcmTokens || [];
      if (!fcmTokens || fcmTokens.length === 0) return;

      await messaging.sendEachForMulticast({
        tokens: fcmTokens,
        notification: {
          title,
          body,
        },
        data: {
          orderId,
          click_action: `/orders/${orderId}`,
        },
      });
    } catch (err: any) {
      console.warn('[FCM] Send error:', err.message || err);
    }
  }
}

export const notificationService = new NotificationService();
