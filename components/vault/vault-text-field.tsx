import { Search } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { CenteredIcon } from '@/components/vault/centered-icon';
import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import { placeholderColor, tabBarInactiveTint } from '@/lib/ui-theme';

export type VaultTextFieldVariant = 'default' | 'credential' | 'multiline' | 'pin';

const INPUT_BASE =
  'rounded-xl bg-slate-200 dark:bg-navy-800 px-4 py-3 border border-slate-300 dark:border-white/5 text-base';

const VARIANT_CLASS: Record<VaultTextFieldVariant, string> = {
  default: 'text-slate-900 dark:text-slate-100 font-sans',
  credential: 'font-mono text-indigo-800 dark:text-indigo-200',
  multiline: 'font-mono text-sm text-slate-900 dark:text-slate-100 leading-6 min-h-[120]',
  pin: 'font-mono text-slate-900 dark:text-white',
};

export function vaultInputClassName(
  variant: VaultTextFieldVariant = 'default',
  opts?: { dense?: boolean; className?: string },
): string {
  const parts = [INPUT_BASE, VARIANT_CLASS[variant]];
  if (!opts?.dense) parts.unshift('mt-3');
  if (opts?.className) parts.push(opts.className);
  return parts.join(' ');
}

type VaultFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

/** Uppercase label wrapper for form sections. */
export function VaultField({ label, children, className }: VaultFieldProps) {
  return (
    <View className={className ?? 'mt-10'}>
      <Text className="text-[11px] text-slate-600 dark:text-slate-500 tracking-[0.35em] font-semibold">
        {label.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

export type VaultTextInputProps = TextInputProps & {
  variant?: VaultTextFieldVariant;
  /** Omit top margin (e.g. stacked fields in a panel). */
  dense?: boolean;
};

/** Styled TextInput — use inside VaultField or standalone. */
export function VaultTextInput({
  variant = 'default',
  dense = false,
  className,
  placeholderTextColor,
  ...props
}: VaultTextInputProps) {
  const scheme = useEffectiveColorScheme();
  const placeholder = placeholderTextColor ?? placeholderColor(scheme);

  return (
    <TextInput
      placeholderTextColor={placeholder}
      className={vaultInputClassName(variant, { dense, className })}
      {...props}
    />
  );
}

type VaultTextFieldProps = VaultTextInputProps & {
  label: string;
  fieldClassName?: string;
};

/** Label + styled TextInput. */
export function VaultTextField({ label, fieldClassName, ...inputProps }: VaultTextFieldProps) {
  return (
    <VaultField label={label} className={fieldClassName}>
      <VaultTextInput {...inputProps} />
    </VaultField>
  );
}

type VaultSearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

/** Search bar with leading icon (password list). */
export function VaultSearchField({
  value,
  onChangeText,
  placeholder = 'Search passwords…',
}: VaultSearchFieldProps) {
  const scheme = useEffectiveColorScheme();
  const mutedIcon = tabBarInactiveTint(scheme);
  const placeholderTint = placeholderColor(scheme);

  return (
    <View className="rounded-lg bg-slate-200 dark:bg-navy-800 border border-slate-300 dark:border-white/[0.04] pl-3 pr-4 py-2 flex-row items-center gap-2 min-h-[48px]">
      <CenteredIcon size={20}>
        <Search color={mutedIcon} size={20} strokeWidth={2.25} />
      </CenteredIcon>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeholderTint}
        className="flex-1 py-1 text-base text-slate-900 dark:text-slate-100 font-sans"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
