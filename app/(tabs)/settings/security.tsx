import * as Crypto from 'expo-crypto';
import * as React from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';

import { canUseBiometrics } from '@/hooks/useVaultAuth';
import { encryptValue } from '@/lib/crypto';
import { navigateToVaultLock } from '@/lib/navigate-vault-lock';
import { shareTextFile } from "@/lib/import-export-service";
import { saveStoredLockTimeout } from "@/lib/vault-repository";
import { hasPinConfigured, setPinCode, verifyPinCode } from "@/lib/pin-session";
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
    useVaultStore.getState().clearMemoryForLock();
    navigateToVaultLock();
  }, []);

  async function persistTimeout(seconds: number) {
    setLockTimeoutSeconds(seconds);
    await saveStoredLockTimeout(seconds);
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }} className="flex-1 bg-navy-950 px-8 pt-20">
      <Text className="font-display text-3xl text-slate-100 mb-12">Security</Text>

      {hardware ? (
        <Row
          label="Biometric gate (in vault)"
          subtitle="Face ID / fingerprint before revealing passwords · vault unlock is always PIN"
          control={
            <Switch
              value={biometricUnlock}
              onValueChange={setBio}
              trackColor={{ false: "#1B2847", true: "#4F46E5" }}
              thumbColor="#E2E8F0"
            />
          }
        />
      ) : (
        <Text className="text-slate-500 mb-10">
          Hardware biometrics are unavailable — use a enrolled device profile.
        </Text>
      )}

      <Row
        label="Require biometric before passkeys"
        control={
          <Switch value={reqPasskeys} onValueChange={setReq} trackColor={{ false: "#1B2847", true: "#4F46E5" }} thumbColor="#E2E8F0" />
        }
      />

      <Text className="mt-14 text-[11px] text-slate-500 tracking-[0.35em] uppercase">lock timing</Text>
      <View className="gap-y-4 mt-5">
        {([
          ["30 seconds", 30],
          ["1 minute", 60],
          ["5 minutes", 300],
          ["Never", NEVER_LOCK_SECONDS],
        ] as const).map(([label, secs]) => (
          <Pressable
            key={label}
            accessibilityRole="button"
            className={`rounded-2xl border px-6 py-4 ${
              lockAfterSeconds === secs ? "border-indigo-400 bg-indigo-500/25" : "border-white/10 bg-navy-900"
            }`}
            onPress={() => persistTimeout(secs)}>
            <Text className="text-slate-50 text-lg">{label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable accessibilityRole="button" onPress={lockNow} className="rounded-2xl border border-white/10 bg-navy-900 px-6 py-4 mt-10">
        <Text className="text-slate-100 text-lg font-semibold text-center">Lock now</Text>
      </Pressable>

      <PinRotationPanel />

      <PasskeyExporter />
    </ScrollView>
  );
}

function Row(props: { label: string; subtitle?: string; control: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between py-6 border-b border-white/10">
      <View className="flex-1 pr-8">
        <Text className="text-slate-100 text-xl">{props.label}</Text>
        {props.subtitle ? <Text className="text-slate-500 text-xs mt-2">{props.subtitle}</Text> : null}
      </View>
      {props.control}
    </View>
  );
}

function PinRotationPanel() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [status, setStatus] = React.useState<string | undefined>();

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
    if (next.length !== 6) {
      setStatus("PIN must be exactly 6 digits.");
      return;
    }
    if (next !== confirm) {
      setStatus("Pins do not match.");
      return;
    }
    await setPinCode(next);
    Alert.alert("PIN updated.");
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <View className="gap-y-3 mt-10 border border-white/10 rounded-2xl p-5 bg-navy-900/70">
      <Text className="text-slate-100 text-lg font-semibold">Change PIN</Text>
      <TextInput secureTextEntry keyboardType="number-pad" value={current} onChangeText={setCurrent} placeholder="Current PIN" placeholderTextColor="#64748b" className="rounded-xl bg-navy-800 px-4 py-3 border border-white/5 font-mono text-base text-white" />
      <TextInput secureTextEntry keyboardType="number-pad" value={next} onChangeText={setNext} placeholder="New PIN (6 digits)" placeholderTextColor="#64748b" className="rounded-xl bg-navy-800 px-4 py-3 border border-white/5 font-mono text-base text-white" />
      <TextInput secureTextEntry keyboardType="number-pad" value={confirm} onChangeText={setConfirm} placeholder="Confirm new PIN" placeholderTextColor="#64748b" className="rounded-xl bg-navy-800 px-4 py-3 border border-white/5 font-mono text-base text-white" />
      {status ? <Text className="text-rose-400">{status}</Text> : null}
      <Pressable onPress={() => submit()} className="rounded-xl bg-indigo-600 py-4 mt-4 items-center">
        <Text className="text-slate-50 font-semibold">Save new PIN</Text>
      </Pressable>
    </View>
  );
}

function PasskeyExporter() {
  const entries = useVaultStore((s) => s.passkeys);

  return (
    <View className="mt-12 border border-white/10 rounded-2xl p-5 gap-y-3 bg-navy-900/70">
      <Text className="text-slate-200 font-semibold">Export encrypted passkeys</Text>
      <Text className="text-xs text-slate-500 mb-6 leading-relaxed">
        Passkeys can only be recreated from these encrypted backups plus your device trust boundary.
      </Text>
      <Pressable accessibilityRole="button" className="rounded-xl bg-indigo-600 py-4 items-center" onPress={async () => {
        try {
          const payload = JSON.stringify(entries);
          const encrypted = await encryptValue(payload);
          await shareTextFile(encrypted, `passkeys-export-${Crypto.randomUUID()}.txt`, "application/json");
        } catch (err: unknown) {
          Alert.alert("Export failed", String(err instanceof Error ? err.message : err));
        }
      }}>
        <Text className="text-white font-semibold">Share vault passkeys</Text>
      </Pressable>
    </View>
  );
}
