import { faviconUrlForEntry } from '@/lib/favicon-url';

describe('faviconUrlForEntry', () => {
  it('returns null when host cannot be derived', () => {
    expect(faviconUrlForEntry('')).toBeNull();
    expect(faviconUrlForEntry(undefined)).toBeNull();
  });

  it('builds a google favicon URL from entry URLs', () => {
    expect(faviconUrlForEntry('https://www.github.com/user/repo')).toBe(
      'https://www.google.com/s2/favicons?domain=github.com&sz=64',
    );
    expect(faviconUrlForEntry('https://login.example.co.uk', 128)).toBe(
      'https://www.google.com/s2/favicons?domain=login.example.co.uk&sz=128',
    );
  });
});
