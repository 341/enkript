export type PasswordCategory = 'social' | 'work' | 'finance' | 'shopping' | 'other';

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  category: PasswordCategory;
  totpSecret?: string;
  folderId?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface SecureNoteEntry {
  id: string;
  title: string;
  body: string;
  folderId?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PaymentCardEntry {
  id: string;
  title: string;
  cardholder: string;
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  folderId?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export type LoginVaultItem = PasswordEntry & { type: 'login' };
export type NoteVaultItem = SecureNoteEntry & { type: 'note' };
export type CardVaultItem = PaymentCardEntry & { type: 'card' };

export type VaultItem = LoginVaultItem | NoteVaultItem | CardVaultItem;

export interface VaultFolder {
  id: string;
  name: string;
}

export interface SanitizedCredentialEntry {
  id: string;
  title: string;
  username: string;
  url: string;
}

export interface PasskeyEntry {
  id: string;
  rpId: string;
  rpName: string;
  userId: string;
  userName: string;
  userDisplayName: string;
  credentialId: string;
  privateKeyEncrypted: string;
  publicKeyBase64Url: string;
  signCount: number;
  createdAt: number;
  lastUsedAt: number;
  backedUp: boolean;
}

export interface PairedBrowserDevice {
  id: string;
  label: string;
  ua: string;
  connectedAt: number;
}

export interface VaultPersistShape {
  version?: number;
  passwords: PasswordEntry[];
  passkeys: PasskeyEntry[];
  pairedDevices: PairedBrowserDevice[];
  items?: VaultItem[];
  folders?: VaultFolder[];
}
