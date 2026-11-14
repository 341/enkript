import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';

import { encryptWithVaultKey } from '@/lib/crypto';
import { clearVaultSessionKey, setVaultSessionKey } from '@/lib/vault-crypto-session';
import { VaultUnreadableError } from '@/lib/vault-errors';
import { openDataKey, rewrapDataKey } from '@/lib/vault-key';
import { deriveVaultKeyFromPin, loadPersistedVaultShape, persistVaultShape } from '@/lib/vault-repository';
import { LEGACY_VAULT_BUNDLE_KEY, WRAPPED_DATA_KEY } from '@/lib/vault-storage';
import type { PasswordEntry, VaultPersistShape } from '@/lib/types';
import { useVaultStore } from '@/stores/vault-store';

const secureStore = SecureStore as typeof SecureStore & {
  __reset: () => void;
  __dump: () => Record<string, string>;
};

const files = FileSystem as typeof FileSystem & {
  __reset: () => void;
  __read: () => string | null;
};

const password = (passwordText: string): PasswordEntry => ({
  id: 'p1',
  title: 'Mail',
  username: 'ada',
  password: passwordText,
  url: 'https://mail.example',
  notes: '',
  category: 'other',
  createdAt: 1,
  updatedAt: 1,
});

const shape: VaultPersistShape = {
  version: 1,
  passwords: [],
  passkeys: [],
  pairedDevices: [],
  items: [],
  folders: [],
};

jest.mock('expo-secure-store', () => {
  const kv = new Map<string, string>();
  return {
    __reset: () => kv.clear(),
    __dump: () => Object.fromEntries(kv.entries()),
    getItemAsync: async (key: string) => kv.get(key) ?? null,
    setItemAsync: async (key: string, value: string) => {
      kv.set(key, value);
    },
    deleteItemAsync: async (key: string) => {
      kv.delete(key);
    },
  };
});

jest.mock('expo-file-system/legacy', () => {
  let file: string | null = null;
  return {
    __reset: () => {
      file = null;
    },
    __read: () => file,
    documentDirectory: 'file:///vault/',
    getInfoAsync: async () => ({ exists: file !== null }),
    readAsStringAsync: async () => {
      if (file === null) throw new Error('missing vault file');
      return file;
    },
    writeAsStringAsync: async (_path: string, contents: string) => {
      file = contents;
    },
    deleteAsync: async () => {
      file = null;
    },
  };
});

describe('vault persistence', () => {
  beforeEach(() => {
    secureStore.__reset();
    files.__reset();
    clearVaultSessionKey();
    useVaultStore.getState().clearMemoryForLock();
  });

  it('round-trips a vault under a random data key', async () => {
    const pin = '123456';
    const { dek } = await openDataKey(pin);
    const saved: VaultPersistShape = {
      ...shape,
      passwords: [
        {
          id: 'p1',
          title: 'Bank',
          username: 'ada',
          password: 'correct horse',
          url: 'https://bank.example',
          notes: '',
          category: 'finance',
          createdAt: 1,
          updatedAt: 1,
        },
      ],
    };
    await persistVaultShape(saved, dek);
    clearVaultSessionKey();

    const again = await openDataKey(pin);
    const loaded = await loadPersistedVaultShape(again.dek);
    expect(loaded.shape.passwords[0]?.password).toBe('correct horse');
    expect(secureStore.__dump()[LEGACY_VAULT_BUNDLE_KEY]).toBeUndefined();
    expect(files.__read()).toBeTruthy();
  });

  it('migrates a legacy keychain blob and drops it only after the file exists', async () => {
    const pin = '123456';
    const kek = await deriveVaultKeyFromPin(pin);
    const legacy = await encryptWithVaultKey(JSON.stringify({ ...shape, passkeys: [{ id: 'k' }] }), kek);
    await SecureStore.setItemAsync(LEGACY_VAULT_BUNDLE_KEY, legacy);

    const { dek, migrated } = await openDataKey(pin);
    expect(migrated).toBe(true);
    expect(secureStore.__dump()[LEGACY_VAULT_BUNDLE_KEY]).toBeUndefined();

    const loaded = await loadPersistedVaultShape(dek);
    expect(loaded.migrated).toBe(false);
    expect(loaded.shape.passkeys).toEqual([{ id: 'k' }]);
  });

  it('refuses to replace a vault that cannot be decrypted', async () => {
    const pin = '123456';
    const { dek } = await openDataKey(pin);
    await persistVaultShape(shape, dek);
    const intact = files.__read();

    await expect(loadPersistedVaultShape(new Uint8Array(32).fill(9))).rejects.toBeInstanceOf(
      VaultUnreadableError,
    );
    expect(files.__read()).toBe(intact);

    await expect(useVaultStore.getState().persistNow()).rejects.toThrow(/not open for writing/);
    expect(files.__read()).toBe(intact);
  });

  it('leaves a corrupt legacy blob untouched', async () => {
    await SecureStore.setItemAsync(LEGACY_VAULT_BUNDLE_KEY, 'vault:v2:aaaa');
    await expect(openDataKey('123456')).rejects.toBeInstanceOf(VaultUnreadableError);
    expect(secureStore.__dump()[LEGACY_VAULT_BUNDLE_KEY]).toBe('vault:v2:aaaa');
    expect(secureStore.__dump()[WRAPPED_DATA_KEY]).toBeUndefined();
    expect(files.__read()).toBeNull();
  });

  it('changes the PIN wrapping without changing the data key', async () => {
    const { dek } = await openDataKey('123456');
    await persistVaultShape({ ...shape, passwords: [password('secret')] }, dek);
    setVaultSessionKey(dek);
    await rewrapDataKey('654321');
    clearVaultSessionKey();

    await expect(openDataKey('123456')).rejects.toBeInstanceOf(VaultUnreadableError);
    const unlocked = await openDataKey('654321');
    const loaded = await loadPersistedVaultShape(unlocked.dek);
    expect(loaded.shape.passwords[0]?.password).toBe('secret');
  });
});
