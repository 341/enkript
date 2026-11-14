import { fireEvent, render, screen } from '@testing-library/react-native';

import { VaultSearchField, VaultTextField } from '@/components/vault/vault-text-field';

describe('VaultTextField', () => {
  it('uppercases field label', async () => {
    await render(<VaultTextField label="Title" value="" onChangeText={jest.fn()} />);
    expect(screen.getByText('TITLE')).toBeTruthy();
  });

  it('forwards value changes', async () => {
    const onChangeText = jest.fn();
    await render(<VaultTextField label="URL" value="" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByDisplayValue(''), 'github.com');
    expect(onChangeText).toHaveBeenCalledWith('github.com');
  });
});

describe('VaultSearchField', () => {
  it('renders placeholder and value', async () => {
    const onChangeText = jest.fn();
    await render(<VaultSearchField value="git" onChangeText={onChangeText} />);
    expect(screen.getByPlaceholderText('Search passwords…')).toBeTruthy();
    await fireEvent.changeText(screen.getByDisplayValue('git'), 'github');
    expect(onChangeText).toHaveBeenCalledWith('github');
  });
});
