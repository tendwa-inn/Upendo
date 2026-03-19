
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: any | null; // Keep a simple profile object
  loading: boolean; // Add loading state
  setSession: (session: Session | null) => void;
  setProfile: (profile: any | null) => void;
  checkUser: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updateData: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true, // Start in loading state
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),

  checkUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ profile });
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      set({ loading: false }); // Finish loading
    }
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/profile', // Redirect directly to profile after login
      },
    });
    if (error) toast.error(error.message);
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Logout failed. Please try again.");
        console.error("Error logging out:", error);
      } else {
        set({ session: null, user: null, profile: null });
      }
    } catch (error) {
      toast.error("An unexpected error occurred during logout.");
      console.error("Unexpected logout error:", error);
    }
  },

  updateUserProfile: async (updateData: any) => {
    const { user } = get();
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ ...updateData, id: user.id });

    if (error) {
      toast.error(error.message);
      console.error("Error updating profile:", error);
    } else {
      // Manually refetch the profile to ensure UI updates
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      set({ profile: updatedProfile });
      toast.success("Profile updated!");
    }
  },
}));

// Initialize the store
useAuthStore.getState().checkUser();
