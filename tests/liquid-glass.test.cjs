const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'..','ui-preview/liquid-glass.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'..','ui-preview/styles.css'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'..','ui-preview/index.html'),'utf8');
function harness({webgl=true,memory=8,saveData=false}={}){
 let contexts=0,nextRaf=1,fullscreen=false;
 const shaders=[],calls=[],frames=[],timers=[],listeners={};
 const gl={
  VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,LINK_STATUS:4,
  ARRAY_BUFFER:5,STATIC_DRAW:6,FRAMEBUFFER:7,COLOR_ATTACHMENT0:8,
  TEXTURE_2D:9,TEXTURE_MIN_FILTER:10,TEXTURE_MAG_FILTER:11,TEXTURE_WRAP_S:12,
  TEXTURE_WRAP_T:13,CLAMP_TO_EDGE:14,LINEAR:15,RGBA:16,UNSIGNED_BYTE:17,
  FRAMEBUFFER_COMPLETE:18,FLOAT:19,TRIANGLE_STRIP:20,
  SCISSOR_TEST:21,BLEND:22,SRC_ALPHA:23,ONE_MINUS_SRC_ALPHA:24,TEXTURE0:25,
  createShader:()=>({}),shaderSource(s,src){shaders.push(src)},
  compileShader(){},getShaderParameter:()=>true,getShaderInfoLog:()=>'',deleteShader(){},
  createProgram:()=>({}),attachShader(){},linkProgram(){},getProgramParameter:()=>true,
  getProgramInfoLog:()=>'',deleteProgram(){},createBuffer:()=>({}),
  bindBuffer(){},bufferData(){},getAttribLocation:()=>0,
  enableVertexAttribArray(){},vertexAttribPointer(){},
  createTexture:()=>({}),bindTexture(){},texParameteri(){},texImage2D(...p){calls.push(['texture',p[3],p[4]])},
  createFramebuffer:()=>({}),bindFramebuffer(){},framebufferTexture2D(){},
  checkFramebufferStatus:()=>18,viewport(){},getUniformLocation:(_,name)=>name,
  useProgram(){},uniform2f(){},uniform1f(){},uniform4f(){},uniform1i(){},
  disable(){},enable(){},activeTexture(){},blendFunc(){},
  clearColor(){},clear(){},drawArrays(){calls.push(['draw'])},
  scissor(x,y,w,h){calls.push(['scissor',x,y,w,h])},
  deleteFramebuffer(){},deleteTexture(){},deleteBuffer(){}
 };
 const box=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height});
 const elements={
  '#liquidLens':{hidden:false,getBoundingClientRect:()=>box(390,80,206,92)},
  '#previewWindow':{hidden:true,getBoundingClientRect:()=>box(160,100,600,400)},
  '#startMenu':{hidden:true,getBoundingClientRect:()=>box(300,120,400,380)},
  '#quickPanel':{hidden:true,getBoundingClientRect:()=>box(700,250,290,300)},
  '.taskbar':{hidden:false,getBoundingClientRect:()=>box(12,590,975,47)}
 };
 const desktop={geometry:box(0,0,1000,650),clientWidth:1000,clientHeight:650,
  getBoundingClientRect(){return this.geometry},
  querySelector(sel){return elements[sel]||null},
  addEventListener(name,fn){listeners['desktop:'+name]=fn},
  removeEventListener(){}
 };
 const canvas={width:0,height:0,hidden:true,
  getContext(){contexts++;return webgl?gl:null},
  addEventListener(name,fn){listeners['canvas:'+name]=fn}};
 const document={hidden:false,documentElement:{dataset:{}},
  addEventListener(name,fn){listeners['document:'+name]=fn},
  removeEventListener(){}};
 const window={
  devicePixelRatio:2,matchMedia:()=>({matches:false}),
  requestAnimationFrame(fn){frames.push(fn);return nextRaf++},
  cancelAnimationFrame(){},
  setTimeout(fn,delay){timers.push({fn,delay});return timers.length},
  clearTimeout(){},getComputedStyle:()=>({display:'block',visibility:'visible'}),
  addEventListener(name,fn){listeners['window:'+name]=fn},
  removeEventListener(){}
 };
 const navigator={deviceMemory:memory,connection:{saveData}};
 const ctx={window,document,navigator,ResizeObserver:undefined,IntersectionObserver:undefined,
  console:{warn(){}},Math,Number,String,Array,Map,Set,Float32Array,Promise};
 vm.runInNewContext(code,ctx,{timeout:2000});
 const api=window.LoliteLiquidGlassRenderer.create({desktop,canvas});
 function flush(now=1000){let attempts=0;while(frames.length&&attempts++<10)frames.shift()(now)}
 return {api,gl,calls,shaders,frames,timers,document,canvas,desktop,elements,listeners,
  flush,get contextCount(){return contexts}};
}
test('WebGL shaders genuinely displace wallpaper framebuffer pixels, not merely draw shine',()=>{
 assert.match(code,/const REFRACTION=/);
 assert.match(code,/framebufferTexture2D/);
 assert.match(code,/texture2D\(u_wall,source\)/);
 assert.match(code,/gl_FragCoord\.xy-normal\*bend/);
 assert.match(code,/gl\.scissor/);
 assert.match(code,/gl\.blendFunc/);
 assert.doesNotMatch(code,/getDisplayMedia|readPixels\(|drawImage\(|getUserMedia/);
});
test('Only ONE WebGL context draws the wallpaper, background and visible glass elements',()=>{
 const h=harness();
 h.flush();
 assert.equal(h.contextCount,1);
 assert.equal(h.document.documentElement.dataset.liquidEngine,'webgl');
 assert.equal(h.api.status().engine,'webgl');
 assert.ok(h.calls.filter(c=>c[0]==='draw').length>=4);
 assert.ok(h.calls.some(c=>c[0]==='scissor'));
});
test('Balanced preset caps GPU surface pixels and leaves idle animation disabled',()=>{
 const h=harness();
 h.flush();
 const [w,height]=h.api.status().resolution;
 assert.ok(w*height<=750000+1500,'GPU canvas exceeds balanced pixel budget');
 assert.equal(h.api.status().maxFps,0);
 assert.equal(h.timers.length,0);
 assert.equal(h.frames.length,0);
 h.api.update({mode:'high'});
 h.flush();
 const [hw,hh]=h.api.status().resolution;
 assert.ok(hw*hh<=1250000+1500);
 assert.ok(hw>=w);
});
test('Motion, if explicitly enabled, is capped at 20 FPS and pauses when hidden',()=>{
 const h=harness();
 h.flush();
 h.api.update({motion:true});h.flush();
 assert.equal(h.api.status().maxFps,20);
 assert.ok(h.timers.length>0);
 assert.ok(h.timers.every(t=>t.delay>=50));
 h.document.hidden=true;
 h.listeners['document:visibilitychange']();
 assert.equal(h.api.status().active,false);
});
test('Eco caps are automatically used on low-memory devices and save-data browsers',()=>{
 for(const config of [{memory:2},{saveData:true}]){
  const h=harness(config);h.flush();
  const [w,height]=h.api.status().resolution;
  assert.ok(w*height<=450000+1500);
 }
});
test('Off disables GPU painting, and WebGL errors fall back to CSS without crashing',()=>{
 const h=harness();h.flush();
 h.api.update({mode:'off'});
 assert.equal(h.api.status().active,false);
 assert.equal(h.document.documentElement.dataset.liquidEngine,'off');
 const fallback=harness({webgl:false});
 fallback.flush();
 assert.equal(fallback.api.status().engine,'fallback');
 assert.equal(fallback.document.documentElement.dataset.liquidEngine,'fallback');
 assert.equal(fallback.canvas.hidden,true);
});
test('Refraction follows moving visible panels and releases rendering on context loss',()=>{
 const h=harness();h.flush();
 const previous=h.calls.filter(c=>c[0]==='scissor').map(c=>c[1]);
 h.elements['#liquidLens'].getBoundingClientRect=()=>({left:50,top:140,width:206,height:92,right:256,bottom:232});
 h.api.requestDraw();h.flush(1300);
 const current=h.calls.filter(c=>c[0]==='scissor').map(c=>c[1]);
 assert.ok(current.length>previous.length);
 assert.ok(current.some((x,i)=>x!==previous[i]));
 let prevented=false;h.listeners['canvas:webglcontextlost']({preventDefault(){prevented=true}});
 assert.equal(prevented,true);
 assert.equal(h.document.documentElement.dataset.liquidEngine,'fallback');
});
test('UI preview exposes visible quality and strength controls plus a draggable lens',()=>{
 assert.match(html,/id="liquidGlassCanvas"/);
 assert.match(html,/id="liquidLens"/);
 assert.match(html,/src="\.\/liquid-glass\.js\?v=/);
 for(const prop of ['liquidBend','liquidThickness','liquidShine','liquidMotion','liquidEngineStatus'])
  assert.ok(html.includes('id="'+prop+'"'),prop+' missing');
 assert.match(html,/data-liquid-mode="balanced"/);
 assert.match(css,/data-liquid-engine="webgl"/);
 assert.match(css,/\.liquid-glass-canvas/);
 assert.match(css,/\.liquid-lens/);
});
