import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function VaultScreenHeader({ title, subtitle, className }: Props) {
  return (
    <View className={className}>
      <Text className="font-display text-3xl tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-slate-600 dark:text-slate-400 mt-4 text-base leading-relaxed">{subtitle}</Text>
      ) : null}
    </View>
  );
}
