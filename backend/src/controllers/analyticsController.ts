import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService';

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const summary = await analyticsService.getSummaryKPIs({ startDate, endDate });
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

export async function getCharts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const range = (req.query.range as string) || 'today';
    let startDate = req.query.startDate as string | undefined;
    let endDate = req.query.endDate as string | undefined;

    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const todayStr = formatter.format(now);

    if (range === 'today') {
      startDate = todayStr;
      endDate = todayStr;
    } else if (range === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = formatter.format(y);
      startDate = yStr;
      endDate = yStr;
    } else if (range === 'last7') {
      const d7 = new Date(now);
      d7.setDate(d7.getDate() - 6);
      startDate = formatter.format(d7);
      endDate = todayStr;
    } else if (range === 'last30') {
      const d30 = new Date(now);
      d30.setDate(d30.getDate() - 29);
      startDate = formatter.format(d30);
      endDate = todayStr;
    } else if (!startDate || !endDate) {
      startDate = todayStr;
      endDate = todayStr;
    }

    const charts = await analyticsService.getChartAnalytics({ startDate, endDate });
    res.json({ success: true, data: { ...charts, range, startDate, endDate } });
  } catch (err) {
    next(err);
  }
}

export async function getHighestFoodOfDay(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const date = req.query.date as string | undefined;
    const result = await analyticsService.getHighestOrderedFoodOfDay(date);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const earnings = await analyticsService.getEarningsBreakdown();
    res.json({ success: true, data: earnings });
  } catch (err) {
    next(err);
  }
}
