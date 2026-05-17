import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
};

export function VaultOptionCard({
  label,
  hint,
  selected,
  onPress,
  disabled = false,
  compact = false,
  className,
}: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`rounded-2xl border ${compact ? 'px-5 py-4 items-center min-w-[72px]' : 'px-6 py-4'} ${
        selected
          ? compact
            ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-500/20 dark:bg-indigo-500/25'
            : 'border-indigo-500 dark:border-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/15'
          : 'border-slate-200 bg-white dark:border-white/10 dark:bg-navy-900'
      } ${disabled ? 'opacity-50' : ''} ${className ?? ''}`}>
      <Text
        className={`${compact ? 'text-lg' : 'text-lg'} font-semibold ${
          selected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'
        }`}>
        {label}
      </Text>
      {hint ? (
        <Text className="text-slate-600 dark:text-slate-500 text-xs mt-2 leading-snug">{hint}</Text>
      ) : null}
    </Pressable>
  );
}
