import React from 'react';
import { User } from '../types';
import { useAuthStore } from '../stores/authStore';
import { Lock, Eye, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserListItemProps {
  user: User;
  type: 'view' | 'like';
  onLikeBack?: (userId: string) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, type, onLikeBack }) => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const isPremium = profile?.account_type === 'pro' || profile?.account_type === 'vip';
  const isFree = !isPremium;

  const handleClick = () => {
    if (isPremium) {
      navigate(`/user/${user.id}`);
    }
  };

  const handleLikeBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLikeBack) {
      onLikeBack(user.id);
    }
  };

  return (
    <div 
      className={`bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-3 ${
        isPremium ? 'cursor-pointer hover:bg-white/20' : 'cursor-not-allowed'
      } transition-all duration-200`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        {/* Profile Picture */}
        <div className="relative">
          {isFree ? (
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
          ) : (
            <img 
              src={user.photos?.[0] || '/placeholder-avatar.png'} 
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          {isFree && (
            <div className="absolute -top-1 -right-1 bg-pink-500 rounded-full p-1">
              {type === 'view' ? <Eye className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          {isFree ? (
            <div>
              <h3 className="font-semibold text-lg">
                {type === 'view' ? 'Someone viewed you' : 'Someone liked you'}
              </h3>
              <p className="text-sm text-white/60">
                Upgrade to {profile?.account_type === 'free' ? 'Pro or VIP' : 'see who'}
              </p>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-sm text-white/70">{user.age} years old</p>
              {user.bio && (
                <p className="text-xs text-white/60 mt-1 line-clamp-2">{user.bio}</p>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        {type === 'like' && isPremium && (
          <button
            onClick={handleLikeBack}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Like Back
          </button>
        )}
      </div>
    </div>
  );
};

export default UserListItem;