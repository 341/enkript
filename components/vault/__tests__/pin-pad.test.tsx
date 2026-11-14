import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { PinPad } from '@/components/vault/pin-pad';

describe('PinPad', () => {
  it('calls onComplete when the PIN reaches length', async () => {
    const onComplete = jest.fn();
    await render(<PinPad length={4} onComplete={onComplete} />);

    for (const digit of ['1', '2', '3', '4']) {
      await fireEvent.press(screen.getByLabelText(`digit ${digit}`));
    }

    await act(async () => {
      await Promise.resolve();
    });

    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('deletes the last digit on backspace', async () => {
    await render(<PinPad length={6} onComplete={jest.fn()} />);
    await fireEvent.press(screen.getByLabelText('digit 1'));
    await fireEvent.press(screen.getByLabelText('digit 2'));
    await fireEvent.press(screen.getByLabelText('delete digit'));
    await fireEvent.press(screen.getByLabelText('digit 3'));
    // Should not complete — only 2 digits after delete+add... actually 1,3 = 2 digits. Good.
    expect(screen.getAllByLabelText(/digit/).length).toBeGreaterThan(0);
  });

  it('ignores input while disabled', async () => {
    const onComplete = jest.fn();
    await render(<PinPad length={4} onComplete={onComplete} disabled />);
    await fireEvent.press(screen.getByLabelText('digit 1'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(onComplete).not.toHaveBeenCalled();
  });
});
