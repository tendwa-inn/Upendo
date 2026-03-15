import { create } from 'zustand';

interface SettingsState {
  isAutoUnmatchEnabled: boolean;
  toggleAutoUnmatch: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isAutoUnmatchEnabled: false,
  toggleAutoUnmatch: () => set((state) => ({ isAutoUnmatchEnabled: !state.isAutoUnmatchEnabled })),
}));
