import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController';
import { verifyAuthToken } from '../middleware/auth';

const router = Router();

router.get('/', verifyAuthToken, getNotifications);
router.patch('/:id/read', verifyAuthToken, markAsRead);
router.patch('/read-all', verifyAuthToken, markAllAsRead);

export default router;
