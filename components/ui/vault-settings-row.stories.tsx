import type { Meta, StoryObj } from '@storybook/react-native';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { VaultSettingsRow } from '@/components/ui/vault-settings-row';
import { VaultSwitch } from '@/components/ui/vault-switch';

const meta = {
  title: 'UI/VaultSettingsRow',
  component: VaultSettingsRow,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <Story />
      </VaultStoryPad>
    ),
  ],
} satisfies Meta<typeof VaultSettingsRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithSwitch: Story = {
  args: {
    label: 'Biometric gate (in vault)',
    subtitle: 'Face ID / fingerprint before revealing passwords',
    control: <VaultSwitch value />,
  },
};
