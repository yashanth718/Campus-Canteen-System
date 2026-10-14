import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController';
import { verifyAuthToken, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createOrderSchema, updateOrderStatusSchema } from '../validators';

const router = Router();

// Student order placement
router.post('/', verifyAuthToken, validateBody(createOrderSchema), createOrder);

// Student order history
router.get('/my', verifyAuthToken, getMyOrders);

// Staff and Admin operational order stream
router.get('/', verifyAuthToken, requireRole(['staff', 'admin']), getAllOrders);

// Order details (Student can view own; Staff/Admin can view any)
router.get('/:id', verifyAuthToken, getOrderById);

// Staff and Admin status updates
router.patch(
  '/:id/status',
  verifyAuthToken,
  requireRole(['staff', 'admin']),
  validateBody(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
