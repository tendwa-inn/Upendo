import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { User } from '../../types';
import { Heart, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { cn } from '../../lib/utils';

interface SwipeCardProps {
  user: User;
  onSwipeLeft: (userId: string) => void;
  onSwipeRight: (userId: string) => void;
  isActive: boolean;
  canSwipe: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  user,
  onSwipeLeft,
  onSwipeRight,
  isActive,
  canSwipe,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        onSwipeRight(user.id);
      } else {
        onSwipeLeft(user.id);
      }
    }
  };

  const mutualInterests = (currentUser?.interests || []).filter(interest => (user.interests || []).includes(interest));

  if (!isActive) {
    return null;
  }

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 w-full h-full"
      style={{ x, rotate, opacity }}
      drag={canSwipe ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className={cn(
        'relative w-full h-full rounded-3xl shadow-2xl overflow-hidden',
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      )}>
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={user.photos[0] || 'https://core-normal.traeapi.us/api/ide/v1/text_to_image?prompt=Beautiful%20African%20person%20portrait%20romantic%20soft%20lighting&image_size=portrait_4_3'}
            alt={user.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Top Action Buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <button
            onClick={() => onSwipeLeft(user.id)}
            disabled={!canSwipe}
            className={cn(
              'w-12 h-12 backdrop-blur-lg rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50',
              theme === 'dark' 
                ? 'bg-gray-700/50 text-red-400 hover:bg-gray-600/50'
                : 'bg-white/20 text-red-500 hover:bg-white/30'
            )}
          >
            <X className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => onSwipeRight(user.id)}
            disabled={!canSwipe}
            className={cn(
              'w-12 h-12 backdrop-blur-lg rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50',
              theme === 'dark' 
                ? 'bg-gray-700/50 text-green-400 hover:bg-gray-600/50'
                : 'bg-white/20 text-green-500 hover:bg-white/30'
            )}
          >
            <Heart className="w-6 h-6" fill="currentColor" />
          </button>
        </div>

        {/* User Info */}
        <div className={cn(
          'absolute bottom-20 left-0 right-0 p-6',
          theme === 'dark' ? 'text-gray-200' : 'text-white'
        )}>
          <div className="flex items-center mb-2">
            <h2 className="text-3xl font-bold mr-3 cursor-pointer" onClick={() => navigate(`/user/${user.id}`)}>{user.name}</h2>
            <span className="text-2xl">{user.age}</span>
            {user.isVerified && (
              <div className={cn(
                'ml-2 w-6 h-6 rounded-full flex items-center justify-center',
                theme === 'dark' ? 'bg-gray-600' : 'bg-blue-500'
              )}>
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center mb-3">
            <span className={cn(
              'text-lg',
              theme === 'dark' ? 'text-gray-300' : 'opacity-90'
            )}>
              {user.location.city} • {Math.floor(Math.random() * 15) + 1}km away
            </span>
          </div>
          
          <p className={cn(
            'text-lg leading-relaxed',
            theme === 'dark' ? 'text-gray-300' : 'opacity-90'
          )}>
            {user.bio}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {user.hereFor.map(purpose => (
              <span key={purpose} className="px-3 py-1 rounded-full text-sm bg-purple-600/20 text-purple-300 backdrop-blur-sm">
                {purpose}
              </span>
            ))}
          </div>

          {mutualInterests.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-sm text-green-400 mb-2">You both like</h4>
              <div className="flex flex-wrap gap-2">
                {mutualInterests.map(interest => (
                  <span key={interest} className="px-3 py-1 rounded-full text-sm bg-green-600/20 text-green-300 backdrop-blur-sm">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
