import { render, screen } from '@testing-library/react-native';

import { VaultScreenHeader } from '@/components/ui/vault-screen-header';

describe('VaultScreenHeader', () => {
  it('renders title only', async () => {
    await render(<VaultScreenHeader title="Security" />);
    expect(screen.getByText('Security')).toBeTruthy();
  });

  it('renders title and subtitle', async () => {
    await render(
      <VaultScreenHeader title="Appearance" subtitle="Chooses vault UI colors." />,
    );
    expect(screen.getByText('Appearance')).toBeTruthy();
    expect(screen.getByText('Chooses vault UI colors.')).toBeTruthy();
  });
});
