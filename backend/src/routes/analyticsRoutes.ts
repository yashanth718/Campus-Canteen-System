import { Router } from 'express';
import {
  getSummary,
  getCharts,
  getHighestFoodOfDay,
  getEarnings,
} from '../controllers/analyticsController';
import { verifyAuthToken, requireRole } from '../middleware/auth';

const router = Router();

// All analytics endpoints are strictly Admin-only
router.use(verifyAuthToken, requireRole(['admin']));

router.get('/summary', getSummary);
router.get('/charts', getCharts);
router.get('/highest-food', getHighestFoodOfDay);
router.get('/earnings', getEarnings);

export default router;
