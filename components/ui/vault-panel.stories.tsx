import type { Meta, StoryObj } from '@storybook/react-native';
import { Text } from 'react-native';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { VaultPanel } from '@/components/ui/vault-panel';

const meta = {
  title: 'UI/VaultPanel',
  component: VaultPanel,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <Story />
      </VaultStoryPad>
    ),
  ],
} satisfies Meta<typeof VaultPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithTitle: Story = {
  args: {
    title: 'Where on iOS',
    children: <Text className="text-slate-800 dark:text-slate-200 text-sm">Open Settings → Passwords → AutoFill.</Text>,
  },
};

export const Plain: Story = {
  args: {
    children: <Text className="text-slate-800 dark:text-slate-200 text-sm">Panel content without a title.</Text>,
  },
};
