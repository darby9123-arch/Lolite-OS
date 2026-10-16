/* Presentation-only integration. Existing apps retain their renderers and actions. */
(()=>{
  'use strict';
  const icon=id=>window.LoliteIcons?.tile(id)||'';
  const apps=[['home','Home','Your workspace at a glance'],['games','Game Store','Find your next favourite'],['files','Files','Everything in its place'],['appstore','App Store','Add something useful'],['chatroom','Lolite Chat','Keep the conversation going'],['settings','Settings','Make Lolite feel like you']];
  const launch=id=>{const app=apps.find(a=>a[0]===id);if(app)window.openApp(id,app[1],id==='settings'?760:960,650)};
  const basePage=window.page;
  window.page=function(id){
    if(id!=='home')return basePage(id);
    return `<div class="ui-home"><header class="ui-home-top"><div><div class="ui-eyebrow">Your personal workspace</div><h1>Welcome to Lolite.</h1><p>A little space for everything you do.</p></div><span class="ui-badge">LOLITE OS · 3.12</span></header><section class="ui-home-hero"><div class="ui-eyebrow">Play. Create. Make it yours.</div><h2>Your desktop.<br>Your possibilities.</h2><p>Jump into a game, find a new tool, or shape a workspace that feels like home.</p><button class="primary" data-ui-app="games">Explore Game Store &nbsp; →</button></section><div class="ui-home-section"><h2>Make yourself at home</h2><span>Your essentials</span></div><div class="ui-home-grid">${apps.slice(1).map(a=>`<button class="ui-home-card" data-ui-app="${a[0]}">${icon(a[0])}<b>${a[1]} &nbsp; ↗</b><small>${a[2]}</small></button>`).join('')}<button class="ui-home-card" data-ui-action="appearance">${icon('wallpaper')}<b>A fresh perspective &nbsp; ↗</b><small>Wallpapers, colours and little details</small></button></div><div class="ui-home-note"><strong>Fresh look. Familiar Lolite.</strong><br>A coordinated desktop, cleaner app surfaces and a new Start menu. Your files and preferences stay yours.</div></div>`;
  };
  document.addEventListener('click',e=>{const b=e.target.closest('[data-ui-app],[data-ui-action]');if(!b)return;if(b.dataset.uiApp)launch(b.dataset.uiApp);else if(b.dataset.uiAction==='appearance')launch('settings');else if(b.dataset.uiAction==='search')window.openSearch?.();document.getElementById('start')?.classList.add('hidden');document.getElementById('startBtn')?.setAttribute('aria-expanded','false')});
  function init(){
    const start=document.getElementById('start'),button=document.getElementById('startBtn');
    button.innerHTML='<img src="assets/lolite-glass-logo.svg" alt="">';button.setAttribute('aria-label','Start');button.setAttribute('aria-controls','start');button.setAttribute('aria-expanded','false');
    button.onclick=()=>{const show=start.classList.contains('hidden');start.classList.toggle('hidden',!show);button.setAttribute('aria-expanded',String(show));document.getElementById('searchPanel')?.classList.add('hidden');if(!show)return;start.innerHTML=`<button class="ui-start-search" data-ui-action="search">⌕ &nbsp; Search your workspace</button><div class="ui-start-heading"><b>Pinned apps</b><span>Made for your everyday</span></div><div class="ui-start-grid">${apps.map(a=>`<button data-ui-app="${a[0]}">${icon(a[0])}<span>${a[1]}</span></button>`).join('')}</div><footer class="ui-start-footer"><div><b>Lolite OS</b><br><small>Your space. Your pace.</small></div><button data-ui-app="settings">Settings &nbsp; ↗</button></footer>`;start.querySelector('button')?.focus()};
    document.getElementById('settingsBtn')?.setAttribute('aria-label','Settings');document.getElementById('searchBtn')?.setAttribute('aria-label','Search apps');
    document.addEventListener('pointerdown',e=>{if(!start.contains(e.target)&&!button.contains(e.target)){start.classList.add('hidden');button.setAttribute('aria-expanded','false')}});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){button.setAttribute('aria-expanded','false');if(start.contains(document.activeElement))button.focus()}});
    function enhance(node){
      if(node.nodeType!==1)return;
      const windows=[...(node.matches('.window')?[node]:[]),...node.querySelectorAll('.window')];
      for(const w of windows){for(const [cls,label] of [['min','Minimise'],['max','Maximise or restore'],['close','Close']]){const b=w.querySelector('.controls .'+cls);if(b){b.setAttribute('aria-label',label);b.title=label}}}
      const chooser=node.matches('#loliteModeChooser')?node:node.querySelector('#loliteModeChooser');
      if(chooser){const arts=chooser.querySelectorAll('.lm-art');const drawings=['<rect x="9" y="8" width="58" height="38" rx="3"/><path d="M28 56h20M38 46v10"/>','<rect x="16" y="4" width="28" height="54" rx="4"/><path d="M26 10h8M27 51h6"/><rect x="50" y="19" width="20" height="35" rx="3"/>'];arts.forEach((a,i)=>{a.innerHTML='<svg viewBox="0 0 80 64" aria-hidden="true">'+drawings[i]+'</svg>'})}
    }
    enhance(document.body);new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)enhance(n)}).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
