import { sha1 } from '@noble/hashes/legacy.js';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** k-anonymity range check against HIBP Pwned Passwords API. */
export async function isPasswordPwned(password: string): Promise<{ pwned: boolean; count: number }> {
  const digest = bytesToHex(sha1(new TextEncoder().encode(password))).toUpperCase();
  const prefix = digest.slice(0, 5);
  const suffix = digest.slice(5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  });
  if (!res.ok) {
    throw new Error(`HIBP request failed (${res.status})`);
  }
  const body = await res.text();
  for (const line of body.split('\n')) {
    const [hashSuffix, countStr] = line.split(':');
    if (hashSuffix?.trim() === suffix) {
      return { pwned: true, count: Number(countStr) || 1 };
    }
  }
  return { pwned: false, count: 0 };
}
