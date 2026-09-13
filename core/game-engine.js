/* Lolite OS Game Engine v5 — launches the real HTML files from the game library. */
(()=>{
  'use strict';

  const REPO_API='https://api.github.com/repos/darby9123-arch/Lolite-OS/contents/html%20games?ref=main';
  const PAGES_ROOT='https://darby9123-arch.github.io/Lolite-OS/html%20games/';
  let catalog=[];
  let loading=null;

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const title=file=>String(file).replace(/\.html?$/i,'').replace(/^cl/i,'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim().replace(/\b\w/g,c=>c.toUpperCase());
  const fileName=path=>String(path||'').replace(/^html games[\\/]/i,'').replace(/^\/+/, '');

  function gameUrl(file){
    const clean=fileName(file);
    const encoded=clean.split(/[\\/]/).map(encodeURIComponent).join('/');
    if(location.hostname==='darby9123-arch.github.io'){
      return new URL('/Lolite-OS/html%20games/'+encoded,location.origin).href;
    }
    return PAGES_ROOT+encoded;
  }

  async function discover(force=false){
    if(!force && catalog.length)return catalog;
    if(loading)return loading;
    loading=(async()=>{
      try{
        const res=await fetch(REPO_API,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
        if(!res.ok)throw new Error('Game directory unavailable');
        const items=await res.json();
        catalog=items.filter(x=>x.type==='file'&&/\.html?$/i.test(x.name))
          .map(x=>({name:title(x.name),file:x.name,size:x.size||0}))
          .sort((a,b)=>a.name.localeCompare(b.name));
      }catch(err){
        console.warn('[Lolite Game Engine] discovery failed',err);
        catalog=[];
      }finally{loading=null}
      return catalog;
    })();
    return loading;
  }

  function launch(game){
    if(!game?.file)return;
    const src=gameUrl(game.file);
    const opened=window.open(src,'_blank','noopener,noreferrer');
    if(!opened) location.href=src;
  }

  function card(g){
    return `<article class="card game-v5-card">
      <div style="font-size:28px">🎮</div>
      <h3>${esc(g.name)}</h3>
      <p class="muted" style="word-break:break-word">${esc(g.file)}</p>
      <button class="primary game-v5-play" data-file="${encodeURIComponent(g.file)}" type="button">▶ Play</button>
    </article>`;
  }

  function render(){
    const grid=document.getElementById('gameV5Grid');
    if(!grid)return;
    const q=(document.getElementById('gameV5Search')?.value||'').trim().toLowerCase();
    const rows=catalog.filter(g=>g.name.toLowerCase().includes(q)||g.file.toLowerCase().includes(q));
    grid.innerHTML=rows.length?rows.map(card).join(''):'<div class="empty"><div>🔎</div><b>No games found</b><span class="muted">Try another search.</span></div>';
    const count=document.getElementById('gameV5Count');
    if(count)count.textContent=`${rows.length} of ${catalog.length} games`;
  }

  function wire(){
    document.getElementById('gameV5Search')?.addEventListener('input',render);
    document.getElementById('gameV5Refresh')?.addEventListener('click',async()=>{
      const button=document.getElementById('gameV5Refresh');
      if(button){button.disabled=true;button.textContent='↻ Loading…';}
      await discover(true);
      render();
      if(button){button.disabled=false;button.textContent='↻ Refresh';}
    });
    document.getElementById('gameV5Grid')?.addEventListener('click',e=>{
      const b=e.target.closest('.game-v5-play');
      if(!b)return;
      const file=decodeURIComponent(b.dataset.file||'');
      const g=catalog.find(x=>x.file===file);
      if(g)launch(g);
    });
    render();
  }

  const oldPage=window.page;
  window.page=function(id){
    if(id!=='games'&&id!=='game-store')return oldPage?oldPage(id):`<h2>${esc(id)}</h2>`;
    setTimeout(async()=>{await discover();wire()},0);
    return `<div class="game-library-v5">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="flex:1">
          <div class="muted">LOLite GAME ENGINE</div>
          <h2 style="margin:3px 0">🎮 Game Library</h2>
          <p class="muted" style="margin:0">Real HTML games from <code>html games/</code>. Press Play to open the actual HTML file.</p>
        </div>
        <button id="gameV5Refresh" class="soft" type="button">↻ Refresh</button>
      </div>
      <div class="game-search" style="display:flex;gap:10px;align-items:center;margin-bottom:14px">
        <input id="gameV5Search" type="search" placeholder="Search HTML games…" autocomplete="off" style="flex:1">
        <span id="gameV5Count" class="muted"></span>
      </div>
      <div id="gameV5Grid" class="cards"></div>
    </div>`;
  };

  window.LoliteGameEngine={discover,launch,get catalog(){return catalog},url:gameUrl};
  setTimeout(()=>discover(),600);
})();
