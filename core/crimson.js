/* Lolite Crimson workspace and personalisation. Uses existing app launchers and storage. */
(()=>{'use strict';
 const icon=id=>window.LoliteIcons?.tile(id)||'',root=document.documentElement;
 const apps=[['games','Game Store','Pick your next game'],['files','Files','Your files, organised'],['chatroom','Lolite Chat','Messages and calls'],['appstore','App Store','Find a useful tool'],['academy','Academy','Learn something new'],['lolite-quests','Quests','Activities and rewards'],['life-rp','Life RP','Build your own story'],['settings','Settings','Make it yours']];
 let tab='appearance',filter='MotionBGS',wallQuery='';const oldPage=window.page;
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
 function homeMarkup(browser=false){return window.LoliteDesktopShell.homeMarkup(browser,themePanel(browser?'browser':'desktop'))}

 const row=(title,desc,control)=>`<div class="cr-setting-row"><div><strong>${title}</strong><p>${desc}</p></div>${control}</div>`;
 const check=(attr,on,label)=>`<label class="cr-switch"><input type="checkbox" ${attr} ${on?'checked':''} aria-label="${label}"><span aria-hidden="true"></span></label>`;
 function appearance(){return `<div class="cr-section-head"><h2>Your workspace</h2><span>Personalisation</span></div><p class="cr-help">Adjust the layout, wallpapers, and sounds. Choose Desktop and Browser themes directly in the Home app.</p><div class="cr-setting-group">${row('Workspace layout','Switch between Desktop Style and Browsing Style.','<button class="cr-secondary" data-cr-action="layout">Change layout</button>')}${row('Wallpapers & live scenes','Choose from still and animated wallpapers.','<button class="cr-secondary" data-cr-settings="wallpapers">Browse wallpapers</button>')}${row('System sounds','Adjust volume, enable sounds, and try previews.','<button class="cr-secondary" data-cr-settings="sounds">Sound settings</button>')}</div><button class="cr-wall-link" data-cr-settings="wallpapers">${icon('wallpaper')}<span><strong>Wallpapers & live scenes</strong><small>Explore the collection</small></span><span aria-hidden="true">→</span></button>`}
 function wallpaperPanel(){const api=window.LoliteWallpapers,w=api.current();return `<div class="cr-now-playing"><div><span class="cr-eyebrow">ON YOUR DESKTOP</span><strong data-cr-wall-name>${w?.name||'Crimson Dunes'}</strong><small data-cr-wall-status role="status">${api.getStatus()}</small></div><label class="cr-inline-toggle"><input type="checkbox" data-cr-live ${api.isPaused()?'':'checked'}> Live motion</label></div><div class="cr-video-options"><label>Video quality <select data-wall-quality aria-label="Live wallpaper video quality"><option value="hd" ${api.getQuality()==='hd'?'selected':''}>HD · 1080p</option><option value="lite" ${api.getQuality()==='lite'?'selected':''}>Data saver · 540p</option></select></label><button type="button" class="cr-secondary" data-wall-retry ${w?.video?'':'hidden'}>Try again</button><span>24 MotionBGS videos · 8 Lolite live scenes</span></div><div data-cr-wall-library>${api.markup(filter,wallQuery)}</div>`}
 function soundsPanel(){const api=window.LoliteSounds,s=api.state();return `<div class="cr-sound-intro">${icon('sounds')}<div><h2>Bring your desktop to life.</h2><p>${api.catalog().length} original sounds. Set the volume and choose what makes a sound.</p></div></div><div class="cr-setting-group">${row('System sounds','Feedback for the things you do in Lolite.',check('data-cr-sounds',s.enabled,'System sounds'))}${row('Volume','Independent of games, calls and media.',`<div class="cr-volume"><input type="range" min="0" max="100" value="${Math.round(s.volume*100)}" data-cr-volume aria-label="System sound volume"><output data-cr-volume-label>${Math.round(s.volume*100)}%</output></div>`)}</div><div class="cr-section-head"><h2>Choose your soundscape</h2><span>Saved automatically</span></div><div class="cr-setting-group cr-sound-categories">${api.groups().map(g=>row(g.name,g.description,check(`data-cr-sound-group="${g.id}"`,g.enabled,g.name+' sounds'))).join('')}</div><div class="cr-section-head"><h2>Sound library</h2><span data-cr-sound-status role="status">Click to preview</span></div>${api.groups().map(g=>`<details class="cr-sound-section" ${g.id==='windows'?'open':''}><summary>${g.name}<span>${api.catalog().filter(s=>s.group===g.id).length} ${api.catalog().filter(s=>s.group===g.id).length===1?'sound':'sounds'}</span></summary><div class="cr-sound-grid">${api.catalog().filter(s=>s.group===g.id).map(({id,name})=>`<button class="cr-sound" data-cr-sound="${id}" ${s.enabled?'':'disabled'}><span aria-hidden="true">▷</span><strong>${name}</strong></button>`).join('')}</div></details>`).join('')}<p class="cr-help">Typing and hover sounds are optional. Previews let you hear any category while system sounds are on. Sounds start after an interaction and stop when this tab is hidden.</p>`}
 function motionPanel(){const reduced=root.classList.contains('reduce')||root.classList.contains('reduce-motion');return `<div class="cr-setting-group">${row('Reduce interface motion','Turn off the short fades and transitions.',check('data-cr-reduce',reduced,'Reduce interface motion'))}${row('Live wallpaper motion','Pause or resume animated scenes.',check('data-cr-live',!window.LoliteWallpapers.isPaused(),'Live wallpaper motion'))}</div><p class="cr-help">Windows open and close smoothly, minimise into the taskbar, and settle into snap layouts. Your device’s Reduce Motion preference also pauses live wallpapers.</p><h2 class="cr-subheading">Cursors & other settings</h2><div class="cr-advanced">${oldPage('settings')}</div>`}
 function settingsMarkup(){const sections=[['appearance','Appearance','settings'],['wallpapers','Wallpapers','wallpaper'],['sounds','Sounds','sounds'],['accessibility','Motion & cursors','autoclick']],current=sections.find(s=>s[0]===tab)||sections[0];return `<div class="cr-settings"><aside class="cr-settings-nav"><div class="cr-settings-brand"><span class="cr-eyebrow">LOLITE OS</span><h1>Settings</h1></div><nav aria-label="Settings sections">${sections.map(([id,label,glyph])=>`<button type="button" data-cr-tab="${id}" aria-current="${id===tab?'page':'false'}">${icon(glyph)}<span>${label}</span></button>`).join('')}</nav><small class="cr-settings-foot">Make it your own.</small></aside><section class="cr-settings-main" aria-label="${current[1]}"><header><span class="cr-eyebrow">PERSONALISATION</span><h1>${current[1]}</h1></header>${tab==='wallpapers'?wallpaperPanel():tab==='sounds'?soundsPanel():tab==='accessibility'?motionPanel():appearance()}</section></div>`}
 function renderSettings(){const panel=document.querySelector('[data-window-id="settings"]>.content');if(panel)panel.innerHTML=settingsMarkup()}
 function openSettings(section){tab=section||'appearance';launch('settings');renderSettings()}
 window.page=function(id){if(id==='home')return homeMarkup();if(id==='settings')return settingsMarkup();return oldPage.apply(this,arguments)};
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-cr-open],[data-cr-settings],[data-cr-tab],[data-wall-id],[data-wall-filter],[data-cr-action],[data-cr-sound],[data-cr-theme-mode],[data-cr-theme-select],[data-wall-retry]');if(!b)return;
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
  if(b.dataset.wallFilter){filter=b.dataset.wallFilter;const holder=document.querySelector('[data-cr-wall-library]');if(holder){holder.innerHTML=window.LoliteWallpapers.markup(filter,wallQuery);holder.querySelector(`[data-wall-filter="${filter}"]`)?.focus()}}
  if(b.hasAttribute('data-wall-retry'))window.LoliteWallpapers.retry();
  if(b.dataset.crSound)window.LoliteSounds.preview(b.dataset.crSound).then(played=>{const status=document.querySelector('[data-cr-sound-status]');if(status)status.textContent=played?'Previewing '+b.querySelector('strong').textContent:'Turn on sounds and raise the volume to preview'});
  if(b.dataset.crAction==='layout')window.LoliteDeviceMode?.showChooser();
 });
 document.addEventListener('input',e=>{if(e.target.matches('[data-wall-search]')){wallQuery=e.target.value;const grid=e.target.closest('[data-cr-wall-library]').querySelector('.cr-wall-grid');grid.innerHTML=window.LoliteWallpapers.cards(filter,wallQuery)}if(e.target.matches('[data-cr-volume]')){window.LoliteSounds.setVolume(e.target.value/100);const label=document.querySelector('[data-cr-volume-label]');if(label)label.textContent=e.target.value+'%'}});
 document.addEventListener('change',e=>{
  const el=e.target;
  if(el.matches('[data-cr-sound-group]'))window.LoliteSounds.setGroup(el.dataset.crSoundGroup,el.checked);
  if(el.matches('[data-wall-quality]'))window.LoliteWallpapers.setQuality(el.value);
  if(el.matches('[data-cr-sounds]')){window.LoliteSounds.setEnabled(el.checked);document.querySelectorAll('[data-cr-sound]').forEach(b=>b.disabled=!el.checked)}
  if(el.matches('[data-cr-reduce]')){window.toggleReduce(el.checked);window.LoliteWallpapers.sync();document.querySelectorAll('[data-cr-live]').forEach(n=>n.checked=!window.LoliteWallpapers.isPaused())}
  if(el.matches('[data-cr-live]')){window.LoliteWallpapers.pause(!el.checked);el.checked=!window.LoliteWallpapers.isPaused()}
  if(el.matches('[data-wall-upload]')){const file=el.files?.[0];if(!file)return;if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>3*1024*1024){window.toast('Choose a JPG, PNG or WebP image under 3 MB.');el.value='';return}const reader=new FileReader();reader.onload=()=>{if(window.LoliteWallpapers.setCustom(String(reader.result)))window.toast('Your wallpaper is ready.')};reader.onerror=()=>window.toast('That image could not be read. Please try another.');reader.readAsDataURL(file);el.value=''}
 });
 addEventListener('lolite:wallpaperchange',e=>{document.querySelectorAll('[data-wall-id]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wallId===e.detail.id)));document.querySelectorAll('[data-cr-wall-name]').forEach(n=>n.textContent=e.detail.name);document.querySelectorAll('[data-wall-retry]').forEach(n=>n.hidden=!window.LoliteWallpapers.current()?.video)});
 addEventListener('lolite:wallpaperstatus',e=>{document.querySelectorAll('[data-cr-wall-status]').forEach(n=>n.textContent=e.detail.status)});
 function init(){root.dataset.loliteDesign='crimson';root.style.setProperty('--accent',localStorage.getItem('loliteAccent')||'#e85c64');root.style.setProperty('--blue','var(--accent)');
  // Existing paint exports also become proper persisted custom wallpapers.
  window.loliteWallpaperData=data=>window.LoliteWallpapers.setCustom(data);
  const oldSave=window.wpSave;if(oldSave)window.wpSave=()=>{oldSave();const data=localStorage.getItem('loliteCustomWallpaper');if(data)window.LoliteWallpapers.setCustom(data)};
  window.LoliteWallpapers.restore();
 }
 window.LoliteCrimson={homeMarkup,openSettings};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
