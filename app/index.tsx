// [VaultUnlock · Step 2] Route gate after cold boot: blank → /lock or tabs.
import { Redirect, type Href } from 'expo-router';
import { View } from 'react-native';

import { isStorybookSession } from '@/lib/storybook-env';
import { useBootGateStore } from '@/stores/boot-gate-store';
import { useVaultLockStore } from '@/stores/vault-lock-store';

export default function RootIndex() {
  if (isStorybookSession) {
    return <Redirect href={'/storybook' as Href} />;
  }

  const sessionReady = useBootGateStore((s) => s.sessionReady);
  const vaultHasPin = useBootGateStore((s) => s.vaultHasPin);
  const locked = useVaultLockStore((s) => s.vaultLocked);

  // [VaultUnlock · Step 2] Wait for VaultColdBoot — else VaultRuntimeNav has nothing to reconcile.
  if (!sessionReady) {
    return <View className="flex-1 bg-slate-100 dark:bg-navy-950" />;
  }

  // [VaultUnlock · Step 2] No PIN (wizard) or locked → /lock; else unlocked → passwords tab.
  if (!vaultHasPin || locked) {
    return <Redirect href={'/lock' as Href} />;
  }

  return <Redirect href={'/(tabs)/passwords' as Href} />;
}
