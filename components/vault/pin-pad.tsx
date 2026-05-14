import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  length?: number;
  onComplete: (pin: string) => void;
  /** Blocks input while parent runs async work (e.g. hashing / verify). */
  disabled?: boolean;
};

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['blank', '0', 'bksp'],
] as const;

export function PinPad({ length = 6, onComplete, disabled = false }: Props) {
  const [digits, setDigits] = useState('');

  function press(key: string) {
    if (disabled) return;
    if (key === 'bksp') {
      setDigits((d) => d.slice(0, -1));
      return;
    }
    if (key === 'blank') return;
    setDigits((d) => {
      if (d.length >= length) return d;
      const next = d + key;
      if (next.length === length) {
        queueMicrotask(() => {
          onComplete(next);
          setDigits('');
        });
      }
      return next;
    });
  }

  return (
    <View className={`items-center gap-y-6 ${disabled ? 'opacity-40' : ''}`} pointerEvents={disabled ? 'none' : 'auto'}>
      <View className="flex-row gap-x-5 justify-center">
        {Array.from({ length }).map((_, i) => (
          <View
            key={`dot-${String(i)}`}
            className={`h-3 w-3 rounded-full border border-slate-500 ${i < digits.length ? 'bg-indigo-400' : 'bg-transparent'}`}
          />
        ))}
      </View>
      <View className="w-full px-10 gap-y-4">
        {ROWS.map((row, ri) => (
          <View key={String(ri)} className="flex-row justify-center gap-x-4">
            {row.map((cell) =>
              cell === 'blank' ? (
                <View key="gap" style={{ width: 72 }} />
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={cell === 'bksp' ? 'delete digit' : `digit ${cell}`}
                  key={cell}
                  disabled={disabled}
                  onPress={() => press(cell)}
                  className="w-[72px] h-[54px] items-center justify-center rounded-xl bg-navy-800 border border-white/10 active:bg-navy-700">
                  <Text className="text-slate-100 text-xl font-semibold">{cell === 'bksp' ? '⌫' : cell}</Text>
                </Pressable>
              ),
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
