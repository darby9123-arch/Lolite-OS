/* Lolite OS Game Engine v4 — one real launcher for repository HTML games. */
(()=>{
  'use strict';

  const REPO_API='https://api.github.com/repos/darby9123-arch/Lolite-OS/contents/html%20games?ref=main';
  const GAME_ROOT='html games/';
  let catalog=[];
  let loading=null;

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const title=file=>String(file).replace(/\.(html?|HTML?)$/,'').replace(/^cl/i,'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim().replace(/\b\w/g,c=>c.toUpperCase());
  const fileName=path=>String(path||'').replace(/^html games[\\/]/i,'').replace(/^\/+/, '');
  const gameUrl=file=>new URL(GAME_ROOT+fileName(file).split(/[\\/]/).map(encodeURIComponent).join('/'),document.baseURI).href;

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

  function closeGame(id){if(window.closeWin)window.closeWin(id)}

  function launch(game){
    const file=fileName(game.file);
    const id='game-v4-'+file.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    if(window.state?.windows?.[id]){window.restoreWin(id);return}
    window.openApp(id,game.name,1000,720);
    setTimeout(()=>{
      const root=window.state?.windows?.[id]?.el?.querySelector('.content');
      if(!root)return;
      const src=gameUrl(file);
      root.innerHTML=`<div class="game-player" style="height:100%;display:flex;flex-direction:column;gap:0;background:#080611;border-radius:10px;overflow:hidden">
        <div style="height:42px;min-height:42px;display:flex;align-items:center;gap:8px;padding:0 12px;background:rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.08)">
          <strong style="flex:1">🎮 ${esc(game.name)}</strong>
          <button class="soft game-fullscreen" type="button">Fullscreen</button>
          <button class="soft game-open-tab" type="button">Open file</button>
        </div>
        <iframe title="${esc(game.name)}" src="${esc(src)}" allow="fullscreen; gamepad; autoplay" loading="eager" style="display:block;flex:1;width:100%;height:100%;min-height:600px;border:0;background:#000"></iframe>
      </div>`;
      const frame=root.querySelector('iframe');
      root.querySelector('.game-fullscreen')?.addEventListener('click',()=>frame?.requestFullscreen?.());
      root.querySelector('.game-open-tab')?.addEventListener('click',()=>window.open(src,'_blank','noopener,noreferrer'));
      frame?.addEventListener('load',()=>frame.focus(),{once:true});
      frame?.addEventListener('error',()=>{
        root.insertAdjacentHTML('afterbegin','<div style="padding:10px;background:#3a1420;color:#fff">Could not load this HTML game from the current site. Try “Open file” to open the actual game file.</div>');
      },{once:true});
    },50);
  }

  function card(g){
    return `<article class="card game-v4-card"><div style="font-size:28px">🎮</div><h3>${esc(g.name)}</h3><p class="muted">${esc(g.file)}</p><button class="primary game-v4-play" data-file="${encodeURIComponent(g.file)}">Play</button></article>`;
  }

  function render(){
    const grid=document.getElementById('gameV4Grid');
    if(!grid)return;
    const q=(document.getElementById('gameV4Search')?.value||'').trim().toLowerCase();
    const rows=catalog.filter(g=>g.name.toLowerCase().includes(q)||g.file.toLowerCase().includes(q));
    grid.innerHTML=rows.length?rows.map(card).join(''):'<div class="empty"><div>🔎</div><b>No games found</b><span class="muted">Try another search.</span></div>';
    const count=document.getElementById('gameV4Count');if(count)count.textContent=`${rows.length} of ${catalog.length} games`;
  }

  function wire(){
    document.getElementById('gameV4Search')?.addEventListener('input',render);
    document.getElementById('gameV4Refresh')?.addEventListener('click',async()=>{await discover(true);render()});
    document.getElementById('gameV4Grid')?.addEventListener('click',e=>{
      const b=e.target.closest('.game-v4-play');if(!b)return;
      const file=decodeURIComponent(b.dataset.file||'');
      const g=catalog.find(x=>x.file===file);if(g)launch(g);
    });
    render();
  }

  const oldPage=window.page;
  window.page=function(id){
    if(id!=='games'&&id!=='game-store')return oldPage?oldPage(id):`<h2>${esc(id)}</h2>`;
    setTimeout(async()=>{await discover();wire()},0);
    return `<div class="game-library-v4">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="flex:1"><div class="muted">LOLite GAME ENGINE</div><h2 style="margin:3px 0">🎮 Game Library</h2><p class="muted" style="margin:0">Real HTML files from <code>html games/</code>. Press Play to open the actual file.</p></div><button id="gameV4Refresh" class="soft">↻ Refresh</button></div>
      <div class="game-search"><input id="gameV4Search" type="search" placeholder="Search HTML games…" autocomplete="off"><span id="gameV4Count" class="muted"></span></div>
      <div id="gameV4Grid" class="cards"></div>
    </div>`;
  };

  window.LoliteGameEngine={discover,launch,get catalog(){return catalog},url:gameUrl};
  setTimeout(()=>discover(),600);
})();
