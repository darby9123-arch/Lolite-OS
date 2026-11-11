/* Lolite OS — account-scoped taskbar appearance, inside Settings > Desktop.
 * Keeps native taskbar buttons, pinned apps, window actions and themes intact. */
(()=>{
 'use strict';
 const KEY='lolite.taskbar.v1.';
 const DEFAULT={
  height:56,iconSize:27,opacity:90,color:'#252225',
  position:'bottom',align:'center',blur:true,autoHide:false,
  search:true,clock:true,settings:true,style:'floating'
 };
 const RANGES={height:[46,76],iconSize:[20,36],opacity:[30,100]};
 const STYLES=[
  ['floating','Floating Glass','A neat floating panel with soft rounded edges.'],
  ['pill','Pill Dock','A compact, rounded dock for your apps.'],
  ['minimal','Minimal','Icons on the wallpaper, without a solid background bar.'],
  ['aero','Aero Glass','A translucent, softly glowing glass taskbar.'],
  ['classic','Classic','A traditional, full-width Windows-style taskbar.']
 ];
 const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
 const clamp=(value,low,high)=>Math.round(Math.max(low,Math.min(high,Number(value))));
 const validColor=value=>/^#[a-f0-9]{6}$/i.test(String(value))?value:DEFAULT.color;
 let account='guest',prefs={...DEFAULT},custom=false;
 const key=()=>KEY+account;
 function clean(data){
  const input=data&&typeof data==='object'&&!Array.isArray(data)?data:{};
  const next={...DEFAULT};
  for(const [name,range] of Object.entries(RANGES))
   if(Number.isFinite(Number(input[name])))next[name]=clamp(input[name],...range);
  next.color=validColor(input.color);
  next.style=STYLES.some(([id])=>id===input.style)?input.style:DEFAULT.style;
  next.position=['bottom','top'].includes(input.position)?input.position:DEFAULT.position;
  next.align=['center','left'].includes(input.align)?input.align:DEFAULT.align;
  for(const name of ['blur','autoHide','search','clock','settings'])
   if(typeof input[name]==='boolean')next[name]=input[name];
  return next;
 }
 function measure(){
  const button=Math.min(prefs.height-8,prefs.iconSize+17);
  // Keep icon artwork INSIDE the button's padded content area, even for
  // a short taskbar with a large saved icon-size preference.
  return {button,icon:Math.min(prefs.iconSize,Math.max(16,button-10))};
 }
 function apply(){
  const root=document.documentElement;
  root.classList.toggle('ltc-applied',custom);
  if(!custom){
   delete root.dataset.ltcPosition;
   delete root.dataset.ltcAlign;
   delete root.dataset.ltcAutohide;
   delete root.dataset.ltcSearch;
   delete root.dataset.ltcClock;
   delete root.dataset.ltcSettings;
   delete root.dataset.ltcStyle;
   return;
  }
  root.dataset.ltcPosition=prefs.position;
  root.dataset.ltcAlign=prefs.align;
  root.dataset.ltcAutohide=String(prefs.autoHide);
  root.dataset.ltcSearch=String(prefs.search);
  root.dataset.ltcClock=String(prefs.clock);
  root.dataset.ltcSettings=String(prefs.settings);
  root.dataset.ltcStyle=prefs.style;
  const dimensions=measure();
  const variables={
   '--ltc-height':prefs.height+'px',
   '--ltc-icon-size':dimensions.icon+'px',
   '--ltc-button-size':dimensions.button+'px',
   '--ltc-opacity':prefs.opacity+'%',
   '--ltc-color':prefs.color,
   '--ltc-blur':prefs.blur?'24px':'0px'
  };
  for(const [name,value] of Object.entries(variables))root.style.setProperty(name,value);
 }
 function load(){
  try{
   const saved=localStorage.getItem(key());
   custom=saved!==null;
   prefs=clean(saved?JSON.parse(saved):null);
  }catch(error){custom=false;prefs={...DEFAULT}}
  apply();
 }
 function save(){
  custom=true;
  try{localStorage.setItem(key(),JSON.stringify(prefs))}
  catch(error){console.warn('Could not save taskbar customisation:',error)}
  apply();
 }
 function slider(name,title,min,max,unit){
  return '<label class="ltc-control"><span><strong>'+title+'</strong><output data-ltc-value="'+name+'">'+prefs[name]+unit+'</output></span>'+
   '<input type="range" data-ltc-field="'+name+'" min="'+min+'" max="'+max+'" step="1" value="'+prefs[name]+'"></label>';
 }
 function option(name,title,options){
  return '<label class="ltc-control"><strong>'+title+'</strong><select data-ltc-field="'+name+'">'+
   options.map(([id,label])=>'<option value="'+id+'"'+(prefs[name]===id?' selected':'')+'>'+label+'</option>').join('')+
   '</select></label>';
 }
 function check(name,title){
  return '<label class="ltc-toggle"><input type="checkbox" data-ltc-field="'+name+'"'+(prefs[name]?' checked':'')+'><span>'+title+'</span></label>';
 }
 function tile(id,label){
  const icon=window.LoliteIcons?.tile?.(id);
  return '<span class="ltc-mini-app" title="'+esc(label)+'">'+(icon||'<span>◈</span>')+'</span>';
 }
 function stylePicker(){
  return '<div class="ltc-style-section"><div class="ltc-style-heading"><strong>Taskbar style</strong><small>Choose a look, then adjust the details below.</small></div>'+
   '<div class="ltc-style-grid" role="group" aria-label="Taskbar style">'+
   STYLES.map(([id,title,description])=>
    '<button type="button" class="ltc-style-card" data-ltc-style="'+id+'" aria-pressed="'+(prefs.style===id)+'">'+
    '<span class="ltc-style-swatch ltc-style-swatch--'+id+'" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'+
    '<strong>'+title+'</strong><small>'+description+'</small></button>').join('')+
   '</div></div>';
 }
 function markup(){
  return '<section class="card ltc-settings" id="lolite-taskbar-settings" aria-label="Taskbar customisation">'+
   '<div class="ltc-heading"><div><small>DESKTOP PERSONALISATION</small><h3>Taskbar Customisation</h3><p>Adjust how the taskbar looks and behaves. Changes apply instantly.</p></div>'+
   '<button type="button" class="soft" data-ltc-reset>Reset taskbar</button></div>'+
   '<div class="ltc-preview-stage"><div class="ltc-preview-label">LIVE TASKBAR PREVIEW</div>'+
   '<div class="ltc-preview-screen"><div class="ltc-preview-bar" data-ltc-preview-bar aria-hidden="true">'+
   '<span class="ltc-mini-start"><i></i><i></i><i></i><i></i></span>'+
   '<span class="ltc-mini-search" data-ltc-preview-search>⌕</span>'+
   tile('files','Files')+tile('games','Game Store')+tile('browser','Browser')+
   '<span class="ltc-mini-spacer"></span><span class="ltc-mini-gear" data-ltc-preview-settings>⚙</span>'+
   '<span class="ltc-mini-clock" data-ltc-preview-clock>10:30</span></div></div>'+
   '<p class="ltc-hint">The real Start menu, running apps, pinned shortcuts and notifications still work normally.</p></div>'+
   stylePicker()+
   '<div class="ltc-controls">'+
   slider('height','Taskbar height',46,76,'px')+
   slider('iconSize','Taskbar icon size',20,36,'px')+
   slider('opacity','Taskbar opacity',30,100,'%')+
   option('position','Taskbar position',[['bottom','Bottom'],['top','Top']])+
   option('align','App alignment',[['center','Centre'],['left','Left']])+
   '<label class="ltc-control ltc-color"><strong>Taskbar colour</strong><input type="color" data-ltc-field="color" aria-label="Taskbar background colour" value="'+esc(prefs.color)+'"></label>'+
   '<div class="ltc-toggles">'+
   check('blur','Blurred glass background')+
   check('autoHide','Automatically hide taskbar (desktop mouse)')+
   check('search','Show Search button')+
   check('clock','Show clock and calendar')+
   check('settings','Show Settings shortcut')+
   '</div><small class="ltc-hint ltc-footer">Saved to this Lolite account on this device. Reset taskbar will not reset your desktop icons.</small>'+
   '</div></section>';
 }
 function preview(){
  const pane=document.getElementById('lolite-taskbar-settings');
  if(!pane)return;
  const bar=pane.querySelector('[data-ltc-preview-bar]');
  if(!bar)return;
  const dimensions=measure();
  bar.style.setProperty('--ltc-preview-height',Math.round(prefs.height*.68)+'px');
  bar.style.setProperty('--ltc-preview-icon',Math.round(dimensions.icon*.72)+'px');
  bar.style.setProperty('--ltc-preview-button',Math.round(dimensions.button*.72)+'px');
  bar.style.setProperty('--ltc-preview-opacity',prefs.opacity+'%');
  bar.style.setProperty('--ltc-preview-color',prefs.color);
  bar.style.setProperty('--ltc-preview-blur',prefs.blur?'12px':'0px');
  bar.dataset.position=prefs.position;
  bar.dataset.align=prefs.align;
  bar.dataset.style=prefs.style;
  pane.querySelectorAll('[data-ltc-style]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ltcStyle===prefs.style)));
  pane.querySelector('[data-ltc-preview-search]').hidden=!prefs.search;
  pane.querySelector('[data-ltc-preview-clock]').hidden=!prefs.clock;
  pane.querySelector('[data-ltc-preview-settings]').hidden=!prefs.settings;
  for(const [name,value] of Object.entries(prefs)){
   const el=pane.querySelector('[data-ltc-field="'+name+'"]');
   if(el){
    if(el.type==='checkbox')el.checked=!!value;
    else if(el!==document.activeElement)el.value=String(value);
   }
   const label=pane.querySelector('[data-ltc-value="'+name+'"]');
   if(label)label.textContent=value+(name==='opacity'?'%':'px');
  }
 }
 function reset(){
  try{localStorage.removeItem(key())}catch(error){}
  custom=false;prefs={...DEFAULT};apply();
  const panel=document.getElementById('lolite-taskbar-settings');
  if(panel){panel.outerHTML=markup();preview()}
 }
 function updateField(element){
  const field=element.dataset.ltcField;
  if(!(field in DEFAULT))return;
  if(field in RANGES)prefs[field]=clamp(element.value,...RANGES[field]);
  else if(field==='color')prefs.color=validColor(element.value);
  else if(field==='position')prefs.position=['top','bottom'].includes(element.value)?element.value:'bottom';
  else if(field==='align')prefs.align=['center','left'].includes(element.value)?element.value:'center';
  else prefs[field]=!!element.checked;
  save();preview();
 }
 document.addEventListener('input',event=>{
  const el=event.target.closest?.('#lolite-taskbar-settings [data-ltc-field]');
  if(el)updateField(el);
 });
 document.addEventListener('change',event=>{
  const el=event.target.closest?.('#lolite-taskbar-settings [data-ltc-field]');
  if(el)updateField(el);
 });
 document.addEventListener('click',event=>{
  const styleButton=event.target.closest?.('#lolite-taskbar-settings [data-ltc-style]');
  if(styleButton){
   const selected=styleButton.dataset.ltcStyle;
   if(STYLES.some(([id])=>id===selected)){prefs.style=selected;save();preview()}
   return;
  }
  if(event.target.closest?.('#lolite-taskbar-settings [data-ltc-reset]'))reset();
 });
 function accountChange(id){
  const next=id||'guest';
  if(next===account)return;
  account=next;load();
  const pane=document.getElementById('lolite-taskbar-settings');
  if(pane){pane.outerHTML=markup();preview()}
 }
 function initAuth(){
  const sb=window.LoliteBrowserAccounts?.getClient?.();
  if(!sb?.auth)return;
  sb.auth.getSession().then(({data})=>accountChange(data?.session?.user?.id)).catch(()=>{});
  sb.auth.onAuthStateChange((_event,session)=>accountChange(session?.user?.id));
 }
 function init(){
  load();initAuth();
  window.LoliteTaskbarCustomization=Object.freeze({markup,preview,reset,apply,get:()=>({...prefs})});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
