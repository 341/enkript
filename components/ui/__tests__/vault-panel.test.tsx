import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { VaultPanel } from '@/components/ui/vault-panel';

describe('VaultPanel', () => {
  it('renders children and optional title', () => {
    render(
      <VaultPanel title="Where on iOS">
        <Text>Step one</Text>
      </VaultPanel>,
    );
    expect(screen.getByText('Where on iOS')).toBeTruthy();
    expect(screen.getByText('Step one')).toBeTruthy();
  });
});
