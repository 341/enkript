// [VaultUnlock · Steps 1, 3, 8] Headless bootstrap: cold boot, runtime nav sync, background auto-lock.
import { usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { navigateToVaultLock } from '@/lib/navigate-vault-lock';
import { canAccessStorybook } from '@/lib/storybook-env';
import { lockVaultSession } from '@/lib/unlock-vault';
import { loadStoredLockTimeout } from '@/lib/vault-repository';
import { hasPinConfigured } from '@/lib/pin-session';
import { useBootGateStore } from '@/stores/boot-gate-store';
import { NEVER_LOCK_SECONDS, useVaultLockStore } from '@/stores/vault-lock-store';
import { useVaultStore } from '@/stores/vault-store';

const LOG = '[VaultRuntimeNav]';

function isShowingLockRoute(pathname: string, segments: readonly string[]): boolean {
  const p = pathname.replace(/\/$/, '');
  if (p === '/lock') return true;
  // When pathname briefly lags leaving the tabs tree, root lock stays identifiable as first segment.
  return segments.length > 0 && segments[0] === 'lock';
}

function isStorybookRoute(pathname: string): boolean {
  return pathname.replace(/\/$/, '') === '/storybook';
}

/** [VaultUnlock · Step 1] Runs once on mount: restore prefs, detect PIN, set lock state, unblock routing. */
export function VaultColdBoot() {
  const markConfigured = useBootGateStore((s) => s.markConfigured);

  useEffect(() => {
    (async () => {
      // [VaultUnlock · Step 1] Sequential awaits — each must finish before markConfigured unblocks app/index.
      const storedPeriod = await loadStoredLockTimeout();
      if (storedPeriod === Number.POSITIVE_INFINITY) {
        useVaultLockStore.setState({ lockAfterSeconds: NEVER_LOCK_SECONDS });
      } else if (typeof storedPeriod === 'number' && Number.isFinite(storedPeriod)) {
        useVaultLockStore.setState({ lockAfterSeconds: storedPeriod });
      }

      const hasPin = await hasPinConfigured();
      if (__DEV__) {
        console.log('[VaultColdBoot]', 'pin check done', { hasPin });
      }
      // [VaultUnlock · Step 1] sessionReady + vaultHasPin — RootIndex waits on this before redirecting.
      markConfigured(hasPin);

      if (!hasPin) {
        // [VaultUnlock · Step 6] No PIN yet: stay unlocked and load vault for first-run / pre-wizard use.
        useVaultLockStore.setState({ vaultLocked: false });
        try {
          await useVaultStore.getState().hydrateWithoutPin();
        } catch {
          // Ciphertext exists and there is no PIN yet. Leave it on disk.
        }
      } else {
        // [VaultUnlock · Step 1] PIN exists: start locked until user completes Step 4 on /lock.
        useVaultLockStore.setState({ vaultLocked: true });
      }
    })();
  }, [markConfigured]);

  return null;
}

/** [VaultUnlock · Step 3] Keeps Expo Router pathname aligned with vaultLocked after boot and unlock. */
export function VaultRuntimeNav() {
  const pathname = usePathname();
  const segments = useSegments();
  const router = useRouter();
  const sessionReady = useBootGateStore((s) => s.sessionReady);
  const vaultHasPin = useBootGateStore((s) => s.vaultHasPin);
  const locked = useVaultLockStore((s) => s.vaultLocked);

  useEffect(() => {
    if (!sessionReady) {
      if (__DEV__) console.log(LOG, 'skip: session not ready');
      return;
    }

    if (canAccessStorybook && isStorybookRoute(pathname)) {
      if (__DEV__) console.log(LOG, 'skip: storybook route');
      return;
    }

    const onLockRoute = isShowingLockRoute(pathname, segments);

    // [VaultUnlock · Step 3] First-time PIN wizard on /lock — do not redirect away.
    if (!vaultHasPin) {
      if (__DEV__) {
        console.log(LOG, 'no PIN yet — leave navigation alone (setup wizard on /lock)', {
          pathname,
          segments: [...segments],
          onLockRoute,
          locked,
        });
      }
      // Do not bounce off /lock: first-time PIN setup and "Lock now" before PIN rely on staying here.
      return;
    }

    // [VaultUnlock · Step 3] Locked but browsing tabs — force /lock.
    if (locked && !onLockRoute) {
      if (__DEV__) console.log(LOG, '→ navigateToVaultLock (locked, not on /lock)', { pathname, segments: [...segments] });
      navigateToVaultLock();
    // [VaultUnlock · Step 3] Unlocked on lock screen — enter main app.
    } else if (!locked && onLockRoute) {
      if (__DEV__) console.log(LOG, '→ replace /(tabs)/passwords (unlocked on /lock)', { pathname });
      router.replace('/(tabs)/passwords');
    } else if (__DEV__) {
      console.log(LOG, 'no op', { locked, onLockRoute, pathname, segments: [...segments] });
    }
  }, [pathname, segments, locked, router, sessionReady, vaultHasPin]);

  return null;
}

/** [VaultUnlock · Step 8] Auto-lock after background idle; re-enters flow at Steps 3–4. */
export function VaultAutosleepWatcher() {
  const backgroundAt = useRef<number | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (!useBootGateStore.getState().sessionReady) return;
      if (!useBootGateStore.getState().vaultHasPin) return;

      // [VaultUnlock · Step 8] Record when app left foreground for elapsed-time check.
      if (next.match(/inactive|background/)) {
        backgroundAt.current = Date.now();
        return;
      }

      useVaultLockStore.setState({ lastActiveAt: Date.now() });

      if (next !== 'active' || backgroundAt.current === null) return;

      const elapsed = (Date.now() - backgroundAt.current) / 1000;
      backgroundAt.current = null;

      const { lockAfterSeconds, vaultLocked } = useVaultLockStore.getState();

      const shouldSleep =
        lockAfterSeconds !== NEVER_LOCK_SECONDS && elapsed >= lockAfterSeconds && !vaultLocked;

      // [VaultUnlock · Step 8] Lock, wipe in-memory secrets, navigate — same path as manual lock.
      if (shouldSleep) {
        useVaultLockStore.getState().lock();
        lockVaultSession();
        useVaultStore.getState().clearMemoryForLock();
        navigateToVaultLock();
      }
    });

    return () => subscription.remove();
  }, []);

  return null;
}
