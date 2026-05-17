// [VaultUnlock · Step 3] Navigate to lock screen after vaultLocked is set (auto-sleep or runtime nav).
import { router, type Href } from 'expo-router';

const LOCK_ROUTE = '/lock' as Href;

/** [VaultUnlock · Step 3] Deferred replace so Zustand lock state is applied before Expo Router runs. */
export function navigateToVaultLock(): void {
  queueMicrotask(() => {
    router.replace(LOCK_ROUTE);
  });
}
