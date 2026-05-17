import { router } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { VaultScreenHeader } from '@/components/ui/vault-screen-header';
import { usePasswordStore } from '@/stores/vault-store';

export default function SecureNotesScreen() {
  const notes = usePasswordStore((s) => s.notes);
  const addNote = usePasswordStore((s) => s.addNote);

  return (
    <View className="flex-1 bg-slate-100 dark:bg-navy-950 pt-20">
      <View className="px-8">
        <Pressable accessibilityRole="button" onPress={() => router.back()} className="mb-4">
          <Text className="text-indigo-700 dark:text-indigo-300 text-lg">← Back</Text>
        </Pressable>
        <VaultScreenHeader title="Secure notes" className="mb-6" />
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            void addNote({ title: 'New note', body: '' }).then(() => {
              const created = usePasswordStore.getState().notes[0];
              if (created) router.push(`/(tabs)/settings/note/${created.id}` as never);
            })
          }
          className="rounded-full bg-indigo-500 py-3 items-center mb-6">
          <Text className="text-slate-50 font-semibold">Add note</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 120 }}>
        {notes.length === 0 ? (
          <Text className="text-slate-500 text-center">No secure notes yet.</Text>
        ) : (
          notes.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => router.push(`/(tabs)/settings/note/${n.id}` as never)}
              className="mb-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 p-4">
              <Text className="text-slate-900 dark:text-slate-100 font-semibold">{n.title}</Text>
              <Text className="text-slate-500 text-sm mt-2" numberOfLines={2}>
                {n.body || 'Empty note'}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
