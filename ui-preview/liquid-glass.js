/* Lolite Liquid Glass 1.0 — actual GPU refraction of a controlled wallpaper scene.
 * One shared WebGL1 context. Refraction samples the wallpaper framebuffer texture;
 * it DOES NOT capture or read arbitrary browser DOM, cross-origin games or videos.
 */
(()=>{'use strict';
 const VERTEX=String.raw`attribute vec2 a_position;
 varying vec2 v_uv;
 void main(){v_uv=a_position*0.5+0.5;gl_Position=vec4(a_position,0.0,1.0);}`;
 const WALLPAPER=String.raw`precision mediump float;
 varying vec2 v_uv;
 uniform vec2 u_resolution;
 uniform float u_time;
 uniform float u_wallpaper;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float spot(vec2 uv,vec2 at,vec2 scale){return exp(-dot((uv-at)*scale,(uv-at)*scale));}
 void main(){
  vec2 p=v_uv;
  vec3 col;
  float glow;
  if(u_wallpaper<0.5){
   col=mix(vec3(.028,.055,.14),vec3(.09,.21,.44),p.y);
   glow=spot(p,vec2(.57,.55),vec2(2.4,3.1));
   col+=vec3(.14,.24,.38)*glow;
  }else if(u_wallpaper<1.5){
   col=mix(vec3(.07,.11,.24),vec3(.38,.29,.42),p.y);
   glow=spot(p,vec2(.66,.51),vec2(2.8,3.0));
   col+=vec3(.35,.21,.15)*glow;
  }else{
   col=mix(vec3(.018,.07,.13),vec3(.055,.10,.23),p.y);
   glow=spot(p,vec2(.53,.52),vec2(3.0,2.9));
   col+=vec3(.06,.29,.28)*glow;
  }
  float wave=sin(p.x*8.0+p.y*7.0+u_time*.22)*sin(p.x*3.5-p.y*10.0-u_time*.13);
  col+=vec3(.055,.085,.16)*wave*glow;
  vec2 orb=vec2(.7,.68);float radius=.19;
  if(u_wallpaper>1.5){orb=vec2(.72,.69);radius=.155;}
  if(u_wallpaper>.5&&u_wallpaper<1.5){orb=vec2(.69,.52);radius=.2;}
  float dist=length((p-orb)*vec2(u_resolution.x/u_resolution.y,1.0));
  float halo=exp(-pow(dist/(radius*.95),2.0));
  col+=vec3(.09,.18,.34)*halo;
  float sphere=1.0-smoothstep(radius*.78,radius*.81,dist);
  float sphereLight=max(0.0,1.0-dist/(radius*.83));
  vec3 sphereColor=u_wallpaper<.5?vec3(.31,.48,.77):
   (u_wallpaper<1.5?vec3(.77,.56,.55):vec3(.20,.53,.58));
  col=mix(col,sphereColor*(.42+sphereLight*.72),sphere*.93);
  float stars=step(.996,hash(floor(p*vec2(240.0,150.0))));
  stars*=.35+.65*hash(floor(p*vec2(240.0,150.0))+18.0);
  col+=vec3(stars*.4);
  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
 }`;
 const REFRACTION=String.raw`precision mediump float;
 varying vec2 v_uv;
 uniform sampler2D u_wall;
 uniform vec2 u_resolution;
 uniform vec4 u_rect;
 uniform float u_radius;
 uniform float u_strength;
 uniform float u_thickness;
 uniform float u_shine;
 uniform vec2 u_mouse;
 uniform float u_glass;
 float roundedDistance(vec2 p,vec2 halfSize,float radius){
  vec2 q=abs(p)-(halfSize-vec2(radius));
  return length(max(q,0.0))+min(max(q.x,q.y),0.0)-radius;
 }
 void main(){
  if(u_glass<0.5){gl_FragColor=texture2D(u_wall,v_uv);return;}
  vec2 center=u_rect.xy+u_rect.zw*.5;
  vec2 p=gl_FragCoord.xy-center;
  vec2 halfSize=u_rect.zw*.5;
  float radius=min(u_radius,min(halfSize.x,halfSize.y));
  float dist=roundedDistance(p,halfSize,radius);
  float mask=1.0-smoothstep(-1.3,1.1,dist);
  if(mask<.002)discard;
  vec2 inner=vec2(max(.01,halfSize.x-radius),max(.01,halfSize.y-radius));
  vec2 fromCorner=p-clamp(p,-inner,inner);
  vec2 normal=length(fromCorner)>.001?normalize(fromCorner):
   normalize(vec2(p.x/max(halfSize.x,.001),p.y/max(halfSize.y,.001))+.0001);
  float depth=max(0.0,-dist);
  float refractBand=1.0-smoothstep(0.0,u_thickness,depth);
  float bend=u_strength*refractBand;
  // These displaced texture lookups really sample BACKGROUND pixels.
  vec2 source=clamp((gl_FragCoord.xy-normal*bend-p*.006)/u_resolution,vec2(.002),vec2(.998));
  vec2 chroma=normal*bend*.14/u_resolution;
  vec3 sampled=vec3(texture2D(u_wall,clamp(source+chroma,0.0,1.0)).r,
   texture2D(u_wall,source).g,
   texture2D(u_wall,clamp(source-chroma,0.0,1.0)).b);
  float brightRim=(1.0-smoothstep(0.0,3.0,depth));
  float wideRim=(1.0-smoothstep(0.0,u_thickness*.75,depth));
  float highlight=max(0.0,dot(normal,normalize(vec2(-.65,.76))));
  float glint=exp(-length(gl_FragCoord.xy-u_mouse)/max(20.0,u_thickness*5.0));
  float light=(brightRim*.18+wideRim*(.12+.22*highlight)+glint*wideRim*.22)*u_shine;
  vec3 color=mix(sampled,vec3(.10,.18,.30),.12);
  color+=vec3(.73,.86,1.0)*light;
  gl_FragColor=vec4(clamp(color,0.0,1.0),mask);
 }`;
 // Paint lenses in DOM stacking order so glass does not appear through
 // panels that would normally be above it.
 const SURFACES=[
  {selector:'#liquidLens',radius:23},
  {selector:'#previewWindow',radius:12},
  {selector:'#startMenu',radius:13},
  {selector:'#quickPanel',radius:12},
  {selector:'.taskbar',radius:12}
 ];
 function create({desktop,canvas,onStatus}={}){
  if(!desktop||!canvas)return null;
  let gl=null,buffer=null,texture=null,framebuffer=null,wallProgram=null,lensProgram=null;
  let wallLocations=null,lensLocations=null;
  let frame=0,timer=0,active=false,visible=true,lastTime=0,drawCount=0,reason='Initializing';
  let width=0,height=0,resolution=1,pointer=[-10000,-10000];
  let mode='balanced',bend=60,thickness=48,shine=65,motion=false,wallpaper='aurora';
  let lowPower=false,observer=null,intersection=null;
  const reduce=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const saveData=()=>!!navigator.connection?.saveData;
  const canDraw=()=>active&&mode!=='off'&&visible&&!document.hidden;
  function status(){return {active:canDraw(),engine:active?'webgl':'fallback',mode,reason,
   frames:drawCount,resolution:[width,height],maxFps:motion&&!reduce()&&!saveData()?20:0};}
  function emit(){if(typeof onStatus==='function')onStatus(status())}
  function setFallback(why){
   active=false;reason=why||'WebGL unavailable';
   canvas.hidden=true;
   document.documentElement.dataset.liquidEngine='fallback';
   emit();
  }
  function shader(type,source){
   const obj=gl.createShader(type);gl.shaderSource(obj,source);gl.compileShader(obj);
   if(!gl.getShaderParameter(obj,gl.COMPILE_STATUS)){
    const message=gl.getShaderInfoLog(obj)||'Shader compilation failed';
    gl.deleteShader(obj);throw Error(message);
   }
   return obj;
  }
  function program(vertex,fragment){
   const v=shader(gl.VERTEX_SHADER,vertex),f=shader(gl.FRAGMENT_SHADER,fragment);
   const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);
   gl.deleteShader(v);gl.deleteShader(f);
   if(!gl.getProgramParameter(p,gl.LINK_STATUS)){
    const message=gl.getProgramInfoLog(p)||'Program linking failed';
    gl.deleteProgram(p);throw Error(message);
   }
   return p;
  }
  function init(){
   try{
    if(!canvas.getContext||!window.requestAnimationFrame){setFallback('WebGL not supported');return false}
    gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,
     preserveDrawingBuffer:false,powerPreference:'low-power'})||
     canvas.getContext('experimental-webgl',{alpha:false,antialias:false,depth:false,
      stencil:false,preserveDrawingBuffer:false});
    if(!gl){setFallback('WebGL unavailable — using frosted glass');return false}
    buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    wallProgram=program(VERTEX,WALLPAPER);
    lensProgram=program(VERTEX,REFRACTION);
    wallLocations={resolution:gl.getUniformLocation(wallProgram,'u_resolution'),
     time:gl.getUniformLocation(wallProgram,'u_time'),
     wallpaper:gl.getUniformLocation(wallProgram,'u_wallpaper')};
    lensLocations={wall:gl.getUniformLocation(lensProgram,'u_wall'),
     resolution:gl.getUniformLocation(lensProgram,'u_resolution'),
     rect:gl.getUniformLocation(lensProgram,'u_rect'),
     radius:gl.getUniformLocation(lensProgram,'u_radius'),
     strength:gl.getUniformLocation(lensProgram,'u_strength'),
     thickness:gl.getUniformLocation(lensProgram,'u_thickness'),
     shine:gl.getUniformLocation(lensProgram,'u_shine'),
     mouse:gl.getUniformLocation(lensProgram,'u_mouse'),
     glass:gl.getUniformLocation(lensProgram,'u_glass')};
    texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    framebuffer=gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    active=true;reason='Shared WebGL refractor · real texture displacement';
    return true;
   }catch(error){
    console.warn('Lolite UI Lab liquid glass:',error?.message||error);
    setFallback('GPU shader unavailable — frosted fallback');
    return false;
   }
  }
  function bind(p){
   gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   const a=gl.getAttribLocation(p,'a_position');
   gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  }
  function resize(){
   const r=desktop.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);
   lowPower=saveData()||(navigator.deviceMemory!==undefined&&navigator.deviceMemory<4);
   const maxPixels=mode==='high'&&!lowPower?1250000:lowPower?450000:750000;
   const dpr=Math.min(window.devicePixelRatio||1,mode==='high'&&!lowPower?1.5:lowPower?1:1.2);
   resolution=Math.max(.4,Math.min(dpr,Math.sqrt(maxPixels/(w*h))));
   const nextW=Math.max(1,Math.round(w*resolution));
   const nextH=Math.max(1,Math.round(h*resolution));
   if(width===nextW&&height===nextH)return;
   width=nextW;height=nextH;
   canvas.width=width;canvas.height=height;
   gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
   gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
   const complete=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);
   if(!complete)throw Error('Wallpaper texture could not be allocated');
   gl.viewport(0,0,width,height);
  }
  function uniforms(){
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.uniform1i(lensLocations.wall,0);
   gl.uniform2f(lensLocations.resolution,width,height);
  }
  function lens(el,rounding,desktopRect){
   if(!el||el.hidden||!el.getBoundingClientRect)return;
   const cs=window.getComputedStyle?.(el);
   if(cs?.display==='none'||cs?.visibility==='hidden')return;
   const r=el.getBoundingClientRect();
   const x=(r.left-desktopRect.left)*resolution;
   const y=(desktopRect.bottom-r.bottom)*resolution;
   const w=r.width*resolution,h=r.height*resolution;
   if(w<12||h<12||x>=width||y>=height||x+w<=0||y+h<=0)return;
   const sx=Math.max(0,Math.floor(x)),sy=Math.max(0,Math.floor(y));
   const sw=Math.min(width-sx,Math.ceil(w+x-sx)),sh=Math.min(height-sy,Math.ceil(h+y-sy));
   if(sw<=0||sh<=0)return;
   gl.scissor(sx,sy,sw,sh);
   gl.uniform4f(lensLocations.rect,x,y,w,h);
   gl.uniform1f(lensLocations.radius,Math.max(4,rounding*resolution));
   gl.uniform1f(lensLocations.glass,1);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  function animate(){return canDraw()&&motion&&!reduce()&&!saveData()}
  function nextFrame(){
   if(timer||frame||!animate())return;
   timer=window.setTimeout(()=>{timer=0;requestDraw()},50); // capped at 20fps
  }
  function requestDraw(){
   if(frame||!canDraw())return;
   frame=window.requestAnimationFrame(draw);
  }
  function draw(now){
   frame=0;
   if(!canDraw())return;
   try{
    resize();
    // Make the canvas compositable before its first draw; otherwise a browser
    // can discard an offscreen drawing buffer before the element is revealed.
    const firstFrame=document.documentElement.dataset.liquidEngine!=='webgl';
    if(firstFrame){canvas.hidden=false;document.documentElement.dataset.liquidEngine='webgl'}
    const desktopRect=desktop.getBoundingClientRect();
    const t=motion&&!reduce()&&!saveData()?now*.001:0;
    gl.disable(gl.SCISSOR_TEST);gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
    gl.viewport(0,0,width,height);
    bind(wallProgram);
    gl.uniform2f(wallLocations.resolution,width,height);
    gl.uniform1f(wallLocations.time,t);
    gl.uniform1f(wallLocations.wallpaper,wallpaper==='horizon'?1:wallpaper==='night'?2:0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    bind(lensProgram);uniforms();
    gl.uniform1f(lensLocations.glass,0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    gl.uniform1f(lensLocations.strength,bend*.16*resolution);
    gl.uniform1f(lensLocations.thickness,(7+thickness*.27)*resolution);
    gl.uniform1f(lensLocations.shine,shine/100);
    gl.uniform2f(lensLocations.mouse,pointer[0]*resolution,pointer[1]*resolution);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.SCISSOR_TEST);
    for(const item of SURFACES)lens(desktop.querySelector(item.selector),item.radius,desktopRect);
    gl.disable(gl.SCISSOR_TEST);gl.disable(gl.BLEND);
    drawCount++;
    if(firstFrame)emit();
   }catch(error){
    console.warn('Lolite liquid refraction rendering stopped:',error?.message||error);
    setFallback('WebGL framebuffer unavailable — frosted fallback');
    return;
   }
   nextFrame();
  }
  function stopTimers(){
   if(frame){window.cancelAnimationFrame(frame);frame=0}
   if(timer){window.clearTimeout(timer);timer=0}
  }
  function update(options={}){
   if(['off','balanced','high'].includes(options.mode))mode=options.mode;
   if(Number.isFinite(options.bend))bend=Math.min(100,Math.max(0,options.bend));
   if(Number.isFinite(options.thickness))thickness=Math.min(100,Math.max(0,options.thickness));
   if(Number.isFinite(options.shine))shine=Math.min(100,Math.max(0,options.shine));
   if(typeof options.motion==='boolean')motion=options.motion;
   if(['aurora','horizon','night'].includes(options.wallpaper))wallpaper=options.wallpaper;
   stopTimers();
   if(mode==='off'){
    canvas.hidden=true;document.documentElement.dataset.liquidEngine='off';emit();return;
   }
   if(!gl&&!init())return;
   if(!active){setFallback(reason);return}
   requestDraw();
  }
  function onPointer(event){
   if(!active||mode==='off')return;
   const rect=desktop.getBoundingClientRect();
   if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)return;
   pointer=[event.clientX-rect.left,rect.bottom-event.clientY];
   if(!motion||reduce())requestDraw();
  }
  function onVisibility(){if(document.hidden){stopTimers()}else requestDraw()}
  function destroy(){
   stopTimers();observer?.disconnect();intersection?.disconnect();
   desktop.removeEventListener('pointermove',onPointer);
   document.removeEventListener('visibilitychange',onVisibility);
   window.removeEventListener('resize',requestDraw);
   if(gl){try{
    gl.deleteFramebuffer(framebuffer);gl.deleteTexture(texture);gl.deleteBuffer(buffer);
    gl.deleteProgram(wallProgram);gl.deleteProgram(lensProgram);
   }catch(_){}}
   canvas.hidden=true;active=false;
   document.documentElement.dataset.liquidEngine='off';
  }
  canvas.addEventListener('webglcontextlost',event=>{
   event.preventDefault();stopTimers();active=false;gl=null;setFallback('Graphics context lost');
  });
  canvas.addEventListener('webglcontextrestored',()=>{
   gl=null;if(mode!=='off'&&init())requestDraw();
  });
  desktop.addEventListener('pointermove',onPointer,{passive:true});
  document.addEventListener('visibilitychange',onVisibility);
  window.addEventListener('resize',requestDraw,{passive:true});
  if(typeof ResizeObserver!=='undefined'){
   observer=new ResizeObserver(requestDraw);observer.observe(desktop);
  }
  if(typeof IntersectionObserver!=='undefined'){
   intersection=new IntersectionObserver(entries=>{
    visible=!!entries[0]?.isIntersecting;
    if(!visible)stopTimers();else requestDraw();
   },{threshold:0});intersection.observe(desktop);
  }
  update();
  return Object.freeze({update,requestDraw,status,destroy});
 }
 window.LoliteLiquidGlassRenderer=Object.freeze({create});
})();