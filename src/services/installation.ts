import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
const KEY="hh_installation_v1";
export type Installation={id:string;token:string};
let cached:Installation|null=null;
let pending:Promise<Installation>|null=null;
export async function getInstallation():Promise<Installation> {
  if(cached)return cached;
  if(pending)return pending;
  pending=(async()=>{
    const raw=await AsyncStorage.getItem(KEY);
    if(raw){try{const value=JSON.parse(raw);if(typeof value.id==="string"&&typeof value.token==="string"){cached=value;return value as Installation;}}catch{}}
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);
    try{
      // The server creates the ID. Clients cannot claim someone else's RevenueCat identity.
      const response=await fetch(`${API_BASE_URL}/api/session`,{method:"POST",headers:{"Content-Type":"application/json"},body:"{}",signal:controller.signal});
      const value=await response.json();
      if(!response.ok||typeof value.id!=="string"||typeof value.token!=="string")throw new Error("Installation unavailable");
      const installation={id:value.id,token:value.token};
      await AsyncStorage.setItem(KEY,JSON.stringify(installation));cached=installation;return installation;
    }finally{clearTimeout(timer);}
  })();
  try{return await pending;}finally{pending=null;}
}
export async function resetInstallation() {
  cached=null;await AsyncStorage.removeItem(KEY);
}
