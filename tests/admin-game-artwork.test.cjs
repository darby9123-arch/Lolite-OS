const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {File}=require('node:buffer');

const adminCode=fs.readFileSync('core/lolite-admin.js','utf8');
const storeCode=fs.readFileSync('core/game-store.js','utf8');
const htmlCode=fs.readFileSync('index.html','utf8');
function harness(failOn=''){
 const hooks={},uploads=[],removed=[],saved=[];
 const uid='12345678-1234-4321-9999-123456789000';
 const base='https://example.supabase.co/storage/v1/object/public/lolite-admin-media/';
 const sb={
  storage:{from(bucket){
   assert.equal(bucket,'lolite-admin-media');
   return {
    upload:async(path,file,options)=>{
     uploads.push({path,file,options});
     return failOn&&path.endsWith(failOn)?{error:{message:'simulated storage failure'}}:{error:null};
    },
    getPublicUrl:path=>({data:{publicUrl:base+path}}),
    remove:async(paths)=>{removed.push(...paths);return {error:null}}
   };
  }},
  from(table){
   if(table==='lolite_admins')return {select:()=>({eq:()=>({maybeSingle:async()=>({data:{user_id:uid},error:null})})})};
   if(table==='lolite_library_items')return {
    insert:record=>({select:()=>({single:async()=>{
     saved.push(record);return {data:{id:'b0e27ea1-640a-4f42-8722-e147bd0a527b'},error:null};
    }})}),
    select:()=>({order:()=>({limit:async()=>({data:[],error:null})})})
   };
   throw Error('Unexpected table '+table);
  },
  auth:{getUser:async()=>({data:{user:{id:uid}},error:null})}
 };
 const doc={
  readyState:'loading',
  querySelector:()=>null,
  addEventListener:(name,cb)=>{hooks[name]=cb}
 };
 const win={
  LoliteBrowserAccounts:{getClient:()=>sb},
  toast:()=>{},
  page:()=>'',dispatchEvent:()=>{}
 };
 vm.runInNewContext(adminCode,{
  window:win,document:doc,console,
  URL,Uint8Array,Date,crypto:{randomUUID:()=>uid},
  setTimeout,clearTimeout,CustomEvent:class{constructor(){}}
 },{filename:'lolite-admin.js',timeout:2500});
 const htmlFile=new File(['<html><body><canvas></canvas></body></html>'],'play.html',{type:'text/html'});
 const png=new File([Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0])],'icon.png',{type:'image/png'});
 const webp=new File([Buffer.from('RIFFxxxxWEBPmoredata')],'background.webp',{type:'image/webp'});
 const button={disabled:false,isConnected:true};
 let resets=0;
 const form={
  elements:{kind:{value:'game'},title:{value:'Test Game'},url:{value:''},
   icon:{files:[png]},background:{files:[webp]}},
  querySelector:selector=>selector==='input[name="file"]'?{files:[htmlFile]}:selector==='[type="submit"]'?button:null,
  reset:()=>{resets++}
 };
 const evt={target:{closest:selector=>selector==='form[data-la-form]'?form:null},preventDefault(){}};
 return {win,hooks,uploads,removed,saved,form,evt,get resets(){return resets}};
}
test('Admin publisher offers separate optional game icon and background with previews',()=>{
 assert.doesNotThrow(()=>new Function(adminCode));
 assert.doesNotThrow(()=>new Function(storeCode));
 assert.match(adminCode,/data-la-game-artwork="icon"/);
 assert.match(adminCode,/data-la-game-artwork="background"/);
 assert.match(adminCode,/data-la-art-preview/);
 assert.match(adminCode,/icon_url,background_url/);
 assert.match(adminCode,/gameArtworkPath/);
 assert.match(storeCode,/adminGameArtwork\.set/);
 assert.match(storeCode,/store-uploaded-game-icon/);
 assert.match(storeCode,/store-detail-icon/);
 assert.match(storeCode,/adminGameArtwork\.get\(file\)\?\.background/);
 for(const path of ['core/lolite-admin.css?v=game-art-20261111','core/game-store.js?v=game-art-20261111',
  'core/game-store-gallery.css?v=game-art-20261111','core/lolite-admin.js?v=game-art-20261111'])assert.ok(htmlCode.includes(path),path);
});
test('Publishing a game saves its icon, background and HTML with separate public URLs',async()=>{
 const h=harness();
 await h.win.LoliteAdmin.syncRole();
 await h.hooks.submit(h.evt);
 assert.equal(h.uploads.length,3);
 assert.equal(h.saved.length,1);
 assert.equal(h.resets,1);
 assert.equal(h.saved[0].kind,'game');
 assert.ok(h.saved[0].icon_url.endsWith('-icon.png'));
 assert.ok(h.saved[0].background_url.endsWith('-background.webp'));
 assert.ok(h.saved[0].url.endsWith('.html'));
 assert.deepEqual(h.uploads.map(a=>a.options.contentType),['text/html','image/png','image/webp']);
 assert.deepEqual(h.removed,[]);
});
test('Failed background upload cleans the previously uploaded HTML and icon',async()=>{
 const h=harness('-background.webp');
 await h.win.LoliteAdmin.syncRole();
 await h.hooks.submit(h.evt);
 assert.equal(h.saved.length,0);
 assert.equal(h.uploads.length,3);
 assert.equal(h.removed.length,2);
 assert.ok(h.removed.some(x=>x.endsWith('.html')));
 assert.ok(h.removed.some(x=>x.endsWith('-icon.png')));
});
