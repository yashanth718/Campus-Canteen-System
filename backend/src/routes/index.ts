import { Router } from 'express';
import authRoutes from './authRoutes';
import menuRoutes from './menuRoutes';
import orderRoutes from './orderRoutes';
import notificationRoutes from './notificationRoutes';
import analyticsRoutes from './analyticsRoutes';
import paymentRoutes from './paymentRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);

export default router;
