import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[API Error] ${req.method} ${req.path} (${statusCode}):`, message, err.details || '');

  res.status(statusCode).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV !== 'production' ? err.details : undefined,
  });
}
