import { AppDarkNavigationTheme, AppLightNavigationTheme } from '@/lib/navigation-theme';

describe('navigation themes', () => {
  it('light theme aligns tokens with app canvas', () => {
    expect(AppLightNavigationTheme.colors.background).toBe('#F1F5F9');
    expect(AppLightNavigationTheme.colors.card).toBe('#E2E8F0');
    expect(AppLightNavigationTheme.colors.text).toBe('#0F172A');
    expect(AppLightNavigationTheme.colors.border).toBe('#CBD5E1');
    expect(AppLightNavigationTheme.colors.primary).toBe('#4F46E5');
    expect(AppLightNavigationTheme.colors.notification).toBe('#4F46E5');
  });

  it('dark theme aligns tokens with app canvas', () => {
    expect(AppDarkNavigationTheme.colors.background).toBe('#0A0F1E');
    expect(AppDarkNavigationTheme.colors.card).toBe('#0D1426');
    expect(AppDarkNavigationTheme.colors.text).toBe('#F8FAFC');
    expect(AppDarkNavigationTheme.colors.border).toBe('#334155');
    expect(AppDarkNavigationTheme.colors.primary).toBe('#818CF8');
    expect(AppDarkNavigationTheme.colors.notification).toBe('#818CF8');
  });
});
