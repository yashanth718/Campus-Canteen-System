import { z } from 'zod';

export const createMenuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().min(5, 'Description must be at least 5 characters').max(500),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than 0'),
  imageUrl: z.string().url('Image URL must be valid').or(z.string().min(1)),
  available: z.boolean().default(true),
  preparationTimeMinutes: z.number().int().min(1).max(120).default(15),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export const orderItemInputSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Max 20 items per item type'),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'At least one item must be in the order'),
  instructions: z.string().max(250).optional().default(''),
  paymentMethod: z.enum(['cash', 'test_mode', 'razorpay']).default('test_mode'),
  idempotencyKey: z.string().min(6).max(128).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['placed', 'accepted', 'preparing', 'ready', 'collected', 'cancelled']),
  note: z.string().max(200).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['student', 'staff', 'admin']),
});

export const updateUserActiveSchema = z.object({
  active: z.boolean(),
});

export const createPaymentOrderSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  providerReference: z.string().min(1),
  signature: z.string().optional(),
});

export const analyticsQuerySchema = z.object({
  range: z.enum(['today', 'yesterday', 'last7', 'last30', 'custom']).default('today'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
