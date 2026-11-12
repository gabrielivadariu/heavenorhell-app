import { env } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';
import { createServer } from 'node:http';
import OpenAI from 'openai';
import { createApp } from '../app.js';
import { D1UsageStore } from './d1-store.js';

const store = new D1UsageStore(env.DB);
const openai = new OpenAI({apiKey:env.OPENAI_API_KEY || 'not-configured',maxRetries:0,timeout:25000});
const app = createApp({openai,store,env:{...env,TRUST_PROXY_HOPS:'1'},providerReady:env.AI_VERIFIED === 'true'});
const handler = httpServerHandler(createServer(app));

export default {
  fetch(request, bindings, context) {
    // Ignore any client-supplied proxy chain; Cloudflare supplies the actual IP.
    const headers = new Headers(request.headers);
    headers.set('x-forwarded-for',request.headers.get('CF-Connecting-IP') || 'unknown');
    return handler.fetch(new Request(request,{headers}),bindings,context);
  },
  async scheduled(_event, _bindings, context) { context.waitUntil(store.prune()); }
};
