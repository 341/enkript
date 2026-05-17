import * as React from "react";
import { Platform, ScrollView, Text, View } from "react-native";

import { VaultPanel } from '@/components/ui/vault-panel';
import { VaultScreenHeader } from '@/components/ui/vault-screen-header';
import { VaultSettingsRow } from '@/components/ui/vault-settings-row';
import { VaultSwitch } from '@/components/ui/vault-switch';
import { openAndroidAutofillSettings, openIosPrivacySettings } from "@/lib/autofill-settings";

export default function AutofillScreen() {
  const [ios, setIos] = React.useState(false);
  const [android, setAndroid] = React.useState(false);

  const iosInstructions = (
    <Text className="text-slate-800 dark:text-slate-200 text-sm leading-6">
      1. Open the <Text className="text-slate-900 dark:text-slate-100 font-semibold">Settings</Text> app{"\n"}
      2. Scroll to <Text className="text-slate-900 dark:text-slate-100 font-semibold">Passwords</Text> (or search “Passwords” in the
      Settings search bar){"\n"}
      3. Open <Text className="text-slate-900 dark:text-slate-100 font-semibold">Password Options</Text>{"\n"}
      4. Turn on <Text className="text-slate-900 dark:text-slate-100 font-semibold">AutoFill Passwords and Passkeys</Text>{"\n"}
      5. Under <Text className="text-slate-900 dark:text-slate-100 font-semibold">Allow Filling From</Text>, enable{" "}
      <Text className="text-slate-900 dark:text-slate-100 font-semibold">my‑enkript</Text> when it appears alongside iCloud Keychain
      {"\n\n"}
      If this app does not appear, the build may not yet include Apple’s Password AutoFill provider
      entitlement—use a dev client or production build configured for credential providers.
    </Text>
  );

  const androidInstructions = (
    <Text className="text-slate-800 dark:text-slate-200 text-sm leading-6">
      1. Open <Text className="text-slate-900 dark:text-slate-100 font-semibold">Settings</Text>{"\n"}
      2. Open <Text className="text-slate-900 dark:text-slate-100 font-semibold">Passwords & accounts</Text>,{" "}
      <Text className="text-slate-900 dark:text-slate-100 font-semibold">System</Text>, or{" "}
      <Text className="text-slate-900 dark:text-slate-100 font-semibold">Languages & input</Text> (name varies by OEM){"\n"}
      3. Tap <Text className="text-slate-900 dark:text-slate-100 font-semibold">Autofill service</Text> or{" "}
      <Text className="text-slate-900 dark:text-slate-100 font-semibold">Autofill</Text>{"\n"}
      4. Choose <Text className="text-slate-900 dark:text-slate-100 font-semibold">my‑enkript</Text> instead of Google or None
      {"\n\n"}
      After that, login fields in supported apps can offer saved credentials from this vault.
    </Text>
  );

  return (
    <ScrollView
      className="flex-1 bg-slate-100 dark:bg-navy-950"
      contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 96, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled">
      <VaultScreenHeader
        title="AutoFill"
        subtitle="The phone OS controls which app may fill passwords into Safari, Chrome, and other apps. Allow my‑enkript in system settings using the steps below, then use the shortcuts to jump straight into the vendor screen."
      />

      <VaultPanel
        className="mt-10"
        title={Platform.OS === 'ios' ? 'Where on iOS' : 'Where on Android'}>
        {Platform.OS === 'ios' ? iosInstructions : androidInstructions}
      </VaultPanel>

      <VaultPanel className="mt-10 p-6 gap-y-8">
        {Platform.OS === "ios" ? (
          <VaultSettingsRow
            bordered={false}
            label="🔗 Open iOS Settings"
            subtitle="Opens the vendor settings screen."
            control={
              <VaultSwitch
                value={ios}
                onValueChange={async () => {
                  await openIosPrivacySettings();
                  setIos(true);
                }}
              />
            }
          />
        ) : (
          <VaultSettingsRow
            bordered={false}
            label="🔗 Open Android Autofill picker"
            subtitle="Opens the vendor settings screen."
            control={
              <VaultSwitch
                value={android}
                onValueChange={async () => {
                  await openAndroidAutofillSettings();
                  setAndroid(true);
                }}
              />
            }
          />
        )}
        <Text className="text-slate-600 dark:text-slate-500 text-xs leading-relaxed border-l-2 border-indigo-500/40 pl-3">
          The switches above only open system UI; they cannot grant permission by themselves. Complete the steps in the
          shaded box so the OS lists this app as an allowed autofill source.
        </Text>
      </VaultPanel>
    </ScrollView>
  );
}
