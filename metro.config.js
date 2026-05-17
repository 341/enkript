const { withStorybook } = require('@storybook/react-native/metro/withStorybook');

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

const storybookEnabled =
  process.env.STORYBOOK_ENABLED === 'true' ||
  process.env.EXPO_PUBLIC_STORYBOOK === 'true' ||
  process.env.NODE_ENV !== 'production';

module.exports = withStorybook(
  withNativeWind(config, { input: './global.css', inlineRem: 16 }),
  { enabled: storybookEnabled },
);
