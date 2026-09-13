/* Lolite OS Game Engine v6 — embed the actual HTML game file inside a Lolite window. */
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
    const clean=fileName(game.file);
    const src=gameUrl(clean);
    const id='game-'+clean.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

    if(window.state?.windows?.[id]){
      window.restoreWin?.(id);
      return;
    }

    if(typeof window.openApp!=='function'){
      window.open(src,'_blank','noopener,noreferrer');
      return;
    }

    window.openApp(id,game.name,1100,760);

    const mount=()=>{
      const win=window.state?.windows?.[id];
      const root=win?.el?.querySelector('.content');
      if(!root){setTimeout(mount,50);return;}

      root.innerHTML=`
        <div class="lolite-game-embed" style="height:100%;width:100%;display:flex;flex-direction:column;background:#08090d;overflow:hidden">
          <div style="height:44px;min-height:44px;display:flex;align-items:center;gap:10px;padding:0 12px;background:rgba(255,255,255,.055);border-bottom:1px solid rgba(255,255,255,.09)">
            <span style="font-size:18px">🎮</span>
            <strong style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(game.name)}</strong>
            <button class="soft lolite-game-popout" type="button">Open separately</button>
            <button class="soft lolite-game-fullscreen" type="button">Fullscreen</button>
          </div>
          <div style="position:relative;flex:1;min-height:0;background:#000">
            <iframe class="lolite-game-frame" title="${esc(game.name)}" src="${esc(src)}" allow="fullscreen; gamepad; autoplay; pointer-lock" loading="eager" style="position:absolute;inset:0;width:100%;height:100%;border:0;background:#000"></iframe>
          </div>
        </div>`;

      const frame=root.querySelector('.lolite-game-frame');
      root.querySelector('.lolite-game-popout')?.addEventListener('click',()=>window.open(src,'_blank','noopener,noreferrer'));
      root.querySelector('.lolite-game-fullscreen')?.addEventListener('click',()=>frame?.requestFullscreen?.());
      frame?.addEventListener('load',()=>{
        try{frame.contentWindow?.focus()}catch{}
      });
    };

    mount();
  }

  function card(g){
    return `<article class="card game-v6-card">
      <div style="font-size:28px">🎮</div>
      <h3>${esc(g.name)}</h3>
      <p class="muted" style="word-break:break-word">${esc(g.file)}</p>
      <button class="primary game-v6-play" data-file="${encodeURIComponent(g.file)}" type="button">▶ Play</button>
    </article>`;
  }

  function render(){
    const grid=document.getElementById('gameV6Grid');
    if(!grid)return;
    const q=(document.getElementById('gameV6Search')?.value||'').trim().toLowerCase();
    const rows=catalog.filter(g=>g.name.toLowerCase().includes(q)||g.file.toLowerCase().includes(q));
    grid.innerHTML=rows.length?rows.map(card).join(''):'<div class="empty"><div>🔎</div><b>No games found</b><span class="muted">Try another search.</span></div>';
    const count=document.getElementById('gameV6Count');
    if(count)count.textContent=`${rows.length} of ${catalog.length} games`;
  }

  function wire(){
    document.getElementById('gameV6Search')?.addEventListener('input',render);
    document.getElementById('gameV6Refresh')?.addEventListener('click',async()=>{
      const button=document.getElementById('gameV6Refresh');
      if(button){button.disabled=true;button.textContent='↻ Loading…';}
      await discover(true);
      render();
      if(button){button.disabled=false;button.textContent='↻ Refresh';}
    });
    document.getElementById('gameV6Grid')?.addEventListener('click',e=>{
      const b=e.target.closest('.game-v6-play');
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
    return `<div class="game-library-v6">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="flex:1">
          <div class="muted">LOLite GAME CENTER</div>
          <h2 style="margin:3px 0">🎮 Game Library</h2>
          <p class="muted" style="margin:0">Games are embedded directly from the real HTML files.</p>
        </div>
        <button id="gameV6Refresh" class="soft" type="button">↻ Refresh</button>
      </div>
      <div class="game-search" style="display:flex;gap:10px;align-items:center;margin-bottom:14px">
        <input id="gameV6Search" type="search" placeholder="Search games…" autocomplete="off" style="flex:1">
        <span id="gameV6Count" class="muted"></span>
      </div>
      <div id="gameV6Grid" class="cards"></div>
    </div>`;
  };

  window.LoliteGameEngine={discover,launch,get catalog(){return catalog},url:gameUrl};
  setTimeout(()=>discover(),600);
})();