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
  if(uid!==currentUser)return;
  const chats=(results[0].data||[]).filter(c=>c.type==='dm'||c.type==='group');
  const req=results[1].data||[];
  let messages=[];
  if(chats.length){const r=await sb.from('messages').select('id,conversation_id,sender_id,content').in('conversation_id',chats.map(c=>c.id)).order('id',{ascending:false}).limit(80);if(!r.error)messages=r.data||[]}
  if(uid!==currentUser)return;
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
 stopVoice();focusedProfile=null;
 restoreForUser(uid);if(pollTimer){clearInterval(pollTimer);pollTimer=null}
 if(uid){poll();pollTimer=setInterval(poll,12000)}
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
  '<button type="button" class="lc-secondary" data-lc-useraction="message">Message</button>'+(accepted?'<button type="button" class="lc-primary" data-lc-call="friend" data-lc-id="'+esc(p.id)+'">'+(window.LoliteChatIcons?.('phone',14)||'')+' Call</button>':'')+
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
 if(!user||!root()?.contains(user)||e.target.closest('[data-lc-action],[data-lc-call]'))return;
 e.preventDefault();focusedProfile=user.dataset.lcUser;paintProfile();
});

/* Private, members-only voice rooms. Audio goes directly over WebRTC, never into messages. */
let voice=null;

let selectedMic='';
try{selectedMic=localStorage.getItem('lolite-chat-microphone')||''}catch{}
let micBusy=false;
const micConstraints=id=>({echoCancellation:true,noiseSuppression:true,autoGainControl:true,...(id?{deviceId:{exact:id}}:{})});
function micName(){return voice?.stream.getAudioTracks()[0]?.label||'System default microphone'}
function saveMic(id){selectedMic=id;try{if(id)localStorage.setItem('lolite-chat-microphone',id);else localStorage.removeItem('lolite-chat-microphone')}catch{}}
function closeMicSettings(){document.getElementById('lcMicSettings')?.remove()}
async function populateMicSettings(){
 const dialog=document.getElementById('lcMicSettings'),select=dialog?.querySelector('select');if(!select)return;
 const previous=select.value||selectedMic;
 select.replaceChildren();
 const def=document.createElement('option');def.value='';def.textContent='System default microphone';select.appendChild(def);
 try{
  const devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput'&&d.deviceId!=='default');
  if(!dialog.isConnected)return;
  devices.forEach((d,i)=>{const o=document.createElement('option');o.value=d.deviceId;o.textContent=d.label||'Microphone '+(i+1);select.appendChild(o)});
  if(previous&&![...select.options].some(o=>o.value===previous)){const o=document.createElement('option');o.value=previous;o.textContent='Previously selected device (unavailable)';select.appendChild(o)}
  select.value=previous;
  dialog.querySelector('.lc-mic-hint').textContent=devices.some(d=>d.label)?'Switching microphones does not end your call.':'Device names may be hidden until you grant microphone permission.';
 }catch(e){dialog.querySelector('.lc-mic-hint').textContent='Cannot list microphones. Check browser permissions.'}
}
function openMicSettings(){
 if(!navigator.mediaDevices?.getUserMedia)return notice('Microphone selection needs a secure browser.');
 if(document.getElementById('lcMicSettings'))return;
 const box=document.createElement('div');box.id='lcMicSettings';box.className='lc-mic-overlay';
 box.innerHTML='<section class="lc-mic-dialog" role="dialog" aria-modal="true" aria-label="Microphone settings"><header><div><small>AUDIO SETTINGS</small><h2>Choose microphone</h2></div><button type="button" data-lc-mic="close" aria-label="Close">×</button></header><p>Select which microphone Lolite Chat uses during calls.</p><label for="lcMicSelect">Input device</label><select id="lcMicSelect"><option value="">System default microphone</option></select><div class="lc-mic-current">Current input: <strong></strong></div><p class="lc-mic-hint">Looking for microphones…</p><footer><button type="button" data-lc-mic="refresh">Refresh</button><button type="button" data-lc-mic="apply" class="lc-mic-primary">Use microphone</button></footer></section>';
 document.body.appendChild(box);box.querySelector('.lc-mic-current strong').textContent=voice?micName():'Not in a call';box.querySelector('select').focus();populateMicSettings();
}
async function switchMicrophone(id){
 if(micBusy)return false;
 if(!voice){saveMic(id);notice('Microphone saved for your next call.');closeMicSettings();return true}
 micBusy=true;
 const v=voice,apply=document.querySelector('#lcMicSettings [data-lc-mic="apply"]');
 if(apply){apply.disabled=true;apply.textContent='Switching…'}
 let stream;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:micConstraints(id),video:false});
  if(voice!==v)throw Error('The call has ended.');
  const track=stream.getAudioTracks()[0];if(!track)throw Error('No audio from this device.');
  track.enabled=!v.muted;
  const old=v.stream,oldTrack=old.getAudioTracks()[0],done=[];
  const senders=[...v.peers.values()].flatMap(p=>p.pc.getSenders().filter(x=>x.track?.kind==='audio'));
  try{
   for(const sender of senders){await sender.replaceTrack(track);done.push(sender)}
   if(voice!==v)throw Error('The call has ended.');
  }catch(e){await Promise.allSettled(done.map(sender=>sender.replaceTrack(oldTrack)));throw e}
  v.stream=stream;old.getTracks().forEach(t=>t.stop());saveMic(id);
  refreshVoiceUI();window.LoliteChatCalls?.refreshDock?.();closeMicSettings();
  notice('Now using '+(track.label||'your selected microphone'));return true;
 }catch(e){stream?.getTracks().forEach(t=>t.stop());notice('Could not change microphone: '+(e.message||'Device unavailable'));return false}
 finally{micBusy=false;if(apply){apply.disabled=false;apply.textContent='Use microphone'}}
}
document.addEventListener('click',async e=>{
 const btn=e.target.closest('[data-lc-mic]');if(!btn)return;
 e.preventDefault();e.stopPropagation();
 if(btn.dataset.lcMic==='open')openMicSettings();
 else if(btn.dataset.lcMic==='close')closeMicSettings();
 else if(btn.dataset.lcMic==='refresh')await populateMicSettings();
 else if(btn.dataset.lcMic==='apply')await switchMicrophone(document.getElementById('lcMicSelect')?.value||'');
});
document.addEventListener('click',e=>{if(e.target.id==='lcMicSettings')closeMicSettings()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('lcMicSettings')){e.stopPropagation();closeMicSettings()}});
navigator.mediaDevices?.addEventListener?.('devicechange',()=>{if(document.getElementById('lcMicSettings'))populateMicSettings()});

