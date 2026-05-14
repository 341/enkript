import { Link, router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";

import { copyWithAutoClear } from "@/lib/clipboard-vault";
import { normalizeHost } from "@/lib/domain-match";
import { authenticateWithBiometrics } from "@/hooks/useVaultAuth";
import { useSecurityPrefsStore } from "@/stores/security-prefs-store";
import { usePasswordStore } from "@/stores/vault-store";

import { useVaultCopyToast } from "@/components/vault/copy-toast-host";

export default function PasswordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = usePasswordStore((s) => s.passwords.find((x) => x.id === id));
  const removePassword = usePasswordStore((s) => s.removePassword);
  const toast = useVaultCopyToast();

  const [revealed, setRevealed] = React.useState(false);

  if (!entry) {
    return (
      <View className="flex-1 bg-navy-950 pt-24 px-8">
        <Text className="text-slate-200">Nothing here.</Text>
      </View>
    );
  }

  async function guardedReveal() {
    const biometric = useSecurityPrefsStore.getState().biometricUnlock;
    if (biometric) {
      const ok = await authenticateWithBiometrics("Reveal password");
      if (!ok) {
        toast.show("Biometric declined");
        return;
      }
    }
    setRevealed(true);
  }

  return (
    <View className="flex-1 bg-navy-950 pt-14">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="px-6 mt-10">
        <View className="flex-row justify-between mb-10">
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <Text className="text-xl text-indigo-300">←</Text>
          </Pressable>
          <Link href={`/(tabs)/passwords/${entry.id}/edit`} className="text-indigo-300 text-lg font-semibold">
            Edit
          </Link>
        </View>

        <Text className="font-display text-3xl text-slate-100">{entry.title}</Text>
        <Text className="text-indigo-300 text-xs mt-2">{normalizeHost(entry.url || "") || "—"}</Text>

        <Section label="USERNAME" value={entry.username} copyToast={toast.show} clipboardKey={`u-${entry.id}`} />

        <View className="mt-10 gap-y-4">
          <Text className="text-[11px] text-slate-500 tracking-[0.3em] uppercase">password</Text>
          <Text className="rounded-xl bg-navy-900 border border-white/5 px-4 py-3 font-mono text-base text-slate-50">
            {revealed ? entry.password : "••••••••••"}
          </Text>
          <View className="flex-row gap-6">
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void copyWithAutoClear(`pwd-${entry.id}`, entry.password, 30000).then(() =>
                  toast.show("Password copied. Clears in 30 seconds."),
                );
              }}>
              <Text className="text-indigo-300 font-semibold">Copy</Text>
            </Pressable>
            {!revealed ? (
              <Pressable accessibilityRole="button" onPress={() => guardedReveal()}>
                <Text className="text-slate-200 font-semibold">Reveal 👁️</Text>
              </Pressable>
            ) : (
              <Pressable accessibilityRole="button" onPress={() => setRevealed(false)}>
                <Text className="text-slate-200 font-semibold">Hide</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View className="mt-12">
          <Text className="text-[11px] text-slate-500 uppercase tracking-[0.3em]">url</Text>
          <View className="flex-row justify-between items-center mt-3">
            <Text className="text-slate-100 flex-1 pr-6" numberOfLines={2}>{entry.url || "Not set"}</Text>
            {entry.url ? (
              <Pressable onPress={() => Linking.openURL(entry.url)}>
                <Text className="text-indigo-300 font-semibold">Open</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View className="mt-12">
          <Text className="text-[11px] text-slate-500 uppercase tracking-[0.3em] mb-4">notes</Text>
          <Text className="font-mono text-sm text-slate-200">{entry.notes || "—"}</Text>
        </View>

        <Text className="text-slate-500 text-xs mt-10">
          Last modified {new Date(entry.updatedAt).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </Text>

        <View className="flex-row justify-between mt-16 pb-16">
          <Pressable accessibilityRole="button">
            <Link href={`/(tabs)/passwords/${entry.id}/edit`} className="text-white font-semibold text-base">
              Edit credential
            </Link>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              Alert.alert("Delete?", "Permanent removal.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    await removePassword(entry.id);
                    router.replace("/(tabs)/passwords");
                  },
                },
              ])
            }>
            <Text className="text-rose-400 font-semibold text-base">Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Section(props: {
  label: string;
  value: string;
  copyToast: (s: string) => void;
  clipboardKey: string;
}) {
  return (
    <View className="mt-12">
      <Text className="text-[11px] text-slate-500 uppercase tracking-[0.3em]">{props.label}</Text>
      <View className="flex-row mt-4 items-center gap-10">
        <Text className="text-slate-100 text-xl flex-1">{props.value}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void copyWithAutoClear(props.clipboardKey, props.value, 30000).then(() =>
              props.copyToast("Username copied. Clears in 30 seconds."),
            );
          }}>
          <Text className="text-indigo-300 font-semibold">Copy</Text>
        </Pressable>
      </View>
    </View>
  );
}
