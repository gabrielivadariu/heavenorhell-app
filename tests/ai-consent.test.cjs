const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
function load(file,dependencies,globals={}){
 const context={exports:{},require:name=>{if(!(name in dependencies))throw Error('Unexpected dependency '+name);return dependencies[name];},...globals};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);
 return context.exports;
}
function setup(){
 const data=new Map();let fetches=0,installations=0;
 const storage={getItem:async k=>data.get(k)||null,setItem:async(k,v)=>data.set(k,v),removeItem:async k=>data.delete(k)};
 const consent=load('src/services/aiConsent.ts',{'@react-native-async-storage/async-storage':{__esModule:true,default:storage}});
 const api=load('src/services/chatApi.ts',{'../config':{API_BASE_URL:'https://test.invalid'},'./aiConsent':consent,'./installation':{getInstallation:async()=>{installations++;return{token:'test'};},resetInstallation:async()=>{}},'./conversations':{contextFor:()=>[]}},{setTimeout,clearTimeout,AbortController,fetch:async()=>{fetches++;return{ok:true,json:async()=>({reply:'Test reply',remaining:9,premium:false})};}});
 return{data,storage,consent,api,counts:()=>({fetches,installations})};
}
const input={role:'god',message:'Private message',language:'en',history:[]};
test('messages and installation requests stay blocked until explicit AI permission',async()=>{
 const {api,consent,counts}=setup();assert.equal(await consent.hasAiConsent(),false);
 await assert.rejects(api.sendChat(input),e=>e.code==='consent_required');
 assert.deepEqual(counts(),{fetches:0,installations:0});
 await consent.grantAiConsent();assert.equal((await api.sendChat(input)).reply,'Test reply');
 assert.deepEqual(counts(),{fetches:1,installations:1});
});
test('withdrawing permission blocks subsequent messages without deleting local history',async()=>{
 const {api,consent,counts,data}=setup();data.set('hh_history_v1_god','local history');
 await consent.grantAiConsent();await api.sendChat(input);await consent.revokeAiConsent();
 await assert.rejects(api.sendChat(input),e=>e.code==='consent_required');
 assert.deepEqual(counts(),{fetches:1,installations:1});assert.equal(data.get('hh_history_v1_god'),'local history');
});
test('outdated consent and unreadable consent storage never authorize network requests',async()=>{
 const {api,consent,counts,data,storage}=setup();data.set('hh_ai_sharing_consent','old-provider-version');
 assert.equal(await consent.hasAiConsent(),false);await assert.rejects(api.sendChat(input));
 storage.getItem=async()=>{throw Error('storage unavailable');};await assert.rejects(api.sendChat(input));
 assert.deepEqual(counts(),{fetches:0,installations:0});
});
