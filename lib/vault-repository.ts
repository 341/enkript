// [VaultUnlock · Steps 1, 5, 6] SecureStore persistence for PIN envelope, vault bundle, lock timeout.
import * as SecureStore from 'expo-secure-store';

import * as ExpoCrypto from 'expo-crypto';

import { KDF_SALT_BYTES } from '@/lib/crypto-types';
import { deriveVaultKey } from '@/lib/crypto';
import {
  decryptVaultBundle,
  encryptVaultBundle,
} from '@/lib/vault-migration';
import type { VaultPersistShape } from '@/lib/types';

/** [VaultUnlock · Step 6] Encrypted passwords/passkeys/devices JSON. */
const VAULT_KEY = 'vault_encrypted_bundle_v1';
export const KDF_SALT_KEY = 'vault_kdf_salt_v1';
/** [VaultUnlock · Step 5] Encrypted bcrypt hash of the 6-digit PIN. */
export const PIN_HASH_KEY = 'vault_pin_bcrypt_via_encrypt_stub_v1';

const emptyPersist = (): VaultPersistShape => ({
  version: 1,
  passwords: [],
  passkeys: [],
  pairedDevices: [],
  items: [],
  folders: [],
});

export async function readKdfSalt(): Promise<Uint8Array | null> {
  const raw = await SecureStore.getItemAsync(KDF_SALT_KEY);
  if (!raw) return null;
  const bin = globalThis.atob(raw);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function writeKdfSalt(salt: Uint8Array): Promise<void> {
  let bin = '';
  salt.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  await SecureStore.setItemAsync(KDF_SALT_KEY, globalThis.btoa(bin));
}

export async function ensureKdfSalt(): Promise<Uint8Array> {
  const existing = await readKdfSalt();
  if (existing) return existing;
  const salt = ExpoCrypto.getRandomBytes(KDF_SALT_BYTES);
  await writeKdfSalt(salt);
  return salt;
}

export async function deriveVaultKeyFromPin(pin: string): Promise<Uint8Array> {
  const salt = await ensureKdfSalt();
  return deriveVaultKey(pin, salt);
}

function normalizePersistShape(parsed: VaultPersistShape): VaultPersistShape {
  return {
    version: parsed.version ?? 1,
    passwords: parsed.passwords ?? [],
    passkeys: parsed.passkeys ?? [],
    pairedDevices: parsed.pairedDevices ?? [],
    items: parsed.items ?? [],
    folders: parsed.folders ?? [],
  };
}

/** [VaultUnlock · Step 6] Called by hydrateFromDisk after successful unlock. */
export async function loadPersistedVaultShape(
  vaultKey: Uint8Array,
): Promise<{ shape: VaultPersistShape; migrated: boolean }> {
  try {
    const raw = await SecureStore.getItemAsync(VAULT_KEY);
    if (!raw) return { shape: emptyPersist(), migrated: false };
    const { plaintext, migrated } = await decryptVaultBundle(raw, vaultKey);
    const parsed = JSON.parse(plaintext) as VaultPersistShape;
    const shape = normalizePersistShape(parsed);
    if (migrated) {
      await persistVaultShape(shape, vaultKey);
    }
    return { shape, migrated };
  } catch {
    return { shape: emptyPersist(), migrated: false };
  }
}

/** Load without vault key when no PIN is configured (stub-only legacy bundle). */
export async function loadPersistedVaultShapeUnlocked(): Promise<VaultPersistShape> {
  try {
    const raw = await SecureStore.getItemAsync(VAULT_KEY);
    if (!raw) return emptyPersist();
    const { decryptStubValue, isStubEnvelope } = await import('@/lib/crypto');
    if (!isStubEnvelope(raw)) return emptyPersist();
    const json = await decryptStubValue(raw);
    return normalizePersistShape(JSON.parse(json) as VaultPersistShape);
  } catch {
    return emptyPersist();
  }
}

export async function persistVaultShape(
  shape: VaultPersistShape,
  vaultKey: Uint8Array,
): Promise<void> {
  const json = JSON.stringify(shape);
  const enc = await encryptVaultBundle(json, vaultKey);
  await SecureStore.setItemAsync(VAULT_KEY, enc);
}

/** [VaultUnlock · Steps 1, 5] Presence check (Step 1) and load for verify (Step 5). */
export async function readPinEnvelope(): Promise<string | null> {
  return SecureStore.getItemAsync(PIN_HASH_KEY);
}

export async function writePinEnvelope(value: string | null): Promise<void> {
  if (value === null) {
    await SecureStore.deleteItemAsync(PIN_HASH_KEY);
    return;
  }
  await SecureStore.setItemAsync(PIN_HASH_KEY, value);
}

const LOCK_TIMEOUT_KEY = 'vault_lock_after_seconds_v1';
const PIN_LENGTH_KEY = 'vault_pin_length_v1';

export async function readStoredPinLength(): Promise<string | null> {
  return SecureStore.getItemAsync(PIN_LENGTH_KEY);
}

export async function writeStoredPinLength(length: number): Promise<void> {
  await SecureStore.setItemAsync(PIN_LENGTH_KEY, String(length));
}

/** Persist lock timeout ; use sentinel 'never' for infinite delay. */

export async function saveStoredLockTimeout(seconds: number): Promise<void> {
  const serialized = seconds === Number.POSITIVE_INFINITY ? 'never' : String(seconds);
  await SecureStore.setItemAsync(LOCK_TIMEOUT_KEY, serialized);
}

/** [VaultUnlock · Step 1] Restored by VaultColdBoot for Step 8 auto-lock timing. */
export async function loadStoredLockTimeout(): Promise<number | null> {
  const raw = await SecureStore.getItemAsync(LOCK_TIMEOUT_KEY);
  if (raw === null) return null;
  if (raw === 'never') return Number.POSITIVE_INFINITY;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
