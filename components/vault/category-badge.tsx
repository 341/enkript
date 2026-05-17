import { Text, View } from 'react-native';

import type { PasswordCategory } from '@/lib/types';

const tone: Record<PasswordCategory, string> = {
  social:
    'bg-indigo-500/15 border-indigo-500/35 text-indigo-800 dark:bg-indigo-500/20 dark:border-indigo-400/60 dark:text-indigo-300',
  work: 'bg-sky-500/12 border-sky-500/35 text-sky-900 dark:bg-sky-500/10 dark:border-sky-400/50 dark:text-sky-200',
  finance:
    'bg-emerald-500/12 border-emerald-500/35 text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-400/50 dark:text-emerald-300',
  shopping:
    'bg-amber-500/14 border-amber-500/35 text-amber-900 dark:bg-amber-500/15 dark:border-amber-400/50 dark:text-amber-200',
  other: 'bg-slate-200 border-slate-400/60 text-slate-800 dark:bg-white/10 dark:border-white/20 dark:text-slate-200',
};

const labelOf: Record<PasswordCategory, string> = {
  social: 'Social',
  work: 'Work',
  finance: 'Finance',
  shopping: 'Shopping',
  other: 'Other',
};

export function CategoryBadge({ category }: { category: PasswordCategory }) {
  const cls = tone[category] ?? tone.other;
  return (
    <View className={`self-start rounded-full border px-2 py-0.5 ${cls}`}>
      <Text className="font-sans text-[11px] font-medium uppercase">{labelOf[category]}</Text>
    </View>
  );
}
