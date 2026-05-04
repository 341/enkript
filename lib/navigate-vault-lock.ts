import { router, type Href } from 'expo-router';

const LOCK_ROUTE = '/lock' as Href;

/** Root-stack lock route. Deferred so RN / Expo Router have applied Zustand lock state before dispatch. */
export function navigateToVaultLock(): void {
  queueMicrotask(() => {
    router.replace(LOCK_ROUTE);
  });
}
