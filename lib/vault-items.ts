import type {
  LoginVaultItem,
  PasswordEntry,
  PaymentCardEntry,
  SecureNoteEntry,
  VaultItem,
  VaultPersistShape,
} from '@/lib/types';

export function passwordToLoginItem(entry: PasswordEntry): LoginVaultItem {
  return { ...entry, type: 'login' };
}

export function loginItemToPassword(entry: LoginVaultItem): PasswordEntry {
  const { type: _type, ...rest } = entry;
  return rest;
}

export function normalizeVaultItems(shape: VaultPersistShape): VaultItem[] {
  const fromItems = shape.items ?? [];
  if (fromItems.length > 0) {
    return fromItems.map((item) => {
      if (item.type === 'login') return item;
      return item;
    });
  }
  return (shape.passwords ?? []).map(passwordToLoginItem);
}

export function passwordsFromShape(shape: VaultPersistShape): PasswordEntry[] {
  const items = normalizeVaultItems(shape);
  return items.filter((i): i is LoginVaultItem => i.type === 'login').map(loginItemToPassword);
}

export function notesFromShape(shape: VaultPersistShape): SecureNoteEntry[] {
  const items = normalizeVaultItems(shape);
  return items.filter((i) => i.type === 'note').map(({ type: _t, ...rest }) => rest);
}

export function cardsFromShape(shape: VaultPersistShape): PaymentCardEntry[] {
  const items = normalizeVaultItems(shape);
  return items.filter((i) => i.type === 'card').map(({ type: _t, ...rest }) => rest);
}

export function shapeFromVaultState(input: {
  passwords: PasswordEntry[];
  notes: SecureNoteEntry[];
  cards: PaymentCardEntry[];
  passkeys: VaultPersistShape['passkeys'];
  pairedDevices: VaultPersistShape['pairedDevices'];
  folders: VaultPersistShape['folders'];
}): VaultPersistShape {
  const items: VaultItem[] = [
    ...input.passwords.map(passwordToLoginItem),
    ...input.notes.map((n) => ({ ...n, type: 'note' as const })),
    ...input.cards.map((c) => ({ ...c, type: 'card' as const })),
  ];
  return {
    version: 1,
    passwords: input.passwords,
    items,
    folders: input.folders ?? [],
    passkeys: input.passkeys,
    pairedDevices: input.pairedDevices,
  };
}
