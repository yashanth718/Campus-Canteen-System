import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
} from '../controllers/paymentController';
import { verifyAuthToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createPaymentOrderSchema, verifyPaymentSchema } from '../validators';

const router = Router();

router.post('/create', verifyAuthToken, validateBody(createPaymentOrderSchema), createPaymentOrder);
router.post('/verify', verifyAuthToken, validateBody(verifyPaymentSchema), verifyPayment);

export default router;
