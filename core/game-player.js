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
  if(url.origin===location.origin){
   // Built-in games are trusted first-party files, unlike third-party HTML.
   // Resolve the folder against the deployment path (e.g. /Lolite-OS/games/).
   const builtInPrefix=new URL('games/',document.baseURI).pathname;
   const trustedBuiltIn=url.pathname.startsWith(builtInPrefix);
   return trustedBuiltIn
    ?'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads'
    :'allow-scripts allow-forms allow-pointer-lock allow-downloads';
  }
  return 'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads allow-popups';
 };
 // Record only when the actual game iframe finishes loading.
 // The initial about:blank frame and preflight failures must not count.
 function trackFrame(frame,file){
  if(!file)return;
  frame.dataset.popularityFile=String(file);
  frame.addEventListener('load',()=>{
   if(!frame.isConnected||frame.dataset.popularityRecorded==='yes'||frame.dataset.gameReady!=='1')return;
   if(!frame.srcdoc && (!frame.src||frame.src==='about:blank'))return;
   frame.dataset.popularityRecorded='yes';
   void window.LoliteGamePopularity?.record?.(file);
  });
 }
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
 const isErrorDocument=html=>{
  const start=String(html||'').slice(0,12000);
  const title=(start.match(/<title[^>]*>([^<]{0,220})<\/title>/i)||[])[1]||'';
  return /<title[^>]*>\s*(?:(?:404|410)(?:\s*[-–:]\s*)?)?(?:not found|page not found|404 error|404 not found|site not found)\s*<\/title>/i.test(start)
   || /<title[^>]*>\s*404\s*<\/title>/i.test(start)
   || /^(?:site|file|page)\s+not\s+found(?:\s*[·–-].*)?$/i.test(title.trim())
   || /there isn't a github pages site here/i.test(start)
   || /<h1[^>]*>\s*(?:404(?:\s*[-–:]\s*(?:not found|file not found))?|page not found)\s*<\/h1>/i.test(start);
 };
 const htmlWithBase=(html,url)=>{
   if(/<base\s/i.test(html))return html;
   // Raw GitHub returns relative scripts/styles as text/plain. For game HTML
   // source backups, point relative assets to the original published website.
   const origins={
    '/genizymath/genizymath.github.io/main/':'https://genizymath.github.io/',
    '/mountain658/mountain658.github.io/main/':'https://mountain658.github.io/',
    '/WanoCapy/ChickenKingsVault/main/':'https://wanocapy.github.io/ChickenKingsVault/',
    '/daknux/html/main/':'https://cdn.jsdelivr.net/gh/daknux/html@main/'
   };
   let baseURL=url.href;
   if(url.hostname==='raw.githubusercontent.com'){
    const prefix=Object.keys(origins).find(p=>url.pathname.startsWith(p));
    if(prefix)baseURL=origins[prefix]+url.pathname.slice(prefix.length)+url.search;
   }
   const base='<base href="'+baseURL.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">';
   return /<head(?:\s[^>]*)?>/i.test(html)
      ?html.replace(/<head(?:\s[^>]*)?>/i,match=>match+base)
      :base+html;
 };

 function buildError(frame,url,reason){
   if(!frame.isConnected||frame.dataset.gameUrl!==url.href)return;
   const player=typeof frame.closest==='function'?frame.closest('.store-player'):null;
   // Record confirmed missing HTTP sources before trying another server.
   // This includes remote hosts and prevents revisiting dead URLs.
   if(/(?:HTTP 404\b|404 Not Found|HTTP 410\b)/i.test(String(reason)))
     window.LoliteGameHealth?.markHttpError?.(url.href,/410/.test(String(reason))?410:404);
   const next=player?._loliteFallbackSources?.shift();
   if(next){
    const fallback=safeURL(next.url);
    if(fallback){
     const replacement=buildFrame(fallback,frame.title);
     trackFrame(replacement,player.dataset.gameFile);
     frame.replaceWith(replacement);
     const label=player.querySelector('.store-player-server');
     if(label)label.textContent=next.name+' · backup server';
     startFrame(replacement,fallback);
     return;
    }
   }
   const notice=document.createElement('div');notice.className='store-load-error';
   notice.dataset.gameUrl=url.href;
   notice.dataset.popularityFile=frame.dataset.popularityFile||'';
   const heading=document.createElement('strong');heading.textContent='This game could not launch';
   const detail=document.createElement('p');detail.textContent=reason;
   const hint=document.createElement('p');
   hint.textContent='If the source is a real HTML game, Lolite can render it here. Some servers block cross-site access, and some games require extra files.';
   const actions=document.createElement('div');
   const retry=document.createElement('button');retry.textContent='Retry';retry.type='button';
   retry.onclick=()=>{const fresh=buildFrame(url,frame.title);trackFrame(fresh,notice.dataset.popularityFile);notice.replaceWith(fresh);startFrame(fresh,url)};
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
   const run=()=>{if(live()){frame.dataset.gameReady='1';frame.src=url.href}};
   const local=url.origin===location.origin;
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
       if(mime&&!rawTypes.has(mime)&&mime!=='text/html'){
         throw new Error('The game server returned '+mime+' instead of an HTML page.');
       }
       const declared=Number(response.headers.get('content-length')||0);
       if(declared>MAX_RAW_GAME_BYTES)throw new Error('This HTML source is too large to render.');
       const html=await response.text();
       if(new Blob([html]).size>MAX_RAW_GAME_BYTES)throw new Error('This HTML source is too large to render.');
       if(isErrorDocument(html))throw new Error('The selected game page is missing (404 Not Found).');
       if(!htmlDocument(html))throw new Error('The server returned text, but not playable HTML.');
       if(!live())return;
       if(mime==='text/html'&&allowNormalHTML){run();return}
       // srcdoc has a unique opaque origin; never allow same-origin, popups or
       // top navigation for third-party source code rendered as an HTML document.
       frame.setAttribute('sandbox','allow-scripts allow-forms allow-pointer-lock allow-downloads');
       frame.dataset.gameRender='raw-html';
       frame.dataset.gameReady='1';
       frame.srcdoc=htmlWithBase(html,url);
     }catch(error){
       if(!live())return;
       // A confirmed HTML response from HEAD can still be embedded when the
       // publisher allows iframes but blocks cross-origin GET inspection.
       // Never navigate directly for unverified raw-code hosting.
       if(error?.name==='TypeError'&&!local&&frame.dataset.headHTML==='1'){
         run();return;
       }
       const reason=error?.name==='TypeError'
         ?'This server blocks cross-origin access (CORS), so Lolite cannot turn its source into a playable page.'
         :error?.name==='AbortError'
           ?'The game source took too long to load.'
           :String(error?.message||'The game source could not load.');
       // If GET is blocked, rendering a raw-code URL directly would just
       // expose source text to the player. Explain the server limitation.
       buildError(frame,url,reason);
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
       if(mime==='text/html'){
         // A successful same-origin HEAD confirms the repository file exists.
         // Don't download large bundled games twice just to preview the HTML.
         if(local){run();return}
         // On third-party sites, also inspect GET for soft 404 error pages.
         frame.dataset.headHTML='1';
         void renderSource();return;
       }
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

 const normaliseFallbacks=(sources,current)=>{
  const seen=new Set([current.href]);
  return (Array.isArray(sources)?sources:[]).map(src=>{
   const target=safeURL(src?.url);
   if(!target||seen.has(target.href))return null;
   seen.add(target.href);
   return {name:String(src.name||'Backup server').slice(0,80),url:target.href};
  }).filter(Boolean).slice(0,8);
 };
 function open({title='Game',url,file,source='Lolite OS',fallbackSources=[]}={}){
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
  player._loliteFallbackSources=normaliseFallbacks(fallbackSources,target);
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
    if(old&&source){const fresh=buildFrame(source,label);trackFrame(fresh,player.dataset.gameFile);old.replaceWith(fresh);startFrame(fresh,source)}
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
  trackFrame(frame,file);
  const help=document.createElement('details');help.className='store-player-help';
  const summary=document.createElement('summary');summary.textContent='Game not loading?';
  const text=document.createElement('span');
  text.textContent='Some external servers do not allow games inside another website. You can open that server separately without closing Lolite.';
  const tryNext=button('Try next server','Switch to the next available game source',()=>{
   const choices=player._loliteFallbackSources||[];
   const existing=player.querySelector('.store-frame,.store-load-error');
   let source=null,target=null;
   while(choices.length){
    source=choices.shift();target=safeURL(source?.url);
    if(target&&target.href!==existing?.dataset.gameUrl&&
      !window.LoliteGameHealth?.isUnavailable?.({url:target.href}))break;
    target=null;
   }
   if(!target||!existing){
    notify('No additional game servers are available for this game.');
    return;
   }
   const frame=buildFrame(target,label);
   trackFrame(frame,player.dataset.gameFile);
   existing.replaceWith(frame);
   server.textContent=source.name+' · another server';
   startFrame(frame,target);
  });
  const outside=button('Open server in new tab','Open selected game server in a new tab',()=>{
   const active=player.querySelector('iframe.store-frame');
   const link=safeURL(active?.dataset.gameUrl||active?.src);
   if(link)window.open(link.href,'_blank','noopener,noreferrer');
  });
  help.append(summary,text,tryNext,outside);
  player.append(head,frame,help);content.append(player);
  startFrame(frame,target);
  win?.focus?.({preventScroll:true});
  window.LoliteDeviceMode?.activateWindow?.(id);
  return true;
 }
 function switchServer(file,url,source,fallbackSources=[]){
  const u=safeURL(url),id=windowId(file),content=document.querySelector('#windows .window[data-window-id="'+id+'"] .store-player');
  if(!u||!content)return false;
  content._loliteFallbackSources=normaliseFallbacks(fallbackSources,u);
  const old=content.querySelector('.store-frame,.store-load-error');
  if(old&&old.dataset.gameUrl!==u.href){
   const frame=buildFrame(u,content.querySelector('.store-player-info strong')?.textContent||'Game');
   trackFrame(frame,file);
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
