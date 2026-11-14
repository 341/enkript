import { render, screen } from '@testing-library/react-native';

import { mockPasskeyEntry } from '@/components/__tests__/fixtures';
import { PasskeyCard } from '@/components/vault/passkey-card';

describe('PasskeyCard', () => {
  it('renders passkey metadata', async () => {
    await render(<PasskeyCard entry={mockPasskeyEntry} />);
    expect(screen.getByText('Example Corp')).toBeTruthy();
    expect(screen.getByText('example.com')).toBeTruthy();
    expect(screen.getByText('user@example.com')).toBeTruthy();
    expect(screen.getByText('☁ Backed up')).toBeTruthy();
  });

  it('shows not backed up state', async () => {
    await render(<PasskeyCard entry={{ ...mockPasskeyEntry, backedUp: false }} />);
    expect(screen.getByText('Not backed up')).toBeTruthy();
  });
});
