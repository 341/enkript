import { generateTotpCode, parseOtpauthUrl } from '@/lib/totp';

describe('totp', () => {
  it('parses otpauth URL', () => {
    const parsed = parseOtpauthUrl('otpauth://totp/Example:alice?secret=JBSWY3DPEHPK3PXP&issuer=Example');
    expect(parsed?.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(parsed?.period).toBe(30);
  });

  it('generates 6-digit code for known secret', () => {
    const { code } = generateTotpCode('JBSWY3DPEHPK3PXP', {
      nowMs: 59_000,
      period: 30,
      digits: 6,
    });
    expect(code).toMatch(/^\d{6}$/);
  });
});
