/* Lolite OS startup and workspace styles.
 * Desktop keeps existing windows and taskbar; Browsing reuses the same apps in a one-pane interface.
 */
(()=>{
  'use strict';
  const APPS=[
    {id:'home',name:'Home',group:'main',desc:'Your Lolite starting point',glyph:'⌂'},
    {id:'games',name:'Game Store',group:'main',desc:'Find and play HTML games',glyph:'▣'},
    {id:'appstore',name:'App Store',group:'main',desc:'Explore Lolite apps',glyph:'▦'},
    {id:'files',name:'Files',group:'main',desc:'Your folders and documents',glyph:'▤'},
    {id:'chatroom',name:'Lolite Chat',group:'main',desc:'Messages, calls and conversations',glyph:'◉',optional:true},
    {id:'academy',name:'Lolite Academy',group:'main',desc:'Guides, courses and lessons',glyph:'◇',optional:true},
    {id:'lolite-quests',name:'Lolite Quests',group:'main',desc:'Activities, quests and rewards',glyph:'✧',optional:true},
    {id:'life-rp',name:'Lolite Life RP',group:'main',desc:'Roleplay, jobs and minigames',glyph:'◈',optional:true},
    {id:'minecraft18',name:'Minecraft 1.8',group:'more',desc:'Play Minecraft in Lolite',glyph:'▥'},
    {id:'cloud-gaming',name:'Cloud Gaming',group:'more',desc:'Stream games through supported services',glyph:'☁'},
    {id:'browser',name:'Ultraviolet Browser',group:'more',desc:'Browse the web',glyph:'◎'},
    {id:'scramjet',name:'Scramjet Browser',group:'more',desc:'Another browser option',glyph:'◌'},
    {id:'notes',name:'Quick Notes',group:'more',desc:'Jot down ideas',glyph:'≡',optional:true},
    {id:'calculator',name:'Calculator',group:'more',desc:'Work with numbers',glyph:'＋',optional:true},
    {id:'paint',name:'Lolite Paint',group:'more',desc:'Draw, colour and edit',glyph:'✎',optional:true},
    {id:'wallpaper-editor',name:'Wallpaper Editor',group:'more',desc:'Design your wallpaper',glyph:'◧',optional:true},
    {id:'world',name:'World Sandbox',group:'more',desc:'Build a tiny simulated world',glyph:'◈'},
    {id:'settings',name:'Settings',group:'more',desc:'Personalise your workspace',glyph:'⚙'}
  ];
  const $=selector=>document.querySelector(selector);
  let mode='chooser',shell=null,originalAnchor=null,observer=null,activeId='home';
  let searchQuery='',moreExpanded=false,backStack=[],userSelected=false;
  const appFor=id=>APPS.find(app=>app.id===id);
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function icon(app){
    const output=window.LoliteIcons?.tile?.(app.id);
    return typeof output==='string'&&output?output:'<span class="lb-icon-fallback" aria-hidden="true">'+escapeHTML(app.glyph)+'</span>';
  }
  function dispatch(){
    window.dispatchEvent(new CustomEvent('lolite:modechange',{detail:{mode,style:mode,device:'desktop'}}));
  }
  function startBase(){
    $('#loliteModeChooser')?.remove();
    $('#boot')?.remove();
    const desktop=$('#desktop');
    if(desktop){desktop.classList.remove('hidden');desktop.style.display='block';desktop.style.visibility='visible'}
    try{window.loadPrefs?.()}catch(error){console.warn('Lolite preferences',error)}
    try{window.renderIcons?.()}catch(error){console.warn('Lolite icons',error)}
  }
  function allWindows(){return Array.from(document.querySelectorAll('#windows .window'))}
  function detachBrowser(){
    if(observer){observer.disconnect();observer=null}
    const windows=$('#windows');
    if(originalAnchor?.parentNode&&windows){originalAnchor.parentNode.insertBefore(windows,originalAnchor);windows.style.removeProperty('display')}
    originalAnchor?.remove();originalAnchor=null;
    shell?.remove();shell=null;
    document.documentElement.classList.remove('browsing-mode','mobile-mode','tablet-mode','phone-mode');
    $('#icons')?.classList.remove('hidden');
    $('#taskbar')?.classList.remove('hidden');
    for(const w of allWindows())w.classList.remove('lb-current');
  }
  function startDesktop(){
    if(mode==='browsing')detachBrowser();
    mode='desktop';userSelected=true;
    startBase();
    document.documentElement.classList.remove('browsing-mode','mobile-mode','tablet-mode','phone-mode');
    try{localStorage.setItem('loliteUiStyle','desktop')}catch(_){}
    if(!allWindows().length)window.openApp?.('home','Home',760,600);
    dispatch();
  }
  function chooser(){
    if($('#loliteModeChooser'))return;
    const el=document.createElement('div');
    el.id='loliteModeChooser';
    el.setAttribute('role','dialog');
    el.setAttribute('aria-modal','true');
    el.setAttribute('aria-label','Choose Lolite OS style');
    el.innerHTML=[
      '<div class="lm-wrap">',
       '<div class="lm-brand"><img src="assets/lolite-glass-logo.svg" alt="">Lolite OS</div>',
       '<div class="lm-kicker">Choose your experience</div>',
       '<h1 class="lm-title">How do you want to use Lolite?</h1>',
       '<p class="lm-sub">Two ways to use the same apps, games and tools. Pick a classic desktop or an easy-to-browse workspace.</p>',
       '<div class="lm-options">',
        '<button id="lmDesktop" class="lm-choice" type="button">',
         '<div class="lm-preview lm-preview-desktop" aria-hidden="true"><div class="lm-win"></div><div class="lm-dock"><i></i><i></i><i></i><i></i><i></i></div></div>',
         '<div class="lm-choice-body"><div class="lm-choice-head"><strong>Desktop Style</strong><span>Classic</span></div>',
         '<p>Desktop shortcuts, draggable app windows, wallpaper and the taskbar.</p></div>',
        '</button>',
        '<button id="lmBrowsing" class="lm-choice" type="button">',
         '<div class="lm-preview lm-preview-browser" aria-hidden="true"><div class="lm-bar"><i></i><i></i></div><div class="lm-columns"><div class="lm-nav"><i></i><i></i><i></i><i></i></div><div class="lm-items"><i></i><i></i><i></i></div></div></div>',
         '<div class="lm-choice-body"><div class="lm-choice-head"><strong>Browsing Style</strong><span>New</span></div>',
         '<p>Lolite OS, a quick search bar, a tidy app sidebar and more apps in one click.</p></div>',
        '</button>',
       '</div><p class="lm-foot">Your existing files, games and settings stay in Lolite.</p>',
      '</div>'
    ].join('');
    document.body.appendChild(el);
    el.querySelector('#lmDesktop').addEventListener('click',startDesktop);
    el.querySelector('#lmBrowsing').addEventListener('click',startBrowsing);
    el.querySelector('#lmDesktop')?.focus({preventScroll:true});
  }
  function createBrowseShell(){
    const desktop=$('#desktop'),windows=$('#windows');
    if(!desktop||!windows)throw new Error('Lolite desktop container is unavailable');
    shell=document.createElement('div');
    shell.id='loliteBrowseShell';
    shell.innerHTML=[
     '<header class="lb-header">',
      '<button type="button" class="lb-brand" id="lbBrand" title="Lolite Home"><img src="assets/lolite-glass-logo.svg" alt=""><span><strong>Lolite OS</strong><em>BROWSING STYLE</em></span></button>',
      '<button type="button" class="lb-back" id="lbBack" title="Go back" aria-label="Go to previous app" hidden>←</button>',
      '<div class="lb-search-wrap">',
       '<span class="lb-search-symbol" aria-hidden="true">⌕</span>',
       '<input type="search" id="lbSearch" autocomplete="off" spellcheck="false" aria-label="Search apps" placeholder="Search apps, games, tools…">',
       '<button class="lb-search-clear" id="lbClear" aria-label="Clear search" title="Clear search" type="button" hidden>×</button>',
      '</div>',
      '<button type="button" class="lb-style-switch" id="lbSwitch" title="Switch between Desktop and Browsing Style">Change style</button>',
     '</header>',
     '<div class="lb-body"><aside class="lb-sidebar" aria-label="Lolite apps">',
      '<div class="lb-sidebar-scroll">',
       '<div class="lb-section-label">Apps</div><nav id="lbMainNav" aria-label="Main apps"></nav>',
       '<button id="lbMore" class="lb-more" type="button" aria-expanded="false" aria-controls="lbMoreList"><span class="lb-more-text">More Apps</span><span class="lb-more-arrow" aria-hidden="true">⌄</span></button>',
       '<nav id="lbMoreList" class="lb-more-list" aria-label="More apps" hidden></nav>',
      '</div>',
      '<div class="lb-sidebar-foot">LOLITE OS<br>All your apps. One place.</div>',
     '</aside>',
     '<main class="lb-main" id="lbMain"><div id="lbStage" class="lb-stage">',
       '<div id="lbWelcome" class="lb-welcome"></div>',
     '</div></main></div>'
    ].join('');
    desktop.appendChild(shell);
    originalAnchor=document.createComment('Lolite desktop window restoration anchor');
    windows.parentNode.insertBefore(originalAnchor,windows);
    shell.querySelector('#lbStage').appendChild(windows);
    shell.querySelector('#lbBrand').addEventListener('click',()=>navigate('home'));
    shell.querySelector('#lbSwitch').addEventListener('click',chooser);
    shell.querySelector('#lbBack').addEventListener('click',goBack);
    shell.querySelector('#lbMore').addEventListener('click',()=>{moreExpanded=!moreExpanded;renderNav()});
    shell.querySelector('#lbClear').addEventListener('click',()=>{const input=shell.querySelector('#lbSearch');input.value='';setQuery('');input.focus()});
    const input=shell.querySelector('#lbSearch');
    input.addEventListener('input',()=>setQuery(input.value));
    input.addEventListener('keydown',event=>{
      if(event.key==='Escape'){input.value='';setQuery('');input.blur()}
      if(event.key==='Enter'&&searchQuery){const matches=filteredApps();if(matches.length){event.preventDefault();navigate(matches[0].id)}else{const found=filteredGames();if(found.length){event.preventDefault();openGameSearch(found[0].title)}}}
    });
    shell.addEventListener('click',event=>{
      const gameButton=event.target.closest('[data-lb-game]');
      if(gameButton){event.preventDefault();openGameSearch(gameButton.dataset.lbGame);return}
      const button=event.target.closest('[data-lb-open]');
      if(button){event.preventDefault();navigate(button.dataset.lbOpen)}
    });
    observer=new MutationObserver(mutations=>{
      if(mode!=='browsing')return;
      const newWindows=[];
      for(const mutation of mutations){
        for(const node of mutation.addedNodes){
          if(node.nodeType===1&&node.matches?.('.window'))newWindows.push(node);
        }
      }
      if(newWindows.length)activate(newWindows[newWindows.length-1].dataset.windowId||activeId);
    });
    observer.observe(windows,{childList:true});
    renderNav();renderWelcome();
  }
  function filteredApps(){
    const q=searchQuery.trim().toLowerCase();
    if(!q)return APPS;
    return APPS.filter(app=>(app.name+' '+app.desc+' '+app.id).toLowerCase().includes(q));
  }
  function filteredGames(){
    const q=searchQuery.toLowerCase();
    if(q.length<2)return [];
    const catalog=Array.isArray(window.LoliteGenizyCatalog)?window.LoliteGenizyCatalog:[];
    const found=catalog.filter(entry=>entry.title.toLowerCase().includes(q))
      .map(entry=>({title:entry.title,id:entry.id}));
    const extra=['Angry Birds 2','Minecraft 1.8','Lolite Pong','Lolite 2048','World Sandbox'];
    for(const title of extra)if(title.toLowerCase().includes(q)&&!found.some(game=>game.title.toLowerCase()===title.toLowerCase()))found.push({title,id:0});
    return found.slice(0,40);
  }
  function openGameSearch(title){
    if(!title)return;
    navigate('games');
    window.setTimeout(()=>{
      if(mode==='browsing'&&typeof window.loliteStoreSearch==='function')window.loliteStoreSearch(title);
    },80);
  }
  function navigationMarkup(apps){
    return apps.map(app=>'<button type="button" class="lb-nav-item'+(activeId===app.id&&!searchQuery?' active':'')+'" data-lb-open="'+app.id+'" title="'+escapeHTML(app.name)+'">'+icon(app)+'<span class="lb-nav-text">'+escapeHTML(app.name)+'</span></button>').join('');
  }
  function renderNav(){
    if(!shell)return;
    const matches=filteredApps();
    const main=matches.filter(app=>app.group==='main');
    const other=matches.filter(app=>app.group==='more');
    shell.querySelector('#lbMainNav').innerHTML=navigationMarkup(main);
    const more=shell.querySelector('#lbMore');
    const expanded=moreExpanded||!!searchQuery;
    more.setAttribute('aria-expanded',String(expanded));
    const list=shell.querySelector('#lbMoreList');
    list.hidden=!expanded;
    list.innerHTML=navigationMarkup(other);
    if(!main.length&&!other.length)shell.querySelector('#lbMainNav').innerHTML='<div class="lb-section-label">No matching apps</div>';
    more.hidden=!!searchQuery&&!other.length;
    const back=shell.querySelector('#lbBack');
    back.hidden=backStack.length===0;
  }
  function tile(app){
    return '<button type="button" class="lb-tile" data-lb-open="'+app.id+'"><span class="lb-tile-symbol">'+icon(app)+'</span><strong>'+escapeHTML(app.name)+'</strong><small>'+escapeHTML(app.desc)+'</small></button>';
  }
  function renderWelcome(){
    if(!shell)return;
    const welcome=shell.querySelector('#lbWelcome');
    if(searchQuery){
      const matches=filteredApps();
      const games=filteredGames();
      welcome.innerHTML='<div class="lb-welcome-inner"><div class="lb-section-header"><h2>Apps</h2><span>'+matches.length+' matching apps</span></div>'+
        (matches.length?'<div class="lb-card-grid">'+matches.map(tile).join('')+'</div>':'<p class="lb-empty">No matching apps.</p>')+
        '<div class="lb-section-header" style="margin-top:29px"><h2>Games</h2><span>'+games.length+(games.length===40?'+':'')+' results</span></div>'+
        (games.length?'<div class="lb-card-grid">'+games.map(game=>'<button class="lb-tile" data-lb-game="'+escapeHTML(game.title)+'" type="button"><span class="lb-tile-symbol"><span class="lb-icon-fallback">▣</span></span><strong>'+escapeHTML(game.title)+'</strong><small>Find in Game Store →</small></button>').join('')+'</div>':'<p class="lb-empty">No matching games.</p>')+
      '</div>';
    }else{
      const essentials=APPS.filter(app=>app.group==='main'&&app.id!=='home');
      const more=APPS.filter(app=>app.group==='more').slice(0,8);
      welcome.innerHTML=[
       '<div class="lb-welcome-inner">',
        '<section class="lb-welcome-hero"><span class="lb-kicker">Your space, made simpler</span>',
         '<h1>Welcome to<br>Lolite OS.</h1>',
         '<p>Your games, apps, files and creative tools are all here. Pick an app from the sidebar or use the search bar to find it instantly.</p>',
         '<button type="button" class="lb-primary" data-lb-open="games">Explore Game Store →</button>',
        '</section>',
        '<div class="lb-section-header"><h2>Your apps</h2><span>One click to open</span></div>',
        '<div class="lb-card-grid">'+essentials.map(tile).join('')+'</div>',
        '<div class="lb-section-header" style="margin-top:32px"><h2>More to explore</h2><span>Tools, games and extras</span></div>',
        '<div class="lb-card-grid">'+more.map(tile).join('')+'</div>',
        '<p class="lb-footer-message">Switch to Desktop Style anytime using Change style above.</p>',
       '</div>'
      ].join('');
    }
  }
  function showStage(){
    if(!shell)return;
    const showingHome=activeId==='home'||!!searchQuery;
    shell.querySelector('#lbWelcome').hidden=!showingHome;
    const windows=shell.querySelector('#windows');
    if(windows)windows.style.display=showingHome?'none':'block';
    for(const win of allWindows()){
      const current=win.dataset.windowId===activeId;
      win.classList.toggle('lb-current',current);
      if(current&&win.style.display==='none')win.style.display='';
    }
  }
  function activate(id){
    if(mode!=='browsing')return;
    const next=id||'home';
    if(next!==activeId){
      if(activeId)backStack.push(activeId);
      if(backStack.length>30)backStack.shift();
    }
    activeId=next;
    showStage();renderNav();
  }
  function goBack(){
    if(!backStack.length){navigate('home');return}
    const last=backStack.pop();
    activeId=last;
    if(activeId!=='home'&&!allWindows().some(w=>w.dataset.windowId===activeId)){activeId='home'}
    showStage();renderNav();
  }
  function setQuery(q){
    searchQuery=String(q||'').trim();
    const clear=shell?.querySelector('#lbClear');if(clear)clear.hidden=!searchQuery;
    renderNav();renderWelcome();showStage();
  }
  function navigate(id){
    const app=appFor(id);
    if(!app)return;
    if(searchQuery){searchQuery='';const input=shell.querySelector('#lbSearch');input.value='';renderWelcome()}
    if(id==='home'){activate('home');return}
    const existing=allWindows().find(w=>w.dataset.windowId===id);
    if(existing){window.restoreWin?.(id);activate(id);return}
    if(id==='minecraft18'){
      if(typeof window.lolitePlayMinecraft==='function')window.lolitePlayMinecraft();
      else window.openApp?.('minecraft18',app.name,960,680);
    }else if(app.optional&&typeof window.loliteOpenApp==='function'){
      window.loliteOpenApp(id);
    }else{
      window.openApp?.(id,app.name,1100,740);
    }
    const created=allWindows().find(w=>w.dataset.windowId===id);
    if(created)activate(id);
    renderNav();
  }
  function startBrowsing(){
    if(mode==='browsing'){$('#loliteModeChooser')?.remove();return}
    startBase();
    if(mode==='desktop'&&shell)detachBrowser();
    mode='browsing';userSelected=true;
    document.documentElement.classList.remove('mobile-mode','phone-mode','tablet-mode');
    document.documentElement.classList.add('browsing-mode');
    $('#icons')?.classList.add('hidden');
    $('#taskbar')?.classList.add('hidden');
    try{
      createBrowseShell();
      activeId='home';backStack=[];searchQuery='';moreExpanded=false;
      renderNav();renderWelcome();showStage();
      try{localStorage.setItem('loliteUiStyle','browsing')}catch(_){}
      dispatch();
    }catch(error){
      console.error('Lolite Browsing Style could not start',error);
      mode='desktop';detachBrowser();startBase();
      window.openApp?.('home','Home',760,600);
      window.alert('Browsing Style could not load. Desktop Style has been restored.');
    }
  }
  function init(){
    window.LoliteDeviceMode={
      showChooser:chooser,
      startDesktop,
      startBrowsing,
      mode:()=>({mode,device:'desktop',style:mode}),
      openApp:navigate
    };
    window.LoliteUIStyle=window.LoliteDeviceMode;
    window.addEventListener('lolite:splashdone',()=>{if(!userSelected)chooser()},{once:true});
    if(!$('#lolite-splash'))setTimeout(chooser,200);
    setTimeout(()=>{if(!userSelected&&!$('#loliteModeChooser'))chooser()},4600);
    // If a legacy Mobile Style choice was saved, it is retired; retain all other settings.
    try{const old=localStorage.getItem('loliteUiStyle');if(old==='mobile'||old==='phone'||old==='tablet')localStorage.removeItem('loliteUiStyle')}catch(_){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
