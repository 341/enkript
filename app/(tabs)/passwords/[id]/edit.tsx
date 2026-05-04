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
  TextInput,
  View,
} from "react-native";
import { useNavigation, usePreventRemove } from '@react-navigation/native';

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
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!entry) return;
    setTitle(entry.title);
    setUsername(entry.username);
    setPassword(entry.password);
    setUrl(entry.url);
    setNotes(entry.notes);
    setCategory(entry.category);
  }, [entry]);

  if (!entry) {
    return (
      <View className="flex-1 bg-navy-950 justify-center px-12">
        <Text className="text-slate-200">Credential missing.</Text>
      </View>
    );
  }

  const dirty =
    title !== entry.title ||
    username !== entry.username ||
    password !== entry.password ||
    finalizeUrl(url) !== entry.url ||
    notes !== entry.notes ||
    category !== entry.category;

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
      <View className="flex-row justify-between mb-6">
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text className="text-xl text-indigo-300">←</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={!canSave} onPress={async () => {
          await updatePassword(entry.id, {
            title: title.trim(),
            username,
            password,
            url: finalizeUrl(url),
            notes: notes.slice(0, 500),
            category,
          });
          router.back();
        }}>
          <Text className={canSave ? "text-indigo-400 font-semibold" : "text-slate-600"}>Save</Text>
        </Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-slate-100 font-display text-2xl">Edit credential</Text>
        <PasswordField lab="TITLE" val={title} onChange={setTitle} />

        <PasswordField lab="USERNAME" val={username} onChange={setUsername} email keyboardType="email-address" />

        <View className="mt-10 gap-y-2">
          <Text className="text-[11px] text-slate-500 tracking-[0.3em]">PASSWORD</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!visible}
            className="mt-3 rounded-xl bg-navy-800 px-4 py-3 border border-white/5 text-base font-mono text-indigo-200"
          />
          <StrengthMeter password={password} />
          <View className="flex-row mt-4 gap-6">
            <Pressable onPress={() => setVisible((v) => !v)}>
              <Text className="text-indigo-300 text-sm">{visible ? "Hide" : "Show"}</Text>
            </Pressable>
            <Pressable onPress={() => sheetRef.current?.present()}>
              <Text className="text-indigo-300 text-sm font-semibold">Generate</Text>
            </Pressable>
          </View>
        </View>

        <PasswordField
          lab="URL"
          val={url}
          onBlur={() => setUrl(finalizeUrl(url))}
          onChange={(t) => setUrl(t)}
        />

        <View className="mt-12">
          <Text className="text-[11px] text-slate-500 tracking-[0.3em]">{`NOTES (${notes.length}/500)`}</Text>
          <TextInput
            multiline
            maxLength={500}
            value={notes}
            onChangeText={setNotes}
            className="mt-4 rounded-xl bg-navy-800 px-4 py-3 border border-white/5 font-mono text-sm text-slate-100 min-h-[120]"
          />
        </View>

        <Text className="text-[11px] text-slate-500 mt-14 tracking-[0.2em] uppercase">category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          {CATEGORIES.map(({ key, label }) => (
            <Pressable key={key} onPress={() => setCategory(key)} className={`px-5 py-2 rounded-xl mr-3 border ${category===key?"bg-indigo-500":"bg-navy-900 border-white/10"}`}>
              <Text className="text-slate-50 text-sm">{label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PasswordField(props: {
  lab: string;
  val: string;
  onChange?: (text: string) => void;
  onBlur?: () => void;
  email?: boolean;
  keyboardType?: "email-address" | "default";
}) {
  return (
    <View className="mt-10">
      <Text className="text-[11px] text-slate-500 tracking-[0.3em]">{props.lab}</Text>
      <TextInput
        value={props.val}
        onChangeText={props.onChange}
        onBlur={props.onBlur}
        autoCapitalize={props.email ? "none" : "sentences"}
        keyboardType={props.keyboardType}
        className="mt-3 rounded-xl bg-navy-800 px-4 py-3 border border-white/5 text-base text-slate-100"
      />
    </View>
  );
}
