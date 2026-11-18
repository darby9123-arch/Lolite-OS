/* Lolite safe one-time surprises and Classroom Pause: functional regression tests. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const admin=read('core/lolite-admin-accounts.js');
const notices=read('core/lolite-account-notices.js');
const accounts=read('core/accounts.js');
const index=read('index.html');
const sql=read('supabase/migrations/20261118120900_lolite_safe_one_time_surprises.sql');
const member='00000000-0000-4000-8000-000000000002';
const owner='00000000-0000-4000-8000-000000000001';
function adminHarness({adminRole=true,targetAdmin=false}={}){
 const listeners={},calls=[],who={id:member,username:'sample_member',display_name:'Member',created_at:'2026-11-18T00:00:00Z'};
 const rows={profiles:[who],lolite_account_moderation:[],lolite_admins:[{user_id:owner},...(targetAdmin?[{user_id:member}]:[])],lolite_moderation_audit:[]};
 const client={auth:{async getUser(){return {data:{user:{id:owner}}}}},
  from(table){
   const result={data:rows[table]||[],count:(rows[table]||[]).length,error:null};
   const q={select(){return q},order(){return q},limit(){return Promise.resolve(result)},range(){return Promise.resolve(result)}};
   return q;
  },
  async rpc(name,params){calls.push({name,params});return {data:{ok:true},error:null}}
 };
 const win={LoliteAdmin:{isAdmin:()=>adminRole},LoliteBrowserAccounts:{getClient:()=>client},confirm:()=>true};
 const doc={querySelector:()=>null,addEventListener(type,fn){(listeners[type]??=[]).push(fn)}};
 vm.runInNewContext(admin,{window:win,document:doc,console,Map,Set,Date,Math,String,Number,JSON},{timeout:2000});
 function click(kind){
  const el={
   dataset:{lamUser:member},disabled:false,isConnected:true,
   closest(selector){return selector==='[data-lam-root]'||selector.includes('data-lam-user')?this:null},
   matches(selector){return kind==='select'?selector==='[data-lam-user]':
    kind==='surprise'?selector==='[data-lam-surprise]':
    kind==='preview'?selector==='[data-lam-preview-surprise]':
    selector==='[data-lam-classroom-pause]'}
  };
  for(const fn of listeners.click||[])fn({target:el});
 }
 return {api:win.LoliteAdminAccounts,click,calls};
}
function noticeHarness({kind='surprise',fullscreen=false,recording=false}={}){
 const listeners={},nodes=[],timers=[],dbCalls=[],client={
  from(table){
   assert.equal(table,'lolite_account_notices');
   return {
    select(){return this},eq(){return this},is(){return this},order(){return this},
    limit(){return Promise.resolve({data:[{id:12,kind,message:'A little surprise from Lolite'}],error:null})},
    update(row){dbCalls.push(row);return this},then(resolve){resolve({error:null})}
   };
  }
 };
 const doc={
  hidden:false,fullscreenElement:fullscreen?{}:null,
  querySelector:selector=>recording&&selector.startsWith('#loliteClipCaptureStatus')?{}:null,
  addEventListener(type,fn){(listeners[type]??=[]).push(fn)},
  createElement(){
   return {innerHTML:'',id:'',className:'',removed:false,attributes:{},
    setAttribute(name,value){this.attributes[name]=value},
    querySelector(selector){return selector==='[data-lan-dismiss]'?{focus(){}}:null},
    remove(){this.removed=true}
   }
  },
  body:{appendChild(node){nodes.push(node)}}
 };
 const win={
  LoliteAccounts:{isReady:()=>true,getUser:()=>({id:member}),getClient:()=>client},
  addEventListener(type,fn){(listeners[type]??=[]).push(fn)},
  open(){throw Error('User must not be automatically redirected')}
 };
 vm.runInNewContext(notices,{
  window:win,document:doc,setInterval(){},setTimeout(fn,ms){timers.push({fn,ms});return timers.length},
  clearTimeout(){},Date,console,URL
 },{timeout:2000});
 return {api:win.LoliteAccountNotices,nodes,timers,dbCalls,listeners};
}
test('Admin Center includes a one-time surprise action, separate from real moderation',async()=>{
 const h=adminHarness();
 await h.api.refresh();
 h.click('select');
 assert.match(h.api.markup(),/data-lam-surprise/);
 assert.match(h.api.markup(),/data-lam-classroom-pause/);
 assert.match(h.api.markup(),/Pause for 45 minutes/);
 h.click('surprise');
 for(let i=0;i<22;i++)await Promise.resolve();
 assert.equal(h.calls.length,1);
 assert.equal(h.calls[0].name,'lolite_admin_send_surprise');
 assert.equal(h.calls[0].params.p_target,member);
});
test('Only account roles approved by server can request surprise and protected admins cannot be targeted',async()=>{
 for(const option of [{adminRole:false},{targetAdmin:true}]){
  const h=adminHarness(option);
  await h.api.refresh();
  h.click('select');
  assert.doesNotMatch(h.api.markup(),/data-lam-surprise/);
  h.click('surprise');
  for(let i=0;i<10;i++)await Promise.resolve();
  assert.equal(h.calls.length,0);
 }
});
test('Surprise appears once, is keyboard accessible, has Skip and ends automatically',async()=>{
 const h=noticeHarness();
 await h.api.check();
 assert.equal(h.nodes.length,1);
 assert.match(h.nodes[0].className,/surprise/);
 assert.match(h.nodes[0].innerHTML,/Skip surprise/);
 assert.match(h.nodes[0].innerHTML,/Time to take a break/);
 assert.equal(h.timers.length,1);
 assert.equal(h.timers[0].ms,8000);
 h.timers[0].fn();
 await Promise.resolve();
 assert.equal(h.nodes[0].removed,true);
 assert.equal(h.dbCalls.length,1);
 assert.ok(h.dbCalls[0].seen_at);
});
test('Surprise is not shown while fullscreen games or clip capture are active',async()=>{
 for(const opts of [{fullscreen:true},{recording:true}]){
  const h=noticeHarness(opts);
  await h.api.check();
  assert.equal(h.nodes.length,0);
 }
});
test('Regular notices continue to show the recipient a dismissible one-time message',async()=>{
 const h=noticeHarness({kind:'notice'});
 await h.api.check();
 assert.equal(h.nodes.length,1);
 assert.match(h.nodes[0].innerHTML,/Got it/);
 assert.match(h.nodes[0].innerHTML,/Open Lolite in a new tab/);
});
test('Supabase function checks admin identity, blocks admin targets and rate-limits recipient to 24 hours',()=>{
 assert.match(sql,/from public\.lolite_admins a where a\.user_id = v_actor/);
 assert.match(sql,/p_target = v_actor or exists/);
 assert.match(sql,/interval '24 hours'/);
 assert.match(sql,/security definer set search_path = ''/);
 assert.match(sql,/revoke all on function public\.lolite_admin_send_surprise\(uuid\)/);
 assert.match(sql,/insert into public\.lolite_moderation_audit/);
});
test('Production OS loads the controls, receiver, original account lock and CSS',()=>{
 assert.match(index,/core\/lolite-admin-accounts\.js\?v=preview-surprise/);
 assert.match(index,/core\/lolite-account-notices\.js\?v=preview-surprise/);
 assert.match(index,/core\/lolite-admin-moderation\.css\?v=preview-surprise/);
 assert.match(accounts,/async function readModeration\(/);
 assert.match(accounts,/function lockForModeration\(/);
 assert.match(accounts,/data-account-signout/);
 const css=read('core/lolite-admin-moderation.css');
 assert.match(css,/\.lolite-surprise-overlay/);
 assert.match(css,/\.lsu-skip/);
});

test('Admin can preview the safe surprise without contacting another account',async()=>{
 const h=adminHarness();
 await h.api.refresh();
 h.click('select');
 assert.match(h.api.markup(),/data-lam-preview-surprise/);
 h.click('preview');
 assert.equal(h.calls.length,0);
 const n=noticeHarness();
 assert.equal(n.api.preview(),true);
 assert.equal(n.nodes.length,1);
 assert.match(n.nodes[0].innerHTML,/Skip surprise/);
 n.timers[0].fn();
 await Promise.resolve();
 assert.equal(n.nodes[0].removed,true);
 assert.equal(n.dbCalls.length,0);
});
