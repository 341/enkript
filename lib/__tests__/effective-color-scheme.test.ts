import { resolveEffectiveColorScheme } from '@/lib/effective-color-scheme';
import type { ThemePreference } from '@/stores/theme-preference-store';

const systems = [
  undefined,
  null,
  'light',
  'dark',
] as const satisfies readonly ('light' | 'dark' | null | undefined)[];

describe('resolveEffectiveColorScheme', () => {
  it('forces light when preference is light (any system)', () => {
    for (const system of systems) {
      expect(resolveEffectiveColorScheme('light', system)).toBe('light');
    }
  });

  it('forces dark when preference is dark (any system)', () => {
    for (const system of systems) {
      expect(resolveEffectiveColorScheme('dark', system)).toBe('dark');
    }
  });

  it.each<[ThemePreference, (typeof systems)[number], 'light' | 'dark']>([
    ['system', undefined, 'light'],
    ['system', null, 'light'],
    ['system', 'light', 'light'],
    ['system', 'dark', 'dark'],
  ])('preference %s + system %j -> %s', (pref, sys, expected) => {
    expect(resolveEffectiveColorScheme(pref, sys)).toBe(expected);
  });
});
