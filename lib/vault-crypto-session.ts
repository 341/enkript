import { VAULT_KEY_BYTES } from '@/lib/crypto-types';

let sessionVaultKey: Uint8Array | null = null;

export function setVaultSessionKey(key: Uint8Array): void {
  if (key.length !== VAULT_KEY_BYTES) {
    throw new Error('Invalid vault key length');
  }
  sessionVaultKey = new Uint8Array(key);
}

export function getVaultSessionKey(): Uint8Array {
  if (!sessionVaultKey) {
    throw new Error('Vault is locked');
  }
  return sessionVaultKey;
}

export function hasVaultSessionKey(): boolean {
  return sessionVaultKey !== null;
}

export function clearVaultSessionKey(): void {
  if (sessionVaultKey) {
    sessionVaultKey.fill(0);
    sessionVaultKey = null;
  }
}
