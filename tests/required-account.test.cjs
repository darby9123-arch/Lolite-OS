const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=path=>fs.readFileSync(path,'utf8');

function desktopHarness({deviceId='guest',auto=false,guestHandoff=false}={}){
 const memory=new Map(),session=new Map(),handlers={},events={},screen={attrs:new Set()};
 if(guestHandoff)session.set('lolite-guest-handoff','1');
 const device={get:key=>memory.get(key)||null,set:(key,value)=>memory.set(key,String(value)),
  remove:key=>memory.delete(key)};
 device.set('auto',auto);
 let dialog;
 function makeDialog(){
  return {open:false,innerHTML:'',addEventListener(){},showModal(){this.open=true},
   close(){this.open=false},remove(){dialog=undefined}};
 }
 const rootClasses=new Set(['lolite-account-locked']);
 const document={body:{append(node){dialog=node}},documentElement:{classList:{
  add:x=>rootClasses.add(x),remove:x=>rootClasses.delete(x),contains:x=>rootClasses.has(x)}},
  createElement:()=>makeDialog(),
  querySelector:selector=>selector==='#loliteLogin'?dialog:
    selector==='#desktop'?{setAttribute:name=>screen.attrs.add(name),removeAttribute:name=>screen.attrs.delete(name)}:
    null,
  addEventListener:(name,callback)=>{(events[name]??=[]).push(callback)}
 };
 const sessionStorage={getItem:key=>session.get(key)||null,
  setItem:(key,value)=>session.set(key,String(value)),removeItem:key=>session.delete(key)};
 let reloads=0;
 const auth={onAuthStateChange(){},getUser:async()=>({data:{user:null}}),
  getSession:async()=>({data:{session:null}}),signOut:async()=>({}),
  signInWithPassword:async()=>({error:{message:'Bad credentials'}})};
 const client={auth};
 const window={LoliteAccountStorage:{id:deviceId,device},supabase:{createClient:()=>client},
  addEventListener:(name,handler)=>{handlers[name]=handler},
  dispatchEvent(){}};
 const ctx={window,document,localStorage:{getItem:()=>null},sessionStorage,
  location:{reload:()=>reloads++},MutationObserver:class{observe(){}},
  CustomEvent:class{},setTimeout:fn=>{return 1},clearTimeout(){},console};
 vm.runInNewContext(read('core/accounts.js'),ctx,{timeout:2500});
 return {window,document,session,memory,client,rootClasses,
  get dialog(){return dialog},get reloads(){return reloads},screen,handlers,events};
}
test('Mandatory account login keeps desktop inert and has no guest escape',()=>{
 const h=desktopHarness();
 assert.equal(h.window.LoliteAccounts.isReady(),false);
 assert.equal(h.dialog.open,true);
 assert.equal(h.screen.attrs.has('inert'),true);
 assert.equal(h.rootClasses.has('lolite-account-locked'),true);
 assert.match(h.dialog.innerHTML,/Create an account/);
 assert.match(h.dialog.innerHTML,/Lolite account is required/);
 assert.doesNotMatch(h.dialog.innerHTML,/data-account-guest/);
 assert.doesNotMatch(h.dialog.innerHTML,/Continue as guest/);
});
test('Legacy guest handoff cannot enter desktop after upgrading',()=>{
 const h=desktopHarness({guestHandoff:true});
 assert.equal(h.window.LoliteAccounts.isReady(),false);
 assert.equal(h.dialog.open,true);
 assert.equal(h.session.has('lolite-guest-handoff'),false);
});
test('Account switching or signing out sends user to login instead of guest mode',async()=>{
 const h=desktopHarness({auto:true});
 await h.window.LoliteAccounts.signOut();
 assert.equal(h.reloads,1);
 assert.equal(h.memory.get('account'),'guest');
 assert.equal(h.memory.get('auto'),'false');
 assert.equal(h.session.has('lolite-guest-handoff'),false);
});
test('Account sign-in form uses existing Lolite Chat identities',()=>{
 const script=read('core/accounts.js');
 assert.match(script,/@accounts\.lolite\.chat/);
 assert.match(script,/client\.functions\.invoke\('lolite-account'/);
 assert.match(script,/if\(!user\|\|!profile\)return;ready=true;document\.querySelector\('#loliteLogin'\)/);
 assert.match(script,/if\(!session\?\.user\)throw Error/);
});
test('Window manager blocks opening apps before account is ready',()=>{
 const script=read('core/window-manager.js');
 assert.match(script,/classList\?\.contains\?\.\('lolite-account-locked'\)/);
 assert.match(script,/window\.LoliteAccounts&&!window\.LoliteAccounts\.isReady\(\)/);
 assert.match(script,/window\.LoliteAccounts\?\.showLogin\?\.\(\);return null/);
});
test('Public splash starts locked; old guest storage is preserved, not silently deleted',()=>{
 const html=read('index.html'),scoped=read('core/account-storage.js');
 assert.match(html,/<html class="lolite-account-locked"/);
 assert.match(html,/core\/accounts\.js\?v=/);
 assert.match(html,/core\/accounts\.css\?v=/);
 assert.match(scoped,/Old guest data stays in place/);
 assert.match(scoped,/device\.get\('account'\)\|\|'guest'/);
});
