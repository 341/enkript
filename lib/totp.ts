import { hmac } from '@noble/hashes/hmac.js';
import { sha1 } from '@noble/hashes/legacy.js';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function parseOtpauthUrl(url: string): { secret: string; period: number; digits: number } | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'otpauth:') return null;
    const secret = parsed.searchParams.get('secret');
    if (!secret) return null;
    const period = Number(parsed.searchParams.get('period') ?? '30');
    const digits = Number(parsed.searchParams.get('digits') ?? '6');
    return { secret: secret.toUpperCase(), period: Number.isFinite(period) ? period : 30, digits };
  } catch {
    return null;
  }
}

function base32Decode(input: string): Uint8Array {
  const cleaned = input.replace(/=+$/g, '').toUpperCase().replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Uint8Array.from(out);
}

function counterToBytes(counter: number): Uint8Array {
  const buf = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = c & 0xff;
    c = Math.floor(c / 256);
  }
  return buf;
}

export function generateTotpCode(
  secretBase32: string,
  options?: { period?: number; digits?: number; nowMs?: number },
): { code: string; remainingSeconds: number } {
  const period = options?.period ?? 30;
  const digits = options?.digits ?? 6;
  const nowMs = options?.nowMs ?? Date.now();
  const counter = Math.floor(nowMs / 1000 / period);
  const key = base32Decode(secretBase32);
  const digest = hmac(sha1, key, counterToBytes(counter));
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  const otp = String(binary % 10 ** digits).padStart(digits, '0');
  const elapsed = Math.floor(nowMs / 1000) % period;
  return { code: otp, remainingSeconds: period - elapsed };
}
