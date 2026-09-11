/* Lolite OS 1.4: remove broken taskbar pinning, fix layout collisions, and provide a real Scramjet launcher. */
(()=>{
 const SCRAMJET_URL='https://scramjet.mercurywork.shop/';
 localStorage.removeItem('lolitePins');
 const style=document.createElement('style');
 style.textContent=`
#windows{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:20}
#windows .window{pointer-events:auto;max-width:calc(100vw - 24px);max-height:calc(100vh - 84px);box-sizing:border-box}
#windows .window .content{box-sizing:border-box;min-width:0;min-height:0;overflow:auto;overscroll-behavior:contain}
.titlebar{min-height:42px;box-sizing:border-box;display:flex;align-items:center;gap:10px}
.titlebar strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.controls{margin-left:auto;flex:0 0 auto}
.tool-head,.game-hero,.html-game-head,.world-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.tool-actions,.settings-tabs,.world-tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cards,.widget-grid,.html-game-grid{grid-template-columns:repeat(auto-fit,minmax(210px,1fr));align-items:start}
.card{min-width:0;box-sizing:border-box;overflow:hidden}.card>*{max-width:100%}.notepad{box-sizing:border-box;min-height:320px;resize:vertical}
#taskbar{z-index:1000;box-sizing:border-box}#tasks{min-width:0;max-width:min(60vw,760px);overflow-x:auto;overflow-y:hidden;display:flex;gap:6px;scrollbar-width:thin}
#tasks .taskwin{flex:0 1 auto;min-width:70px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pinned-task,.lolite-context{display:none!important}
.scramjet-app{height:100%;display:flex;flex-direction:column;gap:12px}.scramjet-frame{width:100%;flex:1 1 auto;min-height:420px;border:0;border-radius:14px;background:#05030a}.scramjet-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
@media(max-width:760px){#tasks{max-width:38vw}.window{left:12px!important;top:12px!important;width:calc(100vw - 24px)!important;height:calc(100vh - 84px)!important}.tool-actions{width:100%}.scramjet-frame{min-height:360px}}
`;
 document.head.appendChild(style);
 document.addEventListener('contextmenu',e=>{if(e.target.closest('.desktop-icon,.taskwin')){e.preventDefault();document.querySelector('.lolite-context')?.remove()}},true);
 const cleanup=()=>{document.querySelectorAll('.pinned-task,.lolite-context').forEach(x=>x.remove());document.querySelectorAll('[data-settings="taskbar"]').forEach(x=>x.remove())};
 new MutationObserver(cleanup).observe(document.body,{childList:true,subtree:true});cleanup();
 const oldPage=window.page;
 const scramjetPage=()=>`<div class="tool-app scramjet-app"><div class="game-hero"><div><div class="muted">REAL SCRAMJET WEB APP</div><h2>Scramjet</h2><p class="muted">Lolite now launches the actual MercuryWorkshop Scramjet web app instead of showing a fake runtime status.</p></div><div class="scramjet-actions"><button class="primary" id="scramjetOpen">Open Scramjet</button><button class="soft" id="scramjetReload">Reload</button></div></div><div class="card"><b>Embedded Scramjet</b><p class="muted">The runtime is hosted by the upstream Scramjet project. If your browser blocks cross-origin embedding, use Open Scramjet to launch the official app directly.</p></div><iframe class="scramjet-frame" id="scramjetFrame" title="Scramjet" src="${SCRAMJET_URL}" loading="lazy" allow="fullscreen"></iframe></div>`;
 window.page=function(id){return id==='scramjet'?scramjetPage():oldPage(id)};
 const oldOpen=window.openApp;
 window.openApp=function(id,title,w,h){oldOpen(id,title,w,h);if(id==='scramjet')setTimeout(()=>{const c=state.windows[id]?.el.querySelector('.content');if(!c)return;c.innerHTML=window.page('scramjet');const open=c.querySelector('#scramjetOpen');const reload=c.querySelector('#scramjetReload');const frame=c.querySelector('#scramjetFrame');open.onclick=()=>window.open(SCRAMJET_URL,'_blank','noopener,noreferrer');reload.onclick=()=>{frame.src=SCRAMJET_URL}},40)};
 setTimeout(cleanup,250);setTimeout(cleanup,1200);
})();
