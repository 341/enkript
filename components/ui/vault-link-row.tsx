import type { ReactNode } from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';

export type VaultLinkRowVariant = 'default' | 'accent';

const VARIANT_CLASS: Record<VaultLinkRowVariant, string> = {
  default: 'border-slate-200 dark:border-white/[0.05] bg-white dark:bg-navy-900',
  accent:
    'border-dashed border-violet-400/40 dark:border-violet-400/30 bg-violet-50 dark:bg-violet-950/30',
};

const TEXT_CLASS: Record<VaultLinkRowVariant, string> = {
  default: 'text-slate-900 dark:text-slate-100',
  accent: 'text-violet-700 dark:text-violet-300',
};

const CHEVRON_CLASS: Record<VaultLinkRowVariant, string> = {
  default: 'text-slate-500',
  accent: 'text-violet-500',
};

type Props = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: VaultLinkRowVariant;
  trailing?: ReactNode;
};

export function VaultLinkRow({
  title,
  variant = 'default',
  trailing,
  className,
  ...props
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`rounded-2xl border px-6 py-5 flex-row justify-between items-center ${VARIANT_CLASS[variant]} ${className ?? ''}`}
      {...props}>
      <Text className={`text-lg ${TEXT_CLASS[variant]}`}>{title}</Text>
      {trailing ?? <Text className={CHEVRON_CLASS[variant]}>→</Text>}
    </Pressable>
  );
}
