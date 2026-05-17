import { Pressable, ScrollView, Text } from 'react-native';

import type { PasswordCategory } from '@/lib/types';

const CATEGORIES: { key: PasswordCategory; label: string }[] = [
  { key: 'social', label: 'Social' },
  { key: 'work', label: 'Work' },
  { key: 'finance', label: 'Finance' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'other', label: 'Other' },
];

type Props = {
  value: PasswordCategory;
  onChange: (category: PasswordCategory) => void;
};

export function CategoryChipPicker({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 flex-row">
      {CATEGORIES.map(({ key, label }) => {
        const selected = value === key;
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(key)}
            className={`px-5 py-2 rounded-xl border mr-3 ${
              selected
                ? 'bg-indigo-500/80 border-transparent'
                : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-white/10'
            }`}>
            <Text className={`text-sm ${selected ? 'text-slate-50' : 'text-slate-900 dark:text-slate-50'}`}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
