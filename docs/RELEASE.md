# Heaven & Hell 1.1 — release status

## Current delivery

The redesigned app is saved on [release/wow-1.1](https://github.com/gabrielivadariu/heavenorhell-app/tree/release/wow-1.1). Version 1.0.3 and its Render backend remain unchanged.

The new [Cloudflare v2 API](https://heaven-hell-api-v2.livadariu-ga.workers.dev/health) and D1 usage database are deployed on the verified Workers Free plan. No monthly hosting subscription was purchased. Root mobile configuration and EAS production point to this separate HTTPS API. See [free deployment instructions](../backend/DEPLOY_CLOUDFLARE.md).

Signed iOS version 1.1.0, build 16 [compiled successfully](https://expo.dev/accounts/gabriellivadariu/projects/heaven-or-hell-app/builds/02a0a47e-fd2d-4623-8b63-f6013f5199eb) and was [uploaded for TestFlight processing](https://expo.dev/accounts/gabriellivadariu/projects/heaven-or-hell-app/submissions/ae0f2fa0-a59b-4d9c-a94e-4b1075800b12). Apple processing completed successfully; build 16 is listed in the internal Team (Expo) group. Build 15 was rejected with error 90101; build 16 restores the iPhone+iPad device family required by the published app.

App Store version 1.1 promotional text, description and changes are saved as a draft, with manual release selected. App Privacy disclosures now cover Purchase History, User ID, Product Interaction and Other User Content, with matching purposes and no advertising tracking. The public privacy policy explains actual processing and the App Store privacy URL points to it. No public App Review was requested.

## Implemented experience

Cinematic home and new portal artwork; God, Devil and Two voices conversations; bounded context and device-local history; saved reflections and sharing; one-minute breathing ritual; four persisted UI languages; optional morning/evening reminders; store-backed Premium with localized price, restore and guarded checkout.

AI characters are explicitly fictional. Before sending the first message, the app requests permission to send that message and recent context through Cloudflare to OpenAI. Decline preserves the draft and sends no chat request. Permission can be withdrawn in Settings. History and journal can be deleted locally.

Free allowances are God 10/day, Devil 3/day and Two voices 1/day. Verified Premium receives 100 replies/day across modes, resetting at 00:00 UTC. The API uses signed random installation identities, RevenueCat entitlement verification and a shared daily token budget. D1 SQL triggers atomically reserve limits across Worker instances; settlement is idempotent. New checkout closes when AI readiness, durable storage or token capacity is unavailable. Usage records older than seven days are removed by a daily job. Anonymous identities still need app/device attestation before broad scaling.

## Validation

- TypeScript and 36 automated tests pass, including subscription errors/restore, history, AI permission before network requests, shared D1 limits and token capacity.
- Phone browser smoke passed God chat, save/journal, Two voices, unavailable checkout, consent decline/acceptance, language persistence and breathing. Replies are an explicitly guarded fixture, never a production fallback.
- Tablet browser layouts passed at 768×1024 and 1024×768, including consent decline, with no horizontal overflow or page errors.
- Live HTTPS health, installation minting, unsigned-request and invalid-payload checks pass without model calls. RevenueCat offerings returns HTTP 200, default offering `current`, and the approved monthly v2 product.
- Final universal simulator build `8196bb0e-75c1-45f0-a8b3-8fc42b175c14` passed the native XCTest journey on iPhone and iPad: navigation, consent decline, preservation of the unsent draft, Two voices, breathing controls and journal. Genuine captures are in `docs/store-media/`; no model calls were made.
- Signed build 16 compiled successfully with iPhone+iPad support and all required iPad orientations.
- Expo Doctor passes 20/21 locally; installed Xcode 26.2 is older than SDK 57 requires. EAS supplies the compatible SDK 57 build image.
- Backend production audit reports zero vulnerabilities. Mobile dependencies have no high/critical advisories; four moderate issues remain in the Expo SDK 57 build dependency chain.

## Remaining release gates

The owner will provision OpenAI API credit later. No credit purchase was made. Real generation/model quality and native sandbox purchase, cancellation, pending payment, restore and entitlement activation remain unverified. `PAID_CHAT_ENABLED=false` and `AI_VERIFIED=false` deliberately keep new checkout disabled. Enable for internal sandbox validation only after real AI is working; finish those tests before public release.

Complete real AI and native StoreKit validation, the missing App Review contact fields and final metadata review before requesting public App Review. Review notes are prepared locally but cannot be saved until contact information is supplied. The model remains configurable via `OPENAI_MODEL`; do not claim free AI or silently replace the provider. Generation uses one call per reply instead of the old detection/answer/translation chain.

## Platform and artifacts

Expo SDK 57, React Native 0.86.3, React 19.2.3, RevenueCat 11.0.2 and TypeScript 6. Node 22 is selected by the npm command wrapper without changing the global default. Generated native projects are excluded from Git/EAS and regenerated from app.json. Original native projects, Git metadata and SDK 51 files were preserved outside the project. Scene support is enabled; iOS minimum is 16.4.

Artwork: `assets/sanctuary-portal.jpg`; [image prompt](IMAGE-PROMPT.md). The published icon is preserved. [Store metadata](app-store-metadata.json) and `docs/previews/` are review artifacts; names containing `fixture` identify simulated replies. Private account verification notes are local and excluded from Git.

## Media audit

The user supplied five framed iPhone screenshots representing the new design. They are preserved. Old large-iPhone overrides were removed so the current set scales automatically. Five native iPad captures replace the old 2025 draft images. See [media evidence and reproduction](store-media/README.md).

The final metadata audit found unanswered social-capability questions in Apple’s updated age questionnaire and an outdated 4+ rating. The app has no social feed, peer messaging or age-range API capability. Wellness topics are declared because the app includes reflection and breathing. Apple calculated 9+; the developer override is 13+ to match the existing minimum-age policy. The questionnaire was saved without requesting App Review.
