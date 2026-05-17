import * as React from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import * as Clipboard from "expo-clipboard";
import { Pressable, Switch, Text, View } from "react-native";
import Slider from "@react-native-community/slider";

import { useVaultCopyToast } from "@/components/vault/copy-toast-host";
import { StrengthMeter } from "@/components/vault/strength-meter";
import { useEffectiveColorScheme } from "@/hooks/useEffectiveColorScheme";
import { countEnabledTypes, generateSecurePassword, type GeneratorFlags } from "@/lib/generate-password";
import { estimatePasswordEntropyBits, strengthFromEntropy } from "@/lib/password-entropy";
import {
  bottomSheetBackground,
  sliderMaximumTrackTint,
  sliderMinimumTrackTint,
  sliderThumbTint,
  switchThumbColor,
  switchTrackColorOff,
  switchTrackColorOn,
} from "@/lib/ui-theme";

export default function StandaloneGenerator() {
  const scheme = useEffectiveColorScheme();
  const sheetRef = React.useRef<BottomSheetModal>(null);
  const toast = useVaultCopyToast();

  React.useEffect(() => {
    queueMicrotask(() => sheetRef.current?.present());
  }, []);

  const [len, setLen] = React.useState(22);
  const [flags, setFlags] = React.useState<GeneratorFlags>({
    upper: true,
    lower: true,
    number: true,
    symbol: true,
  });

  const [preview, setPreview] = React.useState(() => generateSecurePassword(22, flags));

  const validTypes = countEnabledTypes(flags) >= 2;

  React.useEffect(() => {
    if (!validTypes) return;
    setPreview(generateSecurePassword(Math.round(len), flags));
  }, [flags, len, validTypes]);

  const bits = estimatePasswordEntropyBits(preview);
  const label = strengthFromEntropy(bits);

  return (
    <View className="flex-1 bg-slate-100 dark:bg-navy-950 px-7 pt-20">
      <Text className="font-display text-3xl tracking-tight text-slate-900 dark:text-slate-100">Generator</Text>
      <Text className="text-slate-600 dark:text-slate-400 mt-2">
        Length {Math.round(len)} · {bits} bits · {label}
      </Text>

      <Slider
        className="mt-8"
        minimumValue={8}
        maximumValue={64}
        step={1}
        value={len}
        onValueChange={(v) => setLen(v)}
        minimumTrackTintColor={sliderMinimumTrackTint(scheme)}
        maximumTrackTintColor={sliderMaximumTrackTint(scheme)}
        thumbTintColor={sliderThumbTint(scheme)}
      />

      {(["upper", "lower", "number", "symbol"] as const).map((key) => (
        <View
          key={key}
          className="flex-row items-center justify-between py-3 border-b border-slate-200 dark:border-white/5">
          <Text className="text-slate-800 dark:text-slate-200 capitalize">
            {key === "number" ? "Numbers" : `${key}case`}
          </Text>
          <Switch
            value={flags[key]}
            onValueChange={(v) => {
              const next = { ...flags, [key]: v };
              if (countEnabledTypes(next) < 2) return;
              setFlags(next);
            }}
            trackColor={{ false: switchTrackColorOff(scheme), true: switchTrackColorOn }}
            thumbColor={switchThumbColor}
          />
        </View>
      ))}

      <View className="mt-8 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 p-4">
        <Text className="text-xs text-slate-600 dark:text-slate-500 uppercase tracking-[0.8em]">preview</Text>
        <Text selectable className="font-mono text-lg text-slate-900 dark:text-slate-100 mt-4">
          {preview}
        </Text>
        <StrengthMeter password={preview} />
      </View>

      <View className="flex-row gap-6 mt-10">
        <Pressable
          accessibilityRole="button"
          onPress={() => setPreview(generateSecurePassword(Math.round(len), flags))}
          className="flex-1 rounded-xl border border-slate-300 dark:border-white/10 py-3 items-center">
          <Text className="text-slate-900 dark:text-slate-100 font-semibold">Regenerate</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void Clipboard.setStringAsync(preview).then(() => toast.show("Password copied"));
          }}
          className="flex-1 rounded-xl bg-indigo-500 py-3 items-center">
          <Text className="text-slate-50 font-semibold">Copy</Text>
        </Pressable>
      </View>

      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={["45%"]}
        enablePanDownToClose
        backdropComponent={(p) => (
          <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.55} />
        )}
        backgroundStyle={{ backgroundColor: bottomSheetBackground(scheme) }}>
        <BottomSheetView className="px-8 py-6">
          <Text className="text-slate-800 dark:text-slate-200 text-lg font-semibold">Quick tip</Text>
          <Text className="text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            Use the generator tab for quick random strings. When editing logins, open the built-in sheet for one-tap paste.
          </Text>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
