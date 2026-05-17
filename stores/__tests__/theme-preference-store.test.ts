import AsyncStorage from '@react-native-async-storage/async-storage';

import { useThemePreferenceStore } from '@/stores/theme-preference-store';

const KEY = 'enkript-theme-preference';

describe('useThemePreferenceStore', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useThemePreferenceStore.setState({ preference: 'system', hydrated: false });
  });

  it('hydrate ignores invalid persisted value', async () => {
    await AsyncStorage.setItem(KEY, 'garbage');
    await useThemePreferenceStore.getState().hydrate();
    expect(useThemePreferenceStore.getState().preference).toBe('system');
    expect(useThemePreferenceStore.getState().hydrated).toBe(true);
  });

  it('hydrate applies valid preference', async () => {
    await AsyncStorage.setItem(KEY, 'dark');
    await useThemePreferenceStore.getState().hydrate();
    expect(useThemePreferenceStore.getState().preference).toBe('dark');
    expect(useThemePreferenceStore.getState().hydrated).toBe(true);
  });

  it('setPreference updates state and persists', async () => {
    await useThemePreferenceStore.getState().setPreference('light');
    expect(useThemePreferenceStore.getState().preference).toBe('light');
    expect(await AsyncStorage.getItem(KEY)).toBe('light');
  });
});
