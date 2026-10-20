/* Lolite Chat extras: desktop alerts, read positions, profile actions, and WebRTC voice rooms. */
(()=>{
'use strict';
const host=()=>window.LoliteChat;
const client=()=>host()?.getClient?.();
const state=()=>host()?.getState?.();
const root=()=>document.querySelector('.window[data-window-id="chatroom"] #lcRoot');
const myId=()=>state()?.user?.id||currentUser;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const who=id=>state()?.profiles?.find(p=>p.id===id);
const name=id=>who(id)?.display_name||who(id)?.username||'Lolite User';
const conversation=()=>{const s=state();return s?.view==='conversation'?s.conversations.find(c=>c.id===s.conversationId):null};
const visible=()=>{const r=root();return !!(r&&document.visibilityState==='visible'&&r.getClientRects().length&&r.closest('.window')?.style.display!=='none')};
function notice(txt){let r=root();const d=document.createElement('div');d.className='lc-toast';d.textContent=txt;(r||document.body).appendChild(d);setTimeout(()=>d.remove(),3300)}
let currentUser=null,items=[],lastCursor=null,notifyBusy=false,focusedProfile=null;
let pollTimer=null,notificationChannel=null;
function storeKey(s){return 'lolite_chat_'+s+'_'+currentUser}
function persist(){if(currentUser){try{localStorage.setItem(storeKey('notices'),JSON.stringify(items.slice(0,80)));if(lastCursor)localStorage.setItem(storeKey('cursor'),JSON.stringify(lastCursor))}catch(e){console.warn('Notifications could not be saved',e)}}}
function restoreForUser(uid){
 currentUser=uid||null;items=[];lastCursor=null;
 if(uid){try{items=JSON.parse(localStorage.getItem(storeKey('notices'))||'[]');lastCursor=JSON.parse(localStorage.getItem(storeKey('cursor'))||'null')}catch{items=[];lastCursor=null}}
 updateBell();
}
function postNotification(title,body,link){
 const n={id:Date.now().toString(36)+Math.random().toString(36).slice(2),title,body,time:Date.now(),read:false,link};
 items.unshift(n);items=items.slice(0,80);persist();updateBell();
 const openChat=root()&&visible()&&state()?.conversationId===link?.conversationId;
 const quiet=state()?.me?.status==='dnd';
 if(!openChat&&!quiet){
  // Browser notification API displays in the actual desktop notification center where supported.
  if('Notification' in window&&Notification.permission==='granted'){
   try{const notification=new Notification(title,{body,tag:'lolite-'+n.id,icon:new URL('assets/lolite-glass-logo.svg',location.href).href});
    notification.onclick=()=>{window.focus();goTo(link);notification.close()}}catch(e){console.debug('Desktop notification unavailable',e)}
  }
  notice(title);
 }
}
function goTo(link){
 if(!host())return;
 if(!root())host().open();
 const s=state();
 if(link?.conversationId){s.view='conversation';s.conversationId=link.conversationId;s.search='';s.showPins=false;host().refresh()}
 else if(link?.friends){s.view='friends';host().refresh()}
}
function ensureBell(){
 const tray=document.querySelector('#taskbar .tray')||document.getElementById('taskbar');
 if(!tray)return;
 if(!document.getElementById('lcNotifButton')){
  const b=document.createElement('button');b.id='lcNotifButton';b.type='button';b.className='task lc-notification-bell';b.setAttribute('aria-label','Lolite notifications');b.title='Notifications';b.innerHTML='<span aria-hidden="true">♧</span><small id="lcNotifCount" hidden>0</small>';
  b.addEventListener('click',()=>{const open=document.getElementById('lcNotifPanel');if(open){open.remove();return}openPanel()});
  tray.insertBefore(b,tray.firstChild);
 }
}
function updateBell(){
 ensureBell();const badge=document.getElementById('lcNotifCount');const count=items.filter(n=>!n.read).length;
 if(badge){badge.hidden=!count;badge.textContent=String(Math.min(99,count))}
 const list=document.getElementById('lcNotifList');if(list)renderPanelContents(list);
}
function renderPanelContents(list){
 const permitted=('Notification' in window)?Notification.permission:'unsupported';
 list.innerHTML='<header><strong>Notifications</strong><button type="button" data-lc-notice="close" aria-label="Close notifications">×</button></header>'+
 '<div class="lc-notif-settings"><span>Desktop alerts: '+esc(permitted)+'</span>'+((permitted==='default')?'<button type="button" data-lc-notice="enable">Enable</button>':'')+'</div>'+
 '<div class="lc-notif-list">'+(items.length?items.map((n,i)=>'<button type="button" class="lc-notif-item '+(n.read?'is-read':'')+'" data-lc-notice="open" data-lc-index="'+i+'"><b>'+esc(n.title)+'</b><span>'+esc(n.body)+'</span><time>'+esc(new Date(n.time).toLocaleString())+'</time></button>').join(''):'<p class="lc-notif-empty">Nothing new yet. Messages and friend requests will appear here.</p>')+'</div>'+
 '<footer><button type="button" data-lc-notice="mark">Mark all seen</button><button type="button" data-lc-notice="clear">Clear all</button></footer>';
}
function openPanel(){
 ensureBell();const d=document.createElement('section');d.id='lcNotifPanel';d.className='lc-notif-panel';d.setAttribute('aria-label','Lolite notifications');const list=document.createElement('div');list.id='lcNotifList';d.appendChild(list);document.body.appendChild(d);renderPanelContents(list);
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-lc-notice]');if(!b)return;e.preventDefault();const action=b.dataset.lcNotice;
 if(action==='close')document.getElementById('lcNotifPanel')?.remove();
 if(action==='enable'){
  try{if('Notification' in window){const p=await Notification.requestPermission();notice(p==='granted'?'Desktop notifications enabled.':'Desktop notification permission: '+p);updateBell()}}
  catch{notice('Desktop notifications are not available here.')}
 }
 if(action==='mark'){items.forEach(n=>n.read=true);persist();updateBell()}
 if(action==='clear'){items=[];persist();updateBell()}
 if(action==='open'){const n=items[Number(b.dataset.lcIndex)];if(n){n.read=true;persist();updateBell();document.getElementById('lcNotifPanel')?.remove();goTo(n.link)}}
});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#lcNotifPanel,#lcNotifButton'))document.getElementById('lcNotifPanel')?.remove()});
async function poll(){
 const sb=client(),uid=currentUser;if(!sb||!uid||notifyBusy)return;notifyBusy=true;
 try{
  const results=await Promise.all([
   sb.from('conversations').select('id,type,name'),
   sb.from('friend_requests').select('id,from_id,status').eq('to_id',uid).eq('status','pending')
  ]);
  if(results.some(r=>r.error))return;
  const chats=(results[0].data||[]).filter(c=>c.type==='dm'||c.type==='group');
  const req=results[1].data||[];
  let messages=[];
  if(chats.length){const r=await sb.from('messages').select('id,conversation_id,sender_id,content').in('conversation_id',chats.map(c=>c.id)).order('id',{ascending:false}).limit(80);if(!r.error)messages=r.data||[]}
  const max=messages.reduce((n,m)=>Math.max(n,Number(m.id)),0),pending=req.map(r=>r.id);
  if(!lastCursor){lastCursor={maxMessage:max,requests:pending};persist();return}
  const old=Number(lastCursor.maxMessage)||0;const seen=new Set(lastCursor.requests||[]);
  for(const m of messages.filter(m=>Number(m.id)>old&&m.sender_id!==uid).sort((a,b)=>a.id-b.id).slice(-15)){
   const c=chats.find(c=>c.id===m.conversation_id);if(!c)continue;
   const alreadyOpen=visible()&&state()?.conversationId===c.id;
   if(!alreadyOpen)postNotification(c.type==='group'?(c.name||'Group message'):'New direct message','You have a new message in Lolite Chat.',{conversationId:c.id});
  }
  for(const r of req.filter(x=>!seen.has(x.id))){
   postNotification('New friend request','Someone wants to add you on Lolite Chat.',{friends:true});
  }
  lastCursor={maxMessage:Math.max(max,old),requests:pending};persist();
 }catch(e){console.warn('Lolite notification check failed',e)}
 finally{notifyBusy=false}
}
function setUser(uid){
 if(currentUser===uid)return;
 restoreForUser(uid);if(pollTimer){clearInterval(pollTimer);pollTimer=null}
 if(uid){poll();pollTimer=setInterval(poll,12000)}
 else{stopVoice();focusedProfile=null}
}
async function boot(){
 ensureBell();const sb=client();if(!sb)return;
 const {data}=await sb.auth.getUser();setUser(data?.user?.id||null);
 sb.auth.onAuthStateChange((_event,session)=>{setUser(session?.user?.id||null)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);

/* Read receipts: persisted per user/conversation. No false read when the chat is hidden. */
let reads={},readsFor=null,readsBusy=false,lastWritten={};
async function showReadReceipts(){
 const c=conversation(),sb=client();if(!c||!sb||readsBusy)return;
 readsBusy=true;const id=c.id;
 try{
  const r=await sb.from('message_reads').select('user_id,last_read_message_id').eq('conversation_id',id);
  if(r.error)throw r.error;
  if(conversation()?.id!==id)return;
  reads={};for(const row of r.data||[])reads[row.user_id]=Number(row.last_read_message_id)||0;
  readsFor=id;renderReadReceipts();
  if(visible()){
   const s=state(),last=s.messages?.at(-1),max=Number(last?.id)||0;
   if(max&&max>Math.max(Number(reads[myId()])||0,Number(lastWritten[id])||0)){
    lastWritten[id]=max;
    const value={conversation_id:id,user_id:myId(),last_read_message_id:max,updated_at:new Date().toISOString()};
    const wr=await sb.from('message_reads').upsert(value,{onConflict:'conversation_id,user_id'});
    if(wr.error){delete lastWritten[id];throw wr.error}
    reads[myId()]=max;
   }
  }
 }catch(e){console.debug('Read receipt unavailable:',e.message||e)}
 finally{readsBusy=false}
}
function renderReadReceipts(){
 const s=state(),c=conversation();if(!s||!c||c.id!==readsFor||!root())return;
 for(const m of s.messages||[]){
  if(m.sender_id!==myId())continue;
  const el=root().querySelector('[data-lc-message="'+m.id+'"] .lc-msg-body');if(!el)continue;
  const users=Object.keys(reads).filter(id=>id!==myId()&&reads[id]>=Number(m.id));
  let label=el.querySelector('.lc-seen-by');
  if(!users.length){label?.remove();continue}
  if(!label){label=document.createElement('div');label.className='lc-seen-by';el.appendChild(label)}
  label.textContent='Seen by '+users.map(name).join(', ');
 }
}

/* Public profile cards: clicking a message author or a friend opens actions. */
function paintProfile(){
 if(!root()||!focusedProfile)return;
 root().querySelector('.lc-user-modal')?.remove();
 const p=who(focusedProfile);if(!p){focusedProfile=null;return}
 const s=state(),mine=p.id===myId(),blocked=s.blocks?.some(x=>x.blocked_id===p.id);
 const accepted=s.requests?.find(x=>x.status==='accepted'&&[x.from_id,x.to_id].includes(p.id)&&[x.from_id,x.to_id].includes(myId()));
 const sent=s.requests?.find(x=>x.from_id===myId()&&x.to_id===p.id&&x.status==='pending');
 const incoming=s.requests?.find(x=>x.from_id===p.id&&x.to_id===myId()&&x.status==='pending');
 const buttons=mine?'<button type="button" class="lc-secondary" data-lc-useraction="close">Close</button>':
  blocked?'<button type="button" class="lc-secondary" data-lc-useraction="close">Close</button>':
  '<button type="button" class="lc-secondary" data-lc-useraction="message">Message</button>'+
  (accepted?'':incoming?'<button type="button" class="lc-primary" data-lc-useraction="accept">Accept friend</button>':sent?'<button type="button" class="lc-secondary" disabled>Request sent</button>':'<button type="button" class="lc-primary" data-lc-useraction="friend">Add friend</button>');
 const layer=document.createElement('div');layer.className='lc-modal-layer lc-user-modal';layer.innerHTML='<div class="lc-dialog" role="dialog" aria-modal="true" aria-label="User profile"><button type="button" class="lc-user-close" data-lc-useraction="close" aria-label="Close profile">×</button><div class="lc-user-profile"><div class="lc-avatar">'+esc((p.avatar||name(p.id).slice(0,2)).toUpperCase())+'</div><h2>'+esc(name(p.id))+'</h2><div>@'+esc(p.username)+'</div><p>'+esc(p.about||'No bio yet')+'</p><small>'+esc(p.status||'online')+'</small></div><div class="lc-dialog-actions">'+buttons+'</div></div>';
 root().appendChild(layer);
}
document.addEventListener('click',async e=>{
 const action=e.target.closest('[data-lc-useraction]');
 if(action&&root()?.contains(action)){
  e.preventDefault();const key=action.dataset.lcUseraction,p=who(focusedProfile);
  if(key==='close'){focusedProfile=null;root().querySelector('.lc-user-modal')?.remove();return}
  if(!p)return;
  try{
   if(key==='friend'){await host().sendFriendRequest(p.username);notice('Friend request sent to @'+p.username)}
   if(key==='accept'){const r=state().requests.find(x=>x.from_id===p.id&&x.to_id===myId()&&x.status==='pending');if(r){const ans=await client().from('friend_requests').update({status:'accepted'}).eq('id',r.id).eq('to_id',myId());if(ans.error)throw ans.error;notice('Friend request accepted')}}
   if(key==='message'){focusedProfile=null;await host().createDM(p.id);return}
   await host().refresh();
  }catch(err){notice(err.message||'Action could not be completed')}
  return;
 }
 const user=e.target.closest('[data-lc-user]');
 if(!user||!root()?.contains(user)||e.target.closest('[data-lc-action]'))return;
 e.preventDefault();focusedProfile=user.dataset.lcUser;paintProfile();
});

/* Private, members-only voice rooms. Audio goes directly over WebRTC, never into messages. */
let voice=null;
const rtcConfig={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]};
function voiceUsers(){return voice?Object.keys(voice.channel.presenceState()).filter(id=>id!==myId()):[]}
function showVoiceUI(){
 const r=root(),s=state(),c=conversation();if(!r||!s)return;
 const head=r.querySelector('.lc-head');if(!head)return;
 if(c){
  const btn=document.createElement('button');btn.type='button';btn.className='lc-voice-join '+(voice?.id===c.id?'active':'');btn.dataset.lcVoice=voice?.id===c.id?'leave':'join';btn.textContent=voice?.id===c.id?'Leave voice':'Join voice';btn.title='Join a private audio room with this chat';head.appendChild(btn);
 }
 if(!voice)return;
 const toolbar=document.createElement('section');toolbar.className='lc-voice-bar';
 const people=voiceUsers().map(id=>name(id)).slice(0,20);
 toolbar.innerHTML='<span class="lc-voice-status">Voice connected · '+esc(String(people.length+1))+' in room'+(c?.id===voice.id?'':' · another chat')+'</span><span class="lc-voice-people">'+esc(people.length?people.join(', '):'Waiting for someone to join')+'</span>'+
 '<button type="button" data-lc-voice="mute">'+(voice.muted?'Unmute mic':'Mute mic')+'</button><button type="button" data-lc-voice="deafen">'+(voice.deafened?'Undeafen':'Deafen')+'</button><button type="button" data-lc-voice="leave">Leave</button>';
 const main=r.querySelector('.lc-main');if(main)main.insertBefore(toolbar,main.querySelector('.lc-message-scroll')||main.firstChild);
}
function refreshVoiceUI(){if(!root())return;root().querySelector('.lc-voice-join')?.remove();root().querySelector('.lc-voice-bar')?.remove();showVoiceUI()}
async function sendSignal(target,kind,data){
 if(!voice)return;
 const channel=voice.channel;
 try{await channel.send({type:'broadcast',event:'rtc',payload:{from:myId(),to:target,kind,data}})}
 catch(e){console.debug('Voice signal could not send',e)}
}
function closePeer(id){
 const peer=voice?.peers.get(id);if(!peer)return;
 try{peer.pc.close()}catch{}
 peer.audio.remove();voice.peers.delete(id);
}
function getPeer(id){
 if(!voice||!id||id===myId())return null;
 if(voice.peers.has(id))return voice.peers.get(id);
 const pc=new RTCPeerConnection(rtcConfig),audio=document.createElement('audio');audio.autoplay=true;audio.playsInline=true;audio.dataset.loliteVoice=id;audio.style.display='none';document.body.appendChild(audio);
 const peer={pc,audio,candidates:[],makingOffer:false};voice.peers.set(id,peer);
 for(const track of voice.stream.getTracks())pc.addTrack(track,voice.stream);
 pc.ontrack=e=>{audio.srcObject=e.streams[0]||new MediaStream([e.track]);audio.muted=voice.deafened;audio.play().catch(()=>{})};
 pc.onicecandidate=e=>{if(e.candidate)sendSignal(id,'candidate',e.candidate.toJSON())};
 pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'){notice('Voice connection failed. A TURN relay may be needed on this network.')}};
 return peer;
}
async function offer(id){
 const peer=getPeer(id);if(!peer||peer.makingOffer||peer.pc.signalingState!=='stable')return;
 peer.makingOffer=true;
 try{await peer.pc.setLocalDescription(await peer.pc.createOffer());await sendSignal(id,'offer',peer.pc.localDescription)}
 catch(e){console.warn('Voice offer error',e)}
 finally{peer.makingOffer=false}
}
async function signal(payload){
 if(!voice||!payload||payload.to!==myId()||!payload.from||payload.from===myId())return;
 // Reject messages from users who are not currently in this members-only room.
 if(!voiceUsers().includes(payload.from))return;
 const peer=getPeer(payload.from);if(!peer)return;
 try{
  if(payload.kind==='offer'){
   await peer.pc.setRemoteDescription(payload.data);
   await peer.pc.setLocalDescription(await peer.pc.createAnswer());
   await sendSignal(payload.from,'answer',peer.pc.localDescription);
  }else if(payload.kind==='answer'&&peer.pc.signalingState==='have-local-offer'){
   await peer.pc.setRemoteDescription(payload.data);
  }else if(payload.kind==='candidate'){
   if(peer.pc.remoteDescription)await peer.pc.addIceCandidate(payload.data);
   else peer.candidates.push(payload.data);
  }
  if(peer.pc.remoteDescription&&peer.candidates.length)for(const item of peer.candidates.splice(0))await peer.pc.addIceCandidate(item);
 }catch(e){console.debug('Voice signaling error',e)}
}
async function synchronizePeers(){
 if(!voice)return;
 const ids=voiceUsers();for(const id of [...voice.peers.keys()])if(!ids.includes(id))closePeer(id);
 for(const id of ids){if(myId()<id&&!voice.peers.has(id))await offer(id)}
 refreshVoiceUI();
}
async function joinVoice(){
 const sb=client(),s=state(),c=conversation();
 if(!sb||!s?.user||!c||!['dm','group'].includes(c.type))return notice('Open a direct message or group to join voice.');
 if(voice?.id===c.id)return;
 if(!navigator.mediaDevices?.getUserMedia||!window.RTCPeerConnection)return notice('Voice chat needs a secure browser with WebRTC and microphone support.');
 stopVoice();
 let stream;
 try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false})}
 catch(e){return notice('Microphone access is required to join voice chat.')}
 const id=c.id;
 const channel=sb.channel('lc-voice-'+id,{config:{private:true,presence:{key:myId()}}});
 const v={id,stream,channel,peers:new Map(),muted:false,deafened:false};
 voice=v;
 channel.on('broadcast',{event:'rtc'},({payload})=>signal(payload));
 channel.on('presence',{event:'sync'},()=>synchronizePeers());
 channel.subscribe(async(status,error)=>{
  if(voice!==v)return;
  if(status==='SUBSCRIBED'){
   try{await channel.track({user_id:myId(),joined_at:new Date().toISOString()});refreshVoiceUI()}
   catch(e){notice('Unable to join voice presence.');stopVoice()}
  }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){
   notice('Voice connection unavailable. Check your connection.');stopVoice();
  }
 });
 refreshVoiceUI();notice('Microphone is on. You joined the voice room.');
}
function stopVoice(){
 if(!voice)return;
 const v=voice;voice=null;
 for(const p of v.peers.values()){try{p.pc.close()}catch{}p.audio.remove()}
 for(const t of v.stream.getTracks())t.stop();
 client()?.removeChannel(v.channel)?.catch?.(()=>{});
 refreshVoiceUI();
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-lc-voice]');if(!b||!root()?.contains(b))return;
 e.preventDefault();e.stopPropagation();
 switch(b.dataset.lcVoice){
  case 'join':await joinVoice();break;
  case 'leave':stopVoice();break;
  case 'mute':if(voice){voice.muted=!voice.muted;voice.stream.getAudioTracks().forEach(t=>t.enabled=!voice.muted);refreshVoiceUI()}break;
  case 'deafen':if(voice){voice.deafened=!voice.deafened;for(const p of voice.peers.values())p.audio.muted=voice.deafened;refreshVoiceUI()}break;
 }
});
function afterRender(){
 if(!state()?.user){focusedProfile=null;stopVoice();return}
 showVoiceUI();if(focusedProfile)paintProfile();
 if(conversation()){showReadReceipts().catch(console.error)}
 poll().catch(console.error);
}
window.LoliteChatExtra={afterRender,stopVoice};
})();