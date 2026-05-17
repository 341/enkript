import * as Crypto from "expo-crypto";
import * as React from "react";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { VaultButton } from '@/components/ui/vault-button';
import { VaultScreenHeader } from '@/components/ui/vault-screen-header';
import { BridgeStatusBadge } from "@/components/vault/bridge-status-badge";
import { reconnectBridgeRelay } from "@/components/vault/bridge-wire-sync";
import { randomPairingSecret } from "@/lib/base64-secret";
import { RELAY_WS_URL_FALLBACK } from "@/lib/constants";
import { armPairSession, disarmPairSession } from "@/lib/pair-session";
import type { PairedBrowserDevice } from "@/lib/types";
import { qrModalBackdrop } from '@/lib/ui-theme';
import { useVaultStore } from "@/stores/vault-store";

export default function BrowserBridgeScreen() {
  const paired = useVaultStore((s) => s.pairedDevices);
  const revokeDevice = useVaultStore((s) => s.revokeDevice);

  const [qrVisible, setQrVisible] = React.useState(false);
  const [payload, setPayload] = React.useState<string>("");
  const [status, setStatus] = React.useState<"offline" | "relay" | "connected">("offline");

  React.useEffect(() => {
    return () => disarmPairSession();
  }, []);

  function openPairSheet() {
    const sessionId = Crypto.randomUUID();
    const proof = randomPairingSecret();
    armPairSession(proof);

    const body = JSON.stringify({
      sessionId,
      port: 54321,
      secret: proof,
      relay: RELAY_WS_URL_FALLBACK || "wss://relay.example.invalid",
    });
    setPayload(body);
    setQrVisible(true);
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }} className="flex-1 bg-slate-100 dark:bg-navy-950 px-8 pt-24">
      <VaultScreenHeader title="Browser Connections" />
      <BridgeStatusBadge status={status} />

      <Text className="text-slate-600 dark:text-slate-500 text-xs mt-6 uppercase tracking-[0.4em]">active bindings</Text>
      <View className="gap-y-4 mt-8">
        {paired.length === 0 ? (
          <Text className="text-slate-600 dark:text-slate-500 italic">Waiting for handshake…</Text>
        ) : (
          paired.map((device: PairedBrowserDevice) => (
            <View
              key={device.id}
              className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-navy-900 px-5 py-4 flex-row gap-4 justify-between items-center shadow-card">
              <View className="flex-1 mr-10">
                <Text className="text-slate-900 dark:text-slate-100 text-xl font-semibold">{device.label}</Text>
                <Text className="text-slate-600 dark:text-slate-500 text-[11px] mt-3">{device.ua}</Text>
                <Text className="text-slate-500 dark:text-slate-600 text-[11px] mt-5">
                  Last seen{' '}
                  {new Date(device.connectedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Alert.alert(`Revoke ${device.label}?`, undefined, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Revoke',
                      style: 'destructive',
                      onPress: () => revokeDevice(device.id),
                    },
                  ])
                }
                className="rounded-xl border border-rose-500/40 px-4 py-2">
                <Text className="text-rose-600 dark:text-rose-300 font-semibold text-sm">Revoke</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <VaultButton
        label="pair new browser"
        size="lg"
        onPress={() => openPairSheet()}
        className="mt-16"
      />

      <VaultButton
        label="Reconnect / relay warmup"
        variant="ghost"
        onPress={() => {
          reconnectBridgeRelay();
          setTimeout(() => setStatus("connected"), 40);
          setTimeout(() => setStatus("relay"), 6000);
        }}
        className="mt-10 border border-indigo-500/50 dark:border-indigo-500/70"
      />

      <Modal visible={qrVisible} transparent animationType="fade">
        <View className="flex-1 justify-center px-8" style={{ backgroundColor: qrModalBackdrop() }}>
          <View className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 p-8 items-center">
            <Text className="font-display text-2xl text-slate-900 dark:text-slate-100 mb-10 text-center tracking-tight">
              Scan with extension
            </Text>
            {payload ? (
              <View className="rounded-3xl bg-white p-8 dark:bg-transparent">
                <QRCode size={236} value={payload} quietZone={14} />
              </View>
            ) : (
              <Text className="text-slate-600 dark:text-slate-500">Generating…</Text>
            )}
            <Text className="text-slate-600 dark:text-slate-500 text-[11px] leading-7 mt-10 text-center">
              Extension injects handshake using secret field.
            </Text>
            <VaultButton label="Close pairing lightbox" onPress={() => setQrVisible(false)} className="mt-12 rounded-full" />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
