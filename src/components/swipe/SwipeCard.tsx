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

  const formatDistance = (distanceInMeters) => {
    if (distanceInMeters === null || typeof distanceInMeters === 'undefined') return null;
    return `${(distanceInMeters / 1000).toFixed(1)}km away`;
  };

  const distance = formatDistance(user.distance_meters);

  const formatHeight = (cm) => {
    if (!cm) return null;
    const inches = cm / 2.54;
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    return `${feet}'${remainingInches}" (${cm}cm)`;
  };

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

  const nextPhoto = () => {
    if (user.photos && user.photos.length > 0) {
      setCurrentPhotoIndex(prev => Math.min(prev + 1, user.photos.length - 1));
    }
  };
  const prevPhoto = () => setCurrentPhotoIndex(prev => Math.max(prev - 1, 0));

  const mutualInterests = (currentUser?.interests || []).filter(interest => (user.interests || []).includes(interest));

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
            <button
              onClick={() => onSwipeRight(user.id)}
              onMouseDown={() => handlePressStart('play')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('play')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <Play 
                className={`w-10 h-10 ${activeButton === 'play' ? 'text-green-500' : 'text-white'}`} 
                strokeWidth={2.5}
              />
              <span className={activeButton === 'play' ? 'text-green-500' : 'text-white'}>PLAY</span>
            </button>
            <button
              onClick={() => onSwipeLeft(user.id)}
              onMouseDown={() => handlePressStart('wind')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('wind')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <FastForward 
                className={`w-10 h-10 ${activeButton === 'wind' ? 'text-red-500' : 'text-white'}`} 
                strokeWidth={2.5}
              />
              <span className={activeButton === 'wind' ? 'text-red-500' : 'text-white'}>WIND</span>
            </button>
            <button
              onClick={onRewind}
              onMouseDown={() => handlePressStart('rewind')}
              onMouseUp={handlePressEnd}
              onTouchStart={() => handlePressStart('rewind')}
              onTouchEnd={handlePressEnd}
              className="flex flex-col items-center text-white font-bold text-xs space-y-1"
            >
              <Rewind 
                className={`w-10 h-10 ${activeButton === 'rewind' ? 'text-yellow-500' : 'text-white'}`} 
                strokeWidth={2.5}
              />
              <span className={activeButton === 'rewind' ? 'text-yellow-500' : 'text-white'}>REWIND</span>
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
                className={`w-10 h-10 ${activeButton === 'boost' ? 'text-blue-500' : 'text-white'}`} 
                strokeWidth={2.5}
              />
              <span className={activeButton === 'boost' ? 'text-blue-500' : 'text-white'}>BOOST</span>
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
          src={(user.photos && user.photos[currentPhotoIndex]) || 'https://placehold.co/600x800'}
          alt={user.name || 'User'}
          className="w-full h-full object-cover"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/80 to-transparent" />

        {renderButtons()}

        <div className="absolute bottom-28 left-0 right-0 p-5 pr-24 text-white z-10">
          <div className="mb-4">
            <h2 className="text-3xl font-bold cursor-pointer" onClick={() => navigate(`/user/${user.id}`)}>{user.name || 'User'}, {user.age || ''}</h2>
            {distance && (
              <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1">
                <MapPin size={14} />
                <span>{distance}</span>
              </div>
            )}
            <div className="text-gray-300 mt-1">
              <p className={`text-white mt-2 text-base ${!isBioExpanded && 'line-clamp-2'}`}>{user.bio || ''}</p>
              {user.bio && user.bio.length > 100 && (
                <button onClick={() => setIsBioExpanded(!isBioExpanded)} className="text-gray-400 text-sm font-semibold mt-1 hover:underline">
                  {isBioExpanded ? 'See less' : 'See more'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {user.relationship_intent && (
              <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-pink-500/20 text-pink-300">{user.relationship_intent}</span>
              </div>
            )}

            {mutualInterests.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/70 mb-2">Mutual Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {mutualInterests.map(interest => (
                      <span key={interest} className="px-3 py-1 rounded-full text-sm font-semibold bg-white/10 text-white/80">{interest}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {user.kids && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300">{user.kids}</span>
              )}
              {user.occupation && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-300">{user.occupation}</span>
              )}
              {user.religion && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-300">{user.religion}</span>
              )}
              {user.first_date && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-300">{user.first_date}</span>
              )}
              {user.height && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-500/20 text-red-300">{formatHeight(user.height)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
