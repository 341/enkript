import bcrypt from 'bcryptjs';
import * as ExpoCrypto from 'expo-crypto';

import { decryptValue, encryptValue } from '@/lib/crypto';
import { readPinEnvelope, writePinEnvelope } from '@/lib/vault-repository';

// RN has no usable WebCrypto/node `crypto.randomBytes` in this bundle; bcrypt salt gen needs RNG.
bcrypt.setRandomFallback((len) => Array.from(ExpoCrypto.getRandomBytes(len)));

export async function setPinCode(pin: string): Promise<void> {
  const hash = bcrypt.hashSync(pin, 12);
  const env = await encryptValue(hash);
  await writePinEnvelope(env);
}

export async function verifyPinCode(pin: string): Promise<boolean> {
  const env = await readPinEnvelope();
  if (!env) return false;
  const hash = await decryptValue(env);
  return bcrypt.compareSync(pin, hash);
}

export async function hasPinConfigured(): Promise<boolean> {
  const env = await readPinEnvelope();
  return env !== null;
}
