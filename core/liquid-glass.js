/* Lolite OS 6.0 — shared WebGL liquid glass.
 * Refraction of the current accessible wallpaper image (poster for videos).
 * Never reads cross-origin page/game pixels; one low-power GPU context only.
 */
(()=>{'use strict';
 const root=document.documentElement,KEY='lolite.liquidGlass.v1';
 const def={quality:'balanced',bend:62,thickness:50,shine:65};
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
 function loadPrefs(){try{
  const p=JSON.parse(localStorage.getItem(KEY)||'null')||{};
  return {quality:p.quality==='high'?'high':'balanced',
   bend:clamp(p.bend??def.bend,0,100),thickness:clamp(p.thickness??def.thickness,0,100),
   shine:clamp(p.shine??def.shine,0,100)}
 }catch(_){return {...def}}}
 let prefs=loadPrefs(),desktop=null,canvas=null,gl=null,program=null,buffer=null,texture=null;
 let position=null,source='',ticket=0,ready=false,broken=false,desired=false;
 let width=0,height=0,iw=1,ih=1,scale=1,raf=0,timer=0,last=0;
 let state='off',why='Disabled',kind='image',watchers=[];
 const vert=[
  'attribute vec2 a_position;',
  'void main(){gl_Position=vec4(a_position,0.0,1.0);}'
 ].join('\n');
 const frag=[
  'precision mediump float;',
  'uniform sampler2D u_image;',
  'uniform vec2 u_size;',
  'uniform vec2 u_cover;',
  'uniform vec4 u_rect;',
  'uniform float u_radius;',
  'uniform float u_bend;',
  'uniform float u_depth;',
  'uniform float u_shine;',
  'float rounded(vec2 p,vec2 b,float r){',
  'vec2 q=abs(p)-(b-vec2(r));',
  'return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;}',
  'void main(){',
  'vec2 p=gl_FragCoord.xy-u_rect.xy-u_rect.zw*.5;',
  'vec2 b=u_rect.zw*.5;',
  'float radius=min(u_radius,min(b.x,b.y));',
  'float d=rounded(p,b,radius);',
  'float mask=1.0-smoothstep(-1.25,1.2,d);',
  'if(mask<.003)discard;',
  'vec2 corner=p-clamp(p,vec2(-1.0)*(b-vec2(radius)),b-vec2(radius));',
  'vec2 n=length(corner)>.01?normalize(corner):normalize(p/max(b,vec2(.1))+vec2(.0001));',
  'float inside=max(0.0,-d);',
  'float rim=1.0-smoothstep(0.0,max(2.0,u_depth),inside);',
  'vec2 displaced=gl_FragCoord.xy-n*u_bend*rim-p*.006;',
  'vec2 uv=(displaced/u_size-vec2(.5))*u_cover+vec2(.5);',
  'vec2 split=n*u_bend*.12/u_size*u_cover;',
  'vec3 rgb=vec3(',
  'texture2D(u_image,clamp(uv+split,vec2(.001),vec2(.999))).r,',
  'texture2D(u_image,clamp(uv,vec2(.001),vec2(.999))).g,',
  'texture2D(u_image,clamp(uv-split,vec2(.001),vec2(.999))).b);',
  'float light=max(0.0,dot(n,normalize(vec2(-.6,.8))));',
  'rgb=mix(rgb,vec3(.075,.14,.24),.17);',
  'rgb+=vec3(.8,.9,1.0)*((1.0-smoothstep(0.0,3.0,inside))*.23+rim*(.06+.18*light))*u_shine;',
  'gl_FragColor=vec4(clamp(rgb,0.0,1.0),mask*.82);',
  '}'
 ].join('\n');
 const reduced=()=>root.classList.contains('reduce')||root.classList.contains('reduce-motion')||
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 const lite=()=>root.classList.contains('lolite-lite-mode')||
  !!window.LolitePerformance?.isLite?.()||!!navigator.connection?.saveData;
 const allowed=()=>desired&&!lite()&&!document.hidden&&!root.classList.contains('browsing-mode');
 const active=()=>allowed()&&ready&&!broken&&!!gl;
 function status(){
  return {enabled:desired,active:active()&&state==='webgl',engine:state,quality:prefs.quality,
   source:kind,resolution:[width,height],
   message:!desired?'Off — original desktop appearance':
    state==='webgl'?(kind==='poster'?'GPU refraction of static live-wallpaper poster':
     'Real GPU wallpaper refraction · on-demand rendering'):why};
 }
 function setState(s,message){
  state=s;why=message;
  root.dataset.loliteRefraction=s;
  root.classList.toggle('lolite-refractive',s==='webgl');
  root.classList.toggle('webgl-glass',s==='webgl');
  if(canvas)canvas.hidden=s!=='webgl';
  document.querySelectorAll('[data-lg-status]').forEach(el=>el.textContent=status().message);
 }
 function stop(){
  if(raf){cancelAnimationFrame(raf);raf=0}
  if(timer){clearTimeout(timer);timer=0}
 }
 function cleanup(){
  stop();ticket++;ready=false;source='';
  if(gl){try{
   if(texture)gl.deleteTexture(texture);
   if(buffer)gl.deleteBuffer(buffer);
   if(program)gl.deleteProgram(program);
   gl.getExtension('WEBGL_lose_context')?.loseContext();
  }catch(_){}}
  canvas?.remove();
  canvas=null;gl=null;program=null;buffer=null;texture=null;position=null;
 }
 function shader(type,text){
  const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){
   const e=gl.getShaderInfoLog(s)||'Shader compile failed';gl.deleteShader(s);throw Error(e);
  }
  return s;
 }
 function initGpu(){
  if(gl&&program)return true;
  if(broken||!desktop)return false;
  try{
   canvas=document.createElement('canvas');
   canvas.id='loliteLiquidRefractionCanvas';
   canvas.className='lolite-liquid-refraction-canvas';
   canvas.setAttribute('aria-hidden','true');
   canvas.hidden=true;
   desktop.insertBefore(canvas,desktop.querySelector('#icons')||desktop.firstChild);
   canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();stop();gl=null;program=null;ready=false;
    setState('fallback','Graphics context lost — normal glass active');
   });
   gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,stencil:false,
    premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
   if(!gl)throw Error('WebGL unavailable');
   const v=shader(gl.VERTEX_SHADER,vert),f=shader(gl.FRAGMENT_SHADER,frag);
   program=gl.createProgram();gl.attachShader(program,v);gl.attachShader(program,f);
   gl.linkProgram(program);gl.deleteShader(v);gl.deleteShader(f);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
   buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
   position=gl.getAttribLocation(program,'a_position');
   texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
   return true;
  }catch(error){
   console.warn('Lolite Liquid Glass GPU:',error?.message||error);
   broken=true;setState('fallback','WebGL unavailable — normal glass active');
   return false;
  }
 }
 function wallpaper(){
  const w=window.LoliteWallpapers?.current?.()||null;
  let src=w?.poster||w?.src||'';
  kind=w?.video||w?.src4k||w?.src1080||w?.scene||w?.motion?'poster':'image';
  if(!src){
   const css=document.getElementById('wallpaper')?.style.backgroundImage||'';
   const match=css.match(/url\((?:"([^"]+)"|'([^']+)'|([^)]*))\)/i);
   src=match?.[1]||match?.[2]||match?.[3]||'';
  }
  if(!src||typeof src!=='string'||src.length>6000000)return '';
  if(src.startsWith('data:'))return /^data:image\/(?:png|jpeg|webp);base64,/i.test(src)?src:'';
  try{
   const u=new URL(src,document.baseURI);
   return ['https:','http:','blob:'].includes(u.protocol)?u.href:'';
  }catch(_){return ''}
 }
 function loadWallpaper(force=false){
  if(!allowed())return;
  const url=wallpaper();
  if(!url){ready=false;setState('fallback','No accessible wallpaper image');return}
  if(!force&&url===source)return;
  source=url;ready=false;const current=++ticket;
  setState('fallback','Loading a safe wallpaper texture…');
  const img=new Image();img.crossOrigin='anonymous';
  img.onload=()=>{
   if(current!==ticket||!desired)return;
   try{
    if(!initGpu())return;
    const iw0=img.naturalWidth||img.width,ih0=img.naturalHeight||img.height;
    if(!iw0||!ih0)throw Error('Invalid image dimensions');
    const resize=Math.min(1,Math.sqrt(1400000/(iw0*ih0)));
    iw=Math.max(1,Math.round(iw0*resize));ih=Math.max(1,Math.round(ih0*resize));
    const copy=document.createElement('canvas');copy.width=iw;copy.height=ih;
    const ctx=copy.getContext('2d',{alpha:false});
    if(!ctx)throw Error('Image decoding unavailable');
    ctx.drawImage(img,0,0,iw,ih);
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,copy);
    ready=true;requestDraw();
   }catch(error){
    console.warn('Lolite liquid wallpaper:',error?.message||error);
    ready=false;setState('fallback','Wallpaper texture unavailable — normal glass active');
   }
  };
  img.onerror=()=>{
   if(current!==ticket)return;
   ready=false;setState('fallback','Wallpaper image blocks CORS — normal glass active');
  };
  img.src=url;
 }
 function surfaces(){
  const dock=document.querySelector('#taskbar .win-taskbar-center');
  const cosmos=!!dock&&getComputedStyle(dock).display!=='none';
  const names=cosmos?['#taskbar .win-taskbar-center','#taskbar .tray']:['#taskbar'];
  names.push('#start','#searchPanel','#winQuickSettings','#winCalendar',
   '.win-flyout:not(.hidden)','#windows .window.is-active:not(.hidden)>.titlebar');
  return names.map(s=>document.querySelector(s)).filter(el=>{
   if(!el?.isConnected||el.hidden||el.closest?.('.hidden,[hidden]'))return false;
   const cs=getComputedStyle(el),r=el.getBoundingClientRect();
   return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>15&&r.height>14;
  }).slice(0,9);
 }
 function resize(){
  const rect=desktop.getBoundingClientRect();
  const budget=prefs.quality==='high'?1100000:600000;
  const dpr=Math.min(devicePixelRatio||1,prefs.quality==='high'?1.35:1.1);
  scale=Math.max(.2,Math.min(dpr,Math.sqrt(budget/Math.max(1,rect.width*rect.height))));
  const w=Math.max(1,Math.round(rect.width*scale)),h=Math.max(1,Math.round(rect.height*scale));
  if(w!==width||h!==height){
   width=w;height=h;canvas.width=w;canvas.height=h;
   gl.viewport(0,0,w,h);
  }
  return rect;
 }
 function paint(now){
  raf=0;last=now;
  if(!active())return;
  try{
   const desktopRect=resize();
   gl.disable(gl.SCISSOR_TEST);gl.disable(gl.BLEND);
   gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
   gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   gl.enableVertexAttribArray(position);
   gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.uniform1i(gl.getUniformLocation(program,'u_image'),0);
   gl.uniform2f(gl.getUniformLocation(program,'u_size'),width,height);
   const cover=Math.max(desktopRect.width/iw,desktopRect.height/ih);
   gl.uniform2f(gl.getUniformLocation(program,'u_cover'),desktopRect.width/(iw*cover),desktopRect.height/(ih*cover));
   gl.uniform1f(gl.getUniformLocation(program,'u_bend'),prefs.bend*.15*scale);
   gl.uniform1f(gl.getUniformLocation(program,'u_depth'),(8+prefs.thickness*.25)*scale);
   gl.uniform1f(gl.getUniformLocation(program,'u_shine'),prefs.shine/100);
   gl.enable(gl.SCISSOR_TEST);
   let count=0;
   for(const el of surfaces()){
    const r=el.getBoundingClientRect();
    const x=(r.left-desktopRect.left)*scale,y=(desktopRect.bottom-r.bottom)*scale;
    const w=r.width*scale,h=r.height*scale;
    const sx=Math.max(0,Math.floor(x)),sy=Math.max(0,Math.floor(y));
    const sw=Math.min(width-sx,Math.ceil(x+w-sx)),sh=Math.min(height-sy,Math.ceil(y+h-sy));
    if(sw<=0||sh<=0)continue;
    const radius=Math.min(23,Math.max(5,parseFloat(getComputedStyle(el).borderTopLeftRadius)||12));
    gl.scissor(sx,sy,sw,sh);
    gl.uniform4f(gl.getUniformLocation(program,'u_rect'),x,y,w,h);
    gl.uniform1f(gl.getUniformLocation(program,'u_radius'),radius*scale);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);count++;
   }
   gl.disable(gl.SCISSOR_TEST);
   setState(count?'webgl':'fallback',count?'Refracting wallpaper':'No visible panels');
  }catch(error){
   console.warn('Lolite glass draw:',error?.message||error);
   ready=false;setState('fallback','GPU rendering failed — normal glass active');
  }
 }
 function requestDraw(){
  if(!active()||raf||timer)return;
  const delay=34-(performance.now()-last);
  if(delay>1){timer=setTimeout(()=>{timer=0;requestDraw()},delay);return}
  raf=requestAnimationFrame(paint);
 }
 function refresh(force=false){
  if(!desired){setState('off','Disabled');return}
  if(!allowed()){stop();setState('fallback','Performance mode or browser visibility requires CSS glass');return}
  if(broken){setState('fallback','GPU effect is unavailable');return}
  loadWallpaper(force);requestDraw();
 }
 function setEnabled(on){
  desired=!!on;
  try{localStorage.setItem('glass',desired?'true':'false')}catch(_){}
  root.classList.toggle('glass',desired);
  root.classList.toggle('liquid-glass',desired);
  if(!desired){cleanup();setState('off','Disabled')}else refresh();
  return desired;
 }
 function setPreference(key,val){
  if(key==='quality'&&['balanced','high'].includes(val))prefs.quality=val;
  if(['bend','thickness','shine'].includes(key))prefs[key]=clamp(val,0,100);
  try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch(_){}
  requestDraw();
  document.querySelectorAll('[data-lg-value]').forEach(el=>{
   el.textContent=prefs[el.dataset.lgValue]+'%';
  });
 }
 function markup(){
  const enabled=desired?'checked':'';
  return '<section class="lolite-liquid-settings" aria-label="Liquid Glass">'+
   '<h3>Liquid Glass 6.0</h3>'+
   '<p>Real wallpaper refraction powered by one GPU canvas. Live wallpapers use a static poster; incompatible sources keep normal glass.</p>'+
   '<label class="lg-switch"><span>Enable Liquid Glass</span><input type="checkbox" data-lg-enable '+enabled+'></label>'+
   '<label>Render quality <select data-lg-quality>'+
   '<option value="balanced" '+(prefs.quality==='balanced'?'selected':'')+'>Balanced · efficient</option>'+
   '<option value="high" '+(prefs.quality==='high'?'selected':'')+'>High · sharper</option></select></label>'+
   ['bend','thickness','shine'].map(key=>
    '<label>'+({bend:'Refraction',thickness:'Edge thickness',shine:'Edge reflections'}[key])+
    ' <output data-lg-value="'+key+'">'+prefs[key]+'%</output>'+
    '<input type="range" min="0" max="100" value="'+prefs[key]+'" data-lg-range="'+key+'"></label>').join('')+
   '<p class="lg-status" role="status" data-lg-status>'+status().message+'</p>'+
   '<a href="ui-preview/" target="_blank" rel="noopener noreferrer">View Liquid Glass UI Lab</a></section>';
 }
 function start(){
  desktop=document.querySelector('#desktop');
  if(!desktop)return;
  try{desired=localStorage.getItem('glass')==='true'}catch(_){desired=root.classList.contains('glass')}
  if(desired){root.classList.add('glass');refresh()}else setState('off','Disabled');
  const observe=(node,options)=>{
   if(!node||typeof MutationObserver==='undefined')return;
   const mo=new MutationObserver(requestDraw);mo.observe(node,options);watchers.push(mo);
  };
  observe(desktop.querySelector('#windows'),{childList:true});
  for(const s of ['#start','#searchPanel','#taskbar'])observe(desktop.querySelector(s),{attributes:true,attributeFilter:['class','style']});
  if(typeof MutationObserver!=='undefined'){
   const mo=new MutationObserver(()=>{
    if(root.classList.contains('glass')!==desired)setEnabled(root.classList.contains('glass'));
    else refresh();
   });
   mo.observe(root,{attributes:true,attributeFilter:['class']});watchers.push(mo);
  }
  if(typeof ResizeObserver!=='undefined'){
   const ro=new ResizeObserver(requestDraw);ro.observe(desktop);watchers.push(ro);
  }
  document.addEventListener('pointermove',e=>{
   if(desired&&(e.buttons&1)&&e.target?.closest?.('.window,.panel,#taskbar,.win-flyout'))requestDraw();
  },{passive:true});
  document.addEventListener('pointerup',requestDraw,{passive:true});
  window.addEventListener('resize',requestDraw,{passive:true});
  window.addEventListener('lolite:wallpaperchange',()=>{source='';loadWallpaper(true)});
  window.addEventListener('lolite:panelchange',requestDraw);
  window.addEventListener('lolite:desktopthemechange',requestDraw);
  window.addEventListener('lolite:performancechange',refresh);
  document.addEventListener('visibilitychange',()=>document.hidden?(stop(),setState('fallback','Paused in background')):refresh());
  document.addEventListener('input',e=>{
   const el=e.target.closest?.('[data-lg-range]');
   if(el)setPreference(el.dataset.lgRange,el.value);
  });
  document.addEventListener('change',e=>{
   if(e.target.matches?.('[data-lg-enable]'))setEnabled(e.target.checked);
   if(e.target.matches?.('[data-lg-quality]'))setPreference('quality',e.target.value);
  });
 }
 window.LoliteLiquidGlass=Object.freeze({setEnabled,refresh,markup,status,setPreference});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();