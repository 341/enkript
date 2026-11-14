import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';

import { VaultUnreadableError } from '@/lib/vault-errors';

/** Previous whole-vault blob. Kept only until a file copy is confirmed. */
export const LEGACY_VAULT_BUNDLE_KEY = 'vault_encrypted_bundle_v1';
/** Argon2id(PIN) wrapping of the random 32-byte data key. Small enough for the keychain. */
export const WRAPPED_DATA_KEY = 'vault_dek_wrapped_v1';

const VAULT_FILE_NAME = 'vault-bundle.v3.txt';

function vaultFilePath(): string | null {
  const base = FileSystem.documentDirectory;
  return base ? `${base}${VAULT_FILE_NAME}` : null;
}

async function readVaultFile(): Promise<string | null> {
  const path = vaultFilePath();
  if (!path) return null;
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return null;
  const raw = await FileSystem.readAsStringAsync(path);
  if (!raw) {
    throw new VaultUnreadableError('Vault file is empty. Nothing was overwritten.');
  }
  return raw;
}

/**
 * Prefer the file only after the wrapped data key exists, so a crash mid-migration
 * still falls back to the legacy keychain blob.
 */
export async function readVaultCiphertext(): Promise<{ raw: string; legacy: boolean } | null> {
  const [wrapped, fileRaw, legacy] = await Promise.all([
    SecureStore.getItemAsync(WRAPPED_DATA_KEY),
    readVaultFile(),
    SecureStore.getItemAsync(LEGACY_VAULT_BUNDLE_KEY),
  ]);
  if (wrapped && fileRaw) return { raw: fileRaw, legacy: false };
  if (legacy) return { raw: legacy, legacy: true };
  if (fileRaw) return { raw: fileRaw, legacy: false };
  return null;
}

/** Write the vault file. Does not remove the legacy blob; call that only after the wrapped key is stored. */
export async function writeVaultCiphertext(raw: string): Promise<void> {
  const path = vaultFilePath();
  if (!path) {
    throw new Error('Vault file storage is unavailable on this device.');
  }
  await FileSystem.writeAsStringAsync(path, raw);
}

export async function deleteLegacyVaultBundle(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(LEGACY_VAULT_BUNDLE_KEY);
  } catch {
    // Already absent.
  }
}

export async function readWrappedDataKey(): Promise<string | null> {
  return SecureStore.getItemAsync(WRAPPED_DATA_KEY);
}

export async function writeWrappedDataKey(wrapped: string): Promise<void> {
  await SecureStore.setItemAsync(WRAPPED_DATA_KEY, wrapped);
}

export async function deleteWrappedDataKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(WRAPPED_DATA_KEY);
  } catch {
    // Already absent.
  }
}
