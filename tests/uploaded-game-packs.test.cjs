const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const dataContext={window:{}};
vm.runInNewContext(read('core/uploaded-game-packs.js'),dataContext);
const catalog=dataContext.window.LoliteUploadedGamePacks;

async function store(){
 const events={},opened=[];
 const win={page:id=>id,addEventListener(type,fn){(events[type]??=[]).push(fn)},
  LoliteEconomy:{gamePrice:()=>0,hasGame:()=>true},
  LoliteGameHealth:{isUnavailable:()=>false,scan:list=>list,summary:()=>({})},
  LoliteLocalGamePackages:{list:async()=>[]},
  LoliteGamePlayer:{open:game=>{opened.push(game);return true},switchServer(){}}};
 const context={window:win,document:{baseURI:'https://example.com/Lolite-OS/',
  documentElement:{dataset:{},classList:{contains:()=>false}},head:{appendChild(){}},
  getElementById:()=>({textContent:''}),createElement:()=>({style:{}}),
  querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}},
  location:{origin:'https://example.com'},localStorage:{getItem:()=>null,setItem(){}},
  console:{warn(){},error(){}},URL,AbortController,
  MutationObserver:class{observe(){}},ResizeObserver:class{observe(){}},
  Image:class{},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},
  fetch:async()=>({ok:false}),CustomEvent:class{}};
 vm.createContext(context);
 for(const file of ['core/uploaded-game-packs.js','core/additional-game-servers.js',
  'core/ugs-catalog.js','core/ugs-hosted-catalog.js','core/game-store.js'])
  vm.runInContext(read(file),context,{timeout:10000});
 await new Promise(resolve=>setImmediate(resolve));
 return {win,opened,events,games:win.loliteStoreCheckFiles()};
}

test('Every catalogued ZIP game and local cover resolves under root and Pages subpaths',()=>{
 assert.equal(catalog.games.length,1702);
 assert.equal(new Set(catalog.games.map(game=>game.file)).size,catalog.games.length);
 assert.equal(new Set(catalog.games.map(game=>game.url)).size,catalog.games.length);
 const counts=new Map(catalog.collections.map(item=>[item.id,0]));
 for(const game of catalog.games){
  counts.set(game.collection,counts.get(game.collection)+1);
  assert.match(game.url,/^html%20games\/collections\//);
  const actual=read(decodeURIComponent(game.url));
  assert.ok(actual.length>100,game.title+' is empty');
  assert.ok(!/frame-wrapper/.test(actual)||!/id=["']gameFrame["']/.test(actual),game.title+' still points at a collection wrapper');
  for(const base of ['https://example.com/','https://example.com/Lolite-OS/'])
   assert.ok(new URL(game.url,base).href.startsWith(base+'html%20games/collections/'));
  if(game.cover.startsWith('html%20games/'))assert.ok(fs.existsSync(path.join(root,decodeURIComponent(game.cover))),game.title+' cover is missing');
 }
 for(const collection of catalog.collections)assert.equal(counts.get(collection.id),collection.count);
 const index=read('index.html');
 assert.ok(index.indexOf('core/uploaded-game-packs.js?v=')<index.indexOf('core/game-store.js?v='));
});

test('All supplied versions appear in the live merged catalogue and UGS remains the default',async()=>{
 const h=await store();
 const allURLs=new Set(h.games.flatMap(game=>[game.url,...(game.servers||[]).map(server=>server.url)]));
 for(const entry of catalog.games)assert.ok(allURLs.has(entry.url),entry.title+' was dropped during merging');
 assert.equal(h.win.LoliteUploadedGamePacksStatus.total,catalog.games.length);
 assert.equal(new Set(h.games.map(game=>game.file)).size,h.games.length);
 for(const game of h.games.filter(game=>game.ugsInstalled))assert.equal(game.source,'UGS');
 const names=h.win.page('games');
 assert.match(names,/GenizyMath/);
 assert.match(names,/Chicken King&#39;s Vault/);
 assert.doesNotMatch(names,/Mountain Games/);
});

test('Shared games launch each uploaded server inside the existing Lolite player',async()=>{
 const h=await store();
 const shared=h.games.find(game=>(game.uploadedCollections||[]).length===2&&game.ugsInstalled);
 assert.ok(shared,'Expected UGS and both ZIP versions to share a game card');
 for(const collection of catalog.collections){
  const index=shared.servers.findIndex(server=>server.name===collection.name)+1;
  assert.ok(index>0,'Missing server '+collection.name);
  h.win.loliteStorePickServer(shared.file,index);
  h.win.loliteStorePlay(shared.file);
  const opened=h.opened.at(-1);
  assert.equal(opened.source,collection.name);
  assert.ok(opened.url.startsWith('html%20games/collections/'+collection.id+'/'));
 }
 // Refreshing browser-installed games must not remove or duplicate ZIP servers.
 for(const fn of h.events['lolite-local-packages-changed']||[])fn();
 await new Promise(resolve=>setImmediate(resolve));
 const after=h.win.loliteStoreCheckFiles().find(game=>game.file===shared.file);
 assert.equal(after.servers.length,shared.servers.length);
});

test('Archive defects are recorded; broken wrappers are not advertised as playable',()=>{
 const report=JSON.parse(read('html games/collections/import-report.json'));
 assert.equal(report.missing.length,12);
 assert.ok(report.missing.some(item=>item.title==='2048'));
 assert.ok(report.missing.some(item=>item.title==='Serial Experiments Lain'));
 assert.ok(report.missing.some(item=>item.title==='Only Up'));
 for(const item of report.missing)assert.ok(!catalog.games.some(game=>game.collection===item.collection&&game.title===item.title));
 const repaired=catalog.games.find(game=>game.collection==='chicken-kings-vault'&&game.title==='Amanda the Adventurer');
 assert.ok(decodeURIComponent(repaired.url).endsWith('/Amanda the Adventurer.html'));
 const gd=catalog.games.find(game=>game.collection==='genizymath'&&game.title==='Geometry Dash');
 assert.ok(gd.url.endsWith('/iframe/868-F3.html'));
});
