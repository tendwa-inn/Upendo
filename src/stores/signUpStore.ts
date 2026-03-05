import { create } from 'zustand';
import { User } from '../types';

export type SignUpData = Partial<User>;

interface SignUpState {
  step: number;
  data: SignUpData;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (newData: Partial<SignUpData>) => void;
  reset: () => void;
}

export const useSignUpStore = create<SignUpState>((set) => ({
  step: 1,
  data: {
    lookingFor: 'men', // Default value
    hereFor: [],
    interests: [],
    photos: [],
  },
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
  updateData: (newData) =>
    set((state) => ({ data: { ...state.data, ...newData } })),
  reset: () => set({ step: 1, data: {} }),
}));