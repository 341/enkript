import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Fingerprint, KeyRound, Settings, Shuffle } from 'lucide-react-native';
import { Platform, View, type ColorValue } from 'react-native';

import { CenteredIcon } from '@/components/vault/centered-icon';
import { useEffectiveColorScheme } from '@/hooks/useEffectiveColorScheme';
import {
  tabAndroidBarBg,
  tabBarActiveTint,
  tabBarBorderTop,
  tabBarInactiveTint,
} from '@/lib/ui-theme';

function tabIcon(Icon: typeof KeyRound) {
  return function TabBarGlyph({ color, size }: { color: ColorValue; size: number }) {
    const s = typeof size === 'number' ? size : 24;
    const tint = typeof color === 'string' ? color : undefined;
    return (
      <CenteredIcon size={Math.ceil(s + 4)}>
        <Icon color={tint} size={s} strokeWidth={2.25} />
      </CenteredIcon>
    );
  };
}

export default function TabLayout() {
  const scheme = useEffectiveColorScheme();
  const active = tabBarActiveTint(scheme);
  const inactive = tabBarInactiveTint(scheme);
  const borderTop = tabBarBorderTop(scheme);

  const blurTint: 'light' | 'dark' = scheme === 'dark' ? 'dark' : 'light';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'android' ? tabAndroidBarBg(scheme) : 'transparent',
          borderTopColor: borderTop,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint={blurTint}
              intensity={scheme === 'dark' ? 70 : 92}
              className={`absolute inset-0 border-t ${scheme === 'dark' ? 'border-white/5 bg-navy-900/85' : 'border-slate-300 bg-white/80'}`}
            />
          ) : (
            <View
              className={`flex-1 border-t ${scheme === 'dark' ? 'border-white/5 bg-navy-900/95' : 'border-slate-300 bg-white/95'}`}
            />
          ),
      }}>
      <Tabs.Screen
        name="passwords"
        options={{
          title: 'Passwords',
          tabBarIcon: tabIcon(KeyRound),
        }}
      />
      <Tabs.Screen
        name="passkeys"
        options={{
          title: 'Passkeys',
          tabBarIcon: tabIcon(Fingerprint),
        }}
      />
      <Tabs.Screen
        name="generator"
        options={{
          title: 'Generator',
          tabBarIcon: tabIcon(Shuffle),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: tabIcon(Settings),
        }}
      />
    </Tabs>
  );
}
