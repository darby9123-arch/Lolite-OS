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
 const browserPage=()=>`<div class="uv-app"><div><h2>Ultraviolet Browser</h2><p class="muted">Browse websites in Lolite using standard embedded mode. The Ultraviolet proxy is not enabled.</p></div><form class="uv-toolbar" id="uvForm"><div class="uv-address"><input id="uvAddress" type="text" autocomplete="url" spellcheck="false" placeholder="Enter a website or search the web" aria-label="Website address"><button class="primary" type="submit">Go</button></div><button class="soft" id="uvDirect" type="button">Browse directly</button><button class="soft" id="uvHome" type="button">Home</button><button class="soft" id="uvReload" type="button">Reload</button><button class="soft" id="uvOpenTab" type="button">Open in tab</button></form><div id="uvStatus" class="uv-status" role="status">Preparing browser…</div><div class="uv-frame-wrap"><iframe class="uv-frame" id="uvFrame" title="Ultraviolet browsing area" allow="fullscreen; clipboard-read; clipboard-write"></iframe></div><p class="muted">Note: websites that block embedding, require unsupported browser features, or rely on WebSockets may not work.</p></div>`;
 const loadScript=src=>new Promise((resolve,reject)=>{const existing=[...document.scripts].find(s=>new URL(s.src,location.href).pathname===src);if(existing){resolve();return}const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Could not load '+src));document.head.appendChild(s)});
 const setStatus=(el,msg,error=false)=>{if(!el)return;el.textContent=msg;el.classList.toggle('error',error)};
 function showHostNotice(el,msg){if(!el)return;setStatus(el,msg,true);if(location.hostname.endsWith('github.io')){el.append(document.createTextNode(' '));const link=document.createElement('a');link.href='https://lolite-os.vercel.app/';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open the Node-backed Lolite OS deployment';link.style.color='#c9baff';link.style.textDecoration='underline';el.append(link)}}
 async function start(content){
  const resume = () => {
   content.dataset.loliteBrowserSignedIn = "1";
   void start(content);
  };
  content._loliteBrowserResume = resume;
  if (!content.dataset.loliteBrowserSignedIn) {
   const allowed = await window.LoliteBrowserAccounts?.guard(content, resume);
   if (!allowed) {
    const s = content.querySelector("#uvStatus");
    if(s)s.textContent = "Sign in with your Lolite Chat account to use the browser.";
    return;
   }
   content.dataset.loliteBrowserSignedIn = "1";
  }
  const form=content.querySelector('#uvForm'),input=content.querySelector('#uvAddress'),frame=content.querySelector('#uvFrame'),status=content.querySelector('#uvStatus');
  let lastUrl='';
  const normalize=raw=>{
    let value=String(raw||'').trim();
    if(!value)return null;
    if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(value))
      value=/^(localhost|[\w-]+\.)+[a-z]{2,}([/:?#]|$)/i.test(value)
        ?'https://'+value
        :'https://duckduckgo.com/?q='+encodeURIComponent(value);
    const target=new URL(value);
    if(!['http:','https:'].includes(target.protocol))
      throw new Error('Only HTTP and HTTPS websites are supported.');
    return target;
  };
  // Search providers block third-party frames with X-Frame-Options/CSP.
  // Respect those headers rather than showing Firefox's frame-block page.
  const needsTab=target=>{
    const host=target.hostname.toLowerCase();
    return host==='duckduckgo.com'||host.endsWith('.duckduckgo.com')||
      host==='google.com'||host.endsWith('.google.com')||
      host==='bing.com'||host.endsWith('.bing.com');
  };
  const showFrameNotice=(heading,description,url='')=>{
    frame.removeAttribute('src');
    const link=url
      ?'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:14px;padding:10px 16px;border-radius:9px;background:#318aff;color:white;text-decoration:none;font-weight:600">Open in a browser tab ↗</a>'
      :'';
    frame.srcdoc='<!doctype html><html lang="en"><meta charset="utf-8"><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#10192a;color:#f1f6ff;font:14px system-ui,sans-serif;text-align:center"><main style="max-width:420px;padding:28px"><h2 style="margin:0 0 8px">'+esc(heading)+'</h2><p style="color:#b4c4dc;line-height:1.6">'+esc(description)+'</p>'+link+'</main></body></html>';
  };
  const direct=(raw,openNewTab=true)=>{
    if(content.dataset.loliteBrowserSignedIn!=="1"){
      setStatus(status,'Sign in to Lolite Chat before browsing.',true);
      return;
    }
    try{
      const target=normalize(raw);
      if(!target)return;
      lastUrl=target.href;
      input.value=lastUrl;
      if(needsTab(target)){
        showFrameNotice('Open this site in a browser tab',
          'DuckDuckGo and other search engines do not permit embedded pages. Use the button below to view this website.',lastUrl);
        if(openNewTab)window.open(lastUrl,'_blank','noopener,noreferrer');
        setStatus(status,'This website blocks embedding in Firefox. Use Open in tab if a new tab did not appear.');
        return;
      }
      frame.removeAttribute('srcdoc');
      frame.src=lastUrl;
      setStatus(status,'Standard browsing · '+target.hostname+'. Some websites block embedding; use Open in tab if needed.');
    }catch(error){
      setStatus(status,error?.message||'Invalid address',true);
    }
  };
  const go=raw=>direct(raw,true);
  form.onsubmit=event=>{event.preventDefault();go(input.value)};
  content.querySelector('#uvDirect').onclick=()=>direct(input.value,true);
  content.querySelector('#uvHome').onclick=()=>{
    lastUrl='';
    input.value='';
    showFrameNotice('Welcome to Lolite Browser','Enter an address or search in the bar above. Searches open in a regular tab because search engines block embedding.');
    setStatus(status,'Browser home. Sites that allow embedding open here; search engines open in a new tab.');
  };
  content.querySelector('#uvReload').onclick=()=>{
    if(lastUrl)direct(lastUrl,false);
    else setStatus(status,'Enter a website first.');
  };
  content.querySelector('#uvOpenTab').onclick=()=>{
    if(content.dataset.loliteBrowserSignedIn!=="1"){
      setStatus(status,'Sign in first.',true);return;
    }
    try{
      const target=normalize(input.value||lastUrl);
      if(!target){setStatus(status,'Enter a website first.');return}
      lastUrl=target.href;
      window.open(lastUrl,'_blank','noopener,noreferrer');
      setStatus(status,'Opening '+target.hostname+' in a normal browser tab.');
    }catch(error){setStatus(status,error?.message||'Invalid address',true)}
  };
  showFrameNotice('Welcome to Lolite Browser',
    'Enter a web address or search above. Sites that allow embedding can appear here. Search engines open in a separate tab.');
  setStatus(status,'Standard browser mode is ready. Search engines require a separate tab.');

 }
 window.page=function(id){if(id==='browser'||id==='ultraviolet')return browserPage();return oldPage(id)};
 const oldOpen=window.openApp;
 window.openApp=function(id,title,w,h){
  oldOpen(id,title||'Ultraviolet Browser',w||900,h||650);
  if(id==='browser'||id==='ultraviolet')setTimeout(()=>{const win=window.state?.windows?.[id]?.el||document.querySelector('#windows .window:last-child');const content=win?.querySelector('.content');if(content&&!content.dataset.uvReady){content.dataset.uvReady='1';start(content)}},0);
 };
 window.LoliteUltraviolet={open:()=>window.openApp('browser','Ultraviolet Browser',900,650)};
})();