export type UserRole = 'student' | 'staff' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  active: boolean;
  fcmTokens?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthenticatedUser {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
}
