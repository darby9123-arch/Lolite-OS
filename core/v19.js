/* Lolite OS 1.9: window snapping and multitasking helpers. */
(()=>{
 const css=document.createElement('style');css.textContent=`
 .lolite-snap-preview{position:fixed;z-index:9998;pointer-events:none;border:2px solid var(--accent);background:#8b5cf622;border-radius:14px;box-shadow:0 12px 40px #0006;transition:all .12s ease;display:none}
 .window.lolite-snapped{transition:left .16s ease,top .16s ease,width .16s ease,height .16s ease}
 .window.lolite-snapped .window-resize-handle{display:none}
 @media(prefers-reduced-motion:reduce){.lolite-snap-preview,.window.lolite-snapped{transition:none}}
 `;document.head.appendChild(css);
 const preview=document.createElement('div');preview.className='lolite-snap-preview';document.body.appendChild(preview);
 const oldOpen=window.openApp;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const snapFor=(win,x,y)=>{
   const edge=24, top=0, bottom=76, W=innerWidth, H=innerHeight-bottom;
   let type='';
   if(x<=edge)type='left';else if(x>=W-edge)type='right';else if(y<=edge)type='max';
   if(!type){preview.style.display='none';return null}
   let r;
   if(type==='left')r={left:8,top:8,width:Math.max(280,Math.floor(W/2)-12),height:Math.max(190,H-16)};
   if(type==='right')r={left:Math.ceil(W/2)+4,top:8,width:Math.max(280,Math.floor(W/2)-12),height:Math.max(190,H-16)};
   if(type==='max')r={left:8,top:8,width:Math.max(280,W-16),height:Math.max(190,H-16)};
   preview.style.display='block';preview.style.left=r.left+'px';preview.style.top=r.top+'px';preview.style.width=r.width+'px';preview.style.height=r.height+'px';
   return {type,r};
 };
 const install=win=>{
   if(!win||win.dataset.snapReady)return;win.dataset.snapReady='1';
   const bar=win.querySelector('.titlebar');if(!bar)return;
   bar.addEventListener('dblclick',e=>{
     if(e.target.closest('button'))return;
     const was=win.dataset.loliteMax==='1';
     if(was){win.style.left=win.dataset.prevLeft||'80px';win.style.top=win.dataset.prevTop||'60px';win.style.width=win.dataset.prevWidth||'650px';win.style.height=win.dataset.prevHeight||'450px';win.dataset.loliteMax='0';win.classList.remove('lolite-snapped');return}
     win.dataset.prevLeft=win.style.left;win.dataset.prevTop=win.style.top;win.dataset.prevWidth=win.style.width;win.dataset.prevHeight=win.style.height;
     const r={left:8,top:8,width:innerWidth-16,height:innerHeight-84};win.style.left=r.left+'px';win.style.top=r.top+'px';win.style.width=r.width+'px';win.style.height=r.height+'px';win.dataset.loliteMax='1';win.classList.add('lolite-snapped');
   });
   bar.addEventListener('pointerdown',()=>{
     const move=e=>{const s=snapFor(win,e.clientX,e.clientY);win.__loliteSnap=s};
     const up=()=>{const s=win.__loliteSnap;preview.style.display='none';removeEventListener('pointermove',move);removeEventListener('pointerup',up);if(!s)return;win.dataset.prevLeft=win.style.left;win.dataset.prevTop=win.style.top;win.dataset.prevWidth=win.style.width;win.dataset.prevHeight=win.style.height;win.style.left=s.r.left+'px';win.style.top=s.r.top+'px';win.style.width=s.r.width+'px';win.style.height=s.r.height+'px';win.dataset.loliteMax=s.type==='max'?'1':'0';win.classList.add('lolite-snapped');};
     addEventListener('pointermove',move);addEventListener('pointerup',up);
   });
 };
 window.openApp=function(id,title,w,h){oldOpen?.(id,title,w,h);setTimeout(()=>{const wins=[...document.querySelectorAll('.window')];install(wins.find(x=>x.querySelector('.titlebar strong')?.textContent===title)||wins[wins.length-1])},30)};
 const prepare=()=>document.querySelectorAll('.window').forEach(install);prepare();setTimeout(prepare,400);setTimeout(prepare,1200);
 window.addEventListener('resize',()=>{document.querySelectorAll('.window.lolite-snapped').forEach(win=>{if(win.dataset.loliteMax==='1'){win.style.left='8px';win.style.top='8px';win.style.width=(innerWidth-16)+'px';win.style.height=(innerHeight-84)+'px'}})});
})();
