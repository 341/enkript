import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';
import { View } from 'react-native';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { VaultLinkRow } from '@/components/ui/vault-link-row';

const meta = {
  title: 'UI/VaultLinkRow',
  component: VaultLinkRow,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <View className="w-full max-w-sm gap-y-4">
          <Story />
        </View>
      </VaultStoryPad>
    ),
  ],
  args: { onPress: fn() },
} satisfies Meta<typeof VaultLinkRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { title: 'Security' } };
export const Accent: Story = { args: { title: 'Storybook', variant: 'accent' } };
