import { analyzeVaultHealth, healthSummary } from '@/lib/vault-health';
import type { PasswordEntry } from '@/lib/types';

const base = (overrides: Partial<PasswordEntry>): PasswordEntry => ({
  id: '1',
  title: 'Test',
  username: 'u',
  password: 'short',
  url: '',
  notes: '',
  category: 'other',
  createdAt: 0,
  updatedAt: 0,
  ...overrides,
});

describe('vault-health', () => {
  it('flags weak passwords', () => {
    const issues = analyzeVaultHealth([base({ password: '123' })]);
    expect(issues.some((i) => i.kind === 'weak')).toBe(true);
  });

  it('flags reused passwords', () => {
    const issues = analyzeVaultHealth([
      base({ id: 'a', password: 'same-long-password-value!!' }),
      base({ id: 'b', password: 'same-long-password-value!!' }),
    ]);
    expect(healthSummary(issues).reused).toBeGreaterThan(0);
  });
});
