/* Lolite OS 2.3 — desktop polish, window reliability and workspace UX */
(()=>{
 const V='2.3';
 const $=s=>document.querySelector(s);
 const css=`
 .v23-desktop *{box-sizing:border-box}
 .v23-desktop .desktop-icon{transition:transform .14s ease,background .14s ease,box-shadow .14s ease}
 .v23-desktop .desktop-icon:hover{background:#ffffff10;transform:translateY(-1px)}
 .v23-desktop .desktop-icon.v23-selected{background:#8b5cf62b;box-shadow:inset 0 0 0 1px #a78bfa55}
 .v23-desktop .window{box-shadow:0 24px 70px #0009,0 0 0 1px #ffffff05;transition:box-shadow .14s ease}
 .v23-desktop .window.v23-active{box-shadow:0 30px 90px #000b,0 0 0 1px #8b5cf62b}
 .v23-desktop .titlebar{height:46px;background:#ffffff03}
 .v23-desktop .titlebar strong{letter-spacing:.1px}
 .v23-desktop .controls button{opacity:.9;transition:transform .12s ease,opacity .12s ease}
 .v23-desktop .controls button:hover{opacity:1;transform:scale(1.12)}
 .v23-desktop #taskbar{box-shadow:0 12px 40px #0008;border-color:#ffffff12}
 .v23-desktop .taskwin{border:1px solid transparent;transition:background .14s ease,border-color .14s ease}
 .v23-desktop .taskwin:hover,.v23-desktop .taskwin.v23-task-active{background:#ffffff10;border-color:#ffffff12}
 .v23-desktop #toast{position:fixed;left:50%;bottom:82px;transform:translateX(-50%);z-index:2000;display:grid;gap:7px;pointer-events:none}
 .v23-desktop .v23-toast{padding:10px 14px;border:1px solid #ffffff18;background:#151126ee;border-radius:11px;box-shadow:0 16px 45px #0009;color:#f7f3ff;font-size:13px;animation:v23Toast .18s ease-out}
 @keyframes v23Toast{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
 @media(max-width:700px){.v23-desktop .window{min-width:0!important;max-width:calc(100vw - 18px)}.v23-desktop #taskbar{left:6px;right:6px;bottom:6px}.v23-desktop .desktop-icon{width:88px}}
 @media(prefers-reduced-motion:reduce){.v23-desktop *{animation:none!important;transition:none!important}}
 `;
 function injectStyle(){if($('#v23-style'))return;const s=document.createElement('style');s.id='v23-style';s.textContent=css;document.head.appendChild(s);document.documentElement.classList.add('v23-desktop')}
 function toast(message){const box=$('#toast');if(!box)return;const t=document.createElement('div');t.className='v23-toast';t.textContent=message;box.appendChild(t);setTimeout(()=>t.remove(),1900)}
 function desktopSelection(){document.addEventListener('click',e=>{if(e.target.closest('.window,#taskbar,#start,#searchPanel,.lolite-context'))return;if(!e.target.closest('.desktop-icon'))document.querySelectorAll('.desktop-icon.v23-selected').forEach(x=>x.classList.remove('v23-selected'))});document.addEventListener('click',e=>{const icon=e.target.closest('.desktop-icon');if(!icon)return;document.querySelectorAll('.desktop-icon.v23-selected').forEach(x=>x.classList.remove('v23-selected'));icon.classList.add('v23-selected')})}
 function improveWindows(){if(typeof window.openApp!=='function')return;const originalOpen=window.openApp;if(originalOpen.__v23)return;const wrapped=function(id,title,w,h){originalOpen(id,title,w,h);const item=state.windows?.[id];if(!item?.el)return;const el=item.el;el.addEventListener('pointerdown',()=>activate(id),{passive:true});const tb=el.querySelector('.titlebar');if(tb){tb.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;maxWin(id)})}activate(id);clamp(el)};wrapped.__v23=true;window.openApp=wrapped;
 const oldRestore=window.restoreWin;window.restoreWin=function(id){if(oldRestore)oldRestore(id);activate(id);const el=state.windows?.[id]?.el;if(el)clamp(el)};
 const oldMax=window.maxWin;window.maxWin=function(id){if(oldMax)oldMax(id);const el=state.windows?.[id]?.el;if(el){el.classList.toggle('v23-maximized',!!el.dataset.old);activate(id)}};
 const oldClose=window.closeWin;window.closeWin=function(id){if(oldClose)oldClose(id);setTimeout(syncTasks,0)};
 function activate(id){const item=state.windows?.[id];if(!item)return;state.z=Number(state.z||10)+1;item.el.style.zIndex=state.z;document.querySelectorAll('.window.v23-active').forEach(x=>x.classList.remove('v23-active'));item.el.classList.add('v23-active');syncTasks()}
 function clamp(el){if(!el||el.style.display==='none')return;const r=el.getBoundingClientRect();const maxX=Math.max(8,innerWidth-r.width-8),maxY=Math.max(8,innerHeight-r.height-76);if(parseFloat(el.style.left)>maxX)el.style.left=maxX+'px';if(parseFloat(el.style.top)>maxY)el.style.top=maxY+'px';if(parseFloat(el.style.left)<0)el.style.left='8px';if(parseFloat(el.style.top)<0)el.style.top='8px'}
 function syncTasks(){document.querySelectorAll('#tasks .taskwin').forEach(b=>{const id=b.id.replace(/^task-/,'');const el=state.windows?.[id]?.el;b.classList.toggle('v23-task-active',!!el&&el.style.display!=='none'&&el.classList.contains('v23-active'))})}
 }
 window.LoliteV23={version:V,toast,refreshTasks:()=>document.querySelectorAll('#tasks .taskwin').forEach(b=>{const id=b.id.replace(/^task-/,'');const el=state.windows?.[id]?.el;b.classList.toggle('v23-task-active',!!el&&el.style.display!=='none'&&el.classList.contains('v23-active'))})};
 window.addEventListener('resize',()=>document.querySelectorAll('.window').forEach(el=>{if(el.style.display==='none')return;const r=el.getBoundingClientRect();const maxX=Math.max(8,innerWidth-r.width-8),maxY=Math.max(8,innerHeight-r.height-76);if(parseFloat(el.style.left)>maxX)el.style.left=maxX+'px';if(parseFloat(el.style.top)>maxY)el.style.top=maxY+'px'}));
 function taskbarClock(){const c=$('#clock');if(!c)return;const update=()=>{const n=new Date();c.textContent=n.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+'  '+n.toLocaleDateString([], {day:'numeric',month:'short'});};update()}
 function polishStart(){const b=$('#startBtn');if(b){b.title='Start';b.setAttribute('aria-label','Open Start menu')}const s=$('#searchBtn');if(s){s.title='Search';s.setAttribute('aria-label','Search Lolite OS')}const set=$('#settingsBtn');if(set){set.title='Settings';set.setAttribute('aria-label','Open Settings')}}
 function boot(){injectStyle();polishStart();desktopSelection();improveWindows();taskbarClock();setTimeout(()=>toast('Lolite OS 2.3 ready'),900)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,350));else setTimeout(boot,350);
})();
