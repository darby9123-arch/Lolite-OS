/* Lolite OS Game Store — Steam-inspired catalogue UI backed by html games/. */
(()=>{
  const STORE_CSS=`
  .store{display:grid;grid-template-columns:190px 1fr;height:100%;min-height:520px;background:#10131a;color:#e8edf5;margin:-14px;overflow:hidden}
  .store-side{background:#0b0e14;border-right:1px solid #252b36;padding:18px 12px;overflow:auto}
  .store-brand{font-size:22px;font-weight:800;padding:4px 10px 18px}.store-brand span{opacity:.55;font-weight:500}
  .store-nav{display:grid;gap:4px}.store-nav button{border:0;background:transparent;color:#aeb7c7;text-align:left;padding:10px 12px;border-radius:8px;cursor:pointer;font:inherit}.store-nav button:hover,.store-nav button.active{background:#1d2430;color:#fff}
  .store-main{overflow:auto;padding:24px 26px 40px}.store-top{display:flex;gap:12px;align-items:center;margin-bottom:22px}.store-search{flex:1;background:#181e28;border:1px solid #2b3442;border-radius:8px;padding:11px 14px;color:#fff;outline:none}.store-search:focus{border-color:#6c7cff}
  .store-hero{background:linear-gradient(135deg,#27395e,#151c2b 58%,#12161e);border:1px solid #334158;border-radius:12px;padding:28px;min-height:150px;display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:28px}.store-hero h1{margin:4px 0 8px;font-size:30px}.store-hero p{margin:0;color:#aeb9ca;max-width:620px}.store-badge{background:#6b7cff;color:#fff;padding:7px 10px;border-radius:6px;font-size:12px;font-weight:800;letter-spacing:.5px}
  .store-section{margin:0 0 30px}.store-section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.store-section h2{font-size:19px;margin:0}.store-section-head button{border:0;background:none;color:#8293ff;cursor:pointer}.store-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}.store-card{background:#181e27;border:1px solid #272f3b;border-radius:9px;overflow:hidden;transition:transform .16s,border-color .16s,background .16s}.store-card:hover{transform:translateY(-2px);border-color:#46526a;background:#1c2330}.store-cover{height:104px;background:linear-gradient(135deg,#29334a,#151923);display:flex;align-items:center;justify-content:center;font-size:35px}.store-card-body{padding:12px}.store-card h3{font-size:14px;margin:0 0 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.store-card p{font-size:12px;color:#8995a7;margin:0 0 11px}.store-card button{width:100%;border:0;border-radius:6px;padding:8px;background:#6575ed;color:white;cursor:pointer;font-weight:700}.store-card button:hover{background:#7484ff}.store-empty{padding:35px;text-align:center;color:#8792a3;background:#151a22;border-radius:10px}
  .store-tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.store-tag{font-size:11px;color:#9da8b9;background:#202733;border-radius:20px;padding:4px 8px}
  @media(max-width:720px){.store{grid-template-columns:1fr}.store-side{display:none}.store-main{padding:16px}.store-hero{padding:20px}.store-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  const style=document.createElement('style');style.textContent=STORE_CSS;document.head.appendChild(style);

  const categories={
    'Featured':g=>true,
    'Baldi’s Basics':g=>/baldi|clbald/i.test(g.file),
    'Horror':g=>/fnaf|granny|lobot|nightmare|zombie|shiftatmidnight/i.test(g.file),
    'Racing':g=>/racing|crazycars|moto|slope|escaperoad|parking|rocketleague|derby|wheely/i.test(g.file),
    'Puzzle':g=>/2048|sokoban|blockblast|cookie|cuttherope|fireboy|infinitecraft|ovo|paperio|stickmanhook|tinyfishing/i.test(g.file),
    'Arcade':g=>/pvz|angrybirds|mario|subway|templerun|vex|snowrider|survivorio|melon|wrestle|gorilla/i.test(g.file),
    'IO & Casual':g=>/io|growagarden|hole|bitlife|pixel|fallguys|minecraft/i.test(g.file)
  };

  const pretty=s=>s.replace(/^cl/i,'').replace(/^lolite-/i,'').replace(/\.html?$/i,'').replace(/[_-]+/g,' ').replace(/\b\w/g,m=>m.toUpperCase()).replace(/Pvz/i,'PVZ').replace(/Fnaf/gi,'FNAF').replace(/Gta/gi,'GTA');
  const icon=g=>/baldi/i.test(g.file)?'📚':/fnaf|granny|horror|nightmare/i.test(g.file)?'👻':/racing|moto|slope|cars|parking/i.test(g.file)?'🏎️':/pvz|mario|angrybirds/i.test(g.file)?'🎮':/puzzle|2048|sokoban|blockblast/i.test(g.file)?'🧩':'🎮';
  let games=[],loaded=false,active='Featured',query='';

  async function discover(){
    if(loaded)return;
    try{
      const r=await fetch('https://api.github.com/repos/darby9123-arch/Lolite-OS/contents/html%20games');
      if(!r.ok)throw new Error('GitHub contents unavailable');
      const data=await r.json();
      games=data.filter(x=>x.type==='file'&&/\.html?$/i.test(x.name)).map(x=>({file:x.name,title:pretty(x.name),url:'html games/'+x.name}));
    }catch(e){
      games=['clbaldisbasics.html','clbaldisbasicsremaster.html','clFNAF.html','clFNAF2.html','clFNAF3.html','clFNAF4.html','clgrowagarden.html','clgta3.html','clminecraftpocketedition.html','clsupermariobros.html','clangrybirds2.html','clcookieclicker.html'].map(file=>({file,title:pretty(file),url:'html games/'+file}));
    }
    loaded=true;renderStore();
  }

  function filtered(){
    const fn=categories[active]||(()=>true);
    return games.filter(g=>fn(g)&&(!query||g.title.toLowerCase().includes(query.toLowerCase())));
  }
  function card(g){
    return `<article class="store-card"><div class="store-cover">${icon(g)}</div><div class="store-card-body"><h3 title="${g.title}">${g.title}</h3><p>Free · HTML game</p><div class="store-tags"><span class="store-tag">${active==='Featured'?'Featured':active}</span></div><button onclick="window.loliteStorePlay(${JSON.stringify(g.file)})">Play</button></div></article>`;
  }
  function section(title,list){if(!list.length)return '';return `<section class="store-section"><div class="store-section-head"><h2>${title}</h2><button onclick="window.loliteStoreCategory(${JSON.stringify(title)})">View all</button></div><div class="store-grid">${list.slice(0,10).map(card).join('')}</div></section>`}

  function renderStore(){
    const root=document.querySelector('.store-main');if(!root)return;
    if(active==='Featured'){
      const baldi=games.filter(g=>categories['Baldi’s Basics'](g));
      root.innerHTML=`<div class="store-top"><input class="store-search" placeholder="Search the Game Store" value="${query.replace(/"/g,'&quot;')}" oninput="window.loliteStoreSearch(this.value)"></div><div class="store-hero"><div><span class="store-badge">LOLITE GAME STORE</span><h1>Discover your next game</h1><p>Browse the games kept inside Lolite OS, organised into familiar collections and categories.</p></div><div style="font-size:56px">🎮</div></div>${section('Baldi’s Basics',baldi)}${section('Horror',games.filter(g=>categories.Horror(g)))}${section('Racing',games.filter(g=>categories.Racing(g)))}${section('Puzzle',games.filter(g=>categories.Puzzle(g)))}`;
    }else{
      const list=filtered();root.innerHTML=`<div class="store-top"><input class="store-search" placeholder="Search ${active}" value="${query.replace(/"/g,'&quot;')}" oninput="window.loliteStoreSearch(this.value)"></div><div class="store-section"><div class="store-section-head"><h2>${active}</h2><span style="color:#7f8a9c;font-size:12px">${list.length} games</span></div>${list.length?`<div class="store-grid">${list.map(card).join('')}</div>`:'<div class="store-empty">No games match this search.</div>'}</div>`;
    }
  }
  function shell(){
    return `<div class="store"><aside class="store-side"><div class="store-brand">lolite <span>store</span></div><nav class="store-nav">${Object.keys(categories).map(c=>`<button class="${active===c?'active':''}" onclick="window.loliteStoreCategory(${JSON.stringify(c)})">${c==='Featured'?'🏠 ':c==='Baldi’s Basics'?'📚 ':c==='Horror'?'👻 ':c==='Racing'?'🏎️ ':c==='Puzzle'?'🧩 ':c==='Arcade'?'🕹️ ':'🌐 '}${c}</button>`).join('')}</nav></aside><main class="store-main"><div class="store-empty">Loading your game collection…</div></main></div>`;
  }
  window.loliteStoreCategory=c=>{active=c;query='';renderStore();document.querySelectorAll('.store-nav button').forEach(b=>b.classList.toggle('active',b.textContent.trim().endsWith(c)||b.textContent.includes(c)))};
  window.loliteStoreSearch=q=>{query=q;renderStore()};
  window.loliteStorePlay=file=>{const game=games.find(g=>g.file===file);if(!game)return;const id='store-game-'+btoa(unescape(encodeURIComponent(file))).replace(/[^a-zA-Z0-9]/g,'').slice(0,24);openApp(id,game.title,760,620);setTimeout(()=>{const c=state.windows[id]?.el.querySelector('.content');if(c)c.innerHTML=`<iframe title="${game.title}" src="${encodeURI(game.url)}" allow="fullscreen; gamepad; autoplay; pointer-lock" style="width:100%;height:100%;min-height:500px;border:0;border-radius:10px;background:#080b10"></iframe>`},0)};

  const oldPage=window.page;
  window.page=function(id){if(id==='games'){setTimeout(discover,0);return shell()}return oldPage(id)};

  if(typeof window.renderIcons==='function'){
    const oldRender=window.renderIcons;
    window.renderIcons=function(){oldRender();const b=[...document.querySelectorAll('#icons .desktop-icon')].find(x=>x.textContent.includes('Games'));if(b){b.querySelector('b').textContent='🛒';b.querySelector('span').textContent='Game Store'}};
  }
  const start=document.getElementById('startBtn');if(start)start.addEventListener('click',()=>setTimeout(()=>{document.querySelectorAll('#start .start-list button').forEach(b=>{if(b.textContent.includes('Games'))b.innerHTML='🛒 &nbsp; Game Store'});},0));
})();
