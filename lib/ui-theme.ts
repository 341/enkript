export type EffectiveScheme = 'light' | 'dark';

const indigoBright = '#818CF8';
const indigoBase = '#6366F1';
const navyTrackDark = '#1B2847';
const slateTrackLight = '#CBD5E1';

export function activityIndicatorTint(scheme: EffectiveScheme): string {
  return scheme === 'dark' ? indigoBright : indigoBase;
}

export function sliderMinimumTrackTint(_scheme: EffectiveScheme): string {
  return indigoBase;
}

export function sliderMaximumTrackTint(scheme: EffectiveScheme): string {
  return scheme === 'dark' ? navyTrackDark : slateTrackLight;
}

export function sliderThumbTint(scheme: EffectiveScheme): string {
  return scheme === 'dark' ? indigoBright : indigoBase;
}

export function switchTrackColorOff(scheme: EffectiveScheme): string {
  return scheme === 'dark' ? navyTrackDark : slateTrackLight;
}

export const switchTrackColorOn = '#4F46E5';
export const switchThumbColor = '#E2E8F0';

export function placeholderColor(scheme: EffectiveScheme): string {
  return scheme === 'dark' ? '#64748B' : '#64748b';
}

export function bottomSheetBackground(scheme: EffectiveScheme): string {
  return scheme === 'dark' ? '#0D1426' : '#F1F5F9';
}

export function bottomSheetHandleIndicator(scheme: EffectiveScheme): string {
  return scheme === 'dark' ? '#94A3B8' : '#64748B';
}

export function qrModalBackdrop(): string {
  return 'rgba(0,0,0,0.85)';
}

export function qrModalQrPaddingBg(): string {
  return '#ffffff';
}

export function tabBarActiveTint(scheme: EffectiveScheme): string {
  return scheme === 'dark' ? '#818CF8' : '#4F46E5';
}

export function tabBarInactiveTint(scheme: EffectiveScheme): string {
  return '#64748B';
}

export function tabBarBorderTop(scheme: EffectiveScheme): string {
  return scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)';
}

export function tabAndroidBarBg(scheme: EffectiveScheme): string {
  return scheme === 'dark' ? 'rgba(13,18,42,0.92)' : 'rgba(241,245,249,0.96)';
}

export function rootBackground(scheme: EffectiveScheme): string {
  return scheme === 'dark' ? '#0A0F1E' : '#F1F5F9';
}
