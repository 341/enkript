import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

import { canAccessStorybook } from '@/lib/storybook-env';

export default function StorybookScreen() {
  // Importing Storybook at module scope runs its preview during Expo Router's
  // server route scan (npm run ios). Storybook 10.7 then calls onStoriesChanged
  // before that preview has initialized and the command exits.
  if (!canAccessStorybook || Platform.OS === 'web') {
    return <Redirect href="/" />;
  }
  const StorybookRoot = require('../.rnstorybook').default;
  return <StorybookRoot />;
}