const rtcConfig={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]};

/* Screen sharing is opt-in and only works while connected to a private voice room. */
function renderScreen(){
 let box=document.getElementById('lcScreenViewer');
 const entries=voice?[...voice.screens.entries()]:[];
 if(!entries.length||voice.hiddenScreen){box?.remove();return}
 const [owner,stream]=entries.find(([id])=>id===voice.selectedScreen)||entries.find(([id])=>id!==myId())||entries[0];
 if(!box){box=document.createElement('aside');box.id='lcScreenViewer';box.className='lc-screen-viewer';document.body.appendChild(box)}
 if(box.dataset.owner===owner&&box.querySelector('video')?.srcObject===stream)return;
 box.replaceChildren();box.dataset.owner=owner;
 const head=document.createElement('header'),label=document.createElement('strong');
 label.textContent=owner===myId()?'You are sharing your screen':name(owner)+' is sharing';
 head.appendChild(label);
 if(entries.length>1){
  const picker=document.createElement('select');picker.setAttribute('aria-label','Choose screen to view');
  for(const [id] of entries){const opt=document.createElement('option');opt.value=id;opt.textContent=id===myId()?'Your screen':name(id);picker.appendChild(opt)}
  picker.value=owner;picker.onchange=()=>{if(voice){voice.selectedScreen=picker.value;renderScreen()}};head.appendChild(picker);
 }
 const hide=document.createElement('button');hide.type='button';hide.textContent='Hide';hide.dataset.lcScreen='hide';head.appendChild(hide);
 if(owner===myId()){const stop=document.createElement('button');stop.type='button';stop.textContent='Stop sharing';stop.className='lc-screen-stop';stop.dataset.lcScreen='stop';head.appendChild(stop)}
 const video=document.createElement('video');video.autoplay=true;video.playsInline=true;video.muted=true;video.srcObject=stream;video.setAttribute('aria-label','Shared screen');
 box.append(head,video);video.play().catch(()=>{});
}
function screenChanged(){renderScreen();refreshVoiceUI();window.LoliteChatCalls?.refreshDock?.()}
function remoteScreen(id,track){
 if(!voice||!voice.peers.has(id))return;
 voice.screens.set(id,new MediaStream([track]));voice.selectedScreen=id;voice.hiddenScreen=false;screenChanged();
}
function removeRemoteScreen(id){
 if(!voice?.screens.has(id))return;
 voice.screens.delete(id);if(voice.selectedScreen===id)voice.selectedScreen=null;screenChanged();
}
async function stopScreenShare(){
 const v=voice;if(!v?.screenStream)return;
 const stream=v.screenStream;v.screenStream=null;v.screens.delete(myId());
 if(v.selectedScreen===myId())v.selectedScreen=null;
 for(const track of stream.getTracks()){track.onended=null;track.stop()}
 for(const peer of v.peers.values()){
  try{await peer.videoSender.replaceTrack(null);peer.videoTransceiver.direction='recvonly';offer(peer.id)}
  catch(e){console.debug('Screen share stop:',e)}
 }
 v.channel.send({type:'broadcast',event:'screen',payload:{from:myId(),active:false}}).catch(()=>{});
 screenChanged();
}
async function startScreenShare(){
 const v=voice;if(!v)return notice('Join a voice call or voice room first.');
 if(v.screenStream){v.selectedScreen=myId();v.hiddenScreen=false;screenChanged();return}
 if(!navigator.mediaDevices?.getDisplayMedia)return notice('Screen sharing needs a supported desktop browser.');
 let stream;
 try{stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:24},audio:false})}
 catch(e){if(!['NotAllowedError','AbortError'].includes(e.name))notice('Could not share screen: '+e.message);return}
 if(voice!==v){stream.getTracks().forEach(t=>t.stop());return}
 const track=stream.getVideoTracks()[0];
 if(!track){stream.getTracks().forEach(t=>t.stop());return notice('No screen was selected.')}
 v.screenStream=stream;v.screens.set(myId(),stream);v.selectedScreen=myId();v.hiddenScreen=false;
 track.onended=()=>{if(voice===v)stopScreenShare()};
 for(const peer of v.peers.values()){
  try{await peer.videoSender.replaceTrack(track);peer.videoTransceiver.direction='sendrecv';offer(peer.id)}
  catch(e){console.debug('Screen share peer:',e)}
 }
 v.channel.send({type:'broadcast',event:'screen',payload:{from:myId(),active:true}}).catch(()=>{});
 screenChanged();notice('Screen sharing started. Use Stop sharing to end it.');
}

