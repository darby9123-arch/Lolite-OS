/* Quiet motion: short fades only; close/minimise/maximise always act immediately. */
(()=>{'use strict';
 const root=document.documentElement;
 const reduced=()=>root.classList.contains('reduce')||root.classList.contains('reduce-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 function animate(el,frames,options={}){if(!el?.isConnected||reduced()||!el.animate)return null;return el.animate([{opacity:.65},{opacity:1}],{duration:100,easing:'ease-out',...options})}
 const oldOpen=window.openApp;window.openApp=function(...args){const existing=document.querySelector('[data-window-id="'+CSS.escape(String(args[0]))+'"]');const result=oldOpen.apply(this,args);if(!existing)animate(document.querySelector('[data-window-id="'+CSS.escape(String(args[0]))+'"]'));return result};
 window.LoliteMotion={reduced,animate};
})();
