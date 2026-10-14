import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { db, getMessagingInstance } from '../config/firebase';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
  pushPermissionStatus: NotificationPermission;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pushPermissionStatus, setPushPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Real-time Firestore snapshot listener for persistent notifications
  useEffect(() => {
    if (!userProfile?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: NotificationItem[] = snapshot.docs.map((doc) => doc.data() as NotificationItem);
          setNotifications(list);
          setLoading(false);
        },
        (error) => {
          console.warn('[NotificationContext] Real-time listener fallback to REST API:', error.message);
          // Fallback to REST API polling/fetch
          api
            .getNotifications()
            .then((list) => {
              setNotifications(list);
              setLoading(false);
            })
            .catch(() => setLoading(false));
        }
      );

      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, [userProfile?.uid]);

  const markAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') {
      alert('Your browser does not support web push notifications.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermissionStatus(permission);

      if (permission === 'granted') {
        const messaging = await getMessagingInstance();
        if (messaging) {
          const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
          const token = await getToken(messaging, { vapidKey });
          if (token && userProfile?.uid) {
            await api.registerFcmToken(token);
            console.log('[FCM] Push token registered with backend:', token);
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[FCM] Push registration warning:', err);
      return false;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        requestPushPermission,
        pushPermissionStatus,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
