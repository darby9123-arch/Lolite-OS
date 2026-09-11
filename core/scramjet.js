/* Scramjet v1 compatibility/diagnostic adapter. The upstream project requires runtime assets plus a service worker and proxy transport. */
(()=>{
 const status=()=>document.getElementById('sj-status');
 async function check(){
  const el=status();if(!el)return;
  const secure=location.protocol==='https:'||location.hostname==='localhost';
  let sw=false;try{sw='serviceWorker' in navigator;if(sw&&secure){const regs=await navigator.serviceWorker.getRegistrations();sw=regs.some(r=>r.active&&/scramjet|sj/i.test(r.active.scriptURL))}}catch{}
  const assets=!!document.querySelector('script[src*="scramjet"]');
  if(assets&&sw)el.innerHTML='<b>● Scramjet runtime detected</b><br><span>Controller/service-worker pieces are available.</span>';
  else el.innerHTML=`<b>○ Scramjet is not fully bundled</b><br><span>${secure?'The browser can support a Scramjet service worker, but this static Lolite build does not ship the upstream controller/proxy transport assets yet.':'HTTPS or localhost is required for a service worker.'}</span>`;
  return {secure,serviceWorker:sw,assets};
 }
 window.LoliteScramjet={check};
 setTimeout(check,400);
})();
