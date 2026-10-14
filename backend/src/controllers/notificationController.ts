import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const notifications = await notificationService.getNotificationsForUser(req.user.uid, limit);

    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const updated = await notificationService.markAsRead(req.params.id, req.user.uid);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const count = await notificationService.markAllAsRead(req.user.uid);
    res.json({ success: true, message: `Marked ${count} notifications as read.` });
  } catch (err) {
    next(err);
  }
}
