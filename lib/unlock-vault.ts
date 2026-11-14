import { setVaultSessionKey, clearVaultSessionKey } from '@/lib/vault-crypto-session';
import { openDataKey } from '@/lib/vault-key';
import { useVaultStore } from '@/stores/vault-store';

/** Unwrap the random data key and hydrate. Legacy PIN-derived vaults migrate once. */
export async function unlockVaultWithPin(pin: string): Promise<{ migrated: boolean }> {
  const { dek, migrated: keyMigrated } = await openDataKey(pin);
  setVaultSessionKey(dek);
  const { migrated: dataMigrated } = await useVaultStore.getState().hydrateFromDisk(dek);
  return { migrated: keyMigrated || dataMigrated };
}

export function lockVaultSession(): void {
  clearVaultSessionKey();
}
