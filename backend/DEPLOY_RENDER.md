# Deploy the v2 API on Render

See [release configuration](../docs/RELEASE.md) before deployment. The previous v1 backend does not support installation sessions or Two voices.

- Use `backend/` as root, `npm ci` as build command and `node index.js` as start command.
- Set `OPENAI_API_KEY`, persistent `SESSION_SECRET`, `REVENUECAT_SECRET_API_KEY`, `REVENUECAT_ENTITLEMENT_ID=premium`, `TRUST_PROXY_HOPS=1`, and a deliberate `DAILY_TOKEN_BUDGET`. Never expose server keys to the app.
- Point `USAGE_STORE_PATH` at persistent storage. The included `render.yaml` uses a **paid Starter instance and persistent disk**, with automatic deploy disabled. A free ephemeral filesystem does not provide durable spending/usage limits. Nothing has been deployed or purchased by these source edits.
- Keep one instance for the file ledger. Move the ledger to a shared transactional database before scaling to multiple instances.
- Confirm real AI generation with available API credit, then verify `/health` reports `apiVersion: 2`. `paidChatReady` stays false without server subscription verification configuration.
- Set the app's production `EXPO_PUBLIC_API_BASE_URL` to the new HTTPS URL, then create a new signed native build and test purchases in sandbox/TestFlight.
