import React from 'react';
import { Notification } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';
import { User, MessageCircle, Eye, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import SafeImage from '../common/SafeImage';

interface NotificationItemProps {
  notification: Notification;
}

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  switch (type) {
    case 'profile-view': return <Eye className="w-5 h-5 text-blue-400" />;
    case 'new-like': return <User className="w-5 h-5 text-pink-400" />;
    case 'new-message': return <MessageCircle className="w-5 h-5 text-green-400" />;
    case 'report-feedback': return <ShieldCheck className="w-5 h-5 text-gray-400" />;
    case 'swipe-refresh': return <Sparkles className="w-5 h-5 text-yellow-400" />;
    case 'account-issue': return <AlertTriangle className="w-5 h-5 text-red-400" />;
    default: return null;
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { user } = useAuthStore();
  const isFreeTier = user?.subscription === 'free';
  const isPremiumAction = notification.type === 'profile-view' || notification.type === 'new-like';
  const shouldBlur = isFreeTier && isPremiumAction;

  let message = notification.message;
  if (shouldBlur) {
    if (notification.type === 'profile-view') {
      message = 'Someone viewed your profile';
    } else if (notification.type === 'new-like') {
      message = 'Someone liked your profile';
    }
  }

  const content = (
    <div className={`flex items-start space-x-4 p-4 ${!notification.isRead ? 'bg-white/5' : ''}`}>
      <div className="relative">
        {notification.relatedUser ? (
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <SafeImage 
              src={notification.relatedUser.photos[0]} 
              alt={shouldBlur ? 'A potential match' : notification.relatedUser.name} 
              className={`w-full h-full object-cover ${shouldBlur ? 'blur-sm' : ''}`} 
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <NotificationIcon type={notification.type} />
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm">
          {message}
        </p>
        <span className="text-xs text-gray-400 mt-1">
          {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {shouldBlur && (
        <button className="text-xs bg-pink-500 text-white px-2 py-1 rounded-full font-semibold">
          Unlock
        </button>
      )}
    </div>
  );

  const link = shouldBlur ? '/premium' : notification.link;

  return link ? <Link to={link}>{content}</Link> : content;
};

export default NotificationItem;
