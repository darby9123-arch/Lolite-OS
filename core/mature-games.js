/* Lolite OS 1.5 mature-game gate: adult/parent approval, never age-only unlocking. */
(()=>{
 const MATURE=['Granny Original','GTA III','GTA Vice City'];
 const KEY='lolite-mature-approved';
 const approved=()=>localStorage.getItem(KEY)==='true';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const gate=(game,launch)=>{
  if(!MATURE.includes(game)||approved()){launch();return true}
  const root=document.createElement('div');root.className='mature-gate-overlay';root.innerHTML=`<div class="mature-gate"><div class="mature-badge">MATURE</div><h2>Adult approval required</h2><p><b>${esc(game)}</b> is marked as a mature game in Lolite OS.</p><p class="muted">Entering an age by itself cannot unlock mature content. An adult/parent must approve access on this device.</p><label>Adult/parent approval <input id="matureConfirm" type="checkbox"> I am an adult/parent approving this setting</label><div class="mature-actions"><button id="matureCancel" class="soft">Cancel</button><button id="matureApprove" class="primary" disabled>Approve</button></div></div>`;
  document.body.appendChild(root);const cb=root.querySelector('#matureConfirm'),ok=root.querySelector('#matureApprove');cb.onchange=()=>ok.disabled=!cb.checked;root.querySelector('#matureCancel').onclick=()=>root.remove();ok.onclick=()=>{localStorage.setItem(KEY,'true');root.remove();launch()};return false;
 };
 window.LoliteMatureGames={MATURE,approved,gate,reset:()=>localStorage.removeItem(KEY)};
 const oldLaunch=window.launchGame;
 if(oldLaunch)window.launchGame=function(game){return gate(game,()=>oldLaunch(game))};
 const oldPage=window.page;
 window.page=function(id){const html=oldPage(id);if(id!=='games')return html;return html.replace(/<div class="card"><h3>(?:🎮\s*)?(Granny Original|GTA III|GTA Vice City)<\/h3>/g,(m,g)=>m.replace('</h3>','</h3><span class="mature-badge">MATURE</span>'))};
 const st=document.createElement('style');st.textContent=`.mature-badge{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.08em;padding:4px 7px;border-radius:999px;border:1px solid #6b4b7d;background:#25182d;color:#e8c8f5}.mature-gate-overlay{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:rgba(5,3,10,.72);backdrop-filter:blur(8px)}.mature-gate{width:min(480px,calc(100vw - 40px));box-sizing:border-box;padding:24px;border:1px solid #30274d;border-radius:18px;background:#121022;color:#f7f3ff;box-shadow:0 20px 60px rgba(0,0,0,.45)}.mature-gate h2{margin:12px 0 8px}.mature-gate p{line-height:1.5}.mature-gate label{display:flex;gap:9px;align-items:flex-start;margin:18px 0}.mature-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}.mature-gate button{min-width:90px}`;document.head.appendChild(st);
})();
