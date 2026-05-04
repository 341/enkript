/** Decode RFC4648-ish base64 (URL-safe tolerated) into bytes. Returns null when invalid or empty input. */
export function decodeBase64Maybe(value: string | undefined | null): Uint8Array | null {
  if (!value) return null;
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4 === 0 ? '' : '===='.slice(0, 4 - (normalized.length % 4));
    const bin = globalThis.atob(normalized + pad);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)!;
    return buf;
  } catch {
    return null;
  }
}
