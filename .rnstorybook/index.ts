import AsyncStorage from '@react-native-async-storage/async-storage';

import { view } from './storybook.requires';

/**
 * Storybook UI root — mounted from `app/storybook.tsx` via Expo Router.
 * Global decorators live in `.rnstorybook/preview.tsx`.
 */
const StorybookUIRoot = view.getStorybookUI({
  shouldPersistSelection: true,
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

export default StorybookUIRoot;
