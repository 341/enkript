import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { VaultStoryPad } from '@/components/ui/story-decorators';
import { CategoryChipPicker } from '@/components/ui/category-chip-picker';
import type { PasswordCategory } from '@/lib/types';

function InteractivePicker() {
  const [value, setValue] = useState<PasswordCategory>('work');
  return <CategoryChipPicker value={value} onChange={setValue} />;
}

const meta = {
  title: 'UI/CategoryChipPicker',
  component: CategoryChipPicker,
  decorators: [
    (Story) => (
      <VaultStoryPad>
        <Story />
      </VaultStoryPad>
    ),
  ],
  args: { value: 'finance' as PasswordCategory, onChange: fn() },
} satisfies Meta<typeof CategoryChipPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Static: Story = {};
export const Interactive: Story = { render: () => <InteractivePicker /> };
