const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const USER='11111111-1111-1111-1111-111111111111';
const OTHER='22222222-2222-2222-2222-222222222222';
const IDEA='33333333-3333-3333-3333-333333333333';
function harness({signedIn=true,admin=false,requests=[],votes=[],replies=[]}={}){
 const element={innerHTML:'',querySelector:()=>null};
 const listeners={};
 const calls=[],uploads=[],notifications=[];
 const storage={
  from(bucket){
   return {
    async createSignedUrl(file,ttl){calls.push({operation:'sign',bucket,file,ttl});return {data:{signedUrl:'https://storage.example/view-proof.png?token=example'},error:null}},
    async upload(file,blob,options){uploads.push({bucket,file,blob,options});return {data:{path:file},error:null}},
    async remove(files){calls.push({operation:'remove',bucket,files});return {data:[],error:null}}
   };
  }
 };
 const client={
  storage,
  auth:{
   getUser:async()=>({data:{user:signedIn?{id:USER}:null},error:null}),
   onAuthStateChange(){}
  },
  from(name){
   const query={
    select(){return this},
    eq(){return this},
    order(){return this},
    limit(){return Promise.resolve({data:name==='lolite_feature_requests'?requests:name==='lolite_feature_votes'?votes:name==='lolite_feature_replies'?replies:[],error:null})},
    maybeSingle(){return Promise.resolve({data:admin?{user_id:USER}:null,error:null})},
    insert(row){
     calls.push({table:name,operation:'insert',row});
     if(name==='lolite_feature_replies'){
      replies.push({id:'44444444-4444-4444-4444-444444444444',created_at:new Date().toISOString(),...row});
      if(row.kind==='done'){
       const match=requests.find(r=>r.id===row.request_id);
       if(match)match.status='shipped';
      }
     }
     return Promise.resolve({data:null,error:null});
    },
    update(row){calls.push({table:name,operation:'update',row});return this},
    delete(){calls.push({table:name,operation:'delete'});return this}
   };
   return query;
  }
 };
 const opened=[];
 const win={page:id=>'<div>'+id+'</div>',openApp:(...args)=>opened.push(args),toast:msg=>notifications.push(msg),
  LoliteBrowserAccounts:{getClient:()=>client}};
 const doc={
  querySelector:selector=>selector.includes('#lfrRoot')?element:null,
  getElementById:id=>id==='lfrRoot'?element:null,
  addEventListener:(name,handler)=>{(listeners[name]??=[]).push(handler)}
 };
 vm.runInNewContext(read('core/feature-requests.js'),{
  window:win,document:doc,console,Date,Number,Set,Promise,CustomEvent:class{},
  setTimeout(){return 0}
 },{timeout:2000});
 return {win,element,listeners,opened,calls,uploads,notifications};
}
function idea(overrides={}){
 return {id:IDEA,submitted_by:OTHER,title:'Resizable desktop folders',description:'Allow desktop folders to be resized and arranged on a grid.',
  category:'UI & Themes',status:'open',admin_note:'',vote_count:7,created_at:'2026-11-11T00:00:00.000Z',
  updated_at:'2026-11-11T00:00:00.000Z',...overrides};
}
test('Feature Requests is a real in-window Lolite page and opens through the app API',async()=>{
 const h=harness({requests:[idea()]});
 assert.match(h.win.page('feature-requests'),/id="lfrRoot"/);
 assert.equal(h.win.page('home'),'<div>home</div>');
 await h.win.LoliteFeatureRequests.refresh();
 assert.match(h.element.innerHTML,/Resizable desktop folders/);
 assert.match(h.element.innerHTML,/data-lfr-action="vote"/);
 assert.match(h.element.innerHTML,/data-lfr-tab="suggest"/);
 h.win.LoliteFeatureRequests.open();
 assert.equal(h.opened[0][0],'feature-requests');
});
test('Users must sign in with existing Lolite Chat before submitting or voting',async()=>{
 const h=harness({signedIn:false});
 await h.win.LoliteFeatureRequests.refresh();
 assert.match(h.element.innerHTML,/Open Lolite Chat/);
 assert.doesNotMatch(h.element.innerHTML,/data-lfr-form="suggest"/);
});
test('Request titles and body text are escaped before rendering',async()=>{
 const h=harness({requests:[idea({title:'<img src=x onerror=alert(1)>',description:'<script>alert(1)</script>'})]});
 await h.win.LoliteFeatureRequests.refresh();
 assert.match(h.element.innerHTML,/&lt;img/);
 assert.match(h.element.innerHTML,/&lt;script&gt;/);
 assert.doesNotMatch(h.element.innerHTML,/<script>alert/);
});
test('Pending submissions are only shown to the owner or admin in the UI',async()=>{
 const h=harness({requests:[idea({status:'pending',submitted_by:USER})]});
 await h.win.LoliteFeatureRequests.refresh();
 assert.doesNotMatch(h.element.innerHTML,/Resizable desktop folders/);
 const tab={dataset:{lfrTab:'mine'},closest:s=>s==='#lfrRoot'||s==='[data-lfr-tab]'?tab:null};
 for(const handler of h.listeners.click||[])handler({target:tab});
 assert.match(h.element.innerHTML,/Awaiting review/);
 assert.match(h.element.innerHTML,/Your request/);
 assert.match(h.element.innerHTML,/disabled/);
});
test('Admin moderation controls are only rendered for an authorised admin',async()=>{
 const member=harness({requests:[idea()]});
 await member.win.LoliteFeatureRequests.refresh();
 assert.doesNotMatch(member.element.innerHTML,/data-lfr-tab="admin"/);
 const moderator=harness({admin:true,requests:[idea({status:'pending'})]});
 await moderator.win.LoliteFeatureRequests.refresh();
 assert.match(moderator.element.innerHTML,/data-lfr-tab="admin"/);
 const tab={dataset:{lfrTab:'admin'},closest:s=>s==='#lfrRoot'||s==='[data-lfr-tab]'?tab:null};
 for(const handler of moderator.listeners.click||[])handler({target:tab});
 assert.match(moderator.element.innerHTML,/data-lfr-action="moderate"/);
 assert.match(moderator.element.innerHTML,/Save status/);
});
test('App is registered with desktop, Cosmos, App Store and matching generated icon',()=>{
 const main=read('app.js'),cosmos=read('core/cosmos.js'),store=read('core/app-store.js'),shell=read('core/interface.js');
 const png=read('core/app-icon-pngs.js'),html=read('index.html');
 assert.match(main,/app-feature-requests','Feature Requests','feature-requests'/);
 assert.match(cosmos,/feature-requests','Feature Requests'/);
 assert.match(shell,/feature-requests','Feature Requests','Suggest new Lolite OS features/);
 assert.match(store,/id:'feature-requests',name:'Feature Requests'/);
 assert.match(store,/basics=new Set\(\['academy','life-rp','lolite-quests','music','feature-requests','clips'\]\)/);
 assert.match(png,/"feature-requests":"feedback"/);
 assert.match(html,/core\/feature-requests\.css/);
 assert.match(html,/core\/feature-requests\.js/);
 assert.ok(html.indexOf('core/browser-accounts.js')<html.indexOf('core/feature-requests.js'));
});
test('Database migration enables RLS, protects votes and limits updates to admins',()=>{
 const sql=read('supabase/migrations/20261111090000_lolite_feature_requests.sql');
 assert.match(sql,/alter table public\.lolite_feature_requests enable row level security/i);
 assert.match(sql,/alter table public\.lolite_feature_votes enable row level security/i);
 assert.match(sql,/primary key \(request_id,voter_id\)/);
 assert.match(sql,/submitted_by=\(select auth\.uid\(\)\) and status='pending'/);
 assert.match(sql,/feature requests admin updates only/);
 assert.match(sql,/grant update \(status,admin_note,updated_at\)/);
 assert.match(sql,/voter_id=\(select auth\.uid\(\)\)/);
 assert.match(sql,/create trigger lolite_feature_vote_tally_trigger/);
 assert.doesNotMatch(read('core/feature-requests.js'),/service_role|sb_secret_/);
});

test('Completed requests remain visible with an admin reply, screenshot and disabled voting',async()=>{
 const proof=IDEA+'/'+USER+'/demo-screenshot.png';
 const h=harness({
  requests:[idea({status:'shipped',vote_count:23})],
  votes:[{request_id:IDEA}],
  replies:[{
   id:'44444444-4444-4444-4444-444444444444',
   request_id:IDEA,author_id:USER,kind:'done',
   message:'Done! The folders now resize. <script>not HTML</script>',
   screenshot_path:proof,created_at:'2026-11-12T00:00:00.000Z'
  }]
 });
 await h.win.LoliteFeatureRequests.refresh();
 assert.match(h.element.innerHTML,/Resizable desktop folders/);
 assert.match(h.element.innerHTML,/lfr-status-shipped/);
 assert.match(h.element.innerHTML,/Voting closed/);
 assert.match(h.element.innerHTML,/aria-label="Voting closed for /);
 assert.match(h.element.innerHTML,/23<\/b>/);
 assert.match(h.element.innerHTML,/class="lfr-reply lfr-reply-done"/);
 assert.match(h.element.innerHTML,/class="lfr-proof-image"/);
 assert.match(h.element.innerHTML,/View screenshot full size/);
 assert.match(h.element.innerHTML,/&lt;script&gt;not HTML&lt;\/script&gt;/);
 assert.equal(h.calls.filter(x=>x.operation==='sign').length,1);
 const before=h.calls.filter(x=>x.table==='lolite_feature_votes').length;
 const button={dataset:{lfrAction:'vote',lfrId:IDEA}};
 const target={closest:s=>s==='#lfrRoot'?{}:s==='[data-lfr-action]'?button:null};
 for(const handler of h.listeners.click||[])handler({target});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.calls.filter(x=>x.table==='lolite_feature_votes').length,before);
});

test('Admin can post a Done reply with a private screenshot and complete a request',async()=>{
 const h=harness({admin:true,requests:[idea()]});
 await h.win.LoliteFeatureRequests.refresh();
 const tab={dataset:{lfrTab:'admin'},closest:s=>s==='#lfrRoot'||s==='[data-lfr-tab]'?tab:null};
 for(const handler of h.listeners.click||[])handler({target:tab});
 assert.match(h.element.innerHTML,/data-lfr-action="post-reply" data-lfr-kind="done"/);
 assert.match(h.element.innerHTML,/data-lfr-proof-file/);
 const screenshot={type:'image/png',name:'finished.png',size:2039};
 const panel={
  querySelector(selector){
   if(selector==='[data-lfr-reply-message]')return {value:'Done! New folders are working.'};
   if(selector==='[data-lfr-proof-file]')return {files:[screenshot]};
   return null;
  }
 };
 const button={dataset:{lfrAction:'post-reply',lfrKind:'done',lfrId:IDEA},disabled:false,isConnected:true,closest:()=>panel};
 const target={closest:s=>s==='#lfrRoot'?{}:s==='[data-lfr-action]'?button:null};
 for(const handler of h.listeners.click||[])handler({target});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.uploads.length,1);
 assert.equal(h.uploads[0].options.upsert,false);
 assert.match(h.uploads[0].file,/\.png$/);
 const posted=h.calls.find(x=>x.table==='lolite_feature_replies'&&x.operation==='insert');
 assert.ok(posted);
 assert.equal(posted.row.kind,'done');
 assert.equal(posted.row.request_id,IDEA);
 assert.equal(posted.row.screenshot_path,h.uploads[0].file);
 assert.match(h.element.innerHTML,/Voting closed/);
 assert.match(h.element.innerHTML,/New folders are working/);
 assert.match(h.element.innerHTML,/class="lfr-proof-image"/);
});

test('Ordinary users cannot see or activate admin reply controls',async()=>{
 const h=harness({requests:[idea()]});
 await h.win.LoliteFeatureRequests.refresh();
 assert.doesNotMatch(h.element.innerHTML,/Reply as admin/);
 assert.doesNotMatch(h.element.innerHTML,/data-lfr-action="post-reply"/);
 const button={dataset:{lfrAction:'post-reply',lfrKind:'done',lfrId:IDEA},closest:()=>({querySelector:()=>({value:'bad'})})};
 const target={closest:s=>s==='#lfrRoot'?{}:s==='[data-lfr-action]'?button:null};
 for(const handler of h.listeners.click||[])handler({target});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.calls.some(x=>x.table==='lolite_feature_replies'&&x.operation==='insert'),false);
 assert.equal(h.uploads.length,0);
});

test('Admin reply schema enforces RLS, private screenshots and closed voting on Done',()=>{
 const sql=read('supabase/migrations/20261112093000_lolite_feature_admin_replies.sql');
 assert.match(sql,/create table public\.lolite_feature_replies/i);
 assert.match(sql,/alter table public\.lolite_feature_replies enable row level security/i);
 assert.match(sql,/feature replies are admin-only/i);
 assert.match(sql,/author_id=\(select auth\.uid\(\)\)/i);
 assert.match(sql,/create trigger lolite_feature_reply_done_trigger/i);
 assert.match(sql,/set status='shipped'/i);
 assert.match(sql,/bucket_id='lolite-feature-proofs'/i);
 assert.match(sql,/values\('lolite-feature-proofs','lolite-feature-proofs',false,5242880/i);
 assert.match(sql,/feature voters remove own vote/i);
 assert.match(sql,/r\.status in \('open','planned','in_progress'\)/);
 assert.match(read('core/feature-requests.js'),/createSignedUrl\(r\.screenshot_path,3600\)/);
 assert.match(read('core/feature-requests.js'),/upload\(uploadedPath,file/);
 assert.match(read('core/feature-requests.js'),/VOTABLE=new Set\(\['open','planned','in_progress'\]\)/);
});
