const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=path=>fs.readFileSync(path,'utf8');
function memoryStorage(seed={}){
 const data=new Map(Object.entries(seed)),writes=[];
 return {data,writes,
  getItem(key){return data.has(key)?data.get(key):null},
  setItem(key,value){data.set(key,String(value));writes.push(key)},
  removeItem(key){data.delete(key);writes.push(key)}
 };
}
test('Every app and game is free and old Life RP saves remain unchanged',()=>{
 const legacy={cash:2875,history:[{label:'Old purchase',delta:-100}],extras:{storePurchases:{games:['old.html'],apps:['wallpaper-editor']}}};
 const storage=memoryStorage({'lolite-life-rp-v1':JSON.stringify(legacy)});
 const calls=[],win={openApp(...args){calls.push(args);return 'opened'}};
 vm.runInNewContext(read('core/economy-store.js'),{window:win,localStorage:storage});
 const e=win.LoliteEconomy;
 for(const id of ['wallpaper-editor','lowlight-ai','focus','arcade','music','paint','calculator','clips']){
  assert.equal(e.appPrice(id),0,id);
  assert.equal(e.hasApp(id),true,id);
  assert.equal(e.buyApp(id).spent,0,id);
 }
 assert.equal(e.gamePrice({file:'vice-city.html'}),0);
 assert.equal(e.hasGame({file:'vice-city.html'}),true);
 assert.equal(e.buyGame({file:'vice-city.html'}).spent,0);
 assert.equal(win.openApp('wallpaper-editor','Wallpaper Editor',900,650),'opened');
 assert.equal(calls[0][0],'wallpaper-editor');
 assert.deepEqual(storage.writes,[]);
 assert.deepEqual(JSON.parse(storage.getItem('lolite-life-rp-v1')),legacy);
 assert.equal(e.purchasedGames()[0],'old.html');
});
test('App Store lists only FREE apps and installs formerly paid ones directly',()=>{
 const storage=memoryStorage({'loliteInstalledApps':'["music"]'});
 const opened=[],toasts=[],input={value:'',addEventListener(){}},grid={innerHTML:''};
 const tabs={addEventListener(){},querySelectorAll(){return []}};
 const root={innerHTML:'',querySelector(sel){return sel==='.appstore-tabs'?tabs:null}};
 const doc={head:{appendChild(){}},createElement:()=>({textContent:''}),
  querySelector:sel=>sel==='.appstore'?root:null,
  getElementById:id=>id==='appStoreSearch'?input:id==='appStoreGrid'?grid:null};
 const win={page:id=>'base:'+id,renderIcons(){},LoliteIcons:{tile:id=>'<span>'+id+'</span>'}};
 const openApp=(...args)=>{opened.push(args);return args[0]};
 vm.runInNewContext(read('core/app-store.js'),{window:win,document:doc,localStorage:storage,
  openApp,toast:message=>toasts.push(message),confirm:()=>true,setTimeout:fn=>{fn();return 1}});
 assert.match(win.page('appstore'),/appstore/);
 assert.match(root.innerHTML,/All Lolite apps are free/);
 assert.doesNotMatch(root.innerHTML,/Lolite Dollars|Paid|wallet|purchase/i);
 assert.match(grid.innerHTML,/Wallpaper Editor/);
 assert.match(grid.innerHTML,/Lolite AI/);
 assert.match(grid.innerHTML,/<span class="appstore-free">FREE<\/span>/);
 assert.doesNotMatch(grid.innerHTML,/LOLITE DOLLARS|OWNED|Buy/);
 win.loliteInstallApp('lowlight-ai');
 assert.ok(JSON.parse(storage.getItem('loliteInstalledApps')).includes('lowlight-ai'));
 win.loliteOpenApp('lowlight-ai');
 assert.equal(opened.at(-1)[0],'lowlight-ai');
 win.loliteBuyApp('wallpaper-editor');
 assert.ok(JSON.parse(storage.getItem('loliteInstalledApps')).includes('wallpaper-editor'));
 assert.equal(toasts.some(t=>/money|purchase|wallet|buy/i.test(t)),false);
});
test('Academy Quests never award RP money; Focus Board and Arcade Shelf are free',()=>{
 const initial={name:'Resident',cash:4444,history:[{label:'RP activity',delta:50}],extras:{}};
 const storage=memoryStorage({'lolite-life-rp-v1':JSON.stringify(initial)});
 const root={innerHTML:''};
 const doc={head:{appendChild(){}},createElement:()=>({textContent:''}),
  querySelector:s=>s.includes('#lq-root')?root:null,addEventListener(){},getElementById:()=>null};
 const opened=[];
 const win={LoliteAcademyCourses:[{id:'course-a',title:'Course A',lessons:[{id:'intro'}]}],
  page:id=>id,renderIcons(){},addEventListener(){},openApp(...args){opened.push(args);return args[0]}};
 vm.runInNewContext(read('core/quests.js'),{window:win,document:doc,localStorage:storage,
  setTimeout:(fn,ms)=>{if(ms===65||ms===0)fn();return 1},clearTimeout(){},setInterval(){},console});
 assert.equal(win.LoliteQuests.academyCompleted('course-a','intro'),true);
 const after=JSON.parse(storage.getItem('lolite-life-rp-v1'));
 assert.equal(after.cash,4444);
 assert.deepEqual(after.history,initial.history);
 assert.deepEqual(Array.from(after.extras.osQuests.lessons),['course-a:intro']);
 assert.deepEqual(Array.from(after.extras.osQuests.courses),['course-a']);
 assert.doesNotMatch(root.innerHTML,/Lolite Money|Lolite Dollars|wallet|paid/i);
 win.LoliteQuests.openView('focus');
 assert.match(root.innerHTML,/What will you build next/);
 win.LoliteQuests.openView('arcade');
 assert.match(root.innerHTML,/Pong Shortcut/);
 assert.equal(win.LoliteWallet,undefined);
 assert.equal(win.LoliteQuests.getBalance,undefined);
});
test('Game Store has no paid branch and pages load updated free-store scripts',()=>{
 const games=read('core/game-store.js'),news=read('core/whats-new.js');
 const store=read('core/app-store.js'),html=read('index.html');
 assert.match(games,/window\.loliteStoreAction=file=>/);
 assert.match(games,/window\.loliteStorePlay\(file\)/);
 assert.doesNotMatch(games,/Lolite Dollars|Buy for|Purchased .*My Library/);
 assert.doesNotMatch(store,/Lolite Dollars|Browse free apps or buy premium|appstore-wallet/);
 assert.match(news,/RETIRED_STORE_NOTES/);
 assert.match(news,/All Lolite Apps Are Free/);
 for(const name of ['core/app-store.js','core/economy-store.js','core/quests.js','core/game-store.js','core/whats-new.js'])
  assert.ok(html.includes(name+'?v=free-os-20261118'),name+' must be cache-busted');
});
