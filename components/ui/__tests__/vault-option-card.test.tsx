import { fireEvent, render, screen } from '@testing-library/react-native';

import { VaultOptionCard } from '@/components/ui/vault-option-card';

describe('VaultOptionCard', () => {
  it('renders label and hint', async () => {
    await render(
      <VaultOptionCard
        label="Dark"
        hint="Always dark."
        selected={false}
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText('Dark')).toBeTruthy();
    expect(screen.getByText('Always dark.')).toBeTruthy();
  });

  it('exposes selected state to accessibility', async () => {
    await render(<VaultOptionCard label="System" selected onPress={jest.fn()} />);
    expect(screen.getByRole('radio', { checked: true })).toBeTruthy();
  });

  it('invokes onPress', async () => {
    const onPress = jest.fn();
    await render(<VaultOptionCard label="Light" selected={false} onPress={onPress} />);
    await fireEvent.press(screen.getByRole('radio'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
