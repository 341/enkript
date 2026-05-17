import { decryptValue, encryptValue } from '@/lib/crypto';

describe('crypto envelope', () => {
  it('round-trips unicode text', async () => {
    const plain = 'café 🔐 vaultstub';
    const secret = await encryptValue(plain);
    expect(secret.startsWith('vaultstub:v1:')).toBe(true);
    await expect(decryptValue(secret)).resolves.toBe(plain);
  });

  it('rejects invalid ciphertext prefix', async () => {
    await expect(decryptValue('other:blah')).rejects.toThrow('Invalid ciphertext format');
  });
});
