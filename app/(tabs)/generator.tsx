import * as React from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import * as Clipboard from "expo-clipboard";
import { Pressable, Switch, Text, View } from "react-native";
import Slider from "@react-native-community/slider";

import { StrengthMeter } from "@/components/vault/strength-meter";
import { countEnabledTypes, generateSecurePassword, type GeneratorFlags } from "@/lib/generate-password";
import { estimatePasswordEntropyBits, strengthFromEntropy } from "@/lib/password-entropy";

export default function StandaloneGenerator() {
  const sheetRef = React.useRef<BottomSheetModal>(null);

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
    <View className="flex-1 bg-navy-950 px-7 pt-20">
      <Text className="font-display text-3xl tracking-tight text-slate-100">Generator</Text>
      <Text className="text-slate-400 mt-2">Length {Math.round(len)} · {bits} bits · {label}</Text>

      <Slider
        className="mt-8"
        minimumValue={8}
        maximumValue={64}
        step={1}
        value={len}
        onValueChange={(v) => setLen(v)}
        minimumTrackTintColor="#6366F1"
        maximumTrackTintColor="#1B2847"
        thumbTintColor="#818CF8"
      />

      {(["upper", "lower", "number", "symbol"] as const).map((key) => (
        <View key={key} className="flex-row items-center justify-between py-3 border-b border-white/5">
          <Text className="text-slate-200 capitalize">{key === "number" ? "Numbers" : `${key}case`}</Text>
          <Switch
            value={flags[key]}
            onValueChange={(v) => {
              const next = { ...flags, [key]: v };
              if (countEnabledTypes(next) < 2) return;
              setFlags(next);
            }}
            trackColor={{ false: "#1B2847", true: "#4F46E5" }}
            thumbColor="#E2E8F0"
          />
        </View>
      ))}

      <View className="mt-8 rounded-2xl bg-navy-900 border border-white/5 p-4">
        <Text className="text-xs text-slate-500 uppercase tracking-[0.8em]">preview</Text>
        <Text selectable className="font-mono text-lg text-slate-100 mt-4">{preview}</Text>
        <StrengthMeter password={preview} />
      </View>

      <View className="flex-row gap-6 mt-10">
        <Pressable
          accessibilityRole="button"
          onPress={() => setPreview(generateSecurePassword(Math.round(len), flags))}
          className="flex-1 rounded-xl border border-white/10 py-3 items-center">
          <Text className="text-slate-100 font-semibold">Regenerate</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => Clipboard.setStringAsync(preview)}
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
        backgroundStyle={{ backgroundColor: "#0D1426" }}>
        <BottomSheetView className="px-8 py-6">
          <Text className="text-slate-200 text-lg font-semibold">Quick tip</Text>
          <Text className="text-slate-400 mt-3 leading-relaxed">
            Use the generator tab for quick random strings. When editing logins, open the built-in sheet for one-tap paste.
          </Text>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
