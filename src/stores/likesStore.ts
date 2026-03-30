import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { useAuthStore } from './authStore';

interface LikesState {
  usersWhoLikedMe: User[];
  fetchUsersWhoLikedMe: () => Promise<void>;
}

export const useLikesStore = create<LikesState>((set) => ({
  usersWhoLikedMe: [],

  fetchUsersWhoLikedMe: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    // Get the IDs of users who liked the current user
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('liker_id')
      .eq('liked_id', currentUser.id);

    if (likesError) {
      console.error('Error fetching likes:', likesError);
      return;
    }

    if (!likes || likes.length === 0) {
      set({ usersWhoLikedMe: [] });
      return;
    }

    const likerIds = likes.map(l => l.liker_id);

    // Get the full profiles of those users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', likerIds);

    if (profilesError) {
      console.error('Error fetching liker profiles:', profilesError);
      return;
    }

    set({ usersWhoLikedMe: profiles || [] });
  },
}));
