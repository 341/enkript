import { render, screen } from '@testing-library/react-native';

import { BridgeStatusBadge } from '@/components/vault/bridge-status-badge';

describe('BridgeStatusBadge', () => {
  it.each([
    ['connected', 'Connected'],
    ['relay', 'Relay fallback'],
    ['offline', 'Offline'],
  ] as const)('renders %s status', async (status, label) => {
    await render(<BridgeStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeTruthy();
  });
});
