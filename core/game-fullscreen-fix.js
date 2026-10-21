/* Unified game fullscreen for Lolite desktop and browsing layouts.
   Each click requests browser-native fullscreen from a user gesture. */
(()=>{
  'use strict';
  const STYLE_ID='lolite-game-fullscreen-styles';
  if(!document.getElementById(STYLE_ID)){
    const css=document.createElement('style');css.id=STYLE_ID;
    css.textContent=`
      .lolite-game-fullscreen-tools{display:flex;justify-content:flex-end;align-items:center;gap:7px;padding:5px 0;flex:0 0 auto}
      .lolite-game-fullscreen-toggle{border:1px solid #46516b;border-radius:7px;background:#1b2332;color:#f5f7fd;cursor:pointer;padding:7px 12px;font:600 12px 'Segoe UI',sans-serif}
      .lolite-game-fullscreen-toggle:hover{background:#303b52}
      .lolite-game-native-fullscreen:fullscreen,.lolite-game-native-fullscreen:-webkit-full-screen,
      .store-player:fullscreen,.store-player:-webkit-full-screen{
        display:flex!important;flex-direction:column!important;box-sizing:border-box!important;
        position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;
        min-height:100dvh!important;max-height:none!important;margin:0!important;
        padding:0!important;border:0!important;border-radius:0!important;overflow:hidden!important;
        gap:0!important;background:#000!important;color:#fff!important;z-index:2147483647!important
      }
      .lolite-game-native-fullscreen:fullscreen iframe,.lolite-game-native-fullscreen:-webkit-full-screen iframe,
      .store-player:fullscreen iframe,.store-player:-webkit-full-screen iframe{
        display:block!important;width:100%!important;height:100%!important;min-height:0!important;
        flex:1 1 auto!important;max-height:none!important;border:0!important;border-radius:0!important
      }
      .store-player:fullscreen .store-player-head,.store-player:fullscreen .store-server-row,
      .store-player:fullscreen .store-server-picker,.store-player:fullscreen .store-external-player-note,
      .store-player:-webkit-full-screen .store-player-head,
      .store-player:-webkit-full-screen .store-server-row,
      .store-player:-webkit-full-screen .store-server-picker{display:none!important}
      .store-player:fullscreen > :not(iframe),.store-player:-webkit-full-screen > :not(iframe){display:none!important}
      .lolite-game-native-fullscreen:fullscreen .lolite-game-fullscreen-tools,
      .lolite-game-native-fullscreen:-webkit-full-screen .lolite-game-fullscreen-tools{
        position:absolute;top:10px;right:10px;z-index:2;opacity:.12;transition:opacity .16s
      }
      .lolite-game-native-fullscreen:fullscreen .lolite-game-fullscreen-tools:hover,
      .lolite-game-native-fullscreen:fullscreen .lolite-game-fullscreen-tools:focus-within{opacity:1}
      .lolite-game-native-fullscreen:fullscreen .lolite-game-fullscreen-toggle{background:#131923e8}
      .lolite-game-native-fullscreen:fullscreen > .store-frame{height:100%!important}
      .lolite-game-native-fullscreen:fullscreen .uploaded-gamebar{display:none!important}
    `;
    document.head.appendChild(css);
  }
  function notice(message){if(typeof window.toast==='function')window.toast(message);else console.warn(message)}
  function active(){return document.fullscreenElement||document.webkitFullscreenElement}
  function target(windowId){
    const w=window.state?.windows?.[windowId]?.el||document.querySelector('.window[data-window-id="'+windowId+'"]');
    return w?.querySelector('.store-player, .uploaded-game, .lolite-game-native-fullscreen')||w?.querySelector('.content');
  }
  async function toggle(el){
    if(!el)return;
    const selected=el.matches('iframe')?el:el;
    try{
      if(active()===selected){
        const exit=document.exitFullscreen||document.webkitExitFullscreen;
        if(exit)await exit.call(document);
        return;
      }
      // A click is required by Firefox, Chromium and Safari for requestFullscreen.
      const request=selected.requestFullscreen||selected.webkitRequestFullscreen;
      if(!request){notice('Native fullscreen is not supported by this browser. Try F11.');return}
      await request.call(selected);
    }catch(error){console.error('Lolite game fullscreen',error);notice('Fullscreen was blocked by the browser. Click the fullscreen button directly or try F11.')}
  }
  window.loliteGameFullscreen=toggle;
  window.loliteStoreFullscreen=id=>toggle(target(id));
  function sync(){
    const on=active();
    document.querySelectorAll('.lolite-game-fullscreen-toggle, .store-fullscreen-icon').forEach(b=>{
      const host=b.closest('.store-player,.uploaded-game,.lolite-game-native-fullscreen');
      const isOn=!!on&&!!host&&(host===on||host.contains(on));
      b.setAttribute('aria-pressed',String(isOn));
      b.title=isOn?'Exit fullscreen (Esc)':'Enter fullscreen';
      if(b.classList.contains('lolite-game-fullscreen-toggle'))b.textContent=isOn?'Exit fullscreen':'Fullscreen';
    });
  }
  document.addEventListener('fullscreenchange',sync);
  document.addEventListener('webkitfullscreenchange',sync);
  function enhance(){
    document.querySelectorAll('#windows .window').forEach(w=>{
      const id=w.dataset.windowId||'';
      if(!/^(?:store-game-|html-game-|uploaded-|game-)/.test(id)&&!w.querySelector('.store-player,.uploaded-game'))return;
      const frame=w.querySelector('iframe');
      if(!frame)return;
      frame.setAttribute('allowfullscreen','');
      frame.allowFullscreen=true;
      const allowed=new Set((frame.getAttribute('allow')||'').split(';').map(v=>v.trim()).filter(Boolean));
      ['fullscreen','autoplay','gamepad','pointer-lock'].forEach(x=>allowed.add(x));
      frame.setAttribute('allow',[...allowed].join('; '));
      const pane=w.querySelector('.store-player,.uploaded-game')||frame.parentElement;
      if(pane.classList.contains('store-player'))return; // Store already has a fullscreen button.
      if(pane.dataset.loliteFullscreenEnhanced==='1')return;
      pane.dataset.loliteFullscreenEnhanced='1';
      pane.classList.add('lolite-game-native-fullscreen');
      const bar=document.createElement('div');bar.className='lolite-game-fullscreen-tools';
      const button=document.createElement('button');button.type='button';button.className='lolite-game-fullscreen-toggle';
      button.textContent='Fullscreen';button.setAttribute('aria-label','Toggle game fullscreen (Escape to exit)');
      button.addEventListener('click',()=>toggle(pane));
      bar.appendChild(button);pane.insertBefore(bar,frame);
      sync();
    });
  }
  let queued=false;
  const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance()})});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
})();