/* Hooks persistent storage, repository HTML/HTM games and polished file UI into the desktop shell. */
(()=>{
  const style=document.createElement('style');style.textContent=`.files-app{display:flex;flex-direction:column;height:100%;gap:12px}.file-toolbar{display:flex;gap:8px;flex-wrap:wrap}.file-list{display:grid;gap:7px;overflow:auto}.file-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #ffffff0d;background:#ffffff06;border-radius:12px}.file-icon{font-size:21px}.file-name{flex:1;min-width:0}.file-name b,.file-name small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.file-name small{color:var(--muted);font-size:11px;margin-top:2px}.empty{text-align:center;padding:45px 15px;display:grid;gap:7px;place-items:center;border:1px dashed #ffffff18;border-radius:15px}.empty div{font-size:40px}.html-game-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.html-game-card{display:flex;flex-direction:column;gap:8px}.html-game-card p{margin:0;color:var(--muted);font-size:12px;line-height:1.4}.html-game-badge{font-size:11px;color:var(--muted);padding:3px 7px;border:1px solid #ffffff12;border-radius:999px;width:max-content}.html-game-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.html-game-head .muted{font-size:11px}`;document.head.append(style);
  const fallbackGames=[
    {name:'Granny Original',file:'clgrannyy.html'},
    {name:'GTA III',file:'clgta3.html'},
    {name:'Paper.io 2',file:'clpaperio.html'},
    {name:'Slope Plus',file:'clslopeplus.html'}
  ];
  let repositoryGames=fallbackGames.slice();
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gameName=file=>{
    const known={clgrannyy:'Granny Original',clgta3:'GTA III',clpaperio:'Paper.io 2',clslopeplus:'Slope Plus'};
    const key=file.replace(/\.(?:html?|HTML?)$/,'');
    return known[key]||key.replace(/^cl/i,'').replace(/[-_]+/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
  };
  const gameSection=()=>`<div class="card" style="margin-top:18px" id="html-games-section"><div class="html-game-head"><div><h3>🌐 HTML Games</h3><p class="muted">Games discovered from the repository's <b>html games</b> folder.</p></div><button onclick="refreshHTMLGames()">↻ Refresh</button></div><div class="html-game-grid">${repositoryGames.map(g=>`<div class="card html-game-card"><h3>🎮 ${esc(g.name)}</h3><span class="html-game-badge">HTML game</span><p>Launch this game inside a Lolite OS window.</p><button class="primary" onclick="launchHTMLGame('${esc(g.name)}','${esc(g.file)}')">Play</button></div>`).join('')}</div></div>`;
  window.refreshHTMLGames=async function(){
    try{
      const r=await fetch('https://api.github.com/repos/darby9123-arch/Lolite-OS/contents/html%20games',{headers:{Accept:'application/vnd.github+json'}});
      if(!r.ok)throw new Error('GitHub contents request failed');
      const items=await r.json();
      const discovered=items.filter(x=>x.type==='file'&&/\.html?$/i.test(x.name)).map(x=>({name:gameName(x.name),file:x.name}));
      if(discovered.length)repositoryGames=discovered;
      const section=document.getElementById('html-games-section');
      if(section)section.outerHTML=gameSection();
    }catch(e){
      const section=document.getElementById('html-games-section');
      if(section){const note=section.querySelector('.html-game-head .muted');if(note)note.innerHTML='Using the built-in list. GitHub discovery will retry when you refresh.';}
    }
  };
  const originalPage=window.page;
  window.page=function(id){
    if(id==='files')return FileOS.filesPage();
    if(id==='games'){
      const base=originalPage(id),installs=JSON.parse(localStorage.loliteGames||'[]');
      let html=base+gameSection();
      if(installs.length)html+=`<div class="card" style="margin-top:18px"><h3>📦 Installed games</h3><div class="cards">${installs.map(g=>`<div class="card"><h3>🎮 ${String(g.title).replace(/[<>]/g,'')}</h3><button class="primary" onclick="launchGame('${String(g.title).replace(/'/g,"\\'")}')">Launch</button></div>`).join('')}</div></div>`;
      setTimeout(()=>refreshHTMLGames(),0);
      return html;
    }
    return originalPage(id);
  };
  window.launchHTMLGame=function(name,file){
    const id='html-game-'+file.replace(/[^a-z0-9]+/gi,'-')+'-'+Date.now();openApp(id,name,900,650);
    const w=state.windows[id]?.el.querySelector('.content');
    if(w){w.innerHTML=`<iframe title="${esc(name)}" src="html%20games/${encodeURIComponent(file)}" style="width:100%;height:100%;min-height:560px;border:0;border-radius:12px;background:#000"></iframe>`}
  };
  const originalLaunch=window.launchGame;
  window.launchGame=async function(name){
    const installs=JSON.parse(localStorage.loliteGames||'[]'),installed=installs.find(x=>x.title===name||x.path.split('/').filter(Boolean).pop()===name);
    if(installed){
      const id='installed-'+installed.path.replace(/[^a-z0-9]+/gi,'-')+'-'+Date.now();openApp(id,name,760,620);
      const w=state.windows[id]?.el.querySelector('.content');
      if(w){const rows=await FileOS.all(),root=installed.path,html=rows.find(x=>x.path===root+'index.html'||x.path===root+'/index.html');
        if(html?.data){const text=await html.data.text(),blob=new Blob([text],{type:'text/html'});w.innerHTML=`<iframe title="${esc(name)}" src="${URL.createObjectURL(blob)}" style="width:100%;height:100%;min-height:520px;border:0;border-radius:12px;background:#0b0716"></iframe>`}
        else w.innerHTML='<div class="empty"><div>⚠️</div><b>Game entry point not found</b><span class="muted">The ZIP needs an index.html file.</span></div>';
      }return;
    }
    return originalLaunch(name);
  };
})();
