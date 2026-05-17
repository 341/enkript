import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

const lightBg = '#F1F5F9';
const lightCard = '#E2E8F0';

const darkBg = '#0A0F1E';
const darkCard = '#0D1426';

export const AppLightNavigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5',
    background: lightBg,
    card: lightCard,
    text: '#0F172A',
    border: '#CBD5E1',
    notification: '#4F46E5',
  },
};

export const AppDarkNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#818CF8',
    background: darkBg,
    card: darkCard,
    text: '#F8FAFC',
    border: '#334155',
    notification: '#818CF8',
  },
};
