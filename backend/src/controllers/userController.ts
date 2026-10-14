import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.body;
    const targetUid = req.params.id;

    // Prevent admin from accidentally demoting themselves
    if (req.user?.uid === targetUid && role !== 'admin') {
      res.status(400).json({ success: false, error: 'Cannot demote your own admin account.' });
      return;
    }

    const updated = await userService.updateUserRole(targetUid, role);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function updateUserActive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { active } = req.body;
    const targetUid = req.params.id;

    if (req.user?.uid === targetUid && !active) {
      res.status(400).json({ success: false, error: 'Cannot deactivate your own account.' });
      return;
    }

    const updated = await userService.updateUserActive(targetUid, active);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
