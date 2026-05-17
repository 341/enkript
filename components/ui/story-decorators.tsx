import type { ReactNode } from 'react';
import { View } from 'react-native';

export function VaultStoryPad({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 bg-slate-100 dark:bg-navy-950 p-6 justify-center">{children}</View>
  );
}
