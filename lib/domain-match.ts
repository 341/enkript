export function normalizeHost(url: string): string {
  try {
    let normalized = url.trim();
    normalized = normalized.replace(/^https?:\/\//i, '');
    normalized = normalized.replace(/^www\./i, '');
    normalized = normalized.split('/')[0] ?? '';
    normalized = normalized.split(':')[0] ?? '';
    return normalized.toLowerCase();
  } catch {
    return '';
  }
}

export function matchDomain(
  pageUrl: string,
  entries: { url?: string },
  opts?: { allowSubdomains?: boolean },
): boolean {
  const pageHost = normalizeHost(pageUrl);
  const entryHost = normalizeHost(entries.url ?? '');
  if (!pageHost || !entryHost) return false;
  if (pageHost === entryHost) return true;
  if (opts?.allowSubdomains && pageHost.endsWith(`.${entryHost}`)) return true;
  return false;
}
