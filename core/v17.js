/* Lolite OS 1.7: clean X-only window controls and reliable custom window resizing. */
(()=>{
 const css=document.createElement('style');css.textContent=`
 .window{resize:none!important;overflow:hidden;min-width:320px;min-height:190px}
 .window .controls{margin-left:10px;gap:0}
 .window .controls .min,.window .controls .max{display:none!important}
 .window .controls .close{width:32px!important;height:32px!important;border-radius:8px!important;background:transparent!important;position:relative;display:grid;place-items:center;border:1px solid transparent!important}
 .window .controls .close::before{content:'×';color:var(--text);font-size:24px;line-height:1;font-weight:400;position:absolute;top:1px;left:0;right:0;text-align:center}
 .window .controls .close:hover{background:#ffffff12!important;border-color:#ffffff18!important}
 .window .controls .close:active{background:#ffffff1c!important}
 .window-resize-handle{position:absolute;right:0;bottom:0;width:18px;height:18px;cursor:nwse-resize;z-index:8;border-radius:4px 0 0 0;background:linear-gradient(135deg,transparent 0 45%,#ffffff38 46% 52%,transparent 53% 65%,#ffffff25 66% 72%,transparent 73%)}
 .window-resize-handle:hover{background:linear-gradient(135deg,transparent 0 45%,var(--accent) 46% 52%,transparent 53% 65%,var(--accent) 66% 72%,transparent 73%)}
 .window.is-resizing{user-select:none}
 .window.is-resizing .titlebar{cursor:default}
 @media(max-width:700px){.window-resize-handle{width:22px;height:22px}.window{min-width:260px;min-height:180px}}
 `;document.head.appendChild(css);
 const oldOpen=window.openApp;
 function installResize(win){
   if(!win||win.querySelector('.window-resize-handle'))return;
   const handle=document.createElement('div');handle.className='window-resize-handle';handle.setAttribute('aria-label','Resize window');handle.title='Resize window';win.appendChild(handle);
   handle.addEventListener('pointerdown',ev=>{
     ev.preventDefault();ev.stopPropagation();
     const startX=ev.clientX,startY=ev.clientY,startW=win.offsetWidth,startH=win.offsetHeight;
     const minW=Math.min(320,innerWidth-20),minH=Math.min(190,innerHeight-100);
     const move=e=>{
       const maxW=Math.max(minW,innerWidth-win.offsetLeft-8);
       const maxH=Math.max(minH,innerHeight-win.offsetTop-76);
       const w=Math.max(minW,Math.min(maxW,startW+e.clientX-startX));
       const h=Math.max(minH,Math.min(maxH,startH+e.clientY-startY));
       win.style.width=w+'px';win.style.height=h+'px';
     };
     const up=()=>{win.classList.remove('is-resizing');removeEventListener('pointermove',move);removeEventListener('pointerup',up)};
     win.classList.add('is-resizing');addEventListener('pointermove',move);addEventListener('pointerup',up);
   });
 }
 window.openApp=function(id,title,w,h){
   oldOpen?.(id,title,w,h);
   setTimeout(()=>{
     const windows=[...document.querySelectorAll('.window')];
     const win=windows.find(x=>x.querySelector('.titlebar strong')?.textContent===title) || windows[windows.length-1];
     if(!win)return;
     const min=win.querySelector('.controls .min'),max=win.querySelector('.controls .max');
     if(min)min.style.display='none';if(max)max.style.display='none';
     installResize(win);
   },20);
 };
 const prepare=()=>document.querySelectorAll('.window').forEach(installResize);
 prepare();setTimeout(prepare,300);setTimeout(prepare,1000);
})();
