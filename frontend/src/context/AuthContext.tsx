import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  switchDemoRole: (targetRole: UserRole) => void;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  // Check demo user in sessionStorage first
  useEffect(() => {
    const savedDemoRole = sessionStorage.getItem('canteen_demo_role') as UserRole | null;
    if (savedDemoRole) {
      setIsDemoUser(true);
      setRole(savedDemoRole);
      setUserProfile({
        uid: `dev-${savedDemoRole}-1`,
        displayName:
          savedDemoRole === 'admin'
            ? 'Campus Admin'
            : savedDemoRole === 'staff'
            ? 'Chef Ramesh (Staff)'
            : 'Aarav Sharma (Student)',
        email: `${savedDemoRole}@canteen.edu`,
        role: savedDemoRole,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Query Firestore profile
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUserProfile(data);
            setRole(data.role || 'student');
          } else {
            // New user: default to student role
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'Student',
              email: user.email || '',
              role: 'student',
              active: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
            setRole('student');
          }
        } catch (err) {
          console.warn('Profile fetch warning (using student fallback):', err);
          setUserProfile({
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Student',
            email: user.email || '',
            role: 'student',
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setRole('student');
        }
      } else {
        setUserProfile(null);
        setRole('student');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    sessionStorage.removeItem('canteen_demo_role');
    sessionStorage.removeItem('canteen_demo_token');
    setIsDemoUser(false);
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string, name: string) => {
    sessionStorage.removeItem('canteen_demo_role');
    sessionStorage.removeItem('canteen_demo_token');
    setIsDemoUser(false);
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    const profile: UserProfile = {
      uid: user.uid,
      displayName: name,
      email: user.email || email,
      role: 'student', // ALWAYS student
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid), profile);
    } catch (e) {
      console.warn('Could not write profile to Firestore:', e);
    }

    setUserProfile(profile);
    setRole('student');
  };

  const logout = async () => {
    sessionStorage.removeItem('canteen_demo_role');
    sessionStorage.removeItem('canteen_demo_token');
    setIsDemoUser(false);
    setUserProfile(null);
    setCurrentUser(null);
    setRole('student');
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const switchDemoRole = (targetRole: UserRole) => {
    sessionStorage.setItem('canteen_demo_role', targetRole);
    sessionStorage.setItem('canteen_demo_token', `dev-${targetRole}-token`);
    setIsDemoUser(true);
    setRole(targetRole);

    const profile: UserProfile = {
      uid: `dev-${targetRole}-1`,
      displayName:
        targetRole === 'admin'
          ? 'Campus Admin'
          : targetRole === 'staff'
          ? 'Chef Ramesh (Staff)'
          : 'Aarav Sharma (Student)',
      email: `${targetRole}@canteen.edu`,
      role: targetRole,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role,
        loading,
        login,
        register,
        logout,
        resetPassword,
        switchDemoRole,
        isDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
