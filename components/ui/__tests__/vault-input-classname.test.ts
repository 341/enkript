import { vaultInputClassName } from '@/components/vault/vault-text-field';

describe('vaultInputClassName', () => {
  it('includes base styles and variant', () => {
    const cn = vaultInputClassName('credential');
    expect(cn).toContain('rounded-xl');
    expect(cn).toContain('font-mono');
    expect(cn).toContain('text-indigo-800');
  });

  it('adds top margin unless dense', () => {
    expect(vaultInputClassName('default')).toContain('mt-3');
    expect(vaultInputClassName('pin', { dense: true })).not.toContain('mt-3');
  });

  it('appends custom className', () => {
    expect(vaultInputClassName('default', { className: 'extra' })).toContain('extra');
  });
});
