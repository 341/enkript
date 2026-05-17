import { setVaultSessionKey, clearVaultSessionKey } from '@/lib/vault-crypto-session';
import { deriveVaultKeyFromPin } from '@/lib/vault-repository';
import { useVaultStore } from '@/stores/vault-store';

/** Derive session key from PIN and hydrate vault (includes stub→v2 migration). */
export async function unlockVaultWithPin(pin: string): Promise<{ migrated: boolean }> {
  const vaultKey = await deriveVaultKeyFromPin(pin);
  setVaultSessionKey(vaultKey);
  return useVaultStore.getState().hydrateFromDisk(vaultKey);
}

export function lockVaultSession(): void {
  clearVaultSessionKey();
}
