jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const chain = {
    duration() {
      return chain;
    },
    springify() {
      return chain;
    },
    delay() {
      return chain;
    },
  };
  return {
    __esModule: true,
    default: { View },
    FadeInDown: chain,
    FadeInUp: chain,
    FadeOut: chain,
  };
});
