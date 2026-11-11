const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=path=>fs.readFileSync(path,'utf8');

test('Ultraviolet and Scramjet wrappers preserve other app dimensions, titles and return values',()=>{
 const calls=[];
 const win={
  page:id=>'original:'+id,
  openApp(...args){calls.push(args);return {args};},
  LoliteIcons:{tile:()=>'<span>icon</span>'}
 };
 const doc={
  head:{appendChild(){}},
  documentElement:{},
  createElement:()=>({}),
  getElementById:()=>null
 };
 const sandbox={window:win,document:doc,MutationObserver:class{observe(){}},setTimeout(){},location:{href:'https://example.test/',search:''},URL,console};
 vm.runInNewContext(read('core/ultraviolet.js'),sandbox);
 vm.runInNewContext(read('core/scramjet-browser.js'),sandbox);
 const notes=win.openApp('notes','Notes');
 assert.deepEqual([...notes.args],['notes','Notes',undefined,undefined]);
 const custom=win.openApp('calculator','Calculator',430,570);
 assert.deepEqual([...custom.args],['calculator','Calculator',430,570]);
 const uv=win.openApp('browser');
 assert.deepEqual([...uv.args],['browser','Ultraviolet Browser',900,650]);
 const sj=win.openApp('scramjet');
 assert.deepEqual([...sj.args],['scramjet','Scramjet Browser',900,650]);
 assert.equal(calls.length,4);
});

