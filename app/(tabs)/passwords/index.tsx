import { Link, router } from 'expo-router';
import { Plus, Settings } from 'lucide-react-native';
import * as React from 'react';
import { useDeferredValue } from 'react';
import { Alert, type AlertButton, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { VaultCard } from '@/components/vault/vault-card';
import { VaultSearchField } from '@/components/vault/vault-text-field';
import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';

import type { PasswordCategory, PasswordEntry } from '@/lib/types';

import { activityIndicatorTint } from '@/lib/ui-theme';

import { useVaultLockStore } from '@/stores/vault-lock-store';
import { usePasswordStore } from '@/stores/vault-store';

const CATEGORY_ORDER: PasswordCategory[] = ['social', 'work', 'finance', 'shopping', 'other'];
const CATEGORY_LABELS: Record<PasswordCategory, string> = {
  social: 'SOCIAL',
  work: 'WORK',
  finance: 'FINANCE',
  shopping: 'SHOPPING',
  other: 'OTHER',
};

function group(entries: PasswordEntry[]) {
  const map = new Map<PasswordCategory, PasswordEntry[]>();
  CATEGORY_ORDER.forEach((c) => map.set(c, []));
  entries.forEach((e) => {
    const key = e.category ?? 'other';
    const bucket = map.get(key) ?? [];
    bucket.push(e);
    map.set(key, bucket);
  });
  return CATEGORY_ORDER.map((c) => ({ title: CATEGORY_LABELS[c], data: map.get(c) ?? [] })).filter(
    (section) => section.data.length > 0,
  );
}

export default function PasswordListScreen() {
  const scheme = useEffectiveColorScheme();
  const accent = activityIndicatorTint(scheme);

  const updateLastActive = useVaultLockStore((s) => s.updateLastActive);
  React.useEffect(() => {
    updateLastActive();
  }, [updateLastActive]);

  const entries = usePasswordStore((s) => s.passwords);
  const removePassword = usePasswordStore((s) => s.removePassword);
  const updatePassword = usePasswordStore((s) => s.updatePassword);
  const hydrateFromDisk = usePasswordStore((s) => s.hydrateFromDisk);

  const [search, setSearch] = React.useState('');
  const deferred = useDeferredValue(search);

  const [refreshing, setRefreshing] = React.useState(false);

  const filtered = React.useMemo(() => {
    const needle = deferred.trim().toLowerCase();
    if (!needle) return entries.slice().sort((a, b) => b.updatedAt - a.updatedAt);
    return entries
      .filter((e) => {
        return (
          e.title.toLowerCase().includes(needle) ||
          e.username.toLowerCase().includes(needle) ||
          e.url.toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [entries, deferred]);

  const grouped = React.useMemo(() => group(filtered), [filtered]);

  function longPress(entry: PasswordEntry) {
    Alert.alert(entry.title, 'Choose an action', [
      {
        text: 'Edit',
        onPress: () => router.push(`/(tabs)/passwords/${entry.id}/edit`),
      },
      { text: 'Delete', style: 'destructive', onPress: () => void removePassword(entry.id) },
      {
        text: 'Move',
        onPress: () => {
          const buttons: AlertButton[] = CATEGORY_ORDER.map((cat) => ({
            text: CATEGORY_LABELS[cat],
            onPress: () => void updatePassword(entry.id, { category: cat }),
            style: cat === entry.category ? 'destructive' : 'default',
          }));
          Alert.alert('Move to category', undefined, [...buttons, { text: 'Cancel', style: 'cancel', onPress: () => {} }]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <View className="flex-1 bg-slate-100 dark:bg-navy-950">
      <View className="pt-14 px-6 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="font-display text-2xl tracking-tight text-slate-900 dark:text-slate-100">Vault</Text>
          <Text className="text-[11px] text-slate-600 dark:text-slate-500 mt-1">Encrypted password stash</Text>
        </View>
        <Link
          href="/(tabs)/settings"
          className="h-22 w-22 rounded-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 p-2 overflow-hidden flex items-center justify-center">
          <Settings color={accent} size={22} strokeWidth={2.25} />
        </Link>
      </View>

      <View className="px-6 mb-5">
        <VaultSearchField value={search} onChangeText={setSearch} />
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={accent}
            onRefresh={async () => {
              setRefreshing(true);
              await hydrateFromDisk();
              setRefreshing(false);
            }}
          />
        }>
        {grouped.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(120)} className="items-center mt-16 gap-y-6">
            <Text className="text-6xl opacity-70">📂</Text>
            <Text className="text-slate-700 dark:text-slate-300 text-center px-12 font-display text-xl tracking-tight">
              Add your first password
            </Text>
            <Link href="/(tabs)/passwords/new" className="rounded-full bg-indigo-500 px-8 py-3 shadow-fab">
              <Text className="text-slate-50 font-semibold">Create entry</Text>
            </Link>
          </Animated.View>
        ) : (
          grouped.map((section, si) => (
            <View key={section.title} className={si === 0 ? '' : 'mt-10'}>
              <Text className="text-[11px] font-semibold text-slate-600 dark:text-slate-500 mb-4 tracking-[0.25em]">
                {section.title} ({section.data.length})
              </Text>
              {section.data.map((item, ii) => (
                <VaultCard
                  key={item.id}
                  entry={item}
                  delay={(si * 8 + ii) * 45}
                  onLongPress={() => longPress(item)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Link
        href="/(tabs)/passwords/new"
        className="absolute bottom-6 right-6 h-33 w-33 rounded-full bg-indigo-500 shadow-fab border p-2 border-indigo-300/60 overflow-hidden flex items-center justify-center">
        <Plus color="#F8FAFC" size={28} strokeWidth={2.3} />
      </Link>
    </View>
  );
}
