// [VaultUnlock · Steps 1, 5, 6] SecureStore persistence for PIN envelope, vault bundle, lock timeout.
import * as SecureStore from 'expo-secure-store';

import { decryptValue, encryptValue } from '@/lib/crypto';
import type { VaultPersistShape } from '@/lib/types';

/** [VaultUnlock · Step 6] Encrypted passwords/passkeys/devices JSON. */
const VAULT_KEY = 'vault_encrypted_bundle_v1';
/** [VaultUnlock · Step 5] Encrypted bcrypt hash of the 6-digit PIN. */
export const PIN_HASH_KEY = 'vault_pin_bcrypt_via_encrypt_stub_v1';

const emptyPersist = (): VaultPersistShape => ({
  passwords: [],
  passkeys: [],
  pairedDevices: [],
});

/** [VaultUnlock · Step 6] Called by hydrateFromDisk after successful unlock. */
export async function loadPersistedVaultShape(): Promise<VaultPersistShape> {
  try {
    const raw = await SecureStore.getItemAsync(VAULT_KEY);
    if (!raw) return emptyPersist();
    const json = await decryptValue(raw);
    const parsed = JSON.parse(json) as VaultPersistShape;
    return {
      passwords: parsed.passwords ?? [],
      passkeys: parsed.passkeys ?? [],
      pairedDevices: parsed.pairedDevices ?? [],
    };
  } catch {
    return emptyPersist();
  }
}

export async function persistVaultShape(shape: VaultPersistShape): Promise<void> {
  const json = JSON.stringify(shape);
  const enc = await encryptValue(json);
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
