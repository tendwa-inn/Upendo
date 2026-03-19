import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ButtonStyle = 'upendo-color' | 'white-clean' | 'vintage';

interface UiState {
  buttonStyle: ButtonStyle;
  setButtonStyle: (style: ButtonStyle) => void;
  isProfileCompletionModalOpen: boolean;
  openProfileCompletionModal: () => void;
  closeProfileCompletionModal: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      buttonStyle: 'upendo-color',
      setButtonStyle: (style) => set({ buttonStyle: style }),
      isProfileCompletionModalOpen: false,
      openProfileCompletionModal: () => set({ isProfileCompletionModalOpen: true }),
      closeProfileCompletionModal: () => set({ isProfileCompletionModalOpen: false }),
    }),
    {
      name: 'ui-settings-storage',
    }
  )
);
