import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, delimiter, join, resolve } from "node:path";

let runtime=process.execPath;
if(Number(process.versions.node.split('.')[0])<22){
  const versions=join(process.env.NVM_DIR||join(homedir(),'.nvm'),'versions','node');
  const available=existsSync(versions)?readdirSync(versions).filter(v=>/^v(2[2-9]|[3-9]\d)\./.test(v)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})):[];
  const preferred=available.find(v=>v.startsWith('v22.'))||available[0];
  if(!preferred)throw new Error('Node.js 22 or newer is required. Run nvm install 22 and nvm use 22.');
  runtime=join(versions,preferred,'bin','node');
}
const [entry,...args]=process.argv.slice(2);
if(!entry)throw new Error('A Node entrypoint is required.');
const child=spawn(runtime,[entry.startsWith('-')?entry:resolve(entry),...args],{stdio:'inherit',env:{...process.env,PATH:dirname(runtime)+delimiter+(process.env.PATH||'')}});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',(code,signal)=>process.exit(code??(signal==='SIGINT'?130:1)));
