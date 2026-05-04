import { Text, View } from 'react-native';

import type { PasswordCategory } from '@/lib/types';

const tone: Record<PasswordCategory, string> = {
  social: 'bg-indigo-500/20 border-indigo-400/60 text-indigo-300',
  work: 'bg-sky-500/10 border-sky-400/50 text-sky-200',
  finance: 'bg-emerald-500/10 border-emerald-400/50 text-emerald-300',
  shopping: 'bg-amber-500/15 border-amber-400/50 text-amber-200',
  other: 'bg-white/10 border-white/20 text-slate-200',
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
