/* Lolite OS settings enhancement: reliable controls, cursors, themes and wallpaper helpers. */
(()=>{
  const key=(k,v)=>{localStorage.setItem(k,v);};
  const get=(k,d='')=>localStorage.getItem(k)??d;
  window.loliteApplyCursor=cursor=>{document.documentElement.style.cursor=cursor==='crosshair'?'crosshair':cursor==='pointer'?'pointer':cursor==='none'?'none':'default';key('loliteCursor',cursor)};
  window.loliteSetAccent=color=>{document.documentElement.style.setProperty('--accent',color);key('loliteAccent',color)};
  window.toggleGlass=on=>{key('glass',on?'true':'false');document.documentElement.classList.toggle('liquid-glass',!!on)};
  window.toggleReduce=on=>{key('reduce',on?'true':'false');document.documentElement.classList.toggle('reduce-motion',!!on)};
  window.loliteResetSettings=()=>{['glass','reduce','loliteCursor','loliteAccent','wallpaperCategory'].forEach(k=>localStorage.removeItem(k));location.reload()};
  const style=document.createElement('style');style.textContent=`:root{--accent:#8b5cf6}.settings-extra{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.settings-extra .card{margin:0}.setting-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.setting-btn{border:1px solid #ffffff16;background:#ffffff08;color:inherit;border-radius:9px;padding:8px 10px;cursor:pointer}.setting-btn.active{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 18%,transparent)}.reduce-motion *, .reduce-motion *::before, .reduce-motion *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}`;document.head.appendChild(style);
  const old=window.page;
  window.page=function(id){
    const html=old(id); if(id!=='settings')return html;
    const cursor=get('loliteCursor','default'),accent=get('loliteAccent','#8b5cf6');
    return html+`<div class="settings-extra"><div class="card"><h3>🖱️ Cursor</h3><p class="muted">Choose how the Lolite cursor behaves.</p><div class="setting-row">${['default','pointer','crosshair','none'].map(c=>`<button class="setting-btn ${cursor===c?'active':''}" onclick="loliteApplyCursor('${c}');openApp('settings','Settings')">${c==='default'?'Default':c==='pointer'?'Pointer':c==='crosshair'?'Crosshair':'Hidden'}</button>`).join('')}</div></div><div class="card"><h3>🎨 Accent</h3><div class="setting-row">${['#8b5cf6','#3b82f6','#06b6d4','#22c55e','#f59e0b','#ef4444'].map(c=>`<button aria-label="Accent ${c}" class="setting-btn" style="width:30px;height:30px;padding:0;background:${c}" onclick="loliteSetAccent('${c}');openApp('settings','Settings')"></button>`).join('')}</div><p class="muted">Choose the main highlight colour.</p></div><div class="card"><h3>⚙️ System</h3><button class="setting-btn" onclick="loliteResetSettings()">Reset all settings</button></div></div>`;
  };
  setTimeout(()=>{const c=get('loliteCursor');if(c)loliteApplyCursor(c);const a=get('loliteAccent');if(a)loliteSetAccent(a);if(get('glass')==='true')document.documentElement.classList.add('liquid-glass');if(get('reduce')==='true')document.documentElement.classList.add('reduce-motion')},0);
})();
