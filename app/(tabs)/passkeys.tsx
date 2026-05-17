import * as React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { PasskeyCard } from "@/components/vault/passkey-card";
import { useVaultStore } from "@/stores/vault-store";

export default function PasskeyListScreen() {
  const passkeys = useVaultStore((s) => s.passkeys);
  const removePasskey = useVaultStore((s) => s.removePasskey);

  return (
    <View className="flex-1 bg-slate-100 dark:bg-navy-950 pt-16 px-6">
      <Text className="font-display text-3xl text-slate-900 dark:text-slate-100">Passkeys</Text>
      <Text className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
        Passkeys sync from the browser extension via the bridge. Manual creation is disabled.
      </Text>
      <ScrollView className="mt-8" contentContainerStyle={{ paddingBottom: 120 }}>
        {passkeys.length === 0 ? (
          <Text className="text-slate-600 dark:text-slate-500 mt-10 text-center">No passkeys yet.</Text>
        ) : (
          passkeys.map((pk) => (
            <Swipeable
              key={pk.id}
              renderRightActions={() => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    Alert.alert("Delete passkey?", pk.rpName, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => void removePasskey(pk.id) },
                    ])
                  }
                  className="bg-rose-500 justify-center px-6 rounded-lg ml-3">
                  <Text className="text-white font-semibold">Delete</Text>
                </Pressable>
              )}>
              <PasskeyCard entry={pk} />
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
