import { Stack } from 'expo-router';

import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import { rootBackground } from '@/lib/ui-theme';

export default function PasswordsStackLayout() {
  const scheme = useEffectiveColorScheme();
  const bg = rootBackground(scheme);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/edit" />
    </Stack>
  );
}
