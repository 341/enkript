import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'enkript-theme-preference';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemePreferenceStore = {
  preference: ThemePreference;
  hydrated: boolean;
  setPreference: (p: ThemePreference) => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useThemePreferenceStore = create<ThemePreferenceStore>((set) => ({
  preference: 'system',
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark' || raw === 'system') {
        set({ preference: raw });
      }
    } finally {
      set({ hydrated: true });
    }
  },
  setPreference: async (p) => {
    await AsyncStorage.setItem(STORAGE_KEY, p);
    set({ preference: p });
  },
}));
