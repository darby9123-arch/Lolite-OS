/* Lolite Cosmos desktop: actual interactive shell widgets, no screenshot overlay. */
(()=>{'use strict';
 const root=document.documentElement;
 const enabled=()=>root.dataset.desktopTheme==='cosmos'&&!root.classList.contains('browsing-mode')&&!root.classList.contains('mobile-mode');
 const icon=id=>window.LoliteIcons?.tile(id)||'';
 const apps=[
  ['files','Files'],['browser','Browser'],['appstore','App Store'],
  ['games','Games'],['chatroom','Chat'],['lowlight-ai','AI'],
  ['wallpaper-editor','Wallpaper'],['terminal','Terminal'],['settings','Settings']
 ];
 const quick=[['games','Game Store'],['cloud-gaming','Cloud Gaming'],['minecraft18','Minecraft 1.8'],['academy','Academy'],['appstore','App Store']];
 let hud=null,fpsCount=0,fpsLast=0,fpsFrame=0,storageTimer=null;
 const safeText=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const svg=(path)=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+path+'</svg>';
 const icoPlay=svg('<path d="m9 6 10 6-10 6z"/>');
 const icoSync=svg('<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5 10a8 8 0 0 1 14-3M19 14a8 8 0 0 1-14 3"/>');
 const icoSound=svg('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12"/>');
 const mark='<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 2 28 19 46 24 28 28 24 46 20 28 2 24 20 19Z" fill="#dbf7ff"/><path d="m5 5 12 12M43 5 31 17M5 43l12-12M43 43 31 31" stroke="#58bfff" stroke-width="1.5"/><circle cx="24" cy="24" r="5" fill="#44c4ff"/></svg>';
 const bootTitle=(s)=>'<div class="cosmos-block-title">'+s+'</div>';
 function shortcuts(){
   const holder=document.getElementById('icons');
   if(!holder||!enabled())return;
   if(holder.querySelector('[data-cosmos-shortcut]')&&holder.children.length===apps.length)return;
   holder.replaceChildren();
   apps.forEach(([id,title])=>{
     const b=document.createElement('button');
     b.type='button';b.className='desktop-icon';b.dataset.cosmosShortcut='1';
     b.dataset.shellOpen=id;b.setAttribute('aria-label','Open '+title);
     b.title=title;b.innerHTML=icon(id)+'<span>'+safeText(title)+'</span>';
     holder.appendChild(b);
   });
 }
 function launch(id){
   if(id==='updates'){window.LoliteWhatsNew?.open?.();if(!window.LoliteWhatsNew?.open)window.openApp?.('updates','What’s New');return}
   if(id==='lowlight-ai'){
     if(typeof window.loliteOpenApp==='function'){window.loliteOpenApp('lowlight-ai');return}
     window.openApp?.('lowlight-ai','Lolite AI');return;
   }
   if(id==='terminal'){
     if(typeof window.loliteOpenApp==='function'){window.loliteOpenApp('terminal');return}
     window.openApp?.('terminal','Terminal');return;
   }
   if(id==='wallpaper-editor'){
     if(typeof window.loliteOpenApp==='function'){window.loliteOpenApp('wallpaper-editor');return}
     window.openApp?.('wallpaper-editor','Wallpaper Editor');return;
   }
   if(window.LoliteDesktopShell?.launch){window.LoliteDesktopShell.launch(id);return}
   window.openApp?.(id,apps.find(a=>a[0]===id)?.[1]||id);
 }
 function recent(){
   let ids=[];try{ids=JSON.parse(localStorage.getItem('loliteRecentAppsV2')||'[]')}catch{}
   const lookup=window.LoliteDesktopShell?.apps||[];
   const current=Array.isArray(ids)?ids.find(id=>id!=='home'&&lookup.some(a=>a[0]===id)):null;
   return current?lookup.find(a=>a[0]===current):null;
 }
 function renderRecent(){
   const holder=hud?.querySelector('[data-cosmos-recent]');if(!holder)return;
   const app=recent(),id=app?.[0]||'games',title=app?.[1]||'Ready for launch';
   holder.innerHTML='<span class="cosmos-widget-icon">'+icon(id)+'</span>'+
   '<span class="cosmos-widget-copy"><strong>'+safeText(title)+'</strong><small>'+(app?'Your latest opened app':'Explore your Game Store')+'</small></span>'+
   '<button type="button" class="cosmos-widget-action" data-cosmos-open="'+id+'" aria-label="Open '+safeText(title)+'">'+icoPlay+'</button>';
 }
 function audio(){
   const state=window.LoliteSounds?.state?.()||{enabled:false,volume:0};
   const volume=Math.max(0,Math.min(100,Math.round((Number(state.volume)||0)*100)));
   return '<div class="cosmos-widget-row"><span class="cosmos-widget-icon">'+icoSound+'</span>'+
    '<span class="cosmos-widget-copy"><strong>System audio</strong><small data-cosmos-audio-state>'+(state.enabled?'Sound enabled':'Sound muted')+'</small></span>'+
    '<button type="button" class="cosmos-widget-action" data-cosmos-mute aria-label="'+(state.enabled?'Mute':'Unmute')+' system sounds">'+(state.enabled?'◖))':'◖×')+'</button></div>'+
    '<div class="cosmos-audio" style="margin-top:12px"><label>Volume<input type="range" min="0" max="100" value="'+volume+'" data-cosmos-volume aria-label="System sound volume"></label><span class="cosmos-audio-value" data-cosmos-volume-label>'+volume+'%</span></div>';
 }
 function stat(label,value,id){
   return '<div class="cosmos-stat"><span>'+label+'</span><strong data-cosmos-'+id+'>'+value+'</strong><span class="cosmos-progress"><i data-cosmos-meter="'+id+'"></i></span></div>';
 }
 function createHud(){
   if(hud)return;
   hud=document.createElement('div');hud.className='cosmos-hud';hud.id='cosmosHud';
   hud.innerHTML='<div class="cosmos-header">'+
     '<div class="cosmos-brand"><span class="cosmos-brand-mark">'+mark+'</span><span><strong>LOLITE OS</strong><small>YOUR UNIVERSE, YOUR DESKTOP</small></span></div>'+
     '<div class="cosmos-headline"><div class="cosmos-dateline" id="cosmosDate"></div><h1>LOLITE OS</h1></div></div>'+
     '<span class="cosmos-corner tl"></span><span class="cosmos-corner tr"></span><span class="cosmos-corner bl"></span><span class="cosmos-corner br"></span><span class="cosmos-rail"></span>'+
     '<aside class="cosmos-sidebar" aria-label="Desktop dashboard">'+
     '<section>'+bootTitle('Continue')+'<div class="cosmos-widget"><div class="cosmos-widget-row" data-cosmos-recent></div></div></section>'+
     '<section>'+bootTitle('Quick access')+'<div class="cosmos-widget"><div class="cosmos-tile-row">'+quick.map(([id,title])=>'<button type="button" class="cosmos-tile" data-cosmos-open="'+id+'" title="'+safeText(title)+'" aria-label="Open '+safeText(title)+'">'+icon(id)+'</button>').join('')+'</div></div></section>'+
     '<section>'+bootTitle('Audio')+'<div class="cosmos-widget" data-cosmos-audio>'+audio()+'</div></section>'+
     '<section>'+bootTitle('System status')+'<div class="cosmos-widget cosmos-system">'+
     stat('Storage','Checking…','storage')+stat('Network',navigator.onLine?'Online':'Offline','network')+stat('Battery','—','battery')+
     '</div></section>'+
     '<section>'+bootTitle('Update log')+'<div class="cosmos-widget"><div class="cosmos-widget-row"><span class="cosmos-widget-icon">'+icoSync+'</span>'+
     '<span class="cosmos-widget-copy"><strong>What’s new in Lolite</strong><small>Open the real release notes</small></span>'+
     '<button type="button" class="cosmos-widget-action" data-cosmos-open="updates" aria-label="Open update log">›</button></div></div></section>'+
     '</aside><div class="cosmos-footer-info"><span data-cosmos-fps>— FPS</span><span aria-hidden="true">·</span><span>Cosmos desktop</span></div>';
   document.getElementById('desktop')?.appendChild(hud);
   hud.addEventListener('click',e=>{
     const app=e.target.closest('[data-cosmos-open]');if(app){launch(app.dataset.cosmosOpen);return}
     if(e.target.closest('[data-cosmos-mute]')){
       const sounds=window.LoliteSounds;
       if(sounds?.state&&sounds?.setEnabled){sounds.setEnabled(!sounds.state().enabled);refreshAudio()}
       else window.openApp?.('settings','Settings');
     }
   });
   hud.addEventListener('input',e=>{
     if(e.target.matches('[data-cosmos-volume]')){
       const value=Number(e.target.value);window.LoliteSounds?.setVolume?.(value/100);
       const label=hud.querySelector('[data-cosmos-volume-label]');if(label)label.textContent=value+'%';
     }
   });
 }
 function refreshAudio(){const el=hud?.querySelector('[data-cosmos-audio]');if(el)el.innerHTML=audio()}
 function updateClock(){
   if(!enabled())return;
   const now=new Date(),date=document.getElementById('cosmosDate');
   if(date)date.textContent=now.toLocaleDateString(undefined,{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).toUpperCase()+'  ·  '+now.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
 }
 function refreshNetwork(){
   const online=navigator.onLine,el=hud?.querySelector('[data-cosmos-network]');
   if(el)el.textContent=online?'Online':'Offline';
   const meter=hud?.querySelector('[data-cosmos-meter="network"]');if(meter)meter.style.width=online?'95%':'0%';
 }
 const size=n=>n>1073741824?(n/1073741824).toFixed(1)+' GB':(n/1048576).toFixed(0)+' MB';
 async function refreshStorage(){
   if(!hud||!navigator.storage?.estimate)return;
   try{const value=await navigator.storage.estimate();
     if(!hud||!enabled())return;
     const used=value.usage,quota=value.quota,v=hud.querySelector('[data-cosmos-storage]');
     if(v)v.textContent=typeof used==='number'?size(used):'Unavailable';
     const meter=hud.querySelector('[data-cosmos-meter="storage"]');
     if(meter)meter.style.width=quota>0&&typeof used==='number'?Math.min(100,Math.round(used/quota*100))+'%':'0%';
     v?.setAttribute('title','Browser storage used, not device disk storage');
   }catch{const el=hud.querySelector('[data-cosmos-storage]');if(el)el.textContent='Unavailable'}
 }
 async function refreshBattery(){
   const el=hud?.querySelector('[data-cosmos-battery]'),meter=hud?.querySelector('[data-cosmos-meter="battery"]');
   if(!el)return;
   if(typeof navigator.getBattery!=='function'){el.textContent='N/A';return}
   try{
     const battery=await navigator.getBattery();if(!hud?.isConnected)return;
     el.textContent=Math.round(battery.level*100)+'%';
     if(meter)meter.style.width=Math.round(battery.level*100)+'%';
     const redraw=()=>{if(el.isConnected){el.textContent=Math.round(battery.level*100)+'%';if(meter)meter.style.width=Math.round(battery.level*100)+'%'}};
     battery.addEventListener('levelchange',redraw);
   }catch{el.textContent='N/A'}
 }
 function fps(t){
   if(!hud?.isConnected)return;
   fpsCount++;
   if(t-fpsLast>=1100){
     const value=Math.max(0,Math.round(fpsCount*1000/(t-fpsLast)));
     const el=hud.querySelector('[data-cosmos-fps]');if(el)el.textContent=value+' FPS';
     fpsLast=t;fpsCount=0;
   }
   fpsFrame=requestAnimationFrame(fps);
 }
 function apply(){
   const on=enabled();
   if(on&&!hud){createHud();refreshBattery();refreshStorage();refreshNetwork()}
   if(hud)hud.hidden=!on;
   if(on){shortcuts();renderRecent();refreshAudio();updateClock();refreshNetwork()}
   if(on&&!fpsFrame){fpsLast=performance.now();fpsFrame=requestAnimationFrame(fps)}
   if(!on&&fpsFrame){cancelAnimationFrame(fpsFrame);fpsFrame=0}
 }
 function init(){
   const originalRender=window.renderIcons;
   if(typeof originalRender==='function'){
     window.renderIcons=function(){const result=originalRender.apply(this,arguments);if(enabled())queueMicrotask(shortcuts);return result};
   }
   apply();
   setTimeout(apply,350);
   setTimeout(apply,900);
   window.addEventListener('lolite:desktopthemechange',()=>{if(!enabled()&&typeof originalRender==='function')originalRender();apply()});
   window.addEventListener('lolite:modechange',apply);
   window.addEventListener('lolite:windowchange',renderRecent);
   window.addEventListener('online',refreshNetwork);window.addEventListener('offline',refreshNetwork);
   setInterval(updateClock,30000);
   storageTimer=setInterval(()=>{if(enabled())refreshStorage()},60000);
   const icons=document.getElementById('icons');
   if(icons)new MutationObserver(()=>{if(enabled()&&!icons.querySelector('[data-cosmos-shortcut]'))queueMicrotask(shortcuts)}).observe(icons,{childList:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();