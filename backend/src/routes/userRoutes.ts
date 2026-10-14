import { Router } from 'express';
import {
  getAllUsers,
  updateUserRole,
  updateUserActive,
} from '../controllers/userController';
import { verifyAuthToken, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { updateUserRoleSchema, updateUserActiveSchema } from '../validators';

const router = Router();

router.use(verifyAuthToken, requireRole(['admin']));

router.get('/', getAllUsers);
router.patch('/:id/role', validateBody(updateUserRoleSchema), updateUserRole);
router.patch('/:id/active', validateBody(updateUserActiveSchema), updateUserActive);

export default router;
