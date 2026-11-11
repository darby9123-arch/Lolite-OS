/* Lolite OS 4.1 regression tests: game reliability + actual website wiring. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

function healthHarness(responder){
 let now=1200000;
 const calls=[],events=[];
 const win={dispatchEvent:event=>events.push(event)};
 const RealDate=Date;
 class FakeDate extends RealDate{static now(){return now}}
 const ctx={
  window:win,document:{baseURI:'https://lolite.example/Lolite-OS/'},
  location:{origin:'https://lolite.example'},Date:FakeDate,
  URL,AbortController,setTimeout,clearTimeout,
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},
  console,fetch:async(url,options)=>{calls.push({url,options});return responder(url,options)}
 };
 vm.runInNewContext(read('core/game-health.js'),ctx);
 return{health:win.LoliteGameHealth,calls,events,advance:ms=>{now+=ms}};
}
const local={url:'html%20games/SomeGame.html'};

test('HEAD 405 safely falls back to a one-byte GET with cancelled body',async()=>{
 let cancelled=0;
 const h=healthHarness((url,options)=>options.method==='HEAD'
  ?{status:405,ok:false}
  :{status:206,ok:true,body:{cancel:async()=>{cancelled++}}});
 const result=await h.health.probe(local);
 assert.equal(result.status,'ok');
 assert.deepEqual(h.calls.map(c=>c.options.method),['HEAD','GET']);
 assert.equal(h.calls[1].options.headers.Range,'bytes=0-0');
 assert.equal(cancelled,1);
});
test('GET fallback 404 is confirmed missing, but 403 is unknown',async()=>{
 const missing=healthHarness((url,options)=>options.method==='HEAD'?{status:501,ok:false}:{status:404,ok:false});
 assert.equal((await missing.health.probe(local)).status,'missing');
 const forbidden=healthHarness((url,options)=>options.method==='HEAD'?{status:405,ok:false}:{status:403,ok:false});
 assert.equal((await forbidden.health.probe(local)).status,'unknown');
 assert.equal(forbidden.health.isUnavailable(local),false);
});
test('Network failures never mark a game missing',async()=>{
 const h=healthHarness(()=>{throw new Error('offline')});
 assert.equal((await h.health.probe(local)).status,'unknown');
 assert.equal(h.health.isUnavailable(local),false);
});
test('Fresh health entries are cached, stale entries are checked again',async()=>{
 const h=healthHarness(()=>({status:200,ok:true}));
 await h.health.probe(local);
 await h.health.probe(local);
 assert.equal(h.calls.length,1);
 h.advance(5*60*1000+1);
 assert.equal(h.health.status(local),'unchecked');
 await h.health.probe(local);
 assert.equal(h.calls.length,2);
});
test('Version verification does not pretend remote titles were probed',async()=>{
 const h=healthHarness(()=>({status:404,ok:false}));
 const result=await h.health.probe({url:'https://other.example/game.html'});
 assert.equal(result.status,'unverified');
 assert.equal(h.calls.length,0);
});

test('The existing widget catalog gains a music type, sizes and a resize handle',()=>{
 const widget=read('core/widgets.js');
 assert.match(widget,/music:\{title:'Now playing'/);
 assert.match(widget,/data-lw-resize/);
 assert.match(widget,/function beginResize\(/);
 assert.match(widget,/function setSize\(/);
 assert.match(widget,/window\.addEventListener\('lolite:musicstate',updateMusicWidget\)/);
 assert.match(widget,/width:Number\.isFinite\(w\.width\)/);
});
test('Music connects favourites, repeat, shuffle and a safe read-only widget state',()=>{
 const music=read('core/music.js');
 for(const marker of ['favourites:favouriteSongs','data-lm-action="shuffle"','data-lm-action="repeat"',
  'data-lm-action="favourite"','getState:()=>','publishState','lolite:musicstate'])
  assert.ok(music.includes(marker),marker);
 assert.match(music,/t\.status!=='approved'/);
 assert.match(music,/FAV_PREFIX\+S\.user\.id/);
});
test('Game Store 3.0 retains the original game launching and purchases',()=>{
 const store=read('core/game-store.js');
 for(const marker of ['data-store-details','openGameDetail','closeGameDetail','data-store-sort',
  'window.loliteStoreAction=file=>','window.loliteStorePlay=file=>','window.LoliteGameHealth'])
  assert.ok(store.includes(marker),marker);
 assert.match(store,/sortOrder==='servers'/);
});
test('Lite mode can switch on and off without touching game/network APIs',()=>{
 const key='lolite.performance.lite.v1',memory=new Map(),classes=new Set(),events=[];
 const doc={documentElement:{classList:{toggle:(key,on)=>on?classes.add(key):classes.delete(key)}},
  readyState:'loading',addEventListener(){}};
 const win={dispatchEvent:e=>events.push(e)};
 const ctx={window:win,document:doc,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}}};
 vm.runInNewContext(read('core/performance-mode.js'),ctx);
 assert.equal(win.LolitePerformance.isLite(),false);
 win.LolitePerformance.setLite(true);
 assert.equal(memory.get(key),'true');
 assert.ok(classes.has('lolite-lite-mode'));
 win.LolitePerformance.setLite(false);
 assert.equal(memory.get(key),'false');
 assert.equal(classes.has('lolite-lite-mode'),false);
 assert.equal(events.filter(e=>e.type==='lolite:performancechange').length,2);
});
test('The loaded page includes each feature and Lite Mode starts before wallpapers',()=>{
 const html=read('index.html');
 for(const marker of ['core/lolite-4-1.css?v=4.1.0','core/performance-mode.js?v=4.1.0',
  'core/widgets.js?v=widgets-4.1.0',
  'core/game-health.js?v=game-health-4.1.0'])
  assert.ok(html.includes(marker),marker);
 assert.match(html,/core\/game-store\.js\?v=[^"']+/);
 assert.match(html,/core\/music\.js\?v=[^"']+/);
 assert.ok(html.indexOf('core/music-zip.js')<html.indexOf('core/music.js'));
 assert.ok(html.indexOf('core/performance-mode.js?v=4.1.0')<html.indexOf('core/wallpapers.js'));
 assert.match(read('core/wallpapers.js'),/root\.classList\.contains\('lolite-lite-mode'\)/);
 assert.match(read('core/lolite-4-1.css'),/#icons \.desktop-icon.*align-items:center/);
});
