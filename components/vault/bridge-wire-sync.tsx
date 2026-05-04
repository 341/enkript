import { useEffect } from 'react';
import { Alert } from 'react-native';

import type { BridgeMessage } from '@/lib/bridge-protocol';
import { RELAY_WS_URL_FALLBACK } from '@/lib/constants';
import { decodeBase64Maybe } from '@/lib/binary-web';
import { disarmPairSession, proofMatches } from '@/lib/pair-session';
import {
  buildAssertionDigest,
  createPasskeyEntry,
  findPasskeys,
  signAssertionDigest,
} from '@/lib/passkey-service';
import * as Crypto from 'expo-crypto';
import {
  registerBridgeMessageHandler,
  sendBridgeMessage,
  connectBridgeRelay,
  disconnectBridge,
} from '@/lib/bridge-hub';

import type { PasswordEntry } from '@/lib/types';
import { useVaultLockStore } from '@/stores/vault-lock-store';
import { useVaultStore } from '@/stores/vault-store';

function bufferToBase64Url(data: Uint8Array): string {
  let bin = '';
  data.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return globalThis.btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function ensureUnlocked(message: BridgeMessage): boolean {
  const locked = useVaultLockStore.getState().vaultLocked;
  if (!locked) return true;

  switch (message.type) {
    case 'FILL_REQUEST':
      sendBridgeMessage({ type: 'FILL_DENIED' });
      return false;
    case 'PASSKEY_CREATE_REQUEST':
    case 'PASSKEY_GET_REQUEST':
      sendBridgeMessage({ type: 'PASSKEY_DENIED' });
      return false;
    default:
      return false;
  }
}

function approveFill(entry: PasswordEntry | undefined): void {
  if (!entry) {
    sendBridgeMessage({ type: 'FILL_DENIED' });
    return;
  }

  sendBridgeMessage({
    type: 'FILL_APPROVED',
    username: entry.username,
    password: entry.password,
  });
}

async function bridgeCreatePasskey(options: Record<string, unknown>) {
  try {
    const rp = options.rp as { id?: string; name?: string } | undefined;
    const usr = options.user as { id?: string; displayName?: string; name?: string } | undefined;
    const rpIdRaw = rp?.id ?? rp?.name ?? '';

    const userIdStable =
      typeof usr?.id === 'string'
        ? usr.id
        : bufferToBase64Url(Crypto.getRandomBytes(8));

    const entry = await createPasskeyEntry({
      rpId: rpIdRaw?.length ? String(rpIdRaw) : 'relay.localhost',
      rpName: rp?.name ?? rpIdRaw ?? 'Passkey Relay',
      userId: userIdStable,
      userName: usr?.name ?? usr?.displayName ?? 'user',
      userDisplayName: usr?.displayName ?? usr?.name ?? 'Vault user',
      backedUp: false,
    });

    await useVaultStore.getState().addPasskeyEntry(entry);

    sendBridgeMessage({
      type: 'PASSKEY_CREATE_RESPONSE',
      attestation: {
        credentialId: entry.credentialId,
        userId: entry.userId,
      },
    });
  } catch {
    sendBridgeMessage({ type: 'PASSKEY_DENIED' });
  }
}

async function bridgeGetPasskey(options: Record<string, unknown>) {
  try {
    const rpCandidates = ['rpId', 'rp_id', 'relayingParty'].map((k) =>
      typeof options[k] === 'string' ? (options[k] as string) : '',
    );
    const rp = rpCandidates.find(Boolean);

    let credentialHint: string | undefined;
    const allow = Array.isArray(options.allowCredentials)
      ? (options.allowCredentials as Array<{ id: string | { buffer?: Uint8Array } }>)
      : [];
    allow.forEach((item) => {
      if (!credentialHint && typeof item?.id === 'string') credentialHint = item.id;
      if (
        item &&
        item.id &&
        typeof item.id === 'object' &&
        ArrayBuffer.isView((item.id as { buffer?: ArrayBuffer }).buffer)
      )
        credentialHint = bufferToBase64Url(new Uint8Array((item.id as { buffer?: ArrayBuffer }).buffer!));
    });

    const passkeysState = useVaultStore.getState().passkeys;

    let match = credentialHint ? passkeysState.find((x) => x.credentialId === credentialHint) : undefined;
    if (!match && rp) match = findPasskeys(passkeysState, rp)[0];
    if (!match) throw new Error('no-entry');

    const authData = decodeBase64Maybe(String(options.authenticationChallengeB64 ?? ''));
    const clientHash = decodeBase64Maybe(String(options.clientDataHashB64 ?? ''));

    if (!authData || !clientHash) throw new Error('missing-hash');

    const digest = buildAssertionDigest(authData, clientHash);
    const { compactSignature, nextSignCount } = await signAssertionDigest(match, digest);
    await useVaultStore.getState().updatePasskey(match.id, {
      signCount: nextSignCount,
      lastUsedAt: Date.now(),
    });

    sendBridgeMessage({
      type: 'PASSKEY_GET_RESPONSE',
      assertion: {
        credentialId: match.credentialId,
        authenticatorSignature: bufferToBase64Url(compactSignature),
        signCount: nextSignCount,
      },
    });
  } catch {
    sendBridgeMessage({ type: 'PASSKEY_DENIED' });
  }
}

function handleBridgeInbound(message: BridgeMessage) {
  switch (message.type) {
    case 'QUERY_CREDENTIALS': {
      if (useVaultLockStore.getState().vaultLocked) {
        sendBridgeMessage({
          type: 'CREDENTIALS_RESPONSE',
          entries: [],
        });
        break;
      }
      sendBridgeMessage({
        type: 'CREDENTIALS_RESPONSE',
        entries: useVaultStore.getState().credentialsForBridgeDomain(message.domain),
      });
      break;
    }
    case 'FILL_REQUEST': {
      if (!ensureUnlocked(message)) return;
      const entry = useVaultStore.getState().getPasswordById(message.entryId);
      Alert.alert(
        'Browser fill approval',
        `Allow sending credentials ${entry?.title ?? '—'} ?`,
        [
          { text: 'Deny', style: 'cancel', onPress: () => sendBridgeMessage({ type: 'FILL_DENIED' }) },
          { text: 'Approve', onPress: () => approveFill(entry) },
        ],
        { cancelable: false },
      );
      return;
    }
    case 'PASSKEY_CREATE_REQUEST': {
      if (!ensureUnlocked(message)) return;
      void bridgeCreatePasskey(message.options ?? {});
      return;
    }
    case 'PASSKEY_GET_REQUEST': {
      if (!ensureUnlocked(message)) return;
      void bridgeGetPasskey(message.options ?? {});
      return;
    }
    case 'PAIR_PROBE': {
      if (useVaultLockStore.getState().vaultLocked) return;
      if (proofMatches(message.proof)) {
        void useVaultStore.getState().addPairedDevice({
          id: Crypto.randomUUID(),
          label: message.label,
          ua: message.ua,
          connectedAt: Date.now(),
        });
        disarmPairSession();
      }
      return;
    }
    default:
      return;
  }
}

export function VaultBridgeCoordinator() {
  useEffect(() => {
    registerBridgeMessageHandler(handleBridgeInbound);
    return () => {};
  }, []);

  return null;
}

export function reconnectBridgeRelay() {
  disconnectBridge();
  connectBridgeRelay(RELAY_WS_URL_FALLBACK);
}
