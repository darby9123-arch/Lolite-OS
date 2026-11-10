/* Lolite 4.0 game-entry health checks.
 * Only same-origin repository HTML is probed. Missing is reserved for real
 * 404/410 HTTP responses; CORS, timeouts and offline are never called missing.
 */
(()=>{'use strict';
 const records=new Map(),TTL=5*60*1000,FAILED_TTL=10*60*1000;
 let scanning=null,lastScan=0;
 const isHosted=game=>{
   const raw=typeof game==='string'?game:game?.url;
   if(typeof raw!=='string'||!raw||/^(?:blob:|data:|javascript:)/i.test(raw))return null;
   try{
     const uri=new URL(raw,document.baseURI);
     if(uri.origin!==location.origin || !/\/(?:html(?:%20| )games|games|assets\/games)\//i.test(uri.pathname))
       return null;
     return uri.href;
   }catch{return null}
 };
 const observedURL=game=>{
   const raw=typeof game==='string'?game:game?.url;
   try{
     const uri=new URL(String(raw||''),document.baseURI);
     return uri.protocol==='https:'||uri.protocol==='http:'?uri.href:null;
   }catch{return null}
 };
 const notify=()=>window.dispatchEvent(new CustomEvent('lolite:gamehealthchange',{detail:summary()}));
 const summary=()=>{
   const items=[...records.values()];
   return {checked:items.length,missing:items.filter(x=>x.status==='missing').length,
     ok:items.filter(x=>x.status==='ok').length,
     unknown:items.filter(x=>x.status==='unknown').length,lastScan,scanning:!!scanning};
 };
 const status=game=>{
   const url=observedURL(game);
   if(!url)return 'unverified';
   const entry=records.get(url);
   if(entry&&Date.now()-entry.at>(entry.status==='missing'?FAILED_TTL:TTL)){
     records.delete(url);return isHosted(game)?'unchecked':'unverified';
   }
   return entry?.status||(isHosted(game)?'unchecked':'unverified');
 };
 const isUnavailable=game=>status(game)==='missing';
 async function probe(game,{force=false}={}){
   const url=isHosted(game);
   if(!url)return {status:'unverified'};
   const cached=records.get(url);
   if(!force&&cached&&Date.now()-cached.at<TTL)return cached;
   const ctl=new AbortController();
   const timeout=setTimeout(()=>ctl.abort(),6500);
   let status='unknown',code=null;
   try{
     let response=await fetch(url,{method:'HEAD',credentials:'same-origin',cache:'no-store',signal:ctl.signal});
     // A HEAD 405/501 means unsupported method, not a missing game.
     // Ask for one byte and cancel the stream to avoid downloading a huge HTML game.
     if(response.status===405||response.status===501){
       response=await fetch(url,{method:'GET',headers:{Range:'bytes=0-0'},
         credentials:'same-origin',cache:'no-store',signal:ctl.signal});
       try{await response.body?.cancel?.()}catch{}
     }
     code=response.status;
     if(code===404||code===410)status='missing';
     else if(response.ok)status='ok';
   }catch{status='unknown'}finally{clearTimeout(timeout)}
   const result={status,code,at:Date.now(),url};
   records.set(url,result);
   return result;
 }
 async function scan(games,{force=false}={}){
   if(scanning)return scanning;
   const list=Array.isArray(games)?games:[];
   const targets=[...new Map(list.map(game=>[isHosted(game),game]).filter(x=>x[0])).values()];
   if(!force&&Date.now()-lastScan<TTL&&targets.every(g=>{const rec=records.get(isHosted(g));return rec&&Date.now()-rec.at<TTL}))return summary();
   scanning=(async()=>{
     let cursor=0;
     const worker=async()=>{while(cursor<targets.length)await probe(targets[cursor++],{force})};
     await Promise.all(Array.from({length:Math.min(6,targets.length)},()=>worker()));
     lastScan=Date.now();scanning=null;notify();return summary();
   })().catch(error=>{scanning=null;console.warn('Game scan unavailable',error);notify();return summary()});
   return scanning;
 }
 function markHttpError(game,code){
   // The player has seen a real 404/410. Unlike background probes, this may
   // include external servers. Do not call CORS errors or timeouts "missing".
   const url=observedURL(game);
   if(!url||![404,410].includes(Number(code)))return;
   records.set(url,{status:'missing',code:Number(code),at:Date.now(),url});
   notify();
 }
 window.LoliteGameHealth=Object.freeze({scan,probe,status,summary,isUnavailable,markHttpError,isHosted});
})();
