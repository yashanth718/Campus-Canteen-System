import { Router } from 'express';
import { getMe, registerFcmToken } from '../controllers/authController';
import { verifyAuthToken } from '../middleware/auth';

const router = Router();

router.get('/me', verifyAuthToken, getMe);
router.post('/fcm-token', verifyAuthToken, registerFcmToken);

export default router;
