import Constants from 'expo-constants';

const extraRelay = Constants.expoConfig?.extra?.vaultRelayWsUrl as string | undefined;

/** Default relay hint for QR payloads; configure via app.json expo.extra.vaultRelayWsUrl */
export const RELAY_WS_URL_FALLBACK = extraRelay ?? 'wss://relay.example.invalid';
