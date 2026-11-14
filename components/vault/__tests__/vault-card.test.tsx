import { render, screen } from '@testing-library/react-native';

import { mockPasswordEntry } from '@/components/__tests__/fixtures';
import { VaultCard } from '@/components/vault/vault-card';
import { VaultCopyToastHost } from '@/components/vault/copy-toast-host';

async function renderCard(entry = mockPasswordEntry) {
  return render(
    <VaultCopyToastHost>
      <VaultCard entry={entry} delay={0} />
    </VaultCopyToastHost>,
  );
}

describe('VaultCard', () => {
  it('renders entry title and username', async () => {
    await renderCard();
    expect(screen.getByText('GitHub')).toBeTruthy();
    expect(screen.getByText('dev@example.com')).toBeTruthy();
  });

  it('shows masked password placeholder', async () => {
    await renderCard();
    expect(screen.getByText('••••••••••••••••')).toBeTruthy();
  });

  it('exposes copy and open actions', async () => {
    await renderCard();
    expect(screen.getByText('Copy')).toBeTruthy();
    expect(screen.getByText('Open →')).toBeTruthy();
  });
});
