/* Lolite Chat Calls — real invitations and incoming/outgoing voice calls. */
(()=>{
'use strict';
const chat=()=>window.LoliteChat;
const extra=()=>window.LoliteChatExtra;
const sb=()=>chat()?.getClient?.();
const s=()=>chat()?.getState?.();
const uid=()=>s()?.user?.id||signedIn;
const root=()=>document.querySelector('.window[data-window-id="chatroom"] #lcRoot');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;','"':'&quot;'}[c]));
const p=id=>s()?.profiles?.find(x=>x.id===id);
const profile=id=>p(id)||profileCache.get(id);
const name=id=>profile(id)?.display_name||profile(id)?.username||'Lolite user';
const username=id=>profile(id)?.username?'@'+profile(id).username:'Lolite Chat';
const avatar=id=>esc((profile(id)?.avatar||name(id).slice(0,2)).slice(0,2).toUpperCase());
async function fetchMissingProfiles(ids){
 const missing=[...new Set(ids.filter(Boolean))].filter(id=>!profile(id));
 if(!missing.length||!sb())return;
 try{
  const result=await sb().from('profiles').select('id,username,display_name,avatar').in('id',missing);
  if(result.error)throw result.error;
  for(const user of result.data||[])profileCache.set(user.id,user);
  if(activeInvite)renderIncoming();
  if(currentCall)updateCallDock();
 }catch(e){console.debug('Could not resolve call participants',e)}
}
const ico=(k,size=18)=>window.LoliteChatIcons?.(k,size)||'';
const members=id=>(s()?.members||[]).filter(x=>x.conversation_id===id).map(x=>x.user_id);
const friends=()=>{const x=s();return (x?.requests||[]).filter(r=>r.status==='accepted').map(r=>r.from_id===uid()?r.to_id:r.from_id).filter(id=>id!==uid()&&!x.blocks.some(b=>b.blocked_id===id))};
let signedIn=null,interval=null,subscription=null,checking=false,answerBusy=false;
let currentCall=null,activeInvite=null,displayedInviteId=null,lastCallStatus='',sending=false;
let callMinimized=false,callConnectedAt=0,callTicker=null;
const profileCache=new Map();
function say(txt){
 const parent=root()||document.body,d=document.createElement('div');
 d.className='lc-toast';d.textContent=txt;parent.appendChild(d);setTimeout(()=>d.remove(),3800);
}
const check=(result)=>{if(result.error)throw Error(result.error.message||'Server unavailable');return result.data};
function conversationName(convId){
 const c=s()?.conversations.find(c=>c.id===convId);
 return c?.type==='group'?(c.name||'Group chat'):name(members(convId).find(id=>id!==uid()));
}
async function openConversation(id){
 if(!root())chat()?.open();
 // Populate membership and conversation state first, even when answering a call
 // from the Windows notification while Lolite Chat was closed.
 if(!s()?.user||!s()?.conversations?.length)await chat().refresh();
 const c=s()?.conversations.find(x=>x.id===id);
 if(!c)throw Error('This conversation is not available. Open Lolite Chat and try again.');
 s().view='conversation';s().conversationId=id;s().replyTo=null;s().search='';s().showPins=false;
 await chat().refresh();
}
async function createFriendChat(id){
 if(!friends().includes(id))throw Error('Only friends can be called. Send a friend request first.');
 // The chat creation RPC returns an ID; avoid relying on stale refreshed arrays.
 const conversationId=await chat().createDM(id);
 if(!conversationId)throw Error('Could not start your direct message. Try again.');
 return conversationId;
}
function renderCallsHtml(){
 const list=(s()?.conversations||[]).filter(c=>c.type==='group'&&members(c.id).includes(uid()));
 const fs=friends().map(id=>p(id)).filter(Boolean);
 return '<main class="lc-main"><div class="lc-calls-home">'+
 '<div class="lc-calls-hero"><div class="lc-calls-symbol">'+ico('phone',29)+'</div><div><h2>Voice & screen sharing</h2><p>Call friends or groups, then share a screen, window, or tab. Screen sharing only starts when you choose it.</p></div></div>'+
 '<h3>Call friends</h3>'+(fs.length?'<div class="lc-call-grid">'+fs.map(user=>
 '<article class="lc-call-card"><div class="lc-avatar">'+esc((user.avatar||name(user.id).slice(0,2)).toUpperCase())+'</div><div class="lc-call-details"><strong>'+esc(name(user.id))+'</strong><small>@'+esc(user.username)+'</small></div><button type="button" class="lc-primary" data-lc-call="friend" data-lc-id="'+esc(user.id)+'">'+ico('phone',16)+' Call</button></article>').join('')+'</div>':'<p class="lc-muted">No friends added yet. Open Friends to send someone a request, then call them here.</p><button class="lc-secondary" data-lc-action="friends">Find friends</button>')+
 '<h3>Group calls</h3>'+(list.length?'<div class="lc-call-grid">'+list.map(c=>
 '<article class="lc-call-card"><div class="lc-call-group-icon">'+ico('users',20)+'</div><div class="lc-call-details"><strong>'+esc(c.name||'Group chat')+'</strong><small>'+members(c.id).length+' members</small></div><button type="button" class="lc-primary" data-lc-call="group" data-lc-id="'+esc(c.id)+'">'+ico('phone',16)+' Call group</button></article>').join('')+'</div>':'<p class="lc-muted">Start a group chat with your friends to call everyone together.</p><button class="lc-secondary" data-lc-action="group">Create group</button>')+
 '<div class="lc-calls-info">Calls use private-room signalling and WebRTC audio/video. Share screen is optional and your browser will ask what to share. You can stop at any time.</div></div></main>';
}
function afterRender(){
 if(!s()?.user)return;
 const r=root();if(!r)return;
 if(s().view==='conversation'){
  const conv=s().conversations.find(c=>c.id===s().conversationId);
  const head=r.querySelector('.lc-head');
  if(head&&conv&&['dm','group'].includes(conv.type)&&!head.querySelector('[data-lc-call]')){
   const btn=document.createElement('button');btn.type='button';btn.className='lc-primary lc-call-header';btn.dataset.lcCall='group';btn.dataset.lcId=conv.id;btn.innerHTML=ico('phone',15)+(conv.type==='group'?' Call group':' Call');btn.title='Ring everyone in this conversation';head.appendChild(btn);
  }
 }else if(s().view==='channel'){
  const head=r.querySelector('.lc-head');
  if(head&&!head.querySelector('[data-lc-call]')){
   const btn=document.createElement('button');btn.type='button';btn.className='lc-primary lc-call-header';btn.dataset.lcCall='show';btn.innerHTML=ico('phone',15)+' Voice & Calls';head.appendChild(btn);
  }
 }else if(s().view==='friends'){
  for(const card of r.querySelectorAll('.lc-card[data-lc-user]')){
   const id=card.dataset.lcUser,actions=card.querySelector('.lc-card-actions');
   if(friends().includes(id)&&actions&&!actions.querySelector('[data-lc-call]')){
    const b=document.createElement('button');b.type='button';b.className='lc-primary';b.innerHTML=ico('phone',14)+' Call';b.dataset.lcCall='friend';b.dataset.lcId=id;actions.prepend(b);
   }
  }
 }
 updateCallDock();
}
function showCalls(){
 if(!s()?.user)return chat()?.open();
 s().view='calls';s().conversationId=null;s().replyTo=null;
 chat().refresh();
}

function callParticipants(call){
 const conv=s()?.conversations.find(c=>c.id===call.conversation_id);
 const ids=call.role==='caller'
  ?(call.invites||[]).map(i=>i.user_id)
  :[call.initiated_by,...(call.invites||[]).filter(i=>i.user_id!==uid()).map(i=>i.user_id)];
 const unique=[...new Set(ids.filter(id=>id&&id!==uid()))];
 return {conv,ids:unique};
}
function callerVisual(id,extraClass=''){
 return '<div class="lc-call-person '+extraClass+'"><div class="lc-call-person-avatar">'+avatar(id)+'</div><div class="lc-call-person-text"><strong>'+esc(name(id))+'</strong><small>'+esc(username(id))+'</small></div></div>';
}
function callStatus(){
 if(!currentCall)return '';
 const accepted=(currentCall.invites||[]).filter(i=>i.status==='accepted').length;
 const ringing=(currentCall.invites||[]).filter(i=>i.status==='ringing').length;
 if(currentCall.role==='caller'){
  if(accepted){if(!callConnectedAt)callConnectedAt=Date.now();return 'Connected'+(ringing?' · '+ringing+' still ringing':'')}
  if(ringing)return 'Ringing…';
  return 'Waiting for someone to answer';
 }
 if(!callConnectedAt)callConnectedAt=Date.now();
 return 'Connected';
}
function elapsed(){
 if(!callConnectedAt)return '00:00';
 const seconds=Math.floor((Date.now()-callConnectedAt)/1000);
 return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
}
function renderCallWindow(){
 let el=document.getElementById('lcActiveCall');
 if(!currentCall||callMinimized){el?.remove();return}
 const call=currentCall,{conv,ids}=callParticipants(call);
 const group=conv?.type==='group',mainId=call.role==='caller'?ids[0]:call.initiated_by;
 const title=group?(conv.name||'Group call'):name(mainId);
 const status=callStatus();
 if(!el){el=document.createElement('section');el.id='lcActiveCall';el.className='lc-active-call';document.body.appendChild(el)}
 el.setAttribute('role','dialog');el.setAttribute('aria-label','Lolite call with '+title);
 el.innerHTML='<div class="lc-active-call-head"><span class="lc-call-live"><span class="lc-call-live-dot"></span> LOLITE CALL</span><button type="button" data-lc-call="minimize" title="Minimize call">—</button></div>'+
 '<div class="lc-active-call-body"><div class="lc-active-avatar '+(status.startsWith('Ringing')?'is-ringing':'')+'">'+(group?ico('users',45):avatar(mainId))+'</div>'+
 '<div class="lc-active-call-label">'+(group?'GROUP VOICE CALL':call.role==='caller'?'OUTGOING CALL':'VOICE CALL')+'</div>'+
 '<h2>'+esc(title)+'</h2><div class="lc-active-call-handle">'+esc(group?ids.length+' invited member'+(ids.length===1?'':'s'):username(mainId))+'</div>'+
 '<div class="lc-active-call-status">'+esc(status)+' <span class="lc-call-elapsed">'+elapsed()+'</span></div>'+
 (group?'<div class="lc-active-call-roster">'+ids.slice(0,12).map(id=>callerVisual(id)).join('')+'</div>':'')+
 '<div class="lc-active-call-actions"><button type="button" data-lc-call="toggleMute" class="lc-active-call-control">'+ico('phone',18)+'<span>'+(extra()?.isMuted?.()?'Unmute':'Mute')+'</span></button>'+
 '<button type="button" data-lc-call="screen" class="lc-active-call-control">'+ico('users',18)+'<span>'+(extra()?.hasScreen?.()?'Stop sharing':'Share screen')+'</span></button>'+
 '<button type="button" data-lc-call="hangup" class="lc-active-call-control lc-active-hangup">'+ico('phone',18)+'<span>End call</span></button></div>'+
 '<button type="button" data-lc-call="openActive" class="lc-active-openchat">Open conversation</button></div>';
}
function startCallTicker(){
 if(callTicker)return;
 callTicker=setInterval(()=>{
  const clock=document.querySelector('#lcActiveCall .lc-call-elapsed');
  if(clock)clock.textContent=elapsed();
  const dockClock=document.querySelector('#lcCallDock .lc-call-dock-time');
  if(dockClock)dockClock.textContent=elapsed();
 },1000);
}
function stopCallTicker(){if(callTicker){clearInterval(callTicker);callTicker=null}}

function renderDock(){
 let el=document.getElementById('lcCallDock');
 if(!currentCall){el?.remove();renderCallWindow();stopCallTicker();return}
 if(!el){el=document.createElement('div');el.id='lcCallDock';el.className='lc-call-dock';document.body.appendChild(el)}
 const status=callStatus();
 const {conv,ids}=callParticipants(currentCall);
 const target=conv?.type==='group'?(conv.name||'Group call'):name(currentCall.role==='caller'?ids[0]:currentCall.initiated_by);
 el.innerHTML='<div class="lc-call-dock-title"><div class="lc-call-icon lc-call-dock-avatar">'+(conv?.type==='group'?ico('users',19):avatar(currentCall.role==='caller'?ids[0]:currentCall.initiated_by))+'</div><div><strong>'+esc(target)+'</strong><small>'+esc(status)+' <span class="lc-call-dock-time">'+elapsed()+'</span></small></div></div>'+
 '<div class="lc-call-dock-actions"><button type="button" data-lc-call="restore">View call</button><button type="button" data-lc-call="openActive">Open chat</button><button type="button" data-lc-call="toggleMute">'+(extra()?.isMuted?.()?'Unmute':'Mute')+'</button><button type="button" data-lc-call="screen" class="'+(extra()?.hasScreen?.()?'lc-screen-active':'')+'">'+(extra()?.hasScreen?.()?'Stop sharing':'Share screen')+'</button>'+(extra()?.hasAnyScreen?.()?'<button type="button" data-lc-call="viewScreen">View screen</button>':'')+'<button type="button" data-lc-call="hangup" class="lc-call-end">End call</button></div>';
 startCallTicker();renderCallWindow();
}
function updateCallDock(){
 renderDock();
 const el=root();if(!el)return;
 const voiceBtn=el.querySelector('.lc-voice-join');
 if(voiceBtn&&currentCall&&s()?.conversationId===currentCall.conversation_id)voiceBtn.title='This voice room is hosting a call';
}
function cleanIncoming(){
 document.getElementById('lcIncomingCall')?.remove();
 activeInvite=null;displayedInviteId=null;
}
function renderIncoming(){
 if(!activeInvite||currentCall?.id===activeInvite.id){cleanIncoming();return}
 const caller=activeInvite.initiated_by,conv=s()?.conversations.find(c=>c.id===activeInvite.conversation_id);
 const group=conv?.type==='group';
 let box=document.getElementById('lcIncomingCall');
 if(!box){box=document.createElement('div');box.id='lcIncomingCall';box.className='lc-incoming-wrapper';document.body.appendChild(box)}
 box.innerHTML='<div class="lc-incoming-call" role="dialog" aria-label="Incoming call from '+esc(name(caller))+'" aria-live="polite">'+
 '<div class="lc-incoming-top"><span class="lc-call-live"><span class="lc-call-live-dot"></span> INCOMING CALL</span><span>LOLITE CHAT</span></div>'+
 '<div class="lc-incoming-avatar">'+avatar(caller)+'</div>'+
 '<div class="lc-incoming-kicker">'+(group?'GROUP CALL':'VOICE CALL')+'</div>'+
 '<h2>'+esc(name(caller))+'</h2><div class="lc-incoming-username">'+esc(username(caller))+'</div>'+
 '<p>'+esc(group?'Calling you in '+(conv.name||'a group chat'):'is calling you…')+'</p>'+
 '<div class="lc-incoming-actions">'+
 '<button type="button" data-lc-call="decline" class="lc-call-decline">'+ico('phone',20)+'<span>Decline</span></button>'+
 '<button type="button" data-lc-call="answer" class="lc-call-answer">'+ico('phone',20)+'<span>Answer</span></button></div>'+
 '<div class="lc-incoming-foot">Your microphone only turns on if you answer.</div></div>';
}
async function callNotification(c){
 if(displayedInviteId===c.id)return;
 displayedInviteId=c.id;
 if('Notification' in window&&Notification.permission==='granted'&&s()?.me?.status!=='dnd'){
  try{const n=new Notification('Incoming Lolite call',{body:'Voice call from '+name(c.initiated_by),tag:'lolite-call-'+c.id,icon:new URL('assets/lolite-glass-logo.svg',location.href).href});
    n.onclick=()=>{window.focus();chat()?.open();n.close()}
  }catch(e){console.debug('System notification unavailable',e)}
 }
}
async function checkIncoming(){
 const uidAtStart=signedIn,db=sb();
 if(!uidAtStart||!db||checking)return;checking=true;
 try{
  const waiting=check(await db.from('chat_call_invites').select('call_id,status').eq('user_id',uidAtStart).eq('status','ringing').limit(30));
  if(uidAtStart!==signedIn)return;
  const ids=(waiting||[]).map(x=>x.call_id);
  let calls=[];
  if(ids.length)calls=check(await db.from('chat_calls').select('id,conversation_id,initiated_by,status,expires_at,created_at').in('id',ids));
  if(uidAtStart!==signedIn)return;
  const now=Date.now(),eligible=(calls||[]).filter(c=>['ringing','active'].includes(c.status)&&new Date(c.expires_at).getTime()>now&&c.initiated_by!==uidAtStart);
  const next=eligible.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)).find(c=>c.id!==currentCall?.id)||null;
  if(next){
   const changed=activeInvite?.id!==next.id;
   activeInvite=next;renderIncoming();
   if(changed){
    fetchMissingProfiles([next.initiated_by])
     .catch(console.debug)
     .finally(()=>{if(activeInvite?.id===next.id)callNotification(next)});
   }else callNotification(next);
  }
  else if(activeInvite)cleanIncoming();
  if(currentCall){
   const r=await db.from('chat_calls').select('status,expires_at').eq('id',currentCall.id).maybeSingle();
   if(r.error)throw r.error;
   if(!r.data||r.data.status==='ended'||(r.data.status==='ringing'&&new Date(r.data.expires_at).getTime()<now)){
    say('The voice call has ended.');await hangup(false);return;
   }
   const invites=check(await db.from('chat_call_invites').select('user_id,status').eq('call_id',currentCall.id));
   if(currentCall){
    currentCall.invites=invites||[];
    if(currentCall.role==='recipient')currentCall.invites=currentCall.invites.filter(i=>i.user_id!==uid());
    if(currentCall.role==='caller'&&invites?.some(i=>i.status==='accepted')&&r.data.status==='ringing'){
     await db.from('chat_calls').update({status:'active'}).eq('id',currentCall.id).eq('initiated_by',uidAtStart);
   }}
   updateCallDock();
  }
 }catch(e){console.debug('Call status check:',e)}
 finally{checking=false}
}
async function hangup(update=true){
 const active=currentCall;currentCall=null;callMinimized=false;callConnectedAt=0;cleanIncoming();
 extra()?.stopVoice?.();
 updateCallDock();
 if(update&&active&&sb()){
  try{
   const result=active.role==='caller'?
    await sb().from('chat_calls').update({status:'ended',ended_at:new Date().toISOString()}).eq('id',active.id).eq('initiated_by',uid()):
    await sb().from('chat_call_invites').update({status:'left',updated_at:new Date().toISOString()}).eq('call_id',active.id).eq('user_id',uid());
   if(result.error)throw result.error;
  }catch(e){say('Could not update call status: '+e.message)}
 }
}
async function startCall(convId){
 if(sending)return;if(currentCall){say('Finish the current call before starting another.');return}
 let c=s()?.conversations.find(c=>c.id===convId);
 if(!c){await chat()?.refresh?.();c=s()?.conversations.find(c=>c.id===convId)}
 if(!c||!['dm','group'].includes(c.type))return say('Open a private chat or a group to call.');
 const targets=[...new Set(members(c.id))].filter(x=>x!==uid());
 if(!targets.length)return say('This chat has nobody else to call.');
 sending=true;
 try{
  extra()?.closeProfile?.();
  await openConversation(c.id);
  const ready=await extra()?.joinVoice?.();
  if(!ready)throw Error('Microphone/voice chat unavailable. Allow microphone access, then retry.');
  const created=check(await sb().from('chat_calls').insert({conversation_id:c.id,initiated_by:uid()}).select('id,conversation_id,initiated_by,status,expires_at').single());
  try{check(await sb().from('chat_call_invites').insert(targets.map(id=>({call_id:created.id,user_id:id}))))}
  catch(e){await sb().from('chat_calls').update({status:'ended'}).eq('id',created.id);throw e}
  currentCall={...created,role:'caller',invites:targets.map(user_id=>({user_id,status:'ringing'}))};
  callMinimized=false;callConnectedAt=0;
  fetchMissingProfiles(targets).catch(console.debug);
  updateCallDock();checkIncoming();say('Calling '+(c.type==='group'?'group members…':conversationName(c.id)+'…'));
 }catch(e){extra()?.stopVoice?.();say(e.message||'Unable to start call')}
 finally{sending=false}
}
async function callFriend(id){
 if(!id)return;
 try{const convId=await createFriendChat(id);await startCall(convId)}
 catch(e){say(e.message||'Unable to call this friend')}
}
async function answerCall(){
 if(answerBusy||!activeInvite)return;
 answerBusy=true;
 const call={...activeInvite};cleanIncoming();
 try{
  if(currentCall)throw Error('End the current call before answering another.');
  if(new Date(call.expires_at).getTime()<=Date.now())throw Error('The call has expired.');
  await openConversation(call.conversation_id);
  const ready=await extra()?.joinVoice?.();
  if(!ready)throw Error('Microphone permission is needed to answer. The call is still ringing.');
  check(await sb().from('chat_call_invites').update({status:'accepted',updated_at:new Date().toISOString()}).eq('call_id',call.id).eq('user_id',uid()).select('call_id').single());
  currentCall={...call,role:'recipient',invites:[]};callMinimized=false;callConnectedAt=Date.now();updateCallDock();say('Call connected');
 }catch(e){extra()?.stopVoice?.();say(e.message||'Could not answer call')}
 finally{answerBusy=false;checkIncoming()}
}
async function declineCall(){
 const invitation=activeInvite;if(!invitation)return;cleanIncoming();
 try{
  check(await sb().from('chat_call_invites').update({status:'declined',updated_at:new Date().toISOString()}).eq('call_id',invitation.id).eq('user_id',uid()));
  say('Call declined');
 }catch(e){say(e.message)}
}
function setAuth(id){
 if(signedIn===id)return;
 if(currentCall)hangup().catch(console.error);
 signedIn=id;profileCache.clear();cleanIncoming();
 if(interval){clearInterval(interval);interval=null}
 if(subscription){sb()?.removeChannel(subscription)?.catch?.(()=>{});subscription=null}
 if(id){
  checkIncoming();
  interval=setInterval(checkIncoming,5000);
  subscription=sb()?.channel('lc-incoming-'+id)
    .on('postgres_changes',{event:'*',schema:'public',table:'chat_call_invites',filter:'user_id=eq.'+id},()=>checkIncoming())
    .on('postgres_changes',{event:'*',schema:'public',table:'chat_calls'},()=>checkIncoming())
    .subscribe();
 }
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-lc-call]');if(!b)return;
 e.preventDefault();e.stopPropagation();
 const a=b.dataset.lcCall,id=b.dataset.lcId;
 try{
  if(a==='show'){showCalls();return}
  if(a==='friend'){await callFriend(id);return}
  if(a==='group'){await startCall(id);return}
  if(a==='answer'){await answerCall();return}
  if(a==='decline'){await declineCall();return}
  if(a==='hangup'){await hangup();return}
  if(a==='openActive'){if(currentCall)await openConversation(currentCall.conversation_id);return}
  if(a==='minimize'){callMinimized=true;renderCallWindow();return}
  if(a==='restore'){callMinimized=false;renderCallWindow();return}
  if(a==='toggleMute'){extra()?.toggleMute?.();updateCallDock();return}
  if(a==='screen'){if(extra()?.hasScreen?.())await extra()?.stopScreenShare?.();else await extra()?.startScreenShare?.();updateCallDock();return}
  if(a==='viewScreen'){extra()?.viewScreen?.();return}
 }catch(err){say(err.message||'Call action failed')}
});
const boot=async()=>{
 const db=sb();if(!db)return;
 try{const r=await db.auth.getUser();setAuth(r.data?.user?.id||null)}
 catch(e){console.debug('Voice calls: account unavailable',e)}
 db.auth.onAuthStateChange((_event,session)=>setTimeout(()=>setAuth(session?.user?.id||null),0));
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.LoliteChatCalls={renderCallsHtml,afterRender,showCalls,callFriend,startCall,hangup,refreshDock:updateCallDock,voiceStopped:()=>{if(currentCall)hangup().catch(console.error)}};
})();