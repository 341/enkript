export type PasswordCategory = 'social' | 'work' | 'finance' | 'shopping' | 'other';

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  category: PasswordCategory;
  createdAt: number;
  updatedAt: number;
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
  passwords: PasswordEntry[];
  passkeys: PasskeyEntry[];
  pairedDevices: PairedBrowserDevice[];
}
