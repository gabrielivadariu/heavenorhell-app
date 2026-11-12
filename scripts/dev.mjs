import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root=fileURLToPath(new URL("..",import.meta.url));
// Simulator/browser default. Use HH_DEV_HOST=<LAN IP> for a physical phone.
const host=process.env.HH_DEV_HOST||"localhost";
const backend=spawn(process.execPath,["index.js"],{cwd:resolve(root,"backend"),stdio:"inherit",env:{...process.env,PORT:"3001"}});
const expo=spawn(process.execPath,[resolve(root,"node_modules/expo/bin/cli"),"start",...process.argv.slice(2)],{cwd:root,stdio:"inherit",env:{...process.env,EXPO_PUBLIC_API_BASE_URL:`http://${host}:3001`}});
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;backend.kill("SIGTERM");expo.kill("SIGTERM");setTimeout(()=>process.exit(code),200);}
backend.on("exit",code=>stop(code||0));expo.on("exit",code=>stop(code||0));
process.on("SIGINT",()=>stop());process.on("SIGTERM",()=>stop());
