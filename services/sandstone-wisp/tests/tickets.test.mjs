import test from 'node:test';
import assert from 'node:assert/strict';
import { TicketStore, verifyLoliteUser } from '../tickets.mjs';

const ID='11111111-1111-4111-8111-111111111111';
const ORIGIN='https://darby9123-arch.github.io';
test('Wisp refuses missing, malformed and unverified account credentials',async()=>{
 let calls=0;
 const request=async (_url,options)=>{
  calls++;
  assert.ok(options.headers.Authorization.startsWith('Bearer '));
  return {ok:false,json:async()=>({})};
 };
 assert.equal(await verifyLoliteUser('',request),null);
 assert.equal(await verifyLoliteUser('Bearer invalid',request),null);
 assert.equal(calls,0);
 assert.equal(await verifyLoliteUser('Bearer '+ 'a'.repeat(40),request),null);
 assert.equal(calls,1);
});
test('Wisp grants only verified existing Lolite Chat account users',async()=>{
 const token='Bearer '+ 'a'.repeat(40);
 const request=async (_url,options)=>({ok:true,json:async()=>({
  id:ID,email:'player@accounts.lolite.chat',is_anonymous:false
 })});
 assert.deepEqual(await verifyLoliteUser(token,request),{id:ID});
 const stranger=async()=>({ok:true,json:async()=>({id:ID,email:'player@example.org'})});
 assert.equal(await verifyLoliteUser(token,stranger),null);
 const anonymous=async()=>({ok:true,json:async()=>({
  id:ID,email:'guest@accounts.lolite.chat',is_anonymous:true
 })});
 assert.equal(await verifyLoliteUser(token,anonymous),null);
});
test('Account tickets expire and cannot be reused after one Wisp handshake',()=>{
 let now=5000,sequence=0;
 const store=new TicketStore({clock:()=>now,random:()=>String(++sequence).padStart(32,'A')});
 const first=store.issue(ID,ORIGIN);
 assert.equal(first.expiresInSeconds,30);
 assert.equal(store.consume(first.ticket,ORIGIN),true);
 assert.equal(store.consume(first.ticket,ORIGIN),false);
 const second=store.issue(ID,ORIGIN);
 now+=30001;
 assert.equal(store.consume(second.ticket,ORIGIN),false);
});
test('Account grants are bound to one origin and limited per user',()=>{
 let i=0;
 const store=new TicketStore({random:()=>String(++i).padStart(32,'Z'),maxPerUser:2,max:3});
 const first=store.issue(ID,ORIGIN);
 assert.equal(store.consume(first.ticket,'https://attacker.invalid'),false);
 assert.equal(store.consume(first.ticket,ORIGIN),false);
 assert.ok(store.issue(ID,ORIGIN));
 assert.ok(store.issue(ID,ORIGIN));
 assert.equal(store.issue(ID,ORIGIN),null,'Limit pending grants per account');
});
test('Invalid account IDs cannot obtain Wisp tickets',()=>{
 const store=new TicketStore();
 assert.equal(store.issue('guest',ORIGIN),null);
 assert.equal(store.issue('',ORIGIN),null);
 assert.equal(store.issue(ID,''),null);
});
