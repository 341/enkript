/** Domain match aligned with mobile lib/domain-match.js (simplified). */
export function hostMatches(domain, url) {
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
    const needle = domain.replace(/^www\./, '').split('/')[0];
    return host === needle || host.endsWith(`.${needle}`) || needle.endsWith(host);
  } catch {
    return false;
  }
}

export function queryCredentialsForDomain(entries, domain) {
  return entries.filter((e) => hostMatches(domain, e.url || domain));
}
