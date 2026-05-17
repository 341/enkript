import type { Meta, StoryObj } from '@storybook/react-native';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { PasskeyCard } from '@/components/vault/passkey-card';
import type { PasskeyEntry } from '@/lib/types';

const mockEntry: PasskeyEntry = {
  id: 'pk-1',
  rpId: 'example.com',
  rpName: 'Example Corp',
  userId: 'uid',
  userName: 'user@example.com',
  userDisplayName: 'User',
  credentialId: 'cred',
  privateKeyEncrypted: 'enc',
  publicKeyBase64Url: 'key',
  signCount: 0,
  createdAt: Date.now(),
  lastUsedAt: Date.now(),
  backedUp: true,
};

const meta = {
  title: 'Vault/PasskeyCard',
  component: PasskeyCard,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <Story />
      </VaultStoryPad>
    ),
  ],
  args: { entry: mockEntry },
} satisfies Meta<typeof PasskeyCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BackedUp: Story = {};
export const NotBackedUp: Story = {
  args: { entry: { ...mockEntry, backedUp: false } },
};
