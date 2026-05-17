import { render, screen } from '@testing-library/react-native';

import { VaultSectionLabel } from '@/components/ui/vault-section-label';

describe('VaultSectionLabel', () => {
  it('renders uppercase label text', () => {
    render(<VaultSectionLabel>lock timing</VaultSectionLabel>);
    expect(screen.getByText('lock timing')).toBeTruthy();
  });
});