function voiceUsers(){return voice?Object.keys(voice.channel.presenceState()).filter(id=>id!==myId()):[]}
function showVoiceUI(){
 const r=root(),s=state(),c=conversation();if(!r||!s)return;
 const head=r.querySelector('.lc-head');if(!head)return;
 if(c){
  const btn=document.createElement('button');btn.type='button';btn.className='lc-voice-join '+(voice?.id===c.id?'active':'');btn.dataset.lcVoice=voice?.id===c.id?'leave':'join';btn.textContent=voice?.id===c.id?'Leave room':'Join room';btn.title='Join an audio room without ringing anyone. Use Call to invite people.';head.appendChild(btn);
 }
 if(!voice)return;
 const toolbar=document.createElement('section');toolbar.className='lc-voice-bar';
 const people=voiceUsers().map(id=>name(id)).slice(0,20);
 toolbar.innerHTML='<span class="lc-voice-status">Voice connected · '+esc(String(people.length+1))+' in room'+(c?.id===voice.id?'':' · another chat')+'</span><span class="lc-voice-people">'+esc(people.length?people.join(', '):'Waiting for someone to join')+'</span>'+
 '<button type="button" data-lc-voice="mute">'+(voice.muted?'Unmute mic':'Mute mic')+'</button><button type="button" data-lc-voice="deafen">'+(voice.deafened?'Undeafen':'Deafen')+'</button><button type="button" data-lc-mic="open">Microphone</button><button type="button" data-lc-voice="screen">'+(voice.screenStream?'Stop sharing':'Share screen')+'</button>'+(voice.screens.size?'<button type="button" data-lc-voice="viewScreen">View screen</button>':'')+'<button type="button" data-lc-voice="leave">Leave</button>';
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
 peer.audio.remove();voice.peers.delete(id);removeRemoteScreen(id);
}
function getPeer(id){
 if(!voice||!id||id===myId())return null;
 if(voice.peers.has(id))return voice.peers.get(id);
 const pc=new RTCPeerConnection(rtcConfig),audio=document.createElement('audio');audio.autoplay=true;audio.playsInline=true;audio.dataset.loliteVoice=id;audio.style.display='none';document.body.appendChild(audio);
 const peer={id,pc,audio,candidates:[],makingOffer:false,renegotiate:false,ignoreOffer:false};voice.peers.set(id,peer);
 for(const track of voice.stream.getTracks())pc.addTrack(track,voice.stream);
 peer.videoTransceiver=pc.addTransceiver('video',{direction:voice.screenStream?'sendrecv':'recvonly'});
 peer.videoSender=peer.videoTransceiver.sender;
 if(voice.screenStream)peer.videoSender.replaceTrack(voice.screenStream.getVideoTracks()[0]).catch(console.debug);
 pc.onsignalingstatechange=()=>{if(pc.signalingState==='stable'&&peer.renegotiate){peer.renegotiate=false;offer(id)}};
 pc.ontrack=e=>{
  if(e.track.kind==='audio'){audio.srcObject=e.streams[0]||new MediaStream([e.track]);audio.muted=voice?.deafened||false;audio.play().catch(()=>{});return}
  if(e.track.kind==='video'){
   const show=()=>{if(voice?.peers.get(id)===peer)remoteScreen(id,e.track)};
   e.track.onunmute=show;e.track.onmute=()=>removeRemoteScreen(id);e.track.onended=()=>removeRemoteScreen(id);
   if(!e.track.muted)show();
  }
 };
 pc.onicecandidate=e=>{if(e.candidate)sendSignal(id,'candidate',e.candidate.toJSON())};
 pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'){notice('Voice connection failed. A TURN relay may be needed on this network.')}};
 return peer;
}
async function offer(id){
 const peer=getPeer(id);if(!peer)return;
 if(peer.makingOffer||peer.pc.signalingState!=='stable'){peer.renegotiate=true;return}
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
   const collision=peer.makingOffer||peer.pc.signalingState!=='stable';
   peer.ignoreOffer=collision&&myId()<payload.from;
   if(peer.ignoreOffer)return;
   if(collision)await peer.pc.setLocalDescription({type:'rollback'});
   await peer.pc.setRemoteDescription(payload.data);
   await peer.pc.setLocalDescription(await peer.pc.createAnswer());
   await sendSignal(payload.from,'answer',peer.pc.localDescription);
  }else if(payload.kind==='answer'&&peer.pc.signalingState==='have-local-offer'){
   await peer.pc.setRemoteDescription(payload.data);
  }else if(payload.kind==='candidate'){
   if(peer.ignoreOffer)return;
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
 if(voice?.id===c.id)return true;
 if(!navigator.mediaDevices?.getUserMedia||!window.RTCPeerConnection){notice('Voice chat needs a secure browser with WebRTC and microphone support.');return false;}
 stopVoice();
 let stream;
 try{stream=await navigator.mediaDevices.getUserMedia({audio:micConstraints(selectedMic),video:false})}
 catch(e){
  if(selectedMic&&['OverconstrainedError','NotFoundError'].includes(e.name)){
   saveMic('');
   try{stream=await navigator.mediaDevices.getUserMedia({audio:micConstraints(''),video:false});notice('Selected microphone unavailable; using system default.')}
   catch{notice('Microphone access is required to join voice chat.');return false}
  }else{notice('Microphone access is required to join voice chat.');return false}
 }
 const id=c.id;
 const channel=sb.channel('lc-voice-'+id,{config:{private:true,presence:{key:myId()}}});
 const v={id,stream,channel,peers:new Map(),muted:false,deafened:false,screens:new Map(),screenStream:null,selectedScreen:null,hiddenScreen:false};
 voice=v;
 channel.on('broadcast',{event:'rtc'},({payload})=>signal(payload));
 channel.on('broadcast',{event:'screen'},({payload})=>{if(voice===v&&payload?.from!==myId()&&voiceUsers().includes(payload.from)&&payload.active===false)removeRemoteScreen(payload.from)});
 channel.on('presence',{event:'sync'},()=>synchronizePeers());
 const connected=await new Promise(resolve=>{
  let resolved=false;
  const done=value=>{if(resolved)return;resolved=true;clearTimeout(timer);resolve(value)};
  const timer=setTimeout(()=>done(false),12000);
  channel.subscribe(async(status,error)=>{
   if(voice!==v)return done(false);
   if(status==='SUBSCRIBED'){
    try{await channel.track({user_id:myId(),joined_at:new Date().toISOString()});done(true)}
    catch(e){console.warn('Voice presence unavailable',e);done(false)}
   }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED')done(false);
  });
 });
 if(!connected){notice('Private voice room could not connect. Please try again.');stopVoice();return false;}
 refreshVoiceUI();notice('Microphone is on. You joined the voice room.');return true;
}
function stopVoice(){
 if(!voice)return;
 const v=voice;voice=null;closeMicSettings();
 for(const p of v.peers.values()){try{p.pc.close()}catch{}p.audio.remove()}
 for(const t of v.screenStream?.getTracks()||[]){t.onended=null;t.stop()}
 for(const t of v.stream.getTracks())t.stop();
 document.getElementById('lcScreenViewer')?.remove();window.LoliteChatCalls?.refreshDock?.();
 client()?.removeChannel(v.channel)?.catch?.(()=>{});
 refreshVoiceUI();window.LoliteChatCalls?.voiceStopped?.();
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-lc-voice]');if(!b||!root()?.contains(b))return;
 e.preventDefault();e.stopPropagation();
 switch(b.dataset.lcVoice){
  case 'join':await joinVoice();break;
  case 'leave':stopVoice();break;
  case 'mute':if(voice){voice.muted=!voice.muted;voice.stream.getAudioTracks().forEach(t=>t.enabled=!voice.muted);refreshVoiceUI()}break;
  case 'deafen':if(voice){voice.deafened=!voice.deafened;for(const p of voice.peers.values())p.audio.muted=voice.deafened;refreshVoiceUI()}break;
  case 'screen':if(voice?.screenStream)await stopScreenShare();else await startScreenShare();break;
  case 'viewScreen':if(voice){voice.hiddenScreen=false;renderScreen()}break;
 }
});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-lc-screen]');if(!b)return;
 e.preventDefault();e.stopPropagation();
 if(b.dataset.lcScreen==='hide'){if(voice){voice.hiddenScreen=true;renderScreen()}}
 else if(b.dataset.lcScreen==='stop')stopScreenShare();
});
function afterRender(){
 if(!state()?.user){focusedProfile=null;stopVoice();return}
 showVoiceUI();if(focusedProfile)paintProfile();
 if(conversation()){showReadReceipts().catch(console.error)}
 poll().catch(console.error);
}
window.LoliteChatExtra={afterRender,stopVoice,joinVoice,openMicSettings,micName,startScreenShare,stopScreenShare,hasScreen:()=>!!voice?.screenStream,hasAnyScreen:()=>!!voice?.screens.size,viewScreen:()=>{if(voice){voice.hiddenScreen=false;renderScreen()}},isMuted:()=>!!voice?.muted,toggleMute:()=>{if(voice){voice.muted=!voice.muted;voice.stream.getAudioTracks().forEach(t=>t.enabled=!voice.muted);refreshVoiceUI()}},closeProfile:()=>{focusedProfile=null;root()?.querySelector('.lc-user-modal')?.remove()}};
})();