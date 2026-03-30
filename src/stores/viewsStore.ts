import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { useAuthStore } from './authStore';

interface ViewsState {
  usersWhoViewedMe: User[];
  fetchUsersWhoViewedMe: () => Promise<void>;
}

export const useViewsStore = create<ViewsState>((set) => ({
  usersWhoViewedMe: [],

  fetchUsersWhoViewedMe: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    // Get the IDs of users who viewed the current user
    const { data: views, error: viewsError } = await supabase
      .from('profile_views')
      .select('viewer_id')
      .eq('viewed_id', currentUser.id);

    if (viewsError) {
      console.error('Error fetching views:', viewsError);
      return;
    }

    if (!views || views.length === 0) {
      set({ usersWhoViewedMe: [] });
      return;
    }

    const viewerIds = views.map(v => v.viewer_id);

    // Get the full profiles of those users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', viewerIds);

    if (profilesError) {
      console.error('Error fetching viewer profiles:', profilesError);
      return;
    }

    set({ usersWhoViewedMe: profiles || [] });
  },
}));