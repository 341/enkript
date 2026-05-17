import { estimatePasswordEntropyBits } from '@/lib/password-entropy';
import type { PasswordEntry } from '@/lib/types';

export type HealthIssueKind = 'weak' | 'reused' | 'stale';

export interface HealthIssue {
  kind: HealthIssueKind;
  entryId: string;
  title: string;
  detail: string;
}

const WEAK_BITS_THRESHOLD = 50;
const STALE_MS = 365 * 24 * 60 * 60 * 1000;

export function analyzeVaultHealth(
  passwords: PasswordEntry[],
  nowMs = Date.now(),
): HealthIssue[] {
  const issues: HealthIssue[] = [];
  const byPassword = new Map<string, PasswordEntry[]>();

  for (const entry of passwords) {
    const bits = estimatePasswordEntropyBits(entry.password);
    if (bits < WEAK_BITS_THRESHOLD) {
      issues.push({
        kind: 'weak',
        entryId: entry.id,
        title: entry.title,
        detail: `Low entropy (~${Math.round(bits)} bits)`,
      });
    }
    if (nowMs - entry.updatedAt > STALE_MS) {
      issues.push({
        kind: 'stale',
        entryId: entry.id,
        title: entry.title,
        detail: 'Not updated in over a year',
      });
    }
    const key = entry.password;
    if (!key) continue;
    const group = byPassword.get(key) ?? [];
    group.push(entry);
    byPassword.set(key, group);
  }

  for (const [, group] of byPassword) {
    if (group.length < 2) continue;
    for (const entry of group) {
      issues.push({
        kind: 'reused',
        entryId: entry.id,
        title: entry.title,
        detail: `Same password as ${group.length - 1} other login(s)`,
      });
    }
  }

  return issues;
}

export function healthSummary(issues: HealthIssue[]): Record<HealthIssueKind, number> {
  return {
    weak: issues.filter((i) => i.kind === 'weak').length,
    reused: issues.filter((i) => i.kind === 'reused').length,
    stale: issues.filter((i) => i.kind === 'stale').length,
  };
}
