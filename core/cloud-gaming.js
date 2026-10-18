/* Lolite OS Cloud Gaming - official-provider launcher.
   Independent implementation inspired by catalog-style cloud gaming interfaces.
   Does not reuse the third-party SVG, connect to unverified APIs, or request API keys. */
(() => {
  'use strict';

  const providers = Object.freeze([
    {
      id: 'xbox', name: 'Xbox Cloud Gaming', short: 'Xbox', mark: 'X',
      url: 'https://www.xbox.com/en-AU/play',
      category: 'Game catalogue', region: 'Australia supported',
      subtitle: 'Play supported Xbox titles from the cloud.',
      details: 'Requires a Microsoft/Xbox account. Access to most titles depends on an eligible Game Pass plan or game entitlement.',
      gradient: 'linear-gradient(130deg,#176b42,#082f28)', accent: '#6be6a1',
      tags: ['Cloud library', 'Controller', 'Australia']
    },
    {
      id: 'geforce', name: 'NVIDIA GeForce NOW', short: 'GeForce NOW', mark: 'G',
      url: 'https://play.geforcenow.com/',
      category: 'PC games', region: 'Check regional service',
      subtitle: 'Stream supported PC games using GeForce NOW.',
      details: 'An NVIDIA or regional partner account is required. Games, device support, membership options and regional access vary.',
      gradient: 'linear-gradient(130deg,#387b1d,#182917)', accent: '#b5ff85',
      tags: ['PC games', 'Browser', 'Account']
    },
    {
      id: 'boosteroid', name: 'Boosteroid', short: 'Boosteroid', mark: 'B',
      url: 'https://boosteroid.com/',
      category: 'PC games', region: 'Check availability',
      subtitle: 'A cloud PC gaming service with a browser option.',
      details: 'Requires a Boosteroid account and usually a subscription. Check local availability and your game licences.',
      gradient: 'linear-gradient(130deg,#344edb,#141d56)', accent: '#b7c5ff',
      tags: ['PC games', 'Browser', 'Subscription']
    },
    {
      id: 'luna', name: 'Amazon Luna', short: 'Luna', mark: 'L',
      url: 'https://luna.amazon.com/',
      category: 'Cloud library', region: 'Not available in Australia',
      subtitle: 'Amazon’s game-streaming platform in supported countries.',
      details: 'Amazon account and regional availability required. Amazon Luna is not currently offered in Australia.',
      gradient: 'linear-gradient(130deg,#6244ad,#291b55)', accent: '#d2baff',
      tags: ['Game catalogue', 'Select countries', 'Account']
    }
  ]);

  const state = { query:'', view:'all', filter:'all' };
  const storageKey = 'loliteCloudGamingFavorites';
  const safeHTML = input => String(input).replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const favorites = () => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(data) ? data.filter(id => providers.some(p => p.id===id)) : [];
    } catch { return []; }
  };
  const saveFavorites = ids => {
    try { localStorage.setItem(storageKey, JSON.stringify(ids)); } catch {}
  };
  const icon = name => window.LoliteIcons?.tile(name) || '';
  const isKnown = id => providers.some(p => p.id===id);

  const css = `
    .cg-root{height:100%;box-sizing:border-box;overflow:auto;margin:-18px;padding:26px;background:linear-gradient(155deg,#0e1522,#111826 38%,#090e16);color:#eef5ff;font:inherit}
    .cg-root *{box-sizing:border-box}
    .cg-top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:20px}
    .cg-eyebrow{color:#91a6ca;text-transform:uppercase;letter-spacing:1.9px;font-size:10px;font-weight:800}
    .cg-top h1{font-size:27px;line-height:1.15;margin:6px 0;font-weight:780;letter-spacing:-.8px}
    .cg-top p,.cg-muted{color:#a7b5c9;font-size:12px;line-height:1.65;margin:0}
    .cg-brand-icon{width:48px;height:48px;display:grid;place-items:center;border-radius:13px;background:linear-gradient(135deg,#3152aa,#192754);border:1px solid #455a98}
    .cg-brand-icon .lolite-icon{width:34px;height:34px}
    .cg-hero{border:1px solid #34486a;border-radius:16px;padding:22px 25px;margin-bottom:22px;background:radial-gradient(ellipse at 91% 0%,#397bba66,transparent 45%),linear-gradient(110deg,#172946,#111a2d 70%);box-shadow:0 12px 28px #0002}
    .cg-hero h2{font-size:20px;margin:7px 0 8px;letter-spacing:-.5px}
    .cg-hero p{max-width:580px;font-size:13px;line-height:1.6;color:#bdd0e6;margin:0}
    .cg-flags{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}
    .cg-flag{padding:6px 9px;border-radius:7px;border:1px solid #3c567c;background:#10243f;color:#cfddf2;font-size:11px}
    .cg-filters{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:20px 0 16px}
    .cg-search{background:#101a29;border:1px solid #39465a;border-radius:9px;color:#f1f6ff;padding:11px 13px;min-width:175px;flex:1;outline:none}
    .cg-search:focus{border-color:#83b8ff;box-shadow:0 0 0 2px #448cff22}
    .cg-pill{border:1px solid #3a4758!important;background:#172232!important;color:#aec0d7!important;padding:9px 13px!important;border-radius:8px!important;width:auto!important;font-size:12px!important;white-space:nowrap;cursor:pointer}
    .cg-pill[aria-pressed="true"]{background:#365c9e!important;border-color:#698cd5!important;color:white!important}
    .cg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(238px,1fr));gap:14px}
    .cg-card{border:1px solid #35445a;border-radius:14px;overflow:hidden;background:#151f2f;display:flex;flex-direction:column;min-width:0;transition:transform .18s,border-color .18s}
    .cg-card:hover{transform:translateY(-2px);border-color:#668bc6}
    .cg-cover{background:var(--cg-bg);padding:21px;min-height:118px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
    .cg-letter{width:52px;height:52px;border:1px solid #ffffff60;background:#ffffff17;border-radius:14px;display:grid;place-items:center;font-size:31px;font-weight:850;color:white}
    .cg-category{font-size:10px;letter-spacing:.7px;text-transform:uppercase;color:#e5eafd;background:#ffffff1c;border-radius:7px;padding:7px 9px}
    .cg-body{padding:17px 17px 15px;display:flex;flex-direction:column;flex:1}
    .cg-body h3{font-size:16px;margin:0 0 5px;color:#f3f8ff}
    .cg-body p{font-size:12px;color:#abbad0;line-height:1.6;margin:0}
    .cg-region{font-size:11px;color:var(--cg-accent);font-weight:700;margin:13px 0 6px}
    .cg-details{font-size:11px!important;color:#96a9c3!important;line-height:1.55!important;margin:0 0 16px!important;flex:1}
    .cg-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:15px}
    .cg-tags span{font-size:10px;color:#a5b4ca;background:#213148;border-radius:5px;padding:5px 7px}
    .cg-actions{display:flex;gap:8px;margin-top:auto}
    .cg-launch{flex:1;display:flex;align-items:center;justify-content:center;background:#467ed8;border:1px solid #6d9cef;border-radius:8px;padding:9px 12px;color:#fff!important;font-size:12px;font-weight:800;text-decoration:none!important;min-height:37px}
    .cg-launch:hover{background:#548eea}
    .cg-fav{border:1px solid #45556e!important;border-radius:8px!important;background:#1b2c43!important;color:#e2eaff!important;width:39px!important;flex-shrink:0;min-height:37px;cursor:pointer}
    .cg-fav[aria-pressed="true"]{color:#ffe297!important;border-color:#b39962!important}
    .cg-note{border:1px solid #37475e;border-radius:12px;padding:16px 18px;margin-top:20px;background:#131d2c}
    .cg-note h3{font-size:13px;margin:0 0 6px}
    .cg-note p{font-size:12px;line-height:1.6;color:#a5b5ce;margin:0}
    .cg-empty{grid-column:1/-1;text-align:center;padding:45px 16px;color:#bbcbe1;border:1px dashed #3a4a62;border-radius:12px}
    @media(max-width:620px){.cg-root{padding:16px;margin:-18px}.cg-hero{padding:18px}.cg-top h1{font-size:23px}.cg-grid{grid-template-columns:1fr}.cg-search{flex-basis:100%}}
    @media(prefers-reduced-motion:reduce){.cg-card{transition:none}.cg-card:hover{transform:none}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function card(p, favIds) {
    const active = favIds.includes(p.id);
    return `<article class="cg-card" style="--cg-bg:${p.gradient};--cg-accent:${p.accent}" data-provider="${p.id}">
      <div class="cg-cover"><div class="cg-letter" aria-hidden="true">${p.mark}</div><span class="cg-category">${safeHTML(p.category)}</span></div>
      <div class="cg-body">
        <h3>${safeHTML(p.name)}</h3>
        <p>${safeHTML(p.subtitle)}</p>
        <div class="cg-region">${safeHTML(p.region)}</div>
        <p class="cg-details">${safeHTML(p.details)}</p>
        <div class="cg-tags">${p.tags.map(tag=>'<span>'+safeHTML(tag)+'</span>').join('')}</div>
        <div class="cg-actions">
          <a class="cg-launch" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="Open ${safeHTML(p.name)} official cloud gaming website">Launch ${safeHTML(p.short)} ↗</a>
          <button class="cg-fav" type="button" data-cg-favorite="${p.id}" aria-pressed="${active}" title="${active?'Remove favourite':'Add favourite'}" aria-label="${active?'Remove '+p.name+' from favourites':'Add '+p.name+' to favourites'}">${active?'★':'☆'}</button>
        </div>
      </div>
    </article>`;
  }

  function page() {
    return `<div class="cg-root" id="lolite-cloud-gaming">
      <header class="cg-top"><div><div class="cg-eyebrow">LOLITE GAME HUB</div><h1>Cloud Gaming</h1><p>Find games and stream from an official cloud gaming service.</p></div><div class="cg-brand-icon">${icon('cloud-gaming')}</div></header>
      <section class="cg-hero">
        <div class="cg-eyebrow">PLAY WITHOUT A BIG DOWNLOAD</div>
        <h2>Your games. More ways to play.</h2>
        <p>Choose a streaming provider, sign in with that provider, and play supported games on its cloud servers. Lolite is your launcher; game availability and accounts are managed by each service.</p>
        <div class="cg-flags"><span class="cg-flag">Streaming services</span><span class="cg-flag">Your own provider account</span><span class="cg-flag">Official websites only</span></div>
      </section>
      <div class="cg-filters">
        <input type="search" class="cg-search" aria-label="Search cloud gaming services" placeholder="Search services or features…" autocomplete="off">
        <button type="button" class="cg-pill" data-cg-filter="all" aria-pressed="true">All services</button>
        <button type="button" class="cg-pill" data-cg-filter="favorites" aria-pressed="false">★ Favourites</button>
        <button type="button" class="cg-pill" data-cg-filter="australia" aria-pressed="false">Australia</button>
      </div>
      <section class="cg-grid" aria-label="Official cloud gaming services"></section>
      <section class="cg-note"><h3>How cloud gaming works</h3>
      <p>A cloud provider runs the game on a remote computer and streams the picture and controls to your device. You may need a compatible browser, controller, game licence or subscription. Providers may open a new tab rather than an embedded Lolite window due to streaming security requirements. Never paste third-party API keys into unverified websites.</p></section>
    </div>`;
  }

  function render(root) {
    if(!root)return;
    const fav = favorites();
    const query = state.query.toLowerCase();
    const visible = providers.filter(p=>{
      if(state.filter==='favorites'&&!fav.includes(p.id))return false;
      if(state.filter==='australia'&&p.region!=='Australia supported')return false;
      return !query || [p.name,p.short,p.subtitle,p.category,p.region,p.tags.join(' ')].join(' ').toLowerCase().includes(query);
    });
    const grid = root.querySelector('.cg-grid');
    if(grid)grid.innerHTML=visible.length
      ?visible.map(p=>card(p,fav)).join('')
      :'<div class="cg-empty">No services match your search. Try another term or filter.</div>';
    root.querySelectorAll('[data-cg-filter]').forEach(button=>{
      button.setAttribute('aria-pressed',String(button.dataset.cgFilter===state.filter));
    });
  }

  // Event delegation keeps controls working after switching filters or favourites.
  document.addEventListener('input',event=>{
    if(!event.target.matches?.('#lolite-cloud-gaming .cg-search'))return;
    state.query=event.target.value.trim();
    render(event.target.closest('#lolite-cloud-gaming'));
  });
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('#lolite-cloud-gaming [data-cg-filter], #lolite-cloud-gaming [data-cg-favorite]');
    if(!button)return;
    const root=button.closest('#lolite-cloud-gaming');
    if(button.dataset.cgFilter){
      state.filter=button.dataset.cgFilter;
      render(root);
    }else{
      const id=button.dataset.cgFavorite;
      if(!isKnown(id))return;
      const next=favorites();
      if(next.includes(id))next.splice(next.indexOf(id),1);
      else next.push(id);
      saveFavorites(next);
      render(root);
    }
  });

  const previousPage=window.page;
  window.page=id=>id==='cloud-gaming'?page():previousPage(id);
  const previousOpen=window.openApp;
  window.openApp=function(id,title,w,h){
    previousOpen(id,title||(id==='cloud-gaming'?'Cloud Gaming':title),w||950,h||690);
    if(id==='cloud-gaming'){
      const root=document.getElementById('lolite-cloud-gaming');
      if(root){
        const search=root.querySelector('.cg-search');
        if(search)search.value=state.query;
        render(root);
      }
    }
  };
  window.LoliteCloudGaming={open:()=>window.openApp('cloud-gaming','Cloud Gaming',950,690)};
})();
