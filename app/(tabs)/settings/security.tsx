import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import * as React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { PinLengthPicker } from "@/components/vault/pin-length-picker";
import { VaultTextInput } from "@/components/vault/vault-text-field";
import { VaultButton } from '@/components/ui/vault-button';
import { VaultOptionCard } from '@/components/ui/vault-option-card';
import { VaultPanel } from '@/components/ui/vault-panel';
import { VaultSectionLabel } from '@/components/ui/vault-section-label';
import { VaultScreenHeader } from '@/components/ui/vault-screen-header';
import { VaultSettingsRow } from '@/components/ui/vault-settings-row';
import { VaultSwitch } from '@/components/ui/vault-switch';
import { canUseBiometrics } from '@/hooks/useVaultAuth';
import { encryptWithVaultKey } from '@/lib/crypto';
import { getVaultSessionKey, hasVaultSessionKey } from '@/lib/vault-crypto-session';
import { lockVaultSession, unlockVaultWithPin } from '@/lib/unlock-vault';
import { navigateToVaultLock } from '@/lib/navigate-vault-lock';
import { shareTextFile } from "@/lib/import-export-service";
import { saveStoredLockTimeout } from "@/lib/vault-repository";
import { DEFAULT_PIN_LENGTH, isValidPinForLength, type PinLength } from "@/lib/pin-length";
import { getPinLength, hasPinConfigured, setPinCode, verifyPinCode } from "@/lib/pin-session";
import { NEVER_LOCK_SECONDS, useVaultLockStore } from "@/stores/vault-lock-store";
import { useSecurityPrefsStore } from "@/stores/security-prefs-store";
import { useVaultStore } from "@/stores/vault-store";

export default function SecuritySettingsScreen() {
  const [hardware, setHardware] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setHardware(await canUseBiometrics());
    })();
  }, []);

  const biometricUnlock = useSecurityPrefsStore((s) => s.biometricUnlock);
  const setBio = useSecurityPrefsStore((s) => s.setBiometricUnlock);
  const reqPasskeys = useSecurityPrefsStore((s) => s.requireBiometricForPasskeyFill);
  const setReq = useSecurityPrefsStore((s) => s.setRequireBiometricForPasskeyFill);

  const lockAfterSeconds = useVaultLockStore((s) => s.lockAfterSeconds);
  const setLockTimeoutSeconds = useVaultLockStore((s) => s.setLockTimeoutSeconds);

  const lockNow = React.useCallback(() => {
    useVaultLockStore.getState().lock();
    lockVaultSession();
    useVaultStore.getState().clearMemoryForLock();
    navigateToVaultLock();
  }, []);

  async function persistTimeout(seconds: number) {
    setLockTimeoutSeconds(seconds);
    await saveStoredLockTimeout(seconds);
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 140 }}
      className="flex-1 bg-slate-100 dark:bg-navy-950 px-8 pt-20">
      <VaultScreenHeader title="Security" className="mb-12" />

      {hardware ? (
        <VaultSettingsRow
          label="Biometric gate (in vault)"
          subtitle="Face ID / fingerprint before revealing passwords · vault unlock is always PIN"
          control={<VaultSwitch value={biometricUnlock} onValueChange={setBio} />}
        />
      ) : (
        <Text className="text-slate-600 dark:text-slate-500 mb-10">
          Hardware biometrics are unavailable — use a enrolled device profile.
        </Text>
      )}

      <VaultSettingsRow
        label="Require biometric before passkeys"
        control={<VaultSwitch value={reqPasskeys} onValueChange={setReq} />}
      />

      <VaultSectionLabel className="mt-14">lock timing</VaultSectionLabel>
      <View className="gap-y-4 mt-5">
        {([
          ['30 seconds', 30],
          ['1 minute', 60],
          ['5 minutes', 300],
          ['Never', NEVER_LOCK_SECONDS],
        ] as const).map(([label, secs]) => (
          <VaultOptionCard
            key={label}
            label={label}
            selected={lockAfterSeconds === secs}
            onPress={() => persistTimeout(secs)}
          />
        ))}
      </View>

      <VaultButton label="Lock now" variant="secondary" onPress={lockNow} className="mt-10" />

      <PinRotationPanel />

      <VaultButton
        label="Vault health"
        variant="secondary"
        onPress={() => router.push('/(tabs)/settings/vault-health' as never)}
        className="mt-8"
      />

      <PasskeyExporter />
    </ScrollView>
  );
}

