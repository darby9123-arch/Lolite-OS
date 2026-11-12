/* Lolite Popular Games: 30-day anonymous game-launch counts.
 * No usernames, account IDs, IP addresses or persistent device IDs are sent.
 * A random page-only token suppresses accidental duplicate launches.
 */
(()=>{
 'use strict';
 const endpoint='https://rztxhwfdbrzuhdqpegar.supabase.co/functions/v1/lolite-game-popularity';
 const validFile=/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
 const restricted=/casino|gambl|poker|blackjack|roulette|lottery|wager|sports.?bet|slot.?machine|adult|porn/i;
 const interval=3*60*1000,playCooldown=5*60*1000;
 const pageSession=typeof crypto?.randomUUID==='function'?crypto.randomUUID():null;
 const lastLaunch=new Map();
 let counts=new Map(),status='loading',lastRefresh=0,inflight=null;
 const event=()=>window.dispatchEvent(new CustomEvent('lolite:popular-games',{detail:getStatus()}));
 function getStatus(){return {status,periodDays:30,trackedGames:counts.size,lastRefresh};}
 const countFor=file=>counts.get(String(file||''))||0;
 function shareEnabled(){
   try{return localStorage.getItem('loliteAnonymousPlayCounts')==='on'}catch{return false}
 }
 function setSharingEnabled(enabled){
   try{localStorage.setItem('loliteAnonymousPlayCounts',enabled?'on':'off')}catch{}
   event();
   return shareEnabled();
 }
 async function refresh(force=false){
   if(inflight)return inflight;
   if(!force&&lastRefresh&&Date.now()-lastRefresh<interval)return getStatus();
   status=counts.size?'refreshing':'loading';event();
   inflight=(async()=>{
     const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);
     try{
       const response=await fetch(endpoint,{method:'GET',signal:controller.signal,cache:'no-store',credentials:'omit'});
       if(!response.ok)throw new Error('HTTP '+response.status);
       const result=await response.json();
       if(!Array.isArray(result?.games))throw new Error('Invalid popularity response');
       const next=new Map();
       for(const entry of result.games){
         const file=String(entry?.file||'');
         const plays=Number(entry?.plays);
         if(!validFile.test(file)||restricted.test(file)||!Number.isSafeInteger(plays)||plays<=0)continue;
         next.set(file,plays);
       }
       counts=next;status='ready';lastRefresh=Date.now();
     }catch(error){
       // Never substitute guessed or hand-picked games for actual counts.
       status=counts.size?'stale':'unavailable';
       console.warn('Lolite play rankings could not load',error);
     }finally{clearTimeout(timeout);inflight=null;event()}
     return getStatus();
   })();
   return inflight;
 }
 async function record(file){
   file=String(file||'');
   if(!pageSession||!shareEnabled()||!validFile.test(file)||restricted.test(file))return false;
   const now=Date.now();
   if(now-(lastLaunch.get(file)||0)<playCooldown)return false;
   lastLaunch.set(file,now);
   try{
     const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),7000);
     let response;
     try{
       response=await fetch(endpoint,{
         method:'POST',signal:controller.signal,cache:'no-store',credentials:'omit',
         headers:{'Content-Type':'application/json'},
         body:JSON.stringify({file,session:pageSession})
       });
     }finally{clearTimeout(timeout)}
     if(!response.ok)throw new Error('HTTP '+response.status);
     const result=await response.json();
     if(result?.recorded)void refresh(true);
     return !!result?.recorded;
   }catch(error){
     lastLaunch.delete(file);
     console.warn('Lolite anonymous game launch could not be counted',error);
     return false;
   }
 }
 window.LoliteGamePopularity=Object.freeze({
   refresh,record,countFor,getStatus,shareEnabled,setSharingEnabled,
   isEligible(game){
     return !!game&&typeof game.file==='string'&&validFile.test(game.file)&&
       !restricted.test(String(game.file||'')+' '+String(game.title||''))&&
       game.category!=='Gambling';
   }
 });
 if(document.readyState==='loading')
   document.addEventListener('DOMContentLoaded',()=>{void refresh()},{once:true});
 else void refresh();
})();
