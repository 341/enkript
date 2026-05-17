import type { EffectiveScheme } from '@/lib/ui-theme';
import type { ThemePreference } from '@/stores/theme-preference-store';

/** Pure resolver for Navigation, StatusBar, and imperative theme colors (testable independent of RN). */
export function resolveEffectiveColorScheme(
  preference: ThemePreference,
  system: 'light' | 'dark' | null | undefined,
): EffectiveScheme {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return system === 'dark' ? 'dark' : 'light';
}
