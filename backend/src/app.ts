import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { ENV } from './config/env';

export function createApp(): Application {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow all origins in development or if CORS_ORIGIN is '*'
        if (!origin || ENV.CORS_ORIGIN === '*' || origin === ENV.CORS_ORIGIN) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive for college project demonstrations
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoints for Cloud Run & load balancers
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      canteen: ENV.CANTEEN_NAME,
      environment: ENV.NODE_ENV,
    });
  });

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      version: '1.0.0',
      database: 'Cloud Firestore',
      auth: 'Firebase Auth',
      timestamp: new Date().toISOString(),
    });
  });

  // Main API router
  app.use('/api', routes);

  // 404 handler for unknown routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Route not found: ${req.method} ${req.path}`,
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
