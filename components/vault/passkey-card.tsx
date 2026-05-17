import { Text, View } from 'react-native';

import type { PasskeyEntry } from '@/lib/types';

type Props = {
  entry: PasskeyEntry;
};

export function PasskeyCard({ entry }: Props) {
  return (
    <View className="rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 p-4 mb-3 shadow-card">
      <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-display">{entry.rpName}</Text>
      <Text className="text-indigo-700 dark:text-indigo-300 text-xs mt-1">{entry.rpId}</Text>
      <Text className="text-slate-600 dark:text-slate-400 mt-3">{entry.userName}</Text>
      <View className="flex-row mt-3 items-center justify-between">
        <Text className="text-slate-600 dark:text-slate-500 text-xs">
          Created {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
        <Text className={`text-xs font-medium ${entry.backedUp ? 'text-emerald-400' : 'text-amber-400'}`}>
          {entry.backedUp ? '☁ Backed up' : 'Not backed up'}
        </Text>
      </View>
    </View>
  );
}
