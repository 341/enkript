import { Stack } from 'expo-router';

export default function SettingsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0F1E' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="security" />
      <Stack.Screen name="autofill" />
      <Stack.Screen name="import-export" />
      <Stack.Screen name="browser-bridge" />
    </Stack>
  );
}
