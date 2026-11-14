import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { CategoryBadge } from '@/components/vault/category-badge';
import type { PasswordCategory } from '@/lib/types';

const meta = {
  title: 'Vault/CategoryBadge',
  component: CategoryBadge,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <View className="flex-row flex-wrap gap-2">
          <Story />
        </View>
      </VaultStoryPad>
    ),
  ],
} satisfies Meta<typeof CategoryBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

const categories: PasswordCategory[] = ['social', 'work', 'finance', 'shopping', 'other'];

export const All: Story = {
  args: { category: 'social' },
  render: () => (
    <>
      {categories.map((c) => (
        <CategoryBadge key={c} category={c} />
      ))}
    </>
  ),
};
