import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const profile = await userService.getUserById(req.user.uid);
    res.json({
      success: true,
      data: profile || {
        uid: req.user.uid,
        email: req.user.email,
        displayName: req.user.displayName,
        role: req.user.role,
        active: true,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function registerFcmToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, error: 'FCM token is required' });
      return;
    }

    await userService.registerFcmToken(req.user.uid, token);
    res.json({ success: true, message: 'FCM token registered successfully.' });
  } catch (err) {
    next(err);
  }
}
