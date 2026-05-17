import type { ReactNode } from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';

export type VaultButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type VaultButtonSize = 'md' | 'lg';

const VARIANT_CLASS: Record<VaultButtonVariant, string> = {
  primary: 'bg-indigo-600 border border-indigo-600 active:bg-indigo-700',
  secondary:
    'bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 active:bg-slate-100 dark:active:bg-navy-800',
  danger: 'bg-emerald-500 border border-emerald-500 active:bg-emerald-600',
  ghost: 'bg-transparent border border-transparent active:bg-slate-200/60 dark:active:bg-white/5',
};

const TEXT_CLASS: Record<VaultButtonVariant, string> = {
  primary: 'text-slate-50',
  secondary: 'text-slate-900 dark:text-slate-100',
  danger: 'text-white',
  ghost: 'text-indigo-700 dark:text-indigo-300',
};

const SIZE_CLASS: Record<VaultButtonSize, string> = {
  md: 'rounded-xl px-6 py-4',
  lg: 'rounded-2xl px-10 py-4',
};

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: VaultButtonVariant;
  size?: VaultButtonSize;
  children?: ReactNode;
};

export function VaultButton({
  label,
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  children,
  ...props
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={`items-center justify-center ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${disabled ? 'opacity-40' : ''} ${className ?? ''}`}
      {...props}>
      {children ?? (
        <Text className={`font-semibold text-lg ${TEXT_CLASS[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
