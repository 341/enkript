// [VaultUnlock · Step 6] In-memory vault; hydrateFromDisk after unlock, clearMemoryForLock on lock.
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';

import { registerCredentials } from '@/lib/autofill-registry';
import type {
  PairedBrowserDevice,
  PasswordEntry,
  PasskeyEntry,
  SanitizedCredentialEntry,
} from '@/lib/types';
import { matchDomain } from '@/lib/domain-match';
import type { ImportPreviewRow } from '@/lib/import-export-service';
import { loadPersistedVaultShape, persistVaultShape } from '@/lib/vault-repository';

function entryDedupeKey(title: string, username: string) {
  return `${title.trim().toLowerCase()}||${username.trim().toLowerCase()}`;
}

type VaultPersistActions = {
  hydrated: boolean;
  passwords: PasswordEntry[];
  passkeys: PasskeyEntry[];
  pairedDevices: PairedBrowserDevice[];
  hydrateFromDisk: () => Promise<void>;
  persistNow: () => Promise<void>;
  clearMemoryForLock: () => void;
  upsertCredentialsForAutofill: () => Promise<void>;
  addPassword: (partial: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePassword: (id: string, patch: Partial<PasswordEntry>) => Promise<void>;
  removePassword: (id: string) => Promise<void>;
  credentialsForBridgeDomain: (domain: string) => SanitizedCredentialEntry[];
  getPasswordById: (id: string) => PasswordEntry | undefined;
  importPreviewRows: (rows: ImportPreviewRow[]) => Promise<{ imported: number; skipped: number }>;
  addPasskeyEntry: (entry: PasskeyEntry) => Promise<void>;
  updatePasskey: (id: string, patch: Partial<PasskeyEntry>) => Promise<void>;
  removePasskey: (id: string) => Promise<void>;
  addPairedDevice: (device: PairedBrowserDevice) => Promise<void>;
  revokeDevice: (id: string) => Promise<void>;
};

export const useVaultStore = create<VaultPersistActions>((set, get) => ({
  hydrated: false,
  passwords: [],
  passkeys: [],
  pairedDevices: [],
  // [VaultUnlock · Step 6] SecureStore read + decrypt + parse — runs after PIN verify on /lock (perf hotspot).
  hydrateFromDisk: async () => {
    const data = await loadPersistedVaultShape();
    set({
      passwords: data.passwords ?? [],
      passkeys: data.passkeys ?? [],
      pairedDevices: data.pairedDevices ?? [],
      hydrated: true,
    });
  },
  persistNow: async () => {
    await persistVaultShape({
      passwords: get().passwords,
      passkeys: get().passkeys,
      pairedDevices: get().pairedDevices,
    });
    await registerCredentials(get().passwords);
  },
  upsertCredentialsForAutofill: async () => {
    await registerCredentials(get().passwords);
  },
  // [VaultUnlock · Step 8] Wipe secrets from RAM when locking (auto-sleep or 5 failed PINs).
  clearMemoryForLock: () => {
    set({
      passwords: [],
      passkeys: [],
      pairedDevices: [],
      hydrated: true,
    });
  },
  addPassword: async (partial) => {
    const now = Date.now();
    const entry: PasswordEntry = {
      id: Crypto.randomUUID(),
      title: partial.title,
      username: partial.username,
      password: partial.password,
      url: partial.url,
      notes: partial.notes,
      category: partial.category,
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ passwords: [entry, ...s.passwords] }));
    await get().persistNow();
  },
  updatePassword: async (id, patch) => {
    set((s) => ({
      passwords: s.passwords.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
      ),
    }));
    await get().persistNow();
  },
  removePassword: async (id) => {
    set((s) => ({ passwords: s.passwords.filter((p) => p.id !== id) }));
    await get().persistNow();
  },
  credentialsForBridgeDomain: (domain) => {
    return get().passwords
      .filter((p) => matchDomain(domain, { url: p.url }, { allowSubdomains: true }))
      .map((p) => ({
        id: p.id,
        title: p.title,
        username: p.username,
        url: p.url,
      }));
  },
  getPasswordById: (id) => get().passwords.find((p) => p.id === id),
  importPreviewRows: async (rows) => {
    const existing = new Set(get().passwords.map((p) => entryDedupeKey(p.title, p.username)));
    let imported = 0;
    let skipped = 0;
    const now = Date.now();
    const additions: PasswordEntry[] = [];
    for (const row of rows) {
      const key = entryDedupeKey(row.title, row.username);
      if (existing.has(key)) {
        skipped += 1;
        continue;
      }
      existing.add(key);
      additions.push({
        id: Crypto.randomUUID(),
        title: row.title,
        username: row.username,
        password: row.password,
        url: row.url ?? '',
        notes: row.notes ?? '',
        category: row.category ?? 'other',
        createdAt: now,
        updatedAt: now,
      });
      imported += 1;
    }
    if (additions.length) {
      set((s) => ({ passwords: [...additions, ...s.passwords] }));
    }
    await get().persistNow();
    return { imported, skipped };
  },
  addPasskeyEntry: async (entry) => {
    set((s) => ({ passkeys: [entry, ...s.passkeys] }));
    await get().persistNow();
  },
  updatePasskey: async (id, patch) => {
    set((s) => ({
      passkeys: s.passkeys.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
    await get().persistNow();
  },
  removePasskey: async (id) => {
    set((s) => ({ passkeys: s.passkeys.filter((p) => p.id !== id) }));
    await get().persistNow();
  },
  addPairedDevice: async (device) => {
    set((s) => ({ pairedDevices: [device, ...s.pairedDevices.filter((d) => d.id !== device.id)] }));
    await get().persistNow();
  },
  revokeDevice: async (id) => {
    set((s) => ({ pairedDevices: s.pairedDevices.filter((d) => d.id !== id) }));
    await get().persistNow();
  },
}));

export const usePasswordStore = useVaultStore;
