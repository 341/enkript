import { vaultInputClassName } from '@/components/vault/vault-text-field';

describe('vaultInputClassName', () => {
  it('includes shell styles for single-line fields', () => {
    const cn = vaultInputClassName('credential');
    expect(cn).toContain('rounded-xl');
    expect(cn).toContain('min-h-[48px]');
    expect(cn).toContain('justify-center');
  });

  it('includes multiline variant styles', () => {
    const cn = vaultInputClassName('multiline');
    expect(cn).toContain('min-h-[120]');
    expect(cn).toContain('leading-6');
  });

  it('adds top margin unless dense', () => {
    expect(vaultInputClassName('default')).toContain('mt-3');
    expect(vaultInputClassName('pin', { dense: true })).not.toContain('mt-3');
  });

  it('appends custom className', () => {
    expect(vaultInputClassName('default', { className: 'extra' })).toContain('extra');
  });
});
