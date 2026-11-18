/* Lolite OS 6.0 WebGL Liquid Glass integration regression tests */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'..','core/liquid-glass.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'..','core/liquid-glass-6.css'),'utf8');
const page=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const settings=fs.readFileSync(path.join(__dirname,'..','core/crimson.js'),'utf8');
function harness({initialGlass=true,webgl=true,source='https://example.com/wall.webp',live=false,saveData=false}={}){
 const events={},elements={},queue=[],timers=[],calls=[],created=[],saved=new Map();
 if(initialGlass)saved.set('glass','true');
 const classes=new Set(initialGlass?['glass']:[]);
 const attrs={},g={
  VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,LINK_STATUS:4,
  ARRAY_BUFFER:5,STATIC_DRAW:6,TEXTURE_2D:7,TEXTURE_MIN_FILTER:8,
  TEXTURE_MAG_FILTER:9,TEXTURE_WRAP_S:10,TEXTURE_WRAP_T:11,
  LINEAR:12,CLAMP_TO_EDGE:13,UNPACK_FLIP_Y_WEBGL:14,
  RGBA:15,UNSIGNED_BYTE:16,SCISSOR_TEST:17,BLEND:18,TRIANGLE_STRIP:19,
  TEXTURE0:20,FLOAT:21,COLOR_BUFFER_BIT:22,
  createShader:()=>({}),shaderSource:(_,text)=>calls.push(['shader',text]),
  compileShader(){},getShaderParameter:()=>true,getShaderInfoLog:()=>'',deleteShader(){},
  createProgram:()=>({}),attachShader(){},linkProgram(){},deleteProgram(){},
  getProgramParameter:()=>true,getProgramInfoLog:()=>'',createBuffer:()=>({}),
  bindBuffer(){},bufferData(){},getAttribLocation:()=>0,
  createTexture:()=>({}),bindTexture(){},texParameteri(){},pixelStorei(){},
  texImage2D(){calls.push(['upload'])},enableVertexAttribArray(){},
  vertexAttribPointer(){},disable(){},enable(){},
  clearColor(){},clear(){},useProgram(){},
  activeTexture(){},getUniformLocation:(_,name)=>name,
  uniform1i(){},uniform2f(){},uniform1f(){},uniform4f(){},
  viewport(){},scissor(){calls.push(['scissor'])},
  drawArrays(){calls.push(['draw'])},
  deleteTexture(){},deleteBuffer(){},deleteProgram(){},
  getExtension:()=>({loseContext(){calls.push(['loseContext'])}})
 };
 let contexts=0,imageRequests=0;
 const rect=(left,top,width,height)=>({left,top,width,height,
  right:left+width,bottom:top+height});
 const root={dataset:attrs,classList:{
  contains:c=>classes.has(c),
  add:c=>classes.add(c),
  toggle(c,force){if(force===true)classes.add(c);else if(force===false)classes.delete(c);
   else if(classes.has(c))classes.delete(c);else classes.add(c);
   return classes.has(c)}
 }};
 const surface=(id,r,hidden=false)=>({
  id,hidden,isConnected:true,getBoundingClientRect:()=>r,closest:()=>null
 });
 const desktop={
  firstChild:null,getBoundingClientRect:()=>rect(0,0,900,600),
  querySelector:selector=>elements[selector]||null,
  insertBefore(canvas){created.push(canvas);canvas.isConnected=true},
 };
 elements['#windows']=surface('windows',rect(0,0,900,600));
 elements['#taskbar']=surface('taskbar',rect(0,540,900,60));
 elements['#start']=surface('start',rect(250,100,400,390),true);
 elements['#searchPanel']=surface('search',rect(250,120,400,280),true);
 elements['#icons']=surface('icons',rect(0,0,100,100));
 const document={
  baseURI:'https://lolite.example/',readyState:'complete',hidden:false,
  documentElement:root,
  querySelector:selector=>selector==='#desktop'?desktop:
   selector==='#taskbar .win-taskbar-center'?null:elements[selector]||null,
  getElementById:()=>({style:{backgroundImage:''}}),
  querySelectorAll:()=>[],
  createElement(tag){
   if(tag==='canvas'){
    const canvas={
     width:0,height:0,hidden:false,removed:false,
     setAttribute(){},addEventListener(name,fn){events['canvas:'+name]=fn},
     remove(){this.removed=true;this.isConnected=false},
     getContext(name){if(name==='2d')return {drawImage(){}};
      contexts++;return webgl?g:null}
    };return canvas;
   }
   return {};
  },
  addEventListener(name,fn){(events[name]??=[]).push(fn)}
 };
 const window={
  matchMedia:()=>({matches:false}),devicePixelRatio:1,
  LoliteWallpapers:{current:()=>({
   poster:source,video:live?'https://example.com/wall.mp4':undefined
  })},
  addEventListener(name,fn){(events[name]??=[]).push(fn)},
  LolitePerformance:{isLite:()=>false},
  requestAnimationFrame(fn){queue.push(fn);return queue.length},
  cancelAnimationFrame(){},
  performance:{now:()=>100},
 };
 const navigator={connection:{saveData}};
 function ImageMock(){
  this.naturalWidth=1280;this.naturalHeight=720;
  Object.defineProperty(this,'src',{set(value){
   imageRequests++;this.requestedSrc=value;
   if(value.includes('fail'))this.onerror?.();
   else this.onload?.();
  }});
 }
 let now=100;
 const ctx={
  window,document,navigator,Image:ImageMock,localStorage:{
   getItem:k=>saved.get(k)||null,
   setItem:(k,v)=>saved.set(k,String(v))
  },
  MutationObserver:class {observe(){}disconnect(){}},
  ResizeObserver:class {observe(){}disconnect(){}},
  performance:{now:()=>now},devicePixelRatio:1,
  getComputedStyle:()=>({display:'block',visibility:'visible',borderTopLeftRadius:'12px'}),
  requestAnimationFrame:fn=>{queue.push(fn);return queue.length},
  cancelAnimationFrame(){},setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length},
  clearTimeout(){},URL,console:{warn(){}},
  Math,Number,String,Array,Object,Map,Set,Float32Array,JSON
 };
 vm.runInNewContext(code,ctx,{timeout:2500});
 let api=window.LoliteLiquidGlass;
 function flush(){
  // The production renderer intentionally throttles redraws to 34ms; drive
  // pending test timers as well as requestAnimationFrame callbacks.
  now+=100;
  for(let i=0;i<10&&timers.length;i++)timers.shift().fn();
  for(let i=0;i<10&&queue.length;i++)queue.shift()(now);
 }
 function emit(type,event={}){
  for(const fn of events[type]||[])fn(event);
 }
 return {api,window,document,root,classes,saved,events,calls,created,
  flush,emit,now:n=>{now=n},setWallpaper:newSrc=>{source=newSrc},
  get contexts(){return contexts},get imageRequests(){return imageRequests}
 };
}
test('Production shader actually samples displaced current wallpaper pixels',()=>{
 assert.match(code,/texture2D\(u_image,clamp\(uv\+split/);
 assert.match(code,/gl_FragCoord\.xy-n\*u_bend\*rim/);
 assert.match(code,/texImage2D/);
 assert.match(code,/UNPACK_FLIP_Y_WEBGL/);
 assert.match(code,/crossOrigin='anonymous'/);
 assert.doesNotMatch(code,/getDisplayMedia|readPixels\(|captureStream|html2canvas/);
});
test('Only one canvas and GPU context are created for the production desktop',()=>{
 const h=harness();
 h.flush();
 assert.equal(h.contexts,1);
 assert.equal(h.created.length,1);
 assert.equal(h.api.status().engine,'webgl');
 assert.ok(h.calls.some(([name])=>name==='upload'));
 assert.ok(h.calls.some(([name])=>name==='draw'));
 assert.equal(h.created[0].hidden,false);
});
test('Glass off destroys GPU context and restores ordinary desktop appearance',()=>{
 const h=harness();h.flush();
 h.api.setEnabled(false);
 assert.equal(h.api.status().enabled,false);
 assert.equal(h.api.status().engine,'off');
 assert.equal(h.created[0].removed,true);
 assert.ok(h.calls.some(([name])=>name==='loseContext'));
 assert.equal(h.saved.get('glass'),'false');
 assert.equal(h.classes.has('lolite-refractive'),false);
});
test('WebGL and crossorigin image failures safely fall back to CSS glass',()=>{
 const unavailable=harness({webgl:false});unavailable.flush();
 assert.equal(unavailable.api.status().engine,'fallback');
 assert.equal(unavailable.root.dataset.loliteRefraction,'fallback');
 const blocked=harness({source:'https://example.com/fail.webp'});blocked.flush();
 assert.equal(blocked.api.status().engine,'fallback');
 assert.equal(blocked.contexts,0);
 assert.equal(blocked.classes.has('lolite-refractive'),false);
});
test('Live wallpaper uses its poster; settings state clearly calls this static',()=>{
 const h=harness({live:true});h.flush();
 assert.equal(h.api.status().engine,'webgl');
 assert.equal(h.api.status().source,'poster');
 assert.match(h.api.status().message,/static live-wallpaper poster/);
 assert.equal(h.contexts,1);
});
test('Wallpaper changes load a new image without spawning extra GPU contexts',()=>{
 const h=harness();h.flush();
 h.setWallpaper('https://example.com/newwall.webp');
 h.emit('lolite:wallpaperchange');h.flush();
 assert.equal(h.imageRequests,2);
 assert.equal(h.contexts,1);
 assert.equal(h.api.status().engine,'webgl');
});
test('Data Saver disables true GPU glass while retaining the Glass setting',()=>{
 const h=harness({saveData:true});h.flush();
 assert.equal(h.api.status().engine,'fallback');
 assert.equal(h.api.status().enabled,true);
 assert.equal(h.contexts,0);
});
test('Quality and refraction controls save their settings; bad values are bounded',()=>{
 const h=harness();h.flush();
 h.api.setPreference('quality','high');
 h.api.setPreference('bend',999);
 h.api.setPreference('thickness',-30);
 const saved=JSON.parse(h.saved.get('lolite.liquidGlass.v1'));
 assert.equal(saved.quality,'high');
 assert.equal(saved.bend,100);
 assert.equal(saved.thickness,0);
 assert.match(h.api.markup(),/data-lg-quality/);
 assert.match(h.api.markup(),/data-lg-enable/);
 assert.match(h.api.markup(),/data-lg-status/);
});
test('Appearance settings expose Liquid Glass and source URLs are cache-busted',()=>{
 assert.match(settings,/LoliteLiquidGlass\?\.markup/);
 assert.match(page,/core\/liquid-glass-6\.css\?v=/);
 assert.match(page,/core\/liquid-glass\.js\?v=6-0-/);
 assert.match(css,/\.lolite-liquid-refraction-canvas/);
 assert.match(css,/\.lolite-liquid-settings/);
 assert.match(css,/html\.glass\.lolite-refractive/);
});
test('No continuous per-frame animation or broad DOM subtree observer',()=>{
 assert.match(code,/requestAnimationFrame\(paint\)/);
 assert.match(code,/if\(!active\(\)\|\|raf\|\|timer\)return/);
 assert.match(code,/budget=prefs\.quality==='high'\?1100000:600000/);
 assert.doesNotMatch(code,/subtree:true|setInterval\(|active\.size>=12/);
});

test('The retired decorative glass loop cannot continuously consume animation frames',()=>{
 const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
 assert.doesNotMatch(app,/let last=0;const frame=t=>\{if\(t-last<33\)/);
 assert.match(app,/Liquid Glass 6\.0 uses event-driven GPU rendering/);
 assert.match(css,/#desktop > #wallpaper\{z-index:0!important;isolation:isolate/);
});
