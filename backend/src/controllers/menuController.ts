import { Request, Response, NextFunction } from 'express';
import { menuService } from '../services/menuService';

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await menuService.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await menuService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function getMenuItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categoryId = req.query.category as string | undefined;
    const availableOnly = req.query.available === 'true';
    const search = req.query.search as string | undefined;

    const items = await menuService.getMenuItems({ categoryId, availableOnly, search });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function getMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await menuService.getMenuItemById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, error: 'Menu item not found.' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function createMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await menuService.createMenuItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function updateMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await menuService.updateMenuItem(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function deleteMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await menuService.deleteMenuItem(req.params.id);
    res.json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function toggleAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { available } = req.body;
    if (typeof available !== 'boolean') {
      res.status(400).json({ success: false, error: '"available" boolean is required.' });
      return;
    }
    const item = await menuService.setAvailability(req.params.id, available);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}
