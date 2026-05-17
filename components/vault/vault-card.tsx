import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DomainFavicon } from '@/components/vault/domain-favicon';
import { copyWithAutoClear } from '@/lib/clipboard-vault';
import type { PasswordEntry } from '@/lib/types';

import { useVaultCopyToast } from './copy-toast-host';

type Props = {
  entry: PasswordEntry;
  delay: number;
  onLongPress?: () => void;
};

export function VaultCard({ entry, delay, onLongPress }: Props) {
  const toast = useVaultCopyToast();

  return (
    <Animated.View entering={FadeInDown.duration(340).springify().delay(delay)}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Long press for more actions"
        onLongPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onLongPress?.();
        }}
        delayLongPress={280}
        className="rounded-lg bg-white dark:bg-navy-900 p-4 mb-3 shadow-card border border-slate-200 dark:border-white/[0.06] active:bg-slate-100 dark:active:bg-navy-900/80">
        <View className="flex-row gap-4">
          <DomainFavicon url={entry.url} />
          <View className="flex-1 min-w-0">
            <Text className="font-sans text-base font-semibold text-slate-900 dark:text-slate-200" numberOfLines={1}>
              {entry.title}
            </Text>
            <Text className="font-sans text-sm text-slate-600 dark:text-slate-400 mt-1" numberOfLines={1}>
              {entry.username}
            </Text>
            <Text className="font-mono text-xs text-slate-500 dark:text-slate-500 mt-1">••••••••••••••••</Text>
            <View className="flex-row gap-6 mt-4">
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void copyWithAutoClear(`pwd-${entry.id}`, entry.password, 30000).then(() => {
                    toast.show('Password copied. Clears in 30 seconds.');
                  });
                }}>
                <Text className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">Copy</Text>
              </Pressable>
              <Link href={`/(tabs)/passwords/${entry.id}`} accessibilityRole="link">
                <Text className="text-slate-700 dark:text-slate-200 text-sm font-medium">Open →</Text>
              </Link>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
