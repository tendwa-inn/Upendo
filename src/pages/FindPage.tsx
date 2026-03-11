import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSwipeStore } from '../stores/swipeStore';

import { useMatchStore } from '../stores/matchStore';
import { useAuthStore } from '../stores/authStore';
import { calculateVisibilityScore } from '../lib/utils';
import SwipeCard from '../components/swipe/SwipeCard';
import FilterModal from '../components/modals/FilterModal';
import { SlidersHorizontal } from 'lucide-react';
import { User } from '../types';
import { mockUsers } from '../data/mockData'; // We will create this file next
import toast from 'react-hot-toast';

const FindPage: React.FC = () => {
  const {
    potentialMatches,
    currentCardIndex,
    swipeLeft,
    swipeRight,
    setPotentialMatches,
    canSwipe,
    getRemainingSwipes,
  } = useSwipeStore();
  const { user: currentUser } = useAuthStore();
  
  const { addMatch } = useMatchStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    // Simulate fetching users and sorting them by visibility score
    setTimeout(() => {
      const sortedUsers = mockUsers.sort((a, b) => calculateVisibilityScore(b) - calculateVisibilityScore(a));
      setPotentialMatches(sortedUsers);
      setIsLoading(false);
    }, 1000);
    toast('You have 50 free swipes for today!', {
      icon: '🎉',
      duration: 4000,
    });
  }, [setPotentialMatches]);



  const handleSwipeRight = (userId: string) => {
    const swipedUser = potentialMatches.find((u) => u.id === userId);
    if (!swipedUser) return;

    swipeRight(userId);

    // Simulate a match (50% chance)
    if (Math.random() > 0.5) {
      toast.success(`You matched with ${swipedUser.name}!`);
      addMatch({
        id: `match-${Date.now()}`,
        user1: mockUsers[0], // Mock current user
        user2: swipedUser,
        timestamp: new Date(),
      });
    }
  };

  // Randomly assign canMessage flag for free users
  const processedMatches = React.useMemo(() => {
    if (currentUser?.subscription === 'free') {
      let filteredUsers = potentialMatches.filter(user => {
        if (filters.ageRange && (user.age < filters.ageRange[0] || user.age > filters.ageRange[1])) return false;
        if (filters.tribe && user.tribe !== filters.tribe) return false;
        return true;
      });
      return filteredUsers.map(u => ({ ...u, canMessage: Math.random() < 0.3 })); // 30% chance
    }
    return potentialMatches;
  }, [potentialMatches, currentUser, filters]);

  const handleSwipeLeft = (userId: string) => {
    swipeLeft(userId);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-white">Loading...</div>;
  }

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-start p-4 pt-8 text-white">
      {/* Header */}
      <div className="w-full max-w-md flex justify-end items-center mb-4 px-2">
        <button onClick={() => setIsFilterModalOpen(true)} className="flex items-center space-x-2 bg-white/10 p-2 rounded-lg">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-full max-w-md flex-grow" style={{ maxHeight: '80vh' }}>
        <AnimatePresence>
          {processedMatches.slice(currentCardIndex).map((user, index) => (
            <SwipeCard
              key={user.id}
              user={user}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              isActive={index === 0}
              canSwipe={canSwipe()}
            />
          ))}
        </AnimatePresence>
        
        {currentCardIndex >= processedMatches.length && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <h2 className="text-2xl font-bold">No more profiles</h2>
              <p className="mt-2">Check back later for more potential matches.</p>
            </div>
          </div>
        )}
      </div>

      <FilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  );
};

export default FindPage;