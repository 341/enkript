# my-enkript

A **local-first password vault** for iOS and Android. Store logins, secure notes, payment cards, and passkeys on your device—encrypted with your PIN—without a cloud account.

## Key features

- **PIN-protected vault** — 4–6 digit PIN, auto-lock, optional Face ID / fingerprint before revealing secrets
- **Passwords** — search, categories, strength meter, built-in generator, TOTP authenticator codes
- **Secure notes and payment cards** — additional encrypted item types
- **Vault health** — weak, reused, and stale password checks; optional Have I Been Pwned scan
- **Import / export** — CSV and Bitwarden JSON import; CSV export for migration
- **Passkeys** — store and sign via desktop browser bridge
- **Browser bridge** — pair Chrome on desktop with QR; approve fills from your phone
- **System autofill** — Android/iOS guidance and native autofill module (dev/production builds)

See **[docs/FEATURES.md](docs/FEATURES.md)** for a full guide to screens, workflows, and security behavior.

## Security at a glance

| Layer | Technology |
|-------|------------|
| PIN verification | bcrypt |
| Key wrapping | Argon2id(PIN, per-vault salt) wraps a random 256-bit data key |
| Data at rest | XChaCha20-Poly1305 (`vault:v2`) in an app file. The wrapped key stays in the device keychain |
| Session | Data key in memory only while unlocked; cleared on lock |
| Read failure | Decrypt errors abort. The saved vault is not replaced |

Biometrics gate **reveal** and optional passkey actions; **unlock always requires your PIN**.

## Requirements

- **iOS** or **Android** device or simulator
- **Node.js** 18+ for development
- **Expo dev client** or EAS build for native autofill (not available in Expo Go)

## Quick start

```bash
git clone <repository-url>
cd my-enkript
npm install
npm start
```

Press `i` or `a` in the Expo CLI for iOS/Android, or scan the QR code with Expo Go for basic UI testing (autofill and some native features need a dev build).

**Native development build**

```bash
npx expo prebuild
npm run ios      # or npm run android
```

**Production builds**

```bash
npm run build    # EAS — see eas.json
```

**Tests**

```bash
npm test
```

## Project structure

| Path | Purpose |
|------|---------|
| `app/` | Expo Router screens (tabs, lock, settings) |
| `lib/` | Crypto, vault repository, TOTP, import/export, bridge protocol |
| `stores/` | Zustand state (vault, lock, security prefs) |
| `browser-extension/` | Chrome MV3 companion for desktop fill |
| `relay/` | WebSocket relay for phone ↔ extension |
| `modules/vault-autofill/` | Native autofill module (Android/iOS) |
| `docs/` | User and engineering documentation |

## Browser bridge

1. Run the relay: `node relay/server.mjs` (see `relay/package.json`).
2. Set `extra.vaultRelayWsUrl` in `app.json` to your relay WebSocket URL.
3. Load the extension from `browser-extension/` in Chrome.
4. Pair from **Settings → Browser bridge** on the phone.

Details: [docs/FEATURES.md — Browser bridge](docs/FEATURES.md#browser-bridge).

## Documentation

| Document | Description |
|----------|-------------|
| [docs/FEATURES.md](docs/FEATURES.md) | **User guide** — features, settings, security, limitations |
| [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) | Engineering tracker — crypto, phases, native modules |
| [docs/FEATURE_RESEARCH_REPORT.md](docs/FEATURE_RESEARCH_REPORT.md) | Product research and roadmap (May 2026) |

## Screenshots

Screenshots are not included in this repository yet. Add images under `docs/images/` and link them here when available.

## License

See repository license file if present.
