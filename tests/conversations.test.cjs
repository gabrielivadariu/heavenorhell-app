const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
function setup(){
 const data=new Map();
 const storage={getItem:async key=>data.get(key)||null,setItem:async(key,value)=>{data.set(key,value);},removeItem:async key=>{data.delete(key);},multiRemove:async keys=>keys.forEach(key=>data.delete(key))};
 const context={exports:{},require:name=>({__esModule:true,default:storage})};
 const source=ts.transpileModule(fs.readFileSync('src/services/conversations.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(source,context);return{api:context.exports,data};
}
test('conversation context respects message and character limits',()=>{
 const {api}=setup();const messages=Array.from({length:30},(_,i)=>({id:String(i),from:i%2?'ai':'user',text:'x'.repeat(2000)}));
 const context=api.contextFor(messages);assert.equal(context.length,6);assert.equal(context.reduce((n,m)=>n+m.content.length,0),12000);assert.equal(context[0].role,'user');
});
test('serialized journal writes do not lose simultaneous saves or duplicate entries',async()=>{
 const {api}=setup();const first={id:'a',role:'god',text:'First reflection',createdAt:1};const second={...first,id:'b'};
 await Promise.all([api.saveReflection(first),api.saveReflection(second),api.saveReflection(first)]);
 const entries=await api.loadJournal();assert.equal(entries.length,2);assert.equal(entries[0].id,'b');
});
test('history is capped and rejects corrupt council entries',async()=>{
 const {api,data}=setup();await api.saveHistory('god',Array.from({length:70},(_,i)=>({id:String(i),from:'user',text:'Hi'})));
 const history=await api.loadHistory('god');assert.equal(history.length,60);assert.equal(history[0].id,'10');
 data.set(api.historyKey('council'),JSON.stringify([{id:'bad',from:'ai',text:'Bad',council:{god:{}}}]));assert.equal((await api.loadHistory('council')).length,0);
});
test('clearing all local data advances the revision and removes conversations and journal',async()=>{
 const {api}=setup();await api.saveHistory('god',[{id:'a',from:'user',text:'hello'}]);await api.saveReflection({id:'b',role:'god',text:'reply',createdAt:1});
 const revision=api.getConversationRevision();await api.clearAllConversations();assert.ok(api.getConversationRevision()>revision);assert.equal((await api.loadHistory('god')).length,0);assert.equal((await api.loadJournal()).length,0);
});
