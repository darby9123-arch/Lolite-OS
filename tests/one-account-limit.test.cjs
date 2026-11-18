const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
test('signup browser marker stays device-scoped and persists across account switching',()=>{
 const stored=new Map();
 const raw={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,String(v)),removeItem:k=>stored.delete(k)};
 const w={localStorage:raw,crypto:{randomUUID:()=> '123e4567-e89b-42d3-a456-426614174000'},dispatchEvent(){}};
 vm.runInNewContext(read('core/account-storage.js'),{window:w,CustomEvent:class{}});
 const deviceId=w.LoliteSignupLimit.deviceId();
 assert.equal(deviceId,'123e4567-e89b-42d3-a456-426614174000');
 assert.equal(w.LoliteSignupLimit.hasAccount(),false);
 w.LoliteSignupLimit.markAccount('33333333-3333-4333-8333-333333333333');
 assert.equal(w.LoliteSignupLimit.hasAccount(),true);
 w.LoliteSignupLimit.markAccount('44444444-4444-4444-8444-444444444444');
 assert.equal(stored.get('lolite-device:first-account-id'),'33333333-3333-4333-8333-333333333333');
 assert.equal(stored.get('lolite-device:signup-device-id'),deviceId);
});
test('desktop and chat registration send same browser ID and block repeat registrations',()=>{
 const desktop=read('core/accounts.js'),chat=read('core/chat-v2.js'),html=read('index.html');
 assert.match(desktop,/LoliteSignupLimit\?\.hasAccount\(\)/);
 assert.match(desktop,/body:\{action:'register',username,display_name:form\.elements\.display\.value,password,device_id\}/);
 assert.match(chat,/body:\{action:'register',username,display_name:display,password,device_id\}/);
 assert.match(chat,/case 'tabRegister':if\(window\.LoliteSignupLimit\?\.hasAccount\(\)\)/);
 assert.match(html,/account-storage\.js\?v=one-account-20261119/);
});
test('server keeps registration claims private and rolls back competing creations',()=>{
 const sql=read('supabase/migrations/20261119093000_one_account_per_browser.sql');
 const fn=read('supabase/functions/lolite-account/index.ts');
 assert.match(sql,/device_id uuid primary key/);
 assert.match(sql,/enable row level security/);
 assert.match(fn,/\.from\("lolite_account_registration_devices"\)/);
 assert.match(fn,/deleteUser\(created\.user\.id\)/);
});
