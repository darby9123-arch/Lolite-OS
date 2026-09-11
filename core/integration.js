/* Hooks persistent storage, installed games and polished file UI into the desktop shell. */
(()=>{
  const style=document.createElement('style');style.textContent=`.files-app{display:flex;flex-direction:column;height:100%;gap:12px}.file-toolbar{display:flex;gap:8px;flex-wrap:wrap}.file-list{display:grid;gap:7px;overflow:auto}.file-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #ffffff0d;background:#ffffff06;border-radius:12px}.file-icon{font-size:21px}.file-name{flex:1;min-width:0}.file-name b,.file-name small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.file-name small{color:var(--muted);font-size:11px;margin-top:2px}.empty{text-align:center;padding:45px 15px;display:grid;gap:7px;place-items:center;border:1px dashed #ffffff18;border-radius:15px}.empty div{font-size:40px}`;document.head.append(style);
  const originalPage=window.page;
  window.page=function(id){
    if(id==='files')return FileOS.filesPage();
    if(id==='games'){
      const base=originalPage(id),installs=JSON.parse(localStorage.loliteGames||'[]');
      if(!installs.length)return base;
      return base+`<div class="card" style="margin-top:18px"><h3>📦 Installed games</h3><div class="cards">${installs.map(g=>`<div class="card"><h3>🎮 ${String(g.title).replace(/[<>]/g,'')}</h3><button class="primary" onclick="launchGame('${String(g.title).replace(/'/g,"\\'")}')">Launch</button></div>`).join('')}</div></div>`;
    }
    return originalPage(id);
  };
  const originalLaunch=window.launchGame;
  window.launchGame=async function(name){
    const installs=JSON.parse(localStorage.loliteGames||'[]'),installed=installs.find(x=>x.title===name||x.path.split('/').filter(Boolean).pop()===name);
    if(installed){
      const id='installed-'+installed.path.replace(/[^a-z0-9]+/gi,'-')+'-'+Date.now();openApp(id,name,760,620);
      const w=state.windows[id]?.el.querySelector('.content');
      if(w){const rows=await FileOS.all(),root=installed.path,html=rows.find(x=>x.path===root+'index.html'||x.path===root+'/index.html');
        if(html?.data){const text=await html.data.text(),blob=new Blob([text],{type:'text/html'});w.innerHTML=`<iframe title="${name}" src="${URL.createObjectURL(blob)}" style="width:100%;height:100%;min-height:520px;border:0;border-radius:12px;background:#0b0716"></iframe>`}
        else w.innerHTML='<div class="empty"><div>⚠️</div><b>Game entry point not found</b><span class="muted">The ZIP needs an index.html file.</span></div>';
      }return;
    }
    return originalLaunch(name);
  };
})();
