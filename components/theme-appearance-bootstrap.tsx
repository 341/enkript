import { colorScheme } from 'nativewind';
import { type ReactNode, useEffect } from 'react';

import { useThemePreferenceStore } from '@/stores/theme-preference-store';

/** Keeps NativeWind `dark:` variants aligned with user preference (`system|light|dark`). */
export function ThemeAppearanceBootstrap({ children }: { children: ReactNode }) {
  const preference = useThemePreferenceStore((s) => s.preference);

  useEffect(() => {
    colorScheme.set(preference);
  }, [preference]);

  return children;
}
