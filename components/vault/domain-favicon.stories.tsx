import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { DomainFavicon } from '@/components/vault/domain-favicon';

const meta = {
  title: 'Vault/DomainFavicon',
  component: DomainFavicon,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <View className="flex-row gap-6">
          <Story />
        </View>
      </VaultStoryPad>
    ),
  ],
} satisfies Meta<typeof DomainFavicon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithUrl: Story = { args: { url: 'https://github.com' } };
export const NoUrl: Story = { args: { url: '' } };
