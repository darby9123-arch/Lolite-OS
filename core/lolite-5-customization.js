/* Lolite OS 5.0 — native Settings Customization Studio.
 * Small validated, account-scoped preferences. No external assets or polling. */
(()=>{
 'use strict';
 const root=document.documentElement;
 const fields={
  windowRadius:{key:'lolite5WindowRadius',default:12,min:6,max:22,unit:'px'},
  panelOpacity:{key:'lolite5PanelOpacity',default:95,min:74,max:100,unit:'%'},
  taskbarOpacity:{key:'lolite5TaskbarOpacity',default:92,min:70,max:100,unit:'%'},
  density:{key:'lolite5TaskbarDensity',default:'standard',values:['compact','standard','comfortable']},
  motion:{key:'loliteMotionMode',default:'smooth',values:['smooth','snappy','off']},
  wallpaperTransition:{key:'loliteWallpaperTransitionMode',default:'smooth',values:['off','smooth','cinematic']}
 };
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 function valid(name,value){
  const config=fields[name];if(!config)return null;
  if(config.values)return config.values.includes(String(value))?String(value):config.default;
  const n=Number(value);return Number.isFinite(n)?Math.min(config.max,Math.max(config.min,Math.round(n))):config.default;
 }
 const stored=name=>{try{return localStorage.getItem(fields[name].key)}catch{return null}};
 let state=Object.fromEntries(Object.keys(fields).map(name=>[name,valid(name,stored(name)??fields[name].default)]));
 function apply(){
  root.style.setProperty('--l5-window-radius',state.windowRadius+'px');
  root.style.setProperty('--l5-panel-alpha',String(state.panelOpacity/100));
  root.style.setProperty('--l5-taskbar-alpha',String(state.taskbarOpacity/100));
  root.style.setProperty('--l5-panel-opacity',state.panelOpacity+'%');
  root.style.setProperty('--l5-taskbar-opacity',state.taskbarOpacity+'%');
  root.dataset.loliteUiDensity=state.density;
  // These APIs enforce OS reduced-motion and wallpaper performance settings.
  window.LoliteMotion?.setMode?.(state.motion);
  window.LoliteWallpapers?.setTransitionMode?.(state.wallpaperTransition);
 }
 function set(name,value){
  if(!fields[name])return false;
  const next=valid(name,value);
  if(next===state[name])return true;
  state[name]=next;
  try{localStorage.setItem(fields[name].key,String(next))}catch{}
  apply();
  window.dispatchEvent?.(new CustomEvent('lolite:customizationchange',{detail:{name,value:next}}));
  updateEditor();
  return true;
 }
 function restore(){
  for(const name of Object.keys(fields))state[name]=valid(name,stored(name)??fields[name].default);
  apply();updateEditor();
 }
 function reset(){
  for(const [name,config] of Object.entries(fields)){
   state[name]=config.default;
   try{localStorage.removeItem(config.key)}catch{}
  }
  apply();updateEditor();
  window.dispatchEvent?.(new CustomEvent('lolite:customizationchange',{detail:{reset:true}}));
 }
 const slider=(name,label)=>{const c=fields[name],value=state[name];
  return '<label><span><strong>'+safe(label)+'</strong><output data-l5-value="'+name+'">'+value+c.unit+'</output></span>'+
  '<input type="range" min="'+c.min+'" max="'+c.max+'" step="1" value="'+value+'" data-l5-field="'+name+'" aria-label="'+safe(label)+'"></label>';
 };
 const select=(name,label,items)=>'<label><strong>'+safe(label)+'</strong><select data-l5-field="'+name+'" aria-label="'+safe(label)+'">'+items.map(([v,text])=>'<option value="'+v+'"'+(state[name]===v?' selected':'')+'>'+safe(text)+'</option>').join('')+'</select></label>';
 function markup(){
  return '<section class="l5-studio" id="loliteCustomizationStudio" aria-label="Customization Studio">'+
   '<header class="l5-head"><div><small>LOLITE OS 5.0</small><h3>Customization Studio</h3>'+
   '<p>Fine-tune your desktop, then watch changes appear immediately. Saved to your Lolite profile when signed in.</p></div></header>'+
   '<div class="l5-body"><div class="l5-preview" aria-label="Live window and taskbar appearance preview" role="img">'+
   '<div class="l5-preview-window"><div class="l5-preview-bar"><span>Example window</span><i></i></div>'+
   '<div class="l5-preview-content"><b></b><span></span><span></span></div></div>'+
   '<div class="l5-preview-dock" aria-hidden="true"><i></i><i></i><i></i></div></div>'+
   '<div class="l5-controls">'+slider('windowRadius','Window corner rounding')+
   slider('panelOpacity','Window titlebar opacity')+slider('taskbarOpacity','Taskbar opacity')+
   select('density','Taskbar spacing',[['compact','Compact'],['standard','Standard'],['comfortable','Comfortable']])+
   select('motion','Window animations',[['smooth','Smooth'],['snappy','Snappy'],['off','Off']])+'</div></div>'+
   '<h4 class="l5-subsection">Wallpaper Engine 2.0</h4><div class="l5-wallpaper-options">'+
   select('wallpaperTransition','Wallpaper transitions',[['off','Instant'],['smooth','Smooth fade'],['cinematic','Cinematic fade']])+
   '</div><div class="l5-actions"><button type="button" data-l5-reset>Reset Studio settings</button>'+
   '<button type="button" data-l5-account-open>Account sync settings</button></div>'+
   '<p class="l5-status" data-l5-status role="status" aria-live="polite">Changes apply instantly. Reduce Motion always takes priority.</p></section>';
 }
 function updateEditor(){
  const section=document.getElementById('loliteCustomizationStudio');if(!section)return;
  for(const [name,value] of Object.entries(state)){
   const field=section.querySelector('[data-l5-field="'+name+'"]');
   if(field&&field.value!==String(value))field.value=String(value);
   const output=section.querySelector('[data-l5-value="'+name+'"]');
   if(output)output.textContent=String(value)+fields[name].unit;
  }
  const label=section.querySelector('[data-l5-status]');
  if(label)label.textContent='Saved to this Lolite profile. Changes appear instantly.';
 }
 document.addEventListener('input',event=>{
  const field=event.target.closest?.('#loliteCustomizationStudio [data-l5-field]');
  if(field&&fields[field.dataset.l5Field])set(field.dataset.l5Field,field.value);
 });
 document.addEventListener('change',event=>{
  const field=event.target.closest?.('#loliteCustomizationStudio [data-l5-field]');
  if(field&&fields[field.dataset.l5Field])set(field.dataset.l5Field,field.value);
 });
 document.addEventListener('click',event=>{
  if(event.target.closest?.('#loliteCustomizationStudio [data-l5-reset]'))reset();
  if(event.target.closest?.('#loliteCustomizationStudio [data-l5-account-open]'))window.LoliteCrimson?.openSettings?.('account');
 });
 window.LoliteCustomizationStudio=Object.freeze({markup,get:()=>({...state}),set,reset,restore});
 apply();
})();