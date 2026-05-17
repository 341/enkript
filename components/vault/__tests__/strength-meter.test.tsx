import { render, screen } from '@testing-library/react-native';

import { StrengthMeter } from '@/components/vault/strength-meter';

describe('StrengthMeter', () => {
  it('shows zero entropy for empty password', () => {
    render(<StrengthMeter password="" />);
    expect(screen.getByText(/Weak • 0 bits entropy/)).toBeTruthy();
  });

  it('shows weak label for short password', () => {
    render(<StrengthMeter password="abc" />);
    expect(screen.getByText(/Weak • \d+ bits entropy/)).toBeTruthy();
  });

  it('shows strong label for complex password', () => {
    render(<StrengthMeter password="Tr0ub4dor&3_extra!" />);
    expect(screen.getByText(/Strong • \d+ bits entropy/)).toBeTruthy();
  });
});
