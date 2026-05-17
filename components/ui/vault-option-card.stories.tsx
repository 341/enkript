import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { View } from 'react-native';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { VaultOptionCard } from '@/components/ui/vault-option-card';

const meta = {
  title: 'UI/VaultOptionCard',
  component: VaultOptionCard,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <View className="w-full max-w-sm gap-y-3">
          <Story />
        </View>
      </VaultStoryPad>
    ),
  ],
  args: { onPress: fn() },
} satisfies Meta<typeof VaultOptionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Selected: Story = {
  args: { label: 'Dark', hint: 'Always use dark appearance.', selected: true },
};

export const Unselected: Story = {
  args: { label: 'System', hint: 'Match iOS / Android light or dark.', selected: false },
};

export const Compact: Story = {
  args: { label: '6', hint: 'digits', selected: true, compact: true },
};
