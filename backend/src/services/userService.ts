import { db } from '../config/firebase';
import { UserProfile, UserRole } from '../types/user';

export class UserService {
  private usersCollection = db.collection('users');

  async getAllUsers(): Promise<UserProfile[]> {
    const snapshot = await this.usersCollection.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => doc.data() as UserProfile);
  }

  async getUserById(uid: string): Promise<UserProfile | null> {
    const doc = await this.usersCollection.doc(uid).get();
    if (!doc.exists) return null;
    return doc.data() as UserProfile;
  }

  async updateUserRole(uid: string, newRole: UserRole): Promise<UserProfile> {
    const docRef = this.usersCollection.doc(uid);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error(`User "${uid}" not found.`);
    }

    const now = new Date().toISOString();
    await docRef.update({
      role: newRole,
      updatedAt: now,
    });

    const updated = await docRef.get();
    return updated.data() as UserProfile;
  }

  async updateUserActive(uid: string, active: boolean): Promise<UserProfile> {
    const docRef = this.usersCollection.doc(uid);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error(`User "${uid}" not found.`);
    }

    const now = new Date().toISOString();
    await docRef.update({
      active,
      updatedAt: now,
    });

    const updated = await docRef.get();
    return updated.data() as UserProfile;
  }

  async registerFcmToken(uid: string, token: string): Promise<void> {
    const docRef = this.usersCollection.doc(uid);
    const doc = await docRef.get();
    if (!doc.exists) return;

    const data = doc.data() as UserProfile;
    const tokens = new Set(data.fcmTokens || []);
    tokens.add(token);

    await docRef.update({
      fcmTokens: Array.from(tokens),
      updatedAt: new Date().toISOString(),
    });
  }
}

export const userService = new UserService();
