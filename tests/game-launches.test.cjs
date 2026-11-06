const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

function gdHarness({installed=[],selected=0}={}){
 const events={};
 const opened=[],toasts=[],forwarded=[];
 const win={
  toast:s=>toasts.push(s),
  loliteStoreSelectedIndex:()=>selected,
  loliteStorePlay:(file)=>{forwarded.push(file);return 'original'},
  LoliteLocalGamePackages:{
   list:async()=>installed,
   launchUrl:async()=>'/core/local-games/test/index.html'
  },
  LoliteGamePlayer:{open:o=>{opened.push(o);return true}}
 };
 const body={};
 const doc={readyState:'loading',body,
  addEventListener:(name,fn)=>{events[name]=fn},
  querySelectorAll:()=>[]
 };
 vm.runInNewContext(read('core/gd-loading-fix.js'),{
  window:win,document:doc,MutationObserver:class{observe(){}},
  console:{info(){},warn(){},error(){}}
 });
 events.DOMContentLoaded();
 return {win,opened,toasts,forwarded};
}
const flush=()=>new Promise(resolve=>setTimeout(resolve,0));

test('Geometry Dash Play does not open a file picker',async()=>{
 const h=gdHarness();
 h.win.loliteStorePlay('genizy-868.html');
 await flush();
 assert.equal(h.opened.length,1);
 assert.equal(h.opened[0].title,'Geometry Dash Breeze');
 assert.equal(h.opened[0].url,'html%20games/clgdbreeze.html');
 assert.equal(h.forwarded.length,0);
 assert.match(h.toasts.join(' '),/Breeze/);
 assert.doesNotMatch(read('core/gd-loading-fix.js'),/chooseZip|zipInput\.click/);
});
test('Already installed Geometry Dash is used before the fallback',async()=>{
 const record={id:'gd',title:'Geometry Dash',source:'genizymath-user-zip'};
 const h=gdHarness({installed:[record]});
 h.win.loliteStorePlay('genizy-868.html');
 await flush();
 assert.equal(h.opened[0].title,'Geometry Dash');
 assert.equal(h.opened[0].url,'/core/local-games/test/index.html');
});
test('Choosing another GD server still uses the original launcher',()=>{
 const h=gdHarness({selected:1});
 h.win.loliteStorePlay('genizy-868.html');
 assert.deepEqual(h.forwarded,['genizy-868.html']);
});
test('Every listed bundled HTML game exists in the repository',()=>{
 const source=read('core/game-store.js');
 const catalog=source.match(/const manifest=\[([^\]]+)\]/);
 assert.ok(catalog,'Game Store manifest must exist');
 const names=[...catalog[1].matchAll(/'([^']+\.html)'/g)].map(m=>m[1]);
 assert.ok(names.length>50);
 const missing=names.filter(name=>!fs.existsSync(path.join(root,'html games',name)));
 assert.deepEqual(missing,[]);
});
test('External game HTML checks show a friendly error instead of raw code or 404',()=>{
 const source=read('core/game-player.js');
 assert.match(source,/method:'HEAD'/);
 assert.match(source,/response\.status/);
 assert.match(source,/text\/plain/);
 assert.match(source,/store-load-error/);
 assert.match(source,/Back to Game Store/);
 assert.match(source,/startFrame\(frame,target\)/);
 assert.match(source,/URL/);
});
test('Existing local HTML takes precedence over a matching external game source',()=>{
 const source=read('core/game-store.js');
 assert.match(source,/Keep already-hosted HTML as the default game/);
 assert.match(source,/if\(!game\.external&&game\.url\.startsWith\('html games\/'\)\)/);
 assert.match(source,/game\.genizy&&!game\.local&&!game\.url\.startsWith\('html games\/'\)/);
});

test('Legacy HTML games also use the validated in-app player',()=>{
 const legacy=read('core/integration.js');
 assert.ok(legacy.includes('window.LoliteGamePlayer?.open('));
 assert.ok(legacy.includes("html%20games/"));
 assert.ok(!legacy.includes('raw.githubusercontent.com/'));
});

test('Text/plain game HTML is rendered as an executable sandboxed document',async()=>{
 const original=read('core/game-player.js');
 // Expose the internal frame loader to this isolated VM-only regression test.
 const script=original.replace(
  'window.LoliteGamePlayer=Object.freeze({open,switchServer});',
  'window.LoliteGamePlayer=Object.freeze({open,switchServer,startFrame});'
 );
 assert.notEqual(script,original,'The test harness must expose startFrame');
 const requests=[], attrs={};
 const html='<!doctype html><html><head><title>Test</title></head><body><canvas id="game"></canvas><script>document.body.dataset.loaded="yes"</script></body></html>';
 const win={};
 const context={
  window:win,location:{origin:'https://lolite.example'},
  document:{baseURI:'https://lolite.example/',head:{append(){}},
   createElement(tag){
    if(tag==='style')return {id:'',textContent:''};
    throw Error('Unexpected DOM element: '+tag);
   }},
  fetch:async(url,options)=>{
   requests.push(options.method);
   if(options.method==='HEAD')return {ok:true,status:200,headers:{get:()=> 'text/plain'}};
   return {ok:true,status:200,headers:{get:k=>k==='content-type'?'text/plain':null},text:async()=>html};
  },
  URL,Blob,AbortController,setTimeout,clearTimeout,console,
 };
 vm.runInNewContext(script,context);
 const frame={dataset:{gameUrl:'https://cdn.example.org/game.html'},isConnected:true,
  setAttribute(name,value){attrs[name]=value},
  src:'about:blank',srcdoc:''};
 win.LoliteGamePlayer.startFrame(frame,new URL(frame.dataset.gameUrl));
 await new Promise(resolve=>setTimeout(resolve,20));
 assert.deepEqual(requests,['HEAD','GET']);
 assert.match(frame.srcdoc,/canvas id="game"/);
 assert.match(frame.srcdoc,/<base href="https:\/\/cdn\.example\.org\/game\.html">/);
 assert.equal(frame.dataset.gameRender,'raw-html');
 assert.match(attrs.sandbox,/allow-scripts/);
 assert.doesNotMatch(attrs.sandbox,/allow-same-origin|allow-top-navigation/);
});
