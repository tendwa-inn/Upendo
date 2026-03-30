import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';
import { useDiscoveryStore } from './discoveryStore';
import { useMatchStore } from './matchStore';

interface SwipeState {
  swipeCount: number;
  lastSwipeAt: Date | null;
  swipeRight: (likedUserId: string) => Promise<{ matched: boolean }>;
  swipeLeft: (swipedUserId: string) => Promise<void>;
  loadSwipeState: () => void;
}

const SWIPE_LIMIT = 5; // Daily swipe limit for free users

export const useSwipeStore = create<SwipeState>((set, get) => ({
  swipeCount: 0,
  lastSwipeAt: null,

  loadSwipeState: () => {
    const savedState = localStorage.getItem('swipeState');
    if (savedState) {
      const { swipeCount, lastSwipeAt } = JSON.parse(savedState);
      const lastSwipeDate = new Date(lastSwipeAt);
      const now = new Date();

      // Reset swipe count if it's a new day
      if (now.getDate() !== lastSwipeDate.getDate() || now.getMonth() !== lastSwipeDate.getMonth() || now.getFullYear() !== lastSwipeDate.getFullYear()) {
        set({ swipeCount: 0, lastSwipeAt: now });
      } else {
        set({ swipeCount, lastSwipeAt: lastSwipeDate });
      }
    }
  },

  swipeRight: async (likedUserId) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return { matched: false };

    // Check swipe limit for free users
    if (currentUser.subscription_tier === 'free') {
      const { swipeCount, lastSwipeAt } = get();
      const now = new Date();
      if (lastSwipeAt && now.getDate() === lastSwipeAt.getDate() && swipeCount >= SWIPE_LIMIT) {
        console.log('Daily swipe limit reached.');
        return { matched: false };
      }
      const newSwipeCount = lastSwipeAt?.getDate() === now.getDate() ? swipeCount + 1 : 1;
      set({ swipeCount: newSwipeCount, lastSwipeAt: now });
      localStorage.setItem('swipeState', JSON.stringify({ swipeCount: newSwipeCount, lastSwipeAt: now }));
    }

    // Record the like
    const { error: likeError } = await supabase.from('likes').upsert({ liker_id: currentUser.id, liked_id: likedUserId }, { onConflict: 'liker_id,liked_id' });
    if (likeError) {
      console.error('Error recording like:', likeError);
      return { matched: false };
    }

    // Check for a mutual like
    const { data: mutualLike, error: mutualLikeError } = await supabase
      .from('likes')
      .select('id')
      .eq('liker_id', likedUserId)
      .eq('liked_id', currentUser.id)
      .single();

    if (mutualLike) {
      // It's a match!
      const { createMatch } = useMatchStore.getState();
      await createMatch(likedUserId);
      useDiscoveryStore.getState().removePotentialMatch(likedUserId);
      return { matched: true };
    }

    useDiscoveryStore.getState().removePotentialMatch(likedUserId);
    return { matched: false };
  },

  swipeLeft: async (swipedUserId) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    // We don't need to record left swipes in the DB for this logic, just remove from discovery
    useDiscoveryStore.getState().removePotentialMatch(swipedUserId);
  },
}));
