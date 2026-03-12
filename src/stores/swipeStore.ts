import { create } from 'zustand';
import { User, SwipeCard, SwipeStats } from '../types';
import { currentUser } from '../data/mockData';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

interface SwipeState {
  potentialMatches: User[];
  currentCardIndex: number;
  swipeStats: SwipeStats;
  isSwiping: boolean;
  likedIds: Set<string>;
  rewindCount: number;
  lastRewindReset: Date;
  outOfSwipesAt: Date | null;
  replenishmentStage: number;
  lastActivity: Date;
  
  // Actions
  setPotentialMatches: (users: User[]) => void;
  swipeLeft: (userId: string) => void;
  swipeRight: (userId: string) => void;
  rewind: () => void;
  resetDailySwipes: () => void;
  canSwipe: () => boolean;
  getRemainingSwipes: () => number;
  checkAndReplenishSwipes: () => void;
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
  likedIds: new Set(),
  rewindCount: 5,
  lastRewindReset: new Date(),
  outOfSwipesAt: null,
  replenishmentStage: 0,
  lastActivity: new Date(),

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
      lastActivity: new Date(),
    });

    if (get().swipeStats.remainingSwipes === 0) {
      const user = useAuthStore.getState().user;
      if (user?.subscription === 'free') {
        set({ outOfSwipesAt: new Date(), replenishmentStage: 1 });
      }
    }
  },

  swipeRight: (userId) => {
    const { currentCardIndex, swipeStats, likedIds } = get();
    if (swipeStats.remainingSwipes <= 0) return;

    const newLikedIds = new Set(likedIds);
    newLikedIds.add(userId);

    set({
      currentCardIndex: currentCardIndex + 1,
      swipeStats: {
        ...swipeStats,
        dailySwipes: swipeStats.dailySwipes + 1,
        remainingSwipes: swipeStats.remainingSwipes - 1,
        totalSwipes: swipeStats.totalSwipes + 1,
      },
      likedIds: newLikedIds,
    });

    if (get().swipeStats.remainingSwipes === 0) {
      const user = useAuthStore.getState().user;
      if (user?.subscription === 'free') {
        set({ outOfSwipesAt: new Date(), replenishmentStage: 1 });
      }
    }
  },

  rewind: () => {
    const { currentCardIndex, rewindCount, lastRewindReset } = get();
    const user = useAuthStore.getState().user;
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (user?.subscription === 'free') {
      if (now.getTime() - lastRewindReset.getTime() > oneWeek) {
        set({ rewindCount: 5, lastRewindReset: now });
        // Re-fetch state after update
        const updatedState = get();
        if (updatedState.rewindCount <= 0) {
          toast.error("You have no rewinds left for this week.");
          return;
        }
      } else if (rewindCount <= 0) {
        toast.error("You have no rewinds left for this week.");
        return;
      }
    }

    if (currentCardIndex > 0) {
      set((state) => ({
        currentCardIndex: state.currentCardIndex - 1,
        rewindCount: user?.subscription === 'free' ? state.rewindCount - 1 : state.rewindCount,
      }));
      toast.success('Rewound to the previous profile!');
    } else {
      toast.error("No profiles to rewind to.");
    }
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
    get().checkAndReplenishSwipes();
    const { swipeStats } = get();
    return swipeStats.remainingSwipes > 0;
  },

  getRemainingSwipes: () => {
    const { swipeStats } = get();
    return swipeStats.remainingSwipes;
  },

  checkAndReplenishSwipes: () => {
    const { outOfSwipesAt, replenishmentStage, swipeStats } = get();
    const user = useAuthStore.getState().user;

    if (user?.subscription !== 'free' || !outOfSwipesAt) return;

    const now = new Date();
    const elapsedHours = (now.getTime() - outOfSwipesAt.getTime()) / (1000 * 60 * 60);

    const replenishmentStages = [
      { hours: 2, swipes: 4, stage: 1 },
      { hours: 8, swipes: 4, stage: 2 },
      { hours: 10, swipes: 4, stage: 3 },
    ];

    for (const stage of replenishmentStages) {
      if (replenishmentStage === stage.stage && elapsedHours >= stage.hours) {
        set({
          swipeStats: {
            ...swipeStats,
            remainingSwipes: swipeStats.remainingSwipes + stage.swipes,
          },
          replenishmentStage: stage.stage + 1,
        });
        toast.success(`You have received ${stage.swipes} new swipes!`)
      }
    }
    if (replenishmentStage > 3) {
      set({ outOfSwipesAt: null, replenishmentStage: 0 });
    }
  },
}));