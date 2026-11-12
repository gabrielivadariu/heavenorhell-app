# Deploy the v2 API on Render

**The owner selected free hosting. Use [Cloudflare Workers + D1](DEPLOY_CLOUDFLARE.md) for deployment. The Render blueprint is now a free preview only; its filesystem is ephemeral and checkout must remain disabled. No paid Render resources are authorized.**

See [release configuration](../docs/RELEASE.md) before deployment. The previous v1 backend does not support installation sessions or Two voices.

- Use `backend/` as root, `npm ci` as build command and `node index.js` as start command.
- Set `OPENAI_API_KEY`, persistent `SESSION_SECRET`, `REVENUECAT_SECRET_API_KEY`, `REVENUECAT_ENTITLEMENT_ID=premium`, `TRUST_PROXY_HOPS=1`, and a deliberate `DAILY_TOKEN_BUDGET`. Never expose server keys to the app.
- A free ephemeral filesystem does not provide durable spending/usage limits. The Render blueprint has automatic deploy disabled. Nothing has been deployed or purchased by these source edits.
- Keep one instance for the file ledger. Move the ledger to a shared transactional database before scaling to multiple instances.
- Confirm real AI generation with available API credit, then verify `/health` reports `apiVersion: 2`. `paidChatReady` stays false without server subscription verification configuration.
- Set the app's production `EXPO_PUBLIC_API_BASE_URL` to the new HTTPS URL, then create a new signed native build and test purchases in sandbox/TestFlight.
