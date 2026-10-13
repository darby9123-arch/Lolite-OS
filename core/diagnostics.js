/* Temporary Lolite OS startup diagnostics. Safe to remove after diagnosis. */
(()=> {
 const state={startedAt:new Date().toISOString(),steps:[],errors:[],scripts:[]};
 const short=(v)=>String(v??'').slice(0,500);
 function mark(label,detail=''){state.steps.push({time:new Date().toLocaleTimeString(),label,detail:short(detail)});render()}
 function error(label,detail=''){state.errors.push({time:new Date().toLocaleTimeString(),label,detail:short(detail)});render()}
 function report(){
  return ['Lolite OS startup diagnostic', 'Started: '+state.startedAt, '',
   'CHECKPOINTS:',...(state.steps.length?state.steps.map(x=>x.time+' — '+x.label+(x.detail?' — '+x.detail:'')):['No checkpoints reached']),
   '', 'ERRORS:',...(state.errors.length?state.errors.map(x=>x.time+' — '+x.label+(x.detail?' — '+x.detail:'')):['No browser errors captured']),
   '', 'PAGE: '+location.href, 'READY STATE: '+document.readyState,
   'DESKTOP: '+!!document.getElementById('desktop'), 'ICONS: '+(document.querySelectorAll('#icons .desktop-icon').length),
   'WINDOWS: '+(document.querySelectorAll('#windows .window').length),
   'SCRIPTS: '+Array.from(document.scripts).map(s=>s.src?new URL(s.src,location.href).pathname:'inline script').join(', ')
  ].join('\n')
 }
 function render(){
  let p=document.getElementById('lolite-diagnostic-panel');if(!p)return;
  const summary=p.querySelector('#lolite-diagnostic-summary');
  if(summary)summary.textContent='Checkpoints: '+state.steps.length+' · Errors: '+state.errors.length+' · Icons: '+document.querySelectorAll('#icons .desktop-icon').length+' · Windows: '+document.querySelectorAll('#windows .window').length;
  const list=p.querySelector('#lolite-diagnostic-log');
  if(list)list.textContent=[...state.steps.map(x=>'✓ '+x.label+(x.detail?' — '+x.detail:'')),...state.errors.map(x=>'ERROR: '+x.label+(x.detail?' — '+x.detail:''))].slice(-14).join('\n')||'Waiting for startup checkpoints…';
  const area=p.querySelector('#lolite-diagnostic-report');if(area)area.value=report();
 }
 function init(){
  if(document.getElementById('lolite-diagnostic-panel'))return;
  const p=document.createElement('section');p.id='lolite-diagnostic-panel';
  p.style.cssText='position:fixed;right:10px;bottom:10px;z-index:2147483647;width:min(440px,calc(100vw - 20px));max-height:68vh;overflow:auto;background:#111827;color:#f3f4f6;border:2px solid #a78bfa;border-radius:12px;padding:13px;font:12px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;box-shadow:0 8px 35px #000b;box-sizing:border-box';
  p.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><strong style="font:700 14px system-ui">Lolite startup diagnostics</strong><button id="lolite-diagnostic-hide" type="button" style="padding:5px 8px;background:#374151;color:white;border:1px solid #6b7280;border-radius:6px">Hide</button></div><p id="lolite-diagnostic-summary" style="margin:8px 0;color:#c4b5fd"></p><pre id="lolite-diagnostic-log" style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:180px;overflow:auto;background:#030712;padding:9px;border-radius:7px"></pre><button id="lolite-diagnostic-showreport" type="button" style="padding:7px 9px;margin-right:6px;background:#4c1d95;color:white;border:0;border-radius:6px">Show full report</button><button id="lolite-diagnostic-reload" type="button" style="padding:7px 9px;background:#374151;color:white;border:1px solid #6b7280;border-radius:6px">Reload</button><textarea id="lolite-diagnostic-report" readonly aria-label="Diagnostic report" style="display:none;width:100%;height:180px;margin-top:8px;box-sizing:border-box;background:#030712;color:#e5e7eb;border:1px solid #4b5563;padding:8px;white-space:pre;overflow:auto"></textarea><p style="color:#9ca3af;margin:8px 0 0">No code is changed by this panel. Use “Show full report” and copy the text if asked.</p>';
  document.body.appendChild(p);
  p.querySelector('#lolite-diagnostic-hide').onclick=()=>p.remove();
  p.querySelector('#lolite-diagnostic-showreport').onclick=()=>{const a=p.querySelector('#lolite-diagnostic-report');a.style.display=a.style.display==='none'?'block':'none';a.value=report();if(a.style.display==='block'){a.focus();a.select()}};
  p.querySelector('#lolite-diagnostic-reload').onclick=()=>location.reload();
  mark('Diagnostic script loaded');
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mark('DOMContentLoaded'));else mark('DOM already ready');
  render();
 }
 window.__LoliteDiag={mark,error,report};
 window.addEventListener('error',e=>error('Browser error',short(e.message)+' | '+short(e.filename)+':'+e.lineno+':'+e.colno));
 window.addEventListener('unhandledrejection',e=>error('Unhandled promise rejection',e.reason?.stack||e.reason?.message||e.reason));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 setTimeout(()=>{if(!document.getElementById('lolite-diagnostic-panel'))init();mark('Diagnostic watchdog ran')},1500);
})();