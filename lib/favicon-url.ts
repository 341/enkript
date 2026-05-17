import { normalizeHost } from '@/lib/domain-match';

/** Remote favicon URL for a password entry URL or host string. */
export function faviconUrlForEntry(url: string | undefined, size = 64): string | null {
  const host = normalizeHost(url ?? '');
  if (!host) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`;
}
