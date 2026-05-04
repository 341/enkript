import * as SecureStore from 'expo-secure-store';

import { decryptValue, encryptValue } from '@/lib/crypto';
import type { VaultPersistShape } from '@/lib/types';

const VAULT_KEY = 'vault_encrypted_bundle_v1';
export const PIN_HASH_KEY = 'vault_pin_bcrypt_via_encrypt_stub_v1';

const emptyPersist = (): VaultPersistShape => ({
  passwords: [],
  passkeys: [],
  pairedDevices: [],
});

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

/** Persist lock timeout ; use sentinel 'never' for infinite delay. */

export async function saveStoredLockTimeout(seconds: number): Promise<void> {
  const serialized = seconds === Number.POSITIVE_INFINITY ? 'never' : String(seconds);
  await SecureStore.setItemAsync(LOCK_TIMEOUT_KEY, serialized);
}

export async function loadStoredLockTimeout(): Promise<number | null> {
  const raw = await SecureStore.getItemAsync(LOCK_TIMEOUT_KEY);
  if (raw === null) return null;
  if (raw === 'never') return Number.POSITIVE_INFINITY;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
