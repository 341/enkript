// [VaultUnlock · Step 0] App shell entry: fonts/splash gate, then mount unlock bootstrap hooks before Stack routes.
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
import { ThemeProvider } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { ThemeAppearanceBootstrap } from '@/components/theme-appearance-bootstrap';
import { VaultCopyToastHost } from '@/components/vault/copy-toast-host';
import {
  VaultAutosleepWatcher,
  VaultColdBoot,
  VaultRuntimeNav,
} from '@/components/vault/session-bootstrap';
import { VaultBridgeCoordinator } from '@/components/vault/bridge-wire-sync';
import { AutofillUnlockPrompt } from '@/components/vault/autofill-unlock-prompt';
import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import { AppDarkNavigationTheme, AppLightNavigationTheme } from '@/lib/navigation-theme';
import { rootBackground } from '@/lib/ui-theme';
import { canAccessStorybook } from '@/lib/storybook-env';
import { useThemePreferenceStore } from '@/stores/theme-preference-store';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrateTheme = useThemePreferenceStore((s) => s.hydrate);

  useEffect(() => {
    void hydrateTheme();
  }, [hydrateTheme]);

  const [loaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
  });

  const scheme = useEffectiveColorScheme();
  const navTheme = scheme === 'dark' ? AppDarkNavigationTheme : AppLightNavigationTheme;
  const rootBg = rootBackground(scheme);

  useEffect(() => {
    if (loaded || fontError != null) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, fontError]);

  // [VaultUnlock · Step 0] Blocks entire tree until fonts load — affects perceived cold-start before Step 1 runs.
  if (!loaded && fontError == null) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: rootBg }}>
      <ThemeAppearanceBootstrap>
        <SafeAreaProvider>
          <ThemeProvider value={navTheme}>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
            <BottomSheetModalProvider>
              <VaultCopyToastHost>
                {/* [VaultUnlock · Step 1] Cold boot: lock timeout, PIN presence, sessionReady. */}
                <VaultColdBoot />
                {/* [VaultUnlock · Step 3] Reconcile pathname with vaultLocked (lock screen vs tabs). */}
                <VaultRuntimeNav />
                {/* [VaultUnlock · Step 7] Post-unlock AutoFill onboarding on passwords tab. */}
                <AutofillUnlockPrompt />
                {/* [VaultUnlock · Step 8] Background timeout → lock + navigate to /lock. */}
                <VaultAutosleepWatcher />
                <VaultBridgeCoordinator />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: rootBg },
                  }}>
                  <Stack.Screen
                    name="lock"
                    options={{
                      gestureEnabled: false,
                      animation: 'fade',
                    }}
                  />
                  <Stack.Screen name="(tabs)" />
                  {canAccessStorybook ? (
                    <Stack.Screen
                      name="storybook"
                      options={{
                        animation: 'slide_from_bottom',
                      }}
                    />
                  ) : null}
                </Stack>
              </VaultCopyToastHost>
            </BottomSheetModalProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </ThemeAppearanceBootstrap>
    </GestureHandlerRootView>
  );
}
