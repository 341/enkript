import * as Crypto from 'expo-crypto';

/** Base64-url encoding without pulling heavy crypto libs. */
export function bufferToBase64Url(buf: Uint8Array): string {
  let bin = '';
  buf.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return globalThis.btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function randomPairingSecret(bytes = 32): string {
  return bufferToBase64Url(Crypto.getRandomBytes(bytes));
}
