import { Text, View } from 'react-native';

import type { BridgeWireStatus } from '@/lib/bridge-hub';

export function BridgeStatusBadge({ status }: { status: BridgeWireStatus }) {
  const palette =
    status === 'connected'
      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-900 dark:border-emerald-400/60 dark:text-emerald-300'
      : status === 'relay'
        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-900 dark:border-indigo-400/50 dark:text-indigo-200'
        : 'bg-rose-500/10 border-rose-500/35 text-rose-900 dark:border-rose-400/50 dark:text-rose-200';

  const labels: Record<BridgeWireStatus, string> = {
    connected: 'Connected',
    relay: 'Relay fallback',
    offline: 'Offline',
  };

  return (
    <View className={`self-start rounded-full border px-3 py-1 ${palette}`}>
      <Text className="font-sans text-[11px] font-semibold uppercase tracking-wide">{labels[status]}</Text>
    </View>
  );
}
