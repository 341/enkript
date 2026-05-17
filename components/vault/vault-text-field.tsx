import { Search } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  Platform,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { CenteredIcon } from '@/components/vault/centered-icon';
import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import { placeholderColor, tabBarInactiveTint } from '@/lib/ui-theme';

export type VaultTextFieldVariant = 'default' | 'credential' | 'multiline' | 'pin';

const FIELD_SHELL =
  'rounded-xl bg-slate-200 dark:bg-navy-800 border border-slate-300 dark:border-white/5';

const MULTILINE_INPUT =
  'px-4 py-3 text-base font-mono text-sm text-slate-900 dark:text-slate-100 leading-6 min-h-[120]';

const SINGLE_LINE_CONTAINER = `${FIELD_SHELL} px-4 justify-center min-h-[48px]`;
const SINGLE_LINE_CONTAINER_DENSE = `${FIELD_SHELL} px-4 justify-center min-h-[44px]`;

const SINGLE_LINE_INPUT = 'w-full p-0 m-0 text-base leading-5';

const VARIANT_CLASS: Record<VaultTextFieldVariant, string> = {
  default: 'text-slate-900 dark:text-slate-100 font-sans',
  credential: 'font-mono text-indigo-800 dark:text-indigo-200',
  multiline: MULTILINE_INPUT,
  pin: 'font-mono text-slate-900 dark:text-white',
};

function singleLineAlignStyle(): StyleProp<TextStyle> {
  return Platform.select({
    ios: { lineHeight: 20, paddingTop: 0, paddingBottom: 0 },
    android: { includeFontPadding: false, textAlignVertical: 'center' },
    default: {},
  });
}

export function vaultInputClassName(
  variant: VaultTextFieldVariant = 'default',
  opts?: { dense?: boolean; className?: string },
): string {
  const parts =
    variant === 'multiline'
      ? [`${FIELD_SHELL} ${VARIANT_CLASS.multiline}`]
      : [opts?.dense ? SINGLE_LINE_CONTAINER_DENSE : SINGLE_LINE_CONTAINER];
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
  multiline,
  style,
  ...props
}: VaultTextInputProps) {
  const scheme = useEffectiveColorScheme();
  const placeholder = placeholderTextColor ?? placeholderColor(scheme);
  const isMultiline = variant === 'multiline' || multiline;

  if (isMultiline) {
    return (
      <TextInput
        placeholderTextColor={placeholder}
        className={vaultInputClassName('multiline', { dense, className })}
        multiline
        textAlignVertical="top"
        style={style}
        {...props}
      />
    );
  }

  const containerClass = `${dense ? SINGLE_LINE_CONTAINER_DENSE : SINGLE_LINE_CONTAINER}${dense ? '' : ' mt-3'}${className ? ` ${className}` : ''}`;
  const inputClass = `${SINGLE_LINE_INPUT} ${VARIANT_CLASS[variant]}`;

  return (
    <View className={containerClass}>
      <TextInput
        placeholderTextColor={placeholder}
        className={inputClass}
        textAlignVertical="center"
        style={[singleLineAlignStyle(), style]}
        {...props}
      />
    </View>
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
    <View className="rounded-lg bg-slate-200 dark:bg-navy-800 border border-slate-300 dark:border-white/[0.04] pl-3 pr-4 flex-row items-center gap-2 min-h-[48px]">
      <CenteredIcon size={20}>
        <Search color={mutedIcon} size={20} strokeWidth={2.25} />
      </CenteredIcon>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeholderTint}
        className="flex-1 p-0 m-0 text-base leading-5 text-slate-900 dark:text-slate-100 font-sans"
        textAlignVertical="center"
        style={singleLineAlignStyle()}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
