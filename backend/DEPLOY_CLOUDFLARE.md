# Free hosting: Cloudflare Workers + D1

The owner selected free hosting, with no monthly subscription. Use **Workers Free**, never enable a paid plan or automatic upgrade. Existing Render v1 remains untouched for published clients.

Workers Free currently includes 100,000 requests/day. D1 Free includes 5 million rows read/day, 100,000 rows written/day and 5 GB total storage. These are platform quotas, not promised app capacity: each chat uses multiple database operations. Free quotas stop service when exhausted; they do not provide unlimited hosting. See [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) and [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/).

OpenAI usage is separate and still requires API credit. This migration does not replace the AI provider or claim free model responses.

## Setup

Run with Node 22+, from `backend/`:

```sh
npm ci
npx wrangler login
npx wrangler d1 create heaven-hell-usage
```

Copy the returned database ID into `wrangler.jsonc`. Apply the schema and set server-only secrets:

```sh
npx wrangler d1 execute heaven-hell-usage --remote --file cloudflare/schema.sql
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put SESSION_SECRET
npx wrangler secret put REVENUECAT_SECRET_API_KEY
npx wrangler deploy
```

Use the existing persistent signing secret; rotating it invalidates installation credentials. Never put these secrets in the mobile bundle, Git, command-line arguments, screenshots or logs.

Verify `/health` and a minted `/api/session`. Point `EXPO_PUBLIC_API_BASE_URL` in the app and EAS production environment at the actual deployed `workers.dev` HTTPS URL before creating the device release build.

`PAID_CHAT_ENABLED=false` and `AI_VERIFIED=false` keep checkout disabled. After adding API credit, verify real chat responses and the model, then native sandbox purchase/restore and server entitlement checks. Only then explicitly enable both flags and deploy again. A successful free chat can confirm provider readiness inside its current Worker instance, but the checkout flag remains authoritative.

## Storage and tests

The Worker reuses the Express chat API and persona prompts. D1 replaces the local file ledger. SQLite triggers atomically reserve daily allowances and the global token budget across Worker instances. Settlement is idempotent; ambiguous provider failures retain reserved tokens. Only hashed usage identities and counts are stored, never conversation text. A daily cron removes usage records older than seven days.

`npm test` at repository root exercises the actual SQL schema with SQLite, including concurrent reservations from independent stores, shared Premium limits, settlement and failure accounting. Wrangler local development verifies the actual Workers runtime separately:

```sh
npx wrangler d1 execute heaven-hell-usage --local --file cloudflare/schema.sql
npx wrangler dev --local
```

Anonymous installation identities still need device attestation before broad scaling. In-memory request-rate checks and provider cooldowns are local to each Worker instance; durable spending and reply limits are enforced by D1.
