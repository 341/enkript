// [VaultUnlock · Steps 1, 5] PIN hash storage and verify — bcrypt cost 12 blocks JS thread (perf hotspot).
import bcrypt from 'bcryptjs';
import * as ExpoCrypto from 'expo-crypto';

import { decryptValue, encryptValue } from '@/lib/crypto';
import {
  isPinLength,
  isValidPinForLength,
  parseStoredPinLength,
  type PinLength,
} from '@/lib/pin-length';
import {
  readPinEnvelope,
  readStoredPinLength,
  writePinEnvelope,
  writeStoredPinLength,
} from '@/lib/vault-repository';

// RN has no usable WebCrypto/node `crypto.randomBytes` in this bundle; bcrypt salt gen needs RNG.
bcrypt.setRandomFallback((len) => Array.from(ExpoCrypto.getRandomBytes(len)));

/** [VaultUnlock · Step 5] First-time wizard / PIN change — hashSync(12) is slow on main thread. */
export async function setPinCode(pin: string, length: PinLength): Promise<void> {
  if (!isValidPinForLength(pin, length)) {
    throw new Error(`PIN must be exactly ${length} digits.`);
  }
  const hash = bcrypt.hashSync(pin, 12);
  const env = await encryptValue(hash);
  await writePinEnvelope(env);
  await writeStoredPinLength(length);
}

/** Configured PIN length (defaults to 6 for vaults created before length was stored). */
export async function getPinLength(): Promise<PinLength> {
  const raw = await readStoredPinLength();
  return parseStoredPinLength(raw);
}

export function assertPinLength(length: number): asserts length is PinLength {
  if (!isPinLength(length)) {
    throw new Error(`PIN length must be between 4 and 6.`);
  }
}

/** [VaultUnlock · Step 5] Unlock path: SecureStore → decrypt → compareSync (sequential I/O + CPU). */
export async function verifyPinCode(pin: string): Promise<boolean> {
  const env = await readPinEnvelope();
  if (!env) return false;
  const hash = await decryptValue(env);
  return bcrypt.compareSync(pin, hash);
}

/** [VaultUnlock · Step 1] Used by VaultColdBoot; also re-read on /lock mount (duplicate I/O). */
export async function hasPinConfigured(): Promise<boolean> {
  const env = await readPinEnvelope();
  return env !== null;
}
