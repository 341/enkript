import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
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
import { useNavigation, usePreventRemove } from "@react-navigation/native";

import { CategoryChipPicker } from '@/components/ui/category-chip-picker';
import { VaultSectionLabel } from '@/components/ui/vault-section-label';
import { GeneratorSheet } from "@/components/vault/generator-sheet";
import { StrengthMeter } from "@/components/vault/strength-meter";
import { VaultField, VaultTextField, VaultTextInput } from "@/components/vault/vault-text-field";

import type { PasswordCategory } from "@/lib/types";

import { usePasswordStore } from "@/stores/vault-store";

export default function NewPasswordScreen() {
  const navigation = useNavigation();
  const addPassword = usePasswordStore((s) => s.addPassword);
  const sheetRef = React.useRef<BottomSheetModal | null>(null);

  const [title, setTitle] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [category, setCategory] = React.useState<PasswordCategory>("other");
  const [visible, setVisible] = React.useState(false);

  const dirty =
    !!title.trim() ||
    !!username.trim() ||
    !!password.trim() ||
    !!url.trim() ||
    !!notes.trim();

  usePreventRemove(dirty, ({ data }) => {
    Alert.alert('Discard changes?', 'Your edits will not be saved.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  function finalizeUrl(raw: string) {
    let u = raw.trim();
    if (!u) return "";
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    return u;
  }

  const canSave = title.trim().length > 0 && password.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
      className="flex-1 bg-slate-100 dark:bg-navy-950 px-6 pt-16">
      <GeneratorSheet ref={sheetRef} onPick={setPassword} />
      <View className="flex-row items-center justify-between mb-6">
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text className="text-indigo-700 dark:text-indigo-300 text-lg">←</Text>
        </Pressable>
        <Text className="text-slate-900 dark:text-slate-100 font-display text-xl">New credential</Text>
        <Pressable accessibilityRole="button" disabled={!canSave} onPress={async () => {
          await addPassword({
            title: title.trim(),
            username,
            password,
            url: finalizeUrl(url),
            notes: notes.slice(0, 500),
            category,
          });
          router.back();
        }}>
          <Text className={`text-base ${canSave ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-400'}`}>
            Save
          </Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <VaultTextField
          label="Title"
          value={title}
          placeholder="GitHub"
          onChangeText={setTitle}
        />
        <VaultTextField
          label="Username or email"
          value={username}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
          onChangeText={setUsername}
        />
        <VaultField label="Password">
          <VaultTextInput
            variant="credential"
            value={password}
            secureTextEntry={!visible}
            onChangeText={setPassword}
          />
          <StrengthMeter password={password} />
          <View className="flex-row mt-4 gap-6">
            <Pressable accessibilityRole="button" onPress={() => setVisible((x) => !x)}>
              <Text className="text-indigo-700 dark:text-indigo-300 text-sm font-medium">{visible ? "Hide" : "Show"}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => sheetRef.current?.present()}>
              <Text className="text-indigo-700 dark:text-indigo-300 text-sm font-medium">Generate</Text>
            </Pressable>
          </View>
        </VaultField>
        <VaultTextField
          label="URL"
          value={url}
          onBlur={() => setUrl(finalizeUrl(url))}
          autoCapitalize="none"
          placeholder="github.com/login"
          onChangeText={setUrl}
        />
        <VaultTextField
          label={`Notes (${notes.length}/500)`}
          variant="multiline"
          value={notes}
          multiline
          maxLength={500}
          onChangeText={setNotes}
        />
        <VaultSectionLabel className="mt-10 tracking-[0.2em]">category</VaultSectionLabel>
        <CategoryChipPicker value={category} onChange={setCategory} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
