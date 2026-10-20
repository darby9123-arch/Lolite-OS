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
const name=id=>p(id)?.display_name||p(id)?.username||'Lolite user';
const ico=(k,size=18)=>window.LoliteChatIcons?.(k,size)||'';
const members=id=>(s()?.members||[]).filter(x=>x.conversation_id===id).map(x=>x.user_id);
const friends=()=>{const x=s();return (x?.requests||[]).filter(r=>r.status==='accepted').map(r=>r.from_id===uid()?r.to_id:r.from_id).filter(id=>id!==uid()&&!x.blocks.some(b=>b.blocked_id===id))};
let signedIn=null,interval=null,subscription=null,checking=false,answerBusy=false;
let currentCall=null,activeInvite=null,displayedInviteId=null,lastCallStatus='',sending=false;
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
 '<div class="lc-calls-hero"><div class="lc-calls-symbol">'+ico('phone',29)+'</div><div><h2>Voice calls</h2><p>Call a friend or start a group voice call. Your microphone is only used when you join or answer.</p></div></div>'+
 '<h3>Call friends</h3>'+(fs.length?'<div class="lc-call-grid">'+fs.map(user=>
 '<article class="lc-call-card"><div class="lc-avatar">'+esc((user.avatar||name(user.id).slice(0,2)).toUpperCase())+'</div><div class="lc-call-details"><strong>'+esc(name(user.id))+'</strong><small>@'+esc(user.username)+'</small></div><button type="button" class="lc-primary" data-lc-call="friend" data-lc-id="'+esc(user.id)+'">'+ico('phone',16)+' Call</button></article>').join('')+'</div>':'<p class="lc-muted">No friends added yet. Open Friends to send someone a request, then call them here.</p><button class="lc-secondary" data-lc-action="friends">Find friends</button>')+
 '<h3>Group calls</h3>'+(list.length?'<div class="lc-call-grid">'+list.map(c=>
 '<article class="lc-call-card"><div class="lc-call-group-icon">'+ico('users',20)+'</div><div class="lc-call-details"><strong>'+esc(c.name||'Group chat')+'</strong><small>'+members(c.id).length+' members</small></div><button type="button" class="lc-primary" data-lc-call="group" data-lc-id="'+esc(c.id)+'">'+ico('phone',16)+' Call group</button></article>').join('')+'</div>':'<p class="lc-muted">Start a group chat with your friends to call everyone together.</p><button class="lc-secondary" data-lc-action="group">Create group</button>')+
 '<div class="lc-calls-info">Calls use secure private-room signalling and WebRTC audio. You can mute or leave at any time. Everyone chooses whether to answer.</div></div></main>';
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
function renderDock(){
 let el=document.getElementById('lcCallDock');
 if(!currentCall){el?.remove();return}
 if(!el){el=document.createElement('div');el.id='lcCallDock';el.className='lc-call-dock';document.body.appendChild(el)}
 const others=(currentCall.invites||[]).filter(r=>r.status==='accepted').length;
 const ringing=(currentCall.invites||[]).filter(r=>r.status==='ringing').length;
 const status=currentCall.role==='caller'?
  (ringing?'Ringing '+ringing+' member'+(ringing===1?'':'s')+'…':others?'Connected with '+others+' member'+(others===1?'':'s'):'In voice room'):
  'In call with '+esc(conversationName(currentCall.conversation_id));
 el.innerHTML='<div class="lc-call-dock-title"><div class="lc-call-icon">'+ico('phone',20)+'</div><div><strong>'+esc(conversationName(currentCall.conversation_id))+'</strong><small>'+esc(status)+'</small></div></div>'+
 '<div class="lc-call-dock-actions"><button type="button" data-lc-call="openActive">Open chat</button><button type="button" data-lc-call="toggleMute">'+(extra()?.isMuted?.()?'Unmute':'Mute')+'</button><button type="button" data-lc-call="hangup" class="lc-call-end">End call</button></div>';
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
 let box=document.getElementById('lcIncomingCall');
 if(!box){box=document.createElement('div');box.id='lcIncomingCall';box.className='lc-incoming-wrapper';document.body.appendChild(box)}
 box.innerHTML='<div class="lc-incoming-call" role="dialog" aria-label="Incoming Lolite voice call" aria-live="assertive">'+
 '<div class="lc-incoming-ring">'+ico('phone',31)+'</div><small>INCOMING VOICE CALL</small><h2>'+esc(name(activeInvite.initiated_by))+'</h2>'+
 '<p>'+esc(conversationName(activeInvite.conversation_id))+'</p><div class="lc-incoming-actions">'+
 '<button type="button" data-lc-call="decline" class="lc-call-decline">Decline</button>'+
 '<button type="button" data-lc-call="answer" class="lc-call-answer">Answer</button></div></div>';
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
  if(next){activeInvite=next;renderIncoming();callNotification(next)}
  else if(activeInvite)cleanIncoming();
  if(currentCall){
   const r=await db.from('chat_calls').select('status,expires_at').eq('id',currentCall.id).maybeSingle();
   if(r.error)throw r.error;
   if(!r.data||r.data.status==='ended'||(r.data.status==='ringing'&&new Date(r.data.expires_at).getTime()<now)){
    say('The voice call has ended.');await hangup(false);return;
   }
   const invites=check(await db.from('chat_call_invites').select('user_id,status').eq('call_id',currentCall.id));
   if(currentCall){currentCall.invites=invites||[];if(currentCall.role==='caller'&&invites?.some(i=>i.status==='accepted')&&r.data.status==='ringing'){
     await db.from('chat_calls').update({status:'active'}).eq('id',currentCall.id).eq('initiated_by',uidAtStart);
   }}
   updateCallDock();
  }
 }catch(e){console.debug('Call status check:',e)}
 finally{checking=false}
}
async function hangup(update=true){
 const active=currentCall;currentCall=null;cleanIncoming();
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
  currentCall={...call,role:'recipient',invites:[]};updateCallDock();say('Call connected');
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
 signedIn=id;cleanIncoming();
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
  if(a==='toggleMute'){extra()?.toggleMute?.();updateCallDock();return}
 }catch(err){say(err.message||'Call action failed')}
});
const boot=async()=>{
 const db=sb();if(!db)return;
 try{const r=await db.auth.getUser();setAuth(r.data?.user?.id||null)}
 catch(e){console.debug('Voice calls: account unavailable',e)}
 db.auth.onAuthStateChange((_event,session)=>setTimeout(()=>setAuth(session?.user?.id||null),0));
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.LoliteChatCalls={renderCallsHtml,afterRender,showCalls,callFriend,startCall,hangup,voiceStopped:()=>{if(currentCall)hangup().catch(console.error)}};
})();