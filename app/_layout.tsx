import '../global.css';

import {
  JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { VaultCopyToastHost } from '@/components/vault/copy-toast-host';
import {
  VaultAutosleepWatcher,
  VaultColdBoot,
  VaultRuntimeNav,
} from '@/components/vault/session-bootstrap';
import { VaultBridgeCoordinator } from '@/components/vault/bridge-wire-sync';
import { AutofillUnlockPrompt } from '@/components/vault/autofill-unlock-prompt';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    if (loaded || fontError != null) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, fontError]);

  // Avoid hanging on a blank native root if fonts never settle (offline / fetch issues).
  if (!loaded && fontError == null) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0F1E' }}>
      <SafeAreaProvider>
        <ThemeProvider value={DarkTheme}>
          <BottomSheetModalProvider>
            <VaultCopyToastHost>
              <VaultColdBoot />
              {/* Mounts hooks only: returns null — keeps pathname aligned with PIN/lock after boot. */}
              <VaultRuntimeNav />
              <AutofillUnlockPrompt />
              <VaultAutosleepWatcher />
              <VaultBridgeCoordinator />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#0A0F1E' },
                }}>
                <Stack.Screen
                  name="lock"
                  options={{
                    gestureEnabled: false,
                    animation: 'fade',
                  }}
                />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </VaultCopyToastHost>
          </BottomSheetModalProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
