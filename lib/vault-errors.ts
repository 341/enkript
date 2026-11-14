/** Decrypt or parse failed. Callers must leave the saved vault untouched. */
export class VaultUnreadableError extends Error {
  constructor(message = 'Vault data could not be read. Nothing was overwritten.') {
    super(message);
    this.name = 'VaultUnreadableError';
  }
}
