import { db } from '../config/firebase';
import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  isValidStatusTransition,
} from '../types/order';
import { AuthenticatedUser } from '../types/user';
import { menuService } from './menuService';
import { notificationService } from './notificationService';

export class OrderService {
  private ordersCollection = db.collection('orders');

  async createOrder(params: {
    student: AuthenticatedUser;
    items: { itemId: string; quantity: number }[];
    instructions?: string;
    paymentMethod: PaymentMethod;
    idempotencyKey?: string;
  }): Promise<Order> {
    const { student, items, instructions, paymentMethod, idempotencyKey } = params;

    // Idempotency check: prevent duplicate submissions
    if (idempotencyKey) {
      const existingQuery = await this.ordersCollection
        .where('idempotencyKey', '==', idempotencyKey)
        .where('studentId', '==', student.uid)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        return existingQuery.docs[0].data() as Order;
      }
    }

    // 1. Fetch current live menu items from Firestore to compute authoritative prices
    const validatedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const reqItem of items) {
      const menuItem = await menuService.getMenuItemById(reqItem.itemId);
      if (!menuItem) {
        throw new Error(`Menu item "${reqItem.itemId}" no longer exists.`);
      }

      if (!menuItem.available) {
        throw new Error(`Item "${menuItem.name}" is currently sold out / unavailable.`);
      }

      const itemSubtotal = menuItem.price * reqItem.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        itemId: menuItem.itemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: reqItem.quantity,
        subtotal: itemSubtotal,
      });
    }

    const tax = 0; // College canteen zero-GST / subsidized policy
    const total = subtotal + tax;

    // 2. Generate Order ID: ORD-<YEARMODAY>-<RANDOM>
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `ORD-${datePrefix}-${randomSuffix}`;
    const isoNow = now.toISOString();

    // Default payment status
    // Cash at collection is pending until collection; test_mode is marked paid immediately
    const paymentStatus: PaymentStatus = paymentMethod === 'test_mode' ? 'paid' : 'pending';

    const initialOrder: Order = {
      orderId,
      studentId: student.uid,
      studentName: student.displayName || 'Campus Student',
      studentEmail: student.email,
      items: validatedItems,
      instructions: instructions?.trim() || '',
      subtotal,
      tax,
      total,
      paymentMethod,
      paymentStatus,
      status: 'placed',
      statusHistory: [
        {
          status: 'placed',
          timestamp: isoNow,
          actorUid: student.uid,
          actorRole: student.role,
          note: 'Order placed by student',
        },
      ],
      idempotencyKey,
      createdAt: isoNow,
      updatedAt: isoNow,
      collectedAt: null,
    };

    await this.ordersCollection.doc(orderId).set(initialOrder);

    // Create initial in-app notification for the student
    await notificationService.createNotification({
      recipientId: student.uid,
      orderId,
      title: 'Order Placed Successfully! 🍽️',
      message: `Your order #${orderId} for ₹${total} has been received by the kitchen.`,
      type: 'order_status',
    });

    return initialOrder;
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const doc = await this.ordersCollection.doc(orderId).get();
    if (!doc.exists) return null;
    return doc.data() as Order;
  }

  async getStudentOrders(studentId: string, limit: number = 50): Promise<Order[]> {
    const snapshot = await this.ordersCollection
      .where('studentId', '==', studentId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as Order);
  }

  async getAllOrders(filters?: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Order[]> {
    let query: FirebaseFirestore.Query = this.ordersCollection;

    if (filters?.status && filters.status !== ('all' as any)) {
      query = query.where('status', '==', filters.status);
    }

    if (filters?.paymentStatus && filters.paymentStatus !== ('all' as any)) {
      query = query.where('paymentStatus', '==', filters.paymentStatus);
    }

    query = query.orderBy('createdAt', 'desc').limit(filters?.limit || 150);

    const snapshot = await query.get();
    let orders = snapshot.docs.map((doc) => doc.data() as Order);

    // Apply search filter in memory
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      orders = orders.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.studentName.toLowerCase().includes(q) ||
          o.studentEmail.toLowerCase().includes(q) ||
          o.items.some((it) => it.name.toLowerCase().includes(q))
      );
    }

    // Apply date range filter if provided
    if (filters?.startDate) {
      const start = new Date(filters.startDate).toISOString();
      orders = orders.filter((o) => o.createdAt >= start);
    }
    if (filters?.endDate) {
      const end = new Date(`${filters.endDate}T23:59:59.999Z`).toISOString();
      orders = orders.filter((o) => o.createdAt <= end);
    }

    return orders;
  }

  async updateOrderStatus(params: {
    orderId: string;
    targetStatus: OrderStatus;
    actor: AuthenticatedUser;
    note?: string;
  }): Promise<Order> {
    const { orderId, targetStatus, actor, note } = params;

    const docRef = this.ordersCollection.doc(orderId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error(`Order "${orderId}" not found.`);
    }

    const currentOrder = doc.data() as Order;

    // Strict validation of status transitions
    if (!isValidStatusTransition(currentOrder.status, targetStatus)) {
      throw new Error(
        `Invalid status transition: Cannot change order from "${currentOrder.status}" to "${targetStatus}".`
      );
    }

    const isoNow = new Date().toISOString();
    const historyEntry = {
      status: targetStatus,
      timestamp: isoNow,
      actorUid: actor.uid,
      actorRole: actor.role,
      note: note || `Status updated to ${targetStatus} by ${actor.role}`,
    };

    const updateData: Partial<Order> = {
      status: targetStatus,
      updatedAt: isoNow,
      statusHistory: [...(currentOrder.statusHistory || []), historyEntry],
    };

    if (targetStatus === 'collected') {
      updateData.collectedAt = isoNow;
      // If cash at collection, mark as paid upon collection
      if (currentOrder.paymentMethod === 'cash') {
        updateData.paymentStatus = 'paid';
      }
    }

    await docRef.update(updateData);

    // Construct and dispatch persistent student notification
    await this.dispatchStatusNotification(currentOrder, targetStatus);

    const updatedDoc = await docRef.get();
    return updatedDoc.data() as Order;
  }

  private async dispatchStatusNotification(order: Order, newStatus: OrderStatus): Promise<void> {
    let title = '';
    let message = '';

    switch (newStatus) {
      case 'accepted':
        title = 'Order Accepted! 👨‍🍳';
        message = `Kitchen staff accepted your order #${order.orderId}.`;
        break;
      case 'preparing':
        title = 'Food Being Prepared! 🔥';
        message = `Your meal for order #${order.orderId} is now on the stove / prep counter.`;
        break;
      case 'ready':
        title = 'Food Ready for Collection! 🔔';
        message = `Order #${order.orderId} is hot & ready! Please show your order ID at the collection counter.`;
        break;
      case 'collected':
        title = 'Order Collected! 🎉';
        message = `Thank you! Order #${order.orderId} was marked as collected. Enjoy your meal!`;
        break;
      case 'cancelled':
        title = 'Order Cancelled';
        message = `Order #${order.orderId} has been cancelled.`;
        break;
    }

    if (title) {
      await notificationService.createNotification({
        recipientId: order.studentId,
        orderId: order.orderId,
        title,
        message,
        type: 'order_status',
      });
    }
  }
}

export const orderService = new OrderService();
