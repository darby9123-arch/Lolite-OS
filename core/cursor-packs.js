/* Lolite OS: unified cursor packs, previews and resizable window edges. */
(()=>{
 'use strict';
 const PACKS={
  classic:{name:'Classic',fill:'#ffffff',stroke:'#163153',accent:'#72bcff'},
  glass:{name:'Glass',fill:'#c3edff',stroke:'#176cb4',accent:'#4dd7ff'},
  neon:{name:'Neon',fill:'#101a2e',stroke:'#67ffce',accent:'#2dffab'},
  retro:{name:'Retro',fill:'#ffdf8b',stroke:'#70411e',accent:'#ffb14a'}
 };
 const PACK_KEY='loliteCursorPack',SIZE_KEY='loliteCursorSize';
 const sizes=[24,32,48];
 const read=(k,fallback)=>{try{return localStorage.getItem(k)??fallback}catch{return fallback}};
 const save=(k,value)=>{try{localStorage.setItem(k,value)}catch{}};
 let selected=read(PACK_KEY,'classic');
 if(selected!=='system'&&!PACKS[selected])selected='classic';
 let cursorSize=Number(read(SIZE_KEY,'32'));
 if(!sizes.includes(cursorSize))cursorSize=32;
 const xml=(body,size=32)=>'<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 32 32">'+body+'</svg>';
 const image=(body,size=32)=>'data:image/svg+xml,'+encodeURIComponent(xml(body,size));
 const cursor=(body,x=16,y=16,fallback='auto',size=cursorSize)=>{
   const multiplier=size/32;
   return 'url("'+image(body,size)+'") '+Math.round(x*multiplier)+' '+Math.round(y*multiplier)+', '+fallback;
 };
 const line=(path,p)=>'<path d="'+path+'" fill="none" stroke="'+p.stroke+'" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="'+path+'" fill="none" stroke="'+p.accent+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
 function shapes(pack){
   const p=PACKS[pack]||PACKS.classic;
   const classicArrow='<path d="M5 3V27L11 21L16 29L21 26L16 18H26Z" fill="'+p.fill+'" stroke="'+p.stroke+'" stroke-width="2" stroke-linejoin="round"/>';
   const retroArrow='<path d="M4 3H8V7H12V11H16V15H20V19H15V22H19V28H15V25H12V21H9V25H5V3Z" fill="'+p.fill+'" stroke="'+p.stroke+'" stroke-width="1.7" stroke-linejoin="miter" shape-rendering="crispEdges"/>';
   return {
     arrow:pack==='retro'?retroArrow:classicArrow,
     pointer:'<path d="M7 20Q6 17 9 17L13 21V8Q13 5 16 5T19 8V16Q22 13 24 17Q28 15 29 20V24Q29 30 22 30H15Q12 30 10 26Z" fill="'+p.fill+'" stroke="'+p.stroke+'" stroke-width="2"/>',
     text:line('M10 5H22M16 5V27M10 27H22',p),
     crosshair:line('M16 2V11M16 21V30M2 16H11M21 16H30',p)+'<circle cx="16" cy="16" r="3" fill="'+p.fill+'" stroke="'+p.stroke+'" stroke-width="1.5"/>',
     move:'<path d="M16 2L11 9H14V14H9V11L2 16L9 21V18H14V23H11L16 30L21 23H18V18H23V21L30 16L23 11V14H18V9H21Z" fill="'+p.fill+'" stroke="'+p.stroke+'" stroke-width="1.7"/>',
     grab:'<path d="M7 16V10Q7 7 10 7T13 10V7Q13 4 16 4T19 7V10Q19 7 22 7T25 10V14Q29 12 29 17V22Q29 29 22 29H14Q10 29 8 24L4 19Q3 15 7 16Z" fill="'+p.fill+'" stroke="'+p.stroke+'" stroke-width="1.8"/>',
     grabbing:'<path d="M7 18V12Q7 9 10 9T13 12V10Q13 7 16 7T19 10V12Q19 9 22 9T25 12V15Q29 14 29 19V24Q29 30 21 30H15Q10 30 8 26L4 21Q3 17 7 18Z" fill="'+p.fill+'" stroke="'+p.stroke+'" stroke-width="1.8"/>',
     ew:line('M4 16H28M4 16L10 10M4 16L10 22M28 16L22 10M28 16L22 22',p),
     ns:line('M16 4V28M16 4L10 10M16 4L22 10M16 28L10 22M16 28L22 22',p),
     nwse:line('M5 5L27 27M5 5V13M5 5H13M27 27V19M27 27H19',p),
     nesw:line('M27 5L5 27M27 5V13M27 5H19M5 27V19M5 27H13',p),
     wait:'<circle cx="16" cy="16" r="12" fill="'+p.fill+'" stroke="'+p.stroke+'" stroke-width="2"/>'+line('M16 7V16L23 20',p),
     progress:'<circle cx="16" cy="16" r="10" fill="none" stroke="'+p.stroke+'" stroke-width="4"/><path d="M16 6A10 10 0 0 1 26 16" fill="none" stroke="'+p.accent+'" stroke-width="4" stroke-linecap="round"/>',
     unavailable:'<circle cx="16" cy="16" r="12" fill="'+p.fill+'" stroke="'+p.stroke+'" stroke-width="2"/>'+line('M8 8L24 24',p),
     help:'<circle cx="16" cy="16" r="12" fill="'+p.fill+'" stroke="'+p.stroke+'" stroke-width="2"/>'+line('M12 12Q12 7 17 8Q24 10 17 17L16 20M16 25V25.2',p),
     zoomIn:'<circle cx="13" cy="13" r="8" fill="'+p.fill+'" stroke="'+p.stroke+'" stroke-width="2"/>'+line('M19 19L28 28M13 9V17M9 13H17',p),
     zoomOut:'<circle cx="13" cy="13" r="8" fill="'+p.fill+'" stroke="'+p.stroke+'" stroke-width="2"/>'+line('M19 19L28 28M9 13H17',p)
   };
 }
 const fallback={arrow:'auto',pointer:'pointer',text:'text',crosshair:'crosshair',move:'move',grab:'grab',grabbing:'grabbing',ew:'ew-resize',ns:'ns-resize',nwse:'nwse-resize',nesw:'nesw-resize',wait:'wait',progress:'progress',unavailable:'not-allowed',help:'help',zoomIn:'zoom-in',zoomOut:'zoom-out'};
 const hotspot={arrow:[5,3],pointer:[16,7],text:[16,16]};
 const cursorFor=(kind,pack=selected,size=cursorSize)=>{
   if(pack==='system')return fallback[kind]||'auto';
   const art=shapes(pack)[kind]||shapes(pack).arrow;
   const pos=hotspot[kind]||[16,16];
   return cursor(art,pos[0],pos[1],fallback[kind]||'auto',size);
 };
 const style=document.createElement('style');style.id='lolite-cursor-pack-css';document.head.appendChild(style);
 const uiStyle=document.createElement('style');uiStyle.id='lolite-cursor-ui-css';
 uiStyle.textContent=[
 '.lolite-cursor-section{margin:12px 0 16px;padding:18px!important;max-width:100%;box-sizing:border-box}',
 '.lolite-pack-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:12px 0}',
 '.lolite-pack-button{display:flex;align-items:center;gap:11px;min-height:70px;min-width:0;text-align:left;border:1px solid #39435b;border-radius:12px;padding:12px;background:#161e2d;color:#f4f7ff;cursor:pointer}',
 '.lolite-pack-button img{width:30px;height:30px;flex:0 0 30px;object-fit:contain}',
 '.lolite-pack-button.active{border-color:#69baff;background:#1b3550;box-shadow:inset 0 0 0 1px #69baff55}',
 '.lolite-pack-button:focus-visible,.lolite-size-button:focus-visible{outline:2px solid #8bd3ff;outline-offset:3px}',
 '.lolite-pack-button span{font-weight:650;overflow-wrap:anywhere}',
 '.lolite-cursor-controls{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:12px 0}',
 '.lolite-size-button{border:1px solid #37435a;border-radius:8px;color:#edf6ff;padding:8px 13px;background:#182335;cursor:pointer}',
 '.lolite-size-button.active{background:#244a70;border-color:#69baff}',
 '.lolite-cursor-preview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px;margin-top:10px}',
 '.lolite-cursor-preview{min-height:45px;display:flex;align-items:center;justify-content:center;text-align:center;border:1px solid #303d54;border-radius:9px;background:#111a2a;color:#d6e2fa;padding:9px;font-size:12px}',
 '.lolite-cursor-muted{color:#b8c4dd;font-size:12px;line-height:1.5;margin:8px 0}',
 '.window[data-lolite-cursor-handles="true"]{resize:none!important}',
 '.lolite-resize-edge{position:absolute;display:block;z-index:12;touch-action:none;background:transparent;pointer-events:auto}',
 '.lolite-resize-edge[data-lolite-resize="n"],.lolite-resize-edge[data-lolite-resize="s"]{cursor:ns-resize}',
 '.lolite-resize-edge[data-lolite-resize="e"],.lolite-resize-edge[data-lolite-resize="w"]{cursor:ew-resize}',
 '.lolite-resize-edge[data-lolite-resize="nw"],.lolite-resize-edge[data-lolite-resize="se"]{cursor:nwse-resize}',
 '.lolite-resize-edge[data-lolite-resize="ne"],.lolite-resize-edge[data-lolite-resize="sw"]{cursor:nesw-resize}',
 '.lolite-resize-edge[data-lolite-resize="n"]{top:0;left:12px;right:12px;height:8px}',
 '.lolite-resize-edge[data-lolite-resize="s"]{bottom:0;left:12px;right:12px;height:8px}',
 '.lolite-resize-edge[data-lolite-resize="e"]{right:0;top:12px;bottom:12px;width:8px}',
 '.lolite-resize-edge[data-lolite-resize="w"]{left:0;top:12px;bottom:12px;width:8px}',
 '.lolite-resize-edge[data-lolite-resize="ne"]{right:0;top:0;width:14px;height:14px}',
 '.lolite-resize-edge[data-lolite-resize="nw"]{left:0;top:0;width:14px;height:14px}',
 '.lolite-resize-edge[data-lolite-resize="se"]{right:0;bottom:0;width:14px;height:14px}',
 '.lolite-resize-edge[data-lolite-resize="sw"]{left:0;bottom:0;width:14px;height:14px}',
 '.window[data-old]:not([data-old=""])>.lolite-resize-edge,.mobile-mode .lolite-resize-edge,.tablet-mode .lolite-resize-edge{display:none!important}',
 '.window[data-lolite-cursor-handles="true"]{overflow:hidden}',
 'html[data-lolite-active-resize="n"],html[data-lolite-active-resize="n"] * ,html[data-lolite-active-resize="s"],html[data-lolite-active-resize="s"] *{cursor:ns-resize!important}',
 'html[data-lolite-active-resize="e"],html[data-lolite-active-resize="e"] * ,html[data-lolite-active-resize="w"],html[data-lolite-active-resize="w"] *{cursor:ew-resize!important}',
 'html[data-lolite-active-resize="nw"],html[data-lolite-active-resize="nw"] * ,html[data-lolite-active-resize="se"],html[data-lolite-active-resize="se"] *{cursor:nwse-resize!important}',
 'html[data-lolite-active-resize="ne"],html[data-lolite-active-resize="ne"] * ,html[data-lolite-active-resize="sw"],html[data-lolite-active-resize="sw"] *{cursor:nesw-resize!important}',
 '@media(pointer:coarse){.lolite-resize-edge{display:none!important}}'
 ].join('');
 document.head.appendChild(uiStyle);
 const cssRule=(selectors,kind)=>selectors+'{cursor:'+cursorFor(kind)+'!important}';
 function renderCursorStyles(){
   document.documentElement.classList.toggle('lolite-cursor-enabled',selected!=='system');
   if(selected==='system'){style.textContent='';return}
   style.textContent='@media(pointer:fine){'+[
    cssRule('html.lolite-cursor-enabled,html.lolite-cursor-enabled body,html.lolite-cursor-enabled *','arrow'),
    cssRule('html.lolite-cursor-enabled :is(a,button,select,summary,[role="button"],.desktop-icon,.lm-choice,.lm-device)','pointer'),
    cssRule('html.lolite-cursor-enabled :is(input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]),textarea,[contenteditable="true"])','text'),
    cssRule('html.lolite-cursor-enabled :is(canvas,.paint-app canvas,.crosshair-cursor,[data-tool="crosshair"])','crosshair'),
    cssRule('html.lolite-cursor-enabled :is(.titlebar,[draggable="true"])','grab'),
    cssRule('html.lolite-cursor-enabled :is(.titlebar:active,[draggable="true"]:active)','grabbing'),
    cssRule('html.lolite-cursor-enabled :is([aria-busy="true"],.loading,.loading-spinner)','progress'),
    cssRule('html.lolite-cursor-enabled :is([data-cursor="wait"],.cursor-wait)','wait'),
    cssRule('html.lolite-cursor-enabled :is(:disabled,[aria-disabled="true"])','unavailable'),
    cssRule('html.lolite-cursor-enabled :is([data-cursor="help"],.cursor-help)','help'),
    cssRule('html.lolite-cursor-enabled :is([data-cursor="zoom-in"],.cursor-zoom-in)','zoomIn'),
    cssRule('html.lolite-cursor-enabled :is([data-cursor="zoom-out"],.cursor-zoom-out)','zoomOut'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-resize="e"],[data-lolite-resize="w"],[data-lolite-preview="ew"],[data-resize="ew"])','ew'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-resize="n"],[data-lolite-resize="s"],[data-lolite-preview="ns"],[data-resize="ns"])','ns'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-resize="nw"],[data-lolite-resize="se"],[data-lolite-preview="nwse"],[data-resize="nwse"])','nwse'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-resize="ne"],[data-lolite-resize="sw"],[data-lolite-preview="nesw"],[data-resize="nesw"])','nesw'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="arrow"])','arrow'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="pointer"])','pointer'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="text"])','text'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="crosshair"])','crosshair'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="move"])','move'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="grab"])','grab'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="grabbing"])','grabbing'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="wait"])','wait'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="progress"])','progress'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="unavailable"])','unavailable'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="help"])','help'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="zoomIn"])','zoomIn'),
    cssRule('html.lolite-cursor-enabled :is([data-lolite-preview="zoomOut"])','zoomOut')
   ].join('')+(['n','s','e','w','ne','nw','se','sw'].map(direction=>{
     const kind=direction==='n'||direction==='s'?'ns':direction==='e'||direction==='w'?'ew':direction==='nw'||direction==='se'?'nwse':'nesw';
     const active='html.lolite-cursor-enabled[data-lolite-active-resize="'+direction+'"]';
     return cssRule(active+','+active+' *',kind);
   }).join(''))+'}';
 }
 function syncControls(){
   document.querySelectorAll('[data-lolite-pack]').forEach(el=>{
    const active=el.dataset.lolitePack===selected;
    el.classList.toggle('active',active);
    el.setAttribute('aria-pressed',String(active));
   });
   document.querySelectorAll('[data-lolite-size]').forEach(el=>{
    const active=Number(el.dataset.loliteSize)===cursorSize;
    el.classList.toggle('active',active);
    el.setAttribute('aria-pressed',String(active));
   });
   document.querySelectorAll('[data-lolite-cursor-status]').forEach(el=>el.textContent=(PACKS[selected]?.name||'System')+' · '+cursorSize+'px');
 }
 function choosePack(pack){
   if(pack!=='system'&&!PACKS[pack])return;
   selected=pack;save(PACK_KEY,selected);
   // Disable the previous generation's CSS so it cannot override a chosen pack.
   window.loliteApplyCursor?.('default');
   renderCursorStyles();syncControls();
 }
 function chooseSize(size){
   const n=Number(size);
   if(!sizes.includes(n))return;
   cursorSize=n;save(SIZE_KEY,String(n));renderCursorStyles();syncControls();
 }
 window.loliteSetCursorPack=choosePack;
 window.loliteSetCursorSize=chooseSize;
 window.LoliteCursors={choosePack,chooseSize,getPack:()=>selected,getSize:()=>cursorSize};
 const previews=[['arrow','Default'],['pointer','Click / link'],['text','Text'],['crosshair','Crosshair'],['grab','Grab'],['grabbing','Grabbing'],['move','Move'],['ew','Resize ↔'],['ns','Resize ↕'],['nwse','Resize ↘'],['nesw','Resize ↗'],['progress','Loading'],['wait','Wait'],['unavailable','Unavailable'],['help','Help'],['zoomIn','Zoom in'],['zoomOut','Zoom out']];
 function settingsCard(){
   const packButtons=Object.keys(PACKS).concat('system').map(pack=>{
     const label=PACKS[pack]?.name||'System';
     const icon=pack==='system'?'':('<img alt="" src="'+image(shapes(pack).arrow,32)+'">');
     return '<button type="button" data-lolite-pack="'+pack+'" aria-pressed="'+(pack===selected)+'" class="lolite-pack-button '+(pack===selected?'active':'')+'">'+icon+'<span>'+label+'</span></button>';
   }).join('');
   const sizeButtons=sizes.map(size=>'<button type="button" data-lolite-size="'+size+'" class="lolite-size-button '+(size===cursorSize?'active':'')+'" aria-pressed="'+(size===cursorSize)+'">'+size+' px</button>').join('');
   const previewButtons=previews.map(([kind,label])=>'<span class="lolite-cursor-preview" data-lolite-preview="'+kind+'">'+label+'</span>').join('');
   return '<section class="card lolite-cursor-section"><h3>Cursor Packs</h3><p class="lolite-cursor-muted">Change every Lolite cursor together. Select Classic, Glass, Neon, Retro or restore the original system cursor.</p><div class="lolite-pack-grid">'+packButtons+'</div><div class="lolite-cursor-controls"><strong>Cursor size</strong>'+sizeButtons+'<span class="lolite-cursor-muted" data-lolite-cursor-status></span></div><p class="lolite-cursor-muted">Move your mouse over each preview to try that cursor. Resize Lolite windows from their edges and corners.</p><div class="lolite-cursor-preview-grid">'+previewButtons+'</div></section>';
 }
 const previousPage=window.page;
 if(typeof previousPage==='function'){
   window.page=function(id){
     const html=previousPage.apply(this,arguments);
     if(id!=='settings')return html;
     const card=settingsCard();
     return html.includes('<h2>Settings</h2>')?html.replace('<h2>Settings</h2>','<h2>Settings</h2>'+card):card+html;
   };
 }
 document.addEventListener('click',event=>{
   const pack=event.target.closest('[data-lolite-pack]');
   if(pack){choosePack(pack.dataset.lolitePack);return}
   const size=event.target.closest('[data-lolite-size]');
   if(size)chooseSize(size.dataset.loliteSize);
 });
 function addResizeHandles(win){
   if(!(win instanceof HTMLElement)||!win.matches('.window')||win.dataset.loliteCursorHandles)return;
   win.dataset.loliteCursorHandles='true';
   for(const direction of ['n','s','e','w','ne','nw','se','sw']){
     const handle=document.createElement('span');
     handle.className='lolite-resize-edge';
     handle.dataset.loliteResize=direction;
     handle.setAttribute('aria-hidden','true');
     handle.addEventListener('pointerdown',event=>{
       if(event.button!==0||document.documentElement.classList.contains('mobile-mode')||document.documentElement.classList.contains('tablet-mode')||win.dataset.old)return;
       event.preventDefault();event.stopPropagation();
       window.LoliteWindowManager?.focus(win.dataset.windowId);
       window.LoliteMotion?.cancel(win);
       document.documentElement.dataset.loliteActiveResize=direction;
       const start={x:event.clientX,y:event.clientY,left:win.offsetLeft,top:win.offsetTop,width:win.offsetWidth,height:win.offsetHeight};
       const oldSelect=document.body.style.userSelect;
       document.body.style.userSelect='none';
       try{handle.setPointerCapture(event.pointerId)}catch{}
       const move=e=>{
         const dx=e.clientX-start.x,dy=e.clientY-start.y;
         const right=direction.includes('e'),left=direction.includes('w'),bottom=direction.includes('s'),top=direction.includes('n');
         const area=window.LoliteWindowManager?.bounds()||{left:0,top:0,width:innerWidth,height:innerHeight-64};
         const maxWidth=left?start.left+start.width-area.left:area.left+area.width-start.left;
         const maxHeight=top?start.top+start.height-area.top:area.top+area.height-start.top;
         const width=Math.max(Math.min(320,maxWidth),Math.min(maxWidth,start.width+(right?dx:left?-dx:0)));
         const height=Math.max(Math.min(220,maxHeight),Math.min(maxHeight,start.height+(bottom?dy:top?-dy:0)));
         if(left)win.style.left=(start.left+start.width-width)+'px';
         if(top)win.style.top=(start.top+start.height-height)+'px';
         if(left||right)win.style.width=width+'px';
         if(top||bottom)win.style.height=height+'px';
       };
       const stop=e=>{
         handle.removeEventListener('pointermove',move);
         handle.removeEventListener('pointerup',stop);
         handle.removeEventListener('pointercancel',stop);
         document.body.style.userSelect=oldSelect;
         delete document.documentElement.dataset.loliteActiveResize;
         if(e.type!=='pointercancel'&&(win.offsetWidth!==start.width||win.offsetHeight!==start.height))window.dispatchEvent(new CustomEvent('lolite:windowchange',{detail:{type:'resize',id:win.dataset.windowId}}));
       };
       handle.addEventListener('pointermove',move);
       handle.addEventListener('pointerup',stop);
       handle.addEventListener('pointercancel',stop);
     });
     win.appendChild(handle);
   }
 }
 function initWindowHandles(){
   const windows=document.querySelector('#windows');
   if(!windows)return;
   windows.querySelectorAll('.window').forEach(addResizeHandles);
   new MutationObserver(mutations=>{
     for(const mutation of mutations)for(const node of mutation.addedNodes)if(node instanceof HTMLElement){
       if(node.matches('.window'))addResizeHandles(node);
     }
   }).observe(windows,{childList:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initWindowHandles,{once:true});else initWindowHandles();
 choosePack(selected);
})();
