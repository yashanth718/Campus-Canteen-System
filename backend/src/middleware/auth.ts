import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';
import { AuthenticatedUser, UserRole } from '../types/user';

// Extend Express Request type to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function verifyAuthToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or malformed Authorization header. Expected "Bearer <token>".',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // Test / Dev Mode shortcuts for automated testing or rapid evaluation without live credentials
  if (process.env.NODE_ENV !== 'production' && token.startsWith('dev-')) {
    if (token === 'dev-admin-token') {
      req.user = { uid: 'dev-admin-1', email: 'admin@canteen.edu', displayName: 'Canteen Admin', role: 'admin' };
      return next();
    }
    if (token === 'dev-staff-token') {
      req.user = { uid: 'dev-staff-1', email: 'staff@canteen.edu', displayName: 'Kitchen Staff', role: 'staff' };
      return next();
    }
    if (token === 'dev-student-token') {
      req.user = { uid: 'dev-student-1', email: 'student@canteen.edu', displayName: 'Demo Student', role: 'student' };
      return next();
    }
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email || '';
    const displayName = decodedToken.name || decodedToken.displayName || email.split('@')[0];

    // Read user role directly from secure Firestore collection
    let role: UserRole = 'student';
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data?.role) {
          role = data.role as UserRole;
        }
        if (data?.active === false) {
          res.status(403).json({ success: false, error: 'Your account has been deactivated by administrator.' });
          return;
        }
      } else {
        // Auto-provision student profile document on first verified login
        const now = new Date().toISOString();
        await db.collection('users').doc(uid).set({
          uid,
          email,
          displayName,
          role: 'student', // ALWAYS default to student; never elevated
          active: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (firestoreErr) {
      console.warn('[Auth Middleware] Firestore lookup fallback:', firestoreErr);
    }

    req.user = {
      uid,
      email,
      displayName,
      role,
    };

    next();
  } catch (error: any) {
    console.error('[Auth Middleware] Token verification failed:', error.message || error);
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid, expired, or revoked Firebase authentication token.',
    });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized: Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Access denied. Required role: [${allowedRoles.join(', ')}]. Your current role is: [${req.user.role}].`,
      });
      return;
    }

    next();
  };
}
