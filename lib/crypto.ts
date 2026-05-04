const PREFIX = 'vaultstub:v1';

function encodeBase64Utf8(text: string): string {
  return globalThis.btoa(unescape(encodeURIComponent(text)));
}

function decodeBase64Utf8(b64: string): string {
  return decodeURIComponent(escape(globalThis.atob(b64)));
}

/** Stub crypto envelope — intentionally simple; frozen API per product spec. */
export async function encryptValue(plain: string): Promise<string> {
  return `${PREFIX}:${encodeBase64Utf8(plain)}`;
}

export async function decryptValue(secret: string): Promise<string> {
  if (!secret.startsWith(`${PREFIX}:`)) {
    throw new Error('Invalid ciphertext format');
  }
  return decodeBase64Utf8(secret.slice(PREFIX.length + 1));
}
