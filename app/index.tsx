import { Redirect, type Href } from 'expo-router';
import { View } from 'react-native';

import { useBootGateStore } from '@/stores/boot-gate-store';
import { useVaultLockStore } from '@/stores/vault-lock-store';

export default function RootIndex() {
  const sessionReady = useBootGateStore((s) => s.sessionReady);
  const vaultHasPin = useBootGateStore((s) => s.vaultHasPin);
  const locked = useVaultLockStore((s) => s.vaultLocked);

  /* Wait for VaultColdBoot (PIN + locks). Without this, we redirect into tabs before
   * sessionReady turns true — VaultRuntimeNav has nothing to reconcile on first paint. */
  if (!sessionReady) {
    return <View className="flex-1 bg-navy-950" />;
  }

  /* No PIN → must land on /lock for the setup wizard (not tabs). */
  if (!vaultHasPin || locked) {
    return <Redirect href={'/lock' as Href} />;
  }

  return <Redirect href={'/(tabs)/passwords' as Href} />;
}
