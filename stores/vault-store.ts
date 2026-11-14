// [VaultUnlock · Step 6] In-memory vault; hydrateFromDisk after unlock, clearMemoryForLock on lock.
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';

import { registerCredentials } from '@/lib/autofill-registry';
import { clearVaultSessionKey, getVaultSessionKey, hasVaultSessionKey } from '@/lib/vault-crypto-session';
import type {
  PairedBrowserDevice,
  PasswordEntry,
  PaymentCardEntry,
  PasskeyEntry,
  SanitizedCredentialEntry,
  SecureNoteEntry,
  VaultFolder,
  VaultPersistShape,
} from '@/lib/types';
import { matchDomain } from '@/lib/domain-match';
import type { ImportPreviewRow } from '@/lib/import-export-service';
import {
  loadPersistedVaultShape,
  loadPersistedVaultShapeUnlocked,
  persistVaultShape,
} from '@/lib/vault-repository';
import {
  cardsFromShape,
  notesFromShape,
  passwordsFromShape,
  shapeFromVaultState,
} from '@/lib/vault-items';

function entryDedupeKey(title: string, username: string) {
  return `${title.trim().toLowerCase()}||${username.trim().toLowerCase()}`;
}

type VaultPersistActions = {
  hydrated: boolean;
  passwords: PasswordEntry[];
  notes: SecureNoteEntry[];
  cards: PaymentCardEntry[];
  folders: VaultFolder[];
  passkeys: PasskeyEntry[];
  pairedDevices: PairedBrowserDevice[];
  hydrateFromDisk: (vaultKey?: Uint8Array) => Promise<{ migrated: boolean }>;
  hydrateWithoutPin: () => Promise<void>;
  persistNow: () => Promise<void>;
  clearMemoryForLock: () => void;
  upsertCredentialsForAutofill: () => Promise<void>;
  addPassword: (partial: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePassword: (id: string, patch: Partial<PasswordEntry>) => Promise<void>;
  removePassword: (id: string) => Promise<void>;
  addNote: (partial: Omit<SecureNoteEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, patch: Partial<SecureNoteEntry>) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  addCard: (partial: Omit<PaymentCardEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCard: (id: string, patch: Partial<PaymentCardEntry>) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  addFolder: (name: string) => Promise<VaultFolder>;
  removeFolder: (id: string) => Promise<void>;
  credentialsForBridgeDomain: (domain: string) => SanitizedCredentialEntry[];
  getPasswordById: (id: string) => PasswordEntry | undefined;
  getNoteById: (id: string) => SecureNoteEntry | undefined;
  getCardById: (id: string) => PaymentCardEntry | undefined;
  importPreviewRows: (rows: ImportPreviewRow[]) => Promise<{ imported: number; skipped: number }>;
  addPasskeyEntry: (entry: PasskeyEntry) => Promise<void>;
  updatePasskey: (id: string, patch: Partial<PasskeyEntry>) => Promise<void>;
  removePasskey: (id: string) => Promise<void>;
  addPairedDevice: (device: PairedBrowserDevice) => Promise<void>;
  revokeDevice: (id: string) => Promise<void>;
};

/** True only after a successful unlock hydrate. Blocks saves from overwriting a vault we failed to read. */
let vaultWritable = false;

function applyShapeToState(shape: VaultPersistShape) {
  return {
    passwords: passwordsFromShape(shape),
    notes: notesFromShape(shape),
    cards: cardsFromShape(shape),
    folders: shape.folders ?? [],
    passkeys: shape.passkeys ?? [],
    pairedDevices: shape.pairedDevices ?? [],
  };
}

export const useVaultStore = create<VaultPersistActions>((set, get) => ({
  hydrated: false,
  passwords: [],
  notes: [],
  cards: [],
  folders: [],
  passkeys: [],
  pairedDevices: [],

  hydrateFromDisk: async (vaultKey) => {
    const effectiveKey = vaultKey ?? (hasVaultSessionKey() ? getVaultSessionKey() : null);
    if (!effectiveKey) {
      throw new Error('Vault key required');
    }
    const { shape, migrated } = await loadPersistedVaultShape(effectiveKey);
    const applied = applyShapeToState(shape);
    vaultWritable = true;
    set({ ...applied, hydrated: true });
    await registerCredentials(get().passwords);
    return { migrated };
  },

  hydrateWithoutPin: async () => {
    vaultWritable = false;
    const shape = await loadPersistedVaultShapeUnlocked();
    const applied = applyShapeToState(shape);
    set({ ...applied, hydrated: true });
  },

  persistNow: async () => {
    if (!vaultWritable) {
      throw new Error('Vault is not open for writing. Nothing was overwritten.');
    }
    const vaultKey = getVaultSessionKey();
    const shape = shapeFromVaultState({
      passwords: get().passwords,
      notes: get().notes,
      cards: get().cards,
      folders: get().folders,
      passkeys: get().passkeys,
      pairedDevices: get().pairedDevices,
    });
    await persistVaultShape(shape, vaultKey);
    await registerCredentials(get().passwords);
  },

  upsertCredentialsForAutofill: async () => {
    await registerCredentials(get().passwords);
  },

  clearMemoryForLock: () => {
    vaultWritable = false;
    clearVaultSessionKey();
    set({
      passwords: [],
      notes: [],
      cards: [],
      folders: [],
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
      totpSecret: partial.totpSecret,
      folderId: partial.folderId,
      tags: partial.tags,
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

  addNote: async (partial) => {
    const now = Date.now();
    const entry: SecureNoteEntry = {
      id: Crypto.randomUUID(),
      ...partial,
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ notes: [entry, ...s.notes] }));
    await get().persistNow();
  },

  updateNote: async (id, patch) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
    }));
    await get().persistNow();
  },

  removeNote: async (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    await get().persistNow();
  },

  addCard: async (partial) => {
    const now = Date.now();
    const entry: PaymentCardEntry = {
      id: Crypto.randomUUID(),
      ...partial,
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ cards: [entry, ...s.cards] }));
    await get().persistNow();
  },

  updateCard: async (id, patch) => {
    set((s) => ({
      cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)),
    }));
    await get().persistNow();
  },

  removeCard: async (id) => {
    set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }));
    await get().persistNow();
  },

  addFolder: async (name) => {
    const folder: VaultFolder = { id: Crypto.randomUUID(), name: name.trim() };
    set((s) => ({ folders: [...s.folders, folder] }));
    await get().persistNow();
    return folder;
  },

  removeFolder: async (id) => {
    set((s) => ({
      folders: s.folders.filter((f) => f.id !== id),
      passwords: s.passwords.map((p) => (p.folderId === id ? { ...p, folderId: undefined } : p)),
      notes: s.notes.map((n) => (n.folderId === id ? { ...n, folderId: undefined } : n)),
      cards: s.cards.map((c) => (c.folderId === id ? { ...c, folderId: undefined } : c)),
    }));
    await get().persistNow();
  },

  credentialsForBridgeDomain: (domain) => {
    return get()
      .passwords.filter((p) => matchDomain(domain, { url: p.url }, { allowSubdomains: true }))
      .map((p) => ({
        id: p.id,
        title: p.title,
        username: p.username,
        url: p.url,
      }));
  },

  getPasswordById: (id) => get().passwords.find((p) => p.id === id),
  getNoteById: (id) => get().notes.find((n) => n.id === id),
  getCardById: (id) => get().cards.find((c) => c.id === id),

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
        totpSecret: row.totpSecret,
        tags: [],
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
    set((s) => ({
      pairedDevices: [device, ...s.pairedDevices.filter((d) => d.id !== device.id)],
    }));
    await get().persistNow();
  },

  revokeDevice: async (id) => {
    set((s) => ({ pairedDevices: s.pairedDevices.filter((d) => d.id !== id) }));
    await get().persistNow();
  },
}));

export const usePasswordStore = useVaultStore;
