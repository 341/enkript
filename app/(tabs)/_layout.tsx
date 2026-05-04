import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Fingerprint, KeyRound, Settings, Shuffle } from 'lucide-react-native';
import { Platform, View } from 'react-native';

import { CenteredIcon } from '@/components/vault/centered-icon';

function tabIcon(Icon: typeof KeyRound) {
  return function TabBarGlyph({ color, size }: { color: string; size: number }) {
    const s = typeof size === 'number' ? size : 24;
    return (
      <CenteredIcon size={Math.ceil(s + 4)}>
        <Icon color={color} size={s} strokeWidth={2.25} />
      </CenteredIcon>
    );
  };
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#818CF8',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: Platform.OS === 'android' ? 'rgba(13,18,42,0.92)' : 'transparent',
          borderTopColor: 'rgba(255,255,255,0.06)',
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView tint="dark" intensity={70} className="absolute inset-0 border-t border-white/5 bg-navy-900/85" />
          ) : (
            <View className="flex-1 border-t border-white/5 bg-navy-900/95" />
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
