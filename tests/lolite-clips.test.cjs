const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const pause=()=>new Promise(resolve=>setImmediate(resolve));

function harness({captureSupported=true}={}){
 const listeners={},saved=new Map(),elements=new Map(),messages=[];
 const root={innerHTML:'',querySelector:()=>null};
 const storage=new Map(),browser={page:()=>'<div>Existing app</div>',openApp(){},toast:message=>messages.push(message)};
 let captures=0,recorderCount=0,lastRecorder=null;
 const track={readyState:'live',addEventListener(){},stop(){this.readyState='ended'}};
 const stream={getTracks:()=>[track],getVideoTracks:()=>[track]};
 const document={
  body:{appendChild(x){if(x.id)elements.set(x.id,x)}},
  getElementById(id){return id==='lcRoot'?root:elements.get(id)||null},
  querySelector(q){return q.includes('#lcRoot')?root:null},
  addEventListener(name,fn){(listeners[name]??=[]).push(fn)},
  createElement(){return {hidden:true,id:'',textContent:'',className:'',title:'',
   setAttribute(){},addEventListener(){},appendChild(){},click(){},remove(){}}},
 };
 class MockRecorder{
  static isTypeSupported(t){return t.includes('webm')}
  constructor(s,options){this.stream=s;this.mimeType=options.mimeType;this.state='inactive';this.handlers={};
   lastRecorder=this;recorderCount++}
  addEventListener(name,cb){(this.handlers[name]??=[]).push(cb)}
  emit(name,event){for(const f of this.handlers[name]||[])f(event)}
  start(){this.state='recording'}
  stop(){this.state='inactive';this.emit('dataavailable',{data:new Blob(['test game clip'],{type:'video/webm'})});this.emit('stop',{})}
 }
 const indexedDB={
  open(){const req={result:{
   objectStoreNames:{contains:()=>true},
   transaction(){const tx={
    objectStore(){return {
     getAll(){const r={};queueMicrotask(()=>{r.result=[...saved.values()];r.onsuccess();queueMicrotask(()=>tx.oncomplete())});return r},
     put(item){const r={};queueMicrotask(()=>{saved.set(item.id,item);r.result=item.id;r.onsuccess();queueMicrotask(()=>tx.oncomplete())});return r},
     delete(id){const r={};queueMicrotask(()=>{saved.delete(id);r.onsuccess();queueMicrotask(()=>tx.oncomplete())});return r}
    }}
   };return tx},
   close(){}
  }};queueMicrotask(()=>req.onsuccess());return req}
 };
 const objURLs=new Map(),url={createObjectURL(blob){const name='blob:clip-'+(objURLs.size+1);objURLs.set(name,blob);return name},revokeObjectURL(name){objURLs.delete(name)}};
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 let timeoutId=1;
 vm.runInNewContext(read('core/clips.js'),{
  window:Object.assign(browser,{indexedDB}),document,
  navigator:{mediaDevices:{getDisplayMedia:async()=>{captures++;return stream}}},
  MediaRecorder:captureSupported?MockRecorder:undefined,Blob,URL:url,console,Date,Math,Promise,Set,Map,Number,
  localStorage,indexedDB,crypto:{randomUUID:()=> 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'},
  setTimeout:(fn,ms)=>{const id=timeoutId++;if(ms===0)queueMicrotask(fn);return id},
  setInterval:()=>1,clearTimeout(){},clearInterval(){},confirm:()=>true
 },{timeout:2000});
 function key({inInput=false}={}){
  let prevented=false;
  const event={repeat:false,altKey:true,shiftKey:true,ctrlKey:false,code:'KeyC',
   target:{closest:()=>inInput?{}:null},preventDefault(){prevented=true}};
  for(const handler of listeners.keydown||[])handler(event);
  return prevented;
 }
 return {browser,root,saved,key,get captures(){return captures},get recorderCount(){return recorderCount},
  get recorder(){return lastRecorder},track,messages};
}

test('A new Lolite Clips app mounts without asking for capture permission',async()=>{
 const h=harness();
 assert.equal(h.captures,0);
 assert.match(h.browser.page('clips'),/id="lcRoot"/);
 await pause();
 assert.match(h.root.innerHTML,/Lolite Clips/);
 assert.match(h.root.innerHTML,/My Clips/);
 assert.equal(h.captures,0);
 assert.equal(h.browser.LoliteClips.status().recording,false);
});

test('Alt+Shift+C triggers an explicit browser capture and starts the recorder',async()=>{
 const h=harness();
 h.browser.page('clips');await pause();
 assert.equal(h.key(),true);await pause();
 assert.equal(h.captures,1);
 assert.equal(h.recorderCount,1);
 assert.equal(h.browser.LoliteClips.status().recording,true);
 assert.equal(h.recorder.state,'recording');
 assert.match(h.root.innerHTML,/Stop & save clip/);
});

test('The keybind stops a clip and saves a playable local Blob',async()=>{
 const h=harness();
 h.browser.page('clips');await pause();
 h.key();await pause();h.key();await pause();await pause();
 assert.equal(h.browser.LoliteClips.status().recording,false);
 assert.equal(h.saved.size,1);
 const clip=[...h.saved.values()][0];
 assert.ok(clip.blob instanceof Blob);
 assert.equal(clip.mimeType,'video/webm');
 assert.ok(clip.bytes>0);
 assert.match(h.root.innerHTML,/My Clips/);
 assert.match(h.root.innerHTML,/Download/);
 assert.match(h.root.innerHTML,/Share/);
 assert.match(h.root.innerHTML,/Delete/);
 assert.equal(h.captures,1);
});

test('Typing in form controls never accidentally starts recording',async()=>{
 const h=harness();h.browser.page('clips');await pause();
 assert.equal(h.key({inInput:true}),false);
 await pause();assert.equal(h.captures,0);
});

test('Unsupported browsers display an explanation rather than silently recording',async()=>{
 const h=harness({captureSupported:false});
 h.browser.page('clips');await pause();
 h.key();await pause();
 assert.equal(h.captures,0);
 assert.ok(h.messages.some(m=>/Screen capture requires a supported HTTPS browser/.test(m)));
});

test('Game capture and cloud sharing are opt-in and do not post private clips automatically',()=>{
 const code=read('core/clips.js');
 for(const marker of ['navigator.mediaDevices.getDisplayMedia','new MediaRecorder','indexedDB.open',
  "form.elements.confirm.checked","status:'pending'","createSignedUrl(r.storage_path,900)",
  'if(!S.user)','data-lc-action="share"','data-lc-action="stop-capture"'])
  assert.ok(code.includes(marker),'Missing '+marker);
 assert.doesNotMatch(code,/service_role|sb_secret_/);
 assert.match(code,/does <strong>not<\/strong> retroactively capture gameplay/);
});

test('Lolite Clips is available on desktop, Cosmos, modern Start, and App Store',()=>{
 assert.match(read('app.js'),/app-clips','Lolite Clips','clips'/);
 assert.match(read('core/cosmos.js'),/clips','Lolite Clips'/);
 assert.match(read('core/interface.js'),/clips','Lolite Clips','Record, save and share gameplay'/);
 assert.match(read('core/app-store.js'),/id:'clips',name:'Lolite Clips'/);
 assert.match(read('core/app-icon-pngs.js'),/"clips":"video-editor"/);
 const html=read('index.html');
 assert.match(html,/core\/clips\.css/);
 assert.match(html,/core\/clips\.js/);
 assert.ok(html.indexOf('core/browser-accounts.js')<html.indexOf('core/clips.js'));
});

test('Cloud clips use protected, limited uploads and admin-only approval',()=>{
 const sql=read('supabase/migrations/20261112070000_lolite_clips.sql');
 assert.match(sql,/create table public\.lolite_clips/i);
 assert.match(sql,/alter table public\.lolite_clips enable row level security/i);
 assert.match(sql,/status='approved' or uploader_id=/);
 assert.match(sql,/uploader_id=\(select auth\.uid\(\)\) and status='pending'/);
 assert.match(sql,/clips admin moderation/);
 assert.match(sql,/bucket_id='lolite-clips'/);
 assert.match(sql,/values\('lolite-clips','lolite-clips',false,20971520/);
 assert.match(sql,/clips owner can unshare or admin remove/);
 assert.match(sql,/clips owner or admin delete upload/);
 assert.match(sql,/storage_path = uploader_id::text/);
});
