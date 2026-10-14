import * as admin from 'firebase-admin';
import { ENV } from './env';

let isFirebaseInitialized = false;

export function initializeFirebaseAdmin(): {
  db: admin.firestore.Firestore;
  auth: admin.auth.Auth;
  messaging: admin.messaging.Messaging | null;
  isMock: boolean;
} {
  if (admin.apps.length > 0) {
    isFirebaseInitialized = true;
    return {
      db: admin.firestore(),
      auth: admin.auth(),
      messaging: admin.apps[0]?.options.projectId ? admin.messaging() : null,
      isMock: false,
    };
  }

  // Priority 1: Service Account direct credentials in ENV
  if (ENV.FIREBASE_PROJECT_ID && ENV.FIREBASE_CLIENT_EMAIL && ENV.FIREBASE_PRIVATE_KEY) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: ENV.FIREBASE_PROJECT_ID,
          clientEmail: ENV.FIREBASE_CLIENT_EMAIL,
          privateKey: ENV.FIREBASE_PRIVATE_KEY,
        }),
      });
      console.log(`[Firebase] Initialized with Service Account for project: ${ENV.FIREBASE_PROJECT_ID}`);
      isFirebaseInitialized = true;
      return {
        db: admin.firestore(),
        auth: admin.auth(),
        messaging: admin.messaging(),
        isMock: false,
      };
    } catch (err) {
      console.error('[Firebase] Failed to initialize with cert credentials:', err);
    }
  }

  // Priority 2: Application Default Credentials or Project ID (GCP Cloud Run / Emulators)
  if (ENV.FIREBASE_PROJECT_ID || process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCLOUD_PROJECT) {
    try {
      admin.initializeApp({
        projectId: ENV.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'campus-canteen-demo',
      });
      console.log('[Firebase] Initialized using Application Default Credentials / Project ID');
      isFirebaseInitialized = true;
      return {
        db: admin.firestore(),
        auth: admin.auth(),
        messaging: null,
        isMock: false,
      };
    } catch (err) {
      console.error('[Firebase] Failed to initialize using default credentials:', err);
    }
  }

  // Fallback for development/testing when no GCP credentials have been placed yet
  console.warn(
    '[Firebase] No Google Cloud / Firebase credentials found in environment.\n' +
    'Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.\n' +
    'Using project "campus-canteen-demo" fallback.'
  );

  try {
    admin.initializeApp({
      projectId: 'campus-canteen-demo',
    });
    return {
      db: admin.firestore(),
      auth: admin.auth(),
      messaging: null,
      isMock: false,
    };
  } catch {
    // Already initialized or dummy
    return {
      db: admin.firestore(),
      auth: admin.auth(),
      messaging: null,
      isMock: false,
    };
  }
}

const firebaseServices = initializeFirebaseAdmin();
export const db = firebaseServices.db;
export const auth = firebaseServices.auth;
export const messaging = firebaseServices.messaging;
