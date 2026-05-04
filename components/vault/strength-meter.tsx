import { memo } from 'react';
import { Text, View } from 'react-native';

import { estimatePasswordEntropyBits, strengthFromEntropy } from '@/lib/password-entropy';

type Props = { password: string };

export const StrengthMeter = memo(function StrengthMeterImpl({ password }: Props) {
  const bits = estimatePasswordEntropyBits(password);
  const label = strengthFromEntropy(bits);
  const pct =
    label === 'Strong' ? 100 : label === 'Medium' ? 66 : bits > 0 ? 38 : 0;

  const barColors =
    label === 'Strong'
      ? 'bg-emerald-400'
      : label === 'Medium'
        ? 'bg-amber-400'
        : bits > 0
          ? 'bg-rose-400'
          : 'bg-transparent';

  return (
    <View className="gap-y-2">
      <Text className="font-sans text-xs text-slate-400">{`${label} • ${bits} bits entropy`}</Text>
      <View className="h-2 rounded-md bg-white/10 overflow-hidden">
        <View className={`h-full rounded-md ${barColors}`} style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
});
