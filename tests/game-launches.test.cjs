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
