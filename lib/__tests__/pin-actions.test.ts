import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';

import { ARGON2_PARAMS } from '@/lib/crypto-types';
import { setPinCode, verifyPinCode } from '@/lib/pin-session';
import { unlockVaultWithPin } from '@/lib/unlock-vault';
import { clearVaultSessionKey, hasVaultSessionKey } from '@/lib/vault-crypto-session';
import { useVaultStore } from '@/stores/vault-store';

const secureStore = SecureStore as typeof SecureStore & { __reset: () => void };
const files = FileSystem as typeof FileSystem & { __reset: () => void };

const productionArgon = {
  iterations: ARGON2_PARAMS.iterations,
  memorySize: ARGON2_PARAMS.memorySize,
  parallelism: ARGON2_PARAMS.parallelism,
};

jest.mock('expo-secure-store', () => {
  const kv = new Map<string, string>();
  return {
    __reset: () => kv.clear(),
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

/**
 * Device PIN setup (`setPinCode` then `unlockVaultWithPin`) with Hermes's
 * missing WebAssembly global. hash-wasm throws before hashing; this must not.
 * Argon2 cost is lowered only here so the action stays fast.
 */
describe('PIN actions without WebAssembly', () => {
  const savedWebAssembly = globalThis.WebAssembly;

  beforeAll(() => {
    // @ts-expect-error Hermes leaves this unset. The assignment models that.
    delete globalThis.WebAssembly;
  });

  afterAll(() => {
    globalThis.WebAssembly = savedWebAssembly;
    ARGON2_PARAMS.iterations = productionArgon.iterations;
    ARGON2_PARAMS.memorySize = productionArgon.memorySize;
    ARGON2_PARAMS.parallelism = productionArgon.parallelism;
  });

  beforeEach(() => {
    ARGON2_PARAMS.iterations = 1;
    ARGON2_PARAMS.memorySize = 8;
    ARGON2_PARAMS.parallelism = 1;
    secureStore.__reset();
    files.__reset();
    clearVaultSessionKey();
    useVaultStore.getState().clearMemoryForLock();
  });

  it('saves a new PIN and unlocks', async () => {
    await expect(setPinCode('123456', 6)).resolves.toBeUndefined();
    await expect(verifyPinCode('123456')).resolves.toBe(true);
    await expect(verifyPinCode('000000')).resolves.toBe(false);

    await expect(unlockVaultWithPin('123456')).resolves.toEqual({ migrated: false });
    expect(hasVaultSessionKey()).toBe(true);
    expect(useVaultStore.getState().hydrated).toBe(true);
  });
});
