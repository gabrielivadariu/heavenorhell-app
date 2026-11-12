# Heaven & Hell

An Expo SDK 57 / React Native 0.86 app with three AI reflection experiences: God, Devil, and Two voices. Includes device-local conversations and journal, a one-minute breathing ritual, multilingual UI (RO/EN/DE/NO), optional reminders and RevenueCat subscriptions.

Requires Node.js 22+. Run `nvm use` after opening the project; npm app commands can also select the installed Node 22 runtime automatically.

## Local development

```sh
npm install
npm --prefix backend ci
npm run dev
```

`npm run dev -- --web` opens the browser preview. `npm run dev -- --ios` targets the simulator. On a physical phone, use `HH_DEV_HOST=<your-computer-LAN-IP> npm run dev` and a native development build containing RevenueCat; Expo Go cannot validate native purchases. Keep the phone and computer on the same network.

The development runner points the app at `http://localhost:3001` by default without changing the production URL in `.env`.

Root `.env`: public mobile configuration only; see `.env.example`. Backend `.env`: server credentials; see `backend/.env.example`. Do not put an OpenAI key or RevenueCat secret key into an `EXPO_PUBLIC_` variable.

## Validation

```sh
npm run typecheck
npm test
npx expo export --platform ios --output-dir /tmp/heaven-hell-ios-export
```

The browser is a UI preview. Store purchase testing requires a native build and sandbox/TestFlight. Local native iOS builds require Xcode 26.4+; the selected Xcode 26.2 is older, so use the configured EAS SDK 57 image for cloud builds.

Native projects are generated from app.json and ignored by Git/EAS. Use `npm run prebuild` to regenerate them.

## Before release

Read [release notes and remaining account configuration](docs/RELEASE.md). Source changes are local and do not automatically update the deployed backend or the App Store build.

Version 1.1 uses [Cloudflare Workers Free + D1](backend/DEPLOY_CLOUDFLARE.md). OpenAI API credit remains separate. The published version keeps its existing Render backend.

## UI smoke test (simulated replies)

With Playwright Core installed in a separate test directory, start `HH_TEST_FIXTURES=1 node tests/ui-fixture-server.mjs`, then run Metro with `EXPO_PUBLIC_API_BASE_URL=http://localhost:3001 npx expo start --web`. Run `HH_PLAYWRIGHT_PATH=/absolute/path/to/playwright-core node tests/ui-smoke.cjs`. This test writes screenshots into `docs/previews/`. Stop the fixture server before `npm run dev`; its responses are test data, not live AI.
