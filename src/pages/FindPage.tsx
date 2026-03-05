import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSwipeStore } from '../stores/swipeStore';
import { useMatchStore } from '../stores/matchStore';
import SwipeCard from '../components/swipe/SwipeCard';
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
  
  const { addMatch } = useMatchStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching users
    setTimeout(() => {
      setPotentialMatches(mockUsers);
      setIsLoading(false);
    }, 1000);
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

  const handleSwipeLeft = (userId: string) => {
    swipeLeft(userId);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-white">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-sm h-[70vh]">
        <AnimatePresence>
          {potentialMatches.slice(currentCardIndex).map((user, index) => (
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
      </div>
      
      {currentCardIndex >= potentialMatches.length && (
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold">No more profiles</h2>
          <p className="mt-2">Check back later for more potential matches.</p>
        </div>
      )}

      <div className="absolute bottom-24 text-white text-lg font-bold">
        Swipes Remaining: {getRemainingSwipes()}
      </div>
    </div>
  );
};

export default FindPage;