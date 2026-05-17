import { View } from 'react-native';

import { VaultOptionCard } from '@/components/ui/vault-option-card';
import { PIN_LENGTH_OPTIONS, type PinLength } from '@/lib/pin-length';

type Props = {
  value: PinLength;
  onChange: (length: PinLength) => void;
  disabled?: boolean;
};

export function PinLengthPicker({ value, onChange, disabled = false }: Props) {
  return (
    <View className="flex-row justify-center gap-x-3">
      {PIN_LENGTH_OPTIONS.map((len) => (
        <VaultOptionCard
          key={len}
          label={String(len)}
          hint="digits"
          selected={value === len}
          onPress={() => onChange(len)}
          disabled={disabled}
          compact
        />
      ))}
    </View>
  );
}
