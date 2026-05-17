// [VaultUnlock · Step 5] Stub envelope for PIN hash and vault bundle (base64 under vaultstub:v1).
const PREFIX = 'vaultstub:v1';

function encodeBase64Utf8(text: string): string {
  return globalThis.btoa(unescape(encodeURIComponent(text)));
}

function decodeBase64Utf8(b64: string): string {
  return decodeURIComponent(escape(globalThis.atob(b64)));
}

/** [VaultUnlock · Step 5] Wraps bcrypt hash (PIN) and vault JSON before SecureStore write. */
export async function encryptValue(plain: string): Promise<string> {
  return `${PREFIX}:${encodeBase64Utf8(plain)}`;
}

/** [VaultUnlock · Steps 5–6] Unwrap after SecureStore read in verifyPinCode / loadPersistedVaultShape. */
export async function decryptValue(secret: string): Promise<string> {
  if (!secret.startsWith(`${PREFIX}:`)) {
    throw new Error('Invalid ciphertext format');
  }
  return decodeBase64Utf8(secret.slice(PREFIX.length + 1));
}
