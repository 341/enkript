import { usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { navigateToVaultLock } from '@/lib/navigate-vault-lock';
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

export function VaultColdBoot() {
  const markConfigured = useBootGateStore((s) => s.markConfigured);

  useEffect(() => {
    (async () => {
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
      markConfigured(hasPin);

      if (!hasPin) {
        useVaultLockStore.setState({ vaultLocked: false });
        await useVaultStore.getState().hydrateFromDisk();
      } else {
        useVaultLockStore.setState({ vaultLocked: true });
      }
    })();
  }, [markConfigured]);

  return null;
}

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

    const onLockRoute = isShowingLockRoute(pathname, segments);

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

    if (locked && !onLockRoute) {
      if (__DEV__) console.log(LOG, '→ navigateToVaultLock (locked, not on /lock)', { pathname, segments: [...segments] });
      navigateToVaultLock();
    } else if (!locked && onLockRoute) {
      if (__DEV__) console.log(LOG, '→ replace /(tabs)/passwords (unlocked on /lock)', { pathname });
      router.replace('/(tabs)/passwords');
    } else if (__DEV__) {
      console.log(LOG, 'no op', { locked, onLockRoute, pathname, segments: [...segments] });
    }
  }, [pathname, segments, locked, router, sessionReady, vaultHasPin]);

  return null;
}

export function VaultAutosleepWatcher() {
  const backgroundAt = useRef<number | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (!useBootGateStore.getState().sessionReady) return;
      if (!useBootGateStore.getState().vaultHasPin) return;

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

      if (shouldSleep) {
        useVaultLockStore.getState().lock();
        useVaultStore.getState().clearMemoryForLock();
        navigateToVaultLock();
      }
    });

    return () => subscription.remove();
  }, []);

  return null;
}
