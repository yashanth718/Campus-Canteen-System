import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/orderService';
import { OrderStatus, PaymentStatus } from '../types/order';

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { items, instructions, paymentMethod, idempotencyKey } = req.body;

    const order = await orderService.createOrder({
      student: req.user,
      items,
      instructions,
      paymentMethod,
      idempotencyKey,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const orders = await orderService.getStudentOrders(req.user.uid, limit);

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status as OrderStatus | undefined;
    const paymentStatus = req.query.paymentStatus as PaymentStatus | undefined;
    const search = req.query.search as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

    const orders = await orderService.getAllOrders({
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      limit,
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    // Role check: Students can only view their own order
    if (req.user.role === 'student' && order.studentId !== req.user.uid) {
      res.status(403).json({ success: false, error: 'Forbidden: You cannot access orders belonging to other students.' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { status, note } = req.body;
    const orderId = req.params.id;

    const updated = await orderService.updateOrderStatus({
      orderId,
      targetStatus: status,
      actor: req.user,
      note,
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
