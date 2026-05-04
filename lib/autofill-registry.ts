import { Platform } from 'react-native';

import type { PasswordEntry } from '@/lib/types';

/**
 * Credential provider registration placeholder.
 * ASCredentialIdentityStore and Android Autofill Service require native module wiring beyond Expo Go.
 */
export async function registerCredentials(_entries: PasswordEntry[]): Promise<void> {
  if (Platform.OS === 'ios') {
    return;
  }
  await Promise.resolve();
}
