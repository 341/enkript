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
  TextInput,
  View,
} from "react-native";
import { useNavigation, usePreventRemove } from "@react-navigation/native";

import { GeneratorSheet } from "@/components/vault/generator-sheet";
import { StrengthMeter } from "@/components/vault/strength-meter";

import type { PasswordCategory } from "@/lib/types";

import { usePasswordStore } from "@/stores/vault-store";

const CATEGORIES: { key: PasswordCategory; label: string }[] = [
  { key: "social", label: "Social" },
  { key: "work", label: "Work" },
  { key: "finance", label: "Finance" },
  { key: "shopping", label: "Shopping" },
  { key: "other", label: "Other" },
];

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
      className="flex-1 bg-navy-950 px-6 pt-16">
      <GeneratorSheet ref={sheetRef} onPick={setPassword} />
      <View className="flex-row items-center justify-between mb-6">
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text className="text-indigo-300 text-lg">←</Text>
        </Pressable>
        <Text className="text-slate-100 font-display text-xl">New credential</Text>
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
          <Text className={`text-base ${canSave ? "text-indigo-400 font-semibold" : "text-slate-600"}`}>Save</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <Field label="TITLE" optional={false}>
          <TextInput
            value={title}
            placeholder="GitHub"
            placeholderTextColor="#64748B"
            onChangeText={setTitle}
            className="mt-3 rounded-xl bg-navy-800 px-4 py-3 border border-white/5 text-base text-slate-100 font-sans"
          />
        </Field>
        <Field label="USERNAME OR EMAIL">
          <TextInput
            value={username}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            placeholderTextColor="#64748B"
            onChangeText={setUsername}
            className="mt-3 rounded-xl bg-navy-800 px-4 py-3 border border-white/5 text-base text-slate-100 font-sans"
          />
        </Field>
        <Field label="PASSWORD">
          <TextInput
            value={password}
            secureTextEntry={!visible}
            onChangeText={setPassword}
            className="mt-3 rounded-xl bg-navy-800 px-4 py-3 border border-white/5 text-base font-mono text-indigo-200"
          />
          <StrengthMeter password={password} />
          <View className="flex-row mt-4 gap-6">
            <Pressable accessibilityRole="button" onPress={() => setVisible((x) => !x)}>
              <Text className="text-indigo-300 text-sm font-medium">{visible ? "Hide" : "Show"}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => sheetRef.current?.present()}>
              <Text className="text-indigo-300 text-sm font-medium">Generate</Text>
            </Pressable>
          </View>
        </Field>
        <Field label="URL">
          <TextInput
            value={url}
            onBlur={() => setUrl(finalizeUrl(url))}
            autoCapitalize="none"
            placeholder="github.com/login"
            placeholderTextColor="#64748B"
            onChangeText={setUrl}
            className="mt-3 rounded-xl bg-navy-800 px-4 py-3 border border-white/5 text-base text-slate-100 font-sans"
          />
        </Field>
        <Field label={`NOTES (${notes.length}/500)`}>
          <TextInput
            value={notes}
            multiline
            maxLength={500}
            onChangeText={setNotes}
            className="mt-3 rounded-xl bg-navy-800 px-4 py-3 border border-white/5 font-mono text-sm text-slate-100 leading-6 min-h-[120]"
          />
        </Field>
        <Text className="text-[11px] text-slate-500 mt-10 tracking-[0.2em] uppercase">category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 flex-row gap-3">
          {CATEGORIES.map(({ key, label }) => (
            <Pressable key={key} onPress={() => setCategory(key)} className={`px-5 py-2 rounded-xl border mr-3 ${
              category === key ? "bg-indigo-500/80 border-transparent" : "bg-navy-900 border-white/10"
            }`}>
              <Text className="text-slate-50 text-sm">{label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field(props: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <View className="mt-10">
      <Text className="text-[11px] text-slate-500 tracking-[0.35em] font-semibold">
        {props.label.toUpperCase()}
      </Text>
      {props.children}
    </View>
  );
}
