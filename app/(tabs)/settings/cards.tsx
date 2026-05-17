import { router } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { VaultScreenHeader } from '@/components/ui/vault-screen-header';
import { usePasswordStore } from '@/stores/vault-store';

export default function PaymentCardsScreen() {
  const cards = usePasswordStore((s) => s.cards);
  const addCard = usePasswordStore((s) => s.addCard);

  return (
    <View className="flex-1 bg-slate-100 dark:bg-navy-950 pt-20">
      <View className="px-8">
        <Pressable accessibilityRole="button" onPress={() => router.back()} className="mb-4">
          <Text className="text-indigo-700 dark:text-indigo-300 text-lg">← Back</Text>
        </Pressable>
        <VaultScreenHeader title="Payment cards" className="mb-6" />
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            void addCard({
              title: 'New card',
              cardholder: '',
              number: '',
              expMonth: '',
              expYear: '',
              cvv: '',
            }).then(() => {
              const created = usePasswordStore.getState().cards[0];
              if (created) router.push(`/(tabs)/settings/card/${created.id}` as never);
            })
          }
          className="rounded-full bg-indigo-500 py-3 items-center mb-6">
          <Text className="text-slate-50 font-semibold">Add card</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 120 }}>
        {cards.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push(`/(tabs)/settings/card/${c.id}` as never)}
            className="mb-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 p-4">
            <Text className="text-slate-900 dark:text-slate-100 font-semibold">{c.title}</Text>
            <Text className="text-slate-500 text-sm mt-1">
              {c.cardholder} · •••• {c.number.slice(-4)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
