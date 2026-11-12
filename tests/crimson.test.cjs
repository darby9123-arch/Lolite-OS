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
 const c={document,localStorage:{getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v))},matchMedia:()=>media,innerWidth:1280,innerHeight:720,devicePixelRatio:2,requestAnimationFrame:f=>{queue.set(++next,f);return next},cancelAnimationFrame:id=>queue.delete(id),addEventListener:(n,f)=>(events[n]??=[]).push(f),dispatchEvent:e=>(events[e.type]||[]).forEach(f=>f(e)),CustomEvent:class{constructor(type,args){this.type=type;this.detail=args?.detail}},Event:class{constructor(type){this.type=type}},MutationObserver:class{constructor(f){observer=f}observe(){}},page:()=>'',performance:{now:()=>1000},setInterval:f=>{timers.set(++next,f);return next},clearInterval:id=>timers.delete(id),setTimeout:f=>{timers.set(++next,f);return next},clearTimeout:id=>timers.delete(id),console};
 c.window=c;vm.createContext(c);
 return {c,data,classes,root,document,media,queue,children,wallpaper,emit:(name,detail)=>c.dispatchEvent({type:name,detail}),docEmit:(name,event)=>(docEvents[name]||[]).forEach(f=>f(event)),flush:()=>{const jobs=[...timers.values()];timers.clear();jobs.forEach(f=>f())},mutate:()=>observer?.(),step:now=>{const jobs=[...queue.values()];queue.clear();jobs.forEach(f=>f(now))}};
}
const run=(env,name)=>vm.runInContext(fs.readFileSync('core/'+name+'.js','utf8'),env.c);
function wallpapers(seed){
 const env=environment(seed);
 run(env,'lively-wallpapers-catalog');
 run(env,'wallpaper-loop');
 run(env,'wallpapers');
 return env;
}
const DEFAULT='lively-minecraft-aurora-night-cabin';
const CURRENT={'loliteWallpaperCollection':'lively-20261111'};
test('the replacement migrates old selections and contains only the 840 source videos',()=>{
 const e=wallpapers({wallpaperId:'ocean-dawn',loliteAccent:'#e85c64',loliteCustomWallpaper:'data:image/png;base64,AAAA',loliteWallpaperCustomActive:'true'});
 assert.equal(e.c.LoliteWallpapers.current().id,DEFAULT);
 assert.equal(e.data.get('wallpaperId'),DEFAULT);
 assert.equal(e.data.get('loliteWallpaperCustomActive'),'false');
 assert.equal(e.data.get('loliteAccent'),'#e85c64');
 const all=e.c.LoliteWallpapers.collection;
 assert.equal(all.length,840);
 assert.ok(all.every(w=>w.id.startsWith('lively-')&&w.video&&!w.scene));
 assert.equal(new Set(all.map(w=>w.id)).size,all.length);
 for(const id of ['cosmos-orbit','crimson-dunes','live-starfield','interactive-gravity-well','user-minecraft-aquarium'])assert.equal(e.c.loliteWallpaper(id),false);
});
test('Balanced wallpapers use one decoder, while explicitly selected Max retains seamless dual decoders',()=>{
 const e=wallpapers(),api=e.c.LoliteWallpapers;
 assert.equal(api.getQuality(),'balanced');
 for(const wall of api.collection.slice(0,12)){
  const previous=e.children.filter(el=>el.tag==='video');
  assert.equal(api.apply(wall.id),true);
  const decoders=e.children.filter(el=>el.tag==='video');
  assert.equal(decoders.length,1,'Balanced mode must use exactly one streaming video');
  assert.ok(decoders.every(el=>el.muted&&el.loop&&el.playsInline));
  assert.equal(decoders[0].src,wall.src1080||wall.video);
  assert.equal(api.debug().canvasCount,0);
  if(previous[0]!==e.children.find(el=>el.tag==='video'))assert.ok(previous.every(el=>el.paused&&!el.src));
 }
 api.setQuality('max');
 assert.equal(api.getQuality(),'max');
 assert.equal(e.children.filter(el=>el.tag==='video').length,2,'Max mode preserves seamless crossfade');
 assert.equal(e.children.find(el=>el.tag==='video').src,api.current().video);
});
test('quality selects original, verified HD, and small preview without inventing missing HD sources',()=>{
 const e=wallpapers(),api=e.c.LoliteWallpapers,wall=api.current();
 assert.equal(api.getQuality(),'balanced');assert.equal(e.children[0].src,wall.src1080||wall.video);
 api.setQuality('lite');assert.equal(e.children[0].src,wall.preview);
 api.setQuality('max');assert.equal(e.children[0].src,wall.video);
 api.setQuality('balanced');assert.equal(e.children[0].src,wall.src1080||wall.video);
 const noHD=api.collection.find(w=>!w.src1080);
 api.apply(noHD.id);api.setQuality('balanced');assert.equal(e.children[0].src,noHD.video);
});
test('live video pauses on hidden tabs, Browsing Style, performance mode and reduced motion',()=>{
 const e=wallpapers(),api=e.c.LoliteWallpapers;
 assert.equal(api.debug().running,true);
 e.document.hidden=true;e.docEmit('visibilitychange');assert.ok(e.children.every(el=>el.paused));
 e.document.hidden=false;e.docEmit('visibilitychange');assert.equal(api.debug().running,true);
 e.classes.add('browsing-mode');e.emit('lolite:modechange');assert.ok(e.children.every(el=>el.paused));
 e.classes.delete('browsing-mode');e.classes.add('reduce');e.mutate();assert.ok(e.children.every(el=>el.paused));
 e.classes.delete('reduce');e.classes.add('lolite-lite-mode');e.mutate();assert.ok(e.children.every(el=>el.paused));
 e.classes.delete('lolite-lite-mode');e.mutate();assert.equal(api.debug().running,true);
 e.media.matches=true;e.media.change();assert.ok(e.children.every(el=>el.paused));
});
test('new saved wallpaper, quality and pause settings survive a reload',()=>{
 const e=wallpapers(),wall=e.c.LoliteWallpapers.collection[25];
 e.c.LoliteWallpapers.apply(wall.id);e.c.LoliteWallpapers.setQuality('lite');e.c.LoliteWallpapers.pause(true);
 const fresh=wallpapers(Object.fromEntries(e.data)),api=fresh.c.LoliteWallpapers;
 assert.equal(api.current().id,wall.id);assert.equal(api.getQuality(),'lite');
 assert.ok(fresh.children.every(el=>el.paused));
 api.pause(false);assert.equal(api.debug().running,true);
});
test('custom images still work after migration and stop video playback',()=>{
 const e=wallpapers(),api=e.c.LoliteWallpapers;
 assert.equal(api.setCustom('javascript:alert(1)'),false);
 const image='data:image/png;base64,aGVsbG8=';
 assert.equal(api.setCustom(image),true);
 assert.equal(e.children.filter(el=>el.tag==='video').length,0,'Custom images release all video decoders; decorative fade can remain briefly');
 api.restore();assert.equal(api.current().id,'custom');
 const fresh=wallpapers(Object.fromEntries(e.data));assert.equal(fresh.c.LoliteWallpapers.current().id,'custom');
 api.apply(DEFAULT);assert.equal(e.data.get('loliteWallpaperCustomActive'),'false');
 assert.equal(e.data.get('loliteCustomWallpaper'),image);
});
test('failed video sources fall back in order, then leave the poster and expose a retry',()=>{
 const e=wallpapers(),api=e.c.LoliteWallpapers,wall=api.current();
 e.children[0].emit('error');assert.equal(e.children[0].src,wall.video);
 e.children[0].emit('error');assert.equal(e.children[0].src,wall.preview);
 e.children[0].emit('error');assert.match(api.getStatus(),/Video unavailable/);
 assert.ok(e.children.filter(el=>el.tag==='video').every(el=>el.style.opacity==='0'));
 assert.ok(e.wallpaper.style.background.includes(wall.poster));
 api.retry();assert.equal(e.children.filter(el=>el.tag==='video').length,1);
 assert.equal(e.children.find(el=>el.tag==='video').src,wall.src1080||wall.video);
});
test('older admin wallpapers stay retired while new uploads can be selected and restored',()=>{
 const e=wallpapers(),api=e.c.LoliteWallpapers;
 const old={id:'11111111-1111-1111-1111-111111111111',kind:'wallpaper',title:'Old upload',url:'https://example.com/old.mp4',created_at:'2026-11-10T00:00:00Z'};
 const added={...old,id:'22222222-2222-2222-2222-222222222222',title:'New upload',url:'https://example.com/new.mp4',poster_url:'https://example.com/new.webp',created_at:'2026-11-12T00:00:00Z'};
 api.syncAdminWallpapers([old,added]);assert.equal(api.collection.length,841);
 assert.equal(api.apply('admin-'+old.id),false);assert.equal(api.apply('admin-'+added.id),true);
 const fresh=wallpapers(Object.fromEntries(e.data));
 fresh.c.LoliteWallpapers.syncAdminWallpapers([old,added]);assert.equal(fresh.c.LoliteWallpapers.current().id,'admin-'+added.id);
 api.syncAdminWallpapers([old]);assert.equal(api.collection.length,840);assert.equal(api.current().id,DEFAULT);
});
test('search covers all pages and tags while gallery batches stay small',()=>{
 const e=wallpapers(),api=e.c.LoliteWallpapers;
 assert.equal((api.cards().match(/data-wall-id=/g)||[]).length,48);
 assert.equal((api.cards('All','',96).match(/data-wall-id=/g)||[]).length,96);
 assert.equal((api.cards('All','',1000).match(/data-wall-id=/g)||[]).length,840);
 assert.equal((api.cards('4K','',1000).match(/data-wall-id=/g)||[]).length,750);
 assert.match(api.cards('All','samurai girl rain'),/lively-samurai-girl-in-the-rain/);
 assert.doesNotMatch(api.cards('Cars','minecraft'),/lively-minecraft-aurora-night-cabin/);
 assert.match(api.cards('Nature','aurora cabin'),/lively-minecraft-aurora-night-cabin/);
 const markup=api.markup();
 assert.match(markup,/Search 840 wallpapers/);assert.match(markup,/Source & download/);
 assert.doesNotMatch(markup,/data-wall-filter="Interactive"|data-wall-filter="Signature"|data-wall-filter="Special Live Wallpapers"/);
 assert.match(api.cards('All','no-such-wallpaper-987654321'),/No wallpapers match/);
});
function soundEnvironment(seed){const e=environment(seed);let created=0,starts=0;const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});e.c.AudioContext=class{constructor(){created++;this.state='running';this.currentTime=0;this.destination={}}createGain(){return {gain:param(),connect(){},disconnect(){}}}createOscillator(){return {frequency:param(),connect(){},disconnect(){},start(){starts++},stop(){}}}resume(){return Promise.resolve()}};return {...e,counts:()=>({created,starts})}}
test('sounds wait for interaction; mute and zero volume do not schedule tones',()=>{const e=soundEnvironment();run(e,'system-sounds');assert.equal(e.c.LoliteSounds.play('startup'),false);assert.equal(e.counts().created,0);e.c.LoliteSounds.unlock();assert.equal(e.c.LoliteSounds.play('startup',true),true);assert.equal(e.counts().starts,3);e.c.LoliteSounds.setEnabled(false);assert.equal(e.c.LoliteSounds.play('startup',true),false);e.c.LoliteSounds.setEnabled(true);e.c.LoliteSounds.setVolume(0);assert.equal(e.c.LoliteSounds.play('open',true),false);assert.equal(e.counts().created,1);assert.equal(e.counts().starts,3)});
test('sound preferences persist across sessions',()=>{const e=soundEnvironment();run(e,'system-sounds');e.c.LoliteSounds.setVolume(.37);e.c.LoliteSounds.setEnabled(false);const fresh=soundEnvironment(Object.fromEntries(e.data));run(fresh,'system-sounds');assert.equal(fresh.c.LoliteSounds.state().volume,.37);assert.equal(fresh.c.LoliteSounds.state().enabled,false);assert.equal(fresh.counts().created,0)});
test('all referenced classic browser scripts parse',()=>{const html=fs.readFileSync('index.html','utf8');for(const m of html.matchAll(/<script[^>]*src="([^"]+)"/g)){const p=m[1].split('?')[0];if(!p.startsWith('https:'))new vm.Script(fs.readFileSync(p,'utf8'),{filename:p})}});

test('sound categories persist; disabled groups stay silent but can be previewed',()=>{const e=soundEnvironment();run(e,'system-sounds');const api=e.c.LoliteSounds;api.unlock();assert.equal(api.catalog().length,36);assert.equal(api.play('type'),false);api.setGroup('windows',false);assert.equal(api.play('open'),false);assert.equal(api.play('open',true),true);const fresh=soundEnvironment(Object.fromEntries(e.data));run(fresh,'system-sounds');assert.equal(fresh.c.LoliteSounds.groups().find(g=>g.id==='windows').enabled,false)});
test('specific action sounds beat generic clicks and mute clears pending and active voices',()=>{const e=soundEnvironment();run(e,'system-sounds');const api=e.c.LoliteSounds;api.unlock();api.request('click',0);api.request('open',5);api.request('click',0);e.flush();assert.equal(api.state().lastName,'open');assert.equal(api.state().played,1);api.request('notification');api.setEnabled(false);e.flush();assert.equal(api.state().activeVoices,0);assert.equal(api.state().played,1)});
test('audio has a strict voice cap and a hidden page cannot play or retain pending sounds',()=>{const e=soundEnvironment();run(e,'system-sounds');const api=e.c.LoliteSounds;api.unlock();for(let i=0;i<20;i++)api.play('startup',true);assert.equal(api.state().activeVoices,12);e.document.hidden=true;e.docEmit('visibilitychange');assert.equal(api.state().activeVoices,0);assert.equal(api.play('open',true),false)});
test('restoring a saved workspace does not create audio before a trusted user gesture',async()=>{const e=soundEnvironment();run(e,'system-sounds');e.emit('lolite:modechange',{mode:'desktop'});assert.equal(e.counts().created,0);e.docEmit('pointerdown',{isTrusted:true});await Promise.resolve();e.flush();assert.equal(e.counts().created,1);assert.equal(e.c.LoliteSounds.state().lastName,'startup')});
