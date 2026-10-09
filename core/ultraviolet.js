/* Lolite Ultraviolet — optional proxy browser alongside the existing Lolite Browser/Scramjet setup. */
(()=>{
 const css=`.lolite-uv{height:100%;margin:-18px;background:#0c1018;color:#edf2f8;display:flex;flex-direction:column}.uv-toolbar{display:flex;gap:8px;align-items:center;padding:11px;background:#141a24;border-bottom:1px solid #2b3544}.uv-toolbar input{min-width:0;flex:1;padding:10px 12px;border:1px solid #344052;border-radius:9px;background:#0b111a;color:#fff;outline:none}.uv-toolbar button,.uv-go{padding:9px 13px;border:1px solid #38465a;border-radius:9px;background:#202a39;color:#fff;cursor:pointer}.uv-toolbar button:hover,.uv-go:hover{background:#303d51}.uv-frame{flex:1;width:100%;border:0;background:white}.uv-home{flex:1;display:grid;place-items:center;text-align:center;padding:24px;background:radial-gradient(ellipse at 50% 25%,#29244f,#0c1018 68%)}.uv-home h2{font-size:30px;margin:0 0 8px}.uv-home p,.uv-note{color:#9ba8ba;line-height:1.5}.uv-home form{display:flex;gap:8px;max-width:650px;width:min(90vw,650px);margin-top:20px}.uv-home input{min-width:0;flex:1;padding:13px;border:1px solid #37445a;border-radius:10px;background:#151c28;color:#fff}.uv-status{padding:9px 14px;font-size:12px;color:#aab7c9;border-top:1px solid #283242}.uv-error{color:#ffb9bd;white-space:pre-wrap;overflow-wrap:anywhere}`;
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const loadScript=src=>new Promise((resolve,reject)=>{const old=document.querySelector('script[data-lolite-uv="'+src+'"]');if(old){if(old.dataset.loaded==='yes')return resolve();old.addEventListener('load',resolve,{once:true});old.addEventListener('error',reject,{once:true});return}const s=document.createElement('script');s.src=src;s.dataset.loliteUv=src;s.onload=()=>{s.dataset.loaded='yes';resolve()};s.onerror=()=>reject(new Error('Could not load '+src));document.head.appendChild(s)});
 const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const normalize=input=>{let v=input.trim();if(!v)return '';try{return new URL(v).href}catch{}try{const u=new URL('https://'+v);if(u.hostname.includes('.'))return u.href}catch{}return 'https://www.google.com/search?q='+encodeURIComponent(v)};
 async function navigate(value){
  const root=document.querySelector('#windows .window.active .content')||document.querySelector('#windows .window:last-child .content');
  if(!root)return;
  const address=root.querySelector('#loliteUvAddress');const status=root.querySelector('#loliteUvStatus');const frame=root.querySelector('#loliteUvFrame');const err=root.querySelector('#loliteUvError');
  const url=normalize(value);if(!url)return;
  if(address)address.value=url;if(err)err.textContent='';if(status)status.textContent='Starting Ultraviolet…';
  try{
   if(!('serviceWorker' in navigator))throw new Error('This browser does not support service workers.');
   if(location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1')throw new Error('Ultraviolet requires HTTPS and a server configured for its proxy routes. GitHub Pages alone does not provide the required proxy backend.');
   await loadScript('/baremux/index.js');await loadScript('/uv/uv.bundle.js');await loadScript('/uv/uv.config.js');
   if(!window.__uv$config||!window.BareMux)throw new Error('Ultraviolet runtime files are missing. Install the server dependencies and run the Lolite Node server.');
   await navigator.serviceWorker.register('/uv/sw.js');
   const connection=new window.BareMux.BareMuxConnection('/baremux/worker.js');
   const wispUrl=(location.protocol==='https:'?'wss://':'ws://')+location.host+'/wisp/';
   if(await connection.getTransport()!=='/epoxy/index.mjs')await connection.setTransport('/epoxy/index.mjs',[{wisp:wispUrl}]);
   if(frame){frame.style.display='block';frame.src=window.__uv$config.prefix+window.__uv$config.encodeUrl(url)}
   if(status)status.textContent='Ultraviolet is running. The original Lolite Browser remains available separately.';
  }catch(e){if(status)status.textContent='Ultraviolet could not start';if(err)err.textContent=e?.message||String(e);if(frame)frame.style.display='none';}
 }
 window.loliteUltravioletOpen=()=>{const id='ultraviolet-browser';if(!state.windows[id])openApp(id,'Ultraviolet Browser',1000,700);const c=state.windows[id]?.el.querySelector('.content');if(c)render(c)};
 function render(root){
  root.innerHTML='<div class="lolite-uv"><div class="uv-toolbar"><button type="button" title="Home" onclick="window.loliteUltravioletHome()">⌂</button><input id="loliteUvAddress" aria-label="Address" placeholder="Search or enter a website" onkeydown="if(event.key===\'Enter\')window.loliteUltravioletGo()"><button type="button" onclick="window.loliteUltravioletGo()">Go</button></div><div class="uv-home" id="loliteUvHome"><div><div class="welcome-logo" style="margin:0 auto 14px">UV</div><h2>Ultraviolet Browser</h2><p>A second browser engine for Lolite OS.</p><form onsubmit="event.preventDefault();window.loliteUltravioletGo()"><input id="loliteUvHomeAddress" placeholder="Search or enter a website"><button class="uv-go" type="submit">Browse</button></form><p class="uv-note">Requires the Lolite Node server with Ultraviolet proxy dependencies. This cannot proxy sites on static GitHub Pages alone.</p><div id="loliteUvError" class="uv-error"></div></div></div><iframe id="loliteUvFrame" class="uv-frame" title="Ultraviolet web view" style="display:none"></iframe><div id="loliteUvStatus" class="uv-status">Ultraviolet is installed as an optional browser engine.</div></div>';
  root.querySelector('#loliteUvAddress').addEventListener('keydown',e=>{if(e.key==='Enter')navigate(e.currentTarget.value)});
  root.querySelector('#loliteUvHomeAddress').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();navigate(e.currentTarget.value)}});
 }
 window.loliteUltravioletGo=()=>{const root=state.windows['ultraviolet-browser']?.el.querySelector('.content');if(!root)return;navigate(root.querySelector('#loliteUvAddress')?.value||root.querySelector('#loliteUvHomeAddress')?.value||'')};
 window.loliteUltravioletHome=()=>{const root=state.windows['ultraviolet-browser']?.el.querySelector('.content');if(!root)return;const f=root.querySelector('#loliteUvFrame');if(f){f.removeAttribute('src');f.style.display='none'}root.querySelector('#loliteUvHome').style.display='grid';root.querySelector('#loliteUvStatus').textContent='Ultraviolet is installed as an optional browser engine.'};
 const oldPage=window.page;window.page=function(id){if(id==='ultraviolet-browser'){setTimeout(()=>{const c=state.windows['ultraviolet-browser']?.el.querySelector('.content');if(c)render(c)},0);return '<div class="lolite-uv"><div class="uv-status">Loading Ultraviolet Browser…</div></div>'}return oldPage(id)};
})();