/* Temporary Lolite OS startup diagnostics. Safe to remove after diagnosis. */
(()=> {
 const state={startedAt:new Date().toISOString(),steps:[],errors:[]};
 const short=v=>String(v??'').slice(0,500);
 function report(){
  return ['Lolite OS startup diagnostic','Started: '+state.startedAt,'',
   'CHECKPOINTS:',...(state.steps.length?state.steps.map(x=>x.time+' — '+x.label+(x.detail?' — '+x.detail:'')):['No checkpoints reached']),
   '','ERRORS:',...(state.errors.length?state.errors.map(x=>x.time+' — '+x.label+(x.detail?' — '+x.detail:'')):['No browser errors captured']),
   '','PAGE: '+location.href,'READY STATE: '+document.readyState,
   'DESKTOP: '+!!document.getElementById('desktop'),
   'ICONS: '+document.querySelectorAll('#icons .desktop-icon').length,
   'ICON ELEMENTS: '+(document.getElementById('icons')?.children.length??'missing'),
   'WINDOWS: '+document.querySelectorAll('#windows .window').length,
   'SCRIPTS:',...Array.from(document.scripts).map(s=>s.src?new URL(s.src,location.href).pathname:'inline script')
  ].join('\n');
 }
 function render(){
  const p=document.getElementById('lolite-diagnostic-panel');if(!p)return;
  const summary=p.querySelector('#lolite-diagnostic-summary');
  if(summary)summary.textContent='Checkpoints: '+state.steps.length+' · Errors: '+state.errors.length+' · Icon elements: '+(document.getElementById('icons')?.children.length??'missing')+' · Windows: '+document.querySelectorAll('#windows .window').length;
  const area=p.querySelector('#lolite-diagnostic-report');if(area)area.value=report();
 }
 function mark(label,detail=''){state.steps.push({time:new Date().toLocaleTimeString(),label,detail:short(detail)});render();}
 function error(label,detail=''){state.errors.push({time:new Date().toLocaleTimeString(),label,detail:short(detail)});render();}
 function init(){
  if(document.getElementById('lolite-diagnostic-panel'))return;
  const p=document.createElement('section');p.id='lolite-diagnostic-panel';
  p.style.cssText='position:fixed;left:10px;right:10px;bottom:10px;z-index:2147483647;max-width:700px;max-height:72vh;overflow:auto;background:#111827;color:#f3f4f6;border:2px solid #a78bfa;border-radius:10px;padding:12px;font:12px/1.45 ui-monospace,Consolas,monospace;box-shadow:0 8px 35px #000b;box-sizing:border-box;pointer-events:auto';
  p.innerHTML='<strong style="font:700 14px system-ui">Lolite startup diagnostic — no buttons needed</strong><p id="lolite-diagnostic-summary" style="margin:8px 0;color:#c4b5fd"></p><p style="margin:6px 0">Click inside the report, press Ctrl+A, then Ctrl+C, and paste it into ChatGPT.</p><textarea id="lolite-diagnostic-report" readonly aria-label="Diagnostic report" style="display:block;width:100%;height:260px;box-sizing:border-box;background:#030712;color:#e5e7eb;border:1px solid #4b5563;padding:8px;white-space:pre;overflow:auto;user-select:text;pointer-events:auto"></textarea>';
  document.body.appendChild(p);mark('Diagnostic script loaded');
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mark('DOMContentLoaded'));else mark('DOM already ready');
  render();
 }
 window.__LoliteDiag={mark,error,report};
 window.addEventListener('error',e=>error('Browser error',short(e.message)+' | '+short(e.filename)+':'+e.lineno+':'+e.colno));
 window.addEventListener('unhandledrejection',e=>error('Unhandled promise rejection',e.reason?.stack||e.reason?.message||e.reason));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 setTimeout(()=>{if(!document.getElementById('lolite-diagnostic-panel'))init();mark('Diagnostic watchdog ran')},1500);
})();