import { ScrollView, Text, View } from 'react-native';

import type { ImportPreviewRow } from '@/lib/import-export-service';

type Props = {
  rows: ImportPreviewRow[];
};

export function ImportPreviewList({ rows }: Props) {
  return (
    <ScrollView className="max-h-80 mt-4">
      <View className="gap-y-3">
        {rows.map((row, idx) => (
          <View
            key={`${row.title}-${row.username}-${String(idx)}`}
            className="rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 px-4 py-3">
            <Text className="text-slate-900 dark:text-slate-100 font-semibold">{row.title}</Text>
            <Text className="text-slate-600 dark:text-slate-400 text-sm mt-1">{row.username}</Text>
            <Text className="font-mono text-xs text-slate-500 mt-2">••••••••••••••••</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
