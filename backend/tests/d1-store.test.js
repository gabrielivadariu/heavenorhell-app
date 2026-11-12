import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { D1UsageStore } from '../cloudflare/d1-store.js';

// Run the actual D1 schema against SQLite, including its atomic triggers.
function fixture(t) {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../cloudflare/schema.sql',import.meta.url),'utf8'));
  t.after(()=>sql.close());
  const db = {prepare(query) {return {bind(...values) {return {
    async run() { return sql.prepare(query).run(...values); },
    async first() { return sql.prepare(query).get(...values) ?? null; }
  };}};}, async batch(statements) {for(const statement of statements)await statement.run();}};
  return {sql,db,store:new D1UsageStore(db)};
}
test('D1 atomic reservations enforce shared limits across independent Worker instances',async t=>{
  const {db,store}=fixture(t);
  const other=new D1UsageStore(db);
  const results=await Promise.all(Array.from({length:20},(_,i)=>(i%2?store:other).reserve('user','council',false,1,300000,6000)));
  assert.equal(results.filter(r=>!r.error).length,1);
  assert.equal(results.filter(r=>r.error==='daily_limit').length,19);
  assert.equal((await other.counts('user')).total,1);
});
test('D1 token budget is shared and cannot be overspent by concurrent identities',async t=>{
  const {db,store}=fixture(t);
  const results=await Promise.all(Array.from({length:10},(_,i)=>new D1UsageStore(db).reserve(`u${i}`,'god',false,10,12000,6000)));
  assert.equal(results.filter(r=>!r.error).length,2);
  assert.equal(results.filter(r=>r.error==='capacity').length,8);
  assert.equal((await store.counts('u2')).total,0);
});
test('D1 settlement is idempotent and refunds failed reply allowance but preserves ambiguous charges',async t=>{
  const {sql,store}=fixture(t);
  const first=await store.reserve('user','god',false,10,300000,6000);
  await store.settle(first,150);await store.settle(first,150);
  assert.equal(sql.prepare('SELECT tokens FROM daily_budget').get().tokens,150);
  assert.equal((await store.counts('user')).total,1);
  const failed=await store.reserve('user','god',false,10,300000,6000);
  await store.settle(failed,undefined,true);await store.settle(failed,0,true);
  assert.equal(sql.prepare('SELECT tokens FROM daily_budget').get().tokens,6150);
  assert.equal((await store.counts('user')).total,1);
});
test('D1 Premium shares all mode allowances and settlement survives a fresh store',async t=>{
  const {db,store}=fixture(t);
  const first=await store.reserve('premium-user','council',true,2,300000,6000);
  const fresh=new D1UsageStore(db);await fresh.settle(first,100);
  await fresh.reserve('premium-user','devil',true,2,300000,6000);
  assert.equal((await fresh.reserve('premium-user','god',true,2,300000,6000)).error,'daily_limit');
  assert.equal((await fresh.counts('premium-user')).total,2);
});
test('D1 refunds a failed response with known usage and retains its actual token cost',async t=>{
  const {sql,store}=fixture(t);
  const first=await store.reserve('user','council',false,1,300000,6000);
  await store.settle(first,321,true);
  assert.equal(sql.prepare('SELECT tokens FROM daily_budget').get().tokens,321);
  assert.equal((await store.counts('user')).total,0);
  assert.ok(!(await store.reserve('user','council',false,1,300000,6000)).error);
});
