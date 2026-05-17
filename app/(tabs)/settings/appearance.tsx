import { View } from 'react-native';

import { VaultOptionCard } from '@/components/ui/vault-option-card';
import { VaultScreenHeader } from '@/components/ui/vault-screen-header';
import type { ThemePreference } from '@/stores/theme-preference-store';
import { useThemePreferenceStore } from '@/stores/theme-preference-store';

const OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: 'system', label: 'System', hint: 'Match iOS / Android light or dark.' },
  { value: 'light', label: 'Light', hint: 'Always use light appearance.' },
  { value: 'dark', label: 'Dark', hint: 'Always use dark appearance.' },
];

export default function AppearanceScreen() {
  const preference = useThemePreferenceStore((s) => s.preference);
  const setPreference = useThemePreferenceStore((s) => s.setPreference);

  return (
    <View className="flex-1 bg-slate-100 dark:bg-navy-950 px-8 pt-20">
      <VaultScreenHeader
        title="Appearance"
        subtitle="Chooses vault UI colors (PIN screen, passwords, generator, settings)."
      />

      <View className="mt-12 gap-y-3">
        {OPTIONS.map((opt) => (
          <VaultOptionCard
            key={opt.value}
            label={opt.label}
            hint={opt.hint}
            selected={preference === opt.value}
            onPress={() => void setPreference(opt.value)}
          />
        ))}
      </View>
    </View>
  );
}
