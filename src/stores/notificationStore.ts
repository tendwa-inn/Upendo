import { create } from 'zustand';
import { Notification } from '../types';
import { mockNotifications } from '../data/mockData';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: () => {
    // In a real app, you'd fetch this from an API
    set({ 
      notifications: mockNotifications, 
      unreadCount: mockNotifications.filter(n => !n.isRead).length 
    });
  },
  markAsRead: (notificationId) => {
    set((state) => {
      const notifications = state.notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length,
      };
    });
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
