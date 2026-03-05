import { create } from 'zustand';
import { User, SwipeCard, SwipeStats } from '../types';
import { currentUser } from '../data/mockData';

interface SwipeState {
  potentialMatches: User[];
  currentCardIndex: number;
  swipeStats: SwipeStats;
  isSwiping: boolean;
  
  // Actions
  setPotentialMatches: (users: User[]) => void;
  swipeLeft: (userId: string) => void;
  swipeRight: (userId: string) => void;
  resetDailySwipes: () => void;
  canSwipe: () => boolean;
  getRemainingSwipes: () => number;
}

const calculateMatchScore = (user: User, currentUser: User): number => {
  let score = 0;

  // Tribe similarity
  if (user.tribe && user.tribe === currentUser.tribe) {
    score += 0.25;
  }

  // "Here for" similarity
  const commonPurposes = user.hereFor.filter(p => currentUser.hereFor.includes(p));
  score += commonPurposes.length * 0.1;

  // Interest similarity
  const commonInterests = user.interests.filter(i => currentUser.interests.includes(i));
  score += commonInterests.length * 0.05;

  // Location (already filtered, but could be a factor)
  // For now, we assume all users in potentialMatches are within the distance preference

  return score;
};

export const useSwipeStore = create<SwipeState>((set, get) => ({
  potentialMatches: [],
  currentCardIndex: 0,
  swipeStats: {
    dailySwipes: 0,
    remainingSwipes: 50, // Free users get 50 swipes first day
    lastReset: new Date(),
    totalSwipes: 0,
  },
  isSwiping: false,

  setPotentialMatches: (users) => {
    const sortedUsers = [...users].sort((a, b) => {
      const scoreA = calculateMatchScore(a, currentUser);
      const scoreB = calculateMatchScore(b, currentUser);
      return scoreB - scoreA; // Sort in descending order of score
    });
    set({ potentialMatches: sortedUsers, currentCardIndex: 0 });
  },

  swipeLeft: (userId) => {
    const { currentCardIndex, swipeStats } = get();
    if (swipeStats.remainingSwipes <= 0) return;

    set({
      currentCardIndex: currentCardIndex + 1,
      swipeStats: {
        ...swipeStats,
        dailySwipes: swipeStats.dailySwipes + 1,
        remainingSwipes: swipeStats.remainingSwipes - 1,
        totalSwipes: swipeStats.totalSwipes + 1,
      },
    });
  },

  swipeRight: (userId) => {
    const { currentCardIndex, swipeStats } = get();
    if (swipeStats.remainingSwipes <= 0) return;

    set({
      currentCardIndex: currentCardIndex + 1,
      swipeStats: {
        ...swipeStats,
        dailySwipes: swipeStats.dailySwipes + 1,
        remainingSwipes: swipeStats.remainingSwipes - 1,
        totalSwipes: swipeStats.totalSwipes + 1,
      },
    });
  },

  resetDailySwipes: () => {
    const { swipeStats } = get();
    set({
      swipeStats: {
        ...swipeStats,
        dailySwipes: 0,
        remainingSwipes: 10, // Reset to 10 for subsequent days
        lastReset: new Date(),
      },
    });
  },

  canSwipe: () => {
    const { swipeStats } = get();
    return swipeStats.remainingSwipes > 0;
  },

  getRemainingSwipes: () => {
    const { swipeStats } = get();
    return swipeStats.remainingSwipes;
  },
}));