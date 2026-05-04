import { p256 } from '@noble/curves/nist.js';
import { sha256 } from '@noble/hashes/sha2.js';
import * as Crypto from 'expo-crypto';

import { decryptValue, encryptValue } from '@/lib/crypto';
import type { PasskeyEntry } from '@/lib/types';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  let safe = hex;
  if (safe.length % 2) safe = `0${safe}`;
  const out = new Uint8Array(safe.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(safe.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function bytesToBase64Url(data: Uint8Array): string {
  let bin = '';
  data.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createPasskeyEntry(init: {
  rpId: string;
  rpName: string;
  userId: string;
  userName: string;
  userDisplayName: string;
  backedUp?: boolean;
}): Promise<PasskeyEntry> {
  const { secretKey, publicKey } = p256.keygen();
  const credentialIdBuf = Crypto.getRandomBytes(16);
  const id = Crypto.randomUUID();
  const entry: PasskeyEntry = {
    id,
    rpId: init.rpId,
    rpName: init.rpName,
    userId: init.userId,
    userName: init.userName,
    userDisplayName: init.userDisplayName,
    credentialId: bytesToBase64Url(credentialIdBuf),
    privateKeyEncrypted: await encryptValue(bytesToHex(secretKey)),
    publicKeyBase64Url: bytesToBase64Url(publicKey),
    signCount: 0,
    createdAt: Date.now(),
    lastUsedAt: Date.now(),
    backedUp: init.backedUp ?? false,
  };
  return entry;
}

/** WebAuthn-style digest wiring for authenticators: SHA256(aut || clientDataHash). */
export function buildAssertionDigest(
  authenticatorData: Uint8Array,
  clientDataHash: Uint8Array,
): Uint8Array {
  const concat = new Uint8Array(authenticatorData.byteLength + clientDataHash.byteLength);
  concat.set(authenticatorData, 0);
  concat.set(clientDataHash, authenticatorData.byteLength);
  return sha256(concat);
}

export async function signAssertionDigest(
  entry: PasskeyEntry,
  digest: Uint8Array,
): Promise<{ compactSignature: Uint8Array; nextSignCount: number }> {
  const hex = await decryptValue(entry.privateKeyEncrypted);
  const secretKey = hexToBytes(hex);
  const sig = p256.sign(digest, secretKey, { prehash: false }) as unknown as {
    toBytes: (format?: string) => Uint8Array;
  };
  const compactSignature = sig.toBytes('compact');
  const nextSignCount = entry.signCount + 1;
  return { compactSignature, nextSignCount };
}

export function deletePasskeyId(list: PasskeyEntry[], id: string): PasskeyEntry[] {
  return list.filter((p) => p.id !== id);
}

export function findPasskeys(entries: PasskeyEntry[], rpId?: string): PasskeyEntry[] {
  if (!rpId) return entries;
  const host = rpId.replace(/^www\./, '').split('/')[0] ?? rpId;
  return entries.filter(
    (p) =>
      p.rpId === host ||
      host.endsWith(p.rpId) ||
      p.rpId.endsWith(host),
  );
}
