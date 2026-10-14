import { createApp } from './app';
import { ENV } from './config/env';

const app = createApp();

const server = app.listen(ENV.PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ${ENV.CANTEEN_NAME} Backend API Server`);
  console.log(`📡 Listening on http://localhost:${ENV.PORT}`);
  console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
  console.log(`⏰ Timezone: ${ENV.TIMEZONE}`);
  console.log(`====================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
});
