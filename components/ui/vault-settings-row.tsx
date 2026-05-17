import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type Props = {
  label: string;
  subtitle?: string;
  control: ReactNode;
  bordered?: boolean;
};

export function VaultSettingsRow({ label, subtitle, control, bordered = true }: Props) {
  return (
    <View
      className={`flex-row items-center justify-between py-6 ${bordered ? 'border-b border-slate-200 dark:border-white/10' : ''}`}>
      <View className="flex-1 pr-8">
        <Text className="text-slate-900 dark:text-slate-100 text-xl">{label}</Text>
        {subtitle ? (
          <Text className="text-slate-600 dark:text-slate-500 text-xs mt-2">{subtitle}</Text>
        ) : null}
      </View>
      {control}
    </View>
  );
}
