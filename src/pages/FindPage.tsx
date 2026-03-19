import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSwipeStore } from '../stores/swipeStore';
import { useMatchStore } from '../stores/matchStore';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { useNotificationStore } from '../stores/notificationStore';
import { calculateVisibilityScore } from '../lib/utils';
import SwipeCard from '../components/swipe/SwipeCard';
import FilterModal from '../components/modals/FilterModal';
import { SlidersHorizontal, Bell } from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { Link } from 'react-router-dom';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader';

const FindPage: React.FC = () => {
  const {
    potentialMatches,
    currentCardIndex,
    swipeLeft,
    swipeRight,
    rewind,
    fetchPotentialMatches,
    canSwipe,
    outOfSwipesAt,
    replenishmentStage,
  } = useSwipeStore();
  const { user: currentUser } = useAuthStore();
  const { createMatch, matches } = useMatchStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [isInterstitialVisible, setIsInterstitialVisible] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { buttonStyle } = useUiStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchPotentialMatches();
      setIsLoading(false);
    };
    loadData();
  }, [fetchPotentialMatches]);

  const handleSwipe = () => {
    setCurrentPhotoIndex(0);
  };

  const handleSwipeRight = (userId: string) => {
    if (isInterstitialVisible) return;
    const swipedUser = potentialMatches.find((u) => u.id === userId);
    if (!swipedUser || !currentUser) return;

    swipeRight(userId);
    setIsInterstitialVisible(true);
    setTimeout(() => {
      handleSwipe();
      setIsInterstitialVisible(false);
      if (Math.random() < 0.5) { // Simplified 50% match chance
        createMatch(swipedUser.id);
        toast.success(`You matched with ${swipedUser.name}!`);
      }
    }, 1000);
  };

  const handleSwipeLeft = (userId: string) => {
    if (isInterstitialVisible) return;
    swipeLeft(userId);
    setIsInterstitialVisible(true);
    setTimeout(() => {
      handleSwipe();
      setIsInterstitialVisible(false);
    }, 1000);
  };

  const processedMatches = React.useMemo(() => {
    let filteredUsers = potentialMatches.filter(user => {
      if (filters.ageRange && (user.age < filters.ageRange[0] || user.age > filters.ageRange[1])) return false;
      if (filters.tribe && user.tribe !== filters.tribe) return false;
      return true;
    });
    if (currentUser?.subscription === 'free') {
      return filteredUsers.map(u => ({ ...u, canMessage: Math.random() < 0.3 }));
    }
    return filteredUsers;
  }, [potentialMatches, currentUser, filters]);

  const getNextReplenishmentTime = () => {
    if (!outOfSwipesAt || replenishmentStage > 3) return null;

    const replenishmentHours = [2, 8, 10];
    const stageIndex = replenishmentStage - 1;
    
    if (stageIndex >= replenishmentHours.length) return null;

    const replenishmentTime = new Date(outOfSwipesAt.getTime() + replenishmentHours[stageIndex] * 60 * 60 * 1000);
    return replenishmentTime;
  };

  const [timeToNext, setTimeToNext] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const nextTime = getNextReplenishmentTime();
      if (nextTime) {
        const diff = nextTime.getTime() - new Date().getTime();
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeToNext(`${hours}h ${minutes}m`);
        } else {
          setTimeToNext('Now!');
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [outOfSwipesAt, replenishmentStage]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-white bg-gradient-to-b from-[#22090E] to-[#2E0C13]">Loading...</div>;
  }

  if (!currentUser?.photos || currentUser.photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white bg-gradient-to-b from-[#22090E] to-[#2E0C13]">
        <h2 className="text-2xl font-bold mb-4">Upload Photos to Continue</h2>
        <p className="mb-8">You need to upload at least one photo to start seeing matches.</p>
        <ProfilePhotoUploader />
      </div>
    );
  }

  const handleApplyFilters = (newFilters: any) => setFilters(newFilters);
  const handleBoost = () => console.log("Boost action");

  const currentMatch = processedMatches[currentCardIndex];

  return (
    <div className="relative h-screen w-screen text-white bg-gradient-to-b from-[#22090E] to-[#2E0C13]">
      {/* Background logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img src="/Logo white.png" alt="Upendo Logo" className="w-3/4 h-3/4 object-contain opacity-5" />
      </div>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 w-full max-w-md mx-auto flex justify-between items-center p-4 pt-safe-top">
        <button onClick={() => setIsFilterModalOpen(true)} className="p-2"><SlidersHorizontal className="w-6 h-6" /></button>
        <h1 className="text-2xl font-bold">Find</h1>
        <Link to="/notifications" className="p-2 relative">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-pink-500 rounded-full text-xs flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </Link>
      </div>

      {/* Photo Progress */}
      {currentMatch && (
        <div className="absolute bottom-20 left-4 right-4 z-20 flex space-x-1">
          {currentMatch.photos.map((_, index) => (
            <div key={index} className="h-1.5 flex-1 rounded-full bg-white/30 backdrop-blur-sm">
              <motion.div
                className={`h-full rounded-full ${buttonStyle === 'white-clean' ? 'bg-white' : 'bg-yellow-500'}`}
                initial={{ width: '0%' }}
                animate={{ width: index === currentPhotoIndex ? '100%' : '0%' }}
                transition={{ duration: 0.2, ease: 'linear' }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-0">
        <AnimatePresence>
          {!isInterstitialVisible && processedMatches.slice(currentCardIndex).map((user, index) => (
            <SwipeCard
              key={user.id}
              user={user}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onRewind={rewind}
              onBoost={handleBoost}
              isActive={index === 0}
              canSwipe={canSwipe()}
              currentPhotoIndex={currentPhotoIndex}
              setCurrentPhotoIndex={setCurrentPhotoIndex}
            />
          ))}
        </AnimatePresence>
        
        {currentCardIndex >= processedMatches.length && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="mt-64">
              <h2 className="text-2xl font-bold">No more profiles</h2>
              {currentUser?.subscription === 'free' && outOfSwipesAt && replenishmentStage <= 3 && (
                <p className="mt-2">Next swipes in: {timeToNext}</p>
              )}
              <p className="mt-2">Check back later for more potential matches.</p>
            </div>
          </div>
        )}
      </div>

      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleApplyFilters} />
    </div>
  );
};

export default FindPage;
