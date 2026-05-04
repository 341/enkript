import type { SanitizedCredentialEntry } from '@/lib/types';

export type BridgeMessage =
  | { type: 'QUERY_CREDENTIALS'; domain: string }
  | { type: 'CREDENTIALS_RESPONSE'; entries: SanitizedCredentialEntry[] }
  | { type: 'FILL_REQUEST'; entryId: string }
  | { type: 'FILL_APPROVED'; username: string; password: string }
  | { type: 'FILL_DENIED' }
  | { type: 'PASSKEY_CREATE_REQUEST'; options: Record<string, unknown> }
  | { type: 'PASSKEY_CREATE_RESPONSE'; attestation: object }
  | { type: 'PASSKEY_GET_REQUEST'; options: Record<string, unknown> }
  | { type: 'PASSKEY_GET_RESPONSE'; assertion: object }
  | { type: 'PASSKEY_DENIED' }
  | { type: 'PAIR_PROBE'; proof: string; label: string; ua: string }
  | { type: 'PAIR_ACK'; deviceId: string }
  | { type: 'PING' }
  | { type: 'PONG' };
