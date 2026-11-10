/* Lolite OS — automatic wallpaper colour extraction and adaptive UI.
 * A small, one-shot poster sample is used; no video frame polling or network API.
 * Local preference: loliteWallpaperColorMode = on | off (default on).
 */
(()=>{'use strict';
 const KEY='loliteWallpaperColorMode';
 const root=document.documentElement;
 const names=['--wall-accent','--wall-accent-soft','--wall-button','--wall-button-hover','--wall-bg','--wall-panel','--wall-raised','--wall-titlebar','--wall-border','--wall-hover','--wall-icon-start','--wall-icon-end','--wall-icon-border','--wall-glyph-rotate'];
 let enabled=true,version=0,scheme=null;
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
 // Prefer the most visible coloured region instead of dark pixels or white text.
 function sampleHue(pixels){
  if(!pixels||pixels.length<4)return null;
  const weights=new Float64Array(24),sx=new Float64Array(24),sy=new Float64Array(24);
  for(let i=0;i<pixels.length;i+=4){
   if(pixels[i+3]<160)continue;
   const c=rgbHsl(pixels[i],pixels[i+1],pixels[i+2]);
   if(c.s<.14||c.l<.12||c.l>.92)continue;
   const weight=Math.pow(c.s,1.45)*(.25+.75*(1-Math.abs(c.l-.55))) ;
   const bin=Math.floor(c.h/15)%24,rad=c.h*Math.PI/180;
   weights[bin]+=weight;sx[bin]+=Math.cos(rad)*weight;sy[bin]+=Math.sin(rad)*weight;
  }
  let best=0;
  for(let i=1;i<24;i++)if(weights[i]>weights[best])best=i;
  if(weights[best]<.28)return null;
  let x=0,y=0,total=0;
  for(const k of [(best+23)%24,best,(best+1)%24]){
   x+=sx[k];y+=sy[k];total+=weights[k];
  }
  if(total<=0)return null;
  return {h:hue(Math.atan2(y,x)*180/Math.PI),s:.64};
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
 function seed(wall,pixels){
  const palette=wall?.palette;
  if(Array.isArray(palette)&&palette.length>=3){
   const rgb=hexColor(palette[2])||hexColor(palette[1]);
   if(rgb){const c=rgbHsl(...rgb);if(c.s>.10)return {h:hue(c.h),s:c.s};}
  }
  return sampleHue(pixels)||fallback(wall);
 }
 function derive(wall,pixels){
  const colour=seed(wall,pixels),h=hue(colour.h),s=clamp(Math.round(colour.s*100),24,78);
  // Surfaces are always dark, so foreground labels remain legible regardless
  // of bright, white, dark or high-saturation wallpapers.
  const scheme={
   hue:h,saturation:s,
   '--wall-accent':hsl(h,Math.max(44,s),68),
   '--wall-accent-soft':hsla(h,Math.max(40,s),63,.60),
   '--wall-button':hsl(h,clamp(s+2,44,74),32),
   '--wall-button-hover':hsl(h,clamp(s+4,45,78),40),
   '--wall-bg':hsl(h,23,9),
   '--wall-panel':hsla(h,28,13,.95),
   '--wall-raised':hsl(h,27,20),
   '--wall-titlebar':hsl(h,25,16),
   '--wall-border':hsla(h,60,72,.33),
   '--wall-hover':hsla(h,65,62,.17),
   '--wall-icon-start':hsl(h-12,clamp(s+9,45,78),57),
   '--wall-icon-end':hsl(h+15,clamp(s+4,42,77),35),
   '--wall-icon-border':hsla(h,72,87,.5),
   '--wall-glyph-rotate':Math.round(((h-250+540)%360)-180)+'deg'
  };
  return scheme;
 }
 function applyScheme(next){
  scheme=next;
  if(!enabled)return;
  root.dataset.wallpaperColors='on';
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
  applyScheme(derive(wall));
  if(wall.palette?.length>=3)return;
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
   label.textContent=enabled?'App icon tiles, highlights and desktop panels use the wallpaper colours.':'Original app icon colours and desktop theme are restored.';
  });
  window.dispatchEvent(new CustomEvent('lolite:wallpapercolormode',{detail:{enabled}}));
 }
 const isEnabled=()=>enabled;
 function settingsCard(){
  return '<section class="card wall-color-settings"><h3>Wallpaper colours</h3>'+
   '<div class="wall-color-row"><span class="wall-color-swatch" aria-hidden="true"></span>'+
   '<button type="button" class="wall-color-toggle" data-wall-color-toggle aria-pressed="'+String(enabled)+'">'+
    (enabled?'On · Match wallpaper':'Off · Use original theme')+'</button></div>'+
   '<p data-wall-color-description>'+(enabled?'App icon tiles, highlights and desktop panels use the wallpaper colours.':'Original app icon colours and desktop theme are restored.')+'</p>'+
   '<p>Works with still images, live wallpapers and custom uploads. Animations never constantly recolour the interface.</p></section>';
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
 });
 window.addEventListener('lolite:wallpaperchange',refresh);
 window.addEventListener('lolite:wallpaperposter',refresh);
 window.addEventListener('lolite:desktopthemechange',()=>{if(enabled&&scheme)applyScheme(scheme)});
 window.LoliteWallpaperColors=Object.freeze({isEnabled,setEnabled,refresh,derive,getScheme:()=>scheme});
 enabled=read(KEY,'on')!=='off';
 installSettings();
 const boot=()=>{
  if(enabled)refresh();
  else root.removeAttribute('data-wallpaper-colors');
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();