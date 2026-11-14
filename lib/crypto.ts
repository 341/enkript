import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { argon2idAsync } from '@noble/hashes/argon2.js';
import * as ExpoCrypto from 'expo-crypto';

import {
  AEAD_NONCE_BYTES,
  ARGON2_PARAMS,
  STUB_PREFIX,
  VAULT_V2_PREFIX,
  VAULT_KEY_BYTES,
} from '@/lib/crypto-types';

function encodeBase64Utf8(text: string): string {
  return globalThis.btoa(unescape(encodeURIComponent(text)));
}

function decodeBase64Utf8(b64: string): string {
  return decodeURIComponent(escape(globalThis.atob(b64)));
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return globalThis.btoa(bin);
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = globalThis.atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function isStubEnvelope(secret: string): boolean {
  return secret.startsWith(`${STUB_PREFIX}:`);
}

export function isVaultV2Envelope(secret: string): boolean {
  return secret.startsWith(`${VAULT_V2_PREFIX}:`);
}

/** PIN bcrypt hash envelope only — not vault data (verified before KDF). */
export async function encryptPinEnvelope(plain: string): Promise<string> {
  return `${STUB_PREFIX}:${encodeBase64Utf8(plain)}`;
}

export async function decryptPinEnvelope(secret: string): Promise<string> {
  if (!isStubEnvelope(secret)) {
    throw new Error('Invalid PIN envelope format');
  }
  return decodeBase64Utf8(secret.slice(STUB_PREFIX.length + 1));
}

/** @deprecated Use encryptPinEnvelope for PIN hash; vault bundle uses encryptWithVaultKey. */
export async function encryptValue(plain: string): Promise<string> {
  return encryptPinEnvelope(plain);
}

/** @deprecated Use decryptPinEnvelope or decryptWithVaultKey. */
export async function decryptValue(secret: string, vaultKey?: Uint8Array): Promise<string> {
  if (vaultKey) {
    return decryptWithVaultKey(secret, vaultKey);
  }
  if (isVaultV2Envelope(secret)) {
    throw new Error('Vault is locked');
  }
  if (isStubEnvelope(secret)) {
    return decryptStubValue(secret);
  }
  throw new Error('Invalid ciphertext format');
}

export async function decryptStubValue(secret: string): Promise<string> {
  if (!isStubEnvelope(secret)) {
    throw new Error('Invalid stub ciphertext format');
  }
  return decodeBase64Utf8(secret.slice(STUB_PREFIX.length + 1));
}

/**
 * Argon2id in JS. Hermes has no WebAssembly, so hash-wasm cannot run on device.
 * Output matches hash-wasm for the same PIN, salt, and ARGON2_PARAMS.
 */
export async function deriveVaultKey(pin: string, salt: Uint8Array): Promise<Uint8Array> {
  return argon2idAsync(pin, salt, {
    t: ARGON2_PARAMS.iterations,
    m: ARGON2_PARAMS.memorySize,
    p: ARGON2_PARAMS.parallelism,
    dkLen: ARGON2_PARAMS.hashLength,
  });
}

export async function encryptWithVaultKey(plain: string, vaultKey: Uint8Array): Promise<string> {
  if (vaultKey.length !== VAULT_KEY_BYTES) {
    throw new Error('Invalid vault key');
  }
  const nonce = ExpoCrypto.getRandomBytes(AEAD_NONCE_BYTES);
  const cipher = xchacha20poly1305(vaultKey, nonce);
  const plaintext = new TextEncoder().encode(plain);
  const sealed = cipher.encrypt(plaintext);
  const payload = new Uint8Array(nonce.length + sealed.length);
  payload.set(nonce, 0);
  payload.set(sealed, nonce.length);
  return `${VAULT_V2_PREFIX}:${bytesToBase64(payload)}`;
}

export async function decryptWithVaultKey(secret: string, vaultKey: Uint8Array): Promise<string> {
  if (!isVaultV2Envelope(secret)) {
    throw new Error('Invalid vault ciphertext format');
  }
  if (vaultKey.length !== VAULT_KEY_BYTES) {
    throw new Error('Invalid vault key');
  }
  const payload = base64ToBytes(secret.slice(VAULT_V2_PREFIX.length + 1));
  if (payload.length < AEAD_NONCE_BYTES + 16) {
    throw new Error('Truncated vault ciphertext');
  }
  const nonce = payload.slice(0, AEAD_NONCE_BYTES);
  const ciphertext = payload.slice(AEAD_NONCE_BYTES);
  const cipher = xchacha20poly1305(vaultKey, nonce);
  const plain = cipher.decrypt(ciphertext);
  return new TextDecoder().decode(plain);
}
