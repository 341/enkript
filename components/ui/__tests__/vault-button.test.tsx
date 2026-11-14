import { fireEvent, render, screen } from '@testing-library/react-native';

import { VaultButton } from '@/components/ui/vault-button';

describe('VaultButton', () => {
  it('renders the label', async () => {
    await render(<VaultButton label="Save new PIN" onPress={jest.fn()} />);
    expect(screen.getByText('Save new PIN')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<VaultButton label="Lock now" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<VaultButton label="Save" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
