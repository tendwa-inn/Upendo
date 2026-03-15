import { create } from 'zustand';
import { User } from '../types';
import { useAuthStore } from './authStore';

interface ProfileState {
  currentUser: User | null;
  updateCurrentUser: (data: Partial<User>) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  currentUser: useAuthStore.getState().user,
  updateCurrentUser: (data) =>
    set((state) => ({ currentUser: state.currentUser ? { ...state.currentUser, ...data } : null})),
}));