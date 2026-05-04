function charsetBits(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 32;
  return Math.max(size, 2);
}

export function estimatePasswordEntropyBits(password: string): number {
  if (!password.length) return 0;
  const charset = charsetBits(password);
  return Math.round(password.length * Math.log2(charset));
}

export type StrengthLabel = 'Weak' | 'Medium' | 'Strong';

export function strengthFromEntropy(bits: number): StrengthLabel {
  if (bits < 40) return 'Weak';
  if (bits <= 70) return 'Medium';
  return 'Strong';
}
