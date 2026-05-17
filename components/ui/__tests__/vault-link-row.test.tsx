import { fireEvent, render, screen } from '@testing-library/react-native';

import { VaultLinkRow } from '@/components/ui/vault-link-row';

describe('VaultLinkRow', () => {
  it('renders title and default chevron', () => {
    render(<VaultLinkRow title="Security" onPress={jest.fn()} />);
    expect(screen.getByText('Security')).toBeTruthy();
    expect(screen.getByText('→')).toBeTruthy();
  });

  it('calls onPress', () => {
    const onPress = jest.fn();
    render(<VaultLinkRow title="Storybook" variant="accent" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
