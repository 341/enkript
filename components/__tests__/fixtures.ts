import type { PasskeyEntry, PasswordEntry } from '@/lib/types';

export const mockPasswordEntry: PasswordEntry = {
  id: 'pwd-1',
  title: 'GitHub',
  username: 'dev@example.com',
  password: 'secret',
  url: 'https://github.com',
  notes: '',
  category: 'work',
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
};

export const mockPasskeyEntry: PasskeyEntry = {
  id: 'pk-1',
  rpId: 'example.com',
  rpName: 'Example Corp',
  userId: 'uid',
  userName: 'user@example.com',
  userDisplayName: 'User',
  credentialId: 'cred',
  privateKeyEncrypted: 'enc',
  publicKeyBase64Url: 'key',
  signCount: 0,
  createdAt: 1_700_000_000_000,
  lastUsedAt: 1_700_000_000_000,
  backedUp: true,
};
