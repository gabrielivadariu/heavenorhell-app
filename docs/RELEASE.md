# Heaven & Hell 1.1 — release preparation

## Implemented

Cinematic home and portal artwork; God, Devil and Two voices conversations; bounded conversation context and device-local history; saved reflections and sharing; a one-minute breathing ritual; four persisted UI languages; opt-in morning/evening reminders; store-backed Premium with visible price, restore and guarded checkout.

Free server allowances: God 10/day, Devil 3/day, Two voices 1/day. Verified Premium: 100 replies/day across all modes. Daily reset is at 00:00 UTC. The server uses signed installation identities, RevenueCat entitlement verification, request limits, one request in flight per identity and a persistent token ledger. API messages and recent context are sent to OpenAI; the app is explicitly fictional AI, not supernatural contact.

## Platform migration

- Expo SDK 57, React Native 0.86.3, React 19.2.3 and RevenueCat SDK 11.0.2.
- Node.js 22.23.5 installed locally; `.nvmrc` and package engines record Node 22+. npm app commands automatically select an installed compatible NVM runtime without changing the global default.
- Current Expo-compatible modules, TypeScript 6 and updated notification behavior/trigger API.
- Removed unused Reanimated and its Babel plugin.
- Continuous Native Generation: iOS/Android directories are generated from app.json and excluded from Git/EAS upload. Run `npm run prebuild` when native source is needed locally. Existing native projects and original Git metadata were preserved outside the project in the Desktop SDK 51 backup folder.
- Current native projects generated successfully for iOS and Android. iOS minimum supported OS is 16.4.
- EAS uses the `sdk-57` Xcode image, Node 22 and production environment. Scene support is enabled for Xcode 27 compatibility.
- Expo Doctor passes 20/21 checks locally. The remaining check is the installed Xcode 26.2: SDK 57 requires Xcode 26.4+. Native compilation is therefore being prepared on EAS instead of claiming a successful local signed build.
- Mobile dependency audit: no high/critical issues; four moderate advisories remain in the SDK 57 fingerprint/build dependency chain. Backend audit: zero vulnerabilities after compatible updates.

## Accounts and release gates

The verified account report is kept locally in `docs/ACCOUNT-CONFIGURATION.md` and excluded from Git. Deployment requirements are documented in `backend/DEPLOY_RENDER.md`.

The new API should deploy separately from the existing backend used by app version 1.0.3. Keep checkout disabled with `PAID_CHAT_ENABLED=false` until persistent storage, real AI credit and native sandbox tests are ready. The single-process ledger requires persistent storage; use a shared transactional database before adding replicas. Anonymous signed installations are not cross-device user accounts, and reinstall/identity cycling still requires additional app/device attestation before scaling.

OpenAI remains the existing metered API integration; generation is one call per reply instead of the old detection + answer + translation chain. A tiny budgeted startup probe checks provider readiness. Live generation and model-quality evaluation remain pending owner provisioning of API credit. The existing model is configurable through `OPENAI_MODEL`; do not claim a free model or silently substitute a provider. Review a supported replacement for deprecated GPT-4o mini once credit is available.

## Validation

TypeScript and subscription/conversation/backend tests pass on the migrated code. The SDK 57 browser smoke test passed chat, save, journal, Two voices, disabled unavailable checkout, language persistence and the breathing ritual. UI tests use an explicit simulated-response fixture, never a fake fallback in production. SDK 57 iOS JavaScript/Hermes export and native prebuild succeeded. A JavaScript export is not a signed binary or proof of StoreKit payment behavior.

No App Store review submission, public app release, real-money purchase or API credit purchase has been performed. A source branch and account drafts are review artifacts; they do not automatically deploy the existing live service.

## Artifacts

Artwork: `assets/sanctuary-portal.jpg`; [Imagegen prompt](IMAGE-PROMPT.md). Existing published app icon preserved as `assets/app-icon.png`. UI previews: `docs/previews/`; files containing `fixture` use simulated replies.
