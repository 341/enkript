import { fireEvent, render, screen } from '@testing-library/react-native';

import { CategoryChipPicker } from '@/components/ui/category-chip-picker';

describe('CategoryChipPicker', () => {
  it('renders all category labels', async () => {
    await render(<CategoryChipPicker value="work" onChange={jest.fn()} />);
    expect(screen.getByText('Social')).toBeTruthy();
    expect(screen.getByText('Finance')).toBeTruthy();
    expect(screen.getByText('Other')).toBeTruthy();
  });

  it('marks the current value as selected', async () => {
    await render(<CategoryChipPicker value="finance" onChange={jest.fn()} />);
    const selected = screen.getAllByRole('button').find((node) => node.props.accessibilityState?.selected);
    expect(selected).toBeTruthy();
    expect(selected).toHaveTextContent('Finance');
  });

  it('calls onChange with the tapped category', async () => {
    const onChange = jest.fn();
    await render(<CategoryChipPicker value="other" onChange={onChange} />);
    await fireEvent.press(screen.getByText('Shopping'));
    expect(onChange).toHaveBeenCalledWith('shopping');
  });
});
