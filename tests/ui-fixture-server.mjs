// Explicit local UI test fixture. Never import this from backend/index.js.
import {createApp} from '../backend/app.js';
import {UsageStore} from '../backend/usage-store.js';
if(process.env.HH_TEST_FIXTURES!=='1')throw new Error('Set HH_TEST_FIXTURES=1 to run the simulated local UI server.');
const openai={chat:{completions:{create:async(options)=>({
  choices:[{message:{content:options.response_format?JSON.stringify({
    god:'Privește alegerea cu blândețe. Poți face un pas mic fără să îți ceri toate răspunsurile deodată.',
    devil:'Poate că problema nu e lipsa curajului, ci faptul că tot aștepți garanția perfectă. Încearcă un pas mic înainte să negociezi iar cu frica.',
    reflection:'Care este cel mai mic pas pe care îl poți face astăzi?'
  }):'Înțeleg că porți multe pe umeri. Nu trebuie să rezolvi totul astăzi. Începe cu un lucru mic: lasă telefonul deoparte pentru cinci minute și scrie ce poți controla acum. „Nu vă îngrijorați de ziua de mâine” (Matei 6:34) poate fi o invitație să revii la ziua de azi. Care este grija pe care ai vrea să o lăsăm jos mai întâi?'},finish_reason:'stop'}],
  usage:{total_tokens:200}
})}}};
createApp({openai,store:new UsageStore(),premiumLookup:async()=>false,env:{SESSION_SECRET:'LOCAL-UI-TEST-ONLY'}}).listen(3001,'127.0.0.1',()=>console.log('LOCAL UI TEST FIXTURE — SIMULATED REPLIES, NO AI PROVIDER CALLS'));
