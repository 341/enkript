import * as React from "react";
import { Pressable, Switch, Text, View } from "react-native";

import { openAndroidAutofillSettings, openIosPrivacySettings } from "@/lib/autofill-settings";

export default function AutofillScreen() {
  const [ios, setIos] = React.useState(false);
  const [android, setAndroid] = React.useState(false);

  return (
    <View className="flex-1 bg-navy-950 px-8 pt-24">
      <Text className="font-display text-3xl tracking-tight text-slate-100">AutoFill</Text>
      <Text className="text-slate-500 mt-4 text-sm leading-6">
        System AutoFill integrations require entitlement wiring in a dev build — these toggles open the vendor settings checklist.
      </Text>

      <View className="mt-14 rounded-2xl border border-white/10 bg-navy-900 p-6 gap-y-8">
        <Row
          icon="🔗"
          label="iOS AutoFill"
          value={ios}
          onToggle={async () => {
            await openIosPrivacySettings();
            setIos(true);
          }}
        />
        <Row
          icon="🔗"
          label="Android Autofill Service"
          value={android}
          onToggle={async () => {
            await openAndroidAutofillSettings();
            setAndroid(true);
          }}
        />
        <Text className="text-amber-300 text-xs mt-6 leading-relaxed border-l-2 border-amber-400/60 pl-3">
          Tap each toggle — you will verify the provisioning profile exposes credential stores.
        </Text>
      </View>
    </View>
  );
}

function Row(props: { icon?: string; label: string; value: boolean; onToggle: () => void }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 mr-10">
        <Text className="text-slate-100 text-xl">{`${props.icon ?? ''} ${props.label}`}</Text>
        <Text className="text-slate-500 text-xs mt-1">Hands you off to vendor settings UI.</Text>
      </View>
      <Switch
        accessibilityRole="switch"
        accessibilityLabel={props.label}
        value={props.value}
        onValueChange={props.onToggle}
        trackColor={{ false: '#1F2937', true: '#4338CA' }}
        thumbColor="#E5E7EB"
      />
    </View>
  );
}

