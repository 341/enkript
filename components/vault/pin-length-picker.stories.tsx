import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { PinLengthPicker } from '@/components/vault/pin-length-picker';
import { DEFAULT_PIN_LENGTH, type PinLength } from '@/lib/pin-length';

function Interactive() {
  const [value, setValue] = useState<PinLength>(DEFAULT_PIN_LENGTH);
  return <PinLengthPicker value={value} onChange={setValue} />;
}

const meta = {
  title: 'Vault/PinLengthPicker',
  component: PinLengthPicker,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <Story />
      </VaultStoryPad>
    ),
  ],
  args: { value: 6 as PinLength, onChange: fn(), disabled: false },
} satisfies Meta<typeof PinLengthPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const InteractivePicker: Story = { render: () => <Interactive /> };
export const Disabled: Story = { args: { disabled: true } };
