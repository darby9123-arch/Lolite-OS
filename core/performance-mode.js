/* Lolite OS 4.1 — opt-in local performance profile.
 * Never modifies browser/device policies, audio playback or running games.
 */
(()=>{'use strict';
 const KEY='lolite.performance.lite.v1';
 const root=document.documentElement;
 const read=()=>{try{return localStorage.getItem(KEY)==='true'}catch{return false}};
 let enabled=read(),button=null;
 function sync(){
   root.classList.toggle('lolite-lite-mode',enabled);
   if(button){button.setAttribute('aria-pressed',String(enabled));button.title=enabled?'Lite Mode on · click for Full Mode':'Full Mode · click for Lite Mode';}
   window.dispatchEvent(new CustomEvent('lolite:performancechange',{detail:{lite:enabled}}));
 }
 function setLite(value){
   enabled=!!value;
   try{localStorage.setItem(KEY,String(enabled))}catch{}
   sync();
   return enabled;
 }
 function init(){
   const tray=document.querySelector('#taskbar .tray');
   if(tray&&!document.querySelector('#loliteLiteButton')){
     button=document.createElement('button');button.id='loliteLiteButton';button.className='task';
     button.type='button';button.textContent='⚡';button.setAttribute('aria-label','Toggle Lite Mode');
     button.addEventListener('click',()=>setLite(!enabled));
     tray.insertBefore(button,tray.querySelector('#settingsBtn')||null);
   }
   sync();
 }
 window.LolitePerformance=Object.freeze({isLite:()=>enabled,setLite,toggle:()=>setLite(!enabled)});
 root.classList.toggle('lolite-lite-mode',enabled);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
