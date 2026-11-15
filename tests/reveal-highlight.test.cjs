const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('./chat/node_modules/jsdom');
const script=fs.readFileSync(path.join(__dirname,'../core/reveal-highlight.js'),'utf8');
function setup(t,markup='<button id="a"><span>Play</span></button><button id="b">Chat</button>'){
 const dom=new JSDOM('<!doctype html><body>'+markup+'</body>',{runScripts:'outside-only',pretendToBeVisual:true});
 t.after(()=>dom.window.close());const w=dom.window,d=w.document,frames=new Map(),timers=new Map(),media=new Map();let id=0;
 w.requestAnimationFrame=fn=>{frames.set(++id,fn);return id};w.cancelAnimationFrame=id=>frames.delete(id);
 w.setTimeout=fn=>{timers.set(++id,fn);return id};w.clearTimeout=id=>timers.delete(id);
 w.matchMedia=query=>{const listeners=new Set(),m={matches:!query.includes('reduced'),addEventListener:(_,fn)=>listeners.add(fn),set(value){m.matches=value;listeners.forEach(fn=>fn())}};media.set(query,m);return m};
 const computed=w.getComputedStyle.bind(w);
 w.getComputedStyle=(el,pseudo)=>pseudo?{content:el.dataset[pseudo==='::before'?'before':'after']||'none'}:computed(el);
 const rect={left:10,top:20,right:210,bottom:100,width:200,height:80};
 for(const e of d.querySelectorAll('*'))e.getBoundingClientRect=()=>rect;
 w.eval(script);
 const event=(el,type='pointermove',values={})=>{const e=new w.Event(type,{bubbles:true,cancelable:true});Object.assign(e,{pointerType:'mouse',buttons:0,clientX:70,clientY:50,...values});el.dispatchEvent(e);return e};
 const frame=()=>{const jobs=[...frames.values()];frames.clear();jobs.forEach(fn=>fn())};
 const finishFade=()=>{const jobs=[...timers.values()];timers.clear();jobs.forEach(fn=>fn())};
 return {w,d,frames,timers,media,event,frame,finishFade,a:d.querySelector('#a'),b:d.querySelector('#b')};
}
test('pointer updates are coalesced into one frame and leave no idle animation loop',t=>{
 const f=setup(t);
 for(let i=0;i<100;i++)f.event(f.a,'pointermove',{clientX:20+i});
 assert.equal(f.frames.size,1);f.frame();
 assert.equal(f.a.style.getPropertyValue('--reveal-x'),'107.0px');assert.equal(f.frames.size,0);
 assert.ok(f.a.classList.contains('lolite-reveal-visible'));
});
test('the light follows local coordinates and moves to only the new hovered control',t=>{
 const f=setup(t);Object.defineProperty(f.a,'offsetWidth',{value:400});
 f.event(f.a,'pointermove',{clientX:60});f.frame();assert.equal(f.a.style.getPropertyValue('--reveal-x'),'98.0px');
 f.event(f.a,'pointermove',{clientX:90});f.frame();assert.equal(f.a.style.getPropertyValue('--reveal-x'),'158.0px');
 f.event(f.b);f.frame();assert.equal(f.a.className,'');assert.ok(f.b.classList.contains('lolite-reveal-visible'));
 assert.equal(f.d.querySelectorAll('.lolite-reveal-visible').length,1);
});
test('leaving the control fades then restores its styling without changing child nodes or clicks',t=>{
 const f=setup(t),child=f.a.firstChild;let clicks=0;f.a.onclick=()=>clicks++;
 f.a.style.position='absolute';f.a.style.setProperty('--reveal-x','9px','important');const originalPriority=f.a.style.getPropertyPriority('--reveal-x');
 f.event(child);f.frame();f.a.click();assert.equal(clicks,1);assert.equal(f.a.firstChild,child);assert.equal(f.a.children.length,1);
 f.event(f.a,'pointerout',{relatedTarget:f.d.body});assert.equal(f.a.classList.contains('lolite-reveal-visible'),false);
 f.finishFade();assert.equal(f.a.className,'');assert.equal(f.a.style.position,'absolute');assert.equal(f.a.style.getPropertyValue('--reveal-x'),'9px');assert.equal(f.a.style.getPropertyPriority('--reveal-x'),originalPriority);
});
test('existing pseudo-elements are preserved, including controls using both slots',t=>{
 const f=setup(t);f.a.dataset.before='"badge"';f.event(f.a);f.frame();
 assert.ok(f.a.classList.contains('lolite-reveal-after'));assert.ok(!f.a.classList.contains('lolite-reveal-before'));
 f.b.dataset.before='"icon"';f.b.dataset.after='"indicator"';f.event(f.b);f.frame();assert.equal(f.b.className,'');assert.equal(f.a.className,'');
});
test('touch, disabled controls, editable content, media and empty surfaces never reveal',t=>{
 const f=setup(t,'<button id="a">Play</button><button id="b" disabled>Disabled</button><article class="store-gallery-card"><input id="input"><canvas id="canvas"></canvas><iframe id="frame"></iframe><div contenteditable id="edit">Edit</div><button data-reveal="off" id="off">Off</button></article>');
 for(const selector of ['#b','#input','#canvas','#frame','#edit','#off','body']){f.event(f.d.querySelector(selector));f.frame();assert.equal(f.d.querySelector('.lolite-reveal-visible'),null,selector)}
 f.event(f.a,'pointermove',{pointerType:'touch'});assert.equal(f.frames.size,0);
 f.media.get('(any-hover: hover) and (any-pointer: fine)').set(false);f.event(f.a);assert.equal(f.frames.size,0);
});
test('motion preferences and Lite Mode cancel existing effects and pending frames',async t=>{
 const f=setup(t);
 for(const [attr,value] of [['class','reduce'],['class','reduce-motion'],['class','lolite-lite-mode'],['data-lolite-motion','off']]){
  f.event(f.a);f.frame();f.event(f.a);assert.equal(f.frames.size,1);
  f.d.documentElement.setAttribute(attr,value);await Promise.resolve();
  assert.equal(f.frames.size,0);assert.equal(f.a.className,'');f.event(f.a);assert.equal(f.frames.size,0);
  f.d.documentElement.removeAttribute(attr);await Promise.resolve();
 }
 f.event(f.a);f.frame();f.media.get('(prefers-reduced-motion: reduce)').set(true);assert.equal(f.a.className,'');
});
test('scrolling, window blur and removed targets cannot leave a stuck highlight',t=>{
 const f=setup(t);
 for(const [el,type] of [[f.d,'scroll'],[f.w,'blur'],[f.d,'pointercancel']]){
  f.event(f.a);f.frame();el.dispatchEvent(new f.w.Event(type));assert.equal(f.a.className,'');assert.equal(f.frames.size,0);
 }
 f.event(f.a);f.a.remove();f.frame();f.finishFade();assert.equal(f.a.className,'');assert.equal(f.frames.size,0);
});
