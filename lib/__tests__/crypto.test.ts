import {
  decryptPinEnvelope,
  decryptStubValue,
  decryptWithVaultKey,
  encryptPinEnvelope,
  encryptWithVaultKey,
  deriveVaultKey,
  isStubEnvelope,
  isVaultV2Envelope,
} from '@/lib/crypto';
import { KDF_SALT_BYTES } from '@/lib/crypto-types';
import { decryptVaultBundle, encryptVaultBundle } from '@/lib/vault-migration';

describe('crypto envelope', () => {
  const salt = new Uint8Array(KDF_SALT_BYTES).fill(7);
  const pin = '123456';

  it('round-trips PIN stub envelope', async () => {
    const plain = 'café 🔐 vaultstub';
    const secret = await encryptPinEnvelope(plain);
    expect(isStubEnvelope(secret)).toBe(true);
    await expect(decryptPinEnvelope(secret)).resolves.toBe(plain);
  });

  it('rejects invalid PIN envelope prefix', async () => {
    await expect(decryptPinEnvelope('other:blah')).rejects.toThrow('Invalid PIN envelope');
  });

  it('round-trips vault v2 with derived key', async () => {
    const vaultKey = await deriveVaultKey(pin, salt);
    const plain = '{"passwords":[]}';
    const secret = await encryptWithVaultKey(plain, vaultKey);
    expect(isVaultV2Envelope(secret)).toBe(true);
    await expect(decryptWithVaultKey(secret, vaultKey)).resolves.toBe(plain);
  });

  it('rejects vault v2 with wrong key', async () => {
    const vaultKey = await deriveVaultKey(pin, salt);
    const wrongKey = await deriveVaultKey('654321', salt);
    const secret = await encryptWithVaultKey('secret', vaultKey);
    await expect(decryptWithVaultKey(secret, wrongKey)).rejects.toThrow();
  });

  it('migrates stub bundle to v2', async () => {
    const stubPlain = '{"passwords":[{"id":"1"}]}';
    const stubSecret = `vaultstub:v1:${globalThis.btoa(unescape(encodeURIComponent(stubPlain)))}`;
    const vaultKey = await deriveVaultKey(pin, salt);
    const { plaintext, migrated } = await decryptVaultBundle(stubSecret, vaultKey);
    expect(migrated).toBe(true);
    expect(plaintext).toBe(stubPlain);
    const v2 = await encryptVaultBundle(plaintext, vaultKey);
    expect(isVaultV2Envelope(v2)).toBe(true);
    await expect(decryptStubValue(stubSecret)).resolves.toBe(stubPlain);
  });
});
