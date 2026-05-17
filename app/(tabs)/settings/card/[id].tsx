import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { VaultButton } from '@/components/ui/vault-button';
import { VaultScreenHeader } from '@/components/ui/vault-screen-header';
import { VaultTextField, VaultTextInput } from '@/components/vault/vault-text-field';
import { usePasswordStore } from '@/stores/vault-store';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = usePasswordStore((s) => s.getCardById(id ?? ''));
  const updateCard = usePasswordStore((s) => s.updateCard);
  const removeCard = usePasswordStore((s) => s.removeCard);

  const [title, setTitle] = React.useState('');
  const [cardholder, setCardholder] = React.useState('');
  const [number, setNumber] = React.useState('');
  const [expMonth, setExpMonth] = React.useState('');
  const [expYear, setExpYear] = React.useState('');
  const [cvv, setCvv] = React.useState('');

  React.useEffect(() => {
    if (!card) return;
    setTitle(card.title);
    setCardholder(card.cardholder);
    setNumber(card.number);
    setExpMonth(card.expMonth);
    setExpYear(card.expYear);
    setCvv(card.cvv);
  }, [card]);

  if (!card) {
    return (
      <View className="flex-1 bg-slate-100 dark:bg-navy-950 pt-24 px-8">
        <Text className="text-slate-200">Card not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-100 dark:bg-navy-950 px-8 pt-20" contentContainerStyle={{ paddingBottom: 120 }}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} className="mb-4">
        <Text className="text-indigo-700 dark:text-indigo-300 text-lg">← Back</Text>
      </Pressable>
      <VaultScreenHeader title="Edit card" className="mb-8" />
      <VaultTextField label="Label">
        <VaultTextInput value={title} onChangeText={setTitle} />
      </VaultTextField>
      <VaultTextField label="Cardholder" className="mt-4">
        <VaultTextInput value={cardholder} onChangeText={setCardholder} />
      </VaultTextField>
      <VaultTextField label="Number" className="mt-4">
        <VaultTextInput value={number} onChangeText={setNumber} keyboardType="number-pad" />
      </VaultTextField>
      <View className="flex-row gap-4 mt-4">
        <VaultTextField label="Exp month" className="flex-1">
          <VaultTextInput value={expMonth} onChangeText={setExpMonth} keyboardType="number-pad" maxLength={2} />
        </VaultTextField>
        <VaultTextField label="Exp year" className="flex-1">
          <VaultTextInput value={expYear} onChangeText={setExpYear} keyboardType="number-pad" maxLength={4} />
        </VaultTextField>
        <VaultTextField label="CVV" className="flex-1">
          <VaultTextInput value={cvv} onChangeText={setCvv} keyboardType="number-pad" secureTextEntry maxLength={4} />
        </VaultTextField>
      </View>
      <VaultButton
        label="Save"
        className="mt-8"
        onPress={() => {
          void updateCard(card.id, { title, cardholder, number, expMonth, expYear, cvv }).then(() =>
            router.back(),
          );
        }}
      />
      <VaultButton
        label="Delete"
        variant="secondary"
        className="mt-4"
        onPress={() => {
          void removeCard(card.id).then(() => router.back());
        }}
      />
    </ScrollView>
  );
}
