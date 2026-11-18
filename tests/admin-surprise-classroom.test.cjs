/* Lolite Account Moderation: Unban, ban art, permissions and Classroom Pause. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const admin=read('core/lolite-admin-accounts.js');
const accounts=read('core/accounts.js');
const index=read('index.html');
const css=read('core/lolite-admin-moderation.css');
const migration=read('supabase/migrations/20261118143000_lolite_ban_screen_art_controls.sql');
const member='00000000-0000-4000-8000-000000000002';
const owner='00000000-0000-4000-8000-000000000001';
function harness({role=true,protectedTarget=false,banned=false,withImage=true}={}){
 const handlers={},calls=[];
 const account={id:member,username:'member',display_name:'Member',created_at:'2026-11-18T00:00:00Z'};
 const rows={profiles:[account],lolite_account_moderation:banned?[{
  user_id:member,action:'ban',reason:'Rules violation',ends_at:null,
  ban_image_path:withImage?'ban-images/00000000-0000-4000-8000-000000000008.webp':null,
  ban_image_enabled:false
 }]:[],lolite_admins:[{user_id:owner},...(protectedTarget?[{user_id:member}]:[])],lolite_moderation_audit:[]};
 const client={
  auth:{async getUser(){return {data:{user:{id:owner}}}}},
  from(table){const result={data:rows[table]||[],count:(rows[table]||[]).length,error:null};
   const q={select(){return q},order(){return q},limit(){return Promise.resolve(result)},range(){return Promise.resolve(result)}};
   return q},
  storage:{from(){return {getPublicUrl(p){return {data:{publicUrl:'https://rztxhwfdbrzuhdqpegar.supabase.co/storage/v1/object/public/lolite-admin-media/'+p}}}}}},
  async rpc(name,params){calls.push({name,params});return {data:{ok:true},error:null}}
 };
 const window={LoliteAdmin:{isAdmin:()=>role},LoliteBrowserAccounts:{getClient:()=>client},confirm:()=>true};
 const document={querySelector:()=>null,addEventListener(type,fn){(handlers[type]??=[]).push(fn)}};
 vm.runInNewContext(admin,{window,document,console,Map,Set,Date,Math,String,Number,JSON,crypto:{randomUUID:()=>member}},{timeout:2000});
 const buttons={select:'data-lam-user',unban:'data-lam-unban',art:'data-lam-ban-image-toggle',pause:'data-lam-classroom-pause'};
 function click(kind){
  const attr=buttons[kind],button={
   dataset:{lamUser:member,enable:'true'},disabled:false,isConnected:true,
   closest(s){if(s==='[data-lam-root]'||s.includes('data-lam-user'))return this;return null},
   matches(s){return s==='['+attr+']'}
  };
  for(const fn of handlers.click||[])fn({target:button});
 }
 return {api:window.LoliteAdminAccounts,click,calls};
}
async function settle(){for(let i=0;i<40;i++)await Promise.resolve()}
test('Admin Center offers direct unban and an optional on/off ban picture',async()=>{
 const h=harness({banned:true});
 await h.api.refresh();h.click('select');
 const markup=h.api.markup();
 assert.match(markup,/data-lam-unban/);
 assert.match(markup,/data-lam-ban-file/);
 assert.match(markup,/data-lam-ban-image-toggle/);
 assert.match(markup,/data-lam-classroom-pause/);
 assert.doesNotMatch(markup,/data-lam-surprise/);
 h.click('unban');await settle();
 assert.equal(h.calls.length,1);
 assert.equal(h.calls[0].name,'lolite_admin_moderate_account');
 assert.equal(h.calls[0].params.p_action,'clear');
 assert.equal(h.calls[0].params.p_target,member);
});
test('Ban art button calls server-authorised image settings RPC',async()=>{
 const h=harness({banned:true});await h.api.refresh();h.click('select');
 h.click('art');await settle();
 assert.equal(h.calls.length,1);
 assert.equal(h.calls[0].name,'lolite_admin_set_ban_image');
 assert.equal(h.calls[0].params.p_target,member);
 assert.equal(h.calls[0].params.p_enabled,true);
});
test('Admin Center prevents unban buttons for non-admin callers or protected accounts',async()=>{
 for(const opts of [{role:false,banned:true},{protectedTarget:true,banned:true},{banned:false}]){
  const h=harness(opts);await h.api.refresh();h.click('select');
  assert.doesNotMatch(h.api.markup(),/data-lam-unban/);
  h.click('unban');await settle();assert.equal(h.calls.length,0);
 }
});
test('Classroom Pause is a separate logged 45-minute timeout',async()=>{
 const h=harness();await h.api.refresh();h.click('select');h.click('pause');await settle();
 assert.equal(h.calls.length,1);
 assert.equal(h.calls[0].name,'lolite_admin_moderate_account');
 assert.equal(h.calls[0].params.p_action,'timeout');
 assert.equal(h.calls[0].params.p_minutes,45);
});
test('Ban picture is part of ban lock, not timeout, and account switching remains available',()=>{
 assert.match(accounts,/ban_image_path,ban_image_enabled/);
 assert.match(accounts,/const safeArt=banned&&record.ban_image_enabled/);
 assert.match(accounts,/Ban screen picture/);
 assert.match(accounts,/data-account-signout/);
 assert.match(accounts,/blocked.ban_image_path!==restriction.ban_image_path/);
});
test('Ban image storage and change RPC require admin privileges and verified images',()=>{
 assert.match(migration,/public\.lolite_admin_set_ban_image/);
 assert.match(migration,/from public\.lolite_admins a where a\.user_id/);
 assert.match(migration,/storage\.objects/);
 assert.match(migration,/for insert to authenticated with check/);
 assert.match(migration,/grant execute on function public\.lolite_admin_set_ban_image/);
 assert.match(migration,/2097152/);
});
test('Production page loads current admin account and ban styling assets',()=>{
 assert.match(index,/core\/lolite-admin-accounts\.js\?v=ban-image-unban/);
 assert.match(index,/core\/lolite-admin-moderation\.css\?v=ban-image-unban/);
 assert.match(index,/core\/accounts\.js\?v=ban-image-unban/);
 assert.match(css,/\.lam-ban-art/);
 assert.match(css,/\.la-moderation-lock \.la-ban-art/);
 assert.match(admin,/function render\(\{force=false\}=\{\}\)/);
});
