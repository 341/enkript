import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { VaultSettingsRow } from '@/components/ui/vault-settings-row';

describe('VaultSettingsRow', () => {
  it('renders label, subtitle, and control', async () => {
    await render(
      <VaultSettingsRow
        label="Biometric gate"
        subtitle="Face ID before reveal"
        control={<Text testID="control">switch</Text>}
      />,
    );
    expect(screen.getByText('Biometric gate')).toBeTruthy();
    expect(screen.getByText('Face ID before reveal')).toBeTruthy();
    expect(screen.getByTestId('control')).toBeTruthy();
  });
});
