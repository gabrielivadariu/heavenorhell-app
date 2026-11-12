import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PersonaRole } from "../config";

export type CouncilReply = {god:string; devil:string; reflection:string};
export type Message = {id:string; from:"user"|"ai"; text:string; council?:CouncilReply};
export type SavedReflection = {id:string; role:PersonaRole; text:string; createdAt:number};
const JOURNAL_KEY="hh_journal_v1";
let writes:Promise<unknown>=Promise.resolve();
let revision=0;
export const getConversationRevision=()=>revision;
const queue=<T,>(action:()=>Promise<T>):Promise<T> => {
  const pending=writes.catch(()=>{}).then(action); writes=pending; return pending;
};
export function historyKey(role:PersonaRole) { return `hh_history_v1_${role}`; }
export async function loadHistory(role:PersonaRole):Promise<Message[]> {
  await writes.catch(()=>{});
  const raw=await AsyncStorage.getItem(historyKey(role));
  if (!raw) return [];
  try { const data=JSON.parse(raw); return Array.isArray(data)?data.filter((m:any)=>m&&typeof m.id==="string"&&["user","ai"].includes(m.from)&&typeof m.text==="string"&&(!m.council||["god","devil","reflection"].every(key=>typeof m.council[key]==="string"))).slice(-60):[]; } catch {return [];}
}
export function saveHistory(role:PersonaRole,messages:Message[]) { return queue(()=>AsyncStorage.setItem(historyKey(role),JSON.stringify(messages.slice(-60)))); }
export function clearHistory(role:PersonaRole) { revision++;return queue(()=>AsyncStorage.removeItem(historyKey(role))); }
async function readJournal():Promise<SavedReflection[]> {
  const raw=await AsyncStorage.getItem(JOURNAL_KEY);
  if(!raw)return [];
  try {const data=JSON.parse(raw); return Array.isArray(data)?data.filter((v:any)=>v&&typeof v.id==="string"&&typeof v.text==="string"&&typeof v.createdAt==="number"&&["god","devil","council"].includes(v.role)):[];} catch {return [];}
}
export async function loadJournal():Promise<SavedReflection[]> { await writes.catch(()=>{});return readJournal(); }
export function saveReflection(reflection:SavedReflection) {return queue(async()=>{
  const current=await readJournal();
  if(current.some(v=>v.id===reflection.id))return;
  await AsyncStorage.setItem(JOURNAL_KEY,JSON.stringify([reflection,...current].slice(0,200)));
});}
export function removeReflection(id:string) {return queue(async()=>{
  const current=await readJournal(); await AsyncStorage.setItem(JOURNAL_KEY,JSON.stringify(current.filter(v=>v.id!==id)));
});}
export function clearAllConversations() {revision++;return queue(async()=>{
  await AsyncStorage.multiRemove([JOURNAL_KEY,...(["god","devil","council"] as PersonaRole[]).map(historyKey)]);
});}
export function contextFor(messages:Message[]) {
  const selected: {role:"user"|"assistant";content:string}[]=[];
  let total=0;
  for (const message of [...messages].reverse()) {
    const content=message.text.slice(0,2400);
    if(total+content.length>12000||selected.length>=12)break;
    selected.unshift({role:message.from==="user"?"user":"assistant",content}); total+=content.length;
  }
  return selected;
}
