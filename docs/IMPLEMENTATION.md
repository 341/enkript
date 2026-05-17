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
- Vault data: Argon2id → 32-byte key → XChaCha20-Poly1305 (`vault:v2:`)
- Migration: automatic on unlock when `vaultstub:v1` detected

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
