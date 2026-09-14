/* Lolite OS Game Store — polished storefront for every HTML game in html games/. */
(()=>{
  const STORE_CSS=`
  .store{display:grid;grid-template-columns:210px 1fr;height:100%;min-height:520px;background:#0d1016;color:#eef2f7;margin:-18px;overflow:hidden}
  .store-side{background:linear-gradient(180deg,#11151d,#0b0e13);border-right:1px solid #262d38;padding:18px 12px;overflow:auto}
  .store-brand{font-size:21px;font-weight:800;padding:4px 11px 20px;letter-spacing:-.4px}.store-brand span{opacity:.45;font-weight:500}
  .store-nav{display:grid;gap:5px}.store-nav button{border:1px solid transparent;background:transparent;color:#aeb7c6;text-align:left;padding:11px 12px;border-radius:9px;cursor:pointer;font:inherit;transition:.15s}.store-nav button:hover{background:#1a202a;color:#fff}.store-nav button.active{background:#242b38;border-color:#333c4b;color:#fff;box-shadow:inset 3px 0 #8b6cff}
  .store-main{overflow:auto;padding:24px 28px 44px;scrollbar-width:thin;scrollbar-color:#343c49 transparent}.store-main::-webkit-scrollbar{width:9px}.store-main::-webkit-scrollbar-track{background:transparent}.store-main::-webkit-scrollbar-thumb{background:#303846;border-radius:20px;border:2px solid #0d1016}
  .store-top{display:flex;gap:10px;align-items:center;margin-bottom:22px;position:sticky;top:0;z-index:5;padding-bottom:3px;background:linear-gradient(#0d1016 78%,transparent)}
  .store-search{flex:1;background:#171c25;border:1px solid #2b3441;border-radius:10px;padding:12px 15px;color:#fff;outline:none;box-shadow:inset 0 1px #ffffff06}.store-search:focus{border-color:#7266d9;box-shadow:0 0 0 3px #7166d91c}
  .store-hero{background:radial-gradient(circle at 80% 25%,#3a4270 0,#1b2130 34%,#141922 72%);border:1px solid #343e51;border-radius:15px;padding:30px;min-height:180px;display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:30px;box-shadow:0 16px 35px #0005}.store-hero h1{margin:7px 0 9px;font-size:31px;letter-spacing:-.7px}.store-hero p{margin:0;color:#aeb9c9;max-width:650px;line-height:1.5}.store-badge{display:inline-block;background:#7166d9;color:#fff;padding:6px 9px;border-radius:6px;font-size:10px;font-weight:800;letter-spacing:.8px}
  .store-section{margin:0 0 32px}.store-section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:13px}.store-section h2{font-size:19px;margin:0;letter-spacing:-.2px}.store-section-head button{border:0;background:none;color:#9389ff;cursor:pointer;padding:5px}.store-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));gap:15px}
  .store-card{background:#151a22;border:1px solid #272f3b;border-radius:11px;overflow:hidden;transition:transform .16s,border-color .16s,background .16s,box-shadow .16s}.store-card:hover{transform:translateY(-3px);border-color:#414c60;background:#1a202a;box-shadow:0 12px 28px #0005}.store-cover{height:112px;background:linear-gradient(135deg,#252e43,#11151d);display:flex;align-items:center;justify-content:center;font-size:38px;border-bottom:1px solid #242b35}.store-card-body{padding:12px}.store-card h3{font-size:14px;margin:0 0 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.store-card p{font-size:12px;color:#8995a7;margin:0 0 11px}.store-card button{width:100%;border:1px solid #7770e6;border-radius:7px;padding:8px;background:#665bd0;color:white;cursor:pointer;font-weight:750;transition:.15s}.store-card button:hover{background:#786ee8}.store-card button:active{transform:scale(.98)}.store-empty{padding:40px;text-align:center;color:#8792a3;background:#151a22;border:1px solid #272f3b;border-radius:11px}.store-tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.store-tag{font-size:10px;color:#a9b2c0;background:#202732;border-radius:20px;padding:4px 8px}
  .store-player{height:100%;display:flex;flex-direction:column;gap:9px;background:#0d1016}.store-player-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:2px 0}.store-player-title{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.store-player-actions{display:flex;gap:6px}.store-player-actions button{background:#202733;border:1px solid #303947;border-radius:7px;padding:7px 9px;color:#e9edf3}.store-frame{flex:1;min-height:0;width:100%;border:1px solid #272f3b;border-radius:9px;background:#080b10}
  @media(max-width:720px){.store{grid-template-columns:1fr}.store-side{display:none}.store-main{padding:16px}.store-hero{padding:21px}.store-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  const style=document.createElement('style');style.textContent=STORE_CSS;document.head.appendChild(style);

  const categories={
    'Featured':g=>true,
    'Baldi’s Basics':g=>/baldi/i.test(g.file),
    'Horror':g=>/fnaf|granny|lobot|nightmare|zombie|shiftatmidnight/i.test(g.file),
    'Racing':g=>/racing|crazycars|moto|slope|escaperoad|parking|rocketleague|derby|wheely/i.test(g.file),
    'Puzzle':g=>/2048|sokoban|blockblast|cookie|cuttherope|fireboy|infinitecraft|ovo|paperio|stickmanhook|tinyfishing/i.test(g.file),
    'Arcade':g=>/pvz|angrybirds|mario|subway|templerun|vex|snowrider|survivorio|melon|wrestle|gorilla/i.test(g.file),
    'IO & Casual':g=>/io|growagarden|hole|bitlife|pixel|fallguys|minecraft/i.test(g.file)
  };

  function pretty(raw){
    let s=raw.replace(/^cl/i,'').replace(/^lolite[-_]/i,'').replace(/\.html?$/i,'').replace(/[_-]+/g,' ');
    s=s.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/([A-Za-z])([0-9])/g,'$1 $2');
    s=s.replace(/\s+/g,' ').trim().replace(/\b\w/g,m=>m.toUpperCase());
    s=s.replace(/\bPvz\b/gi,'PVZ').replace(/\bFnaf\b/gi,'FNAF').replace(/\bGta\b/gi,'GTA').replace(/\bIo\b/gi,'IO');
    return s;
  }
  const icon=g=>/baldi/i.test(g.file)?'📚':/fnaf|granny|horror|nightmare/i.test(g.file)?'👻':/racing|moto|slope|cars|parking/i.test(g.file)?'🏎️':/pvz|mario|angrybirds/i.test(g.file)?'🎮':/2048|sokoban|blockblast|cuttherope/i.test(g.file)?'🧩':'🎮';
  let games=[],loaded=false,active='Featured',query='';

  async function discover(){
    if(loaded)return;
    try{
      const r=await fetch('https://api.github.com/repos/darby9123-arch/Lolite-OS/contents/html%20games');
      if(!r.ok)throw new Error('GitHub contents unavailable');
      const data=await r.json();
      games=data.filter(x=>x.type==='file'&&/\.html?$/i.test(x.name)).map(x=>({file:x.name,title:pretty(x.name),url:'html games/'+encodeURIComponent(x.name)}));
    }catch(e){
      games=['clbaldisbasics.html','clbaldisbasicsremaster.html','clFNAF.html','clFNAF2.html','clFNAF3.html','clFNAF4.html','clgrowagarden.html','clgta3.html','clminecraftpocketedition.html','clsupermariobros.html','clangrybirds2.html','clcookieclicker.html'].map(file=>({file,title:pretty(file),url:'html games/'+encodeURIComponent(file)}));
    }
    loaded=true;renderStore();
  }
  const filtered=()=>games.filter(g=>(categories[active]||(()=>true))(g)&&(!query||g.title.toLowerCase().includes(query.toLowerCase())));
  function card(g){return `<article class="store-card"><div class="store-cover">${icon(g)}</div><div class="store-card-body"><h3 title="${g.title}">${g.title}</h3><p>Free · HTML game</p><div class="store-tags"><span class="store-tag">${active==='Featured'?'Featured':active}</span></div><button type="button" onclick="window.loliteStorePlay(${JSON.stringify(g.file)})">▶ Play</button></div></article>`}
  function section(title,list){if(!list.length)return '';return `<section class="store-section"><div class="store-section-head"><h2>${title}</h2><button type="button" onclick="window.loliteStoreCategory(${JSON.stringify(title)})">View all →</button></div><div class="store-grid">${list.slice(0,10).map(card).join('')}</div></section>`}
  function renderStore(){
    const root=document.querySelector('.store-main');if(!root)return;
    const search=`<div class="store-top"><input class="store-search" aria-label="Search games" placeholder="Search all games…" value="${query.replace(/"/g,'&quot;')}" oninput="window.loliteStoreSearch(this.value)"></div>`;
    if(active==='Featured')root.innerHTML=search+`<div class="store-hero"><div><span class="store-badge">LOLITE GAME STORE</span><h1>All your games. One place.</h1><p>Browse every HTML game kept in Lolite OS — not just Baldi’s Basics. Everything is automatically organised into collections.</p></div><div style="font-size:58px">🎮</div></div>${section('Baldi’s Basics',games.filter(g=>categories['Baldi’s Basics'](g)))}${section('Horror',games.filter(g=>categories.Horror(g)))}${section('Racing',games.filter(g=>categories.Racing(g)))}${section('Puzzle',games.filter(g=>categories.Puzzle(g)))}${section('Arcade',games.filter(g=>categories.Arcade(g)))}${section('IO & Casual',games.filter(g=>categories['IO & Casual'](g)))}`;
    else {const list=filtered();root.innerHTML=search+`<div class="store-section"><div class="store-section-head"><h2>${active}</h2><span style="color:#7f8a9c;font-size:12px">${list.length} games</span></div>${list.length?`<div class="store-grid">${list.map(card).join('')}</div>`:'<div class="store-empty">No games match this search.</div>'}</div>`}
  }
  function shell(){return `<div class="store"><aside class="store-side"><div class="store-brand">lolite <span>store</span></div><nav class="store-nav">${Object.keys(categories).map(c=>`<button class="${active===c?'active':''}" type="button" onclick="window.loliteStoreCategory(${JSON.stringify(c)})">${c==='Featured'?'⌂':c==='Baldi’s Basics'?'📚':c==='Horror'?'👻':c==='Racing'?'🏎️':c==='Puzzle'?'🧩':c==='Arcade'?'🕹️':'🌐'} &nbsp; ${c}</button>`).join('')}</nav></aside><main class="store-main"><div class="store-empty">Loading your game collection…</div></main></div>`}
  window.loliteStoreCategory=c=>{active=c;query='';renderStore();document.querySelectorAll('.store-nav button').forEach(b=>b.classList.toggle('active',b.textContent.includes(c)))};
  window.loliteStoreSearch=q=>{query=q;renderStore()};
  window.loliteStorePlay=file=>{
    const game=games.find(g=>g.file===file);if(!game)return;
    const id='store-game-'+btoa(unescape(encodeURIComponent(file))).replace(/[^a-zA-Z0-9]/g,'').slice(0,24);
    openApp(id,game.title,820,660);
    setTimeout(()=>{
      const c=state.windows[id]?.el.querySelector('.content');if(!c)return;
      const safeTitle=game.title.replace(/[<>]/g,'');
      c.innerHTML=`<div class="store-player"><div class="store-player-head"><div class="store-player-title">🎮 ${safeTitle}</div><div class="store-player-actions"><button type="button" onclick="window.loliteStoreOpenSeparate(${JSON.stringify(game.url)})">Open separately</button></div></div><iframe class="store-frame" title="${safeTitle}" src="${game.url}" allow="fullscreen; gamepad; autoplay; pointer-lock" loading="eager"></iframe></div>`;
    },30);
  };
  window.loliteStoreOpenSeparate=url=>window.open(url,'_blank','noopener,noreferrer');

  const oldPage=window.page;window.page=function(id){if(id==='games'){setTimeout(discover,0);return shell()}return oldPage(id)};
  if(typeof window.renderIcons==='function'){const oldRender=window.renderIcons;window.renderIcons=function(){oldRender();const b=[...document.querySelectorAll('#icons .desktop-icon')].find(x=>x.textContent.includes('Games'));if(b){b.querySelector('b').textContent='🛒';b.querySelector('span').textContent='Game Store'}}}
  const start=document.getElementById('startBtn');if(start)start.addEventListener('click',()=>setTimeout(()=>{document.querySelectorAll('#start .start-list button').forEach(b=>{if(b.textContent.includes('Games'))b.innerHTML='🛒 &nbsp; Game Store'});},0));
})();
