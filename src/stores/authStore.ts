import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser } from '../types';

const mockUsers: AuthUser[] = [
  {
    id: 'free-user',
    email: 'free@upendo.com',
    subscription: 'free',
    isVerified: false,
  },
  {
    id: 'pro-user',
    email: 'pro@upendo.com',
    subscription: 'pro',
    isVerified: true,
  },
  {
    id: 'vip-user',
    email: 'vip@upendo.com',
    subscription: 'vip',
    isVerified: true,
  },
];

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (newUser: AuthUser) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Mock login with test accounts
          const foundUser = mockUsers.find((u) => u.email === email);

          if (foundUser && password === 'password') {
            set({ user: foundUser, isAuthenticated: true });
          } else {
            throw new Error('Invalid credentials');
          }
        } catch (error) {
          throw new Error('Login failed');
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      signUp: async (newUser: AuthUser) => {
        set({ isLoading: true });
        try {
          // In a real app, this would be an API call to your backend
          // For this mock, we just add the user to the state
          set({ user: newUser, isAuthenticated: true });
        } catch (error) {
          throw new Error('Sign up failed');
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