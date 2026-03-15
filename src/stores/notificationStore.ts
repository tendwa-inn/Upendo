import { create } from 'zustand';
import { Notification } from '../types';
import { mockUsers } from '../data/mockData';

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'profile-view',
    isRead: false,
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    message: 'Amina viewed your profile.',
    relatedUser: mockUsers[0],
    link: '/user/1',
  },
  {
    id: 'notif-2',
    type: 'new-like',
    isRead: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    message: 'Kwame liked your profile!',
    relatedUser: mockUsers[1],
    link: '/user/2',
  },
  {
    id: 'notif-3',
    type: 'new-message',
    isRead: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    message: 'You have a new message from Amina.',
    relatedUser: mockUsers[0],
    link: '/chat',
  },
  {
    id: 'notif-4',
    type: 'swipe-refresh',
    isRead: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    message: 'Your daily swipes have been refreshed. You have 50 new swipes.',
  },
  {
    id: 'notif-5',
    type: 'report-feedback',
    isRead: true,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    message: "Thank you for your report. We have taken action on the user's profile.",
  },
];

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
