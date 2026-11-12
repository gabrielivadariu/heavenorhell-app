import "dotenv/config";
import OpenAI from "openai";
import { createApp } from "./app.js";
import { UsageStore } from "./usage-store.js";

const store = new UsageStore(process.env.USAGE_STORE_PATH || "./data/usage.json");
await store.load();
const openai = new OpenAI({ apiKey:process.env.OPENAI_API_KEY, maxRetries:0, timeout:25000 });
// Verify that the configured account can generate before enabling paid access.
// This tiny startup probe is included in the same persistent token budget.
let providerReady = false;
const budget = Math.max(6000, Number(process.env.DAILY_TOKEN_BUDGET) || 300000);
const probe = await store.reserve("system-readiness", "god", true, 1000000, budget, 100);
if (!probe.error) {
  try {
    const completion = await openai.chat.completions.create({
      model:process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages:[{role:"user",content:"Reply OK"}], max_completion_tokens:1
    }, {timeout:10000,maxRetries:0});
    await store.settle(probe,completion.usage?.total_tokens);
    providerReady = true;
  } catch (error) {
    await store.settle(probe,undefined,true);
    console.warn("AI readiness unavailable", {status:error?.status,code:error?.code});
  }
}
const app = createApp({openai,store,providerReady});
const port = process.env.PORT || 3001;
app.listen(port,() => console.log(`Heaven & Hell API v2 listening on ${port}`));
