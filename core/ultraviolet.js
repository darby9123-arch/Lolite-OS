/* Lolite OS Ultraviolet browser. Uses the same-origin UV runtime and Bare server supplied by server.mjs. */
(()=> {
 const css=`
 .uv-app{height:100%;min-height:0;display:flex;flex-direction:column;gap:10px}
 .uv-toolbar{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
 .uv-address{display:flex;gap:7px;flex:1;min-width:180px}
 .uv-address input{min-width:0;flex:1;background:#0d1118;border:1px solid #303847;border-radius:8px;padding:10px 12px;color:#f4f6fb;outline:none}
 .uv-address input:focus{border-color:#8b6cff}
 .uv-frame-wrap{flex:1;min-height:240px;border:1px solid #2b3340;border-radius:10px;overflow:hidden;background:#fff}
 .uv-frame{display:block;width:100%;height:100%;min-height:240px;border:0;background:#fff}
 .uv-status{font-size:12px;color:#a8b2c4;line-height:1.5}.uv-status.error{color:#ff9aa9}
 @media(max-width:600px){.uv-toolbar{align-items:stretch}.uv-address{flex-basis:100%}.uv-frame-wrap,.uv-frame{min-height:260px}}
 `;
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const oldPage=window.page;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const browserPage=()=>`<div class="uv-app"><div><h2>Ultraviolet Browser</h2><p class="muted">Browse through Lolite's Ultraviolet proxy when the Node server is available.</p></div><form class="uv-toolbar" id="uvForm"><div class="uv-address"><input id="uvAddress" type="text" autocomplete="url" spellcheck="false" placeholder="Enter a website or search the web" aria-label="Website address"><button class="primary" type="submit">Go</button></div><button class="soft" id="uvHome" type="button">Home</button><button class="soft" id="uvReload" type="button">Reload</button><button class="soft" id="uvOpenTab" type="button">Open in tab</button></form><div id="uvStatus" class="uv-status" role="status">Checking Ultraviolet runtime…</div><div class="uv-frame-wrap"><iframe class="uv-frame" id="uvFrame" title="Ultraviolet browsing area" allow="fullscreen; clipboard-read; clipboard-write"></iframe></div><p class="muted">Note: websites that block embedding, require unsupported browser features, or rely on WebSockets may not work.</p></div>`;
 const loadScript=src=>new Promise((resolve,reject)=>{const existing=[...document.scripts].find(s=>new URL(s.src,location.href).pathname===src);if(existing){resolve();return}const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Could not load '+src));document.head.appendChild(s)});
 const setStatus=(el,msg,error=false)=>{if(!el)return;el.textContent=msg;el.classList.toggle('error',error)};
 async function start(content){
  const form=content.querySelector('#uvForm'),input=content.querySelector('#uvAddress'),frame=content.querySelector('#uvFrame'),status=content.querySelector('#uvStatus');
  let lastUrl='';
  const go=async raw=>{
   let value=(raw||'').trim();if(!value)return;
   if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)){
    if(/^(localhost|[\w-]+\.)+[a-z]{2,}([/:?#]|$)/i.test(value))value='https://'+value;
    else value='https://duckduckgo.com/?q='+encodeURIComponent(value);
   }
   let target;try{target=new URL(value)}catch{setStatus(status,'That address is not valid.',true);return}
   if(!['http:','https:'].includes(target.protocol)){setStatus(status,'Only http:// and https:// websites can be opened.',true);return}
   try{
    setStatus(status,'Loading Ultraviolet…');
    await loadScript('/uv/uv.bundle.js');
    await loadScript('/uv/uv.config.js');
    if(!window.__uv$config||!window.__uv$config.encodeUrl)throw new Error('Ultraviolet configuration is missing.');
    if(!('serviceWorker' in navigator))throw new Error('This browser does not support service workers.');
    if(location.protocol!=='https:'&&location.hostname!=='localhost')throw new Error('Ultraviolet requires HTTPS or localhost.');
    await navigator.serviceWorker.register('/uv/sw.js',{scope:'/'});
    await navigator.serviceWorker.ready;
    lastUrl=target.href;input.value=target.href;
    frame.src=window.__uv$config.prefix+window.__uv$config.encodeUrl(target.href);
    setStatus(status,'Opening '+target.hostname+' through Ultraviolet. If the page stays blank, the host may not support the required proxy endpoints.');
   }catch(e){
    const message=e?.message||String(e);
    setStatus(status,message.includes('/uv/')||message.includes('Ultraviolet')?'Ultraviolet runtime could not start: '+message+'. The site must serve /uv/uv.bundle.js, /uv/handler.js, /uv/sw.js and a working /bare/ endpoint; a static GitHub Pages deployment cannot provide the proxy server.':'Ultraviolet could not start: '+message,true);
    console.error('Lolite Ultraviolet startup failed',e);
   }
  };
  form.onsubmit=e=>{e.preventDefault();go(input.value)};
  content.querySelector('#uvHome').onclick=()=>{input.value='https://duckduckgo.com/';go(input.value)};
  content.querySelector('#uvReload').onclick=()=>{if(lastUrl)go(lastUrl);else setStatus(status,'Enter a website first.')};
  content.querySelector('#uvOpenTab').onclick=()=>{if(frame.src&&frame.src!=='about:blank')window.open(frame.src,'_blank','noopener,noreferrer');else setStatus(status,'Open a website first.')};
  try{
   const r=await fetch('/uv/uv.bundle.js',{method:'HEAD',cache:'no-store'});
   if(!r.ok)throw new Error('Ultraviolet assets are not available on this host (HTTP '+r.status+').');
   setStatus(status,'Ultraviolet assets found. Enter a website to begin.');
  }catch(e){setStatus(status,'Ultraviolet proxy server is not available here. The app needs the Node server (server.mjs); static GitHub Pages cannot run the proxy backend. '+(e.message||''),true)}
 }
 window.page=function(id){if(id==='browser'||id==='ultraviolet')return browserPage();return oldPage(id)};
 const oldOpen=window.openApp;
 window.openApp=function(id,title,w,h){
  oldOpen(id,title||'Ultraviolet Browser',w||900,h||650);
  if(id==='browser'||id==='ultraviolet')setTimeout(()=>{const win=window.state?.windows?.[id]?.el||document.querySelector('#windows .window:last-child');const content=win?.querySelector('.content');if(content&&!content.dataset.uvReady){content.dataset.uvReady='1';start(content)}},0);
 };
 window.LoliteUltraviolet={open:()=>window.openApp('browser','Ultraviolet Browser',900,650)};
})();