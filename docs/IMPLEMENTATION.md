# Implementation tracker

Phased delivery per [FEATURE_RESEARCH_REPORT.md](./FEATURE_RESEARCH_REPORT.md).

| Phase | Status | Notes |
|-------|--------|-------|
| 0 — KDF spike | Done | `hash-wasm` Argon2id + `@noble/ciphers` XChaCha20-Poly1305 |
| 1 — Real encryption | Done | `vault:v2`, migration on unlock, session key in `vault-crypto-session.ts` |
| 2 — Core vault | Done | TOTP, notes, cards, health, folders |
| 3 — Platform | Done (native requires EAS build) | `modules/vault-autofill` Android service + iOS module; bridge fill + HIBP |

## Crypto

- PIN verify: bcrypt in stub envelope (`encryptPinEnvelope`)
- Key encryption key: Argon2id(PIN, per-vault salt)
- Data key: random 32 bytes, wrapped by the key encryption key (`vault_dek_wrapped_v1` in SecureStore)
- Vault data: XChaCha20-Poly1305 (`vault:v2:`) in `vault-bundle.v3.txt` (app documents). Legacy keychain blobs migrate once on unlock.
- Failed decrypt throws `VaultUnreadableError` and does not replace the saved vault
- Migration: automatic on unlock for `vaultstub:v1` and for vaults whose data key was Argon2id(PIN)

## Native autofill

- Plugin: `./modules/vault-autofill/app.plugin.js` (registered in `app.json`)
- Android: `VaultAutofillService` + `VaultAutofillModule` syncs credential metadata (username/title/url; password fill via mobile approve flow)
- iOS: `VaultAutofillModule` writes to App Group `group.com.maxhuni.eroll.myenkript` (Credential Provider extension still required for full Safari fill)
- Run `npx expo prebuild` then EAS dev client build — not available in Expo Go

## Phase 2 UI

- Settings → Vault health, Secure notes, Payment cards
- Password detail → TOTP code + countdown when `totpSecret` set
- Password edit → TOTP secret field
- `VaultPersistShape.items` + folders via `lib/vault-items.ts`

## Bridge / HIBP

- Extension: assist button requests fill; service worker handles `FILL_APPROVED` → content script
- HIBP: opt-in toggle on vault-health screen (`lib/hibp.ts`)
