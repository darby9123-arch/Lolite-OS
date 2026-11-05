/* Play games inside Lolite windows without navigating or reloading the OS. */
(()=>{
 'use strict';
 const notify=message=>window.toast?.(message)||console.warn(message);
 const safeURL=value=>{
  try{
   const u=new URL(String(value||''),document.baseURI);
   return u.protocol==='https:'||u.protocol==='http:'?u:null;
  }catch{return null}
 };
 const windowId=file=>'store-game-'+String(file||'game').replace(/[^a-z0-9]+/gi,'-').slice(0,70);
 const sandboxFor=url=>{
  const imported=url.pathname.includes('/core/local-games/');
  // Imported ZIP/HTML scripts must never gain Lolite's origin or account storage.
  if(imported)return 'allow-scripts allow-forms allow-pointer-lock allow-downloads';
  if(url.origin===location.origin)return 'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads';
  return 'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads allow-popups';
 };
 function buildFrame(url,title){
  const frame=document.createElement('iframe');
  frame.className='store-frame';
  frame.title=title;
  frame.src=url.href;
  frame.loading='eager';
  frame.referrerPolicy='no-referrer';
  frame.setAttribute('sandbox',sandboxFor(url));
  frame.setAttribute('allow','fullscreen; autoplay; gamepad; pointer-lock');
  frame.setAttribute('allowfullscreen','');
  frame.allowFullscreen=true;
  frame.tabIndex=0;
  return frame;
 }
 function open({title='Game',url,file,source='Lolite OS'}={}){
  const target=safeURL(url);
  if(!target){notify('This game server does not have a valid URL.');return false}
  const label=String(title||'Game').slice(0,110),id=windowId(file||label);
  const existing=window.state?.windows?.[id];
  const existingFrame=existing?.el.querySelector('.store-frame');
  if(existingFrame?.src===target.href){
   window.restoreWin?.(id);
   return true; // Keeps game progress in this open window.
  }
  if(typeof window.openApp!=='function'){notify('The Lolite game window is unavailable.');return false}
  const win=window.openApp(id,label,1020,720);
  const content=win?.querySelector('.content')||window.state?.windows?.[id]?.el?.querySelector('.content');
  if(!content){notify('Could not open the Lolite game player.');return false}
  content.replaceChildren();
  content.style.padding='0';
  content.style.overflow='hidden';
  const player=document.createElement('section');
  player.className='store-player';
  player.dataset.gameFile=String(file||'');
  const head=document.createElement('header');head.className='store-player-head';
  const info=document.createElement('div');info.className='store-player-info';
  const heading=document.createElement('strong');heading.textContent=label;
  const server=document.createElement('small');server.className='store-player-server';server.textContent=source;
  info.append(heading,server);
  const actions=document.createElement('div');actions.className='store-player-actions';
  const button=(text,aria,handler)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.title=aria;b.setAttribute('aria-label',aria);b.addEventListener('click',handler);return b};
  const reload=button('↻','Restart game',()=>{
   const old=player.querySelector('iframe.store-frame');
   if(old)old.replaceWith(buildFrame(safeURL(old.src),label));
  });
  const full=button('⛶','Fullscreen game',()=>window.loliteStoreFullscreen?.(id));
  full.classList.add('store-fullscreen-icon');
  const back=button('← Store','Return to Game Store',()=>{
   window.closeWin?.(id);
   if(document.documentElement.classList.contains('browsing-mode'))window.LoliteDeviceMode?.openApp('games');
   else window.openApp?.('games','Game Store');
  });
  actions.append(reload,full,back);head.append(info,actions);
  const frame=buildFrame(target,label);
  const help=document.createElement('details');help.className='store-player-help';
  const summary=document.createElement('summary');summary.textContent='Game not loading?';
  const text=document.createElement('span');
  text.textContent='Some external servers do not allow games inside another website. You can open that server separately without closing Lolite.';
  const outside=button('Open server in new tab','Open selected game server in a new tab',()=>{
   const active=player.querySelector('iframe.store-frame');
   const link=safeURL(active?.src);
   if(link)window.open(link.href,'_blank','noopener,noreferrer');
  });
  help.append(summary,text,outside);
  player.append(head,frame,help);content.append(player);
  win?.focus?.({preventScroll:true});
  return true;
 }
 function switchServer(file,url,source){
  const u=safeURL(url),id=windowId(file),content=window.state?.windows?.[id]?.el?.querySelector('.store-player');
  if(!u||!content)return false;
  const frame=content.querySelector('iframe.store-frame');
  if(frame&&frame.src!==u.href)frame.replaceWith(buildFrame(u,frame.title));
  const label=content.querySelector('.store-player-server');
  if(label)label.textContent=source||'Game server';
  return true;
 }
 const style=document.createElement('style');style.id='lolite-inapp-game-player';style.textContent=
  '#windows .window:has(.store-player)>.content{padding:0!important;overflow:hidden!important;min-height:0!important}'+
  '.store-player{height:100%;min-height:0;display:flex;flex-direction:column;gap:0;background:#080d14;color:#eff5fa}'+
  '.store-player-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;background:#101925;border-bottom:1px solid #ffffff1b;flex:none}'+
  '.store-player-info{display:grid;gap:2px;min-width:0}.store-player-info strong{font:700 13px system-ui, sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.store-player-info small{font:11px system-ui,sans-serif;color:#9aaebf}'+
  '.store-player-actions{display:flex;align-items:center;gap:6px;flex:none}.store-player-actions button{border:1px solid #ffffff24;background:#1b2a39;color:#eaf3fa;border-radius:7px;min-width:38px;height:34px;padding:0 10px;cursor:pointer;font:600 12px system-ui,sans-serif}.store-player-actions button:hover{background:#2c425a}.store-player-actions .store-fullscreen-icon{width:38px;height:34px}'+
  '.store-player .store-frame{display:block;width:100%!important;height:100%!important;min-height:0!important;flex:1 1 0!important;border:0!important;border-radius:0!important;background:#05070b}'+
  '.store-player-help{position:relative;flex:none;padding:5px 12px;background:#0d1621;border-top:1px solid #ffffff13;color:#a9b9c9;font:11px/1.45 system-ui,sans-serif}.store-player-help summary{cursor:pointer;list-style:inside;font-size:11px}.store-player-help[open]{padding:10px 13px}.store-player-help span{display:block;margin:8px 0}.store-player-help button{background:#203549;color:#eaf3fa;border:1px solid #66829c64;border-radius:6px;padding:6px 9px;cursor:pointer}'+
  '.store-player:fullscreen,.store-player:-webkit-full-screen{height:100dvh!important;width:100vw!important;padding:0!important;gap:0!important}.store-player:fullscreen .store-player-head,.store-player:fullscreen .store-player-help,.store-player:-webkit-full-screen .store-player-head,.store-player:-webkit-full-screen .store-player-help{display:none!important}'+
  '@media(max-width:520px){.store-player-head{padding:8px;gap:6px}.store-player-info strong{font-size:12px}.store-player-actions{gap:3px}.store-player-actions button{min-width:33px;padding:0 6px}}';
 document.head.append(style);
 window.LoliteGamePlayer=Object.freeze({open,switchServer});
})();
