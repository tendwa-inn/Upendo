import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';
import { User, AuthUser } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthState {
  user: AuthUser | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  blockedUsers: string[];
  login: (email: string, password: string) => Promise<void>;
  signUp: (newUser: any) => Promise<void>; // Changed to any to accommodate otp
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  addBlockedUser: (userId: string) => void;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      blockedUsers: [],

      login: async (email, password) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          set({ isLoading: false });
          throw new Error(error.message);
        }
        if (data.user) {
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            set({ isLoading: false });
            throw new Error(profileError.message);
          }
          
          set({ user: { ...data.user, ...userProfile }, session: data.session, isAuthenticated: true, isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({ user: null, session: null, isAuthenticated: false, isLoading: false });
      },

      addBlockedUser: (userId: string) => {
        set((state) => ({ blockedUsers: [...state.blockedUsers, userId] }));
      },

      sendOtp: async (phone) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithOtp({ phone });
          if (error) throw error;
          // The serverless function will send the OTP
        } catch (error) {
          throw new Error(error.message);
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (phone, otp) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
          if (error) throw error;
          if (data.user) {
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
  
            if (profileError) throw profileError;
            
            set({ user: { ...data.user, ...userProfile }, session: data.session, isAuthenticated: true, isLoading: false });
          }
        } catch (error) {
          throw new Error(error.message);
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (newUser) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.from('profiles').upsert(newUser);
          if (error) throw error;
        } catch (error) {
          throw new Error(error.message);
        } finally {
          set({ isLoading: false });
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

supabase.auth.onAuthStateChange((event, session) => {
  const { user } = useAuthStore.getState();
  if (event === 'SIGNED_IN' && session && !user) {
    useAuthStore.setState({ session, isAuthenticated: true });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, session: null, isAuthenticated: false });
  }
});
