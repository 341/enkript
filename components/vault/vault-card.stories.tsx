import type { Meta, StoryObj } from '@storybook/react-native';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { VaultCard } from '@/components/vault/vault-card';
import type { PasswordEntry } from '@/lib/types';

const mockEntry: PasswordEntry = {
  id: '1',
  title: 'GitHub',
  username: 'dev@example.com',
  password: 'secret',
  url: 'https://github.com',
  notes: '',
  category: 'work',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const meta = {
  title: 'Vault/VaultCard',
  component: VaultCard,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <Story />
      </VaultStoryPad>
    ),
  ],
  args: { entry: mockEntry, delay: 0 },
} satisfies Meta<typeof VaultCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoUrl: Story = {
  args: { entry: { ...mockEntry, url: '' } },
};
