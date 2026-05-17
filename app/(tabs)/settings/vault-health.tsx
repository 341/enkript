import { Link, router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { VaultScreenHeader } from '@/components/ui/vault-screen-header';
import { VaultSwitch } from '@/components/ui/vault-switch';
import { isPasswordPwned } from '@/lib/hibp';
import { analyzeVaultHealth, healthSummary, type HealthIssue } from '@/lib/vault-health';
import { useSecurityPrefsStore } from '@/stores/security-prefs-store';
import { usePasswordStore } from '@/stores/vault-store';

const KIND_LABEL: Record<HealthIssue['kind'], string> = {
  weak: 'Weak',
  reused: 'Reused',
  stale: 'Stale',
};

export default function VaultHealthScreen() {
  const passwords = usePasswordStore((s) => s.passwords);
  const issues = React.useMemo(() => analyzeVaultHealth(passwords), [passwords]);
  const summary = React.useMemo(() => healthSummary(issues), [issues]);
  const hibpEnabled = useSecurityPrefsStore((s) => s.hibpCheckEnabled);
  const setHibp = useSecurityPrefsStore((s) => s.setHibpCheckEnabled);
  const [checking, setChecking] = React.useState(false);

  async function checkBreaches() {
    if (!hibpEnabled) {
      Alert.alert('Enable breach check', 'Turn on HIBP checks in the toggle above.');
      return;
    }
    setChecking(true);
    try {
      let hits = 0;
      for (const entry of passwords) {
        if (!entry.password) continue;
        const { pwned, count } = await isPasswordPwned(entry.password);
        if (pwned) hits += 1;
        if (pwned && hits === 1) {
          Alert.alert(
            'Breach detected',
            `"${entry.title}" password appears in known breaches (~${count} sightings).`,
          );
          return;
        }
      }
      Alert.alert('No breaches found', 'Checked passwords against Have I Been Pwned (k-anonymity).');
    } catch (e) {
      Alert.alert('Check failed', e instanceof Error ? e.message : 'Network error');
    } finally {
      setChecking(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 120 }}
      className="flex-1 bg-slate-100 dark:bg-navy-950 px-8 pt-20">
      <Pressable accessibilityRole="button" onPress={() => router.back()} className="mb-4">
        <Text className="text-indigo-700 dark:text-indigo-300 text-lg">← Back</Text>
      </Pressable>
      <VaultScreenHeader title="Vault health" className="mb-10" />

      <View className="flex-row gap-4 mb-8">
        {(['weak', 'reused', 'stale'] as const).map((k) => (
          <View key={k} className="flex-1 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 p-4">
            <Text className="text-2xl font-display text-slate-900 dark:text-slate-100">{summary[k]}</Text>
            <Text className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">{KIND_LABEL[k]}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-slate-800 dark:text-slate-200 font-semibold">HIBP breach check</Text>
        <VaultSwitch value={hibpEnabled} onValueChange={setHibp} />
      </View>
      <Text className="text-xs text-slate-500 mb-4 leading-relaxed">
        Uses k-anonymity — only a SHA-1 prefix is sent to Have I Been Pwned. Full passwords never leave your device.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void checkBreaches()}
        className="rounded-full bg-indigo-500 py-3 items-center mb-10">
        {checking ? (
          <ActivityIndicator color="#f8fafc" />
        ) : (
          <Text className="text-slate-50 font-semibold">Check all passwords</Text>
        )}
      </Pressable>

      {issues.length === 0 ? (
        <Text className="text-slate-600 dark:text-slate-400 text-center mt-8">No issues found.</Text>
      ) : (
        issues.map((issue) => (
          <Link key={`${issue.kind}-${issue.entryId}`} href={`/(tabs)/passwords/${issue.entryId}` as never} asChild>
            <Pressable className="mb-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/5 p-4">
              <Text className="text-[10px] uppercase tracking-widest text-rose-500">{KIND_LABEL[issue.kind]}</Text>
              <Text className="text-slate-900 dark:text-slate-100 font-semibold mt-1">{issue.title}</Text>
              <Text className="text-slate-500 text-sm mt-1">{issue.detail}</Text>
            </Pressable>
          </Link>
        ))
      )}
    </ScrollView>
  );
}
