/* Lolite OS wallpapers: 36 original, built-in high-resolution animated scenes.
   No third-party streams, install prompts, local video imports, or fake MP4 links.
   One scene renderer (or video if a real hosted asset is supplied), per desktop. */
(()=>{
 'use strict';
 const root=document.documentElement;
 const read=(key,fallback='')=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}};
 const save=(key,value)=>{try{localStorage.setItem(key,value);return true}catch{return false}};
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const staticWall=(id,name,category,art=id)=>Object.freeze({
   id,name,category,src:'assets/wallpapers/'+art+(art==='crimson-dunes'?'.webp':'.svg')
 });
 const collection=[
   staticWall('cosmos-orbit','Cosmic Orbit','Space'),
   staticWall('crimson-dunes','Crimson Dunes','Signature'),
   staticWall('crimson-fold','Fold','Signature'),
   staticWall('red-ridges','Red Ridges','Nature'),
   staticWall('pine-silence','Pine Silence','Nature'),
   staticWall('tidal-night','Tidal Night','Nature'),
   staticWall('lunar','Lunar','Nature'),
   staticWall('contour','Contour','Abstract'),
   staticWall('carbon','Carbon','Abstract'),
   staticWall('rain-city','After Hours','Signature')
 ];
 collection.push(...(window.LoliteLiveWallpapers?.catalog||[]));
 collection.push(...(window.LoliteInteractiveWallpapers?.catalog||[]));
 collection.push(...(window.LoliteUploadedWallpapers?.catalog||[]));
 const live=wall=>Boolean(wall?.scene||wall?.video||wall?.src4k||wall?.motion);
 const interactive=wall=>!!wall?.scene?.startsWith('interactive-');
 // Existing preferences migrate without making an unhosted MP4 look installed.
 const legacy={
  'lolite-aurora':'crimson-dunes','purple-bloom':'crimson-fold','blue-pulse':'tidal-night',
  'liquid-violet':'live-liquid-violet','neon-waves':'live-holographic-waves',
  'midnight-mesh':'carbon','forest-mist':'live-mountain-fog',
  'ocean-dawn':'tidal-night','mountain-evening':'red-ridges','deep-space':'live-deep-orbit',
  'purple-nebula':'live-nebula-violet','blue-galaxy':'live-galactic-drift',
  'pixel-night':'carbon','pixel-purple':'contour','arcade':'live-cyber-grid',
  'cyber-grid':'live-cyber-grid','game-over':'crimson-fold','obsidian':'carbon',
  'dark-violet':'carbon','soft-slate':'carbon','minimal-blue':'tidal-night',
  'vaporwave':'live-synthwave-drive','retro-sunset':'live-sunset-horizon',
  'world-green':'pine-silence','world-snow':'live-gentle-snow','world-desert':'crimson-dunes',
  'animated-aurora':'live-aurora-green','animated-nebula':'live-nebula-violet',
  'animated-ocean':'live-ocean-blue','animated-matrix':'live-digital-rain',
  'animated-solar':'live-solar-flare','animated-galaxy':'live-galactic-drift',
  'live-rain':'live-rainy-window','live-snow':'live-gentle-snow',
  'live-stars':'live-starfield','live-contour':'live-electric-cyan',
  'live-meteor':'live-meteor-shower','live-tide':'live-midnight-tide',
  'live-embers':'live-embers','live-dust':'live-cosmic-dust',
  'user-sukuna-fuga-flames':'live-embers','user-nissan-gt-r32-rocket-bunny':'live-neon-rain',
  'user-hiyuki-silent-storm':'live-aurora-violet','user-minecraft-aquarium':'live-turquoise-sea',
  'user-spider-man-2':'live-neon-rain','user-zelda-starlight-adventure':'live-forest-fireflies',
  'user-fortnite-stormy-sky':'live-sunset-horizon',
  'user-japans-majestic-peaks-and-cherry-blossoms':'live-pink-sky',
  'user-isagi-yoichi-devil-eyes':'live-liquid-violet',
  'user-where-whales-fly':'live-ocean-blue',
  'user-minecraft-dog':'live-forest-fireflies',
  'user-kakashi-hatake-naruto':'live-mountain-fog',
  'user-liquid-lines-cyan':'live-electric-cyan',
  'user-aesthetic-mountains-in-front-of-the-sky':'live-sunset-horizon',
  'user-forest-rainfall':'live-mountain-fog',
  'user-konata-on-windows-xp':'live-synthwave-drive',
  'user-audi-rs-7-sportback-under-the-rain':'live-neon-rain',
  'user-rain-drops-on-window':'live-rainy-window',
  'user-blurred-sunset-while-raining':'live-pink-sky',
  'user-motorcycle-parked':'live-city-at-night'
 };
 const find=id=>collection.find(w=>w.id===id)||collection.find(w=>w.id===legacy[id]);
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const paused=()=>read('loliteWallpaperPaused')==='true'||media.matches||
   root.classList.contains('reduce')||root.classList.contains('reduce-motion');
 const visible=()=>!document.hidden&&!root.classList.contains('browsing-mode');
 const validQuality=new Set(['max','balanced','lite']);
 const initialQuality=read('loliteWallpaperQuality','max');
 let quality=validQuality.has(initialQuality)?initialQuality:'max';
 let active=null,canvas=null,ctx=null,video=null,raf=0,last=0,elapsed=0;
 let width=1,height=1,scale=1,status='Still wallpaper',frames=0,playSerial=0;
 let fallbackIndex=0;
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
  const old=video;video=null;playSerial++;fallbackIndex=0;
  if(old){old.pause();old.removeAttribute('src');old.load();old.remove()}
 }
 function sources(wall){
  const paths=[wall.src4k,wall.src1080,wall.video].filter((x,i,a)=>typeof x==='string'&&x&&a.indexOf(x)===i);
  return quality==='lite'?[...paths].reverse():quality==='balanced'&&wall.src1080
    ?[wall.src1080,...paths.filter(x=>x!==wall.src1080)]:paths;
 }
 function sync(){
  cancelAnimationFrame(raf);raf=0;last=0;
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
  release();active=wall;elapsed=0;frames=0;pointer.strength=0;ripples.length=0;
  target.classList.remove('wallpaper-animated','wallpaper-pixel');
  target.dataset.motion=wall.scene||wall.motion||'';
  const poster=wall.poster||wall.src;
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
  }else report('Still wallpaper');
  window.dispatchEvent(new CustomEvent('lolite:wallpaperchange',{detail:{
   id:wall.id,name:wall.name,live:live(wall)
  }}));
 }
 async function discoverVideos(force=false){
   const host=window.LoliteUploadedWallpapers;
   if(!host?.discover)return [];
   const available=await host.discover(force);
   let added=0;
   for(const item of available){
     if(!collection.some(w=>w.id===item.id)){collection.push(item);added++}
   }
   if(added){
     window.loliteWallpaperIds=[...collection.map(w=>w.id),...Object.keys(legacy)];
     const stored=read('wallpaperId');
     if(stored?.startsWith('user-')&&find(stored)&&active?.id!==stored)apply(stored,{persist:false});
     window.dispatchEvent(new CustomEvent('lolite:wallpapercollectionchange',{detail:{added,total:collection.length}}));
   }
   return available;
 }
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
  const chosen=read('wallpaperId',root.dataset.desktopTheme==='cosmos'?'cosmos-orbit':'crimson-dunes');
  if(!apply(chosen,{persist:false}))apply('cosmos-orbit');
 }
 function setCustom(image){
  if(typeof image!=='string'||!/^data:image\/(?:png|jpeg|webp);base64,/.test(image))return false;
  if(!save('loliteCustomWallpaper',image)){window.toast?.('Image is too large to save.');return false}
  save('loliteWallpaperCustomActive','true');
  show({id:'custom',name:'Your wallpaper',src:image});return true;
 }
 function matches(wall,filter,query=''){
  const valid=filter==='All'||(filter==='Live'&&live(wall))||wall.category===filter;
  return valid&&(!query||[wall.name,wall.category,wall.provider||'Lolite'].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
 }
 function cards(filter='All',query=''){
  const found=collection.filter(wall=>matches(wall,filter,query));
  if(!found.length)return '<p class="cr-wall-empty">No wallpapers match. Try a different category or search.</p>';
  return found.map(wall=>{
   const isLive=live(wall);
   return '<article class="cr-wall-item"><button type="button" class="cr-wall-card" data-wall-id="'+escape(wall.id)+
    '" aria-pressed="'+(active?.id===wall.id)+'" aria-label="Apply '+escape(wall.name)+'">'+
    '<span class="cr-wall-image"><img src="'+escape(wall.poster||wall.src)+'" alt="" loading="lazy" decoding="async">'+
    (isLive?'<span class="cr-live-label">'+(wall.video?'VIDEO':'LIVE')+'</span>':'')+
    '<span class="cr-wall-check">✓</span></span><span class="cr-wall-caption"><strong>'+
    escape(wall.name)+'</strong><small>'+escape(wall.category)+(isLive?' · Animated':' · Still')+
    '</small></span></button></article>';
  }).join('');
 }
 function markup(filter='All',query=''){
  const cats=['All','Live','Interactive','Videos','Space','Nature','City','Neon','Abstract','Signature'];
  if(!cats.includes(filter))filter='All';
  return '<div class="cr-wall-browse"><label class="cr-wall-search"><span aria-hidden="true">⌕</span>'+
   '<input type="search" data-wall-search placeholder="Search '+collection.length+' wallpapers" aria-label="Search wallpapers" value="'+escape(query)+'"></label>'+
   '<label class="cr-upload">Custom image<input type="file" accept="image/png,image/jpeg,image/webp" data-wall-upload hidden></label></div>'+
   '<div class="cr-wall-toolbar"><div class="cr-filter" role="group" aria-label="Wallpaper collection">'+
   cats.map(cat=>'<button type="button" data-wall-filter="'+cat+'" aria-pressed="'+(cat===filter)+'">'+
   escape(cat)+' <small>'+collection.filter(w=>matches(w,cat)).length+'</small></button>').join('')+
   '</div></div><div class="cr-wall-grid">'+cards(filter,query)+'</div>'+
   '<p class="cr-help">Move your mouse to interact with the live scenes. Click the desktop background to create ripples. Your videos appear automatically in the Videos collection after the actual MP4 files are published to assets/wallpapers/videos/. Motion pauses when the tab is hidden or Reduce Motion is enabled.</p>';
 }
 const setQuality=value=>{
  quality=validQuality.has(value)?value:value==='hd'||value==='4k'?'max':'balanced';
  save('loliteWallpaperQuality',quality);
  if(active)show(active,{force:true});
 };
 window.loliteWallpaper=apply;
 window.loliteWallpaperIds=[...collection.map(w=>w.id),...Object.keys(legacy)];
 window.loliteWallpaperCategory=category=>{
  save('wallpaperCategory',category);
  window.dispatchEvent(new Event('lolite:wallpapercategory'));
 };
 window.LoliteWallpapers={
  collection,apply,restore,markup,cards,setCustom,discoverVideos,getStatus:()=>status,
  getQuality:()=>quality,setQuality,retry:()=>{if(active)show(active,{force:true})},
  isInteractiveEnabled:()=>interactionOn,
  setInteractiveEnabled:value=>{interactionOn=!!value;save('loliteWallpaperInteractive',interactionOn?'on':'off');if(!interactionOn){pointer.inside=false;ripples.length=0}sync()},
  interactionStrength:()=>intensity,
  setInteractionStrength:value=>{intensity=Math.max(.2,Math.min(1.4,Number(value)||.8));save('loliteWallpaperInteractionStrength',String(intensity))},
  pause:value=>{save('loliteWallpaperPaused',String(value));sync()},
  isPaused:paused,current:()=>active,
  debug:()=>({running:!!raf||!!(video&&!video.paused),frames,status,
   resolution:canvas?[canvas.width,canvas.height]:null,
   videoCount:video?1:0,canvasCount:document.querySelectorAll('.lolite-live-canvas').length,
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
 const boot=()=>{restore();void discoverVideos()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
