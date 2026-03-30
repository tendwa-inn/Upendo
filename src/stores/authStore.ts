import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  messageRequestsSent: number;
  messageRequestResetDate: Date | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: any | null) => void;
  checkUser: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updateData: any, onSuccess?: () => void) => Promise<void>;
  createProfile: (formData: any) => Promise<void>;
  incrementMessageRequests: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  messageRequestsSent: 0,
  messageRequestResetDate: null,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),

  checkUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id);

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          set({ profile: null });
          return;
        }

        const profile = profiles && profiles.length > 0 ? profiles[0] : null;

        if (!profile) {
          set({ profile: null });
          return; 
        }

        if (profile.is_banned) {
          toast.error('Your account has been banned due to a policy violation.');
          get().signOut();
          return;
        }

        set({ 
          profile, 
          messageRequestsSent: profile.message_requests_sent || 0,
          messageRequestResetDate: profile.message_request_reset_date ? new Date(profile.message_request_reset_date) : null
        });
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      set({ loading: false });
    }
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) toast.error(error.message);
  },

  signUpWithEmail: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    await get().checkUser();
    return data;
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

  updateUserProfile: async (updateData: any, onSuccess?: () => void) => {
    const { user } = get();
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updateData })
      .eq('id', user.id)
      .select();

    if (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message);
    } else {
      await get().checkUser();
      if (onSuccess) {
        onSuccess();
      } else {
        toast.success("Profile updated!");
      }
    }
  },

  createProfile: async (formData: any) => {
    const { user } = get();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase.rpc('create_new_user_profile', {
      p_user_id: user.id,
      p_name: formData.name,
      p_birthday: formData.dob,
      p_gender: formData.gender,
      p_interested_in: formData.interested_in,
      p_relationship_intent: formData.relationship_intent,
      p_interests: formData.interests,
      p_kids: formData.kids,
      p_location: formData.location,
    });

    if (error) {
      throw error;
    }

    await get().checkUser();
  },

  incrementMessageRequests: () => {
    set((state) => ({
      messageRequestsSent: state.messageRequestsSent + 1,
    }));
  },
}));
