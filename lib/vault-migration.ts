import {
  decryptStubValue,
  decryptWithVaultKey,
  encryptWithVaultKey,
  isStubEnvelope,
  isVaultV2Envelope,
} from '@/lib/crypto';

export type VaultBundleMigrationResult = {
  plaintext: string;
  migrated: boolean;
};

/** Decrypt vault bundle; re-encrypt stub payloads to v2 when vaultKey is available. */
export async function decryptVaultBundle(
  raw: string,
  vaultKey: Uint8Array,
): Promise<VaultBundleMigrationResult> {
  if (isVaultV2Envelope(raw)) {
    const plaintext = await decryptWithVaultKey(raw, vaultKey);
    return { plaintext, migrated: false };
  }
  if (isStubEnvelope(raw)) {
    const plaintext = await decryptStubValue(raw);
    return { plaintext, migrated: true };
  }
  throw new Error('Unknown vault bundle format');
}

export async function encryptVaultBundle(plaintext: string, vaultKey: Uint8Array): Promise<string> {
  return encryptWithVaultKey(plaintext, vaultKey);
}
