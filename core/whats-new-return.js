/* Lolite OS: bring the existing release notes app back to the desktop and Start menu.
   This is a small shell adapter, not a second copy of the release notes. */
(()=>{
 'use strict';
 const AUTO='lolite.whats-new.auto.v1',SEEN='lolite.whats-new.seen.v1';
 const icon=()=>window.LoliteIcons?.tile?.('guide')||'<span aria-hidden="true">✦</span>';
 function enabled(){try{return localStorage.getItem(AUTO)!=='false'}catch{return true}}
 function latest(){const entry=window.LoliteWhatsNew?.getAll?.()[0];return entry?String(entry.date||'')+'|'+String(entry.title||''):''}
 function viewed(){try{localStorage.setItem(SEEN,latest())}catch{}}
 function open(){if(typeof window.LoliteWhatsNew?.open==='function'){window.LoliteWhatsNew.open();viewed()}}
 function expandHome(){document.querySelectorAll('details.win-home-updates').forEach(el=>{el.open=true})}
 function installApp(){
  const apps=window.LoliteDesktopShell?.apps;
  if(Array.isArray(apps)&&!apps.some(x=>x[0]==='updates'))
   apps.push(['updates','What’s New','New features, changes and release history']);
 }
 function desktopShortcut(){
  const holder=document.getElementById('icons');if(!holder||holder.querySelector('[data-wn-shortcut]'))return;
  const button=document.createElement('button');button.type='button';button.className='desktop-icon';
  button.dataset.wnShortcut='1';button.setAttribute('aria-label','What’s New');button.title='What’s New';
  button.innerHTML=icon()+'<span>What’s New</span>';
  // The Windows desktop consumes double-clicks and keyboard actions via ondblclick.
  button.ondblclick=()=>open();
  button.addEventListener('click',e=>{if(e.detail===0)open()});
  holder.appendChild(button);
 }
 function startShortcut(){
  const grid=document.querySelector('#start .win-start-grid');if(!grid||grid.querySelector('[data-shell-open="updates"]'))return;
  const btn=document.createElement('button');btn.type='button';btn.dataset.shellOpen='updates';
  btn.innerHTML=icon()+'<span>What’s New</span>';grid.appendChild(btn);
 }
 function settingsCard(){
  return '<section class="card wn-settings-card"><h3>What’s New</h3>'+
   '<p class="muted">See the latest features, fixes and previous Lolite releases.</p>'+
   '<button type="button" class="wn-open-button" data-wn-action="open">Open What’s New</button>'+
   '<label class="wn-pref"><input type="checkbox" data-wn-auto '+(enabled()?'checked':'')+'> Open after a new update</label></section>';
 }
 function installSettings(){
  const old=window.page;if(typeof old!=='function')return;
  window.page=function(id){const html=old.apply(this,arguments);return id==='settings'?html+settingsCard():html};
 }
 let checked=false;
 async function maybeAnnounce(){
  if(checked||!enabled()||window.LoliteDeviceMode?.mode?.()?.mode!=='desktop')return;
  checked=true;
  try{await window.LoliteWhatsNew?.load?.()}catch{}
  if(!enabled()||window.LoliteDeviceMode?.mode?.()?.mode!=='desktop')return;
  const token=latest();if(!token)return;
  try{if(localStorage.getItem(SEEN)===token)return}catch{}
  open();
 }
 function init(){
  if(!window.LoliteWhatsNew)return;
  installApp();installSettings();desktopShortcut();expandHome();startShortcut();
  const icons=document.getElementById('icons');
  if(icons)new MutationObserver(desktopShortcut).observe(icons,{childList:true});
  const start=document.getElementById('start');
  if(start)new MutationObserver(startShortcut).observe(start,{childList:true,subtree:true});
  window.addEventListener('lolite:windowchange',e=>{
   if(e.detail?.id==='updates'&&e.detail.type==='open')viewed();
   if(e.detail?.id==='home')queueMicrotask(expandHome);
  });
  window.addEventListener('lolite:modechange',e=>{if(e.detail?.mode==='desktop'){desktopShortcut();maybeAnnounce()}});
  window.addEventListener('lolite:desktopthemechange',desktopShortcut);
  document.addEventListener('click',e=>{if(e.target.closest('[data-wn-action="open"]')){e.preventDefault();open()}});
  document.addEventListener('change',e=>{
   if(!e.target.matches('[data-wn-auto]'))return;
   try{localStorage.setItem(AUTO,e.target.checked?'true':'false')}catch{}
   document.querySelectorAll('[data-wn-auto]').forEach(x=>{x.checked=e.target.checked});
  });
  queueMicrotask(maybeAnnounce);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
