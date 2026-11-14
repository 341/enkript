import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import type { PasswordEntry } from '@/lib/types';

const AUTOFILL_CACHE_KEY = 'vault_autofill_credentials_v1';

export type AutofillCredentialRecord = {
  id: string;
  title: string;
  username: string;
  url: string;
};

function toRecords(entries: PasswordEntry[]): AutofillCredentialRecord[] {
  return entries.map((e) => ({
    id: e.id,
    title: e.title,
    username: e.username,
    url: e.url,
  }));
}

async function registerCredentialsNative(records: AutofillCredentialRecord[]): Promise<boolean> {
  try {
    const { requireOptionalNativeModule } = await import('expo');
    const mod = requireOptionalNativeModule<{ registerCredentials: (json: string) => Promise<void> }>(
      'VaultAutofill',
    );
    if (!mod?.registerCredentials) return false;
    await mod.registerCredentials(JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

/**
 * Sync credential metadata for OS autofill (native module when built, AsyncStorage fallback).
 */
export async function registerCredentials(entries: PasswordEntry[]): Promise<void> {
  const records = toRecords(entries);
  await AsyncStorage.setItem(AUTOFILL_CACHE_KEY, JSON.stringify(records));
  const nativeOk = await registerCredentialsNative(records);
  if (__DEV__ && Platform.OS !== 'web') {
    console.log('[autofill] registered', records.length, nativeOk ? 'native' : 'cache-only');
  }
}

export async function readCachedAutofillCredentials(): Promise<AutofillCredentialRecord[]> {
  const raw = await AsyncStorage.getItem(AUTOFILL_CACHE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AutofillCredentialRecord[];
  } catch {
    return [];
  }
}
