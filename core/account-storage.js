/* Loaded before every desktop module. Old guest data stays in place. */
(()=>{
 'use strict';
 const raw=window.localStorage,uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
 const devicePrefix='lolite-device:',prefixFor=id=>uuid.test(id)?'lolite-user:'+id+':':'';
 const device={get:key=>raw.getItem(devicePrefix+key),set:(key,value)=>raw.setItem(devicePrefix+key,String(value)),remove:key=>raw.removeItem(devicePrefix+key)};
 const id=device.get('account')||'guest',prefix=prefixFor(id);
 const reserved=k=>k.startsWith('lolite-user:')||k.startsWith(devicePrefix)||/^sb-.*-auth-token/.test(k);
 const keys=()=>Object.keys(raw).filter(k=>prefix?k.startsWith(prefix):!reserved(k)).map(k=>prefix?k.slice(prefix.length):k);
 const authKey=k=>/^sb-.*-auth-token/.test(k);
 const actual=k=>authKey(k)?k:prefix+k;
 const changed=k=>window.dispatchEvent(new CustomEvent('lolite:account-data',{detail:{key:k}}));
 const api={getItem(k){k=String(k);return reserved(k)&&!authKey(k)?null:raw.getItem(actual(k))},setItem(k,v){k=String(k);if(reserved(k)&&!authKey(k))return;raw.setItem(actual(k),String(v));if(!authKey(k))changed(k)},removeItem(k){k=String(k);if(reserved(k)&&!authKey(k))return;raw.removeItem(actual(k));if(!authKey(k))changed(k)},clear(){keys().forEach(k=>api.removeItem(k))},key(i){return keys()[i]??null}};
 const scoped=new Proxy(api,{get(t,k){if(k==='length')return keys().length;if(k===Symbol.toStringTag)return 'Storage';if(k in t)return t[k];return typeof k==='string'?api.getItem(k)??undefined:undefined},set(t,k,v){api.setItem(k,v);return true},deleteProperty(t,k){api.removeItem(k);return true},ownKeys:keys,getOwnPropertyDescriptor(t,k){if(keys().includes(k))return {enumerable:true,configurable:true,value:api.getItem(k),writable:true}}});
 Object.defineProperty(window,'localStorage',{configurable:true,value:scoped});
 window.LoliteAccountStorage=Object.freeze({id,device,db:name=>prefix?name+'-'+id:name,scope:prefix? id:'guest',validId:value=>uuid.test(value)});
})();
