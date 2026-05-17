import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { View } from 'react-native';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { PinPad } from '@/components/vault/pin-pad';

const meta = {
  title: 'Vault/PinPad',
  component: PinPad,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <View className="min-h-[320px] w-full items-center justify-center">
          <Story />
        </View>
      </VaultStoryPad>
    ),
  ],
  args: {
    onComplete: fn(),
    disabled: false,
    length: 6,
  },
} satisfies Meta<typeof PinPad>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const FourDigits: Story = { args: { length: 4 } };
export const Disabled: Story = { args: { disabled: true } };
