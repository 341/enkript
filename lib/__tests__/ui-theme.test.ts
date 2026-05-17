import {
  activityIndicatorTint,
  bottomSheetBackground,
  bottomSheetHandleIndicator,
  rootBackground,
  tabBarActiveTint,
  sliderMaximumTrackTint,
  switchTrackColorOff,
  switchThumbColor,
  switchTrackColorOn,
  tabAndroidBarBg,
  tabBarBorderTop,
  tabBarInactiveTint,
  qrModalBackdrop,
  qrModalQrPaddingBg,
} from '@/lib/ui-theme';

describe('ui-theme tokens', () => {
  it('maps root and sheet backgrounds by scheme', () => {
    expect(rootBackground('light')).toBe('#F1F5F9');
    expect(rootBackground('dark')).toBe('#0A0F1E');
    expect(bottomSheetBackground('light')).toBe('#F1F5F9');
    expect(bottomSheetBackground('dark')).toBe('#0D1426');
  });

  it('maps activity indicator and sliders', () => {
    expect(activityIndicatorTint('light')).toBe('#6366F1');
    expect(activityIndicatorTint('dark')).toBe('#818CF8');
    expect(sliderMaximumTrackTint('light')).toBe('#CBD5E1');
    expect(sliderMaximumTrackTint('dark')).toBe('#1B2847');
  });

  it('maps switches and placeholders', () => {
    expect(switchTrackColorOff('light')).toBe('#CBD5E1');
    expect(switchTrackColorOff('dark')).toBe('#1B2847');
    expect(switchTrackColorOn).toBe('#4F46E5');
    expect(switchThumbColor).toBe('#E2E8F0');
  });

  it('maps navigation chrome helpers', () => {
    expect(tabBarActiveTint('light')).toBe('#4F46E5');
    expect(tabBarActiveTint('dark')).toBe('#818CF8');
    expect(tabBarInactiveTint('light')).toBe('#64748B');
    expect(tabBarInactiveTint('dark')).toBe('#64748B');
    expect(tabBarBorderTop('dark')).toBe('rgba(255,255,255,0.06)');
    expect(tabAndroidBarBg('light')).toBe('rgba(241,245,249,0.96)');
  });

  it('handles bottom sheet indicator and qr modal literals', () => {
    expect(bottomSheetHandleIndicator('light')).toBe('#64748B');
    expect(bottomSheetHandleIndicator('dark')).toBe('#94A3B8');
    expect(qrModalBackdrop()).toBe('rgba(0,0,0,0.85)');
    expect(qrModalQrPaddingBg()).toBe('#ffffff');
  });
});
