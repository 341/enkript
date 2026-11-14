import { fireEvent, render, screen } from '@testing-library/react-native';

import { PinLengthPicker } from '@/components/vault/pin-length-picker';

describe('PinLengthPicker', () => {
  it('renders 4, 5, and 6 options', async () => {
    await render(<PinLengthPicker value={6} onChange={jest.fn()} />);
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
  });

  it('calls onChange when a length is selected', async () => {
    const onChange = jest.fn();
    await render(<PinLengthPicker value={6} onChange={onChange} />);
    await fireEvent.press(screen.getByText('4'));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
