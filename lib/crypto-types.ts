/** Envelope version prefixes for at-rest strings in SecureStore. */
export const STUB_PREFIX = 'vaultstub:v1' as const;
export const VAULT_V2_PREFIX = 'vault:v2' as const;

export const VAULT_KEY_BYTES = 32;
export const KDF_SALT_BYTES = 16;
export const AEAD_NONCE_BYTES = 24;

/** Argon2id params. `memorySize` is kibibytes. Same values hash-wasm used. */
export const ARGON2_PARAMS = {
  iterations: 2,
  memorySize: 65536,
  parallelism: 1,
  hashLength: VAULT_KEY_BYTES,
  outputType: 'binary' as const,
};
