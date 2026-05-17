import { Text } from 'react-native';

type Props = {
  children: string;
  className?: string;
};

export function VaultSectionLabel({ children, className }: Props) {
  return (
    <Text
      className={`text-[11px] text-slate-600 dark:text-slate-500 tracking-[0.35em] uppercase font-semibold ${className ?? ''}`}>
      {children}
    </Text>
  );
}
