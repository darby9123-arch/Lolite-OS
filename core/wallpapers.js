/* Lolite wallpaper collection: LivelyWallpaper.app MP4s, source previews and saved choices. */
(()=>{
 'use strict';
 const root=document.documentElement;
 const read=(key,fallback='')=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}};
 const save=(key,value)=>{try{localStorage.setItem(key,value);return true}catch{return false}};
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const catalog=window.LoliteLivelyWallpapers;
 if(!catalog?.catalog?.length)return;
 const motionBGS=Array.isArray(window.LoliteMotionBGSEmbeds?.catalog)?window.LoliteMotionBGSEmbeds.catalog:[];
 const collection=[...catalog.catalog.map(wall=>({...wall})),...motionBGS.map(wall=>({...wall}))];
 const defaultId=catalog.defaultId;
 const live=wall=>Boolean(wall?.video||wall?.src4k||wall?.motion);
 const find=id=>collection.find(wall=>wall.id===id);
 // Replace saved selections once; custom images and later admin uploads still work.
 if(read('loliteWallpaperCollection')!==catalog.version){
  save('loliteWallpaperCollection',catalog.version);
  save('wallpaperId',defaultId);save('wallpaper',defaultId);
  save('loliteWallpaperCustomActive','false');save('wallpaperCategory','All');
 }
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const paused=()=>read('loliteWallpaperPaused')==='true'||media.matches||
   root.classList.contains('reduce')||root.classList.contains('reduce-motion')||root.classList.contains('lolite-lite-mode');
 const visible=()=>!document.hidden&&!root.classList.contains('browsing-mode');
 const validQuality=new Set(['max','balanced','lite']);
 // Default to HD/one decoder for new installations; keep explicitly saved Max settings.
 const initialQuality=read('loliteWallpaperQuality','balanced');
 let quality=validQuality.has(initialQuality)?initialQuality:'balanced';
 let active=null,canvas=null,ctx=null,video=null,loopController=null,raf=0,last=0,elapsed=0;
 let width=1,height=1,scale=1,status='Still wallpaper',frames=0,playSerial=0;
 let fallbackIndex=0;
 const TRANSITION_KEY='loliteWallpaperTransitionMode';
 const transitionModes=['off','smooth','cinematic'];
 const initialTransition=read(TRANSITION_KEY,'smooth');
 let transitionMode=transitionModes.includes(initialTransition)?initialTransition:'smooth';
 let fadeLayer=null,fadeTimer=null,transitionSerial=0;
 function clearWallpaperFade(){
  transitionSerial++;if(fadeTimer){clearTimeout(fadeTimer);fadeTimer=null}
  fadeLayer?.remove();fadeLayer=null;
 }
 function transitionTo(target,newPoster){
  clearWallpaperFade();
  if(!active||transitionMode==='off'||paused()||document.hidden)return;
  const oldBackground=target.style.background;
  if(!oldBackground||oldBackground==='none')return;
  const layer=document.createElement('div');
  layer.className='l5-wallpaper-transition-layer';
  layer.setAttribute('aria-hidden','true');
  layer.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:9;opacity:1;will-change:opacity;';
  layer.style.background=oldBackground;
  const duration=transitionMode==='cinematic'?550:270;
  layer.style.transition='opacity '+duration+'ms ease';
  fadeLayer=layer;target.appendChild(layer);
  const ticket=transitionSerial;
  // Hold the old poster while the incoming image decodes, capped so a broken
  // third-party URL cannot leave the desktop covered indefinitely.
  let revealed=false,preload=null;
  const reveal=()=>{
   if(revealed||ticket!==transitionSerial||fadeLayer!==layer)return;
   revealed=true;
   clearTimeout(fadeTimer);fadeTimer=null;
   if(preload){preload.onload=null;preload.onerror=null;preload=null;}
   requestAnimationFrame(()=>{if(ticket===transitionSerial&&fadeLayer===layer)layer.style.opacity='0'});
   fadeTimer=setTimeout(()=>{if(ticket===transitionSerial)clearWallpaperFade()},duration+80);
  };
  fadeTimer=setTimeout(reveal,1500);
  if(typeof Image!=='function'||typeof newPoster!=='string'||!newPoster||/\.(?:mp4|webm)(?:[?#]|$)/i.test(newPoster)){reveal();return}
  try{
   preload=new Image();
   preload.onload=reveal;preload.onerror=reveal;preload.src=newPoster;
   if(preload.complete&&preload.naturalWidth)reveal();
  }catch{reveal()}
 }
 function setTransitionMode(value){
  if(!transitionModes.includes(value))return false;
  transitionMode=value;save(TRANSITION_KEY,value);
  if(value==='off')clearWallpaperFade();
  window.dispatchEvent(new CustomEvent('lolite:wallpapertransitionmode',{detail:{mode:value}}));
  return true;
 }
 const effects=window.LoliteInteractiveWallpapers;
 const getInteractionFlag=()=>read('loliteWallpaperInteractive','on')!=='off';
 let interactionOn=getInteractionFlag(),intensity=Math.max(.2,Math.min(1.4,Number(read('loliteWallpaperInteractionStrength','.8'))||.8));
 const pointer={targetX:.5,targetY:.5,x:.5,y:.5,strength:0,inside:false};
 const ripples=[];
 const pointerAllowed=()=>interactionOn&&!paused()&&visible()&&!!active?.scene;
 function getCursor(){
   const ease=quality==='lite'?.055:.12;
   pointer.x+=(pointer.targetX-pointer.x)*ease;
   pointer.y+=(pointer.targetY-pointer.y)*ease;
   const desired=pointerAllowed()&&pointer.inside?intensity:0;
   pointer.strength+=(desired-pointer.strength)*ease;
   return {x:pointer.x,y:pointer.y,strength:pointer.strength};
 }
 const TAU=Math.PI*2;
 const fract=n=>n-Math.floor(n);
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)||0);
 const rgba=(hex,alpha)=>{const c=rgb(hex);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+Math.max(0,Math.min(1,alpha))+')'};
 const point=(i,seed=1)=>({
  x:fract(i*.754877666+seed*.071),
  y:fract(i*.569840296+seed*.143),
  z:.25+fract(i*.438103+seed*.17)*.9,
  phase:fract(i*.3183099+seed*.11)*TAU
 });
 function line(ctx,x1,y1,x2,y2,color,thickness=1){
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.strokeStyle=color;ctx.lineWidth=thickness;ctx.stroke();
 }
 function dot(ctx,x,y,r,color){
  if(r<=0)return;
  ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=color;ctx.fill();
 }
 function glow(ctx,x,y,r,color,opacity=.4){
  if(r<=0)return;
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,rgba(color,opacity));
  g.addColorStop(.38,rgba(color,opacity*.24));
  g.addColorStop(1,rgba(color,0));
  ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
 }
 function background(ctx,w,h,p,t,scene){
  const g=ctx.createLinearGradient(0,0,w*.85,h);
  g.addColorStop(0,p[0]);g.addColorStop(.52,p[1]);g.addColorStop(1,p[0]);
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  const drift=Math.sin(t*.12)*w*.07;
  glow(ctx,w*.68+drift,h*.34,Math.max(w,h)*.59,p[2],.19);
  glow(ctx,w*.16-drift,h*.75,Math.max(w,h)*.43,p[3],.13);
  if(scene==='solar'||scene==='embers')glow(ctx,w*.5,h*.94,w*.7,p[2],.36);
 }
 function particles(ctx,w,h,t,p,scene,seed){
  const starScenes=/stars|galaxy|nebula|meteor|particles|orbit/.test(scene);
  const amount=scene==='rain'?150:scene==='snow'?125:scene==='matrix'?70:
    scene==='bokeh'?62:starScenes?160:scene==='embers'||scene==='fireflies'?95:80;
  for(let i=0;i<amount;i++){
   const n=point(i+1,seed);let x=n.x*w,y=n.y*h;
   const twinkle=.35+.65*(.5+.5*Math.sin(t*1.25+n.phase));
   if(scene==='rain'){
    y=fract(n.y+t*(.27+n.z*.21))*h;
    x=fract(n.x-.06*t*n.z)*w;
    line(ctx,x,y,x-w*.005-n.z*6,y+h*(.024+n.z*.03),rgba(p[3],.13+n.z*.22),.55+n.z);
   }else if(scene==='snow'){
    y=fract(n.y+t*(.025+n.z*.025))*h;
    x=fract(n.x+Math.sin(t*.37+n.phase)*.035)*w;
    dot(ctx,x,y,1+n.z*2.4,rgba(p[3],.3+n.z*.45));
   }else if(scene==='embers'||scene==='fireflies'){
    y=fract(n.y-t*(scene==='embers'?.04:.008)*n.z+90)*h;
    x=fract(n.x+Math.sin(t*.48+n.phase)*.02)*w;
    const a=(scene==='embers'?.42:.2)+twinkle*.36;
    dot(ctx,x,y,1+n.z*(scene==='fireflies'?2.4:2),rgba(i%3?p[2]:p[3],a));
   }else if(scene==='bokeh'){
    x=fract(n.x+t*.003*n.z)*w;
    dot(ctx,x,y,3+n.z*14,rgba(i%2?p[2]:p[3],.025+twinkle*.095));
   }else{
    y=fract(n.y+(t*.002*n.z))*h;
    const r=.5+n.z*1.2;
    dot(ctx,x,y,r,rgba(i%6?p[3]:p[2],.15+twinkle*.7));
   }
  }
 }
 function ribbons(ctx,w,h,t,p,kind){
  const waves=kind==='aurora'?7:kind==='contour'?34:kind==='liquid'?16:13;
  const step=Math.max(12,Math.round(w/130));
  for(let j=0;j<waves;j++){
   const u=j/Math.max(1,waves-1);
   ctx.beginPath();
   for(let x=0;x<=w+step;x+=step){
    const norm=x/w;
    const phase=norm*(kind==='contour'?17:8)+t*(kind==='aurora'?.43:.25)+j*.24;
    const y=(kind==='aurora'?.15:kind==='contour'?.23:.46)*h+
      j*h*(kind==='aurora'?.052:kind==='contour'?.018:.04)+
      Math.sin(phase)*h*(kind==='aurora'?.14:kind==='contour'?.115:.09)+
      Math.sin(norm*11-t*.27+j*.53)*h*.033;
    if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   }
   ctx.strokeStyle=rgba(j%3===0?p[3]:p[2],kind==='contour'?.08+u*.16:.055+u*.13);
   ctx.lineWidth=kind==='aurora'?2+u*12:kind==='contour'?1:2+u*4;
   ctx.stroke();
   if(kind==='aurora'&&j%2===0){
    const aura=ctx.createLinearGradient(0,h*.1,0,h*.75);
    aura.addColorStop(0,rgba(p[2],.02));aura.addColorStop(.35,rgba(p[2],.048));
    aura.addColorStop(1,rgba(p[2],0));
    ctx.strokeStyle=aura;ctx.lineWidth=18+u*30;ctx.stroke();
   }
  }
 }
 function bands(ctx,w,h,t,p,scene){
  const layers=scene==='liquid'?14:scene==='waves'?11:8;
  const step=Math.max(12,Math.round(w/115));
  for(let j=0;j<layers;j++){
   ctx.beginPath();
   const baseline=h*(scene==='clouds'?.5:scene==='mist'?.63:.54)+j*h*.045;
   ctx.moveTo(0,h);ctx.lineTo(0,baseline);
   for(let x=step;x<=w+step;x+=step){
    const a=x/w;
    const amp=h*(scene==='clouds'?.075:scene==='mist'?.045:.04);
    const y=baseline+Math.sin(a*9+t*.21+j*.44)*amp+
      Math.sin(a*18-t*.15+j*.29)*amp*.43;
    ctx.lineTo(x,y);
   }
   ctx.lineTo(w,h);ctx.closePath();
   ctx.fillStyle=rgba(j%3?p[1]:p[2],scene==='clouds'?.035:.045+j*.006);
   ctx.fill();
   if(scene==='waves'||scene==='liquid'){
    ctx.strokeStyle=rgba(j%2?p[3]:p[2],.05+j*.012);
    ctx.lineWidth=1.1;ctx.stroke();
   }
  }
 }
 function mountains(ctx,w,h,p){
  ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(0,h*.83);
  for(let x=0;x<=w+16;x+=16){
   const s=x/w,peak=Math.sin(s*9.4+1.6)*.075+Math.sin(s*22)*.029;
   ctx.lineTo(x,h*(.77+peak));
  }
  ctx.lineTo(w,h);ctx.closePath();ctx.fillStyle=rgba(p[0],.72);ctx.fill();
 }
 function skyline(ctx,w,h,p,city){
  ctx.fillStyle=rgba(p[0],.76);
  for(let i=0;i<57;i++){
   const s=point(i,12),x=s.x*w;
   const bw=(.008+s.z*.009)*w;
   const bh=h*(.10+.34*fract(i*.387));
   ctx.fillRect(x,h*.86-bh,bw,bh);
   if(city){
    ctx.fillStyle=rgba(i%3?p[2]:p[3],.15);
    for(let k=0;k<5;k++)ctx.fillRect(x+bw*.2,h*.86-bh+k*bh*.17,bw*.16,2);
    ctx.fillStyle=rgba(p[0],.76);
   }
  }
 }
 function grid(ctx,w,h,t,p){
  const horizon=h*.53;
  glow(ctx,w*.5,horizon,w*.32,p[2],.25);
  for(let i=-12;i<=12;i++)
   line(ctx,w*.5,horizon,w*.5+i*w*.1,h,rgba(p[2],.17),1.2);
  for(let j=0;j<18;j++){
   const r=fract(j/18+t*.07);
   const y=horizon+(h-horizon)*r*r;
   line(ctx,0,y,w,y,rgba(p[3],.07+r*.4),.8+r);
  }
  dot(ctx,w*.5,horizon-h*.14,Math.min(w,h)*.112,rgba(p[2],.17));
 }
 function matrix(ctx,w,h,t,p,seed){
  const step=Math.max(14,w/80),cols=Math.ceil(w/step);
  ctx.textAlign='center';ctx.font=Math.max(12,Math.round(step*.74))+'px monospace';
  for(let i=0;i<cols;i++){
   const n=point(i+1,seed),head=fract(n.y+t*(.042+n.z*.04))*h;
   for(let k=0;k<11;k++){
    const y=head-k*step;
    if(y<0||y>h)continue;
    ctx.fillStyle=rgba(k===0?p[3]:p[2],(1-k/12)*(k===0?.72:.23));
    ctx.fillText(fract(i*.423+k*.27+Math.floor(t*3)*.319)>.5?'1':'0',i*step,y);
   }
  }
 }
 function orbit(ctx,w,h,t,p,solar=false){
  const cx=w*.63,cy=h*.46,r=Math.min(w,h)*.17;
  glow(ctx,cx,cy,r*2.6,p[2],solar?.5:.3);
  const sphere=ctx.createRadialGradient(cx-r*.4,cy-r*.45,5,cx,cy,r);
  sphere.addColorStop(0,rgba(p[3],.92));sphere.addColorStop(.4,rgba(p[2],.8));sphere.addColorStop(1,rgba(p[1],.93));
  dot(ctx,cx,cy,r,sphere);
  if(!solar){
   ctx.save();ctx.translate(cx,cy);ctx.rotate(-.32);
   ctx.beginPath();ctx.ellipse(0,0,r*1.8,r*.47,0,0,TAU);
   ctx.lineWidth=3;ctx.strokeStyle=rgba(p[3],.55);ctx.stroke();
   ctx.restore();
   for(let j=0;j<4;j++){
    const angle=t*(.2+j*.06)+j*TAU/4;
    dot(ctx,cx+Math.cos(angle)*r*(2+j*.2),cy+Math.sin(angle)*r*(.58+j*.1),3.5,rgba(p[3],.85));
   }
  }else{
   for(let i=0;i<24;i++){
    const a=i*TAU/24+t*.025;
    const r1=r*(1.07+.025*Math.sin(t+i));
    line(ctx,cx+Math.cos(a)*r1,cy+Math.sin(a)*r1,
      cx+Math.cos(a)*r*(1.13+.3*fract(i*.73)),cy+Math.sin(a)*r*(1.13+.3*fract(i*.73)),
      rgba(p[2],.18),1.8);
   }
  }
 }
 function sceneFrame(wall,t,w,h){
  if(!ctx)return;
  const p=wall.palette||['#06111f','#203850','#76b4e1','#e8f3ff'];
  const scene=wall.scene||wall.motion||'stars';
  const cursor=getCursor();
  if(interactive(wall)){
   effects?.render(ctx,{wall,t,w,h,cursor});
   effects?.overlay(ctx,{wall,t,w,h,cursor,ripples});
   return;
  }
  background(ctx,w,h,p,t,scene);
  if(/^(stars|nebula|galaxy|meteor|particles|orbit|solar)$/.test(scene)){
   particles(ctx,w,h,t,p,scene,wall.seed||1);
   if(scene==='nebula'||scene==='galaxy'){
    ribbons(ctx,w,h,t*.35,p,'aurora');
    glow(ctx,w*.45+Math.sin(t*.11)*w*.1,h*.41,h*.36,p[2],.13);
   }
   if(scene==='orbit'||scene==='solar')orbit(ctx,w,h,t,p,scene==='solar');
   if(scene==='meteor'){
    const a=t%9.5;
    if(a<2.1){
     const x=w*(.12+a*.25),y=h*(.07+a*.16);
     line(ctx,x-120,y-86,x,y,rgba(p[3],Math.sin(a/2.1*Math.PI)*.7),2);
    }
   }
  }else if(scene==='aurora'){
   particles(ctx,w,h,t,p,'stars',wall.seed);ribbons(ctx,w,h,t,p,scene);mountains(ctx,w,h,p);
  }else if(scene==='waves'||scene==='liquid'||scene==='contour'||scene==='prism'){
   bands(ctx,w,h,t,p,scene);
   ribbons(ctx,w,h,t,p,scene==='contour'?'contour':'liquid');
   if(scene==='prism')glow(ctx,w*.25+Math.sin(t*.19)*w*.09,h*.35,h*.52,p[3],.18);
  }else if(scene==='rain'||scene==='city'){
   skyline(ctx,w,h,p,true);particles(ctx,w,h,t,p,'rain',wall.seed);
  }else if(scene==='grid'){
   grid(ctx,w,h,t,p);
  }else if(scene==='matrix'){
   matrix(ctx,w,h,t,p,wall.seed);
  }else if(scene==='mist'||scene==='clouds'){
   bands(ctx,w,h,t,p,scene);if(scene==='mist')mountains(ctx,w,h,p);
  }else if(scene==='snow'||scene==='fireflies'){
   mountains(ctx,w,h,p);particles(ctx,w,h,t,p,scene,wall.seed);
  }else if(scene==='embers'||scene==='bokeh'){
   particles(ctx,w,h,t,p,scene,wall.seed);
  }else particles(ctx,w,h,t,p,scene,wall.seed);
  effects?.overlay(ctx,{wall,t,w,h,cursor,ripples});
 }
 const maxPixels=mode=>mode==='lite'?2_100_000:mode==='balanced'?6_000_000:16_000_000;
 function resize(){
  if(!canvas||!ctx)return;
  width=Math.max(1,Math.round(innerWidth));height=Math.max(1,Math.round(innerHeight));
  const dpr=Math.max(1,Math.min(devicePixelRatio||1,quality==='lite'?1:quality==='balanced'?2:3));
  scale=Math.min(dpr,Math.sqrt(maxPixels(quality)/(width*height)));
  scale=Math.max(.5,scale);
  canvas.width=Math.max(1,Math.round(width*scale));
  canvas.height=Math.max(1,Math.round(height*scale));
  ctx.setTransform(scale,0,0,scale,0,0);
  sceneFrame(active,elapsed,width,height);
  if(active?.scene)report('Live · '+canvas.width+' × '+canvas.height+' native pixels');
 }
 function tick(now){
  raf=0;
  if(!active?.scene||paused()||!visible()){last=0;return}
  const fps=quality==='lite'?24:canvas.width*canvas.height>8_000_000?30:45;
  if(!last||now-last>=1000/fps){
   const dt=last?Math.min((now-last)/1000,.09):0;
   elapsed+=dt;last=now;
   // Ripple rings fade after 2.4s and are kept in a bounded queue.
   for(let i=ripples.length-1;i>=0;i--)if(elapsed-ripples[i].at>2.4)ripples.splice(i,1);
   sceneFrame(active,elapsed,width,height);frames++;
  }
  raf=requestAnimationFrame(tick);
 }
 function report(value){
  if(value===status)return;
  status=value;
  window.dispatchEvent(new CustomEvent('lolite:wallpaperstatus',{detail:{status,id:active?.id}}));
 }
 function release(){
  cancelAnimationFrame(raf);raf=0;last=0;
  if(canvas){canvas.remove();canvas=null;ctx=null}
  if(loopController){loopController.destroy();loopController=null}
  const old=video;video=null;playSerial++;fallbackIndex=0;
  if(old){old.pause();old.removeAttribute('src');old.load();old.remove()}
 }
 function sources(wall){
  const original=wall.src4k||wall.video;
  const ordered=quality==='lite'?[wall.preview,wall.src1080,original]
   :quality==='balanced'?[wall.src1080,original,wall.preview]:[original,wall.src1080,wall.preview];
  return ordered.filter((url,i,all)=>typeof url==='string'&&url&&all.indexOf(url)===i);
 }
 function sync(){
  cancelAnimationFrame(raf);raf=0;last=0;
  if(loopController){loopController.sync(!paused()&&visible());return}
  if(video){
   if(paused()||!visible()){
    playSerial++;video.pause();report('Paused · Live motion is off');return;
   }
   const current=video,ticket=++playSerial;
   if(!current.src){current.src=sources(active)[fallbackIndex]||'';current.load()}
   Promise.resolve(current.play()).then(()=>{
    if(video!==current||ticket!==playSerial)return;
    report('Playing · Best available video quality');
   }).catch(error=>{
    if(video===current&&ticket===playSerial&&error?.name!=='AbortError')report('Playback paused · Try again');
   });
  }else if(active?.scene&&canvas){
   sceneFrame(active,elapsed,width,height);
   if(!paused()&&visible()){
    raf=requestAnimationFrame(tick);
    report('Live · '+canvas.width+' × '+canvas.height+' native pixels');
   }else report('Paused · Live motion is off');
  }else report('Still wallpaper');
 }
 function show(wall,{force=false}={}){
  const target=document.getElementById('wallpaper');
  if(!target)return;
  if(!force&&active?.id===wall.id){sync();return}
  // The outgoing poster stays above the old renderer while new media mounts.
  // We never clone or read live video frames, so switching does not add decoders.
  const poster=wall.poster||wall.src;
  if(force)clearWallpaperFade();
  else transitionTo(target,poster);
  release();active=wall;elapsed=0;frames=0;pointer.strength=0;ripples.length=0;
  target.classList.remove('wallpaper-animated','wallpaper-pixel');
  target.dataset.motion=wall.scene||wall.motion||'';
  target.style.background='#07101e url("'+poster+'") center / cover no-repeat';
  root.dataset.wallpaper=wall.id;
  if(wall.scene||wall.motion){
   canvas=document.createElement('canvas');
   canvas.className='lolite-live-canvas';
   canvas.setAttribute('aria-hidden','true');
   canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block';
   target.appendChild(canvas);
   ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
   if(ctx){resize();sync()}else report('Live effects unavailable in this browser');
  }else if(wall.video||wall.src4k||wall.src1080){
   // Use one decoder in HD; two-decoder crossfade remains available in Max mode.
   if(wall.video&&!wall.embedded&&window.LoliteSeamlessVideo){
    loopController=window.LoliteSeamlessVideo.create({
     target,sources:sources(wall),poster,onStatus:report,dual:quality==='max'
    });
    sync();
   }else{
   const el=document.createElement('video');
   video=el;el.className='lolite-live-video';
   el.muted=true;el.defaultMuted=true;el.loop=true;el.playsInline=true;
   el.preload='auto';el.poster=poster;
   el.setAttribute('aria-hidden','true');el.setAttribute('playsinline','');
   el.setAttribute('disablepictureinpicture','');
   el.addEventListener('error',()=>{
    if(video!==el)return;
    if(fallbackIndex+1<sources(wall).length){
     fallbackIndex++;el.src=sources(wall)[fallbackIndex];el.load();sync();
    }else{
     el.pause();el.style.visibility='hidden';report('Video unavailable · Try again');
    }
   });
   target.appendChild(el);sync();
   }
  }else report('Still wallpaper');
  window.dispatchEvent(new CustomEvent('lolite:wallpaperchange',{detail:{
   id:wall.id,name:wall.name,live:live(wall)
  }}));
 }
 // Old uploaded-file probing is retired with the previous wallpaper collection.
 const discoverVideos=async()=>[];
 function apply(id,{persist=true}={}){
  const selected=find(id);if(!selected)return false;
  if(persist){
   save('wallpaperId',selected.id);save('wallpaper',selected.id);
   save('loliteWallpaperCustomActive','false');
  }
  show(selected);return true;
 }
 function restore(){
  const custom=read('loliteCustomWallpaper');
  if(custom&&read('loliteWallpaperCustomActive')==='true'){
   show({id:'custom',name:'Your wallpaper',src:custom});return;
  }
  const chosen=read('wallpaperId',defaultId);
  if(!apply(chosen,{persist:false}))apply(defaultId,{persist:!chosen.startsWith('admin-')});
 }
 function setCustom(image){
  if(typeof image!=='string'||!/^data:image\/(?:png|jpeg|webp);base64,/.test(image))return false;
  if(!save('loliteCustomWallpaper',image)){window.toast?.('Image is too large to save.');return false}
  save('loliteWallpaperCustomActive','true');
  show({id:'custom',name:'Your wallpaper',src:image});return true;
 }
 function matches(wall,filter,query=''){
  // Embedded remote videos only appear in their own category, not All or other gallery filters.
   const valid=(filter==='All'&&!wall.embedded)||(filter==='Embedded Wallpapers'&&!!wall.embedded)||
    (!wall.embedded&&filter==='Live'&&live(wall))||
   (!wall.embedded&&filter==='4K'&&wall.resolution==='4K')||
   (!wall.embedded&&filter==='Special Live Wallpapers'&&wall.provider==='Admin Library')||
   (!wall.embedded&&(wall.category===filter||wall.categories?.includes(filter)));
  const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const text=[wall.name,wall.category,wall.group,...(wall.tags||[])].join(' ').toLowerCase();
  return valid&&words.every(word=>text.includes(word));
 }
 function cards(filter='All',query='',limit=48){
  const found=collection.filter(wall=>matches(wall,filter,query));
  if(!found.length)return '<p class="cr-wall-empty">No wallpapers match. Try a different category or search.</p>';
  const count=Math.min(found.length,Math.max(48,Number(limit)||48));
  return found.slice(0,count).map(wall=>{
   const dimensions=wall.width&&wall.height?wall.width+' × '+wall.height:'Custom';
   return '<article class="cr-wall-item"><button type="button" class="cr-wall-card" data-wall-id="'+escape(wall.id)+
    '" aria-pressed="'+(active?.id===wall.id)+'" aria-label="Apply '+escape(wall.name)+'">'+
    '<span class="cr-wall-image"><img data-wall-poster-for="'+escape(wall.id)+'" src="'+escape(wall.poster||wall.src)+'" alt="" loading="lazy" decoding="async">'+
    (live(wall)?'<span class="cr-live-label">'+escape(wall.embedded?'REMOTE':(wall.resolution||'LIVE'))+'</span>':'')+
    '<span class="cr-wall-check">✓</span></span><span class="cr-wall-caption"><strong>'+
    escape(wall.name)+'</strong><small>'+escape(wall.embedded?'Embedded · '+wall.group:wall.category)+' · '+dimensions+
    '</small></span></button>'+(wall.source?'<a class="cr-wall-source" href="'+escape(wall.source)+
    '" target="_blank" rel="noopener noreferrer">'+(wall.embedded?'View on MotionBGS ↗':'Source & download ↗')+'</a>':'')+'</article>';
  }).join('')+(count<found.length?'<button type="button" class="cr-secondary cr-wall-more" data-wall-more="'+(count+48)+
   '" data-wall-more-filter="'+escape(filter)+'" data-wall-more-query="'+escape(query)+'">Show more · '+count+' of '+found.length+'</button>':'');
 }
 function markup(filter='All',query=''){
  const cats=['All','4K','Games','Anime','Cars','Nature','Space','Art & Fantasy'];
   if(motionBGS.length)cats.push('Embedded Wallpapers');
  if(collection.some(w=>w.provider==='Admin Library'))cats.push('Special Live Wallpapers');
  if(filter==='Live'||!cats.includes(filter))filter='All';
  return '<div class="cr-wall-browse"><label class="cr-wall-search"><span aria-hidden="true">⌕</span>'+
   '<input type="search" data-wall-search placeholder="Search '+collection.length+' wallpapers" aria-label="Search wallpapers" value="'+escape(query)+'"></label>'+
   '<label class="cr-upload">Custom image<input type="file" accept="image/png,image/jpeg,image/webp" data-wall-upload hidden></label></div>'+
   '<div class="cr-wall-toolbar"><div class="cr-filter" role="group" aria-label="Wallpaper collection">'+
   cats.map(cat=>'<button type="button" data-wall-filter="'+cat+'" aria-pressed="'+(cat===filter)+'">'+
   escape(cat)+' <small>'+collection.filter(w=>matches(w,cat)).length+'</small></button>').join('')+
   '</div></div><div class="cr-wall-grid">'+cards(filter,query)+'</div>'+
   '<p class="cr-help">Normal wallpapers stream from <a href="https://livelywallpaper.app/live-wallpapers/" target="_blank" rel="noopener noreferrer">LivelyWallpaper.app</a>. Embedded Wallpapers stream from <a href="https://motionbgs.com" target="_blank" rel="noopener noreferrer">MotionBGS</a> remote video links (not copied into Lolite). Playback may be blocked by MotionBGS (its HD links returned 403 in automated checks); if playback fails, a still placeholder remains visible. Motion pauses when the tab is hidden or Reduce Motion is enabled.</p>';
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-wall-more]');
  if(!button)return;
  const grid=button.closest('.cr-wall-grid');
  if(!grid)return;
  const prior=grid.querySelectorAll('[data-wall-id]').length;
  grid.innerHTML=cards(button.dataset.wallMoreFilter,button.dataset.wallMoreQuery,Number(button.dataset.wallMore));
  grid.querySelectorAll('[data-wall-id]')[prior]?.focus({preventScroll:true});
 });
 const setQuality=value=>{
  quality=validQuality.has(value)?value:value==='hd'||value==='4k'?'max':'balanced';
  save('loliteWallpaperQuality',quality);
  if(active)show(active,{force:true});
 };
 window.loliteWallpaper=apply;
 window.loliteWallpaperIds=collection.map(w=>w.id);
 window.loliteWallpaperCategory=category=>{
  save('wallpaperCategory',category);
  window.dispatchEvent(new Event('lolite:wallpapercategory'));
 };
 const posterRequests=new Map();
 function requestPoster(wall){
  if(!wall?.video||wall.provider==='LivelyWallpaper.app'||!window.LoliteWallpaperThumbnails)return;
  const url=wall.video;
  if(posterRequests.has(url)){
   const stored=posterRequests.get(url);
   if(typeof stored==='string')applyPoster(wall,stored);
   else stored?.then(data=>applyPoster(wall,data)).catch(()=>{});
   return;
  }
  const task=window.LoliteWallpaperThumbnails.fromURL(url);
  posterRequests.set(url,task);
  task.then(data=>{
   posterRequests.set(url,data);
   for(const item of collection)if(item.video===url)applyPoster(item,data);
  }).catch(()=>posterRequests.delete(url));
 }
 function applyPoster(wall,data){
  if(!data||wall.poster===data)return;
  wall.poster=data;
  document.querySelectorAll('[data-wall-poster-for]').forEach(img=>{
   if(img.dataset.wallPosterFor===wall.id)img.src=data;
  });
  if(active?.id===wall.id){
   const target=document.getElementById('wallpaper');
   if(target)target.style.background='#07101e url("'+data+'") center / cover no-repeat';
   window.dispatchEvent(new CustomEvent('lolite:wallpaperposter',{detail:{id:wall.id}}));
  }
 }
 function syncAdminWallpapers(items){
  const added=(Array.isArray(items)?items:[]).filter(item=>item.kind==='wallpaper'&&Date.parse(item.created_at)>Date.parse(catalog.replacedBefore)&&
    /^[0-9a-f-]{36}$/i.test(item.id)&&typeof item.url==='string'&&
    /^https:\/\/[^\s]+$/i.test(item.url));
  for(let i=collection.length-1;i>=0;i--)if(collection[i].provider==='Admin Library')collection.splice(i,1);
  for(const item of added){
   const videoFile=/\.(?:mp4|webm)(?:[?#]|$)/i.test(item.url);
   collection.push({
    id:'admin-'+item.id,name:String(item.title||'Community wallpaper').slice(0,90),
    category:videoFile?'Special Live Wallpapers':'Signature',provider:'Admin Library',
    src:videoFile?collection[0].poster:item.url,
    poster:videoFile?(item.poster_url||collection[0].poster):item.url,
    ...(videoFile?{video:item.url}:{})
   });
   if(videoFile&&!item.poster_url)requestPoster(collection[collection.length-1]);
  }
  window.loliteWallpaperIds=collection.map(w=>w.id);
  if(active?.provider==='Admin Library'){
   const replacement=find(active.id);
   if(!replacement)apply(defaultId);
   else if(active.src!==replacement.src||active.video!==replacement.video||active.poster!==replacement.poster)show(replacement,{force:true});
  }
  const stored=read('wallpaperId');
  if(stored.startsWith('admin-')&&find(stored))apply(stored,{persist:false});
  window.dispatchEvent(new CustomEvent('lolite:wallpapercollectionchange',
   {detail:{admin:added.length,total:collection.length}}));
 }
 window.addEventListener('lolite:library-updated',event=>syncAdminWallpapers(event.detail?.items));
 window.LoliteWallpapers={
  collection,apply,restore,markup,cards,setCustom,discoverVideos,syncAdminWallpapers,getStatus:()=>status,
  getQuality:()=>quality,setQuality,retry:()=>{if(active)show(active,{force:true})},
  getTransitionMode:()=>transitionMode,setTransitionMode,
  isInteractiveEnabled:()=>interactionOn,
  setInteractiveEnabled:value=>{interactionOn=!!value;save('loliteWallpaperInteractive',interactionOn?'on':'off');if(!interactionOn){pointer.inside=false;ripples.length=0}sync()},
  interactionStrength:()=>intensity,
  setInteractionStrength:value=>{intensity=Math.max(.2,Math.min(1.4,Number(value)||.8));save('loliteWallpaperInteractionStrength',String(intensity))},
  pause:value=>{save('loliteWallpaperPaused',String(value));sync()},
  isPaused:paused,current:()=>active,
  debug:()=>({running:!!raf||!!((loopController?.getCurrent()||video)&&!(loopController?.getCurrent()||video).paused),frames,status,
   resolution:canvas?[canvas.width,canvas.height]:null,
   videoCount:loopController?loopController.getVideoCount():video?1:0,canvasCount:document.querySelectorAll('.lolite-live-canvas').length,
   pointer:{x:pointer.x,y:pointer.y,strength:pointer.strength},ripples:ripples.length,interactive:interactionOn}),
  sync
 };
 const previous=window.page;
 window.page=id=>id==='settings'?'':previous(id);
 // Pointer events are observed on the document, not the canvas: desktop
 // shortcuts and windows remain clickable because canvas uses pointer-events:none.
 document.addEventListener('pointermove',event=>{
  if(!interactionOn||!active?.scene||!Number.isFinite(event.clientX)||!Number.isFinite(event.clientY))return;
  pointer.targetX=Math.max(0,Math.min(1,event.clientX/Math.max(1,innerWidth)));
  pointer.targetY=Math.max(0,Math.min(1,event.clientY/Math.max(1,innerHeight)));
  pointer.inside=true;
 },{passive:true});
 document.addEventListener('pointerdown',event=>{
  if(!pointerAllowed()||event.button>0||event.target?.closest?.('.window,#taskbar,.panel,button,input,a,select,textarea,[role="dialog"]'))return;
  const x=Math.max(0,Math.min(1,event.clientX/Math.max(1,innerWidth)));
  const y=Math.max(0,Math.min(1,event.clientY/Math.max(1,innerHeight)));
  if(ripples.length>=10)ripples.shift();
  ripples.push({x,y,at:elapsed,power:intensity});
 },{passive:true});
 document.addEventListener('pointerleave',()=>{pointer.inside=false},{passive:true});
 addEventListener('blur',()=>{pointer.inside=false});
 addEventListener('resize',resize,{passive:true});
 document.addEventListener('visibilitychange',sync);
 addEventListener('lolite:modechange',sync);
 media.addEventListener?.('change',sync);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
 const boot=()=>restore();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
