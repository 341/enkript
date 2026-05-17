import { forwardRef, useCallback, useMemo, useState } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Pressable, Switch, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { StrengthMeter } from '@/components/vault/strength-meter';
import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import {
  bottomSheetBackground,
  bottomSheetHandleIndicator,
  sliderMaximumTrackTint,
  sliderMinimumTrackTint,
  sliderThumbTint,
  switchThumbColor,
  switchTrackColorOff,
  switchTrackColorOn,
} from '@/lib/ui-theme';
import {
  countEnabledTypes,
  generateSecurePassword,
  type GeneratorFlags,
} from '@/lib/generate-password';
import { estimatePasswordEntropyBits, strengthFromEntropy } from '@/lib/password-entropy';

type Props = {
  onPick: (pwd: string) => void;
};

export const GeneratorSheet = forwardRef<BottomSheetModal, Props>(function GeneratorSheetRef(
  { onPick },
  ref,
) {
  const snapPoints = useMemo(() => ['72%'], []);
  const [len, setLen] = useState(20);
  const [flags, setFlags] = useState<GeneratorFlags>({
    upper: true,
    lower: true,
    number: true,
    symbol: true,
  });

  const [preview, setPreview] = useState(() => generateSecurePassword(20, flags));

  const applyRegen = useCallback(() => {
    const next = generateSecurePassword(Math.round(len), flags);
    setPreview(next);
  }, [flags, len]);

  const bits = estimatePasswordEntropyBits(preview);
  const strength = strengthFromEntropy(bits);

  const scheme = useEffectiveColorScheme();

  const validTypes = countEnabledTypes(flags) >= 2;

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={(p) => (
        <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.7} />
      )}
      backgroundStyle={{
        backgroundColor: bottomSheetBackground(scheme),
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      handleIndicatorStyle={{ backgroundColor: bottomSheetHandleIndicator(scheme) }}>
      <BottomSheetView className="flex-1 px-6 pb-10">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-sans text-lg font-semibold text-slate-800 dark:text-slate-200">
            Password generator
          </Text>
          <Pressable
            onPress={applyRegen}
            className="rounded-lg bg-slate-200 dark:bg-navy-800 px-3 py-2 border border-slate-300 dark:border-white/5">
            <Text className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">Regenerate</Text>
          </Pressable>
        </View>
        <Text className="text-slate-600 dark:text-slate-400 text-xs mb-2">Length ({Math.round(len)})</Text>
        <Slider
          minimumValue={8}
          maximumValue={64}
          step={1}
          value={len}
          onValueChange={(v) => {
            setLen(v);
            const p = generateSecurePassword(Math.round(v), flags);
            setPreview(p);
          }}
          minimumTrackTintColor={sliderMinimumTrackTint(scheme)}
          maximumTrackTintColor={sliderMaximumTrackTint(scheme)}
          thumbTintColor={sliderThumbTint(scheme)}
        />
        {(['upper', 'lower', 'number', 'symbol'] as const).map((key) => (
          <View
            key={key}
            className="flex-row items-center justify-between py-2 border-b border-slate-200 dark:border-white/5">
            <Text className="text-slate-800 dark:text-slate-200 capitalize">
              {key === 'number' ? 'Numbers' : `${key}case`}
            </Text>
            <Switch
              value={flags[key]}
              onValueChange={(v) => {
                const next = { ...flags, [key]: v };
                const c = countEnabledTypes(next);
                if (c < 2) return;
                setFlags(next);
                setPreview(generateSecurePassword(Math.round(len), next));
              }}
              trackColor={{ false: switchTrackColorOff(scheme), true: switchTrackColorOn }}
              thumbColor={switchThumbColor}
            />
          </View>
        ))}
        {!validTypes ? (
          <Text className="text-rose-600 dark:text-rose-400 text-xs mt-2">Enable at least two character types.</Text>
        ) : null}
        <View className="mt-4 rounded-lg bg-slate-200 dark:bg-navy-800 p-3 border border-slate-300 dark:border-white/5">
          <Text className="text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wide">Preview</Text>
          <Text selectable className="font-mono text-[13px] text-slate-900 dark:text-slate-100 mt-2">
            {preview}
          </Text>
          <Text className="text-slate-600 dark:text-slate-400 text-xs mt-2">
            {bits} bits · {strength}
          </Text>
        </View>
        <View className="mt-3">
          <StrengthMeter password={preview} />
        </View>
        <Pressable
          disabled={!validTypes}
          onPress={() => {
            if (!validTypes) return;
            onPick(preview);
            if (typeof ref !== 'function' && ref) {
              ref.current?.dismiss();
            }
          }}
          className={`mt-6 rounded-lg py-3 items-center ${validTypes ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-navy-700'}`}>
          <Text className="text-slate-100 font-semibold">Use this password</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
