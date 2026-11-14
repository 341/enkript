import * as ExpoCrypto from 'expo-crypto';

import { base64ToBytes, bytesToBase64, decryptWithVaultKey, deriveVaultKey, encryptWithVaultKey } from '@/lib/crypto';
import { VAULT_KEY_BYTES } from '@/lib/crypto-types';
import { getVaultSessionKey } from '@/lib/vault-crypto-session';
import { VaultUnreadableError } from '@/lib/vault-errors';
import { decryptVaultBundle, encryptVaultBundle } from '@/lib/vault-migration';
import { ensureKdfSalt } from '@/lib/vault-repository';
import {
  deleteLegacyVaultBundle,
  readVaultCiphertext,
  readWrappedDataKey,
  writeVaultCiphertext,
  writeWrappedDataKey,
} from '@/lib/vault-storage';

async function deriveKek(pin: string): Promise<Uint8Array> {
  const salt = await ensureKdfSalt();
  return deriveVaultKey(pin, salt);
}

function wipe(bytes: Uint8Array): void {
  bytes.fill(0);
}

/**
 * PIN derives a key-encryption key only. The data key is 32 random bytes.
 * Legacy vaults (data key == Argon2id(PIN)) are re-wrapped once on unlock.
 */
export async function openDataKey(pin: string): Promise<{ dek: Uint8Array; migrated: boolean }> {
  const kek = await deriveKek(pin);
  try {
    const wrapped = await readWrappedDataKey();
    if (wrapped) {
      const encoded = await decryptWithVaultKey(wrapped, kek);
      const dek = base64ToBytes(encoded);
      if (dek.length !== VAULT_KEY_BYTES) {
        throw new VaultUnreadableError('Could not unlock the vault key. Nothing was overwritten.');
      }
      return { dek, migrated: false };
    }

    const stored = await readVaultCiphertext();
    if (!stored) {
      const dek = ExpoCrypto.getRandomBytes(VAULT_KEY_BYTES);
      await writeWrappedDataKey(await encryptWithVaultKey(bytesToBase64(dek), kek));
      return { dek, migrated: false };
    }

    const { plaintext } = await decryptVaultBundle(stored.raw, kek);
    const dek = ExpoCrypto.getRandomBytes(VAULT_KEY_BYTES);
    const next = await encryptVaultBundle(plaintext, dek);
    // File, then wrap, then drop the legacy blob. A crash before the wrap still reads the legacy copy.
    await writeVaultCiphertext(next);
    await writeWrappedDataKey(await encryptWithVaultKey(bytesToBase64(dek), kek));
    await deleteLegacyVaultBundle();
    return { dek, migrated: true };
  } catch (error) {
    if (error instanceof VaultUnreadableError) throw error;
    throw new VaultUnreadableError('Could not unlock the vault key. Nothing was overwritten.');
  } finally {
    wipe(kek);
  }
}

/** First PIN setup. Skips when a wrapped key or a legacy bundle already exists. */
export async function createDataKeyIfNeeded(pin: string): Promise<void> {
  if (await readWrappedDataKey()) return;
  if (await readVaultCiphertext()) return;
  const kek = await deriveKek(pin);
  try {
    const dek = ExpoCrypto.getRandomBytes(VAULT_KEY_BYTES);
    await writeWrappedDataKey(await encryptWithVaultKey(bytesToBase64(dek), kek));
  } finally {
    wipe(kek);
  }
}

/** PIN change. The data key stays the same; only the PIN wrapping is replaced. */
export async function rewrapDataKey(pin: string): Promise<void> {
  const dek = getVaultSessionKey();
  const kek = await deriveKek(pin);
  try {
    await writeWrappedDataKey(await encryptWithVaultKey(bytesToBase64(dek), kek));
  } finally {
    wipe(kek);
  }
}
