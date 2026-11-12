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

The owner selected free hosting. The new API targets Cloudflare Workers Free + D1 separately from the existing Render backend used by app version 1.0.3; see `backend/DEPLOY_CLOUDFLARE.md`. D1 uses atomic SQL triggers for shared allowances and token reservations. Keep checkout disabled with `PAID_CHAT_ENABLED=false` until persistent storage, real AI credit and native sandbox tests are ready. The alternative local file ledger requires a persistent single-process host. Anonymous signed installations are not cross-device user accounts, and reinstall/identity cycling still requires additional app/device attestation before scaling.

OpenAI remains the existing metered API integration; generation is one call per reply instead of the old detection + answer + translation chain. A tiny budgeted startup probe checks provider readiness. Live generation and model-quality evaluation remain pending owner provisioning of API credit. The existing model is configurable through `OPENAI_MODEL`; do not claim a free model or silently substitute a provider. Review a supported replacement for deprecated GPT-4o mini once credit is available.

## Validation

TypeScript and subscription/conversation/backend tests pass on the migrated code. The SDK 57 browser smoke test passed chat, save, journal, Two voices, disabled unavailable checkout, language persistence and the breathing ritual. UI tests use an explicit simulated-response fixture, never a fake fallback in production. SDK 57 iOS JavaScript/Hermes export and native prebuild succeeded. A JavaScript export is not a signed binary or proof of StoreKit payment behavior.

On 12 November, the EAS iOS simulator build [completed successfully](https://expo.dev/accounts/gabriellivadariu/projects/heaven-or-hell-app/builds/d5265d09-18ed-4efb-9d71-da9e7493a72d). It validates native compilation and predates the final Cloudflare URL switch; it is not a device or TestFlight release. The current suite has 36 passing tests, including five D1 atomic ledger tests and three AI-sharing permission tests. The actual Workers runtime also passed local health/session/unsigned-request/invalid-payload checks without model calls. Backend production dependencies have zero reported vulnerabilities.

Cloudflare Worker `heaven-hell-api-v2` and D1 database `heaven-hell-usage` are deployed on the confirmed Free plan. Mobile local and EAS production configuration point to `https://heaven-hell-api-v2.livadariu-ga.workers.dev`. Live HTTPS health, session minting, unsigned-request and invalid-payload checks passed without AI calls. Device validation must complete before release. No monthly hosting subscription was purchased.

Signed iOS production build 15 completed successfully [on EAS](https://expo.dev/accounts/gabriellivadariu/projects/heaven-or-hell-app/builds/c05ec8c8-4045-4602-af11-6eb246d25668), with the Cloudflare API URL and explicit AI-sharing permission. Build 14 was canceled before adding that permission flow. It is separate from the simulator compilation artifact above. Automatic App Store submission is disabled.

No App Store review submission, public app release, real-money purchase or API credit purchase has been performed. A source branch and account drafts are review artifacts; they do not automatically deploy the existing live service.

## Artifacts

Artwork: `assets/sanctuary-portal.jpg`; [Imagegen prompt](IMAGE-PROMPT.md). Existing published app icon preserved as `assets/app-icon.png`. UI previews: `docs/previews/`; files containing `fixture` use simulated replies.

Explicit AI-sharing permission is required before sending message text or recent context through Cloudflare to OpenAI. Decline leaves the draft message in place and sends no chat request. Permission can be withdrawn in Settings. Service tests enforce the guard before installation/network requests, and the browser test verifies decline then acceptance. The public privacy policy was updated to explain actual processing. App Store version 1.1 promotional text, description, changes and review notes are saved as a draft with manual release selected. Review notes explicitly record outstanding validation; no public review was requested.

Build 15 was uploaded successfully to App Store Connect through [EAS Submit](https://expo.dev/accounts/gabriellivadariu/projects/heaven-or-hell-app/submissions/5310de2d-90e6-48c0-9d31-79be1965c779). This uploads for TestFlight processing; it does not request public App Review. App Privacy disclosures were corrected from “Data Not Collected” to Purchase History, User ID, Product Interaction and Other User Content, with purposes matching the implementation and no advertising tracking. The privacy policy URL now points to the maintained public page.

Apple processing rejected build 15 with error 90101: the previous published binary supported iPhone and iPad (`TARGETED_DEVICE_FAMILY=1,2`), while the regenerated configuration declared only iPhone. `ios.supportsTablet=true` restores the previous device family. A replacement signed build is being prepared; build 15 is not available for TestFlight testing.

Replacement build 16: https://expo.dev/accounts/gabriellivadariu/projects/heaven-or-hell-app/builds/02a0a47e-fd2d-4623-8b63-f6013f5199eb . Its processing result supersedes build 15.

The iPad browser layout passed at 768×1024 and 1024×768: home, chat, permission decline, no horizontal overflow or page errors. Expo device-family configuration resolves to iPhone+iPad with all four iPad orientations for multitasking.

New checkout also closes when the durable daily token budget lacks reply capacity or its storage is unavailable. This guard is covered by the backend tests; budget reservations remain atomic across Worker instances.
