import { API_BASE_URL, PersonaRole } from "../config";
import { getInstallation, resetInstallation } from "./installation";
import { CouncilReply, contextFor, Message } from "./conversations";
export class ChatApiError extends Error {
  constructor(public code:string) {super(code);}
}
async function readJson(path:string,init?:RequestInit) {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),35000);
  try {
    const response=await fetch(`${API_BASE_URL}${path}`,{...init,signal:controller.signal});
    const data=await response.json();
    if(!response.ok)throw new ChatApiError(data.error||"service_unavailable");
    return data;
  } catch(error) {
    if(error instanceof ChatApiError)throw error;
    throw new ChatApiError("service_unavailable");
  } finally {clearTimeout(timer);}
}
export async function getCapabilities():Promise<{paidChatReady:boolean}> {
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),8000);
  try {
    const response=await fetch(`${API_BASE_URL}/health`,{signal:controller.signal});
    const data=await response.json();
    return {paidChatReady:response.ok&&data.apiVersion>=2&&data.paidChatReady===true};
  } catch {return {paidChatReady:false};} finally {clearTimeout(timer);}
}
export async function sendChat({role,message,language,history}:{role:PersonaRole;message:string;language:string;history:Message[]}):Promise<{reply?:string;council?:CouncilReply;remaining:number;premium:boolean}> {
  const {token}=await getInstallation();
  try {
    const data=await readJson("/api/chat",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({role,message,language,history:contextFor(history)})});
    if(role==="council" ? !data.council||!["god","devil","reflection"].every(key=>typeof data.council[key]==="string") : typeof data.reply!=="string")throw new ChatApiError("service_unavailable");
    return data;
  } catch(error) {
    if(error instanceof ChatApiError&&error.code==="session_expired") await resetInstallation();
    throw error;
  }
}
