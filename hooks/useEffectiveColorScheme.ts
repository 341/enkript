import { useColorScheme as useRnColorScheme } from 'react-native';

import { resolveEffectiveColorScheme } from '@/lib/effective-color-scheme';
import type { EffectiveScheme } from '@/lib/ui-theme';
import { useThemePreferenceStore } from '@/stores/theme-preference-store';

/** Resolves `light`/`dark` for Navigation, StatusBar, and imperative colors. */
export function useEffectiveColorScheme(): EffectiveScheme {
  const preference = useThemePreferenceStore((s) => s.preference);
  const system = useRnColorScheme();
  return resolveEffectiveColorScheme(preference, system);
}
