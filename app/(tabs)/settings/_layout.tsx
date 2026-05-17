import { Stack } from 'expo-router';

import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import { rootBackground } from '@/lib/ui-theme';

export default function SettingsStackLayout() {
  const scheme = useEffectiveColorScheme();
  const bg = rootBackground(scheme);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="security" />
      <Stack.Screen name="autofill" />
      <Stack.Screen name="import-export" />
      <Stack.Screen name="browser-bridge" />
      <Stack.Screen name="vault-health" />
      <Stack.Screen name="notes" />
      <Stack.Screen name="note/[id]" />
      <Stack.Screen name="cards" />
      <Stack.Screen name="card/[id]" />
    </Stack>
  );
}
