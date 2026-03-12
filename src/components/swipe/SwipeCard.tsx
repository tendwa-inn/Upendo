import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { User } from '../../types';
import { Heart, X, Undo2, Zap, MapPin, Play, FastForward, Rewind } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';

interface SwipeCardProps {
  user: User;
  onSwipeLeft: (userId: string) => void;
  onSwipeRight: (userId: string) => void;
  onRewind: () => void;
  onBoost: () => void;
  isActive: boolean;
  canSwipe: boolean;
  currentPhotoIndex: number;
  setCurrentPhotoIndex: React.Dispatch<React.SetStateAction<number>>;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  user,
  onSwipeLeft,
  onSwipeRight,
  onRewind,
  onBoost,
  isActive,
  canSwipe,
  currentPhotoIndex,
  setCurrentPhotoIndex,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { buttonStyle } = useUiStore();
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const handlePressStart = (button: string) => setActiveButton(button);
  const handlePressEnd = () => setActiveButton(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) onSwipeRight(user.id);
      else onSwipeLeft(user.id);
    }
  };

  const nextPhoto = () => setCurrentPhotoIndex(prev => Math.min(prev + 1, user.photos.length - 1));
  const prevPhoto = () => setCurrentPhotoIndex(prev => Math.max(prev - 1, 0));

  const mutualInterests = (currentUser?.interests || []).filter(interest => user.interests.includes(interest));

  if (!isActive) return null;

  const renderButtons = () => {
    switch (buttonStyle) {
      case 'white-clean':
        return (
          <div className="absolute top-1/2 -translate-y-1/2 right-5 flex flex-col items-center space-y-6 z-20">
            <button
              onClick={() => onSwipeRight(user.id)}
              onMouseDown={() => handlePressStart('like')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('like')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <Heart
                className="w-10 h-10"
                fill={activeButton === 'like' ? '#ec4899' : 'white'}
                color={activeButton === 'like' ? '#ec4899' : 'white'}
              />
              <span>LIKE</span>
            </button>
            <button
              onClick={() => onSwipeLeft(user.id)}
              onMouseDown={() => handlePressStart('nope')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('nope')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <X className={`w-10 h-10 ${activeButton === 'nope' ? 'text-red-500' : 'text-white'}`} strokeWidth={2.5} />
              <span>NOPE</span>
            </button>
            <button
              onClick={onRewind}
              onMouseDown={() => handlePressStart('rewind')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('rewind')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <Undo2 className={`w-10 h-10 ${activeButton === 'rewind' ? 'text-yellow-500' : 'text-white'}`} strokeWidth={2.5} />
              <span>REWIND</span>
            </button>
            <button
              onClick={onBoost}
              onMouseDown={() => handlePressStart('boost')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('boost')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <Zap 
                className="w-10 h-10"
                fill={activeButton === 'boost' ? '#3b82f6' : 'white'}
                color={activeButton === 'boost' ? '#3b82f6' : 'white'} 
                strokeWidth={2.5}
              />
              <span>BOOST</span>
            </button>
          </div>
        );
      case 'vintage':
        return (
          <div className="absolute top-1/2 -translate-y-1/2 right-5 flex flex-col items-center space-y-6 z-20">
            <button onClick={() => onSwipeRight(user.id)} className="flex flex-col items-center text-white font-bold text-xs space-y-1">
              <Play className="w-10 h-10" />
              <span>LIKE</span>
            </button>
            <button onClick={() => onSwipeLeft(user.id)} className="flex flex-col items-center text-white font-bold text-xs space-y-1">
              <FastForward className="w-10 h-10" />
              <span>NOPE</span>
            </button>
            <button onClick={onRewind} className="flex flex-col items-center text-white font-bold text-xs space-y-1">
              <Rewind className="w-10 h-10" />
              <span>REWIND</span>
            </button>
            <button onClick={onBoost} className="flex flex-col items-center text-white font-bold text-xs space-y-1">
              <Zap className="w-10 h-10" />
              <span>BOOST</span>
            </button>
          </div>
        );
      case 'upendo-color':
      default:
        return (
          <div className="absolute top-1/2 -translate-y-1/2 right-5 flex flex-col items-center space-y-6 z-20">
            <button onClick={() => onSwipeRight(user.id)} className="flex flex-col items-center text-white font-bold text-xs space-y-1">
              <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6" fill="white" />
              </div>
              <span>LIKE</span>
            </button>
            <button onClick={() => onSwipeLeft(user.id)} className="flex flex-col items-center text-white font-bold text-xs space-y-1">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                <X className="w-6 h-6" />
              </div>
              <span>NOPE</span>
            </button>
            <button onClick={onRewind} className="flex flex-col items-center text-white font-bold text-xs space-y-1">
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg">
                <Undo2 className="w-6 h-6" />
              </div>
              <span>REWIND</span>
            </button>
            <button onClick={onBoost} className="flex flex-col items-center text-white font-bold text-xs space-y-1">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6" />
              </div>
              <span>BOOST</span>
            </button>
          </div>
        );
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 w-full h-full"
      style={{ x, rotate, opacity }}
      drag
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      initial={{ scale: 1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 50 }}
    >
      <div className="relative w-full h-full shadow-2xl overflow-hidden bg-gray-900">
        {/* Photo Navigation */}
        <div className="absolute top-0 left-0 right-0 bottom-24 z-10 flex h-auto">
          <div className="w-1/2 h-full" onClick={prevPhoto} />
          <div className="w-1/2 h-full" onClick={nextPhoto} />
        </div>

        <motion.img
          key={currentPhotoIndex}
          src={user.photos[currentPhotoIndex] || 'https://via.placeholder.com/600x800'}
          alt={user.name}
          className="w-full h-full object-cover"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/80 to-transparent" />

        {renderButtons()}

        <div className="absolute bottom-28 left-0 right-0 p-5 pr-24 text-white z-10">
          <div className="mb-4">
            <h2 className="text-3xl font-bold cursor-pointer" onClick={() => navigate(`/user/${user.id}`)}>{user.name}, {user.age}</h2>
            <div className="text-gray-300 mt-1">
              <p className={`text-white mt-2 text-base ${!isBioExpanded && 'line-clamp-2'}`}>{user.bio}</p>
              {user.bio.length > 100 && (
                <button onClick={() => setIsBioExpanded(!isBioExpanded)} className="text-gray-400 text-sm font-semibold mt-1 hover:underline">
                  {isBioExpanded ? 'See less' : 'See more'}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {user.hereFor.map(purpose => (
              <span key={purpose} className={`px-3 py-1.5 rounded-full text-xs font-bold ${purpose === 'Serious Relationship' ? 'bg-pink-500/80' : 'bg-black/30'}`}>
                {purpose}
              </span>
            ))}
            {user.tribe && (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/80">
                {user.tribe}
              </span>
            )}
          </div>

          {mutualInterests.length > 0 && (
            <div className="mb-5">
              <h3 className="font-bold text-sm mb-2">Mutual Interests</h3>
              <div className="flex flex-wrap gap-2">
                {mutualInterests.map(interest => (
                  <span key={interest} className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/80">
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
