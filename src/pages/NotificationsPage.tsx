import React, { useEffect } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import NotificationItem from '../components/notifications/NotificationItem';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, fetchNotifications, markAllAsRead, clearAll } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="bg-stone-900 text-white min-h-screen">
      <div className="p-4 pt-safe-top border-b border-white/10 flex items-center justify-between">
        <Link to="/find" className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="w-8"></div>
      </div>

      <div className="p-4 flex justify-between items-center">
        <button onClick={markAllAsRead} className="text-sm text-pink-500 font-semibold">Mark all as read</button>
        <button onClick={clearAll} className="text-sm text-gray-400">Clear all</button>
      </div>

      <div className="space-y-2">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        ) : (
          <p className="text-center text-gray-400 mt-8">No notifications yet.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
