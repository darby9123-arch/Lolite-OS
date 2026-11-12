/* Double-buffer uploaded videos so a decoded next loop can crossfade before the
 * previous decoder seeks back to frame zero. No reloading video elements on loop. */
(()=>{
 'use strict';
 function create({target,sources,poster,onStatus,dual=true}){
  const urls=(Array.isArray(sources)?sources:[]).filter(Boolean);
  if(!target||!urls.length)throw Error('Missing hosted wallpaper video.');
  let destroyed=false,active=false,swapping=false,loopTimer=0,fadeTimer=0,serial=0,sourceIndex=0;
  // A single decoder is sufficient for Balanced and Performance playback.
  // Keep the two-decoder seamless crossfade only for explicitly selected Max quality.
  const els=dual?[document.createElement('video'),document.createElement('video')]:[document.createElement('video')];
  let current=els[0],next=els[1]||null;
  function configure(el){
   el.className='lolite-live-video';
   el.muted=true;el.defaultMuted=true;el.playsInline=true;el.loop=true;
   el.preload=dual?'auto':'metadata';el.poster=poster||'';
   el.setAttribute('playsinline','');
   el.setAttribute('aria-hidden','true');
   el.setAttribute('disablepictureinpicture','');
   el.style.opacity=el===current?'1':'0';
   el.style.zIndex=el===current?'2':'1';
   el.style.transition='opacity 180ms linear';
   el.addEventListener('error',()=>{if(!destroyed&&el===current)fallback()});
   el.addEventListener('timeupdate',check);
   target.appendChild(el);
  }
  function changeSource(){
   for(const el of els){
    el.pause();el.src=urls[sourceIndex];el.load();
    el.style.opacity=el===current?'1':'0';
    el.style.zIndex=el===current?'2':'1';
   }
  }
  function fallback(){
   if(sourceIndex+1>=urls.length){
    onStatus?.('Video unavailable · Try again');
    active=false;stop();for(const el of els)el.style.opacity='0';
    return;
   }
   sourceIndex++;stop();changeSource();if(active)sync(true);
  }
  function check(){
   if(destroyed||!active||!next||swapping||current.paused||!Number.isFinite(current.duration))return;
   const duration=current.duration;
   if(duration<.9)return; // Avoid two simultaneous decoders for extremely short clips.
   const lead=Math.max(.25,Math.min(.55,duration*.085));
   if(duration-current.currentTime>lead)return;
   swap();
  }
  async function swap(){
   if(!next||swapping||destroyed||!active)return;
   swapping=true;
   const ticket=++serial,leaving=current,entering=next;
   try{
    if(entering.readyState<2)entering.load();
    entering.currentTime=Math.min(.06,Number.isFinite(entering.duration)?entering.duration*.03:.06);
    const started=entering.play();
    if(started?.then)await started;
    if(!active||destroyed||ticket!==serial)return;
    await new Promise(resolve=>{
     if(typeof entering.requestVideoFrameCallback==='function'){
      let settled=false;
      const done=()=>{if(settled)return;settled=true;clearTimeout(timeout);resolve()};
      const timeout=setTimeout(done,250);
      entering.requestVideoFrameCallback(done);
     }else requestAnimationFrame(()=>requestAnimationFrame(resolve));
    });
    if(!active||destroyed||ticket!==serial)return;
    entering.style.zIndex='3';leaving.style.zIndex='2';
    entering.style.opacity='1';
    leaving.style.opacity='0';
    fadeTimer=setTimeout(()=>{
     fadeTimer=0;
     if(destroyed||ticket!==serial)return;
     leaving.pause();
     try{leaving.currentTime=.04}catch{}
     leaving.style.zIndex='1';leaving.style.opacity='0';
     entering.style.zIndex='2';
     current=entering;next=leaving;
     swapping=false;
    },200);
   }catch(error){
    if(!destroyed&&ticket===serial){
     entering.pause();entering.style.opacity='0';
     leaving.style.opacity='1';leaving.style.zIndex='2';
     swapping=false;
    }
   }
  }
  function stop(){
   ++serial;clearInterval(loopTimer);loopTimer=0;
   clearTimeout(fadeTimer);fadeTimer=0;
   for(const el of els)el.pause();
   if(swapping&&next){
    current.style.opacity='1';current.style.zIndex='2';
    next.style.opacity='0';next.style.zIndex='1';
    swapping=false;
   }
  }
  function sync(enabled){
   if(destroyed)return;
   const shouldPlay=Boolean(enabled);
   if(!shouldPlay){active=false;stop();onStatus?.('Paused · Live motion is off');return}
   if(active&&(loopTimer||!next))return;
   active=true;
   current.style.opacity='1';current.style.zIndex='2';
   next.style.opacity='0';next.style.zIndex='1';
   if(next)loopTimer=setInterval(check,85);
   Promise.resolve(current.play()).then(()=>{
    if(!destroyed&&active)onStatus?.('Playing · Buffered seamless video loop');
   }).catch(error=>{
    if(!destroyed&&error?.name!=='AbortError')onStatus?.('Playback paused · Try again');
   });
  }
  function destroy(){
   if(destroyed)return;active=false;stop();destroyed=true;
   for(const el of els){
    el.pause();el.removeAttribute('src');el.load();el.remove();
   }
  }
  els.forEach(configure);changeSource();
  return Object.freeze({sync,destroy,getCurrent:()=>current,getVideoCount:()=>els.length});
 }
 window.LoliteSeamlessVideo=Object.freeze({create});
})();
