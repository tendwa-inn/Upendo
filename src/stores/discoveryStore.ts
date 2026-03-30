import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';

interface DiscoveryState {
  potentialMatches: any[];
  fetchPotentialMatches: () => Promise<void>;
  removePotentialMatch: (userId: string) => void;
}

const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  potentialMatches: [],

  fetchPotentialMatches: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      console.log('User not available, skipping fetch.');
      return;
    }

    const { data, error } = await supabase.rpc('find_profiles_near_user', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('Error fetching nearby users:', error);
      set({ potentialMatches: [] });
      return;
    }

    const matchesWithDistance = data ? data.map(p => ({
      ...p,
      distance: p.distance_meters,
    })) : [];

    set({ potentialMatches: matchesWithDistance });
  },

  removePotentialMatch: (userId: string) => {
    set(state => ({
      potentialMatches: state.potentialMatches.filter(match => match.id !== userId),
    }));
  },
}));

// Subscribe to the auth store to reactively fetch matches when the profile is ready
useAuthStore.subscribe((state, prevState) => {
  // Fetch matches when the profile is first loaded with a location
  if (state.profile?.location && !prevState.profile?.location) {
    useDiscoveryStore.getState().fetchPotentialMatches();
  }
});

export { useDiscoveryStore };
