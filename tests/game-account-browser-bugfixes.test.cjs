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

const flush=()=>new Promise(resolve=>setImmediate(resolve));

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
