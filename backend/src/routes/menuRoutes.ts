import { Router } from 'express';
import {
  getCategories,
  createCategory,
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} from '../controllers/menuController';
import { verifyAuthToken, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createMenuItemSchema, updateMenuItemSchema } from '../validators';

const router = Router();

// Public routes for browsing food
router.get('/categories', getCategories);
router.get('/items', getMenuItems);
router.get('/items/:id', getMenuItem);

// Admin-protected routes for menu management
router.post('/categories', verifyAuthToken, requireRole(['admin']), createCategory);
router.post('/items', verifyAuthToken, requireRole(['admin']), validateBody(createMenuItemSchema), createMenuItem);
router.patch('/items/:id', verifyAuthToken, requireRole(['admin']), validateBody(updateMenuItemSchema), updateMenuItem);
router.delete('/items/:id', verifyAuthToken, requireRole(['admin']), deleteMenuItem);
router.patch('/items/:id/availability', verifyAuthToken, requireRole(['admin']), toggleAvailability);

export default router;
