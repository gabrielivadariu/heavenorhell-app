import express from "express";
import cors from "cors";
import { createHmac, timingSafeEqual, randomBytes, createHash } from "node:crypto";
import { buildSystemPrompt, validateChat, parseCouncil, FREE_LIMITS, PREMIUM_DAILY_LIMIT } from "./chat-core.js";

export function createApp({ openai, store, env = process.env, premiumLookup, providerReady = false } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", Number(env.TRUST_PROXY_HOPS || 0));
  app.use(cors());
  app.use(express.json({limit:"32kb"}));
  const signingSecret = env.SESSION_SECRET || randomBytes(32).toString("hex");
  const productionReady = Boolean(env.SESSION_SECRET && env.REVENUECAT_SECRET_API_KEY && env.PAID_CHAT_ENABLED === "true");
  const model = env.OPENAI_MODEL || "gpt-4o-mini";
  const tokenBudget = Math.max(6000,Number(env.DAILY_TOKEN_BUDGET) || 300000);
  const ipWindows = new Map();
  const active = new Set();
  const premiumCache = new Map();
  let providerPausedUntil = 0;
  let providerConfirmed = providerReady;
  const hash = (value) => createHash("sha256").update(value).digest("hex");
  const sign = (data) => createHmac("sha256", signingSecret).update(data).digest("base64url");
  const rateLimit = (req, res, next) => {
    const now = Date.now();
    if (ipWindows.size > 10000) for (const [id, record] of ipWindows) if (record.until < now) ipWindows.delete(id);
    const key = hash(req.ip || "unknown");
    let record = ipWindows.get(key);
    if (!record || record.until < now) {
      if (ipWindows.size >= 10000) return res.status(503).json({error:"capacity"});
      record={count:0,until:now+60000}; ipWindows.set(key,record);
    }
    if (++record.count > 30) return res.status(429).json({error:"rate_limit"});
    next();
  };
  const verifySession = (req) => {
    const token = req.headers.authorization?.replace(/^Bearer /, "");
    if (!token || token.length > 1500) return null;
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;
    const expected = Buffer.from(sign(data));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected,received)) return null;
    try { const session=JSON.parse(Buffer.from(data,"base64url").toString()); return session.exp > Date.now() && typeof session.id === "string" ? session : null; } catch { return null; }
  };
  async function isPremium(id) {
    if (premiumLookup) return premiumLookup(id);
    if (!productionReady) return false;
    const cached = premiumCache.get(id);
    if (cached?.until > Date.now()) return cached.active;
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(id)}`, {
      headers: { Authorization:`Bearer ${env.REVENUECAT_SECRET_API_KEY}` }, signal:AbortSignal.timeout(6000)
    });
    if (response.status === 404) return false;
    if (!response.ok) throw new Error("entitlement_verification_unavailable");
    const data = await response.json();
    const entitlement = data.subscriber?.entitlements?.[env.REVENUECAT_ENTITLEMENT_ID || "premium"];
    const result = Boolean(entitlement && (!entitlement.expires_date || Date.parse(entitlement.expires_date)>Date.now()));
    if (premiumCache.size >= 10000) premiumCache.clear();
    if (result) premiumCache.set(id,{active:true,until:Date.now()+30000});
    else premiumCache.delete(id);
    return result;
  }
  app.get("/health", async (_req,res) => {
    try {
      const capacity = await store.canReserve(tokenBudget);
      res.json({ok:true,apiVersion:2,paidChatReady:productionReady && providerConfirmed && capacity && Date.now() >= providerPausedUntil,limits:{free:FREE_LIMITS,premium:PREMIUM_DAILY_LIMIT}});
    } catch {
      res.status(503).json({ok:false,apiVersion:2,paidChatReady:false});
    }
  });
  app.post("/api/session",rateLimit,(req,res) => {
    // Mint a new unguessable identity; never sign a caller-chosen RevenueCat ID.
    const id=`hh_${randomBytes(24).toString("hex")}`;
    const data=Buffer.from(JSON.stringify({id,exp:Date.now()+5*365*86400000})).toString("base64url");
    res.json({id,token:`${data}.${sign(data)}`});
  });
  app.post("/api/chat",rateLimit,async (req,res) => {
    const session=verifySession(req);
    if (!session) return res.status(401).json({error:"session_expired"});
    if (Date.now() < providerPausedUntil) return res.status(503).json({error:"capacity"});
    let input;
    try { input=validateChat(req.body); } catch { return res.status(400).json({error:"invalid_request"}); }
    const id=hash(session.id);
    if (active.has(id)) return res.status(429).json({error:"busy"});
    active.add(id);
    let reservation;
    let actualTokens;
    let settled=false;
    try {
      const premium=await isPremium(session.id);
      const limit=premium ? PREMIUM_DAILY_LIMIT : FREE_LIMITS[input.role];
      reservation=await store.reserve(id,input.role,premium,limit,tokenBudget,Buffer.byteLength(input.message+input.history.map(v=>v.content).join(""),"utf8")+4000);
      if (reservation.error) return res.status(429).json({error:reservation.error,premium,limit});
      const completion=await openai.chat.completions.create({
        model,
        messages:[{role:"system",content:buildSystemPrompt(input.role,input.language)},...input.history,{role:"user",content:input.message}],
        max_completion_tokens:input.role==="council"?650:400,
        ...(input.role==="council" ? {response_format:{type:"json_object"}} : {})
      },{timeout:25000,maxRetries:0});
      actualTokens=completion.usage?.total_tokens;
      const content=completion.choices?.[0]?.message?.content?.trim();
      if (!content || completion.choices[0].finish_reason==="length") throw new Error("invalid_model_response");
      const payload=input.role==="council" ? {council:parseCouncil(content)} : {reply:content};
      await store.settle(reservation,actualTokens); settled=true;
      providerConfirmed = true;
      const counts=await store.counts(id);
      return res.json({...payload,premium,remaining:Math.max(0,limit-(premium?counts.total:counts[input.role])),limit});
    } catch(error) {
      if (reservation && !reservation.error && !settled) {
        try { await store.settle(reservation,actualTokens,true); } catch { /* Preserve the original error. */ }
      }
      if (["credit_balance_exhausted", "insufficient_quota"].includes(error?.code) || error?.status === 401) { providerPausedUntil = Date.now() + 300000; providerConfirmed = false; }
      // Never log private message bodies, upstream request objects or credentials.
      console.error("Chat unavailable",{name:error?.name,status:error?.status,code:error?.code});
      return res.status(503).json({error:"service_unavailable"});
    } finally { active.delete(id); }
  });
  app.use((error,_req,res,_next) => res.status(error?.type==="entity.too.large"?413:400).json({error:"invalid_request"}));
  return app;
}
