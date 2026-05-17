import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { StrengthMeter } from '@/components/vault/strength-meter';

const meta = {
  title: 'Vault/StrengthMeter',
  component: StrengthMeter,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <View className="w-full max-w-sm gap-y-6">
          <Story />
        </View>
      </VaultStoryPad>
    ),
  ],
} satisfies Meta<typeof StrengthMeter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { password: '' } };
export const Weak: Story = { args: { password: 'abc123' } };
export const Strong: Story = { args: { password: 'Tr0ub4dor&3_extra' } };