function PinRotationPanel() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [newPinLength, setNewPinLength] = React.useState<PinLength>(DEFAULT_PIN_LENGTH);
  const [status, setStatus] = React.useState<string | undefined>();

  React.useEffect(() => {
    void getPinLength().then(setNewPinLength);
  }, []);

  async function submit() {
    setStatus(undefined);
    if (!(await hasPinConfigured())) {
      Alert.alert("No PIN configured", "Set your PIN via the Lock screen wizard.");
      return;
    }
    if (!(await verifyPinCode(current))) {
      setStatus("Current PIN mismatch.");
      return;
    }
    if (!isValidPinForLength(next, newPinLength)) {
      setStatus(`PIN must be exactly ${newPinLength} digits.`);
      return;
    }
    if (next !== confirm) {
      setStatus("Pins do not match.");
      return;
    }
    const { shapeFromVaultState } = await import('@/lib/vault-items');
    const snapshot = shapeFromVaultState({
      passwords: useVaultStore.getState().passwords,
      notes: useVaultStore.getState().notes,
      cards: useVaultStore.getState().cards,
      folders: useVaultStore.getState().folders,
      passkeys: useVaultStore.getState().passkeys,
      pairedDevices: useVaultStore.getState().pairedDevices,
    });
    try {
      await setPinCode(next, newPinLength);
      lockVaultSession();
      await unlockVaultWithPin(next);
      const { persistVaultShape } = await import('@/lib/vault-repository');
      const { getVaultSessionKey } = await import('@/lib/vault-crypto-session');
      await persistVaultShape(snapshot, getVaultSessionKey());
      await useVaultStore.getState().hydrateFromDisk();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not change PIN.';
      setStatus(msg);
      return;
    }
    Alert.alert("PIN updated.");
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <VaultPanel className="mt-10 gap-y-3">
      <Text className="text-slate-900 dark:text-slate-100 text-lg font-semibold">Change PIN</Text>
      <VaultSectionLabel className="mt-2 tracking-[0.35em]">new pin length</VaultSectionLabel>
      <PinLengthPicker value={newPinLength} onChange={setNewPinLength} />
      <VaultTextInput
        variant="pin"
        dense
        secureTextEntry
        keyboardType="number-pad"
        maxLength={6}
        value={current}
        onChangeText={(t) => setCurrent(t.replace(/\D/g, ""))}
        placeholder="Current PIN"
      />
      <VaultTextInput
        variant="pin"
        dense
        secureTextEntry
        keyboardType="number-pad"
        maxLength={newPinLength}
        value={next}
        onChangeText={(t) => setNext(t.replace(/\D/g, ""))}
        placeholder={`New PIN (${newPinLength} digits)`}
      />
      <VaultTextInput
        variant="pin"
        dense
        secureTextEntry
        keyboardType="number-pad"
        maxLength={newPinLength}
        value={confirm}
        onChangeText={(t) => setConfirm(t.replace(/\D/g, ""))}
        placeholder="Confirm new PIN"
      />
      {status ? <Text className="text-rose-600 dark:text-rose-400">{status}</Text> : null}
      <VaultButton label="Save new PIN" onPress={() => submit()} className="mt-4" />
    </VaultPanel>
  );
}

function PasskeyExporter() {
  const entries = useVaultStore((s) => s.passkeys);

  return (
    <VaultPanel className="mt-12">
      <Text className="text-slate-800 dark:text-slate-200 font-semibold">Export encrypted passkeys</Text>
      <Text className="text-xs text-slate-600 dark:text-slate-500 mb-6 leading-relaxed">
        Passkeys can only be recreated from these encrypted backups plus your device trust boundary.
      </Text>
      <VaultButton
        label="Share vault passkeys"
        onPress={async () => {
          try {
            const payload = JSON.stringify(entries);
            if (!hasVaultSessionKey()) {
              Alert.alert("Vault locked", "Unlock the vault before exporting passkeys.");
              return;
            }
            const encrypted = await encryptWithVaultKey(payload, getVaultSessionKey());
            await shareTextFile(encrypted, `passkeys-export-${Crypto.randomUUID()}.txt`, "application/json");
          } catch (err: unknown) {
            Alert.alert("Export failed", String(err instanceof Error ? err.message : err));
          }
        }}
      />
    </VaultPanel>
  );
}
