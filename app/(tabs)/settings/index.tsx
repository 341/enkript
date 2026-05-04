import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

const rows = [
  { title: "Security", href: "/(tabs)/settings/security" },
  { title: "Autofill", href: "/(tabs)/settings/autofill" },
  { title: "Import / Export", href: "/(tabs)/settings/import-export" },
  { title: "Browser bridge", href: "/(tabs)/settings/browser-bridge" },
] as const;

export default function SettingsRoot() {
  return (
    <View className="flex-1 bg-navy-950 px-8 pt-20">
      <Text className="font-display text-3xl tracking-tight text-slate-100">Settings</Text>
      <View className="mt-14 gap-y-5">
        {rows.map((row) => (
          <Link href={row.href as never} key={row.title} asChild>
            <Pressable className="rounded-2xl border border-white/[0.05] px-6 py-5 bg-navy-900 flex-row justify-between">
              <Text className="text-slate-100 text-lg">{row.title}</Text>
              <Text className="text-slate-500">→</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}
