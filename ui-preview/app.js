/* Lolite UI Lab: isolated interactive design prototype. No changes to real OS or account data. */
(()=>{
 'use strict';
 const $=selector=>document.querySelector(selector);
 const $$=selector=>[...document.querySelectorAll(selector)];
 const root=document.documentElement;
 const desktop=$('#previewDesktop');
 const windowEl=$('#previewWindow'), windowContent=$('#windowContent');
 const startEl=$('#startMenu'), quickEl=$('#quickPanel');
 const defaults=()=>({theme:'cosmos',wallpaper:'aurora',glow:true,intensity:46,size:170,color:'blue',
  surfaces:{button:true,card:true,taskbar:true},
  liquid:{mode:'balanced',bend:60,thickness:48,shine:65,motion:false}});
 const COLORS={blue:'108 174 255',purple:'165 139 255',cyan:'120 230 231',white:'239 246 255'};
 const SCENES={
  desktop:{title:'Desktop UI',description:'Try hovering over app icons, windows and the taskbar.',number:'01'},
  start:{title:'Start menu 3.0',description:'Search the demo apps and launch previews from the Start menu.',number:'02'},
  window:{title:'Window Management',description:'Drag, minimize, maximize and restore a sample Lolite window.',number:'03'},
  games:{title:'Game Store 4.0',description:'Preview game cards, category filters and clearer Play buttons.',number:'04'},
  chat:{title:'Lolite Chat UI',description:'Try a cleaner conversation layout with local demo messages.',number:'05'},
  settings:{title:'Settings',description:'A redesigned preferences screen with working preview controls.',number:'06'},
  wallpapers:{title:'Wallpaper Gallery',description:'Switch wallpaper concepts and test card hover effects.',number:'07'},
  components:{title:'UI components',description:'Compare button states, notification styling and hover glow.',number:'08'}
 };
 const APPS=[
  {id:'games',label:'Game Store',icon:'game',tone:'purple',detail:'Browse games'},
  {id:'chat',label:'Lolite Chat',icon:'chat',tone:'blue',detail:'Messages & calls'},
  {id:'wallpapers',label:'Wallpapers',icon:'image',tone:'cyan',detail:'Your desktop'},
  {id:'settings',label:'Settings',icon:'settings',tone:'slate',detail:'Personalise'},
  {id:'components',label:'UI Library',icon:'sparkles',tone:'blue',detail:'Preview components'},
  {id:'window',label:'Windows',icon:'window',tone:'slate',detail:'Snap & manage'}
 ];
 const icon=name=>'<svg aria-hidden="true"><use href="#ic-'+name+'"></use></svg>';
 const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 let state=defaults(),scene='desktop',lastWindowScene='window';
 let drag=null,lensDrag=null,toastTimeout=null,glassEngine=null;
 function readSaved(){
  try{
   const d=JSON.parse(localStorage.getItem('loliteUiLabV1')||'null');
   if(!d||typeof d!=='object')return;
   if(['cosmos','aero','minimal'].includes(d.theme))state.theme=d.theme;
   if(['aurora','horizon','night'].includes(d.wallpaper))state.wallpaper=d.wallpaper;
   if(typeof d.glow==='boolean')state.glow=d.glow;
   if(Number.isFinite(d.intensity))state.intensity=Math.max(5,Math.min(100,Math.round(d.intensity)));
   if(Number.isFinite(d.size))state.size=Math.max(70,Math.min(310,Math.round(d.size/10)*10));
   if(COLORS[d.color])state.color=d.color;
   for(const key of Object.keys(state.surfaces))
    if(typeof d.surfaces?.[key]==='boolean')state.surfaces[key]=d.surfaces[key];
   const liquid=d.liquid;
   if(liquid&&typeof liquid==='object'){
    if(['off','balanced','high'].includes(liquid.mode))state.liquid.mode=liquid.mode;
    for(const key of ['bend','thickness','shine'])if(Number.isFinite(liquid[key]))
     state.liquid[key]=Math.max(0,Math.min(100,Math.round(liquid[key])));
    if(typeof liquid.motion==='boolean')state.liquid.motion=liquid.motion;
   }
  }catch(_){/* Preview must still work if storage is blocked. */}
 }
 function save(){
  try{localStorage.setItem('loliteUiLabV1',JSON.stringify(state))}catch(_){}
 }
 function tell(message){
  const toast=$('#labToast');if(!toast)return;
  clearTimeout(toastTimeout);
  toast.textContent=message;toast.hidden=false;
  toastTimeout=setTimeout(()=>{toast.hidden=true},2700);
 }
 function syncLiquidStatus(status){
  const label=$('#liquidEngineStatus'),badge=$('#liquidEngineBadge');
  if(!label||!badge)return;
  if(state.liquid.mode==='off'){
   label.textContent='Disabled. Original preview wallpaper is shown.';
   badge.textContent='OFF';return;
  }
  const on=!!status?.active;
  badge.textContent=on?'WEBGL LIVE':'CSS FALLBACK';
  label.textContent=on?
   'Real refracted wallpaper pixels · one GPU context · '+status.resolution.join(' × ')+
    (status.maxFps?' · 20 FPS animation cap':' · no idle animation'):
   (status?.reason||'Checking GPU support; frosted-glass fallback is available.');
 }
 function syncLiquidControls(){
  const liquid=state.liquid;
  $('[data-liquid-mode]').forEach(button=>{
   const selected=button.dataset.liquidMode===liquid.mode;
   button.classList.toggle('selected',selected);
   button.setAttribute('aria-pressed',String(selected));
  });
  for(const [key,element] of [['bend','liquidBend'],['thickness','liquidThickness'],['shine','liquidShine']]){
   $('#'+element).value=String(liquid[key]);
   $('#'+element+'Value').textContent=liquid[key]+'%';
  }
  $('#liquidMotion').checked=liquid.motion;
  glassEngine?.update({...liquid,wallpaper:state.wallpaper});
  syncLiquidStatus(glassEngine?.status());
 }
 function syncInspector(){
  root.dataset.theme=state.theme;
  root.dataset.wallpaper=state.wallpaper;
  root.dataset.glow=state.glow?'on':'off';
  root.dataset.glowButton=state.surfaces.button?'on':'off';
  root.dataset.glowCard=state.surfaces.card?'on':'off';
  root.dataset.glowTaskbar=state.surfaces.taskbar?'on':'off';
  root.style.setProperty('--glow-rgb',COLORS[state.color]);
  root.style.setProperty('--glow-strength',(state.intensity/100*.74).toFixed(3));
  root.style.setProperty('--glow-size',state.size+'px');
  desktop.dataset.wallpaperPreview=state.wallpaper;
  $('#glowEnabled').checked=state.glow;
  $('#glowIntensity').value=String(state.intensity);
  $('#glowSize').value=String(state.size);
  $('#glowIntensityValue').textContent=state.intensity+'%';
  $('#glowSizeValue').textContent=state.size+'px';
  $$('[data-theme-choice]').forEach(button=>{
   const on=button.dataset.themeChoice===state.theme;
   button.classList.toggle('selected',on);button.setAttribute('aria-pressed',String(on));
  });
  $$('[data-wallpaper-choice]').forEach(button=>{
   const on=button.dataset.wallpaperChoice===state.wallpaper;
   button.classList.toggle('selected',on);button.setAttribute('aria-pressed',String(on));
  });
  $$('[data-glow-color]').forEach(button=>{
   const on=button.dataset.glowColor===state.color;
   button.classList.toggle('selected',on);button.setAttribute('aria-pressed',String(on));
  });
  $$('[data-glow-surface]').forEach(input=>{input.checked=!!state.surfaces[input.dataset.glowSurface]});
  const quickGlow=quickEl.querySelector('[data-quick="glow"]');
  if(quickGlow)quickGlow.setAttribute('aria-pressed',String(state.glow));
  syncLiquidControls();
 }
 function setScene(next){
  if(!SCENES[next])return;
  scene=next;
  const info=SCENES[next];
  $('#sceneTitle').textContent=info.title;
  $('#sceneDescription').textContent=info.description;
  $('#sceneNumber').textContent=info.number;
  $$('[data-scene]').forEach(button=>{
   const selected=button.dataset.scene===scene;
   button.classList.toggle('active',selected);
   if(button.matches('.scene-item')){
    if(selected)button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
   }
  });
  closeMenus();
  if(next==='desktop'){windowEl.hidden=true;$('#taskWindows').hidden=true;glassEngine?.requestDraw();return}
  if(next==='start'){windowEl.hidden=true;$('#taskWindows').hidden=true;openStart();glassEngine?.requestDraw();return}
  openWindow(next);
  glassEngine?.requestDraw();
 }
 function closeMenus(){
  startEl.hidden=true;quickEl.hidden=true;
  $('#taskStart').setAttribute('aria-expanded','false');
  $('#taskQuick').setAttribute('aria-expanded','false');
  glassEngine?.requestDraw();
 }
 function openStart(){
  const opening=startEl.hidden;
  closeMenus();
  if(opening){
   startEl.hidden=false;
   $('#taskStart').setAttribute('aria-expanded','true');
   renderStartApps($('#startSearch').value);
  }
  glassEngine?.requestDraw();
 }
 function openQuick(){
  const opening=quickEl.hidden;
  closeMenus();
  if(opening){quickEl.hidden=false;$('#taskQuick').setAttribute('aria-expanded','true')}
  glassEngine?.requestDraw();
 }
 function renderStartApps(query=''){
  const matches=APPS.filter(app=>app.label.toLowerCase().includes(query.trim().toLowerCase())||
   app.detail.toLowerCase().includes(query.trim().toLowerCase()));
  const holder=$('#startApps');
  holder.innerHTML=matches.length?matches.map(app=>
   '<button type="button" data-open-app="'+app.id+'" data-glow data-glow-type="card">'+
   '<span class="desktop-icon '+app.tone+'">'+icon(app.icon)+'</span><span>'+safe(app.label)+'</span></button>').join(''):
   '<span class="start-no-results">No matching preview apps</span>';
 }
 function openWindow(id){
  const app=APPS.find(a=>a.id===id);
  lastWindowScene=id;
  windowEl.hidden=false;
  $('#taskWindows').hidden=false;
  $('#taskWindows').setAttribute('aria-pressed','true');
  $('#windowTitle').textContent=app?.label||'Lolite UI Preview';
  $('#windowIcon').innerHTML=icon(app?.icon||'window');
  const views={window:windowMarkup,games:gameMarkup,chat:chatMarkup,
   settings:settingsMarkup,wallpapers:wallpaperMarkup,components:componentsMarkup};
  windowContent.innerHTML=(views[id]||windowMarkup)();
  if(id==='wallpapers')syncInspector();
  if(id==='chat')selectChat('Alex');
  closeMenus();
  glassEngine?.requestDraw();
 }
 function windowMarkup(){
  return '<div class="content-pane"><span class="pane-label">WINDOWS / CONCEPT</span>'+
   '<h2>Window Management 4.0</h2><p>This is a real interactive mock window. Drag its titlebar, minimize it or maximize it inside the preview.</p>'+
   '<div class="ui-row"><button type="button" class="ui-button primary" data-demo="notice" data-glow data-glow-type="button">'+icon('sparkles')+' Test glow</button>'+
   '<button type="button" class="ui-button" data-demo="maximize" data-glow data-glow-type="button">'+icon('maximize')+' Maximize</button></div>'+
   '<div class="preview-cards"><button type="button" class="preview-card" data-open-app="components" data-glow data-glow-type="card"><span class="mini-icon">'+icon('mouse')+'</span><span><strong>Cursor glow</strong><small>Follows the pointer on hover, not everywhere.</small></span></button>'+
   '<button type="button" class="preview-card" data-open-app="settings" data-glow data-glow-type="card"><span class="mini-icon">'+icon('sliders')+'</span><span><strong>Customisation</strong><small>Preview settings and layouts.</small></span></button></div></div>';
 }
 const GAMES=[['Blockworld','Sandbox & building','game-one'],['Neon Drift','Racing','game-two'],['Skybound','Adventure','game-three'],['Rhythm Rush','Arcade','game-four']];
 function gameMarkup(){
  return '<div class="content-pane"><span class="pane-label">GAME STORE / CONCEPT</span>'+
   '<h2>Discover something new.</h2><p>Cleaner covers, readable titles and proper full-sized action buttons. These tiles are preview-only.</p>'+
   '<div class="pane-nav" role="group" aria-label="Demo game categories">'+
   ['All','Racing','Adventure','Arcade'].map((cat,i)=>'<button type="button" class="'+(i===0?'active':'')+'" data-game-category="'+cat+'" aria-pressed="'+(i===0)+'" data-glow data-glow-type="button">'+cat+'</button>').join('')+'</div>'+
   '<div class="game-preview-grid" id="demoGames">'+gameCards('All')+'</div>'+
   '<p id="demoGameStatus" role="status" aria-live="polite">Select a game to preview its action.</p></div>';
 }
 function gameCards(category){
  const list=GAMES.filter((item)=>category==='All'||item[1]===category);
  return list.map(([name,genre,art])=>
   '<button type="button" class="game-tile" data-game-select="'+safe(name)+'" data-glow data-glow-type="card">'+
    '<span class="game-art '+art+'">'+icon('game')+'</span>'+
    '<strong>'+safe(name)+'</strong><small>'+safe(genre)+' · '+icon('play')+' Preview</small></button>').join('')||
    '<div class="l-preview-empty">No games in this demo category.</div>';
 }
 const CHAT={
  Alex:['Hey! Have you seen the new Lolite UI?','Yeah, the glow looks so much cleaner.'],
  Jamie:['The desktop concept is looking great.','We should test the window controls next.'],
  Marcus:['Try switching to the Aero theme.','The new Start menu feels way better.']
 };
 function chatMarkup(){
  return '<div class="chat-layout"><div class="chat-sidebar"><strong>Messages</strong>'+
   Object.keys(CHAT).map((name,i)=>
    '<button type="button" class="chat-contact '+(i===0?'active':'')+'" data-chat-contact="'+name+'" data-glow data-glow-type="button">'+
    '<span class="chat-avatar">'+name[0]+'</span>'+name+'</button>').join('')+
   '</div><div class="chat-panel"><div class="chat-header" id="demoChatName">Alex · Demo conversation</div>'+
   '<div class="chat-messages" id="demoMessages" aria-live="polite"></div>'+
   '<form class="chat-compose" id="demoChatForm"><input type="text" id="demoChatInput" maxlength="180" autocomplete="off" placeholder="Write a preview message…" aria-label="Write a preview message">'+
   '<button type="submit" aria-label="Add preview message" data-glow data-glow-type="button">'+icon('chevron')+'</button></form></div></div>';
 }
 function selectChat(name){
  if(!CHAT[name])return;
  $$('[data-chat-contact]').forEach(btn=>btn.classList.toggle('active',btn.dataset.chatContact===name));
  const title=$('#demoChatName');
  if(title)title.textContent=name+' · Demo conversation';
  const messages=$('#demoMessages');if(!messages)return;
  messages.replaceChildren();
  CHAT[name].forEach((message,index)=>{
   const bubble=document.createElement('div');
   bubble.className='bubble'+(index%2?' sent':'');
   bubble.textContent=message;messages.appendChild(bubble);
  });
 }
 function settingsMarkup(){
  return '<div class="content-pane"><span class="pane-label">PERSONALISATION / CONCEPT</span>'+
   '<h2>Make it yours.</h2><p>Settings are easier to find, with cleaner switches and clear descriptions. These controls only affect the preview.</p>'+
   '<div class="settings-preview-row"><div><strong>Cursor glow</strong><small>Light follows your cursor on controls.</small></div><button type="button" class="mini-switch" data-demo-setting="glow" aria-label="Toggle cursor glow" aria-pressed="'+state.glow+'"></button></div>'+
   '<div class="settings-preview-row"><div><strong>Floating taskbar</strong><small>Rounded taskbar with soft edges.</small></div><button type="button" class="mini-switch" data-demo-setting="taskbar" aria-label="Toggle floating taskbar" aria-pressed="true"></button></div>'+
   '<div class="settings-preview-row"><div><strong>Animated wallpaper</strong><small>Preview of the wallpaper motion option.</small></div><button type="button" class="mini-switch" data-demo-setting="wallpaper" aria-label="Toggle wallpaper motion" aria-pressed="true"></button></div>'+
   '<div class="ui-row" style="margin-top:17px"><button type="button" class="ui-button primary" data-open-app="components" data-glow data-glow-type="button">'+icon('sparkles')+' UI components</button></div></div>';
 }
 function wallpaperMarkup(){
  const thumbs=[['aurora','Aurora'],['horizon','Horizon'],['night','Nightfall']];
  return '<div class="content-pane"><span class="pane-label">WALLPAPERS / CONCEPT</span>'+
   '<h2>Wallpaper Gallery 3.0</h2><p>Choose from a few original prototype wallpapers. Real Lolite wallpapers are not changed.</p>'+
   '<div class="wallpaper-preview-grid">'+thumbs.map(([id,label])=>
    '<button type="button" data-wallpaper-choice="'+id+'" class="'+(state.wallpaper===id?'selected':'')+'" aria-pressed="'+(state.wallpaper===id)+'" data-glow data-glow-type="card">'+
    '<span class="wall-thumb '+id+'"></span><small>'+label+'</small></button>').join('')+'</div>'+
   '<div class="preview-list" style="margin-top:14px"><div class="preview-list-item">'+icon('image')+
   '<div><strong>Wallpaper-responsive UI</strong><small>Try the theme options in the right-hand panel.</small></div></div></div></div>';
 }
 function componentsMarkup(){
  return '<div class="content-pane"><span class="pane-label">DESIGN SYSTEM / COMPONENTS</span>'+
   '<h2>Every interaction should feel right.</h2><p>Hover the elements below. Glow appears only on enabled buttons, cards and taskbar items.</p>'+
   '<div class="components-preview"><div class="component-group"><h3>BUTTON STATES</h3><div class="ui-row">'+
   '<button type="button" class="ui-button primary" data-demo="notice" data-glow data-glow-type="button">'+icon('check')+' Primary action</button>'+
   '<button type="button" class="ui-button" data-demo="notice" data-glow data-glow-type="button">Secondary</button>'+
   '<button type="button" class="ui-button subtle" data-demo="notice" data-glow data-glow-type="button">Subtle</button>'+
   '<button type="button" class="ui-button" disabled>Disabled</button></div></div>'+
   '<div class="component-group"><h3>CARD & HOVER PREVIEW</h3>'+
   '<button type="button" class="preview-card" data-demo="notice" data-glow data-glow-type="card">'+
   '<span class="mini-icon">'+icon('sparkles')+'</span><span><strong>Interactive card</strong><small>Try moving the cursor across the surface.</small></span></button></div>'+
   '<div class="component-group"><h3>SLIDER</h3><label class="range-sample"><span>Volume</span><input type="range" min="0" max="100" value="65" aria-label="Demo volume"></label></div></div></div>';
 }
 function toggleMaximize(){
  if(windowEl.hidden)return;
  windowEl.classList.toggle('maximized');
  glassEngine?.requestDraw();
  if(!windowEl.classList.contains('maximized'))return;
  closeMenus();
 }
 function closeWindow(){
  windowEl.hidden=true;
  $('#taskWindows').hidden=true;
  scene='desktop';updateSceneNav();glassEngine?.requestDraw();
 }
 function updateSceneNav(){
  const info=SCENES[scene];
  $('#sceneTitle').textContent=info.title;
  $('#sceneDescription').textContent=info.description;
  $('#sceneNumber').textContent=info.number;
  $$('.scene-item').forEach(btn=>{
   const on=btn.dataset.scene===scene;
   btn.classList.toggle('active',on);
   if(on)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');
  });
 }
 function updateClock(){
  const now=new Date();
  $('#desktopTime').textContent=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  $('#desktopDate').textContent=now.toLocaleDateString([],{day:'numeric',month:'short'});
 }
 async function copySettings(){
  const data={version:'Lolite UI Lab 1',...state,previewOnly:true};
  const text=JSON.stringify(data,null,2);
  try{
   if(!navigator.clipboard?.writeText)throw Error('Clipboard not available');
   await navigator.clipboard.writeText(text);
   tell('Preview design settings copied.');
  }catch(_){
   tell('Clipboard unavailable. Try opening the preview using HTTPS.');
  }
 }
 function startDrag(event){
  if(event.button!==0||event.target.closest('.window-controls')||windowEl.hidden||windowEl.classList.contains('maximized'))return;
  const layer=$('#floatingLayer');
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:windowEl.offsetLeft,top:windowEl.offsetTop,
   maxX:Math.max(0,layer.clientWidth-windowEl.offsetWidth),maxY:Math.max(0,layer.clientHeight-windowEl.offsetHeight)};
  try{event.currentTarget.setPointerCapture(event.pointerId)}catch(_){}
 }
 function moveDrag(event){
  if(!drag||event.pointerId!==drag.id)return;
  const x=Math.min(drag.maxX,Math.max(0,drag.left+event.clientX-drag.x));
  const y=Math.min(drag.maxY,Math.max(0,drag.top+event.clientY-drag.y));
  windowEl.style.left=x+'px';windowEl.style.top=y+'px';
  glassEngine?.requestDraw();
 }
 function stopDrag(event){
  if(drag&&event.pointerId===drag.id)drag=null;
 }
 function resetScene(){
  windowEl.classList.remove('maximized');
  windowEl.style.left='';windowEl.style.top='';
  $('#startSearch').value='';
  setScene(scene);
 }
 readSaved();syncInspector();renderStartApps();updateClock();setScene('desktop');
 glassEngine=window.LoliteLiquidGlassRenderer?.create?.({
  desktop,canvas:$('#liquidGlassCanvas'),
  onStatus:syncLiquidStatus
 })||null;
 glassEngine?.update({...state.liquid,wallpaper:state.wallpaper});
 syncLiquidStatus(glassEngine?.status());
 setInterval(updateClock,30000);
 document.addEventListener('pointermove',event=>{
  const target=event.target.closest?.('[data-glow]');
  if(!target||!state.glow||window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)return;
  const kind=target.dataset.glowType;
  if(kind&&state.surfaces[kind]===false)return;
  const rect=target.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  target.style.setProperty('--gx',((event.clientX-rect.left)/rect.width*100).toFixed(2)+'%');
  target.style.setProperty('--gy',((event.clientY-rect.top)/rect.height*100).toFixed(2)+'%');
 },{passive:true});
 document.addEventListener('click',event=>{
  const target=event.target;
  const sceneButton=target.closest('[data-scene]');
  if(sceneButton){setScene(sceneButton.dataset.scene);return}
  const appButton=target.closest('[data-open-app]');
  if(appButton){setScene(appButton.dataset.openApp);return}
  const theme=target.closest('[data-theme-choice]');
  if(theme){state.theme=theme.dataset.themeChoice;syncInspector();save();return}
  const wallpaper=target.closest('[data-wallpaper-choice]');
  if(wallpaper){state.wallpaper=wallpaper.dataset.wallpaperChoice;syncInspector();save();return}
  const color=target.closest('[data-glow-color]');
  if(color){state.color=color.dataset.glowColor;syncInspector();save();return}
  const liquidMode=target.closest('[data-liquid-mode]');
  if(liquidMode){state.liquid.mode=liquidMode.dataset.liquidMode;syncInspector();save();return}
  const windowButton=target.closest('[data-window-action]');
  if(windowButton){
   if(windowButton.dataset.windowAction==='maximize')toggleMaximize();
   if(windowButton.dataset.windowAction==='close')closeWindow();
   if(windowButton.dataset.windowAction==='minimize'){windowEl.hidden=true;$('#taskWindows').setAttribute('aria-pressed','false');glassEngine?.requestDraw()}
   return;
  }
  if(target.closest('#taskWindows')){setScene(lastWindowScene);return}
  if(target.closest('#taskStart')){openStart();return}
  if(target.closest('#taskSearch')){openStart();if(!startEl.hidden)$('#startSearch').focus();return}
  if(target.closest('#taskQuick')||target.closest('#taskClock')){openQuick();return}
  if(target.closest('#resetPreview')){resetScene();tell('Preview scene reset.');return}
  if(target.closest('#fullscreenPreview')){
   const frame=$('#previewBorder');
   if(document.fullscreenElement)void document.exitFullscreen();
   else if(typeof frame.requestFullscreen==='function')void frame.requestFullscreen().catch(()=>tell('Your browser blocked full screen.'));
   else tell('Fullscreen is not available in this browser.');
   return;
  }
  if(target.closest('#copySettings')){void copySettings();return}
  if(target.closest('#resetSettings')){state=defaults();syncInspector();save();setScene('desktop');tell('Design controls reset.');return}
  const quick=target.closest('[data-quick]');
  if(quick){
   const key=quick.dataset.quick;
   if(key==='glow'){state.glow=!state.glow;syncInspector();save()}
   else{quick.setAttribute('aria-pressed',String(quick.getAttribute('aria-pressed')!=='true'));tell(key+' setting changed in the preview.')}
   return;
  }
  const gameCategory=target.closest('[data-game-category]');
  if(gameCategory){
   const category=gameCategory.dataset.gameCategory;
   const list=$('#demoGames');if(list)list.innerHTML=gameCards(category);
   $$('[data-game-category]').forEach(btn=>{
    const on=btn.dataset.gameCategory===category;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on));
   });return;
  }
  const gameSelect=target.closest('[data-game-select]');
  if(gameSelect){const text=$('#demoGameStatus');if(text)text.textContent=gameSelect.dataset.gameSelect+' selected — demo only, no game launched.';return}
  const chatContact=target.closest('[data-chat-contact]');
  if(chatContact){selectChat(chatContact.dataset.chatContact);return}
  const demoSetting=target.closest('[data-demo-setting]');
  if(demoSetting){
   const choice=demoSetting.dataset.demoSetting,on=demoSetting.getAttribute('aria-pressed')==='true';
   demoSetting.setAttribute('aria-pressed',String(!on));
   if(choice==='glow'){state.glow=!on;syncInspector();save()}
   if(choice==='taskbar')desktop.classList.toggle('taskbar-flat',on);
   if(choice==='wallpaper')desktop.classList.toggle('wallpaper-still',on);
   return;
  }
  const demo=target.closest('[data-demo]');
  if(demo){
   if(demo.dataset.demo==='maximize'){toggleMaximize();return}
   tell('Button interaction previewed successfully.');
   return;
  }
  // Clicking the desktop outside menus closes them like a real operating system.
  if(target.closest('#previewDesktop')&&!target.closest('#startMenu')&&!target.closest('#quickPanel')&&!target.closest('.taskbar'))closeMenus();
 });
 $('#startSearch').addEventListener('input',event=>renderStartApps(event.target.value));
 for(const [element,key] of [['liquidBend','bend'],['liquidThickness','thickness'],['liquidShine','shine']])
  $('#'+element).addEventListener('input',event=>{
   state.liquid[key]=Number(event.target.value);syncLiquidControls();save();
  });
 $('#liquidMotion').addEventListener('change',event=>{
  state.liquid.motion=event.target.checked;syncLiquidControls();save();
 });
 $('#glowEnabled').addEventListener('change',event=>{state.glow=event.target.checked;syncInspector();save()});
 $('#glowIntensity').addEventListener('input',event=>{state.intensity=Number(event.target.value);syncInspector();save()});
 $('#glowSize').addEventListener('input',event=>{state.size=Number(event.target.value);syncInspector();save()});
 document.addEventListener('change',event=>{
  const input=event.target.closest?.('[data-glow-surface]');
  if(input){state.surfaces[input.dataset.glowSurface]=input.checked;syncInspector();save()}
 });
 $('#previewVolume').addEventListener('input',event=>{$('#volumeValue').textContent=event.target.value+'%'});
 document.addEventListener('submit',event=>{
  if(event.target.id!=='demoChatForm')return;
  event.preventDefault();
  const input=$('#demoChatInput'),holder=$('#demoMessages');
  const message=input?.value.trim();
  if(!message||!holder)return;
  const bubble=document.createElement('div');
  bubble.className='bubble sent';bubble.textContent=message;
  holder.appendChild(bubble);input.value='';holder.scrollTop=holder.scrollHeight;
 });
 // Drag the transparent demo lens over the wallpaper to verify actual pixel bending.
 const lens=$('#liquidLens');
 if(lens?.addEventListener){
  lens.addEventListener('pointerdown',event=>{
   if(event.button!==0)return;
   lensDrag={id:event.pointerId,x:event.clientX,y:event.clientY,
    left:lens.offsetLeft,top:lens.offsetTop,
    maxX:Math.max(0,desktop.clientWidth-lens.offsetWidth),
    maxY:Math.max(0,desktop.clientHeight-lens.offsetHeight-58)};
   lens.setPointerCapture?.(event.pointerId);
  });
  lens.addEventListener('pointermove',event=>{
   if(!lensDrag||event.pointerId!==lensDrag.id)return;
   lens.style.left=Math.min(lensDrag.maxX,Math.max(0,lensDrag.left+event.clientX-lensDrag.x))+'px';
   lens.style.top=Math.min(lensDrag.maxY,Math.max(0,lensDrag.top+event.clientY-lensDrag.y))+'px';
   glassEngine?.requestDraw();
  });
  const endLens=event=>{if(lensDrag&&lensDrag.id===event.pointerId)lensDrag=null};
  lens.addEventListener('pointerup',endLens);
  lens.addEventListener('pointercancel',endLens);
 }
 $('#windowDragHandle').addEventListener('pointerdown',startDrag);
 $('#windowDragHandle').addEventListener('pointermove',moveDrag);
 $('#windowDragHandle').addEventListener('pointerup',stopDrag);
 $('#windowDragHandle').addEventListener('pointercancel',stopDrag);
 $('#windowDragHandle').addEventListener('dblclick',event=>{if(!event.target.closest('button'))toggleMaximize()});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){if(!startEl.hidden||!quickEl.hidden){closeMenus();event.preventDefault()}else if(document.fullscreenElement)void document.exitFullscreen()}
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
   event.preventDefault();openStart();if(!startEl.hidden)$('#startSearch').focus();
  }
 });
 document.addEventListener('fullscreenchange',()=>{
  const on=!!document.fullscreenElement;
  $('#fullscreenPreview').querySelector('span').textContent=on?'Exit':'Expand';
  $('#fullscreenPreview').setAttribute('aria-label',on?'Exit fullscreen preview':'Expand fullscreen preview');
 });
})();
