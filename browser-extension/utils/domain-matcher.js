export function normalizeHost(raw = '') {
  try {
    let host = raw.trim();
    host = host.replace(/^https?:\/\//i, '');
    host = host.replace(/^www\./i, '');
    host = host.split('/')[0] ?? '';
    host = host.split(':')[0] ?? '';
    return host.toLowerCase();
  } catch {
    return '';
  }
}

export function matchDomain(pageUrl = '', credentialUrl = '', allowSubdomains = true) {
  const pageHost = normalizeHost(pageUrl);
  const entryHost = normalizeHost(credentialUrl);
  if (!pageHost || !entryHost) return false;
  if (pageHost === entryHost) return true;
  return allowSubdomains && pageHost.endsWith(`.${entryHost}`);
}
