import { randomBytes } from 'node:crypto';

const TOKEN_PATTERN=/^[A-Za-z0-9_-]{32,128}$/;
const ID_PATTERN=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export const AUTH_URL='https://rztxhwfdbrzuhdqpegar.supabase.co/auth/v1/user';
export const SUPABASE_PUBLIC_KEY='sb_publishable_I3eswNK0zu8qQvDp1Kcfbw_zZzzi18u';

/** Verify the user's account server-side; do not trust a client-supplied user ID. */
export async function verifyLoliteUser(bearer,request=fetch){
 if(typeof bearer!=='string'||!/^Bearer [A-Za-z0-9._-]{20,4096}$/.test(bearer))return null;
 try{
  const response=await request(AUTH_URL,{
   headers:{apikey:SUPABASE_PUBLIC_KEY,Authorization:bearer,'Accept':'application/json'},
   signal:AbortSignal.timeout(6000),
   cache:'no-store'
  });
  if(!response?.ok)return null;
  const user=await response.json();
  if(!ID_PATTERN.test(String(user?.id||'')))return null;
  if(user?.is_anonymous===true)return null;
  // Lolite Chat account registrations use this synthetic email domain.
  if(!String(user?.email||'').toLowerCase().endsWith('@accounts.lolite.chat'))return null;
  return {id:user.id};
 }catch{return null}
}

/** One-use, short-lived grants keep Supabase access tokens out of WebSocket URLs. */
export class TicketStore{
 constructor({clock=Date.now,random=()=>randomBytes(32).toString('base64url'),ttlMs=30_000,max=512,maxPerUser=4}={}){
  this.clock=clock;this.random=random;this.ttlMs=ttlMs;this.max=max;this.maxPerUser=maxPerUser;
  this.items=new Map();
 }
 prune(){
  const now=this.clock();
  for(const [key,grant] of this.items)if(grant.expires<=now)this.items.delete(key);
 }
 issue(userId,origin){
  if(!ID_PATTERN.test(String(userId||''))||!origin)return null;
  this.prune();
  if(this.items.size>=this.max)return null;
  let count=0;
  for(const value of this.items.values())if(value.userId===userId)count++;
  if(count>=this.maxPerUser)return null;
  const ticket=this.random();
  if(!TOKEN_PATTERN.test(ticket)||this.items.has(ticket))return null;
  const expires=this.clock()+this.ttlMs;
  this.items.set(ticket,{userId,origin,expires});
  return {ticket,expiresInSeconds:Math.floor(this.ttlMs/1000)};
 }
 consume(ticket,origin){
  if(!TOKEN_PATTERN.test(String(ticket||'')))return false;
  const grant=this.items.get(ticket);
  if(!grant)return false;
  this.items.delete(ticket); // single-use, including rejected/wrong-origin attempts
  return grant.expires>this.clock()&&grant.origin===origin;
 }
}
