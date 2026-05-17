import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type Props = {
  children: ReactNode;
  title?: string;
  className?: string;
};

export function VaultPanel({ children, title, className }: Props) {
  return (
    <View
      className={`rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-navy-900/70 p-5 gap-y-3 ${className ?? ''}`}>
      {title ? (
        <Text className="text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-[0.2em] uppercase">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
