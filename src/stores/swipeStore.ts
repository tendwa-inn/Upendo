import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { User, SwipeStats } from '../types';
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
  fetchPotentialMatches: () => Promise<void>;
  swipeLeft: (userId: string) => Promise<void>;
  swipeRight: (userId: string) => Promise<void>;
  lastActivity: Date;
  rewind: () => void;
  resetDailySwipes: () => void;
  canSwipe: () => boolean;
  getRemainingSwipes: () => number;
  checkAndReplenishSwipes: () => void;
}

export const useSwipeStore = create<SwipeState>((set, get) => ({
  potentialMatches: [],
  currentCardIndex: 0,
  swipeStats: {
    likes: 0,
    passes: 0,
    matches: 0,
  },
  isSwiping: false,
  likedIds: new Set(),
  rewindCount: 5,
  lastRewindReset: new Date(),
  outOfSwipesAt: null,
  replenishmentStage: 0,
  lastActivity: new Date(),

  fetchPotentialMatches: async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('Error fetching potential matches:', error);
      return;
    }
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      const filteredData = data.filter(u => u.id !== currentUser.id);
      set({ potentialMatches: filteredData, currentCardIndex: 0 });
    }
  },

  swipeLeft: async (userId) => {
    const { currentCardIndex, swipeStats } = get();
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const { error } = await supabase.from('swipes').insert({ 
      swiper_id: currentUser.id,
      swiped_id: userId,
      direction: 'left',
    });

    if (error) {
      toast.error('Something went wrong.');
      return;
    }

    set({
      currentCardIndex: currentCardIndex + 1,
      swipeStats: {
        ...swipeStats,
        passes: swipeStats.passes + 1,
      },
      lastActivity: new Date(),
    });
  },

  swipeRight: async (userId) => {
    const { currentCardIndex, swipeStats, likedIds } = get();
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const { error } = await supabase.from('swipes').insert({ 
      swiper_id: currentUser.id,
      swiped_id: userId,
      direction: 'right',
    });

    if (error) {
      toast.error('Something went wrong.');
      return;
    }
    
    const newLikedIds = new Set(likedIds);
    newLikedIds.add(userId);

    set({
      currentCardIndex: currentCardIndex + 1,
      swipeStats: {
        ...swipeStats,
        likes: swipeStats.likes + 1,
      },
      likedIds: newLikedIds,
    });
  },

  rewind: () => {
    const { currentCardIndex, rewindCount, lastRewindReset } = get();
    const user = useAuthStore.getState().user;
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (user?.subscription === 'free') {
      if (now.getTime() - lastRewindReset.getTime() > oneWeek) {
        set({ rewindCount: 5, lastRewindReset: now });
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
    console.log('Resetting daily swipes (not implemented)');
  },

  canSwipe: () => {
    return true; // Simplified
  },

  getRemainingSwipes: () => {
    return 99; // Simplified
  },

  checkAndReplenishSwipes: () => {
    const { outOfSwipesAt, replenishmentStage } = get();
    const user = useAuthStore.getState().user;
    if (!outOfSwipesAt || user?.subscription !== 'free') return;

    const now = new Date();
    const hoursPassed = (now.getTime() - outOfSwipesAt.getTime()) / (1000 * 60 * 60);

    if (hoursPassed >= 24) {
      set({ outOfSwipesAt: null, replenishmentStage: 0 });
      toast.success("Your swipes have been fully replenished!");
    } else if (hoursPassed >= 12 && replenishmentStage < 2) {
      set({ replenishmentStage: 2 });
      toast.success("You have 25 more swipes!");
    } else if (hoursPassed >= 6 && replenishmentStage < 1) {
      set({ replenishmentStage: 1 });
      toast.success("You have 10 more swipes!");
    }
  },
}));
