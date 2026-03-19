import { create } from 'zustand';

interface OnboardingState {
  step: number;
  formData: any;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: any) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  formData: {},
  nextStep: () => set((state) => {
    console.log(`[ZUSTAND_nextStep] Current step: ${state.step}. Incrementing...`);
    const nextStep = state.step + 1;
    console.log(`[ZUSTAND_nextStep] New step: ${nextStep}`);
    return { step: nextStep };
  }),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
  updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  reset: () => set({ step: 1, formData: {} }),
}));
