import { create } from 'zustand';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';
import { useAuthStore } from './authStore';
import { supabase } from '../lib/supabaseClient';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const notifications = await notificationService.getNotifications(user.id);
    set({ notifications, unreadCount: notifications.filter(n => !n.is_read).length });
  },

  markAsRead: async (notificationId) => {
    await notificationService.markAsRead(notificationId);
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ),
      unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
    }));
  },

  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));

// Real-time listener for new notifications
const user = useAuthStore.getState().user;
if (user) {
  supabase
    .channel(`notifications:${user.id}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
      useNotificationStore.getState().addNotification(payload.new as Notification);
    })
    .subscribe();
}
