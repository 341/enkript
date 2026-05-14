import { useRouter, usePathname, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';

import {
  dismissAutofillSetupPrompt,
  isAutofillSetupPromptDismissed,
} from '@/lib/autofill-prompt-dismissed';
import { useBootGateStore } from '@/stores/boot-gate-store';
import { useVaultLockStore } from '@/stores/vault-lock-store';

function isPasswordsListRoute(segments: readonly string[], pathname: string | undefined): boolean {
  const norm = (pathname ?? '').replace(/\/$/, '');
  if (norm === '/(tabs)/passwords' || norm === '/passwords') return true;
  return (
    segments[0] === '(tabs)' &&
    segments[1] === 'passwords' &&
    (segments.length === 2 || segments[2] === 'index')
  );
}

/**
 * After a successful lock-screen unlock, offers to open the in-app AutoFill guide
 * (system settings must still grant AutoFill there).
 */
export function AutofillUnlockPrompt() {
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const sessionReady = useBootGateStore((s) => s.sessionReady);
  const vaultHasPin = useBootGateStore((s) => s.vaultHasPin);
  const busyRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!sessionReady || !vaultHasPin) return;
    if (!isPasswordsListRoute(segments, pathname)) return;

    const lock = useVaultLockStore.getState();
    if (!lock.postUnlockAutofillPrompt) return;
    if (busyRef.current) return;

    busyRef.current = true;
    lock.setPostUnlockAutofillPrompt(false);

    void (async () => {
      try {
        if (await isAutofillSetupPromptDismissed()) {
          return;
        }

        const vendor =
          Platform.OS === 'ios'
            ? 'Apple Settings → Passwords → Password Options, then allow filling from this app when it appears in the list.'
            : 'Android Settings → Autofill (or Languages & input → Autofill), then choose this app as the active autofill service.';

        Alert.alert(
          'Use my‑enkript for AutoFill?',
          `To fill passwords in browsers and other apps, the system needs to allow this app as a password source.\n\n${vendor}\n\nYou can open the in-app AutoFill guide next, or skip for now.`,
          [
            {
              text: 'Not now',
              style: 'cancel',
              onPress: () => {
                void dismissAutofillSetupPrompt();
              },
            },
            {
              text: 'Open guide',
              onPress: () => {
                void dismissAutofillSetupPrompt();
                router.push('/(tabs)/settings/autofill');
              },
            },
          ],
        );
      } finally {
        busyRef.current = false;
      }
    })();
  }, [pathname, router, segments, sessionReady, vaultHasPin]);

  return null;
}
