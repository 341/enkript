import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { VaultButton } from '@/components/ui/vault-button';
import { VaultScreenHeader } from '@/components/ui/vault-screen-header';
import { VaultTextField, VaultTextInput } from '@/components/vault/vault-text-field';
import { usePasswordStore } from '@/stores/vault-store';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const note = usePasswordStore((s) => s.getNoteById(id ?? ''));
  const updateNote = usePasswordStore((s) => s.updateNote);
  const removeNote = usePasswordStore((s) => s.removeNote);

  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');

  React.useEffect(() => {
    if (!note) return;
    setTitle(note.title);
    setBody(note.body);
  }, [note]);

  if (!note) {
    return (
      <View className="flex-1 bg-slate-100 dark:bg-navy-950 pt-24 px-8">
        <Text className="text-slate-200">Note not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-100 dark:bg-navy-950 px-8 pt-20" contentContainerStyle={{ paddingBottom: 120 }}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} className="mb-4">
        <Text className="text-indigo-700 dark:text-indigo-300 text-lg">← Back</Text>
      </Pressable>
      <VaultScreenHeader title="Edit note" className="mb-8" />
      <VaultTextField label="Title">
        <VaultTextInput value={title} onChangeText={setTitle} />
      </VaultTextField>
      <VaultTextField label="Body" className="mt-6">
        <VaultTextInput value={body} onChangeText={setBody} multiline className="min-h-[160px]" />
      </VaultTextField>
      <VaultButton
        label="Save"
        className="mt-8"
        onPress={() => {
          void updateNote(note.id, { title, body }).then(() => router.back());
        }}
      />
      <VaultButton
        label="Delete"
        variant="secondary"
        className="mt-4"
        onPress={() => {
          void removeNote(note.id).then(() => router.back());
        }}
      />
    </ScrollView>
  );
}
