import { fireEvent, render, screen } from '@testing-library/react-native';

import { VaultButton } from '@/components/ui/vault-button';

describe('VaultButton', () => {
  it('renders the label', () => {
    render(<VaultButton label="Save new PIN" onPress={jest.fn()} />);
    expect(screen.getByText('Save new PIN')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<VaultButton label="Lock now" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<VaultButton label="Save" onPress={onPress} disabled />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
