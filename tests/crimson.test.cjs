const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function environment(seed={}){
 const data=new Map(Object.entries(seed)),events={},docEvents={},queue=new Map(),timers=new Map(),children=[];let next=0,observer;
 const classes=new Set(),root={dataset:{},classList:{contains:v=>classes.has(v)},style:{setProperty(){}}};
 const context=new Proxy({}, {get:(target,key)=>key==='createLinearGradient'||key==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}});
 const wallpaper={style:{},dataset:{},classList:{remove(){}},appendChild(el){children.push(el)}};
 const document={documentElement:root,hidden:false,readyState:'complete',getElementById:id=>id==='wallpaper'?wallpaper:null,querySelectorAll:selector=>children.filter(el=>'.'+el.className===selector),addEventListener:(n,f)=>(docEvents[n]??=[]).push(f),createElement:tag=>{const listeners={},el={tag,className:'',style:{},paused:true,error:null,playCount:0,loadCount:0,src:'',setAttribute(){},getAttribute(k){return this[k]||null},removeAttribute(k){this[k]=''},addEventListener(n,f){listeners[n]=f},emit(n){listeners[n]?.()},play(){this.playCount++;this.paused=false;return this.pendingPlay||Promise.resolve()},pause(){this.paused=true},load(){this.loadCount++;this.error=null},getContext:()=>context,remove(){const i=children.indexOf(this);if(i>=0)children.splice(i,1)}};return el}};
 const media={matches:false,addEventListener(n,f){this.change=f}};
 const c={document,localStorage:{getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v))},matchMedia:()=>media,innerWidth:1280,innerHeight:720,devicePixelRatio:2,requestAnimationFrame:f=>{queue.set(++next,f);return next},cancelAnimationFrame:id=>queue.delete(id),addEventListener:(n,f)=>(events[n]??=[]).push(f),dispatchEvent:e=>(events[e.type]||[]).forEach(f=>f(e)),CustomEvent:class{constructor(type,args){this.type=type;this.detail=args?.detail}},Event:class{constructor(type){this.type=type}},MutationObserver:class{constructor(f){observer=f}observe(){}},page:()=>'',performance:{now:()=>1000},setTimeout:f=>{timers.set(++next,f);return next},clearTimeout:id=>timers.delete(id),console};
 c.window=c;vm.createContext(c);
 return {c,data,classes,root,document,media,queue,children,wallpaper,emit:(name,detail)=>c.dispatchEvent({type:name,detail}),docEmit:(name,event)=>(docEvents[name]||[]).forEach(f=>f(event)),flush:()=>{const jobs=[...timers.values()];timers.clear();jobs.forEach(f=>f())},mutate:()=>observer?.(),step:now=>{const jobs=[...queue.values()];queue.clear();jobs.forEach(f=>f(now))}};
}
const run=(env,name)=>vm.runInContext(fs.readFileSync('core/'+name+'.js','utf8'),env.c);
function wallpapers(seed){
 const env=environment(seed);
 run(env,'live-wallpapers-catalog');
 run(env,'interactive-wallpapers');
 run(env,'uploaded-wallpapers-catalog');
 run(env,'wallpapers');
 return env;
}
test('52 moving scenes and 10 static wallpapers are available without downloads',()=>{
 const e=wallpapers({wallpaperId:'ocean-dawn',loliteAccent:'#e85c64'});
 assert.equal(e.c.LoliteWallpapers.current().id,'tidal-night');
 assert.equal(e.data.get('loliteAccent'),'#e85c64');
 const all=e.c.LoliteWallpapers.collection;
 assert.equal(all.length,62);
 assert.equal(all.filter(w=>w.scene).length,52);
 for(const w of all){
  if(w.scene){assert.match(w.src,/^data:image\/svg\+xml,/);assert.equal(w.poster,w.src)}
  else assert.ok(fs.existsSync(w.src),w.src);
 }
 assert.equal(new Set(all.map(w=>w.id)).size,all.length);
});
test('switching animated scenes leaves one canvas, one animation loop, no video imports',()=>{
 const e=wallpapers();
 for(const id of ['live-aurora-blue','live-neon-rain','live-galactic-drift','live-ocean-blue','live-digital-rain','live-electric-cyan','live-solar-flare','live-embers']){
  assert.equal(e.c.loliteWallpaper(id),true);
  assert.equal(e.children.length,1);
  assert.equal(e.children[0].tag,'canvas');
  assert.equal(e.queue.size,1);
  e.step(100);e.step(150);
 }
 assert.equal(e.c.loliteWallpaper('carbon'),true);
 assert.equal(e.children.length,0);
 assert.equal(e.queue.size,0);
});
test('max quality renders at full physical resolution on 4K-sized desktop',()=>{
 const e=wallpapers();
 e.c.innerWidth=3840;e.c.innerHeight=2160;e.c.devicePixelRatio=1;
 e.c.LoliteWallpapers.apply('live-starfield');
 assert.deepEqual(Array.from(e.c.LoliteWallpapers.debug().resolution),[3840,2160]);
 assert.equal(e.c.LoliteWallpapers.getQuality(),'max');
 e.c.LoliteWallpapers.setQuality('balanced');
 assert.deepEqual(Array.from(e.c.LoliteWallpapers.debug().resolution),[Math.round(3840*Math.sqrt(6000000/(3840*2160))),Math.round(2160*Math.sqrt(6000000/(3840*2160)))]);
 e.c.LoliteWallpapers.setQuality('max');
 assert.deepEqual(Array.from(e.c.LoliteWallpapers.debug().resolution),[3840,2160]);
});
test('interactive scenes react to cursor movement and clicks without blocking the desktop',()=>{
 const e=wallpapers();
 assert.equal(e.c.LoliteWallpapers.apply('interactive-gravity-well'),true);
 assert.equal(e.children.length,1);
 assert.equal(e.queue.size,1);
 e.docEmit('pointermove',{clientX:1100,clientY:150});
 e.step(100);
 assert.ok(e.c.LoliteWallpapers.debug().pointer.strength>0);
 const firstX=e.c.LoliteWallpapers.debug().pointer.x;
 e.step(150);assert.ok(e.c.LoliteWallpapers.debug().pointer.x>firstX);
 e.docEmit('pointerdown',{clientX:1100,clientY:150,button:0,target:{closest:()=>null}});
 assert.equal(e.c.LoliteWallpapers.debug().ripples,1);
 e.c.LoliteWallpapers.setInteractiveEnabled(false);
 assert.equal(e.c.LoliteWallpapers.debug().ripples,0);
 assert.equal(e.c.LoliteWallpapers.isInteractiveEnabled(),false);
 assert.equal(e.data.get('loliteWallpaperInteractive'),'off');
 e.c.LoliteWallpapers.setInteractiveEnabled(true);
 assert.equal(e.c.LoliteWallpapers.isInteractiveEnabled(),true);
 e.c.LoliteWallpapers.setInteractionStrength(1.2);
 assert.equal(e.data.get('loliteWallpaperInteractionStrength'),'1.2');
 e.c.LoliteWallpapers.apply('carbon');
 assert.equal(e.children.length,0);
 assert.equal(e.queue.size,0);
});
test('live scenes pause on hidden tabs, Browsing Style and reduced motion',()=>{
 const e=wallpapers();
 e.c.loliteWallpaper('live-aurora-green');
 e.document.hidden=true;e.docEmit('visibilitychange');assert.equal(e.queue.size,0);
 e.document.hidden=false;e.docEmit('visibilitychange');assert.equal(e.queue.size,1);
 e.classes.add('browsing-mode');e.emit('lolite:modechange');assert.equal(e.queue.size,0);
 e.classes.delete('browsing-mode');e.classes.add('reduce');e.mutate();assert.equal(e.queue.size,0);
 e.classes.delete('reduce');e.mutate();assert.equal(e.queue.size,1);
 e.media.matches=true;e.media.change();assert.equal(e.queue.size,0);
});
test('saved wallpaper and pause settings persist across sessions',()=>{
 const e=wallpapers();
 e.c.loliteWallpaper('live-snow'); // old ID still migrates.
 assert.equal(e.c.LoliteWallpapers.current().id,'live-gentle-snow');
 e.c.LoliteWallpapers.pause(true);
 const fresh=wallpapers(Object.fromEntries(e.data));
 assert.equal(fresh.c.LoliteWallpapers.current().id,'live-gentle-snow');
 assert.equal(fresh.queue.size,0);
 fresh.c.LoliteWallpapers.pause(false);assert.equal(fresh.queue.size,1);
});
test('custom image still works and can be replaced by a built-in animated scene',()=>{
 const e=wallpapers();
 assert.equal(e.c.LoliteWallpapers.setCustom('javascript:alert(1)'),false);
 const image='data:image/png;base64,aGVsbG8=';
 assert.equal(e.c.LoliteWallpapers.setCustom(image),true);
 e.c.LoliteWallpapers.restore();
 assert.equal(e.c.LoliteWallpapers.current().id,'custom');
 e.c.loliteWallpaper('live-prism-flow');
 assert.equal(e.data.get('loliteWallpaperCustomActive'),'false');
 assert.equal(e.data.get('loliteCustomWallpaper'),image);
});
function soundEnvironment(seed){const e=environment(seed);let created=0,starts=0;const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});e.c.AudioContext=class{constructor(){created++;this.state='running';this.currentTime=0;this.destination={}}createGain(){return {gain:param(),connect(){},disconnect(){}}}createOscillator(){return {frequency:param(),connect(){},disconnect(){},start(){starts++},stop(){}}}resume(){return Promise.resolve()}};return {...e,counts:()=>({created,starts})}}
test('sounds wait for interaction; mute and zero volume do not schedule tones',()=>{const e=soundEnvironment();run(e,'system-sounds');assert.equal(e.c.LoliteSounds.play('startup'),false);assert.equal(e.counts().created,0);e.c.LoliteSounds.unlock();assert.equal(e.c.LoliteSounds.play('startup',true),true);assert.equal(e.counts().starts,3);e.c.LoliteSounds.setEnabled(false);assert.equal(e.c.LoliteSounds.play('startup',true),false);e.c.LoliteSounds.setEnabled(true);e.c.LoliteSounds.setVolume(0);assert.equal(e.c.LoliteSounds.play('open',true),false);assert.equal(e.counts().created,1);assert.equal(e.counts().starts,3)});
test('sound preferences persist across sessions',()=>{const e=soundEnvironment();run(e,'system-sounds');e.c.LoliteSounds.setVolume(.37);e.c.LoliteSounds.setEnabled(false);const fresh=soundEnvironment(Object.fromEntries(e.data));run(fresh,'system-sounds');assert.equal(fresh.c.LoliteSounds.state().volume,.37);assert.equal(fresh.c.LoliteSounds.state().enabled,false);assert.equal(fresh.counts().created,0)});
test('all referenced classic browser scripts parse',()=>{const html=fs.readFileSync('index.html','utf8');for(const m of html.matchAll(/<script[^>]*src="([^"]+)"/g)){const p=m[1].split('?')[0];if(!p.startsWith('https:'))new vm.Script(fs.readFileSync(p,'utf8'),{filename:p})}});

test('full resolution mode stays bounded at 16 MP on high-DPI displays',()=>{
 const e=wallpapers();
 e.c.innerWidth=3840;e.c.innerHeight=2160;e.c.devicePixelRatio=3;
 e.c.LoliteWallpapers.apply('live-aurora-blue');
 const size=e.c.LoliteWallpapers.debug().resolution;
 assert.ok(size[0]*size[1]<=16_100_000);
 assert.ok(size[0]>=3840);
});
test('wallpaper library has zero video import prompts or fake download options',()=>{
 const e=wallpapers(),html=e.c.LoliteWallpapers.markup('Live');
 assert.match(html,/LIVE/);
 assert.doesNotMatch(html,/Install|Import video|data-wall-pack-upload|local download/i);
 assert.equal((html.match(/data-wall-id=/g)||[]).length,52);
 assert.doesNotMatch(e.c.LoliteWallpapers.cards('Live'),/src="https?:/);
});
test('sound categories persist; disabled groups stay silent but can be previewed',()=>{const e=soundEnvironment();run(e,'system-sounds');const api=e.c.LoliteSounds;api.unlock();assert.equal(api.catalog().length,36);assert.equal(api.play('type'),false);api.setGroup('windows',false);assert.equal(api.play('open'),false);assert.equal(api.play('open',true),true);const fresh=soundEnvironment(Object.fromEntries(e.data));run(fresh,'system-sounds');assert.equal(fresh.c.LoliteSounds.groups().find(g=>g.id==='windows').enabled,false)});
test('specific action sounds beat generic clicks and mute clears pending and active voices',()=>{const e=soundEnvironment();run(e,'system-sounds');const api=e.c.LoliteSounds;api.unlock();api.request('click',0);api.request('open',5);api.request('click',0);e.flush();assert.equal(api.state().lastName,'open');assert.equal(api.state().played,1);api.request('notification');api.setEnabled(false);e.flush();assert.equal(api.state().activeVoices,0);assert.equal(api.state().played,1)});
test('audio has a strict voice cap and a hidden page cannot play or retain pending sounds',()=>{const e=soundEnvironment();run(e,'system-sounds');const api=e.c.LoliteSounds;api.unlock();for(let i=0;i<20;i++)api.play('startup',true);assert.equal(api.state().activeVoices,12);e.document.hidden=true;e.docEmit('visibilitychange');assert.equal(api.state().activeVoices,0);assert.equal(api.play('open',true),false)});
test('restoring a saved workspace does not create audio before a trusted user gesture',async()=>{const e=soundEnvironment();run(e,'system-sounds');e.emit('lolite:modechange',{mode:'desktop'});assert.equal(e.counts().created,0);e.docEmit('pointerdown',{isTrusted:true});await Promise.resolve();e.flush();assert.equal(e.counts().created,1);assert.equal(e.c.LoliteSounds.state().lastName,'startup')});