function gameHarness(fetchFn){
 const html=read('html games/Grand Theft Auto Vice City.html');
 const part=html.split('<script>').find(x=>x.includes('const loadingText ='));
 assert.ok(part,'game-loader script should be present');
 const code=part.split('</script>')[0];
 const base=(html.match(/<base href="([^"]+)"/)||[])[1];
 assert.ok(base,'expected an external engine base URL');
 const scripts=[],notices=[];
 let removed=false,reloads=0;
 const loader={textContent:'LOADING...',remove(){removed=true},after(el){notices.push(el)}};
 const status={textContent:''},progress={max:0,value:0};
 const doc={
  baseURI:base,
  querySelector:sel=>sel==='#loading-text'?loader:null,
  getElementById:id=>id==='status'?status:id==='progress'?progress:null,
  createElement:tag=>({tagName:tag.toUpperCase(),style:{},children:[],append(...items){this.children.push(...items)},addEventListener(name,cb){this[name]=cb}}),
  body:{appendChild(el){scripts.push(el.src);el.onload?.()}}
 };
 const context={
  document:doc,
  window:{fetch:fetchFn},
  fetch:fetchFn,
  indexedDB:{open(){throw new Error('storage unavailable')}},
  XMLHttpRequest:class{open(){}},
  URL:class GameURL extends URL{static createObjectURL(){return 'blob:vicecity-test'}},
  Request:class{constructor(url){this.url=url}},
  Blob,
  Uint8Array,
  location:{reload(){reloads++}},
  console:{warn(){},error(){}}
 };
 vm.runInNewContext(code,context,{timeout:3000});
 return {loader,status,progress,scripts,notices,removed:()=>removed,reloads:()=>reloads};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('Vice City shows an actionable failure rather than hanging on a missing asset',async()=>{
 const h=gameHarness(async()=>({ok:false,status:503}));
 await flush();await flush();
 assert.match(h.loader.textContent,/Unable to start Vice City/);
 assert.equal(h.notices.length,1);
 assert.match(h.notices[0].children[0].textContent,/HTTP 503/);
 const retry=h.notices[0].children[1];
 assert.equal(retry.textContent,'Retry loading');
 retry.click();
 assert.equal(h.reloads(),1);
 assert.equal(h.removed(),false);
});

test('Vice City detects missing remote engine scripts before transferring large game data',async()=>{
 const calls=[];
 const h=gameHarness(async(url,options)=>{
  calls.push({url,method:options?.method||'GET'});
  if(options?.method==='HEAD')return {status:404,ok:false};
  throw new Error('Game data must not download if runtime files are missing');
 });
 await flush();await flush();
 assert.equal(calls.length,3,'only the three lightweight script checks should run');
 assert.ok(calls.every(call=>call.method==='HEAD'));
 assert.ok(calls.some(call=>call.url.endsWith('/gamepademulator.js')));
 assert.match(h.loader.textContent,/Unable to start Vice City/);
 assert.match(h.notices[0].children[0].textContent,/gamepademulator\.js \(HTTP 404\)/);
 const fallback=h.notices[0].children[3];
 assert.equal(fallback.tagName,'A');
 assert.equal(fallback.href,'https://joncodeofficial.github.io/gta-vice-city-wasm/');
 assert.equal(fallback.target,'_blank');
 assert.equal(fallback.rel,'noopener noreferrer');
 assert.match(h.notices[0].children[2].textContent,/your own legitimate copy/);
 assert.equal(h.removed(),false);
 assert.equal(h.scripts.length,0);
});

test('Vice City downloads assets, shows progress and loads its three scripts in order',async()=>{
 let requests=0;
 const h=gameHarness(async()=>{
  requests++;
  let used=false;
  return {ok:true,status:200,body:{getReader(){return {async read(){if(used)return {done:true};used=true;return {done:false,value:new Uint8Array([1,2,3])}}}}}};
 });
 await flush();await flush();
 assert.ok(requests>25,'all game-data parts should be attempted');
 assert.ok(h.progress.value>0,'downloaded bytes should be reported');
 assert.deepEqual(h.scripts,['gamepademulator.js','idbfs.js','game.js']);
 assert.equal(h.removed(),true);
 assert.equal(h.notices.length,0);
});

test('Unified account sign-out cannot remain stuck when auth cleanup fails',async()=>{
 const device=new Map([['lolite-device:auto','true']]);
 const storage={id:'guest',device:{get:k=>device.get('lolite-device:'+k)||null,set:(k,v)=>device.set('lolite-device:'+k,String(v)),remove:k=>device.delete('lolite-device:'+k)}};
 const session=new Map([['lolite-guest-handoff','1']]);
 const sessionStorage={getItem:k=>session.get(k)||null,setItem:(k,v)=>session.set(k,String(v)),removeItem:k=>session.delete(k)};
 const dialog={open:false,addEventListener(){},showModal(){this.open=true},close(){this.open=false},remove(){}};
 const dom={};
 const document={
  body:{append(){}},
  documentElement:{classList:{add(){},remove(){}}},
  createElement:()=>dialog,
  querySelector:selector=>selector==='#loliteLogin'?dom.login||null:selector==='#desktop'?{setAttribute(){},removeAttribute(){}}:null,
  addEventListener(){}
 };
 document.body.append=()=>{dom.login=dialog};
 let reloads=0;
 const auth={onAuthStateChange(){},async signOut(){throw Error('offline')},async getUser(){return {data:{user:null}}},async getSession(){return {data:{session:null}}}};
 const client={auth};
 const window={LoliteAccountStorage:storage,supabase:{createClient:()=>client},LoliteActivity:{async stop(){}},addEventListener(){},dispatchEvent(){}};
 const sandbox={window,document,sessionStorage,localStorage:{getItem:()=>null},location:{reload(){reloads++}},MutationObserver:class{observe(){}},CustomEvent:class{constructor(){}},setTimeout(){},clearTimeout(){},console:{warn(){}}};
 vm.runInNewContext(read('core/accounts.js'),sandbox);
 await flush();
 await window.LoliteAccounts.signOut();
 assert.equal(device.get('lolite-device:auto'),'false');
 assert.equal(device.get('lolite-device:account'),'guest');
 assert.equal(reloads,1);
});

test('Successful Chat profile edits update the shared account cache',()=>{
 const script=read('core/chat-v2.js');
 const update=script.indexOf("check(await sb.from('profiles').update({display_name:display");
 const sync=script.indexOf('window.LoliteAccounts?.refreshProfile?.({id:meId(),display_name:display,about,avatar,status})');
 assert.ok(update>=0);
 assert.ok(sync>update,'only a completed profile update should refresh the shared cache');
});
