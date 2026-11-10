const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

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
test('Local HTML games stay available without retired external sources',()=>{
 const source=read('core/game-store.js');
 assert.match(source,/const manifest=/);
 assert.match(source,/const builtInHtmlGames=/);
 assert.doesNotMatch(source,/loadGenizyCatalog|LoliteMountainCatalog|LoliteChickenKingsCatalog/);
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

test('Geometry Dash webport handles denied gamepad access without crashing',()=>{
 const html=read('html games/Geometry Dash webport.html');
 const script=html.match(/<script id="lolite-gd-gamepad-compat">([\s\S]*?)<\/script>/);
 assert.ok(script,'Gamepad compatibility shim must load before game engine');
 assert.ok(html.indexOf('lolite-gd-gamepad-compat')<html.indexOf('googletagmanager'),'Shim must run before other webport scripts');
 const blocked={
  getGamepads(){
   const error=new Error("Document's Permissions Policy does not allow calling getGamepads()");
   error.name='SecurityError';
   throw error;
  }
 };
 vm.runInNewContext(script[1],{navigator:blocked,console:{warn(){}},Object,Array});
 assert.equal(blocked.getGamepads().length,0);
 const allowed={getGamepads(){return [{id:'connected-controller'}]}};
 vm.runInNewContext(script[1],{navigator:allowed,console:{warn(){}},Object,Array});
 assert.equal(allowed.getGamepads()[0].id,'connected-controller');
});
