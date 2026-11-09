const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function loadGameHealth(fetchImpl){
 const events=[],win={dispatchEvent:e=>events.push(e)},document={baseURI:'https://lolite.example/Lolite-OS/'};
 vm.runInNewContext(read('core/game-health.js'),{
  window:win,document,location:{origin:'https://lolite.example'},URL,
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},
  AbortController,setTimeout,clearTimeout,Date,Map,fetch:fetchImpl,console
 });
 return {api:win.LoliteGameHealth,events};
}
test('Game Store only hides entries confirmed missing (404 or 410), not offline or cross-origin',async()=>{
 const requested=[],h=loadGameHealth(async(url,opts)=>{
  requested.push({url,method:opts.method});
  if(url.includes('missing.html'))return {status:404,ok:false};
  if(url.includes('gone.html'))return {status:410,ok:false};
  if(url.includes('offline.html'))throw Error('Offline');
  return {status:200,ok:true};
 });
 await h.api.scan([
  {url:'html games/available.html'},{url:'html games/missing.html'},
  {url:'games/gone.html'},{url:'html games/offline.html'},
  {url:'https://external.example/game.html'},{url:'blob:https://lolite.example/thing'}
 ]);
 assert.equal(h.api.status({url:'html games/available.html'}),'ok');
 assert.equal(h.api.status({url:'html games/missing.html'}),'missing');
 assert.equal(h.api.status({url:'games/gone.html'}),'missing');
 assert.equal(h.api.status({url:'html games/offline.html'}),'unknown');
 assert.equal(h.api.status({url:'https://external.example/game.html'}),'unverified');
 assert.equal(requested.length,4,'External URLs and blob sources must never be probed');
 assert.ok(requested.every(x=>x.method==='HEAD'));
 assert.equal(h.api.summary().missing,2);
 assert.equal(h.events.at(-1).type,'lolite:gamehealthchange');
});
test('Failed HEAD checks are never reported as missing; game-player 404s can be recorded',async()=>{
 const h=loadGameHealth(async()=>({ok:false,status:405}));
 await h.api.scan([{url:'html games/not-supported.html'}]);
 assert.equal(h.api.status({url:'html games/not-supported.html'}),'unknown');
 h.api.markHttpError('html games/not-supported.html',404);
 assert.equal(h.api.isUnavailable({url:'html games/not-supported.html'}),true);
 h.api.markHttpError('https://elsewhere.example/foo',404);
 assert.equal(h.api.summary().missing,1);
});
test('4.0 Spotlight ranks installed apps and repository games with text search',()=>{
 const win={
  addEventListener(){},
  LoliteDesktopShell:{apps:[['files','Files','Folders and documents'],['games','Game Store','Play games'],['settings','Settings','Preferences']]},
  LoliteGameSearch:q=>q.includes('slope')?[{file:'slope.html',title:'Slope',category:'Arcade',unlocked:true}]:[]
 };
 const document={readyState:'loading',addEventListener(){}};
 const localStorage={getItem:()=>null};
 vm.runInNewContext(read('core/spotlight.js'),{window:win,document,localStorage,console,Date,Array});
 let list=win.LoliteSpotlight.search('slope');
 assert.equal(list.length,1);
 assert.equal(list[0].id,'game:slope.html');
 list=win.LoliteSpotlight.search('files');
 assert.equal(list[0].id,'app:files');
 assert.equal(list[0].label,'Files');
});
test('Spotlight actually opens IndexedDB files with the native viewer',async()=>{
 const opened=[],launched=[],notices=[];
 const win={
  addEventListener(){},
  LoliteDesktopShell:{apps:[['files','Files','Browse files']],launch:id=>launched.push(id)},
  LoliteViewers:{open:async row=>opened.push(row.path)},
  toast:msg=>notices.push(msg)
 };
 const document={readyState:'loading',addEventListener(){}};
 vm.runInNewContext(read('core/spotlight.js'),{
  window:win,document,localStorage:{getItem:()=>null},console,Date,Array,Blob
 });
 const row={path:'Documents/homework.txt',data:new Blob(['hello'])};
 assert.equal(await win.LoliteSpotlight.openFile(row),true);
 assert.deepEqual(opened,['Documents/homework.txt']);
 assert.deepEqual(launched,['files']);
 assert.deepEqual(notices,[]);
 assert.equal(await win.LoliteSpotlight.openFile({path:'Documents/',data:new Blob([])}),true);
 assert.deepEqual(opened,['Documents/homework.txt']);
});
test('Host status distinguishes current, outdated and unverifiable deployments',async()=>{
 const sha='a'.repeat(40),stale='b'.repeat(40),win={},urls=[];
 const fetch=async(url)=>{
  urls.push(url);
  return {ok:true,json:async()=>{
   if(url.includes('api.github.com'))return {sha};
   if(url.includes('github.io'))return {ok:true,commit:sha};
   if(url.includes('railway.app'))return {ok:true,commit:stale};
   return {ok:true,commit:null};
  }};
 };
 vm.runInNewContext(read('core/host-status.js'),{
  window:win,document:{addEventListener(){}},fetch,AbortController,
  setTimeout,clearTimeout,Date,console
 });
 const results=await win.LoliteHostStatus.check();
 assert.equal(results.length,5);
 assert.equal(results.find(x=>x.id==='pages').status,'current');
 assert.equal(results.find(x=>x.id==='railway').status,'outdated');
 assert.equal(results.find(x=>x.id==='vercel').status,'online');
 assert.ok(urls.every(u=>u.startsWith('https://')));
});
test('Taskbar has opt-in notification badges and exposes safe context controls',()=>{
 const win={},document={readyState:'loading',addEventListener(){},querySelectorAll:()=>[]};
 vm.runInNewContext(read('core/taskbar-enhancements.js'),{window:win,document,console});
 assert.equal(typeof win.LoliteTaskbar4.badge,'function');
 assert.equal(typeof win.LoliteTaskbar4.preview,'function');
 assert.match(read('core/interface.js'),/getPins:\(\)=>\[\.\.\.pins\]/);
 assert.match(read('core/interface.js'),/function unpin\(id\)/);
 assert.match(read('core/window-manager.js'),/savedLayouts:\(\)=>\(\{\.\.\.savedLayouts\}\)/);
});
test('4.0 is wired into the actual website, not just disconnected scripts',()=>{
 const html=read('index.html');
 const ordered=['core/game-health.js','core/game-store.js','core/host-status.js','core/spotlight.js','core/taskbar-enhancements.js'];
 for(const file of ordered)assert.match(html,new RegExp(file.replace(/\./g,'\\.')+'\\?v=4\\.0\\.0'));
 assert.ok(html.indexOf('core/game-health.js')<html.indexOf('core/game-store.js'));
 assert.ok(html.indexOf('core/host-status.js')<html.indexOf('core/spotlight.js'));
 assert.match(html,/core\/lolite-4\.css/);
 assert.match(read('core/game-store.js'),/healthy\(games\)/);
 assert.match(read('core/game-store.js'),/window\.LoliteGameSearch=/);
 const pages=read('.github/workflows/deploy-pages.yml');
 assert.match(pages,/core\/lolite-build\.json/);
 assert.match(read('server.mjs'),/RAILWAY_GIT_COMMIT_SHA/);
 assert.match(read('.github/workflows/desktop-windows.yml'),/identical checksums and source commit/);
});
