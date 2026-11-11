/* Lolite OS — live desktop icon customisation.
   Appearance is local to this browser/desktop profile and scoped to the signed-in account when available. */
(()=>{
 'use strict';
 const BASE='lolite.desktop-icons.v1.';
 const LIMITS={size:[32,88],opacity:[0,100],columns:[1,10],rows:[2,12],gap:[0,24]};
 const FALLBACK={size:58,opacity:100,columns:3,rows:6,gap:10,color:'#598cfa',tint:false,labels:true,visible:true,shape:'rounded',position:'left'};
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)));
 const validColor=value=>/^#[a-f0-9]{6}$/i.test(String(value))?value:'#598cfa';
 const hueOf=color=>{
  const rgb=[1,3,5].map(i=>parseInt(validColor(color).slice(i,i+2),16)/255);
  const hi=Math.max(...rgb),lo=Math.min(...rgb),delta=hi-lo;
  if(delta===0)return 0;
  const [r,g,b]=rgb;
  const h=hi===r?((g-b)/delta)%6:hi===g?(b-r)/delta+2:(r-g)/delta+4;
  return Math.round((h*60+360)%360);
 };
 const hueColor=value=>{
  const h=clamp(value,0,360),c=.85,x=c*(1-Math.abs((h/60)%2-1)),m=.12;
  const [r,g,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
  return '#'+[r,g,b].map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');
 };
 let account='guest',prefs=null,custom=false;
 const key=()=>BASE+account;
 const defaults=()=>({
  ...FALLBACK,
  columns:document.documentElement.dataset.desktopTheme==='cosmos'?2:5,
  size:document.documentElement.dataset.desktopTheme==='cosmos'?61:48,
  gap:document.documentElement.dataset.desktopTheme==='cosmos'?14:8
 });
 function sanitize(input){
  const value=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
  const clean={...defaults()};
  for(const name of Object.keys(LIMITS)){
   if(Number.isFinite(Number(value[name])))clean[name]=clamp(value[name],...LIMITS[name]);
  }
  clean.color=validColor(value.color??clean.color);
  clean.tint=value.tint===true;
  clean.labels=value.labels!==false;
  clean.visible=value.visible!==false;
  clean.shape=['rounded','square','circle'].includes(value.shape)?value.shape:'rounded';
  clean.position=['left','center','right'].includes(value.position)?value.position:'left';
  return clean;
 }
 function load(){
  try{const raw=localStorage.getItem(key());custom=!!raw;prefs=sanitize(raw?JSON.parse(raw):null)}
  catch(_){custom=false;prefs=defaults()}
  apply();
 }
 function save(){
  custom=true;
  try{localStorage.setItem(key(),JSON.stringify(prefs))}catch(err){console.warn('Could not save icon preferences',err)}
  apply();
 }
 function layout(){
  const width=prefs.size+26,height=prefs.size+(prefs.labels?42:14),gap=prefs.gap;
  // Do not use the grid's current left edge: right/centre alignment would shrink
  // the calculated capacity after the first slider interaction or resize.
  const viewport=Math.max(160,window.innerWidth-40);
  const capacity=Math.max(1,Math.floor((viewport+gap)/(width+gap)));
  return {width,height,columns:Math.min(prefs.columns,capacity)};
 }
 function apply(){
  const root=document.documentElement;
  root.classList.toggle('lic-applied',custom);
  if(!custom){delete root.dataset.licPosition;delete root.dataset.licIconsVisible;return;}
  root.dataset.licPosition=prefs.position;
  root.dataset.licIconsVisible=String(prefs.visible);
  const pos=layout(),vars={
   '--lic-size':prefs.size+'px','--lic-opacity':String(prefs.opacity/100),
   '--lic-color':prefs.color,'--lic-gap':prefs.gap+'px',
   '--lic-cell-width':pos.width+'px','--lic-cell-height':pos.height+'px',
   '--lic-columns':String(pos.columns),'--lic-rows':String(prefs.rows),
   '--lic-grid-width':(pos.columns*pos.width+(pos.columns-1)*prefs.gap)+'px',
   '--lic-grid-height':(prefs.rows*pos.height+(prefs.rows-1)*prefs.gap)+'px',
   '--lic-radius':prefs.shape==='square'?'5px':prefs.shape==='circle'?'50%':'16px',
   '--lic-tint-opacity':prefs.tint?'20%':'0%',
   '--lic-label-display':prefs.labels?'block':'none'
  };
  for(const [name,value] of Object.entries(vars))root.style.setProperty(name,value);
 }
 function slider(name,title,min,max,step,unit){
  const value=prefs[name];
  return '<label class="lic-control"><span><strong>'+safe(title)+'</strong><output data-lic-value="'+name+'">'+value+(unit||'')+'</output></span>'+
   '<input data-lic-field="'+name+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'"></label>';
 }
 function markup(){
  return '<section class="card lic-settings" id="lolite-icon-settings" aria-label="Desktop icon customisation">'+
    '<div class="lic-header"><div><small>DESKTOP PERSONALISATION</small><h3>Icon Customisation</h3><p>Make your desktop yours. Changes appear instantly and are saved automatically.</p></div>'+
    '<button type="button" class="soft" data-lic-reset>Reset icons</button></div>'+
    '<div class="lic-editor"><div class="lic-preview-col"><div class="lic-preview-title">LIVE DESKTOP PREVIEW <span>Actual Lolite icons</span></div>'+
    '<div class="lic-screen" role="img" aria-label="Preview of desktop icons with selected layout"><div class="lic-wall"><div class="lic-preview-grid" id="licPreviewIcons"></div><div class="lic-mini-dock"><i></i><i></i><i></i><i></i><i></i></div></div></div>'+
    '<p class="lic-preview-note" id="licLayoutInfo"></p></div>'+
    '<div class="lic-controls">'+
    '<label class="lic-icon-visibility"><span><strong>Show desktop icons</strong><small>Hide shortcuts without removing them. Turn this back on to restore your desktop.</small></span><input type="checkbox" data-lic-field="visible" '+(prefs.visible?'checked':'')+' aria-label="Show desktop icons"></label>'+
    slider('size','Icon size',32,88,2,'px')+
    slider('opacity','Icon transparency',0,100,5,'% visible')+
    slider('columns','Columns',1,10,1,'')+
    slider('rows','Visible rows',2,12,1,'')+
    slider('gap','Icon spacing',0,24,2,'px')+
    '<div class="lic-position-control"><strong>Desktop icon position</strong><div class="lic-position-choices" role="group" aria-label="Desktop icon position">'+
      ['left','center','right'].map(side=>'<button type="button" data-lic-position="'+side+'" aria-pressed="'+(prefs.position===side)+'">'+({left:'Left',center:'Centre',right:'Right'}[side])+'</button>').join('')+'</div></div>'+
    '<label class="lic-control lic-hue-control"><span><strong>Colour slider</strong><output data-lic-value="hue">'+hueOf(prefs.color)+'°</output></span><input type="range" min="0" max="359" step="1" value="'+hueOf(prefs.color)+'" data-lic-field="hue" aria-label="Icon tile hue"></label>'+
    '<div class="lic-control lic-color-line"><label for="licIconColor"><strong>Exact icon tile colour</strong></label><input type="color" id="licIconColor" data-lic-field="color" value="'+prefs.color+'"></div>'+
    '<label class="lic-check"><input type="checkbox" data-lic-field="tint" '+(prefs.tint?'checked':'')+'> Coloured icon backgrounds</label>'+
    '<label class="lic-check"><input type="checkbox" data-lic-field="labels" '+(prefs.labels?'checked':'')+'> Show app names</label>'+
    '<label class="lic-control lic-shape"><strong>Icon shape</strong><select data-lic-field="shape">'+
      ['rounded','square','circle'].map(v=>'<option value="'+v+'"'+(prefs.shape===v?' selected':'')+'>'+({rounded:'Rounded',square:'Square',circle:'Circle'}[v])+'</option>').join('')+
    '</select></label><small class="lic-save" role="status" aria-live="polite">Changes save automatically on this device.</small>'+
    '</div></div></section>';
 }
 function preview(){
  const section=document.getElementById('lolite-icon-settings');
  if(!section)return;
  const screen=section.querySelector('.lic-wall'),grid=section.querySelector('#licPreviewIcons');
  if(!screen||!grid)return;
  const real=document.getElementById('wallpaper');
  if(real&&!screen.dataset.wallpaperReady){
   const bg=getComputedStyle(real).backgroundImage;
   screen.style.backgroundImage=bg&&bg!=='none'?bg:'linear-gradient(140deg,#19335e,#16152e 65%,#121521)';
   const art=real.querySelector('img');
   const video=real.querySelector('video');
   const picture=art?.currentSrc||art?.src||video?.poster;
   if(picture)screen.style.backgroundImage='linear-gradient(0deg,#09132340,#09132340),url("'+String(picture).replace(/"/g,'%22')+'")';
   screen.dataset.wallpaperReady='true';
  }
  const sources=[...document.querySelectorAll('#icons > .desktop-icon')].slice(0,35);
  // Slider input must never rebuild 35 SVG/PNG icons dozens of times per second.
  // Rebuild only when a new Settings tab is mounted or desktop shortcuts change.
  const signature=sources.map(item=>
   (item.getAttribute('aria-label')||item.textContent||'')+'|'+
   (item.querySelector('img')?.getAttribute('src')||item.querySelector('.lolite-icon')?.className||'')
  ).join(';');
  if(grid.dataset.iconSignature!==signature||!grid.childElementCount){
   grid.replaceChildren();
   for(const item of sources){
   const tile=document.createElement('div');tile.className='lic-mini-icon';
   const graphic=item.querySelector(':scope > .lolite-icon, :scope > .app-symbol');
   if(graphic){
    const image=graphic.cloneNode(true);image.removeAttribute('id');image.classList.add('lic-mini-art');
    image.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    tile.appendChild(image);
   }else{
    const fallback=document.createElement('span');fallback.className='lic-mini-art';fallback.textContent='◈';tile.appendChild(fallback);
   }
   const label=document.createElement('span');label.className='lic-mini-label';
   label.textContent=item.getAttribute('aria-label')?.replace(/^open\s+/i,'')||item.textContent?.trim()||'App';
   tile.appendChild(label);grid.appendChild(tile);
   }
   grid.dataset.iconSignature=signature;
  }
  const cols=Math.min(prefs.columns,7),mini=Math.max(20,Math.round(prefs.size*.47));
  screen.style.setProperty('--lic-mini-cols',String(cols));
  screen.style.setProperty('--lic-mini-size',mini+'px');
  screen.style.setProperty('--lic-mini-opacity',String(prefs.opacity/100));
  screen.style.setProperty('--lic-mini-gap',Math.round(prefs.gap*.5)+'px');
  screen.style.setProperty('--lic-mini-color',prefs.color);
  screen.style.setProperty('--lic-mini-bg',prefs.tint?'20%':'0%');
  screen.style.setProperty('--lic-mini-radius',prefs.shape==='square'?'3px':prefs.shape==='circle'?'50%':'8px');
  screen.style.setProperty('--lic-mini-label',prefs.labels?'block':'none');
  screen.dataset.iconPosition=prefs.position;
  screen.dataset.iconsVisible=String(prefs.visible);
  grid.hidden=!prefs.visible;
  section.querySelectorAll('[data-lic-position]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.licPosition===prefs.position)));
  screen.style.setProperty('--lic-mini-rows',String(prefs.rows));
  screen.style.setProperty('--lic-mini-height',Math.min(prefs.rows*(mini+24+Math.round(prefs.gap*.5)),800)+'px');
  const info=section.querySelector('#licLayoutInfo');
  const available=layout().columns;
  if(info)info.textContent=!prefs.visible?'Desktop icons hidden. They remain installed and can be shown again with the switch above.':prefs.columns+' columns × '+prefs.rows+' visible rows'+(available<prefs.columns?' (desktop adapts to '+available+' columns on this screen)':'')+'. Icons positioned '+prefs.position+'. Scroll the desktop for more icons.';
  const hue=section.querySelector('[data-lic-field="hue"]');
  if(hue&&!hue.matches(':active'))hue.value=String(hueOf(prefs.color));
  const hueOutput=section.querySelector('[data-lic-value="hue"]');
  if(hueOutput)hueOutput.textContent=hueOf(prefs.color)+'°';
  for(const [name,value] of Object.entries(prefs)){
   const field=section.querySelector('[data-lic-field="'+name+'"]');
   if(field){
    if(field.type==='checkbox')field.checked=!!value;
    else if(field.value!==String(value))field.value=String(value);
   }
   const output=section.querySelector('[data-lic-value="'+name+'"]');
   if(output)output.textContent=value+(name==='size'||name==='gap'?'px':name==='opacity'?'% visible':'');
  }
 }
 function renderSettings(){
  const section=document.getElementById('lolite-icon-settings');
  if(section){section.outerHTML=markup();preview()}
 }
 function reset(){
  try{localStorage.removeItem(key())}catch(_){}
  custom=false;prefs=defaults();apply();renderSettings();
 }
 document.addEventListener('input',event=>{
  const el=event.target.closest?.('#lolite-icon-settings [data-lic-field]');
  if(!el)return;
  const field=el.dataset.licField;
  if(field==='hue'){prefs.color=hueColor(el.value);prefs.tint=true;save();preview();return}
  if(!(field in FALLBACK))return;
  if(field==='tint'||field==='labels'||field==='visible')prefs[field]=el.checked;
  else if(field==='color'){prefs.color=validColor(el.value);prefs.tint=true}
  else if(field==='shape')prefs.shape=['rounded','square','circle'].includes(el.value)?el.value:'rounded';
  else prefs[field]=clamp(el.value,...LIMITS[field]);
  save();preview();
 });
 document.addEventListener('change',event=>{
  const el=event.target.closest?.('#lolite-icon-settings [data-lic-field]');
  if(el&&['shape','tint','labels','visible'].includes(el.dataset.licField)){
   prefs[el.dataset.licField]=el.type==='checkbox'?el.checked:el.value;save();preview();
  }
 });
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('#lolite-icon-settings [data-lic-position]');
  if(button){
   const side=button.dataset.licPosition;
   if(['left','center','right'].includes(side)){prefs.position=side;save();preview();}
   return;
  }
  if(event.target.closest?.('#lolite-icon-settings [data-lic-reset]'))reset();
 });
 function currentAccount(id){
  const next=id||'guest';
  if(next===account)return;
  account=next;load();renderSettings();
 }
 function initAuth(){
  const client=window.LoliteBrowserAccounts?.getClient?.();
  if(!client?.auth)return;
  client.auth.getSession().then(({data})=>currentAccount(data?.session?.user?.id)).catch(()=>{});
  client.auth.onAuthStateChange((_event,session)=>currentAccount(session?.user?.id));
 }
 function init(){
  load();initAuth();
  window.addEventListener('resize',()=>{if(custom)apply();preview()},{passive:true});
  window.addEventListener('lolite:desktopthemechange',()=>{if(!custom){prefs=defaults();renderSettings()}else{apply();preview()}});
  window.LoliteIconCustomization={get:()=>({...prefs}),reset,apply,preview,markup};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();