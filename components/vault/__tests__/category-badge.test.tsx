import { render, screen } from '@testing-library/react-native';

import { CategoryBadge } from '@/components/vault/category-badge';

describe('CategoryBadge', () => {
  it.each([
    ['social', 'Social'],
    ['work', 'Work'],
    ['finance', 'Finance'],
    ['shopping', 'Shopping'],
    ['other', 'Other'],
  ] as const)('renders %s label', (category, label) => {
    render(<CategoryBadge category={category} />);
    expect(screen.getByText(label)).toBeTruthy();
  });
});
