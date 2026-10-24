/* Lolite Crimson workspace and personalisation. Uses existing app launchers and storage. */
(()=>{'use strict';
 const icon=id=>window.LoliteIcons?.tile(id)||'',root=document.documentElement;
 const apps=[['games','Game Store','Pick your next game'],['files','Files','Your files, organised'],['chatroom','Lolite Chat','Messages and calls'],['appstore','App Store','Find a useful tool'],['academy','Academy','Learn something new'],['lolite-quests','Quests','Activities and rewards'],['life-rp','Life RP','Build your own story'],['settings','Settings','Make it yours']];
 let tab='appearance',filter='All';const oldPage=window.page;
 function launch(id){const name=apps.find(a=>a[0]===id)?.[1]||id;if(window.LoliteDeviceMode?.mode().mode==='browsing'){window.LoliteDeviceMode.openApp(id);return}window.openApp(id,name,id==='settings'?970:1060,710)}
 const themePalettes={
  crimson:['#222027','#c93b4e','#fbe5e8'],windows11:['#19283f','#3b91e9','#e1f3ff'],aero7:['#0d3455','#63a9df','#ecfbff'],
  plasma:['#241c36','#9670e6','#efe6ff'],gnome:['#242830','#d1d6df','#f1f3f5'],deepin:['#253a52','#52b3c9','#e9ffff'],
  firefox:['#29183a','#fd7a48','#fff4e7'],opera:['#210f19','#eb3656','#ffe2e9'],arc:['#29293f','#9d9def','#f5f4ff'],
  zen:['#1b2028','#7b8b9b','#edf4f7'],brave:['#292539','#ff794e','#fff1e8']
 };
 function themePanel(mode){
  const isBrowser=mode==='browser',api=isBrowser?window.LoliteBrowserThemes:window.LoliteDesktopThemes;
  const themes=api?.themes||[],active=api?.getTheme?.();
  const cards=themes.map(theme=>{
   const colors=themePalettes[theme.id]||themePalettes.crimson,chosen=theme.id===active;
   const desc=theme.desc||theme.description||'';
   return '<button type="button" class="cr-theme-choice" data-cr-theme-select="'+theme.id+'" data-cr-target="'+mode+'" aria-pressed="'+chosen+'" style="--cr-tbg:'+colors[0]+';--cr-taccent:'+colors[1]+';--cr-ttext:'+colors[2]+'">'+
     '<span class="cr-theme-preview" aria-hidden="true"><i></i><em></em><b></b></span>'+
     '<span class="cr-theme-row"><strong>'+theme.name+'</strong><span class="cr-theme-check" aria-hidden="true">'+(chosen?'✓':'')+'</span></span>'+
     '<small>'+desc+'</small></button>';
  }).join('');
  return '<section class="cr-themes" data-cr-theme-panel data-cr-mode="'+mode+'">'+
   '<div class="cr-section-head"><h2>Make it yours</h2><span>Choose a theme right here in Home</span></div>'+
   '<div class="cr-theme-header"><div><strong>Workspace themes</strong><p>Change the look without changing your apps, files or games.</p></div>'+
   '<div class="cr-theme-tabs" role="group" aria-label="Theme type">'+
    '<button type="button" data-cr-theme-mode="desktop" aria-pressed="'+(!isBrowser)+'">Desktop</button>'+
    '<button type="button" data-cr-theme-mode="browser" aria-pressed="'+isBrowser+'">Browser</button></div></div>'+
   '<div class="cr-theme-grid">'+cards+'</div>'+
   '<p class="cr-theme-note">'+(isBrowser?'Browser themes change Browsing Style.':'Desktop themes change Desktop Style.')+' Your choice is saved automatically.</p></section>';
 }
 function homeMarkup(browser=false){
  const hour=new Date().getHours(),greeting=hour<12?'Good morning.':hour<18?'Good afternoon.':'Good evening.';
  return `<div class="cr-home"><header class="cr-home-head"><div><span class="cr-eyebrow">LOLITE OS / HOME</span><h1>${greeting}</h1></div><span class="cr-edition"><i></i> Lolite OS</span></header><section class="cr-home-feature"><div class="cr-feature-copy"><span class="cr-eyebrow">YOUR SPACE, REIMAGINED</span><h2>Less noise.<br>More Lolite.</h2><p>Play something. Make something.<br>Everything you need, right here.</p><div class="cr-feature-actions"><button class="cr-primary" data-cr-open="games">Explore games <span>↗</span></button><button class="cr-secondary" data-cr-settings="wallpapers">Change wallpaper</button></div></div><span class="cr-art-credit">01 / CRIMSON DUNES</span></section>${themePanel(browser?'browser':'desktop')}<div class="cr-section-head"><h2>Your essentials</h2><span>Pick up where you left off</span></div><div class="cr-app-grid">${apps.map(([id,name,desc])=>`<button class="cr-app" data-cr-open="${id}">${icon(id)}<span><strong>${name}</strong><small>${desc}</small></span><span class="cr-arrow" aria-hidden="true">↗</span></button>`).join('')}</div><section class="cr-personalise"><div>${icon('wallpaper')}<span><strong>A desktop that feels like yours.</strong><small>17 wallpapers, 8 live scenes, and subtle system sounds.</small></span></div><button class="cr-text-button" data-cr-settings="appearance">Personalise <span aria-hidden="true">→</span></button></section><details class="cr-updates"><summary>What's new in Lolite <span>View updates</span></summary><div data-lu-feed>${window.LoliteWhatsNew?.homeMarkup()||'<p>Crimson brings a quieter interface, new wallpapers, redesigned icons and system sounds.</p>'}</div></details></div>`;
 }
 const row=(title,desc,control)=>`<div class="cr-setting-row"><div><strong>${title}</strong><p>${desc}</p></div>${control}</div>`;
 const check=(attr,on,label)=>`<label class="cr-switch"><input type="checkbox" ${attr} ${on?'checked':''} aria-label="${label}"><span aria-hidden="true"></span></label>`;
 function appearance(){return `<div class="cr-section-head"><h2>Your workspace</h2><span>Personalisation</span></div><p class="cr-help">Adjust the layout, wallpapers, and sounds. Choose Desktop and Browser themes directly in the Home app.</p><div class="cr-setting-group">${row('Workspace layout','Switch between Desktop Style and Browsing Style.','<button class="cr-secondary" data-cr-action="layout">Change layout</button>')}${row('Wallpapers & live scenes','Choose from still and animated wallpapers.','<button class="cr-secondary" data-cr-settings="wallpapers">Browse wallpapers</button>')}${row('System sounds','Adjust volume, enable sounds, and try previews.','<button class="cr-secondary" data-cr-settings="sounds">Sound settings</button>')}</div><button class="cr-wall-link" data-cr-settings="wallpapers">${icon('wallpaper')}<span><strong>Wallpapers & live scenes</strong><small>Explore the collection</small></span><span aria-hidden="true">→</span></button>`}
 function wallpaperPanel(){const w=window.LoliteWallpapers.current();return `<div class="cr-now-playing"><div><span class="cr-eyebrow">ON YOUR DESKTOP</span><strong data-cr-wall-name>${w?.name||'Crimson Dunes'}</strong></div><label class="cr-inline-toggle"><input type="checkbox" data-cr-live ${window.LoliteWallpapers.isPaused()?'':'checked'}> Live motion</label></div><div data-cr-wall-library>${window.LoliteWallpapers.markup(filter)}</div>`}
 function soundsPanel(){const s=window.LoliteSounds.state();return `<div class="cr-sound-intro">${icon('sounds')}<div><h2>A little feedback.</h2><p>Short, original tones for everyday actions.</p></div></div><div class="cr-setting-group">${row('System sounds','App actions and notifications, at your volume.',check('data-cr-sounds',s.enabled,'System sounds'))}${row('Volume','Independent of games, calls and media.',`<div class="cr-volume"><input type="range" min="0" max="100" value="${Math.round(s.volume*100)}" data-cr-volume aria-label="System sound volume"><output data-cr-volume-label>${Math.round(s.volume*100)}%</output></div>`)}</div><div class="cr-section-head"><h2>Listen to the sounds</h2><span>Click to preview</span></div><div class="cr-sound-grid">${[['startup','Welcome'],['open','Open an app'],['close','Close an app'],['minimise','Minimise'],['restore','Restore'],['notification','Notification']].map(([id,name])=>`<button class="cr-sound" data-cr-sound="${id}" ${s.enabled?'':'disabled'}><span aria-hidden="true">▷</span><strong>${name}</strong></button>`).join('')}</div><p class="cr-help">Sounds start after you interact with Lolite. No hover sounds, typing sounds or looping background audio.</p>`}
 function motionPanel(){const reduced=root.classList.contains('reduce')||root.classList.contains('reduce-motion');return `<div class="cr-setting-group">${row('Reduce interface motion','Turn off the short fades and transitions.',check('data-cr-reduce',reduced,'Reduce interface motion'))}${row('Live wallpaper motion','Pause or resume animated scenes.',check('data-cr-live',!window.LoliteWallpapers.isPaused(),'Live wallpaper motion'))}</div><p class="cr-help">Lolite uses a quick fade when an app opens. Closing, minimising and resizing respond immediately. Your device’s Reduce Motion preference also pauses live wallpapers.</p><h2 class="cr-subheading">Cursors & other settings</h2><div class="cr-advanced">${oldPage('settings')}</div>`}
 function settingsMarkup(){const sections=[['appearance','Appearance','settings'],['wallpapers','Wallpapers','wallpaper'],['sounds','Sounds','sounds'],['accessibility','Motion & cursors','autoclick']],current=sections.find(s=>s[0]===tab)||sections[0];return `<div class="cr-settings"><aside class="cr-settings-nav"><div class="cr-settings-brand"><span class="cr-eyebrow">LOLITE OS</span><h1>Settings</h1></div><nav aria-label="Settings sections">${sections.map(([id,label,glyph])=>`<button type="button" data-cr-tab="${id}" aria-current="${id===tab?'page':'false'}">${icon(glyph)}<span>${label}</span></button>`).join('')}</nav><small class="cr-settings-foot">Make it your own.</small></aside><section class="cr-settings-main" aria-label="${current[1]}"><header><span class="cr-eyebrow">PERSONALISATION</span><h1>${current[1]}</h1></header>${tab==='wallpapers'?wallpaperPanel():tab==='sounds'?soundsPanel():tab==='accessibility'?motionPanel():appearance()}</section></div>`}
 function renderSettings(){const panel=document.querySelector('[data-window-id="settings"]>.content');if(panel)panel.innerHTML=settingsMarkup()}
 function openSettings(section){tab=section||'appearance';launch('settings');renderSettings()}
 window.page=function(id){if(id==='home')return homeMarkup();if(id==='settings')return settingsMarkup();return oldPage.apply(this,arguments)};
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-cr-open],[data-cr-settings],[data-cr-tab],[data-wall-id],[data-wall-filter],[data-cr-action],[data-cr-sound],[data-cr-theme-mode],[data-cr-theme-select]');if(!b)return;
  if(b.dataset.crThemeMode){
   const panel=b.closest('[data-cr-theme-panel]');
   if(panel){panel.outerHTML=themePanel(b.dataset.crThemeMode);
    document.querySelector('[data-cr-theme-panel][data-cr-mode="'+b.dataset.crThemeMode+'"] [data-cr-theme-mode="'+b.dataset.crThemeMode+'"]')?.focus({preventScroll:true})}
   return;
  }
  if(b.dataset.crThemeSelect){
   const mode=b.dataset.crTarget,api=mode==='browser'?window.LoliteBrowserThemes:window.LoliteDesktopThemes;
   if(api?.setTheme(b.dataset.crThemeSelect)){
    document.querySelectorAll('[data-cr-theme-panel]').forEach(panel=>{panel.outerHTML=themePanel(panel.dataset.crMode)});
    const selected=api.themes.find(t=>t.id===b.dataset.crThemeSelect);
    const visible=window.LoliteDeviceMode?.mode().mode===(mode==='browser'?'browsing':'desktop');
    window.toast?.((selected?.name||'Theme')+(visible?' applied.':' saved for '+(mode==='browser'?'Browsing':'Desktop')+' Style.'));
   }
   return;
  }
  if(b.dataset.crOpen)launch(b.dataset.crOpen);
  if(b.dataset.crSettings)openSettings(b.dataset.crSettings);
  if(b.dataset.crTab){tab=b.dataset.crTab;renderSettings();document.querySelector(`[data-cr-tab="${tab}"]`)?.focus()}
  if(b.dataset.wallId)window.LoliteWallpapers.apply(b.dataset.wallId);
  if(b.dataset.wallFilter){filter=b.dataset.wallFilter;const holder=document.querySelector('[data-cr-wall-library]');if(holder){holder.innerHTML=window.LoliteWallpapers.markup(filter);holder.querySelector(`[data-wall-filter="${filter}"]`)?.focus()}}
  if(b.dataset.crSound)window.LoliteSounds.play(b.dataset.crSound,true);
  if(b.dataset.crAction==='layout')window.LoliteDeviceMode?.showChooser();
 });
 document.addEventListener('input',e=>{if(e.target.matches('[data-cr-volume]')){window.LoliteSounds.setVolume(e.target.value/100);const label=document.querySelector('[data-cr-volume-label]');if(label)label.textContent=e.target.value+'%'}});
 document.addEventListener('change',e=>{
  const el=e.target;
  if(el.matches('[data-cr-sounds]')){window.LoliteSounds.setEnabled(el.checked);document.querySelectorAll('[data-cr-sound]').forEach(b=>b.disabled=!el.checked)}
  if(el.matches('[data-cr-reduce]')){window.toggleReduce(el.checked);window.LoliteWallpapers.sync();document.querySelectorAll('[data-cr-live]').forEach(n=>n.checked=!window.LoliteWallpapers.isPaused())}
  if(el.matches('[data-cr-live]')){window.LoliteWallpapers.pause(!el.checked);el.checked=!window.LoliteWallpapers.isPaused()}
  if(el.matches('[data-wall-upload]')){const file=el.files?.[0];if(!file)return;if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>3*1024*1024){window.toast('Choose a JPG, PNG or WebP image under 3 MB.');el.value='';return}const reader=new FileReader();reader.onload=()=>{if(window.LoliteWallpapers.setCustom(String(reader.result)))window.toast('Your wallpaper is ready.')};reader.onerror=()=>window.toast('That image could not be read. Please try another.');reader.readAsDataURL(file);el.value=''}
 });
 addEventListener('lolite:wallpaperchange',e=>{document.querySelectorAll('[data-wall-id]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wallId===e.detail.id)));document.querySelectorAll('[data-cr-wall-name]').forEach(n=>n.textContent=e.detail.name)});
 function init(){root.dataset.loliteDesign='crimson';root.style.setProperty('--accent',localStorage.getItem('loliteAccent')||'#e85c64');root.style.setProperty('--blue','var(--accent)');
  // Existing paint exports also become proper persisted custom wallpapers.
  window.loliteWallpaperData=data=>window.LoliteWallpapers.setCustom(data);
  const oldSave=window.wpSave;if(oldSave)window.wpSave=()=>{oldSave();const data=localStorage.getItem('loliteCustomWallpaper');if(data)window.LoliteWallpapers.setCustom(data)};
  window.LoliteWallpapers.restore();
 }
 window.LoliteCrimson={homeMarkup,openSettings};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
