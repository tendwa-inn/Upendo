import React from 'react';
import { Notification } from '../../types';
import { useNotificationStore } from '../../stores/notificationStore';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import upendoLogo from '/upendo-logo.png'; // Import the logo
import logoSplash from '../../../Splashscreen/Logo Splash.png';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  if (!notification || !notification.message) {
    return null;
  }
  const { user: currentUser, profile } = useAuthStore();

  const { markAsRead } = useNotificationStore();
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'profile_view':
      case 'new_like':
        if (notification.actor?.id) {
          navigate(`/user/${notification.actor.id}`);
        }
        break;
      case 'new_message':
        if (notification.actor?.id) {
          navigate(`/chat/${notification.actor.id}`);
        }
        break;
      // For system messages or promos, you might want to navigate to a specific screen
      // or do nothing. For now, we do nothing.
      case 'system_message':
      case 'promo_redemption':
      default:
        break;
    }

    onClick?.();
  };

  // Correctly check for premium status using account_type
  const isPremium = profile?.account_type === 'pro' || profile?.account_type === 'vip';

  const renderContent = () => {
    // Use the new isPremium flag
    switch (notification.type) {
      case 'profile_view':
        if (isPremium) {
          return <p><span className="font-bold">{notification.actor.name}</span> viewed your profile.</p>;
        } else {
          return <button onClick={(e) => { e.preventDefault(); /* Open upgrade modal */ }} className="text-pink-400 hover:underline">Someone viewed your profile. Upgrade to see who!</button>;
        }
      case 'new_like':
        if (isPremium) {
          return <p><span className="font-bold">{notification.actor.name}</span> liked your profile!</p>;
        } else {
          return <button onClick={(e) => { e.preventDefault(); /* Open upgrade modal */ }} className="text-pink-400 hover:underline">Someone liked you! Upgrade to see who!</button>;
        }
      case 'system_message':
        return notification.message;
      case 'promo_redemption':
        return notification.message; // Display the message from the DB
      default:
        return notification.message || 'New notification';
    }
  };

  const link = notification.type === 'profile_view' || notification.type === 'new_like' ? `/user/${notification.actor?.id}` : '#';

  const imageSrc = notification.type === 'promo_redemption' || notification.type === 'system_message' 
    ? upendoLogo 
    : notification.actor?.photos?.[0] || 'https://placehold.co/150';

  const imageAlt = notification.type === 'promo_redemption' || notification.type === 'system_message'
    ? 'Upendo Logo'
    : notification.actor?.name || 'User';

  return (
    <div onClick={handleNotificationClick} className={`block p-4 border-b border-white/10 ${!notification.is_read ? 'bg-white/10' : 'bg-transparent'} hover:bg-white/20 transition-colors duration-200 cursor-pointer`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          <img 
            className={`w-10 h-10 rounded-full object-cover ${(!isPremium && (notification.type === 'profile_view' || notification.type === 'new_like')) ? 'filter blur-sm' : ''}`}
            src={imageSrc} 
            alt={imageAlt} 
          />
        </div>
        <div className="flex-1 text-white">
          <div className="text-sm">{renderContent()}</div>
          <span className="text-xs text-white/50 mt-1">
            {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
