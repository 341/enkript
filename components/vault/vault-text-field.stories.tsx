import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import {
  VaultField,
  VaultSearchField,
  VaultTextField,
  VaultTextInput,
} from '@/components/vault/vault-text-field';

const meta = {
  title: 'Vault/VaultTextField',
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <View className="w-full max-w-sm">
          <Story />
        </View>
      </VaultStoryPad>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj;

function DefaultField() {
  const [v, setV] = useState('GitHub');
  return <VaultTextField label="Title" value={v} onChangeText={setV} placeholder="GitHub" />;
}

export const Default: Story = { render: () => <DefaultField /> };

export const Credential: Story = {
  render: () => (
    <VaultField label="Password">
      <VaultTextInput variant="credential" value="hunter2" secureTextEntry onChangeText={() => {}} />
    </VaultField>
  ),
};

export const Multiline: Story = {
  render: () => (
    <VaultTextField label="Notes" variant="multiline" multiline value="Private note" onChangeText={() => {}} />
  ),
};

export const Pin: Story = {
  render: () => (
    <VaultTextInput variant="pin" dense placeholder="Current PIN" value="12" onChangeText={() => {}} />
  ),
};

function SearchDemo() {
  const [q, setQ] = useState('');
  return <VaultSearchField value={q} onChangeText={setQ} />;
}

export const Search: Story = { render: () => <SearchDemo /> };
