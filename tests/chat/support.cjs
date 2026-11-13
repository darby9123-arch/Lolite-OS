const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const path=require('node:path');
const flush=async()=>{for(let i=0;i<100;i++)await Promise.resolve()};
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve}};
function fixture({scripts=['chat-v2'],microphone}={}){
 const dom=new JSDOM('<div class="window" data-window-id="chatroom"><div id="lcRoot" class="lc-root"></div></div>',{url:'https://lolite.test/',runScripts:'outside-only'});
 const w=dom.window,doc=w.document;Object.defineProperty(doc,'readyState',{value:'complete'});
 const timers=new Map();let timerId=0;
 w.setTimeout=(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId};w.clearTimeout=id=>timers.delete(id);
 w.setInterval=w.setTimeout;w.clearInterval=w.clearTimeout;
 const runTimers=async ms=>{for(const [id,timer] of [...timers])if(timer.ms===ms){timers.delete(id);await timer.fn()}await flush()};
 const rows={profiles:[{id:'a',username:'alex',display_name:'Alex',avatar:'AL'},{id:'b',username:'sam',display_name:'Sam',avatar:'SA'}],conversations:[{id:'room',type:'dm',created_at:'2026-01-01'},{id:'other',type:'group',name:'Other chat',created_at:'2026-01-01'}],conversation_members:[{conversation_id:'room',user_id:'a'},{conversation_id:'room',user_id:'b'},{conversation_id:'other',user_id:'a'}],friend_requests:[{id:'friend',from_id:'a',to_id:'b',status:'accepted'}],messages:[{id:1,conversation_id:'room',sender_id:'b',content:'Hey there',created_at:'2026-01-01T00:00:00Z'}],blocks:[],lolite_admins:[],message_reactions:[],message_reads:[],chat_calls:[],chat_call_invites:[]};
 let user={id:'a'},hook=null;const queries=[],channels=[],removed=[];
 class Query{
  constructor(table){this.table=table;this.filters=[];this.action='select'}
  select(){return this}order(key,options={}){this.sort={key,ascending:options.ascending!==false};return this}limit(){return this}
  eq(k,v){this.filters.push(r=>r[k]===v);this.filterValues={...this.filterValues,[k]:v};return this}
  in(k,vs){this.filters.push(r=>vs.includes(r[k]));return this}
  gt(k,v){this.filters.push(r=>r[k]>v);return this}
  match(obj){for(const [k,v]of Object.entries(obj))this.eq(k,v);return this}
  insert(value){this.action='insert';this.value=value;return this}
  update(value){this.action='update';this.value=value;return this}
  upsert(value){return this.insert(value)}delete(){this.action='delete';return this}
  single(){this.one=true;return this}maybeSingle(){this.one=true;return this}
  then(ok,bad){return Promise.resolve().then(async()=>{
   queries.push(this);const override=await hook?.(this);if(override!==undefined)return override;
   const table=rows[this.table]||[],selected=table.filter(r=>this.filters.every(f=>f(r)));let data=selected;if(this.sort)data.sort((a,b)=>String(a[this.sort.key]).localeCompare(String(b[this.sort.key]))*(this.sort.ascending?1:-1));
   if(this.action==='insert'){
    data=(Array.isArray(this.value)?this.value:[this.value]).map((r,i)=>({id:'new-'+table.length+'-'+i,created_at:new Date().toISOString(),status:this.table==='chat_call_invites'?'ringing':'ringing',expires_at:new Date(Date.now()+60000).toISOString(),...r}));table.push(...data);
   }else if(this.action==='update')selected.forEach(r=>Object.assign(r,this.value));
   else if(this.action==='delete')rows[this.table]=table.filter(r=>!selected.includes(r));
   return {data:this.one?data[0]||null:structuredClone(data),error:null};
  }).then(ok,bad)}
 }
 class Channel{
  constructor(name,options){this.name=name;this.options=options;this.handlers=[];this.presence={};this.sent=[];this.trackResult='ok';this.sendResult='ok'}
  on(type,filter,fn){this.handlers.push({type,filter,fn});return this}
  subscribe(fn){this.callback=fn;queueMicrotask(()=>fn?.('SUBSCRIBED'));return this}
  async track(){return this.trackResult}presenceState(){return this.presence}
  async send(message){this.sent.push(message);return this.sendResult}
  async emit(type,event,payload){for(const h of this.handlers)if(h.type===type&&h.filter.event===event)await h.fn({payload});await flush()}
 }
 const authCallbacks=[];
 const db={auth:{async getUser(){return {data:{user},error:null}},onAuthStateChange(fn){authCallbacks.push(fn)}},from:t=>new Query(t),channel(name,options){const c=new Channel(name,options);channels.push(c);return c},async removeChannel(c){removed.push(c)}};
 const streams=[],pcs=[];let captures=0;
 function stream(kind='audio'){
  const track={kind,enabled:true,label:'Test microphone',stopped:false,stop(){this.stopped=true},getSettings(){return {}}};
  const value={getTracks:()=>[track],getAudioTracks:()=>kind==='audio'?[track]:[],getVideoTracks:()=>kind==='video'?[track]:[],track};streams.push(value);return value;
 }
 class PC{
  constructor(){this.connectionState='new';this.signalingState='stable';this.senders=[];this.ice=[];this.restarts=0;pcs.push(this)}
  addTrack(track){const sender={track,async replaceTrack(t){this.track=t}};this.senders.push(sender);return sender}
  addTransceiver(){return {direction:'recvonly',sender:{async replaceTrack(){}}}}
  getSenders(){return this.senders}
  async setLocalDescription(){this.localDescription={type:this.signalingState==='have-remote-offer'?'answer':'offer',sdp:'test'};this.signalingState=this.localDescription.type==='offer'?'have-local-offer':'stable'}
  async setRemoteDescription(value){this.remoteDescription=value;this.signalingState=value.type==='offer'?'have-remote-offer':'stable'}
  async addIceCandidate(value){this.ice.push(value)}restartIce(){this.restarts++}
  close(){this.connectionState='closed';this.signalingState='closed'}
  connect(value='connected'){this.connectionState=value;this.onconnectionstatechange?.()}
 }
 w.LoliteBrowserAccounts={getClient:()=>db};w.page=()=>'';w.openApp=()=>{};w.RTCPeerConnection=PC;w.MediaStream=class{constructor(tracks){this.getTracks=()=>tracks}};
 w.HTMLMediaElement.prototype.play=()=>Promise.resolve();w.console={...console,error(){},debug(){},warn(){}};
 Object.defineProperty(w.navigator,'mediaDevices',{value:{getUserMedia:async()=>{captures++;return microphone?microphone():stream()},addEventListener(){},enumerateDevices:async()=>[],getDisplayMedia:async()=>stream('video')}});
 for(const script of scripts)w.eval(fs.readFileSync(path.join(__dirname,'../../core',script+'.js'),'utf8'));
 const click=async selector=>{const el=doc.querySelector(selector);if(!el)throw Error('Missing '+selector);el.click();await flush();return el};
 const open=async(id='room')=>{await w.LoliteChat.refresh();const s=w.LoliteChat.getState();s.view='conversation';s.conversationId=id;await w.LoliteChat.refresh()};
 return {w,doc,rows,db,channels,removed,queries,streams,pcs,stream,timers,runTimers,click,open,flush,captures:()=>captures,setHook:fn=>hook=fn,setUser:async next=>{user=next;authCallbacks.forEach(fn=>fn('SIGNED_OUT',{user:next}));await flush()},close:()=>dom.window.close()};
}
module.exports={fixture,flush,deferred};
