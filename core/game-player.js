/* Play games inside Lolite windows without navigating or reloading the OS. */
(()=>{
 'use strict';
 const notify=message=>{if(typeof window.toast==='function')window.toast(message);else console.warn(message)};
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
  if(url.origin===location.origin)return url.pathname.startsWith('/games/')?'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads':'allow-scripts allow-forms allow-pointer-lock allow-downloads';
  return 'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads allow-popups';
 };
 function buildFrame(url,title){
  const frame=document.createElement('iframe');
  frame.className='store-frame';
  frame.title=title;
  frame.src='about:blank';
  frame.dataset.gameUrl=url.href;
  frame.loading='eager';
  frame.referrerPolicy='no-referrer';
  frame.setAttribute('sandbox',sandboxFor(url));
  frame.setAttribute('allow','fullscreen; autoplay; gamepad; pointer-lock');
  frame.setAttribute('allowfullscreen','');
  frame.allowFullscreen=true;
  frame.tabIndex=0;
  return frame;
 }
 // A number of external game hosts serve real HTML as text/plain.
 // The browser normally DISPLAYS those responses as code. Safely convert only
 // validated HTML documents to srcdoc in a sandboxed, opaque-origin frame.
 const MAX_RAW_GAME_BYTES=40*1024*1024;
 const rawTypes=new Set(['text/plain','text/markdown','application/octet-stream']);
 const htmlDocument=text=>/^\s*(?:<!--[\s\S]*?-->\s*)*(?:<!doctype\s+html\b|<html(?:\s|>)|<head(?:\s|>)|<body(?:\s|>))/i.test(text)||
   /^\s*<(?:meta|link|style|div|canvas|script|main|section|article)(?:\s|>)/i.test(text);
 const htmlWithBase=(html,url)=>{
   if(/<base\s/i.test(html))return html;
   const base='<base href="'+url.href.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">';
   return /<head(?:\s[^>]*)?>/i.test(html)
      ?html.replace(/<head(?:\s[^>]*)?>/i,match=>match+base)
      :base+html;
 };

 function buildError(frame,url,reason){
   if(!frame.isConnected||frame.dataset.gameUrl!==url.href)return;
   const notice=document.createElement('div');notice.className='store-load-error';
   notice.dataset.gameUrl=url.href;
   const heading=document.createElement('strong');heading.textContent='This game could not launch';
   const detail=document.createElement('p');detail.textContent=reason;
   const hint=document.createElement('p');
   hint.textContent='If the source is a real HTML game, Lolite can render it here. Some servers block cross-site access, and some games require extra files.';
   const actions=document.createElement('div');
   const retry=document.createElement('button');retry.textContent='Retry';retry.type='button';
   retry.onclick=()=>{const fresh=buildFrame(url,frame.title);notice.replaceWith(fresh);startFrame(fresh,url)};
   const store=document.createElement('button');store.textContent='Back to Game Store';store.type='button';
   store.onclick=()=>window.openApp?.('games','Game Store');
   actions.append(retry,store);notice.append(heading,detail,hint,actions);
   frame.replaceWith(notice);
 }
 // Convert source HTML only inside an opaque-origin sandbox. Unlike iframe
 // navigation, srcdoc renders real HTML even when the publisher's server labels
 // the .html response text/plain.
 function startFrame(frame,url){
   const live=()=>frame.isConnected&&frame.dataset.gameUrl===url.href;
   const run=()=>{if(live())frame.src=url.href};
   const local=url.origin===location.origin;
   const knownRawHost=/^(?:cdn\.jsdelivr\.net|raw\.githubusercontent\.com|rawcdn\.githack\.com)$/i.test(url.hostname);
   let pending=false;
   async function renderSource({allowNormalHTML=true}={}){
     if(pending||!live())return;
     pending=true;
     const controller=new AbortController();
     const timeout=setTimeout(()=>controller.abort(),15000);
     try{
       const response=await fetch(url.href,{
         method:'GET',cache:'no-store',signal:controller.signal,
         mode:'cors',credentials:'omit'
       });
       if(!response.ok)throw new Error('The game HTML returned HTTP '+response.status+'.');
       const mime=String(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
       if(mime==='text/html'&&allowNormalHTML){run();return}
       if(mime&&!rawTypes.has(mime)&&mime!=='text/html'){
         throw new Error('The game server returned '+mime+' instead of an HTML page.');
       }
       const declared=Number(response.headers.get('content-length')||0);
       if(declared>MAX_RAW_GAME_BYTES)throw new Error('This HTML source is too large to render.');
       const html=await response.text();
       if(new Blob([html]).size>MAX_RAW_GAME_BYTES)throw new Error('This HTML source is too large to render.');
       if(!htmlDocument(html))throw new Error('The server returned text, but not playable HTML.');
       if(!live())return;
       // srcdoc has a unique opaque origin; never allow same-origin, popups or
       // top navigation for third-party source code rendered as an HTML document.
       frame.setAttribute('sandbox','allow-scripts allow-forms allow-pointer-lock allow-downloads');
       frame.dataset.gameRender='raw-html';
       frame.srcdoc=htmlWithBase(html,url);
     }catch(error){
       if(!live())return;
       const reason=error?.name==='TypeError'
         ?'This server blocks cross-origin access (CORS), so Lolite cannot turn its source into a playable page.'
         :error?.name==='AbortError'
           ?'The game source took too long to load.'
           :String(error?.message||'The game source could not load.');
       // A failed inspection does not mean the URL is necessarily broken: on
       // ordinary HTML hosts an iframe may still load when fetch/CORS is denied.
       if(error?.name==='TypeError'&&!knownRawHost&&!local)run();
       else buildError(frame,url,reason);
     }finally{
       pending=false;
       clearTimeout(timeout);
     }
   }
   // The installed-game service worker has a GET-only sandbox, not HEAD.
   if(url.pathname.includes('/core/local-games/')){run();return}
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),local?6000:4500);
   fetch(url.href,{method:'HEAD',signal:controller.signal,cache:'no-store'})
     .then(response=>{
       if(!live())return;
       if(!response.ok){
         if(response.status===405||response.status===501){
           // No HEAD support: check GET instead of blindly showing raw text.
           void renderSource();return;
         }
         buildError(frame,url,'The selected game returned HTTP '+response.status+'.');return;
       }
       const mime=String(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
       if(rawTypes.has(mime)||!mime){void renderSource();return}
       if(['application/json','application/javascript','text/javascript'].includes(mime)){
         buildError(frame,url,'This server returned JavaScript or data rather than an HTML game.');return;
       }
       run();
     })
     .catch(()=>{
       if(!live())return;
       // Some CDNs deny HEAD/CORS yet permit GET. Try converting the actual
       // response before giving up or sending the browser to a raw-code page.
       void renderSource();
     })
     .finally(()=>clearTimeout(timeout));
 }

 function open({title='Game',url,file,source='Lolite OS'}={}){
  const target=safeURL(url);
  if(!target){notify('This game server does not have a valid URL.');return false}
  const label=String(title||'Game').slice(0,110),id=windowId(file||label);
  const existing=document.querySelector('#windows .window[data-window-id="'+id+'"]');
  const existingFrame=existing?.querySelector('.store-frame');
  if(existingFrame?.dataset.gameUrl===target.href||existingFrame?.src===target.href){
   window.restoreWin?.(id);
   window.LoliteDeviceMode?.activateWindow?.(id);
   return true; // Keeps game progress in this open window.
  }
  if(typeof window.openApp!=='function'){notify('The Lolite game window is unavailable.');return false}
  const win=window.openApp(id,label,1020,720);
  const content=win?.querySelector('.content')||document.querySelector('#windows .window[data-window-id="'+id+'"] .content');
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
    const old=player.querySelector('.store-frame,.store-load-error');
    const source=safeURL(old?.dataset.gameUrl||old?.src);
    if(old&&source){const fresh=buildFrame(source,label);old.replaceWith(fresh);startFrame(fresh,source)}
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
   const link=safeURL(active?.dataset.gameUrl||active?.src);
   if(link)window.open(link.href,'_blank','noopener,noreferrer');
  });
  help.append(summary,text,outside);
  player.append(head,frame,help);content.append(player);
  startFrame(frame,target);
  win?.focus?.({preventScroll:true});
  window.LoliteDeviceMode?.activateWindow?.(id);
  return true;
 }
 function switchServer(file,url,source){
  const u=safeURL(url),id=windowId(file),content=document.querySelector('#windows .window[data-window-id="'+id+'"] .store-player');
  if(!u||!content)return false;
  const old=content.querySelector('.store-frame,.store-load-error');
  if(old&&old.dataset.gameUrl!==u.href){
   const frame=buildFrame(u,content.querySelector('.store-player-info strong')?.textContent||'Game');
   old.replaceWith(frame);startFrame(frame,u);
  }
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
  '.store-load-error{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;text-align:center;padding:28px 18px;background:#0b1522;color:#f0f6ff}.store-load-error strong{font-size:19px}.store-load-error p{max-width:520px;margin:0;font:13px/1.55 system-ui;color:#b1bfd0}.store-load-error div{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.store-load-error button{border:1px solid #6b9abc99;border-radius:8px;background:#234a66;color:white;padding:9px 13px;cursor:pointer}'+
  '@media(max-width:520px){.store-player-head{padding:8px;gap:6px}.store-player-info strong{font-size:12px}.store-player-actions{gap:3px}.store-player-actions button{min-width:33px;padding:0 6px}}';
 document.head.append(style);
 window.LoliteGamePlayer=Object.freeze({open,switchServer});
})();
