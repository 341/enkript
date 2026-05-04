import * as Crypto from 'expo-crypto';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const NUM = '23456789';
const SYM = '!@#$%^&*()-_=+[]{}';

export type GeneratorFlags = {
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
};

export function countEnabledTypes(f: GeneratorFlags): number {
  return Number(f.upper) + Number(f.lower) + Number(f.number) + Number(f.symbol);
}

function buildPool(flags: GeneratorFlags): string {
  let s = '';
  if (flags.upper) s += UPPER;
  if (flags.lower) s += LOWER;
  if (flags.number) s += NUM;
  if (flags.symbol) s += SYM;
  return s || LOWER;
}

function pickRandom(chars: string): string {
  if (!chars.length) return '';
  const i = Crypto.getRandomBytes(1)[0]! % chars.length;
  return chars[i]!;
}

export function generateSecurePassword(length: number, flags: GeneratorFlags): string {
  const pool = buildPool(flags);
  if (pool.length === 0 || length < 8) return '';
  const required: string[] = [];
  if (flags.upper) required.push(pickRandom(UPPER));
  if (flags.lower) required.push(pickRandom(LOWER));
  if (flags.number) required.push(pickRandom(NUM));
  if (flags.symbol) required.push(pickRandom(SYM));
  const fillerLen = Math.max(0, length - required.length);
  const out: string[] = required.slice(0, Math.min(required.length, length));
  while (out.length < length) {
    out.push(pickRandom(pool));
  }
  shuffleInPlace(out);
  return out.slice(0, length).join('');
}

function shuffleInPlace(arr: string[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Crypto.getRandomBytes(1)[0]! % (i + 1);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
}
