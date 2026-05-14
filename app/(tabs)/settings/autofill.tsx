import * as React from "react";
import { Platform, ScrollView, Switch, Text, View } from "react-native";

import { openAndroidAutofillSettings, openIosPrivacySettings } from "@/lib/autofill-settings";

export default function AutofillScreen() {
  const [ios, setIos] = React.useState(false);
  const [android, setAndroid] = React.useState(false);

  return (
    <ScrollView
      className="flex-1 bg-navy-950"
      contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 96, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled">
      <Text className="font-display text-3xl tracking-tight text-slate-100">AutoFill</Text>
      <Text className="text-slate-500 mt-4 text-sm leading-6">
        The phone OS controls which app may fill passwords into Safari, Chrome, and other apps. Allow{" "}
        <Text className="text-slate-400 font-semibold">my‑enkript</Text> in system settings using the steps below,
        then use the shortcuts to jump straight into the vendor screen.
      </Text>

      {Platform.OS === "ios" ? (
        <View className="mt-10 rounded-2xl border border-white/10 bg-navy-900/80 p-5 gap-y-3">
          <Text className="text-indigo-300 text-xs font-semibold tracking-[0.2em] uppercase">Where on iOS</Text>
          <Text className="text-slate-200 text-sm leading-6">
            1. Open the <Text className="text-slate-100 font-semibold">Settings</Text> app{"\n"}
            2. Scroll to <Text className="text-slate-100 font-semibold">Passwords</Text> (or search “Passwords” in the
            Settings search bar){"\n"}
            3. Open <Text className="text-slate-100 font-semibold">Password Options</Text>{"\n"}
            4. Turn on <Text className="text-slate-100 font-semibold">AutoFill Passwords and Passkeys</Text>{"\n"}
            5. Under <Text className="text-slate-100 font-semibold">Allow Filling From</Text>, enable{" "}
            <Text className="text-slate-100 font-semibold">my‑enkript</Text> when it appears alongside iCloud Keychain
            {"\n\n"}
            If this app does not appear, the build may not yet include Apple’s Password AutoFill provider
            entitlement—use a dev client or production build configured for credential providers.
          </Text>
        </View>
      ) : (
        <View className="mt-10 rounded-2xl border border-white/10 bg-navy-900/80 p-5 gap-y-3">
          <Text className="text-indigo-300 text-xs font-semibold tracking-[0.2em] uppercase">Where on Android</Text>
          <Text className="text-slate-200 text-sm leading-6">
            1. Open <Text className="text-slate-100 font-semibold">Settings</Text>{"\n"}
            2. Open <Text className="text-slate-100 font-semibold">Passwords & accounts</Text>,{" "}
            <Text className="text-slate-100 font-semibold">System</Text>, or{" "}
            <Text className="text-slate-100 font-semibold">Languages & input</Text> (name varies by OEM){"\n"}
            3. Tap <Text className="text-slate-100 font-semibold">Autofill service</Text> or{" "}
            <Text className="text-slate-100 font-semibold">Autofill</Text>{"\n"}
            4. Choose <Text className="text-slate-100 font-semibold">my‑enkript</Text> instead of Google or None
            {"\n\n"}
            After that, login fields in supported apps can offer saved credentials from this vault.
          </Text>
        </View>
      )}

      <View className="mt-10 rounded-2xl border border-white/10 bg-navy-900 p-6 gap-y-8">
        {Platform.OS === "ios" ? (
          <Row
            icon="🔗"
            label="Open iOS Settings"
            value={ios}
            onToggle={async () => {
              await openIosPrivacySettings();
              setIos(true);
            }}
          />
        ) : (
          <Row
            icon="🔗"
            label="Open Android Autofill picker"
            value={android}
            onToggle={async () => {
              await openAndroidAutofillSettings();
              setAndroid(true);
            }}
          />
        )}
        <Text className="text-slate-500 text-xs leading-relaxed border-l-2 border-indigo-500/40 pl-3">
          The switches above only open system UI; they cannot grant permission by themselves. Complete the steps in the
          shaded box so the OS lists this app as an allowed autofill source.
        </Text>
      </View>
    </ScrollView>
  );
}

function Row(props: { icon?: string; label: string; value: boolean; onToggle: () => void }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 mr-10">
        <Text className="text-slate-100 text-xl">{`${props.icon ?? ""} ${props.label}`}</Text>
        <Text className="text-slate-500 text-xs mt-1">Opens the vendor settings screen.</Text>
      </View>
      <Switch
        accessibilityRole="switch"
        accessibilityLabel={props.label}
        value={props.value}
        onValueChange={props.onToggle}
        trackColor={{ false: "#1F2937", true: "#4338CA" }}
        thumbColor="#E5E7EB"
      />
    </View>
  );
}
