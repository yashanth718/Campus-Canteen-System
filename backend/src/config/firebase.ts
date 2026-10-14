import * as admin from 'firebase-admin';
import fs from 'fs';
import { ENV } from './env';
import { LocalMemoryStore } from './localStore';

let isFirebaseInitialized = false;

function hasValidLiveCredentials(): boolean {
  // Check if explicit service account keys are provided
  if (ENV.FIREBASE_PROJECT_ID && ENV.FIREBASE_CLIENT_EMAIL && ENV.FIREBASE_PRIVATE_KEY) {
    return true;
  }
  // Check if GOOGLE_APPLICATION_CREDENTIALS points to an existing file
  const gCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (gCreds && fs.existsSync(gCreds)) {
    return true;
  }
  if (
  process.env.K_SERVICE &&
  (ENV.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT)
) {
  return true;
}
  return false;
}

interface BatchLike {
  update(ref: any, data: any): BatchLike;
  set(ref: any, data: any, options?: any): BatchLike;
  delete(ref: any): BatchLike;
  commit(): Promise<any>;
}

// interface DatabaseLike {
//   collection(name: string): any;
//   batch(): BatchLike;
// }


interface DocumentSnapshotLike {
  id: string;
  exists: boolean;
  data(): any;
  ref: { id: string };
}

interface QuerySnapshotLike {
  docs: DocumentSnapshotLike[];
  empty: boolean;
  size: number;
}

interface DocumentReferenceLike {
  id: string;
  get(): Promise<DocumentSnapshotLike>;
  set(data: any, options?: any): Promise<any>;
  update(data: any): Promise<any>;
  delete(): Promise<any>;
}

interface QueryLike {
  where(field: string, op: any, value: any): QueryLike;
  orderBy(field: string, direction?: 'asc' | 'desc'): QueryLike;
  limit(count: number): QueryLike;
  get(): Promise<QuerySnapshotLike>;
}

interface CollectionLike extends QueryLike {
  doc(id?: string): DocumentReferenceLike;
}

interface BatchLike {
  update(ref: any, data: any): BatchLike;
  set(ref: any, data: any, options?: any): BatchLike;
  delete(ref: any): BatchLike;
  commit(): Promise<any>;
}

interface DatabaseLike {
  collection(name: string): CollectionLike;
  batch(): BatchLike;
}



export function initializeFirebaseAdmin(): {
  db: DatabaseLike;
  auth: any;
  messaging: any;
  isMock: boolean;
} {
  if (hasValidLiveCredentials()) {
    try {
      if (admin.apps.length === 0) {
        if (ENV.FIREBASE_CLIENT_EMAIL && ENV.FIREBASE_PRIVATE_KEY) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: ENV.FIREBASE_PROJECT_ID,
              clientEmail: ENV.FIREBASE_CLIENT_EMAIL,
              privateKey: ENV.FIREBASE_PRIVATE_KEY,
            }),
          });
        } else {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId:
      ENV.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
  });
}
      }

      console.log(`[Firebase] Connected to live Cloud Firestore for project: ${ENV.FIREBASE_PROJECT_ID}`);
      return {
        db: admin.firestore() as unknown as DatabaseLike,
        auth: admin.auth(),
        messaging: admin.messaging(),
        isMock: false,
      };
    } catch (err: any) {
      console.warn('[Firebase] Live initialization failed, falling back to Local Memory Store:', err.message);
    }
  }

  // Graceful Local In-Memory Firestore Fallback
  console.log('====================================================================');
  console.log('⚡ [Firebase] Running in Local Development Store Mode');
  console.log('🍽️ Pre-loaded with categories, 15+ dishes, test orders & users.');
  console.log('💡 No Google Cloud service account key required for local demo!');
  console.log('====================================================================');

  const localStore = new LocalMemoryStore();

  const mockAuth = {
    verifyIdToken: async (token: string) => {
      // Decode or provide mock claims
      return {
        uid: 'dev-student-1',
        email: 'student@canteen.edu',
        name: 'Aarav Sharma',
      };
    },
    getUserByEmail: async (email: string) => {
      const user = localStore.getAllDocs('users').find((u) => u.email === email);
      if (user) return user;
      throw new Error(`User not found with email: ${email}`);
    },
    setCustomUserClaims: async () => {},
  };

  return {
    db: localStore as unknown as DatabaseLike,
    auth: mockAuth,
    messaging: null,
    isMock: true,
  };
}

const firebaseServices = initializeFirebaseAdmin();
export const db = firebaseServices.db;
export const auth = firebaseServices.auth;
export const messaging = firebaseServices.messaging;
