import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import * as React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation, usePreventRemove } from '@react-navigation/native';

import { CategoryChipPicker } from '@/components/ui/category-chip-picker';
import { VaultSectionLabel } from '@/components/ui/vault-section-label';
import { GeneratorSheet } from "@/components/vault/generator-sheet";
import { StrengthMeter } from "@/components/vault/strength-meter";
import { VaultField, VaultTextField, VaultTextInput } from "@/components/vault/vault-text-field";

import type { PasswordCategory } from "@/lib/types";

import { usePasswordStore } from "@/stores/vault-store";

export default function EditPasswordScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = usePasswordStore((s) => s.passwords.find((x) => x.id === id));
  const updatePassword = usePasswordStore((s) => s.updatePassword);
  const sheetRef = React.useRef<BottomSheetModal | null>(null);

  const [title, setTitle] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [category, setCategory] = React.useState<PasswordCategory>("other");
  const [totpSecret, setTotpSecret] = React.useState("");
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!entry) return;
    setTitle(entry.title);
    setUsername(entry.username);
    setPassword(entry.password);
    setUrl(entry.url);
    setNotes(entry.notes);
    setCategory(entry.category);
    setTotpSecret(entry.totpSecret ?? "");
  }, [entry]);

  if (!entry) {
    return (
      <View className="flex-1 bg-slate-100 dark:bg-navy-950 justify-center px-12">
        <Text className="text-slate-800 dark:text-slate-200">Credential missing.</Text>
      </View>
    );
  }

  function finalizeUrl(raw: string) {
    let u = raw.trim();
    if (!u) return "";
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    return u;
  }

  const dirty =
    title !== entry.title ||
    username !== entry.username ||
    password !== entry.password ||
    finalizeUrl(url) !== entry.url ||
    notes !== entry.notes ||
    category !== entry.category ||
    totpSecret !== (entry.totpSecret ?? "");

  usePreventRemove(dirty, ({ data }) => {
    Alert.alert("Discard changes?", "", [
      { text: "Keep editing", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

  const canSave = title.trim().length > 0 && password.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
      className="flex-1 bg-slate-100 dark:bg-navy-950 px-6 pt-16">
      <GeneratorSheet ref={sheetRef} onPick={setPassword} />
      <View className="flex-row justify-between mb-6">
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text className="text-xl text-indigo-700 dark:text-indigo-300">←</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={!canSave} onPress={async () => {
          await updatePassword(entry.id, {
            title: title.trim(),
            username,
            password,
            url: finalizeUrl(url),
            notes: notes.slice(0, 500),
            category,
            totpSecret: totpSecret.trim() || undefined,
          });
          router.back();
        }}>
          <Text className={canSave ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-400'}>
            Save
          </Text>
        </Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-slate-900 dark:text-slate-100 font-display text-2xl">Edit credential</Text>

        <VaultTextField label="Title" value={title} onChangeText={setTitle} />

        <VaultTextField
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />

        <VaultField label="Password">
          <VaultTextInput
            variant="credential"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!visible}
          />
          <StrengthMeter password={password} />
          <View className="flex-row mt-4 gap-6">
            <Pressable onPress={() => setVisible((v) => !v)}>
              <Text className="text-indigo-700 dark:text-indigo-300 text-sm">{visible ? "Hide" : "Show"}</Text>
            </Pressable>
            <Pressable onPress={() => sheetRef.current?.present()}>
              <Text className="text-indigo-700 dark:text-indigo-300 text-sm font-semibold">Generate</Text>
            </Pressable>
          </View>
        </VaultField>

        <VaultTextField
          label="URL"
          value={url}
          onBlur={() => setUrl(finalizeUrl(url))}
          onChangeText={setUrl}
          autoCapitalize="none"
          placeholder="https://…"
        />

        <VaultTextField
          label="TOTP secret (base32)"
          value={totpSecret}
          onChangeText={setTotpSecret}
          autoCapitalize="none"
          placeholder="JBSWY3DPEHPK3PXP or otpauth://…"
        />

        <VaultTextField
          label={`Notes (${notes.length}/500)`}
          variant="multiline"
          multiline
          maxLength={500}
          value={notes}
          onChangeText={setNotes}
        />

        <VaultSectionLabel className="mt-14 tracking-[0.2em]">category</VaultSectionLabel>
        <CategoryChipPicker value={category} onChange={setCategory} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
