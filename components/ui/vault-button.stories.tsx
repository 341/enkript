import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { VaultButton } from '@/components/ui/vault-button';

const meta = {
  title: 'UI/VaultButton',
  component: VaultButton,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <View className="gap-y-4 w-full max-w-sm">
          <Story />
        </View>
      </VaultStoryPad>
    ),
  ],
} satisfies Meta<typeof VaultButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { label: 'Save new PIN', variant: 'primary' } };
export const Secondary: Story = { args: { label: 'Lock now', variant: 'secondary' } };
export const Danger: Story = { args: { label: 'Merge import', variant: 'danger' } };
export const Ghost: Story = { args: { label: 'Generate', variant: 'ghost' } };
export const Disabled: Story = { args: { label: 'Save', variant: 'primary', disabled: true } };
