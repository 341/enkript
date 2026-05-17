import { Link } from "expo-router";
import { View } from "react-native";

import { VaultLinkRow } from "@/components/ui/vault-link-row";
import { VaultScreenHeader } from "@/components/ui/vault-screen-header";
import { canAccessStorybook } from "@/lib/storybook-env";

const rows = [
  { title: "Appearance", href: "/(tabs)/settings/appearance" },
  { title: "Security", href: "/(tabs)/settings/security" },
  { title: "Vault health", href: "/(tabs)/settings/vault-health" },
  { title: "Secure notes", href: "/(tabs)/settings/notes" },
  { title: "Payment cards", href: "/(tabs)/settings/cards" },
  { title: "Autofill", href: "/(tabs)/settings/autofill" },
  { title: "Import / Export", href: "/(tabs)/settings/import-export" },
  { title: "Browser bridge", href: "/(tabs)/settings/browser-bridge" },
] as const;

export default function SettingsRoot() {
  return (
    <View className="flex-1 bg-slate-100 dark:bg-navy-950 px-8 pt-20">
      <VaultScreenHeader title="Settings" className="mb-14" />
      <View className="gap-y-5">
        {rows.map((row) => (
          <Link href={row.href as never} key={row.title} asChild>
            <VaultLinkRow title={row.title} />
          </Link>
        ))}
        {canAccessStorybook ? (
          <Link href="/storybook" asChild>
            <VaultLinkRow title="Storybook" variant="accent" />
          </Link>
        ) : null}
      </View>
    </View>
  );
}
