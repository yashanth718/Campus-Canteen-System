import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root or parent root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  TIMEZONE: process.env.TIMEZONE || 'Asia/Kolkata',

  // Firebase Admin configuration
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL || '',

  // Razorpay configuration (Optional test keys)
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',

  // Campus canteen configuration
  CANTEEN_NAME: process.env.CANTEEN_NAME || 'Campus Cloud Canteen',
  CURRENCY_SYMBOL: '₹',
};
