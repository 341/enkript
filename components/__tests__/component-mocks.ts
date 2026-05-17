/** Import at the top of component test files (before component imports). */

jest.mock('@/hooks/useEffectiveColorScheme', () => ({
  useEffectiveColorScheme: jest.fn(() => 'light'),
}));

jest.mock('lucide-react-native', () => {
  const mockReact = jest.requireActual('react');
  const mockRN = jest.requireActual('react-native');
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === '__esModule') return true;
        return function MockIcon() {
          return mockReact.createElement(mockRN.View, { accessibilityLabel: String(prop) });
        };
      },
    },
  );
});
