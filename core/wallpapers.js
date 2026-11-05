/* Lolite wallpaper collection: local artwork, one capped animation loop, persistent choices. */
(()=>{
 'use strict';
 const root=document.documentElement,read=(k,d='')=>{try{return localStorage.getItem(k)??d}catch{return d}},save=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
 const entry=(id,name,category,art=id,motion='')=>({id,name,category,src:'assets/wallpapers/'+art+(art==='crimson-dunes'?'.webp':'.svg'),motion});
 const collection=[
  entry('cosmos-orbit','Cosmic Orbit','Space'),
  entry('crimson-dunes','Crimson Dunes','Signature'),entry('crimson-fold','Fold','Signature'),entry('red-ridges','Red Ridges','Nature'),
  entry('pine-silence','Pine Silence','Nature'),entry('tidal-night','Tidal Night','Nature'),entry('lunar','Lunar','Nature'),
  entry('contour','Contour','Abstract'),entry('carbon','Carbon','Abstract'),entry('rain-city','After Hours','Signature'),
  // Existing still images remain. The 8 animated demos and 24 external MotionBGS streams have been retired.
 ];
 collection.push(...(window.LoliteWallpaperImports?.catalog||[]));
 const live=w=>!!(w.motion||w.video);
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // Previously purchased/saved wallpaper IDs continue to work.
 const legacy={'lolite-aurora':'crimson-dunes','purple-bloom':'crimson-fold','blue-pulse':'tidal-night','liquid-violet':'crimson-fold','neon-waves':'contour','midnight-mesh':'carbon','forest-mist':'pine-silence','ocean-dawn':'tidal-night','mountain-evening':'red-ridges','deep-space':'lunar','purple-nebula':'lunar','blue-galaxy':'lunar','pixel-night':'carbon','pixel-purple':'contour','arcade':'rain-city','cyber-grid':'carbon','game-over':'crimson-fold','obsidian':'carbon','dark-violet':'carbon','soft-slate':'carbon','minimal-blue':'tidal-night','vaporwave':'red-ridges','retro-sunset':'red-ridges','world-green':'pine-silence','world-snow':'pine-silence','world-desert':'crimson-dunes','animated-aurora':'contour','animated-nebula':'lunar','animated-ocean':'tidal-night','animated-matrix':'rain-city','animated-solar':'crimson-dunes','animated-galaxy':'lunar','live-embers':'crimson-dunes','live-rain':'rain-city','live-snow':'pine-silence','live-stars':'lunar','live-tide':'tidal-night','live-contour':'contour','live-meteor':'lunar','live-dust':'crimson-dunes'};
 const find=id=>collection.find(w=>w.id===(legacy[id]||id));
 let active=null,canvas=null,ctx=null,raf=0,last=0,time=0,width=1,height=1,frames=0,video=null,videoPending=false,playSerial=0,fallback=false,localUrl=null,status='Still wallpaper';
 let quality=read('loliteWallpaperQuality','hd')==='lite'?'lite':'hd';
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const paused=()=>read('loliteWallpaperPaused')==='true'||media.matches||root.classList.contains('reduce')||root.classList.contains('reduce-motion');
 const visible=()=>!document.hidden&&!root.classList.contains('browsing-mode');
 const particles=Array.from({length:90},(_,i)=>({x:((i*73.137)%100)/100,y:((i*41.719)%100)/100,z:.2+((i*17.19)%100)/125,phase:i*2.31}));
 function resize(){if(!canvas)return;width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);draw(time)}
 function draw(t){
  if(!ctx||!active?.motion)return;ctx.clearRect(0,0,width,height);const m=active.motion;
  if(m==='contour'){
   for(let j=0;j<28;j++){ctx.beginPath();for(let x=0;x<=width+16;x+=16){const y=height*.4+j*14+Math.sin(x/width*5+t*.13+j*.07)*height*.18+Math.sin(x/width*8-t*.1)*35;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=`rgba(224,105,116,${.15+j*.008})`;ctx.lineWidth=1;ctx.stroke()}return;
  }
  if(m==='tide'){
   for(let j=0;j<22;j++){ctx.beginPath();for(let x=0;x<=width+15;x+=15){const y=height*.62+j*height*.018+Math.sin(x/100+t*.18+j*.6)*3+j*.1*Math.sin(x/160-t*.3);x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=`rgba(166,205,218,${.06+j*.004})`;ctx.lineWidth=1;ctx.stroke()}return;
  }
  particles.forEach((p,i)=>{
   let x=p.x*width,y=p.y*height,r=p.z*1.6,a=.2+p.z*.45;
   if(m==='rain'){x=(x-t*21*p.z+width*100)%width;y=(y+t*170*p.z)%height;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y+16*p.z);ctx.strokeStyle=`rgba(202,207,222,${a*.42})`;ctx.lineWidth=p.z;ctx.stroke();return}
   if(m==='snow'){x+=Math.sin(t*.22+p.phase)*30;y=(y+t*18*p.z)%height;r=p.z*2}
   if(m==='embers'||m==='dust'){x=(x+Math.sin(t*.2+p.phase)*25+t*4*p.z)%width;y=(y-t*(m==='embers'?17:4)*p.z+height*100)%height;a*=.4+Math.sin(t*.6+p.phase)**2*.6}
   if(m==='stars'||m==='meteor'){y*=.62;r*=.7;a*=.6+.4*Math.sin(t*.24+p.phase)**2}
   ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=m==='embers'?`rgba(242,152,109,${a})`:m==='dust'?`rgba(223,180,159,${a*.5})`:`rgba(222,231,241,${a})`;ctx.fill();
  });
  if(m==='meteor'){const phase=t%14;if(phase<1.8){const x=width*(.55+phase*.18),y=height*(.06+phase*.17);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-75,y-48);ctx.strokeStyle=`rgba(228,217,215,${Math.sin(phase/1.8*Math.PI)*.6})`;ctx.lineWidth=1.6;ctx.stroke()}}
 }
 function loop(now){raf=0;if(!active?.motion||paused()||!visible()){last=0;return}if(!last)last=now;if(now-last>=1000/24){time+=Math.min((now-last)/1000,.1);last=now;draw(time);frames++}raf=requestAnimationFrame(loop)}
 function report(message){if(status===message)return;status=message;window.dispatchEvent(new CustomEvent('lolite:wallpaperstatus',{detail:{status,id:active?.id}}))}
 function release(){
  cancelAnimationFrame(raf);raf=0;canvas?.remove();canvas=null;ctx=null;
  const old=video;video=null;videoPending=false;playSerial++;fallback=false;
  if(old){old.pause();old.removeAttribute('src');old.load();old.remove()}
  if(localUrl){URL.revokeObjectURL(localUrl);localUrl=null}
 }
 function sync(){
  cancelAnimationFrame(raf);raf=0;last=0;
  if(active?.video&&video){
   const current=video;
   if(paused()||!visible()){playSerial++;videoPending=false;current.pause();report(paused()?'Paused · Live motion is off':'Paused while away');return}
   if(current.error){report('Video unavailable · Try again or open the source');return}
   if(!current.getAttribute('src')){
    if(active.local){report('Loading your local MP4…');return}
    current.src=quality==='lite'?active.lite:active.video;
   }
   if(videoPending||!current.paused)return;
   videoPending=true;const ticket=++playSerial;report('Loading live wallpaper…');
   Promise.resolve(current.play()).then(()=>{
    if(video!==current||ticket!==playSerial)return;
    videoPending=false;
    if(paused()||!visible()){current.pause();report('Paused')}else report(active.local?'Playing · Your local MP4':fallback?'Playing · Data saver fallback':quality==='lite'?'Playing · Data saver':'Playing · HD 1080p');
   }).catch(error=>{if(video!==current||ticket!==playSerial)return;videoPending=false;if(error?.name==='AbortError'||paused()||!visible())return;report('Playback paused · Press Try again to play')});
   return;
  }
  if(active?.motion){draw(time);if(!paused()&&visible())raf=requestAnimationFrame(loop);report(raf?'Playing · Lolite live scene':'Paused')}
 }
 function show(w,{force=false}={}){
  const el=document.getElementById('wallpaper');if(!el)return;
  if(!force&&active?.id===w.id&&active?.src===w.src){sync();return}
  release();active=w;time=0;
  el.classList.remove('wallpaper-animated','wallpaper-pixel');el.dataset.motion='';el.style.background=`#171719 url("${w.src}") center / cover no-repeat`;
  root.dataset.wallpaper=w.id;
  if(w.video){
   video=document.createElement('video');const current=video;
   current.className='lolite-live-video';current.muted=true;current.defaultMuted=true;current.loop=true;current.playsInline=true;current.preload='none';current.poster=w.src;current.setAttribute('aria-hidden','true');current.setAttribute('playsinline','');current.setAttribute('disablepictureinpicture','');
   current.addEventListener('error',()=>{
    if(video!==current)return;
    videoPending=false;
    if(w.local){current.pause();current.style.visibility='hidden';report('Unable to play this local MP4')}
    else if(!fallback&&quality==='hd'){fallback=true;current.src=w.lite;current.load();sync()}
    else{current.pause();current.style.visibility='hidden';report('Video unavailable · Try again or open the source')}
   });
   el.appendChild(current);
   if(w.local){
    report('Loading saved video…');
    window.LoliteWallpaperImports?.openUrl(w.id).then(url=>{
     if(current!==video||active!==w){if(url)URL.revokeObjectURL(url);return}
     if(!url){report('Not installed · Select the 20 MP4 files');return}
     localUrl=url;current.src=url;current.load();sync();
    }).catch(error=>{if(video===current)report('Cannot open saved MP4 · '+(error?.message||'Try importing it again'))});
   }else sync();
  }else if(w.motion){canvas=document.createElement('canvas');canvas.className='lolite-live-canvas';canvas.setAttribute('aria-hidden','true');el.appendChild(canvas);ctx=canvas.getContext('2d');resize();sync()}
  else report('Still wallpaper');
  window.dispatchEvent(new CustomEvent('lolite:wallpaperchange',{detail:{id:w.id,name:w.name,live:live(w)}}));
 }
 function apply(id,{persist=true}={}){const w=find(id);if(!w)return false;if(persist){save('wallpaperId',w.id);save('wallpaper',w.id);save('loliteWallpaperCustomActive','false')}show(w);return true}
 function restore(){const custom=read('loliteCustomWallpaper');if(custom&&read('loliteWallpaperCustomActive')==='true')show({id:'custom',name:'Your wallpaper',src:custom,motion:''});else apply(read('wallpaperId',root.dataset.desktopTheme==='cosmos'?'cosmos-orbit':'crimson-dunes'),{persist:false})||apply('cosmos-orbit',{persist:false})}
 function setCustom(data){if(!/^data:image\/(png|jpeg|webp);base64,/.test(data))return false;if(!save('loliteCustomWallpaper',data)){window.toast?.('This image is too large to save. Try a smaller image.');return false}save('loliteWallpaperCustomActive','true');show({id:'custom',name:'Your wallpaper',src:data,motion:''});return true}
 function matches(w,filter,query=''){
  return (filter==='All'||filter==='Live'&&live(w)||filter==='MotionBGS'&&w.provider==='MotionBGS'||w.category===filter)&&(!query||`${w.name} ${w.category} ${w.provider||'Lolite'}`.toLowerCase().includes(query.trim().toLowerCase()));
 }
 function cards(filter='All',query=''){
  const items=collection.filter(w=>matches(w,filter,query));
  if(!items.length)return '<p class="cr-wall-empty">No wallpapers match. Try a different name or collection.</p>';
  return items.map(w=>{
   const installed=!w.local||!!window.LoliteWallpaperImports?.isInstalled(w.id);
   const title=w.local?(installed?'Installed locally':'Not installed · Select MP4s'):w.category;
   return '<article class="cr-wall-item">'+
    '<button type="button" class="cr-wall-card" data-wall-id="'+w.id+'" aria-pressed="'+(active?.id===w.id)+'" aria-label="'+(installed?'Apply ':'Install files for ')+escape(w.name)+'">'+
    '<span class="cr-wall-image"><img src="'+w.src+'" alt="" loading="lazy" decoding="async">'+
    (w.local?'<span class="cr-live-label">'+(installed?'LOCAL VIDEO':'INSTALL MP4')+'</span>':'')+
    '<span class="cr-wall-check">✓</span></span>'+
    '<span class="cr-wall-caption"><strong>'+escape(w.name)+'</strong><small>'+escape(w.category)+' · '+escape(title)+'</small></span></button>'+
    '<span class="cr-wall-source cr-wall-local">'+(w.local?'Your uploaded collection':'Included with Lolite')+'</span></article>';
  }).join('');
 }
 function markup(filter='All',query=''){
  const cats=['All','Live','Gaming','Cars','Anime','Space','Nature','City','Signature','Abstract'];
  if(!cats.includes(filter))filter='All';
  const pack=window.LoliteWallpaperImports?.status();
  const count=pack?.installed||0;
  const selector='<section class="cr-pack-install">'+
    '<div><strong>My 20 video wallpapers</strong><p>New collection · '+count+'/20 installed on this browser. Select all 20 uploaded MP4s together to install or replace them. Files stay on your device, not in a public GitHub repository.</p>'+
    '<small data-wall-pack-status role="status">'+(pack?.loading?'Installing your videos…':count===20?'All 20 videos ready to play.':'Select MP4 files to install your collection.')+'</small></div>'+
    '<label class="cr-pack-upload">Import video wallpapers<input type="file" accept=".mp4,video/mp4" multiple data-wall-pack-upload hidden></label></section>';
  return selector+'<div class="cr-wall-browse"><label class="cr-wall-search"><span aria-hidden="true">⌕</span>'+
    '<input type="search" data-wall-search placeholder="Search '+collection.length+' wallpapers" aria-label="Search wallpapers" value="'+escape(query)+'"></label>'+
    '<label class="cr-upload">Upload image<input type="file" accept="image/png,image/jpeg,image/webp" data-wall-upload hidden></label></div>'+
    '<div class="cr-wall-toolbar"><div class="cr-filter" role="group" aria-label="Wallpaper collection">'+
    cats.map(cat=>'<button type="button" data-wall-filter="'+cat+'" aria-pressed="'+(cat===filter)+'">'+cat+
    ' <small>'+collection.filter(w=>matches(w,cat)).length+'</small></button>').join('')+
    '</div></div><div class="cr-wall-grid">'+cards(filter,query)+'</div>'+
    '<p class="cr-help">Only your selected MP4 plays. Video pauses in hidden tabs, Browsing Style or with Reduce Motion enabled. Stored videos are browser-local and may be removed if you clear site data. Static wallpapers remain available offline.</p>';
 }
 window.loliteWallpaper=apply;window.loliteWallpaperIds=[...collection.map(w=>w.id),...Object.keys(legacy)];
 window.loliteWallpaperCategory=cat=>{save('wallpaperCategory',cat);window.dispatchEvent(new Event('lolite:wallpapercategory'))};
 window.LoliteWallpapers={collection,apply,restore,markup,cards,setCustom,importFiles:files=>window.LoliteWallpaperImports.importFiles(files),getStatus:()=>status,getQuality:()=>quality,setQuality:value=>{quality=value==='lite'?'lite':'hd';save('loliteWallpaperQuality',quality);if(active?.video)show(active,{force:true})},retry:()=>{if(active?.video)show(active,{force:true})},pause:value=>{save('loliteWallpaperPaused',String(value));sync()},isPaused:paused,current:()=>active,debug:()=>({running:!!raf||!!(video&&!video.paused),frames,status,videoCount:video?1:0,canvasCount:document.querySelectorAll('.lolite-live-canvas').length}),sync};
 const previous=window.page;window.page=id=>id==='settings'?'':previous(id);
 addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',sync);addEventListener('lolite:modechange',sync);media.addEventListener?.('change',sync);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore,{once:true});else restore();
})();
