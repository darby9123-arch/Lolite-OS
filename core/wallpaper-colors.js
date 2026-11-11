/* Lolite OS — automatic wallpaper colour extraction and adaptive UI.
 * A small, one-shot poster sample is used; no video frame polling or network API.
 * Local preference: loliteWallpaperColorMode = on | off (default on).
 */
(()=>{'use strict';
 const KEY='loliteWallpaperColorMode';
 const INTENSITY_KEY='loliteWallpaperColorIntensity';
 const intensityLevels=['subtle','balanced','vivid'];
 const root=document.documentElement;
 const names=['--wall-accent','--wall-accent-soft','--wall-secondary','--wall-secondary-soft',
  '--wall-button','--wall-button-hover','--wall-bg','--wall-panel','--wall-panel-solid','--wall-raised',
  '--wall-titlebar','--wall-border','--wall-hover','--wall-pressed','--wall-glow',
  '--wall-text','--wall-muted','--wall-focus-ring','--wall-icon-start','--wall-icon-end',
  '--wall-icon-border','--wall-glyph-rotate','--wall-glyph-color'];
 let enabled=true,version=0,scheme=null,intensity='subtle';
 const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
 const hue=n=>((Math.round(n)%360)+360)%360;
 const hsl=(h,s,l)=>'hsl('+hue(h)+' '+Math.round(s)+'% '+Math.round(l)+'%)';
 const hsla=(h,s,l,a)=>'hsl('+hue(h)+' '+Math.round(s)+'% '+Math.round(l)+'% / '+a+')';
 const read=(key,fallback)=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}};
 const save=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
 function hexColor(value){
  const m=/^#([a-f0-9]{3}|[a-f0-9]{6})$/i.exec(String(value||''));
  if(!m)return null;
  const full=m[1].length===3?m[1].split('').map(x=>x+x).join(''):m[1];
  return [0,2,4].map(n=>parseInt(full.slice(n,n+2),16));
 }
 function rgbHsl(r,g,b){
  r/=255;g/=255;b/=255;
  const hi=Math.max(r,g,b),lo=Math.min(r,g,b),delta=hi-lo;
  let h=0,s=0,l=(hi+lo)/2;
  if(delta>0){
   s=delta/(1-Math.abs(2*l-1));
   switch(hi){case r:h=((g-b)/delta)%6;break;case g:h=(b-r)/delta+2;break;default:h=(r-g)/delta+4;}
   h=((h*60)%360+360)%360;
  }
  return {h,s:clamp(s,0,1),l};
 }
 // Find the dominant *area* of colour rather than a single bright logo/text pixel.
 // A second sufficiently large hue family gives the UI a real two-tone palette.
 function sampleHue(pixels){
  if(!pixels||pixels.length<4)return null;
  const bins=36,weight=new Float64Array(bins),xs=new Float64Array(bins),ys=new Float64Array(bins);
  let luminance=0,visible=0,colourWeight=0;
  for(let i=0;i<pixels.length;i+=4){
   const alpha=pixels[i+3]/255;
   if(alpha<.55)continue;
   const c=rgbHsl(pixels[i],pixels[i+1],pixels[i+2]);
   luminance+=c.l*alpha;visible+=alpha;
   if(c.s<.135||c.l<.09||c.l>.94)continue;
   const w=Math.pow(c.s,1.22)*(.38+.62*(1-Math.abs(c.l-.54)))*alpha;
   const bin=Math.floor(c.h/10)%bins,angle=c.h*Math.PI/180;
   weight[bin]+=w;xs[bin]+=Math.cos(angle)*w;ys[bin]+=Math.sin(angle)*w;
   colourWeight+=w;
  }
  const group=i=>{
   let mass=0,x=0,y=0;
   for(const j of [(i+bins-1)%bins,i,(i+1)%bins]){
    mass+=weight[j];x+=xs[j];y+=ys[j];
   }
   return {mass,h:hue(Math.atan2(y,x)*180/Math.PI)};
  };
  let primary=null,secondary=null;
  for(let i=0;i<bins;i++){
   if(!weight[i])continue;
   const current=group(i);
   if(!primary||current.mass>primary.mass)primary=current;
  }
  if(!primary||colourWeight<.28||primary.mass/colourWeight<.12)return null;
  for(let i=0;i<bins;i++){
   if(!weight[i])continue;
   const current=group(i);
   const gap=Math.abs(current.h-primary.h),distance=Math.min(gap,360-gap);
   if(distance<38||current.mass<primary.mass*.22)continue;
   if(!secondary||current.mass>secondary.mass)secondary=current;
  }
  return {h:primary.h,s:clamp(.38+primary.mass/(colourWeight||1)*.47,.40,.80),
   secondary:secondary?.h,brightness:visible?luminance/visible:.5};
 }
 function fallback(wall){
  const value=[wall?.id,wall?.name,wall?.category].filter(Boolean).join(' ').toLowerCase();
  if(/red|crimson|ember|flame|scarlet|rose/.test(value))return {h:354,s:.68};
  if(/pink|cherry|blossom/.test(value))return {h:325,s:.62};
  if(/sunset|sand|dune|desert|orange|solar|gold/.test(value))return {h:35,s:.61};
  if(/forest|pine|green|firefl|nature/.test(value))return {h:152,s:.52};
  if(/turquoise|ocean|sea|cyan|tide|water/.test(value))return {h:188,s:.59};
  if(/purple|violet|nebula|lunar/.test(value))return {h:270,s:.65};
  if(/silver|carbon|mono|slate/.test(value))return {h:225,s:.21};
  return {h:222,s:.58};
 }
 function paletteSeed(wall){
  const palette=wall?.palette;
  if(!Array.isArray(palette))return null;
  const shades=palette.map(hexColor).filter(Boolean).map(rgb=>rgbHsl(...rgb));
  const vivid=shades.filter(c=>c.s>.12&&c.l>.12&&c.l<.93);
  if(!vivid.length)return null;
  const primary=vivid.length>1?vivid[Math.min(1,vivid.length-1)]:vivid[0];
  const other=vivid.find(c=>{
   const d=Math.abs(c.h-primary.h);return Math.min(d,360-d)>38;
  });
  return {h:hue(primary.h),s:primary.s,secondary:other?other.h:null,
   brightness:shades.reduce((sum,c)=>sum+c.l,0)/shades.length};
 }
 function seed(wall,pixels){
  // The visible poster wins over metadata, including for wallpapers with a built-in palette.
  return sampleHue(pixels)||paletteSeed(wall)||fallback(wall);
 }
 function derive(wall,pixels){
  const colour=seed(wall,pixels),h=hue(colour.h);
  const gain=intensity==='subtle'?.54:intensity==='vivid'?1.04:.76;
  const s=clamp(Math.round(colour.s*100*gain),intensity==='subtle'?18:23,70);
  let secondary=hue(colour.secondary??(h+(h>280||h<35?32:-31)));
  const distance=Math.abs(secondary-h);
  if(Math.min(distance,360-distance)<25)secondary=hue(h+35);
  // Dark surfaces with light foreground, even if the original wallpaper is pale.
  // Vivid mode increases colour in chrome, never the contrast of text or gameplay.
  const surfaceSat=intensity==='subtle'?3:intensity==='vivid'?12:7;
  const panelSat=intensity==='subtle'?5:intensity==='vivid'?15:9;
  const scheme={
   hue:h,secondaryHue:secondary,saturation:s,intensity,
    '--wall-accent':hsl(h,Math.max(34,s),70),
    '--wall-accent-soft':hsla(h,Math.max(32,s),65,.44),
    '--wall-secondary':hsl(secondary,clamp(s-4,30,65),67),
    '--wall-secondary-soft':hsla(secondary,clamp(s-12,18,48),51,.10),
    '--wall-button':hsl(h,clamp(s+2,32,60),32),
    '--wall-button-hover':hsl(h,clamp(s+4,34,67),39),
   '--wall-bg':hsl(h,surfaceSat,8),
    '--wall-panel':hsla(h,panelSat,13,.96),
    '--wall-panel-solid':hsl(h,panelSat,13),
    '--wall-raised':hsl(h,panelSat+2,20),
   '--wall-titlebar':hsl(h,panelSat,16),
    '--wall-border':hsla(h,clamp(s+4,28,58),72,intensity==='subtle'?.18:.26),
    '--wall-hover':hsla(h,clamp(s+2,30,62),63,.12),
    '--wall-pressed':hsla(h,clamp(s+4,32,65),65,.20),
    '--wall-glow':hsla(secondary,clamp(s+1,30,65),43,intensity==='subtle'?.055:intensity==='vivid'?.15:.09),
   '--wall-text':hsl(h,14,95),
   '--wall-muted':hsl(h,15,74),
   '--wall-focus-ring':hsla(h,clamp(s+12,55,92),79,.90),
    '--wall-icon-start':hsl(h-7,clamp(Math.round(s*.52),18,44),47),
    '--wall-icon-end':hsl(h+10,clamp(Math.round(s*.48),17,42),31),
    '--wall-icon-border':hsla(h,40,83,.28),
    '--wall-glyph-rotate':'0deg',
   '--wall-glyph-color':hsl(h,clamp(s+14,40,76),42)
  };
  return scheme;
 }
 function applyScheme(next){
  scheme=next;
  if(!enabled)return;
  root.dataset.wallpaperColors='on';
  root.dataset.wallpaperIntensity=intensity;
  for(const name of names)root.style.setProperty(name,next[name]);
  root.style.setProperty('--accent',next['--wall-accent']);
  root.style.setProperty('--win-accent',next['--wall-accent']);
 }
 function sampleImage(src,done){
  if(typeof Image==='undefined'||!src){done(null);return;}
  const img=new Image();let finished=false;
  const finish=pixels=>{if(finished)return;finished=true;img.onload=null;img.onerror=null;done(pixels)};
  img.crossOrigin='anonymous';
  img.onerror=()=>finish(null);
  img.onload=()=>{
   try{
    const canvas=document.createElement('canvas');
    canvas.width=48;canvas.height=30;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)throw Error('Canvas unavailable');
    // Use the same centred cover crop as the desktop background.
    const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
    if(!w||!h)throw Error('Empty image');
    const scale=Math.max(48/w,30/h),dw=w*scale,dh=h*scale;
    ctx.drawImage(img,(48-dw)/2,(30-dh)/2,dw,dh);
    finish(ctx.getImageData(0,0,48,30).data);
   }catch{finish(null);} // Cross-origin or unsupported media -> safe preset.
  };
  try{img.src=src;}catch{finish(null)}
 }
 function refresh(){
  if(!enabled)return;
  const wall=window.LoliteWallpapers?.current?.();
  if(!wall)return;
  const token=++version;
  // Immediate, deterministic colour while any poster loads.
  applyScheme(derive(wall));
  // These palettes were sampled from the actual catalogue posters at build time.
  // The video CDN does not grant canvas CORS access.
  if(wall.provider==='LivelyWallpaper.app'&&Array.isArray(wall.palette))return;
  const source=wall.poster||wall.src;
  if(typeof source!=='string'||!source||/\.(?:mp4|webm)(?:[?#]|$)/i.test(source))return;
  sampleImage(source,pixels=>{
   if(token!==version||!enabled||window.LoliteWallpapers?.current?.()?.id!==wall.id)return;
   if(pixels)applyScheme(derive(wall,pixels));
  });
 }
 function setEnabled(value){
  enabled=Boolean(value);save(KEY,enabled?'on':'off');version++;
  if(enabled)refresh();
  else {
   root.removeAttribute('data-wallpaper-colors');
   root.removeAttribute('data-wallpaper-intensity');
   for(const name of names)root.style.removeProperty(name);
   const userAccent=read('loliteAccent','');
   if(/^#[a-f0-9]{6}$/i.test(userAccent))root.style.setProperty('--accent',userAccent);
   else root.style.removeProperty('--accent');
   root.style.removeProperty('--win-accent');
  }
  document.querySelectorAll('[data-wall-color-toggle]').forEach(button=>{
   button.setAttribute('aria-pressed',String(enabled));
   button.textContent=enabled?'On · Match wallpaper':'Off · Use original theme';
  });
  document.querySelectorAll('[data-wall-color-description]').forEach(label=>{
   label.textContent=enabled?'Windows, menus, widgets, game store and app surfaces follow your wallpaper.':'Original app colours and desktop theme are restored.';
  });
  document.querySelectorAll('[data-wall-color-intensity]').forEach(button=>{button.disabled=!enabled});
  window.dispatchEvent(new CustomEvent('lolite:wallpapercolormode',{detail:{enabled}}));
 }
 const isEnabled=()=>enabled;
 function setIntensity(value){
  if(!intensityLevels.includes(value))return false;
  intensity=value;save(INTENSITY_KEY,value);
  document.querySelectorAll('[data-wall-color-intensity]').forEach(button=>{
   button.setAttribute('aria-pressed',String(button.dataset.wallColorIntensity===value));
  });
  if(enabled)refresh();
  window.dispatchEvent(new CustomEvent('lolite:wallpapercolorintensity',{detail:{intensity:value}}));
  return true;
 }
 function settingsCard(){
  return '<section class="card wall-color-settings"><h3>Wallpaper colours</h3>'+
   '<div class="wall-color-row"><span class="wall-color-swatch" aria-hidden="true"></span>'+
   '<button type="button" class="wall-color-toggle" data-wall-color-toggle aria-pressed="'+String(enabled)+'">'+
    (enabled?'On · Match wallpaper':'Off · Use original theme')+'</button></div>'+
   '<p data-wall-color-description>'+(enabled?'Windows, menus, widgets, game store and app surfaces follow your wallpaper.':'Original app colours and desktop theme are restored.')+'</p>'+
   '<div class="wall-colour-preview" aria-hidden="true"><span></span><span></span><span></span><span></span></div>'+
   '<div class="wall-color-intensity" role="group" aria-label="Wallpaper colour intensity">'+
   intensityLevels.map(level=>'<button type="button" data-wall-color-intensity="'+level+'" aria-pressed="'+(intensity===level)+'" '+(!enabled?'disabled ':'')+'>'+level[0].toUpperCase()+level.slice(1)+'</button>').join('')+'</div>'+
   '<p>Samples still wallpapers and video posters once on change. No constant frame sampling; text stays readable.</p></section>';
 }
 function installSettings(){
  const old=window.page;
  if(typeof old!=='function')return;
  window.page=function(id){
   const result=old.apply(this,arguments);
   return id==='settings'?(String(result||'')+settingsCard()):result;
  };
 }
 document.addEventListener('click',event=>{
  if(event.target?.closest?.('[data-wall-color-toggle]'))setEnabled(!enabled);
  const choice=event.target?.closest?.('[data-wall-color-intensity]');
  if(choice&&enabled)setIntensity(choice.dataset.wallColorIntensity);
 });
 window.addEventListener('lolite:wallpaperchange',refresh);
 window.addEventListener('lolite:wallpaperposter',refresh);
 window.addEventListener('lolite:desktopthemechange',()=>{if(enabled&&scheme)applyScheme(scheme)});
 window.LoliteWallpaperColors=Object.freeze({isEnabled,setEnabled,refresh,derive,setIntensity,getIntensity:()=>intensity,getScheme:()=>scheme});
 enabled=read(KEY,'on')!=='off';
 intensity=intensityLevels.includes(read(INTENSITY_KEY,'subtle'))?read(INTENSITY_KEY,'subtle'):'subtle';
 installSettings();
 const boot=()=>{
  if(enabled)refresh();
  else {root.removeAttribute('data-wallpaper-colors');root.removeAttribute('data-wallpaper-intensity')}
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();