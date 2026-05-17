import '../global.css';
import 'react-native-reanimated';

import type { Preview } from '@storybook/react-native';
import { colorScheme as nwColorScheme } from 'nativewind';
import { type ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function VaultStoryShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    nwColorScheme.set('dark');
    return () => {
      nwColorScheme.set('system');
    };
  }, []);
  return <>{children}</>;
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <VaultStoryShell>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0F1E' }}>
          <SafeAreaProvider>
            <View style={{ flex: 1 }}>
              <Story />
            </View>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </VaultStoryShell>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
