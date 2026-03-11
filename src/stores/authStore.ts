import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser } from '../types';
import { mockUsers } from '../data/mockData';

// Create mock AuthUser objects for authentication
const mockAuthUsers: AuthUser[] = [
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
          const foundUser = mockAuthUsers.find((u) => u.email === email);

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

      useMessageRequest: () => {
        const { user } = get();
        if (!user || user.subscription !== 'free') {
          return true; // Pro/VIP users have unlimited messages
        }

        const now = new Date();
        const resetDate = user.messageRequestResetDate ? new Date(user.messageRequestResetDate) : now;

        if (now >= resetDate) {
          const newResetDate = new Date(now.setDate(now.getDate() + 7));
          const updatedUser = { ...user, messageRequestsSent: 1, messageRequestResetDate: newResetDate };
          set({ user: updatedUser });
          return true;
        }

        if ((user.messageRequestsSent || 0) < 3) {
          const updatedUser = { ...user, messageRequestsSent: (user.messageRequestsSent || 0) + 1 };
          set({ user: updatedUser });
          return true;
        }

        return false;
      },

      signUp: async (newUser: AuthUser) => {
        set({ isLoading: true });
        try {
          // In a real app, this would be an API call to your backend
          // For this mock, we just add the user to the state
          set({ user: newUser, isAuthenticated: true });

          // Automatically create a match with the Upendo assistant
          const upendoAssistant = mockUsers.find(u => u.id === 'upendo-assistant');
          if (upendoAssistant) {
            const { useMatchStore } = await import('./matchStore');
            const { createMatch, addMessage } = useMatchStore.getState();
            // Use currentUser from mockData instead of AuthUser
            const currentUser = mockUsers.find(u => u.id === 'current-user') || mockUsers[0];
            const match = createMatch(currentUser, upendoAssistant);
            addMessage(match.id, {
              id: `msg-${Date.now()}`,
              matchId: match.id,
              senderId: upendoAssistant.id,
              content: `Welcome to Upendo! I'm here to help you get started. A complete profile gets more attention. Why not start by filling out your Details, Delicacies, and Travel sections? Let's make your profile shine! ✨`,
              timestamp: new Date(),
              isRead: false,
              type: 'text',
            });
          }
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