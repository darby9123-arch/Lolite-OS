const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const USER='11111111-1111-1111-1111-111111111111';
const OTHER='22222222-2222-2222-2222-222222222222';
const IDEA='33333333-3333-3333-3333-333333333333';
function harness({signedIn=true,admin=false,requests=[],votes=[]}={}){
 const element={innerHTML:'',querySelector:()=>null};
 const listeners={};
 const calls=[];
 const client={
  auth:{
   getUser:async()=>({data:{user:signedIn?{id:USER}:null},error:null}),
   onAuthStateChange(){}
  },
  from(name){
   const query={
    select(){return this},
    eq(){return this},
    order(){return this},
    limit(){return Promise.resolve({data:name==='lolite_feature_requests'?requests:name==='lolite_feature_votes'?votes:[],error:null})},
    maybeSingle(){return Promise.resolve({data:admin?{user_id:USER}:null,error:null})},
    insert(row){calls.push({table:name,operation:'insert',row});return Promise.resolve({data:null,error:null})},
    update(row){calls.push({table:name,operation:'update',row});return this},
    delete(){calls.push({table:name,operation:'delete'});return this}
   };
   return query;
  }
 };
 const opened=[];
 const win={page:id=>'<div>'+id+'</div>',openApp:(...args)=>opened.push(args),
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
 return {win,element,listeners,opened,calls};
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
 assert.match(store,/basics=new Set\(\['academy','life-rp','lolite-quests','music','feature-requests'\]\)/);
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
