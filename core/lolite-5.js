/* Lolite OS 5.0 — non-destructive desktop upgrades layered on existing apps. */
(()=>{'use strict';
 const $=s=>document.querySelector(s);
 const $$=s=>Array.from(document.querySelectorAll(s));
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const read=(k,fallback)=>{try{const x=JSON.parse(localStorage.getItem(k)||'null');return x===null?fallback:x}catch{return fallback}};
 const save=(k,x)=>{try{localStorage.setItem(k,JSON.stringify(x))}catch{}};
 const announce=(title,body='')=>window.LoliteNotifications5?.push?.({title,body,source:'Lolite OS'});
 const emit=(type,detail)=>window.dispatchEvent(new CustomEvent(type,{detail}));

 // Window Management 3.0: a visible switcher, clickable selections and tiling.
 let switcher=null,choice=0,windowIds=[];
 const wm=()=>window.LoliteWindowManager;
 const switchable=()=>$$('#windows .window[data-window-id]').filter(el=>{
  const rec=wm()?.getWindow?.(el.dataset.windowId);
  return rec&&!rec.closing&&rec.desktopIndex===wm()?.desktopIndex?.();
 }).sort((a,b)=>Number(b.style.zIndex||0)-Number(a.style.zIndex||0));
 function showSwitcher(step=1){
  if(document.documentElement.classList.contains('browsing-mode'))return;
  const els=switchable();
  if(!els.length)return;
  const ids=els.map(el=>el.dataset.windowId);
  if(!switcher){
   windowIds=ids;choice=ids.indexOf(wm()?.activeWindowId?.());
   if(choice<0)choice=0;
   switcher=document.createElement('div');
   switcher.className='l5-switcher';switcher.setAttribute('role','dialog');
   switcher.setAttribute('aria-label','Switch open windows');
   document.body.appendChild(switcher);
  }else windowIds=ids;
  choice=(choice+step+windowIds.length)%windowIds.length;
  switcher.innerHTML='<strong>Switch windows</strong><div class="l5-switch-grid">'+windowIds.map((id,i)=>{
   const rec=wm()?.getWindow?.(id);
   return '<button type="button" data-l5-window="'+safe(id)+'" class="'+(i===choice?'selected':'')+'" aria-current="'+(i===choice?'true':'false')+'">'+
    '<span class="l5-switch-symbol" aria-hidden="true">▣</span><span>'+safe(rec?.title||id)+'</span><small>'+safe(rec?.minimised?'Minimised':'Desktop '+(wm().desktopIndex()+1))+'</small></button>';
  }).join('')+'</div><small>Alt + Tab · Release Alt to switch · Esc to cancel</small>';
 }
 function hideSwitcher(activate){
  if(!switcher)return;
  const id=windowIds[choice];switcher.remove();switcher=null;windowIds=[];
  if(activate&&id)window.restoreWin?.(id);
 }
 function tileWindows(){
  const ids=switchable().map(el=>el.dataset.windowId).slice(0,4);
  const layout=ids.length===2?['left','right']:ids.length===3?['left','top-right','bottom-right']:['top-left','top-right','bottom-left','bottom-right'];
  ids.forEach((id,i)=>window.snapWin?.(id,layout[i]||'max'));
  if(ids.length){emit('lolite5:windowtiled',{count:ids.length});announce('Windows arranged',ids.length+' windows tiled. Ctrl + Alt + L to tile again.')}
  return ids.length;
 }
 document.addEventListener('keydown',e=>{
  if(e.altKey&&e.key==='Tab'&&!e.ctrlKey&&!e.metaKey){
   const editable=e.target?.closest?.('input,textarea,[contenteditable="true"]');
   if(editable)return;
   e.preventDefault();e.stopImmediatePropagation();showSwitcher(e.shiftKey?-1:1);return;
  }
  if(e.ctrlKey&&e.altKey&&!e.metaKey&&e.key.toLowerCase()==='l'){
   e.preventDefault();e.stopImmediatePropagation();tileWindows();return;
  }
  if(e.key==='Escape')hideSwitcher(false);
 },true);
 document.addEventListener('keyup',e=>{if(e.key==='Alt'&&!e.altKey)hideSwitcher(true)},true);
 document.addEventListener('click',e=>{
  const item=e.target.closest?.('[data-l5-window]');
  if(item){const id=item.dataset.l5Window;hideSwitcher(false);window.restoreWin?.(id)}
 });
 window.addEventListener('blur',()=>hideSwitcher(false));
 window.addEventListener('lolite:desktopchange',()=>hideSwitcher(false));
 window.LoliteWindows5=Object.freeze({showSwitcher,tile:tileWindows,close:()=>hideSwitcher(false)});

 // Theme Studio: persistent colours and surface controls, separate from icon customisation.
 const THEME_KEY='lolite5.theme.v1';
 const defaults={accent:'#7768e7',radius:12,blur:16,taskbar:94,spacing:'comfortable'};
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,Number(n)||0));
 const hex=v=>/^#[0-9a-f]{6}$/i.test(v)?v:defaults.accent;
 function cleanTheme(v){
  const x=v&&typeof v==='object'?v:{};
  return {accent:hex(x.accent||defaults.accent),radius:clamp(x.radius??12,4,28),
   blur:clamp(x.blur??16,0,30),taskbar:clamp(x.taskbar??94,55,100),
   spacing:['comfortable','compact'].includes(x.spacing)?x.spacing:'comfortable'};
 }
 let theme=cleanTheme(read(THEME_KEY,defaults)),themeModal=null;
 function applyTheme(persist=false){
  const root=document.documentElement;
  root.style.setProperty('--l5-radius',theme.radius+'px');
  root.style.setProperty('--l5-blur',theme.blur+'px');
  root.style.setProperty('--l5-taskbar-alpha',String(theme.taskbar/100));
  root.dataset.l5Spacing=theme.spacing;
  if(persist||read(THEME_KEY,null))root.dataset.l5Theme='on';
  if(persist){
   window.loliteSetAccent?.(theme.accent);
   save(THEME_KEY,theme);
   emit('lolite5:theme',{...theme});
  }
 }
 applyTheme(false);
 function themePanel(){
  if(!themeModal){
   themeModal=document.createElement('section');themeModal.className='l5-modal hidden';
   themeModal.setAttribute('role','dialog');themeModal.setAttribute('aria-modal','true');
   themeModal.setAttribute('aria-label','Lolite Theme Studio');
   document.body.appendChild(themeModal);
  }
  themeModal.innerHTML='<div class="l5-shade" data-l5-dismiss></div><div class="l5-panel l5-theme-panel">'+
   '<header><div><small>PERSONALISATION</small><h2>Theme Studio</h2><p>Make Lolite look how you want. Changes save in this browser.</p></div><button data-l5-dismiss aria-label="Close Theme Studio">✕</button></header>'+
   '<div class="l5-preview"><div class="l5-preview-bar">Lolite OS <span>─ □ ✕</span></div><div class="l5-preview-app">Your space, your style.</div></div>'+
   '<label>Accent colour <input type="color" data-l5-theme="accent" value="'+theme.accent+'"></label>'+
   '<label>Window corners <span data-l5-value="radius">'+theme.radius+'px</span><input type="range" min="4" max="28" data-l5-theme="radius" value="'+theme.radius+'"></label>'+
   '<label>Surface blur <span data-l5-value="blur">'+theme.blur+'px</span><input type="range" min="0" max="30" data-l5-theme="blur" value="'+theme.blur+'"></label>'+
   '<label>Taskbar opacity <span data-l5-value="taskbar">'+theme.taskbar+'%</span><input type="range" min="55" max="100" data-l5-theme="taskbar" value="'+theme.taskbar+'"></label>'+
   '<label>Density <select data-l5-theme="spacing"><option value="comfortable"'+(theme.spacing==='comfortable'?' selected':'')+'>Comfortable</option><option value="compact"'+(theme.spacing==='compact'?' selected':'')+'>Compact</option></select></label>'+
   '<footer><button data-l5-theme-reset>Reset Theme Studio</button><button data-l5-dismiss>Done</button></footer></div>';
  themeModal.classList.remove('hidden');
 }
 const closeTheme=()=>themeModal?.classList.add('hidden');
 function setTheme(key,value){
  if(!['accent','radius','blur','taskbar','spacing'].includes(key))return;
  theme=cleanTheme({...theme,[key]:value});
  applyTheme(true);
 }
 document.addEventListener('input',e=>{const el=e.target.closest?.('[data-l5-theme]');if(!el)return;setTheme(el.dataset.l5Theme,el.value);const span=themeModal?.querySelector('[data-l5-value="'+el.dataset.l5Theme+'"]');if(span)span.textContent=el.value+(el.dataset.l5Theme==='taskbar'?'%':'px')});
 document.addEventListener('change',e=>{const el=e.target.closest?.('[data-l5-theme]');if(el)setTheme(el.dataset.l5Theme,el.value)});
 window.LoliteThemeStudio=Object.freeze({open:themePanel,close:closeTheme,set:setTheme,get:()=>({...theme}),reset:()=>{theme=cleanTheme(defaults);applyTheme(true);themePanel()}});
 window.addEventListener('lolite:wallpaperchange',()=>{if(read(THEME_KEY,null))setTimeout(()=>applyTheme(false),0)});

 // Notification Centre: persistent OS events, unread count and Do Not Disturb.
 const NOTICE_KEY='lolite5.notifications.v1';
 const MAX_NOTICE=45;
 let notices=Array.isArray(read(NOTICE_KEY,[]))?read(NOTICE_KEY,[]).slice(0,MAX_NOTICE).filter(x=>x&&typeof x.title==='string'):[];
 let doNotDisturb=read('lolite5.dnd.v1',false)===true;
 let notePanel=null,noteButton=null;
 function updateBadge(){
  const count=notices.filter(x=>!x.read).length;
  if(noteButton){noteButton.setAttribute('aria-label','Notifications · '+count+' unread');noteButton.title='Notifications'+(count?' · '+count+' unread':'');noteButton.dataset.count=count?String(Math.min(count,99)):''}
 }
 function pushNotice(payload={}){
  const title=String(payload.title||'Lolite update').slice(0,90),body=String(payload.body||'').slice(0,230);
  const item={id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),title,body,source:String(payload.source||'System').slice(0,40),date:Date.now(),read:false};
  if(notices[0]?.title===item.title&&notices[0]?.body===item.body&&Date.now()-notices[0].date<1200)return;
  notices=[item,...notices].slice(0,MAX_NOTICE);save(NOTICE_KEY,notices);updateBadge();
  if(notePanel&&!notePanel.classList.contains('hidden'))renderNotices();
  if(!doNotDisturb&&payload.toast===true)window.toast?.(title+(body?' · '+body:''));
  return item.id;
 }
 function renderNotices(){
  if(!notePanel)return;
  notePanel.innerHTML='<div class="l5-shade" data-l5-dismiss></div><div class="l5-panel l5-notice-panel"><header><div><small>LOLITE OS 5.0</small><h2>Notifications</h2><p>System activity and updates, saved only on this device.</p></div><button data-l5-dismiss aria-label="Close notifications">✕</button></header>'+
   '<div class="l5-notice-actions"><label><input type="checkbox" data-l5-dnd'+(doNotDisturb?' checked':'')+'> Do Not Disturb</label><button data-l5-notice-read>Mark read</button><button data-l5-notice-clear>Clear</button></div>'+
   '<div class="l5-notice-list">'+(notices.length?notices.map(n=>'<article><small>'+safe(n.source)+' · '+new Date(n.date).toLocaleString()+'</small><strong>'+safe(n.title)+'</strong><p>'+safe(n.body)+'</p></article>').join(''):'<p class="l5-empty">You’re all caught up.</p>')+'</div></div>';
 }
 function openNotices(){if(!notePanel){notePanel=document.createElement('section');notePanel.className='l5-modal hidden';notePanel.setAttribute('role','dialog');notePanel.setAttribute('aria-modal','true');document.body.appendChild(notePanel)}
  notices=notices.map(n=>({...n,read:true}));save(NOTICE_KEY,notices);updateBadge();renderNotices();notePanel.classList.remove('hidden');
 }
 function installBell(){
  if(noteButton||!$('#clock'))return;
  noteButton=document.createElement('button');noteButton.type='button';noteButton.id='l5NotificationsButton';noteButton.className='l5-task-button';noteButton.textContent='◌';noteButton.title='Notifications';noteButton.addEventListener('click',openNotices);
  $('#clock').before(noteButton);updateBadge();
 }
 window.LoliteNotifications5=Object.freeze({push:pushNotice,open:openNotices,clear:()=>{notices=[];save(NOTICE_KEY,notices);updateBadge();renderNotices()},getAll:()=>notices.map(x=>({...x})),isDND:()=>doNotDisturb});
 window.addEventListener('lolite:notification',e=>pushNotice(e.detail||{}));

 // Achievements: one-time local milestones; no play-time grind or real money.
 const BADGES=[
  ['first-app','First Launch','Open your first Lolite app','▣'],
  ['multitask','Multitasker','Open three different apps','▦'],
  ['window-pro','Window Pro','Arrange your windows with a tile shortcut','▤'],
  ['studio','Colour Curator','Customise a Theme Studio setting','✦'],
  ['searcher','Quick Thinker','Use Spotlight Search','⌕'],
  ['music','First Listen','Play music in Lolite Music','♫'],
  ['games','Game Explorer','Launch a game in Lolite','◈'],
  ['appstore','App Collector','Install an optional app','▣']
 ];
 const ACH_KEY='lolite5.achievements.v1';
 let achieved=read(ACH_KEY,{});
 if(!achieved||typeof achieved!=='object'||Array.isArray(achieved))achieved={};
 const openedApps=new Set();
 function award(id){
  if(!BADGES.some(b=>b[0]===id)||achieved[id])return false;
  achieved[id]=Date.now();save(ACH_KEY,achieved);
  pushNotice({title:'Achievement unlocked',body:BADGES.find(b=>b[0]===id)[1],source:'Achievements'});
  return true;
 }
 let achPanel=null;
 function showAchievements(){
  if(!achPanel){achPanel=document.createElement('section');achPanel.className='l5-modal hidden';achPanel.setAttribute('role','dialog');achPanel.setAttribute('aria-modal','true');document.body.appendChild(achPanel)}
  achPanel.innerHTML='<div class="l5-shade" data-l5-dismiss></div><div class="l5-panel"><header><div><small>LOLITE OS 5.0</small><h2>Achievements</h2><p>'+BADGES.filter(b=>achieved[b[0]]).length+' of '+BADGES.length+' unlocked · Stored privately in this browser</p></div><button data-l5-dismiss aria-label="Close achievements">✕</button></header><div class="l5-achievements">'+BADGES.map(([id,name,detail,glyph])=>
   '<article class="'+(achieved[id]?'is-unlocked':'')+'"><span>'+glyph+'</span><div><strong>'+safe(name)+'</strong><small>'+safe(detail)+'</small></div><span>'+ (achieved[id]?'Unlocked':'Locked')+'</span></article>').join('')+'</div></div>';
  achPanel.classList.remove('hidden');
 }
 window.LoliteAchievements5=Object.freeze({open:showAchievements,award,list:()=>BADGES.map(([id,name,detail])=>({id,name,detail,unlocked:!!achieved[id]}))});
 window.addEventListener('lolite:windowchange',e=>{
  if(e.detail?.type!=='open')return;
  const id=String(e.detail.id||'');if(!id)return;
  openedApps.add(id);award('first-app');if(openedApps.size>=3)award('multitask');
 });
 window.addEventListener('lolite5:theme',()=>award('studio'));
 window.addEventListener('lolite:musicstate',e=>{if(e.detail?.playing)award('music')});
 window.addEventListener('lolite5:search',()=>award('searcher'));
 window.addEventListener('lolite5:gameplayed',()=>award('games'));
 window.addEventListener('lolite5:appinstalled',()=>award('appstore'));
 // Window tiling emits an event from the shared command, including keyboard use.
 window.addEventListener('lolite5:windowtiled',()=>award('window-pro'));

 // Game Store 4.0: local rating and a copyable bug report; no unverified public submissions.
 const FEEDBACK_KEY='lolite5.game-feedback.v1';
 let feedback=read(FEEDBACK_KEY,{});
 if(!feedback||typeof feedback!=='object'||Array.isArray(feedback))feedback={};
 let gamePanel=null;
 const storeFeedback=()=>save(FEEDBACK_KEY,feedback);
 function openGameFeedback(file,title){
  if(!/^[a-zA-Z0-9_.-]{1,150}$/.test(file))return;
  if(!gamePanel){gamePanel=document.createElement('section');gamePanel.className='l5-modal hidden';gamePanel.setAttribute('role','dialog');gamePanel.setAttribute('aria-modal','true');document.body.appendChild(gamePanel)}
  const prior=feedback[file]||{};
  gamePanel.dataset.file=file;gamePanel.dataset.title=title;
  gamePanel.innerHTML='<div class="l5-shade" data-l5-dismiss></div><div class="l5-panel"><header><div><small>GAME STORE 4.0</small><h2>'+safe(title)+'</h2><p>Rate or flag this game on this device. Reports can be copied for GitHub.</p></div><button data-l5-dismiss aria-label="Close game feedback">✕</button></header>'+
   '<div class="l5-stars" role="group" aria-label="Rate game from one to five stars">'+[1,2,3,4,5].map(n=>'<button data-l5-rate="'+n+'" aria-label="'+n+' stars" aria-pressed="'+(prior.rating===n?'true':'false')+'">'+(prior.rating>=n?'★':'☆')+'</button>').join('')+'</div>'+
   '<label class="l5-check"><input type="checkbox" data-l5-broken'+(prior.broken?' checked':'')+'> This game has a launch or gameplay problem</label>'+
   '<label>What went wrong? (optional)<textarea data-l5-game-notes maxlength="500" rows="3" placeholder="Loading forever, blank screen, broken controls…">'+safe(prior.notes||'')+'</textarea></label>'+
   '<footer><button data-l5-game-save>Save feedback</button><button data-l5-game-copy>Copy bug report</button></footer></div>';
  gamePanel.classList.remove('hidden');
 }
 function saveGameFeedback(){
  if(!gamePanel)return;
  const file=gamePanel.dataset.file;
  feedback[file]={rating:Math.max(0,Math.min(5,Number(gamePanel.querySelector('[aria-pressed="true"][data-l5-rate]')?.dataset.l5Rate||0))),
   broken:!!gamePanel.querySelector('[data-l5-broken]')?.checked,
   notes:String(gamePanel.querySelector('[data-l5-game-notes]')?.value||'').slice(0,500),at:Date.now()};
  storeFeedback();gamePanel.classList.add('hidden');announce('Game feedback saved','Your feedback is saved locally.');
 }
 const gameCards=()=>{
  const store=$('.store-main');if(!store)return;
  for(const card of store.querySelectorAll('.store-gallery-card[data-game-file],.store-card[data-game-file]')){
   if(card.querySelector('[data-l5-feedback]'))continue;
   const actions=card.querySelector('.store-card-actions');if(!actions)continue;
   const button=document.createElement('button');button.type='button';button.className='store-details l5-feedback-button';button.dataset.l5Feedback=card.dataset.gameFile;
   button.textContent='★ Rate / Bug';button.title='Rate this game or report a bug';button.setAttribute('aria-label','Rate or report a bug for '+(card.querySelector('h3')?.textContent||'this game'));
   actions.appendChild(button);
  }
 };
 let gameQueued=false;
 const scheduleGames=()=>{if(gameQueued)return;gameQueued=true;requestAnimationFrame(()=>{gameQueued=false;gameCards()})};
 // A single cheap observer discovers store mount points. Only scan the
 // corresponding app, not the entire OS, when its cards actually change.
 const observer=new MutationObserver(mutations=>{
  let gamesChanged=false,appsChanged=false;
  for(const mutation of mutations){
   for(const node of mutation.addedNodes){
    if(node.nodeType!==1)continue;
    if(!gamesChanged&&(node.matches?.('.store-main,.store-card,.store-gallery-card')||
      node.querySelector?.('.store-main,.store-card,.store-gallery-card')))gamesChanged=true;
    if(!appsChanged&&(node.matches?.('.appstore,.appstore-card')||
      node.querySelector?.('.appstore,.appstore-card')))appsChanged=true;
    if(gamesChanged&&appsChanged)break;
   }
   if(gamesChanged&&appsChanged)break;
  }
  if(gamesChanged)scheduleGames();
  if(appsChanged)scheduleAppStore();
 });
 const initObserver=()=>{if(document.body)observer.observe(document.body,{childList:true,subtree:true})};

 window.LoliteGameFeedback5=Object.freeze({open:openGameFeedback,get:file=>({...feedback[file]})});
 // The trusted Game Player raises a launch-success event after opening a frame.

 // App Store 2.0: sortable installed/favourite collections and live installed status.
 const APP_FAV_KEY='lolite5.app-favourites.v1';
 let favApps=Array.isArray(read(APP_FAV_KEY,[]))?read(APP_FAV_KEY,[]).filter(x=>typeof x==='string'):[];
 let appSort=read('lolite5.app-sort.v1','default');
 const appId=card=>card?.querySelector('h3')?.textContent?.trim()||'';
 function decorateAppStore(){
  const container=$('.appstore');if(!container)return;
  const toolbar=container.querySelector('.appstore-toolbar');
  if(toolbar&&!toolbar.querySelector('[data-l5-app-sort]')){
   const row=document.createElement('div');row.className='l5-app-tools';
   row.innerHTML='<label>Sort <select data-l5-app-sort><option value="default">Featured first</option><option value="name">Name A–Z</option><option value="name-desc">Name Z–A</option></select></label><button data-l5-app-faves>Show favourites</button><button data-l5-app-all>Show all</button>';
   toolbar.appendChild(row);row.querySelector('select').value=appSort;
  }
  for(const card of container.querySelectorAll('.appstore-card')){
   const name=appId(card);if(!name||card.querySelector('[data-l5-app-fav]'))continue;
   const b=document.createElement('button');b.type='button';b.className='l5-app-favourite';b.dataset.l5AppFav=name;
   b.textContent=favApps.includes(name)?'♥ Saved':'♡ Save';b.setAttribute('aria-pressed',String(favApps.includes(name)));
   card.appendChild(b);
  }
  sortAppCards();
 }
 let favFilter=false;
 function sortAppCards(){
  const grid=$('#appStoreGrid');if(!grid)return;
  const cards=Array.from(grid.children).filter(n=>n.matches?.('.appstore-card'));
  if(appSort!=='default'){
   const sorted=[...cards].sort((a,b)=>appId(a).localeCompare(appId(b),undefined,{numeric:true})*(appSort==='name-desc'?-1:1));
   if(sorted.some((card,index)=>card!==cards[index]))sorted.forEach(card=>grid.appendChild(card));
  }
  cards.forEach(card=>{card.hidden=favFilter&&!favApps.includes(appId(card))});
 }
 let appQueued=false;
 function scheduleAppStore(){if(appQueued)return;appQueued=true;requestAnimationFrame(()=>{appQueued=false;decorateAppStore()})}
 const oldInstall=window.loliteInstallApp;
 if(typeof oldInstall==='function')window.loliteInstallApp=function(id){
  const before=String(localStorage.getItem('loliteInstalledApps')||'[]');
  const res=oldInstall.apply(this,arguments);
  const after=String(localStorage.getItem('loliteInstalledApps')||'[]');
  if(before!==after){emit('lolite5:appinstalled',{id});announce('App installed',String(id).slice(0,80))}
  return res;
 };

 // Music 3.0 mini-player stays visible while browsing other Lolite apps.
 let miniPlayer=null,miniVisible=false;
 const musicState=()=>window.LoliteMusic?.getState?.()||{};
 function drawMini(){
  if(!miniPlayer||!miniVisible)return;
  const data=musicState();
  miniPlayer.querySelector('[data-l5-mini-title]').textContent=data.title||'No track playing';
  miniPlayer.querySelector('[data-l5-mini-artist]').textContent=data.artist||'Open Music to choose a song';
  const toggle=miniPlayer.querySelector('[data-l5-mini-control="toggle"]');
  if(toggle){toggle.textContent=data.playing?'❚❚':'▶';toggle.setAttribute('aria-label',data.playing?'Pause music':'Play music')}
 }
 function toggleMini(force){
  miniVisible=typeof force==='boolean'?force:!miniVisible;
  if(!miniPlayer){
   miniPlayer=document.createElement('aside');miniPlayer.id='l5MusicMini';miniPlayer.className='l5-mini';
   miniPlayer.setAttribute('role','region');miniPlayer.setAttribute('aria-label','Lolite Music mini player');
   miniPlayer.innerHTML='<div><strong data-l5-mini-title>Music</strong><small data-l5-mini-artist>Choose a track</small></div><nav aria-label="Music controls"><button data-l5-mini-control="previous" aria-label="Previous song">⏮</button><button data-l5-mini-control="toggle" aria-label="Play or pause">▶</button><button data-l5-mini-control="next" aria-label="Next song">⏭</button><button data-l5-mini-control="open" aria-label="Open Music app">↗</button><button data-l5-mini-control="close" aria-label="Close mini player">✕</button></nav>';
   document.body.appendChild(miniPlayer);
  }
  miniPlayer.hidden=!miniVisible;drawMini();
 }
 document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-lm5-mini-toggle]')){toggleMini();return}
  const button=e.target.closest?.('[data-l5-mini-control]');if(!button)return;
  const action=button.dataset.l5MiniControl;
  if(action==='close')toggleMini(false);
  else if(action==='open')window.LoliteMusic?.open?.();
  else if(['previous','next','toggle'].includes(action))window.LoliteMusic?.[action]?.();
 });
 window.addEventListener('lolite:musicstate',drawMini);
 window.LoliteMusicMini5=Object.freeze({open:()=>toggleMini(true),close:()=>toggleMini(false),toggle:toggleMini});

 // Shared click/change handlers; no replacement of existing app handlers.
 document.addEventListener('click',e=>{
  const el=e.target.closest?.('button,[data-l5-dismiss]');
  if(!el)return;
  if(el.hasAttribute('data-l5-dismiss')){
   e.preventDefault();el.closest('.l5-modal')?.classList.add('hidden');return;
  }
  if(el.matches('[data-l5-theme-open]')){themePanel();return}
  if(el.matches('[data-l5-ach-open]')){showAchievements();return}
  if(el.matches('[data-l5-notice-open]')){openNotices();return}
  if(el.hasAttribute('data-l5-theme-reset')){theme=cleanTheme(defaults);applyTheme(true);themePanel();return}
  if(el.hasAttribute('data-l5-notice-read')){notices=notices.map(n=>({...n,read:true}));save(NOTICE_KEY,notices);updateBadge();renderNotices();return}
  if(el.hasAttribute('data-l5-notice-clear')){notices=[];save(NOTICE_KEY,notices);updateBadge();renderNotices();return}
  if(el.dataset.l5Feedback){
   const file=el.dataset.l5Feedback,card=el.closest('[data-game-file]');
   openGameFeedback(file,card?.querySelector('h3')?.textContent||file);return;
  }
  if(el.dataset.l5Rate){
   const n=Number(el.dataset.l5Rate),container=el.closest('.l5-stars');
   container?.querySelectorAll('[data-l5-rate]').forEach(btn=>{const active=Number(btn.dataset.l5Rate)===n;btn.setAttribute('aria-pressed',String(active));btn.textContent=Number(btn.dataset.l5Rate)<=n?'★':'☆'});
   return;
  }
  if(el.hasAttribute('data-l5-game-save')){saveGameFeedback();return}
  if(el.hasAttribute('data-l5-game-copy')){
   if(!gamePanel)return;
   const text=['Lolite OS 5.0 — game report','Game: '+gamePanel.dataset.title,'File: '+gamePanel.dataset.file,
    'Broken: '+(gamePanel.querySelector('[data-l5-broken]')?.checked?'Yes':'No'),
    'Notes: '+(gamePanel.querySelector('[data-l5-game-notes]')?.value||'Not provided'),
    'Browser: '+navigator.userAgent].join('\n');
   navigator.clipboard?.writeText?.(text).then(()=>announce('Report copied','Paste your report into the Lolite GitHub issues page.')).catch(()=>window.toast?.('Clipboard unavailable; try saving feedback instead.'));
   return;
  }
  if(el.dataset.l5AppFav){
   const name=el.dataset.l5AppFav;favApps=favApps.includes(name)?favApps.filter(n=>n!==name):[...favApps,name];
   save(APP_FAV_KEY,favApps);scheduleAppStore();return;
  }
  if(el.hasAttribute('data-l5-app-faves')){favFilter=true;sortAppCards();return}
  if(el.hasAttribute('data-l5-app-all')){favFilter=false;sortAppCards();return}
 });
 document.addEventListener('change',e=>{
  if(e.target.matches?.('[data-l5-dnd]')){doNotDisturb=!!e.target.checked;save('lolite5.dnd.v1',doNotDisturb)}
  if(e.target.matches?.('[data-l5-app-sort]')){appSort=e.target.value;save('lolite5.app-sort.v1',appSort);sortAppCards()}
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
   for(const m of [themeModal,notePanel,achPanel,gamePanel])m?.classList.add('hidden');
  }
  if(e.ctrlKey&&e.altKey&&!e.metaKey&&e.key.toLowerCase()==='n'){e.preventDefault();openNotices()}
 });
 const oldPage=window.page;
 if(typeof oldPage==='function')window.page=function(id){
  const page=oldPage.apply(this,arguments);
  if(id!=='settings')return page;
  return page+'<section class="l5-settings-card"><h3>Lolite OS 5.0</h3><p>Make your workspace yours, or review notifications and achievements.</p><div><button type="button" data-l5-theme-open>Theme Studio</button><button type="button" data-l5-notice-open>Notifications</button><button type="button" data-l5-ach-open>Achievements</button><button type="button" onclick="window.LoliteWindows5.tile()">Tile windows</button></div></section>';
 };
 const boot=()=>{installBell();initObserver();scheduleGames();scheduleAppStore()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
 window.LoliteOS5=Object.freeze({version:'5.0.0',openTheme:themePanel,openNotifications:openNotices,openAchievements:showAchievements});
})();