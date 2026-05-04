import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Globe } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CenteredIcon } from '@/components/vault/centered-icon';
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
        className="rounded-lg bg-navy-900 p-4 mb-3 shadow-card border border-white/[0.06] active:bg-navy-900/80">
        <View className="flex-row gap-4">
          <View className="h-11 w-11 shrink-0 rounded-lg bg-indigo-500/15 border border-white/10 overflow-hidden">
            <CenteredIcon size={44}>
              <Globe color="#818CF8" size={22} strokeWidth={2.25} />
            </CenteredIcon>
          </View>
          <View className="flex-1 min-w-0">
            <Text className="font-sans text-base font-semibold text-slate-200" numberOfLines={1}>
              {entry.title}
            </Text>
            <Text className="font-sans text-sm text-slate-400 mt-1" numberOfLines={1}>
              {entry.username}
            </Text>
            <Text className="font-mono text-xs text-slate-500 mt-1">••••••••••••••••</Text>
            <View className="flex-row gap-6 mt-4">
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void copyWithAutoClear(`pwd-${entry.id}`, entry.password, 30000).then(() => {
                    toast.show('Copied! Clears in 30 seconds.');
                  });
                }}>
                <Text className="text-indigo-400 text-sm font-medium">Copy</Text>
              </Pressable>
              <Link href={`/(tabs)/passwords/${entry.id}`} accessibilityRole="link">
                <Text className="text-slate-200 text-sm font-medium">Open →</Text>
              </Link>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
