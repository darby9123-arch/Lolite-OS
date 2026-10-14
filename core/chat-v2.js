/* Lolite Chat v3.10.0 — free online accounts, friends, DMs, groups, channels and moderation.
   Uses public Supabase key and Postgres RLS. Passwords are handled by Supabase Auth. */
(()=>{
'use strict';
const URL='https://rztxhwfdbrzuhdqpegar.supabase.co';
const KEY='sb_publishable_I3eswNK0zu8qQvDp1Kcfbw_zZzzi18u';
const sb=window.supabase?.createClient?.(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const $=sel=>document.querySelector('.window[data-window-id="chatroom"] #lcRoot '+sel);
const root=()=>document.querySelector('.window[data-window-id="chatroom"] #lcRoot');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const fmt=x=>esc(x).replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/(^|\s)\*([^*\n]+)\*/g,'$1<i>$2</i>').replace(/`([^`\n]+)`/g,'<code>$1</code>');
const state={user:null,me:null,profiles:[],conversations:[],members:[],requests:[],blocks:[],messages:[],reactions:[],view:'channel',channel:'general',conversationId:null,replyTo:null,authTab:'login',authError:'',search:'',modal:null,error:'',busy:false,again:false,loading:true};
const meId=()=>state.user?.id;
const person=id=>state.profiles.find(p=>p.id===id);
const self=()=>state.me||person(meId());
const label=p=>p?.display_name||p?.username||'Lolite User';
const initials=p=>(p?.avatar||label(p).slice(0,2)).slice(0,2).toUpperCase();
const avatar=p=>'<span class="lc-avatar">'+esc(initials(p))+'</span>';
const friends=()=>state.requests.filter(r=>r.status==='accepted').map(r=>person(r.from_id===meId()?r.to_id:r.from_id)).filter(Boolean);
const blocked=id=>state.blocks.some(b=>b.blocked_id===id);
const isFriend=id=>friends().some(p=>p.id===id);
const activeConv=()=>state.view==='channel'?state.conversations.find(c=>c.type==='channel'&&c.name===state.channel):state.conversations.find(c=>c.id===state.conversationId);
const memberIds=id=>state.members.filter(m=>m.conversation_id===id).map(m=>m.user_id);
const convLabel=c=>{if(!c)return 'Messages';if(c.type==='channel')return '# '+(c.name||'chat');if(c.type==='group')return c.name||'Group chat';return label(person(memberIds(c.id).find(id=>id!==meId())))};
const check=r=>{if(r?.error)throw Error(r.error.message||'Something went wrong.');return r?.data};
const flash=m=>{const r=root();if(!r)return;const d=document.createElement('div');d.className='lc-toast';d.textContent=m;r.appendChild(d);setTimeout(()=>d.remove(),3100)};
function unreadCount(){return state.requests.filter(r=>r.to_id===meId()&&r.status==='pending').length}
function authHtml(){
 return '<div class="lc-auth-screen"><div class="lc-auth"><div class="lc-logo">L</div><h1>Lolite Chat</h1><p>Message friends, join channels and stay connected. Free forever.</p>'+
 '<div class="lc-auth-tabs"><button type="button" data-lc-action="tabLogin" class="'+(state.authTab==='login'?'active':'')+'">Log in</button><button type="button" data-lc-action="tabRegister" class="'+(state.authTab==='register'?'active':'')+'">Create account</button></div>'+
 '<form data-lc-form="auth"><label>Username</label><input name="username" placeholder="your_username" pattern="[A-Za-z0-9_]{3,24}" minlength="3" maxlength="24" autocomplete="username" required>'+
 (state.authTab==='register'?'<label>Display name</label><input name="display" maxlength="32" placeholder="What friends will see" required>':'')+
 '<label>Password</label><input type="password" name="password" minlength="'+(state.authTab==='register'?'10':'1')+'" maxlength="72" autocomplete="'+(state.authTab==='login'?'current-password':'new-password')+'" required>'+
 (state.authTab==='register'?'<label>Confirm password</label><input type="password" name="confirm" minlength="10" autocomplete="new-password" required>':'')+
 (state.authError?'<div class="lc-error" role="alert">'+esc(state.authError)+'</div>':'')+
 '<button class="lc-primary" type="submit">'+(state.authTab==='register'?'Create free account':'Log in')+'</button></form>'+
 '<p class="lc-auth-hint">No Gmail or email needed. Your username and password work on other devices. Without an email, forgotten passwords cannot currently be reset, so keep yours safe.</p></div></div>';
}
function navItem(action,id,labelTxt,selected,icon){
 return '<button type="button" class="lc-side-row '+(selected?'active':'')+'" data-lc-action="'+action+'" data-lc-id="'+esc(id)+'">'+(icon||'')+'<span>'+esc(labelTxt)+'</span></button>';
}
function sideHtml(){
 let c=state.conversations.filter(c=>c.type==='channel').sort((a,b)=>a.name.localeCompare(b.name));
 const dms=state.conversations.filter(c=>c.type==='dm').sort((a,b)=>b.created_at.localeCompare(a.created_at));
 const groups=state.conversations.filter(c=>c.type==='group').sort((a,b)=>b.created_at.localeCompare(a.created_at));
 return '<aside class="lc-side"><div class="lc-side-head"><h2>Lolite Hub</h2><button class="lc-iconbtn" title="Create group" data-lc-action="group">＋</button></div>'+
 '<div class="lc-side-scroll"><div class="lc-section-title">Text channels</div>'+
 c.map(x=>navItem('channel',x.name,'# '+x.name,state.view==='channel'&&state.channel===x.name)).join('')+
 '<div class="lc-section-title">Direct messages</div>'+
 (dms.length?dms.map(x=>navItem('openConv',x.id,convLabel(x),state.view==='conversation'&&state.conversationId===x.id,avatar(person(memberIds(x.id).find(m=>m!==meId()))))).join(''):'<div class="lc-muted" style="padding:9px">Add a friend to begin.</div>')+
 '<div class="lc-section-title">Group chats <button class="lc-iconbtn" style="padding:0" data-lc-action="group" title="New group">＋</button></div>'+
 (groups.length?groups.map(x=>navItem('openConv',x.id,convLabel(x),state.view==='conversation'&&state.conversationId===x.id)).join(''):'<div class="lc-muted" style="padding:9px">No groups yet.</div>')+
 '</div><div class="lc-side-account">'+avatar(self())+'<span style="min-width:0;flex:1"><b>'+esc(label(self()))+'</b><small>@'+esc(self()?.username||'user')+'</small></span><button title="Edit profile" class="lc-iconbtn" data-lc-action="profile">⚙</button></div></aside>';
}
function railHtml(){
 return '<aside class="lc-rail"><div class="lc-logo">L</div>'+
 '<button title="Channels and chats" class="lc-rail-btn '+(['channel','conversation','browse'].includes(state.view)?'active':'')+'" data-lc-action="browse">⌂</button>'+
 '<button title="Friends" class="lc-rail-btn '+(state.view==='friends'?'active':'')+'" data-lc-action="friends">♧'+(unreadCount()?'<small style="font-size:9px;color:#fff">'+unreadCount()+'</small>':'')+'</button>'+
 '<button title="Add friend" class="lc-rail-btn" data-lc-action="addFriend">＋</button>'+
 '<button title="New group" class="lc-rail-btn" data-lc-action="group">☷</button>'+
 '<button title="Your profile" class="lc-rail-btn lc-rail-bottom '+(state.view==='profile'?'active':'')+'" data-lc-action="profileView">◎</button></aside>';
}
function messageHtml(m){
 const p=person(m.sender_id),own=m.sender_id===meId();
 const reply=state.messages.find(x=>x.id===m.reply_to);
 const react=state.reactions.filter(r=>r.message_id===m.id);
 const counts={};react.forEach(r=>{(counts[r.emoji]??=[]).push(r.user_id)});
 return '<article class="lc-msg" data-lc-message="'+m.id+'">'+avatar(p)+
 '<div class="lc-msg-body"><div class="lc-msg-title"><b>'+esc(label(p))+'</b><time>'+esc(new Date(m.created_at).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}))+'</time>'+
 (m.edited_at?'<small>(edited)</small>':'')+(m.is_pinned?'<small>📌 Pinned</small>':'')+'</div>'+
 (reply?'<div class="lc-replyref">↳ '+esc(label(person(reply.sender_id)))+': '+esc(reply.content.slice(0,75))+'</div>':'')+
 '<div class="lc-msg-content">'+fmt(m.content)+'</div>'+
 (Object.keys(counts).length?'<div class="lc-msg-reactions">'+Object.keys(counts).map(em=>'<button type="button" class="lc-reaction" data-lc-action="react" data-lc-id="'+m.id+'" data-lc-emoji="'+esc(em)+'">'+esc(em)+' '+counts[em].length+'</button>').join('')+'</div>':'')+
 '<div class="lc-msg-actions"><button type="button" data-lc-action="reply" data-lc-id="'+m.id+'">Reply</button>'+
 ['👍','❤️','😂'].map(em=>'<button type="button" aria-label="React '+esc(em)+'" data-lc-action="react" data-lc-id="'+m.id+'" data-lc-emoji="'+esc(em)+'">'+em+'</button>').join('')+
 (own?'<button type="button" data-lc-action="edit" data-lc-id="'+m.id+'">Edit</button><button type="button" data-lc-action="pin" data-lc-id="'+m.id+'">'+(m.is_pinned?'Unpin':'Pin')+'</button><button type="button" data-lc-action="delete" data-lc-id="'+m.id+'">Delete</button>':
 '<button type="button" data-lc-action="report" data-lc-id="'+m.id+'">Report</button>')+
 '</div></div></article>';
}
function chatHtml(){
 const c=activeConv();
 if(!c)return '<main class="lc-main"><div class="lc-placeholder"><div><h2>No chat selected</h2><p>Pick a channel or open a conversation.</p><button class="lc-primary" data-lc-action="browse">Browse chats</button></div></div></main>';
 const list=state.messages.filter(m=>!state.search.trim()||m.content.toLowerCase().includes(state.search.trim().toLowerCase()));
 const reply=state.messages.find(m=>m.id===state.replyTo);
 return '<main class="lc-main"><header class="lc-head"><div class="lc-head-title">'+esc(convLabel(c))+'</div><span class="lc-head-sub">'+(c.type==='channel'?'Lolite Hub · Public channel':c.type==='dm'?'Private conversation':'Private group chat')+'</span><button class="lc-iconbtn" title="Search messages" data-lc-action="search">⌕</button></header>'+
 (state.search!==''?'<div style="padding:10px 16px"><input aria-label="Search loaded messages" data-lc-search value="'+esc(state.search)+'" placeholder="Search last 100 messages…" style="width:100%;padding:8px;background:#101722;color:white;border:1px solid #394759;border-radius:7px"></div>':'')+
 '<section class="lc-message-scroll" aria-label="Chat messages">'+
 (list.length?list.map(messageHtml).join(''):'<div class="lc-placeholder"><div><h2>'+ (state.search?'No matching messages':'Start the conversation')+'</h2><p>'+ (state.search?'Try a different search.':'Your messages appear here, across devices.')+'</p></div></div>')+
 '</section><form class="lc-composer" data-lc-form="send">'+
 (reply?'<div class="lc-reply-bar"><span>Replying to '+esc(label(person(reply.sender_id)))+'</span><button type="button" class="lc-iconbtn" data-lc-action="cancelReply" aria-label="Cancel reply">×</button></div>':'')+
 '<div class="lc-compose-wrap"><textarea rows="1" maxlength="4000" name="message" data-lc-message-input placeholder="Message '+esc(convLabel(c))+'…" aria-label="Message text" required></textarea><button class="lc-send" type="submit">Send</button></div></form></main>';
}
function personCard(p,controls){
 return '<article class="lc-card">'+avatar(p)+'<div class="lc-card-info"><b>'+esc(label(p))+'</b><small>@'+esc(p.username)+' · '+esc(p.status||'online')+'</small></div><div class="lc-card-actions">'+controls+'</div></article>';
}
const tinyBtn=(name,action,id,extra='')=>'<button type="button" class="lc-secondary '+extra+'" data-lc-action="'+action+'" data-lc-id="'+esc(id)+'">'+name+'</button>';
function friendsHtml(){
 const accepted=friends().filter(p=>!blocked(p.id));
 const incoming=state.requests.filter(r=>r.to_id===meId()&&r.status==='pending');
 const outgoing=state.requests.filter(r=>r.from_id===meId()&&r.status==='pending');
 return '<main class="lc-main"><div class="lc-area"><h2>Friends</h2><p class="lc-muted">Keep in touch, accept requests and start private chats.</p><button class="lc-primary" data-lc-action="addFriend">＋ Add friend</button>'+
 '<div class="lc-section-title">Your friends · '+accepted.length+'</div>'+
 (accepted.length?accepted.map(p=>personCard(p,tinyBtn('Message','dm',p.id)+tinyBtn('Remove','unfriend',p.id)+tinyBtn('Block','block',p.id,'lc-danger'))).join(''):'<p class="lc-muted">No friends yet. Add someone by username.</p>')+
 '<div class="lc-section-title">Friend requests · '+incoming.length+'</div>'+
 (incoming.length?incoming.map(r=>person(r.from_id)).filter(Boolean).map(p=>{const r=incoming.find(x=>x.from_id===p.id);return personCard(p,tinyBtn('Accept','accept',r.id)+tinyBtn('Decline','decline',r.id))}).join(''):'<p class="lc-muted">No pending requests.</p>')+
 (outgoing.length?'<div class="lc-section-title">Sent requests</div>'+outgoing.map(r=>person(r.to_id)).filter(Boolean).map(p=>personCard(p,tinyBtn('Cancel','cancelRequest',state.requests.find(r=>r.to_id===p.id&&r.from_id===meId())?.id))).join(''):'')+
 (state.blocks.length?'<div class="lc-section-title">Blocked users</div>'+state.blocks.map(b=>person(b.blocked_id)).filter(Boolean).map(p=>personCard(p,tinyBtn('Unblock','unblock',p.id))).join(''):'')+
 '</div></main>';
}
function browseHtml(){
 const channels=state.conversations.filter(c=>c.type==='channel');
 const chats=state.conversations.filter(c=>c.type!=='channel');
 return '<main class="lc-main"><div class="lc-area"><h2>Your conversations</h2><p class="lc-muted">Join a public channel or continue a private chat.</p>'+
 '<div class="lc-section-title">Lolite Hub channels</div>'+
 channels.map(c=>'<button class="lc-side-row" data-lc-action="channel" data-lc-id="'+esc(c.name)+'"># '+esc(c.name)+'</button>').join('')+
 '<div class="lc-section-title">Private chats</div>'+
 (chats.length?chats.map(c=>'<button class="lc-side-row" data-lc-action="openConv" data-lc-id="'+c.id+'">◉ '+esc(convLabel(c))+'</button>').join(''):'<p class="lc-muted">Add friends or start a group chat to see them here.</p>')+
 '<div style="margin-top:22px"><button class="lc-primary" data-lc-action="group">New group chat</button></div></div></main>';
}
function profileHtml(){
 const p=self();
 return '<main class="lc-main"><div class="lc-area"><h2>Your profile</h2><p class="lc-muted">Your account is free, with no email or subscription required.</p>'+
 '<div class="lc-card">'+avatar(p)+'<div class="lc-card-info"><b>'+esc(label(p))+'</b><small>@'+esc(p?.username||'user')+'</small><small>'+esc(p?.about||'No bio yet')+'</small></div></div>'+
 '<div class="lc-pills"><span class="lc-pill">Username login</span><span class="lc-pill">No payment features</span><span class="lc-pill">Status: '+esc(p?.status||'online')+'</span></div>'+
 '<div style="margin-top:23px;display:flex;gap:9px;flex-wrap:wrap"><button class="lc-primary" data-lc-action="profile">Edit profile</button><button class="lc-secondary" data-lc-action="logout">Log out</button></div>'+
 '<p class="lc-muted" style="margin-top:22px">Keep your password safe. Without an email address, automatic password recovery is not yet available.</p></div></main>';
}
function modalHtml(){
 if(!state.modal)return '';
 const m=state.modal;let title='',body='';
 if(m.type==='addFriend'){title='Add a friend';body='<p>Enter their exact Lolite username. They can accept or decline the request.</p><form data-lc-form="addFriend"><label>Username</label><input name="username" placeholder="friend_username" maxlength="24" required><div class="lc-dialog-actions"><button class="lc-secondary" type="button" data-lc-action="closeModal">Cancel</button><button class="lc-primary">Send request</button></div></form>'}
 else if(m.type==='group'){title='New group chat';body='<p>Add friends by username, separated with commas. Groups are private to their members.</p><form data-lc-form="group"><label>Group name</label><input name="name" maxlength="50" required placeholder="Weekend crew"><label>Friends to add</label><input name="people" placeholder="alex, sam, jamie" required><div class="lc-dialog-actions"><button class="lc-secondary" type="button" data-lc-action="closeModal">Cancel</button><button class="lc-primary">Create group</button></div></form>'}
 else if(m.type==='profile'){title='Edit profile';const p=self();body='<form data-lc-form="profile"><label>Display name</label><input name="display" maxlength="32" value="'+esc(p?.display_name||'')+'" required><label>About me</label><textarea name="about" maxlength="160">'+esc(p?.about||'')+'</textarea><label>Avatar initials</label><input name="avatar" maxlength="2" value="'+esc(p?.avatar||'')+'"><label>Status</label><select name="status">'+['online','idle','dnd','invisible'].map(x=>'<option '+(p?.status===x?'selected':'')+' value="'+x+'">'+({online:'Online',idle:'Idle',dnd:'Do Not Disturb',invisible:'Invisible'}[x])+'</option>').join('')+'</select><div class="lc-dialog-actions"><button type="button" class="lc-secondary" data-lc-action="closeModal">Cancel</button><button class="lc-primary">Save</button></div></form>'}
 else if(m.type==='report'){title='Report message';body='<p>Help keep Lolite safe. Reports can be reviewed by moderators when moderation tools are available.</p><form data-lc-form="report"><label>Why are you reporting this?</label><textarea name="reason" required minlength="3" maxlength="500" placeholder="Describe the problem"></textarea><div class="lc-dialog-actions"><button class="lc-secondary" type="button" data-lc-action="closeModal">Cancel</button><button class="lc-primary" type="submit">Submit report</button></div></form>'}
 return '<div class="lc-modal-layer"><div class="lc-dialog" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><h2>'+title+'</h2>'+body+'</div></div>';
}
function render(){
 const r=root();if(!r)return;
 if(!sb){r.innerHTML='<div class="lc-placeholder"><div><h2>Chat library unavailable</h2><p>Check the network connection, then reopen Lolite Chat.</p></div></div>';return}
 if(state.loading){r.innerHTML='<div class="lc-loader">Connecting to Lolite Chat…</div>';return}
 if(state.error){r.innerHTML='<div class="lc-placeholder"><div><h2>Could not connect</h2><p>'+esc(state.error)+'</p><button class="lc-primary" data-lc-action="retry">Retry</button></div></div>';return}
 if(!state.user){r.innerHTML=authHtml();return}
 const main=state.view==='friends'?friendsHtml():state.view==='browse'?browseHtml():state.view==='profile'?profileHtml():chatHtml();
 r.innerHTML='<div class="lc-shell">'+railHtml()+sideHtml()+main+'</div>'+modalHtml();
 $('.lc-message-scroll')?.scrollTo(0,999999);
}
async function loadMessages(){
 const c=activeConv();
 if(!c){state.messages=[];state.reactions=[];return}
 const msgs=check(await sb.from('messages').select('id,conversation_id,sender_id,content,created_at,reply_to,edited_at,is_pinned').eq('conversation_id',c.id).order('created_at',{ascending:false}).limit(100));
 state.messages=(msgs||[]).reverse();
 const ids=state.messages.map(m=>m.id);
 state.reactions=ids.length?(check(await sb.from('message_reactions').select('message_id,user_id,emoji').in('message_id',ids))||[]):[];
}
let reloadLater=null,subscription=null,ticker=null;
function triggerReload(){clearTimeout(reloadLater);reloadLater=setTimeout(()=>refresh(true),340)}
async function subscribe(){
 if(subscription){await sb.removeChannel(subscription);subscription=null}
 if(!state.user)return;
 const c=activeConv();
 subscription=sb.channel('lc-live-'+meId()+'-'+(c?.id||'friends'));
 if(c){subscription.on('postgres_changes',{event:'*',schema:'public',table:'messages',filter:'conversation_id=eq.'+c.id},triggerReload);
   subscription.on('postgres_changes',{event:'*',schema:'public',table:'message_reactions'},triggerReload)}
 subscription.on('postgres_changes',{event:'*',schema:'public',table:'friend_requests'},triggerReload);
 subscription.subscribe();
}
async function refresh(quiet=false){
 if(state.busy){state.again=true;return}
 state.busy=true;state.error='';
 if(!quiet){state.loading=true;render()}
 try{
  const authResponse=await sb.auth.getUser();
  if(authResponse.error&&authResponse.error.name!=='AuthSessionMissingError')throw authResponse.error;
  const usr=authResponse.data?.user||null;
  state.user=usr||null;
  if(usr){
   const a=await Promise.all([
    sb.from('profiles').select('id,username,display_name,about,avatar,status').order('username').limit(1000),
    sb.from('conversations').select('id,type,name,created_by,created_at').order('created_at',{ascending:false}),
    sb.from('conversation_members').select('conversation_id,user_id'),
    sb.from('friend_requests').select('id,from_id,to_id,status,created_at'),
    sb.from('blocks').select('blocked_id')
   ]);
   a.forEach(check);
   [state.profiles,state.conversations,state.members,state.requests,state.blocks]=a.map(x=>x.data||[]);
   state.me=person(usr.id)||null;
   await loadMessages();
  }else{
   state.profiles=[];state.conversations=[];state.members=[];state.requests=[];state.blocks=[];state.messages=[];state.reactions=[];state.me=null;
  }
 }catch(e){state.error=String(e.message||e);console.error('Lolite Chat:',e)}
 finally{state.busy=false;state.loading=false;render();if(state.user&&!state.error){subscribe().catch(console.error)}if(state.again){state.again=false;queueMicrotask(()=>refresh(true))}}
}
async function login(username,password){
 return check(await sb.auth.signInWithPassword({email:username.toLowerCase()+'@accounts.lolite.chat',password}));
}
async function register(username,display,password){
 const {data,error}=await sb.functions.invoke('lolite-account',{body:{action:'register',username,display_name:display,password}});
 if(error)throw Error(data?.error||error.message||'Registration service failed');
 if(data?.error)throw Error(data.error);
 return login(username,password);
}
async function createDM(otherId){
 if(!otherId||otherId===meId())return;
 if(blocked(otherId))throw Error('Unblock this person before messaging.');
 const old=state.conversations.filter(c=>c.type==='dm').find(c=>{const ids=memberIds(c.id);return ids.length===2&&ids.includes(meId())&&ids.includes(otherId)});
 if(old){state.view='conversation';state.conversationId=old.id;return refresh(true)}
 const conv=check(await sb.from('conversations').insert({type:'dm',name:null,created_by:meId()}).select('id').single());
 check(await sb.from('conversation_members').insert([{conversation_id:conv.id,user_id:meId()},{conversation_id:conv.id,user_id:otherId}]));
 state.view='conversation';state.conversationId=conv.id;return refresh(true);
}
async function requestFriend(username){
 username=username.trim().toLowerCase();
 const p=state.profiles.find(p=>p.username===username);
 if(!p)throw Error('User not found. Check the username.');
 if(p.id===meId())throw Error('You cannot add yourself.');
 if(blocked(p.id))throw Error('Unblock this user first.');
 if(isFriend(p.id))throw Error('You are already friends.');
 if(state.requests.some(r=>r.from_id===meId()&&r.to_id===p.id&&r.status==='pending'))throw Error('Friend request already sent.');
 if(state.requests.some(r=>r.to_id===meId()&&r.from_id===p.id&&r.status==='pending'))throw Error('They already sent you a request! Accept it in Friends.');
 const old=state.requests.find(r=>r.from_id===meId()&&r.to_id===p.id);
 if(old)check(await sb.from('friend_requests').delete().eq('id',old.id));
 check(await sb.from('friend_requests').insert({from_id:meId(),to_id:p.id,status:'pending'}));
}
async function react(messageId,emoji){
 const mine=state.reactions.some(r=>r.message_id===messageId&&r.emoji===emoji&&r.user_id===meId());
 if(mine)check(await sb.from('message_reactions').delete().match({message_id:messageId,user_id:meId(),emoji}));
 else check(await sb.from('message_reactions').insert({message_id:messageId,user_id:meId(),emoji}));
 return refresh(true);
}
async function dispatch(action,id,button){
 switch(action){
 case 'retry':return refresh();
 case 'tabLogin':state.authTab='login';state.authError='';return render();
 case 'tabRegister':state.authTab='register';state.authError='';return render();
 case 'browse':state.view='browse';state.replyTo=null;return refresh(true);
 case 'friends':state.view='friends';state.replyTo=null;return refresh(true);
 case 'profileView':state.view='profile';state.replyTo=null;return render();
 case 'channel':state.view='channel';state.channel=id;state.conversationId=null;state.search='';state.replyTo=null;return refresh(true);
 case 'openConv':state.view='conversation';state.conversationId=id;state.search='';state.replyTo=null;return refresh(true);
 case 'addFriend':state.modal={type:'addFriend'};return render();
 case 'group':state.modal={type:'group'};return render();
 case 'profile':state.modal={type:'profile'};return render();
 case 'closeModal':state.modal=null;return render();
 case 'dm':return createDM(id);
 case 'reply':state.replyTo=Number(id);render();return $('[data-lc-message-input]')?.focus();
 case 'cancelReply':state.replyTo=null;return render();
 case 'react':return react(Number(id),button.dataset.lcEmoji);
 case 'search':state.search=state.search?'':' ';return render();
 case 'edit':{const m=state.messages.find(m=>m.id===Number(id));if(!m||m.sender_id!==meId())return;const value=prompt('Edit your message:',m.content);if(value===null||!value.trim()||value===m.content)return;check(await sb.from('messages').update({content:value.trim(),edited_at:new Date().toISOString()}).eq('id',m.id));return refresh(true)}
 case 'delete':{const m=state.messages.find(m=>m.id===Number(id));if(!m||m.sender_id!==meId()||!confirm('Delete your message?'))return;check(await sb.from('messages').delete().eq('id',m.id));return refresh(true)}
 case 'pin':{const m=state.messages.find(m=>m.id===Number(id));if(!m||m.sender_id!==meId())return;check(await sb.from('messages').update({is_pinned:!m.is_pinned}).eq('id',m.id));return refresh(true)}
 case 'report':state.modal={type:'report',messageId:Number(id)};return render();
 case 'logout':{await sb.auth.signOut();state.view='channel';state.channel='general';state.conversationId=null;state.modal=null;return refresh(true)}
 case 'accept':case 'decline':check(await sb.from('friend_requests').update({status:action==='accept'?'accepted':'declined'}).eq('id',id).eq('to_id',meId()));return refresh(true);
 case 'cancelRequest':check(await sb.from('friend_requests').delete().eq('id',id));return refresh(true);
 case 'unfriend':{if(!confirm('Remove this friend?'))return;const requests=state.requests.filter(r=>r.status==='accepted'&&((r.from_id===id&&r.to_id===meId())||(r.to_id===id&&r.from_id===meId())));for(const item of requests)check(await sb.from('friend_requests').delete().eq('id',item.id));return refresh(true)}
 case 'block':{if(!confirm('Block this user? They will no longer be able to send you direct messages.'))return;check(await sb.from('blocks').insert({blocker_id:meId(),blocked_id:id}));return refresh(true)}
 case 'unblock':check(await sb.from('blocks').delete().match({blocker_id:meId(),blocked_id:id}));return refresh(true);
 }
}
async function handleForm(form){
 const type=form.dataset.lcForm,fd=new FormData(form);
 if(type==='auth'){
  const username=String(fd.get('username')||'').trim().toLowerCase(),pw=String(fd.get('password')||'');
  state.authError='';
  try{
   if(!/^[a-z0-9_]{3,24}$/.test(username))throw Error('Use 3–24 letters, numbers or underscores.');
   if(state.authTab==='register'){
    if(pw!==fd.get('confirm'))throw Error('Passwords do not match.');
    if(pw.length<10)throw Error('Use a password with at least 10 characters.');
    const display=String(fd.get('display')||'').trim();if(!display)throw Error('Enter a display name.');
    await register(username,display,pw);
   }else await login(username,pw);
   await refresh();
  }catch(e){state.authError=String(e.message||e);render()}
  return;
 }
 if(type==='send'){
  const c=activeConv(),text=String(fd.get('message')||'').trim();
  if(!c||!text)return;
  if(text.length>4000)throw Error('Messages must be 4,000 characters or less.');
  check(await sb.from('messages').insert({conversation_id:c.id,sender_id:meId(),content:text,reply_to:state.replyTo||null}));
  state.replyTo=null;state.search='';return refresh(true);
 }
 if(type==='addFriend'){await requestFriend(String(fd.get('username')||''));state.modal=null;await refresh(true);return flash('Friend request sent!')}
 if(type==='group'){
  const name=String(fd.get('name')||'').trim();
  if(!name||name.length>50)throw Error('Group name must be 1–50 characters.');
  const names=String(fd.get('people')||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);
  const unique=[...new Set(names)];
  if(!unique.length||unique.length>12)throw Error('Add 1–12 friends.');
  const people=unique.map(n=>state.profiles.find(p=>p.username===n));
  if(people.some(p=>!p||!isFriend(p.id)||blocked(p.id)))throw Error('All group members must be your friends. Check their usernames.');
  const c=check(await sb.from('conversations').insert({type:'group',name,created_by:meId()}).select('id').single());
  check(await sb.from('conversation_members').insert([{conversation_id:c.id,user_id:meId()},...people.map(p=>({conversation_id:c.id,user_id:p.id}))]));
  state.modal=null;state.view='conversation';state.conversationId=c.id;return refresh(true);
 }
 if(type==='profile'){
  const display=String(fd.get('display')||'').trim().slice(0,32),about=String(fd.get('about')||'').trim().slice(0,160),avatar=String(fd.get('avatar')||'').trim().slice(0,2).toUpperCase(),status=String(fd.get('status')||'online');
  if(!display)throw Error('Enter your display name.');
  if(!['online','idle','dnd','invisible'].includes(status))throw Error('Invalid status.');
  check(await sb.from('profiles').update({display_name:display,about,avatar,status,updated_at:new Date().toISOString()}).eq('id',meId()));
  state.modal=null;return refresh(true);
 }
 if(type==='report'){
  const reason=String(fd.get('reason')||'').trim();if(reason.length<3)throw Error('Add a short reason.');
  check(await sb.from('chat_reports').insert({reporter_id:meId(),message_id:state.modal?.messageId,reason}));
  state.modal=null;await refresh(true);return flash('Report submitted.');
 }
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-lc-action]');if(!b||!root()?.contains(b))return;
 e.preventDefault();
 try{await dispatch(b.dataset.lcAction,b.dataset.lcId,b)}
 catch(err){console.error('Lolite Chat action:',err);flash(String(err.message||err))}
});
document.addEventListener('submit',async e=>{
 const form=e.target.closest('form[data-lc-form]');if(!form||!root()?.contains(form))return;
 e.preventDefault();const btn=form.querySelector('[type=submit]');if(btn?.disabled)return;if(btn)btn.disabled=true;
 try{await handleForm(form)}catch(err){console.error('Lolite Chat form:',err);flash(String(err.message||err))}
 finally{if(btn?.isConnected)btn.disabled=false}
});
document.addEventListener('keydown',e=>{
 if(e.target.matches('[data-lc-message-input]')&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){
 e.preventDefault();e.target.form?.requestSubmit()
 }
 if(e.key==='Escape'&&state.modal&&root()){state.modal=null;render()}
});
document.addEventListener('input',e=>{
 if(e.target.matches('[data-lc-search]')){
  state.search=e.target.value;
  const list=$('.lc-message-scroll');
  if(list){const matches=state.messages.filter(m=>!state.search.trim()||m.content.toLowerCase().includes(state.search.trim().toLowerCase()));list.innerHTML=matches.length?matches.map(messageHtml).join(''):'<div class="lc-placeholder">No matching messages</div>'}
 }
});
let initialized=false;
async function activate(){
 if(!root())return;
 if(!sb){state.loading=false;render();return}
 if(!initialized){
  initialized=true;
  sb.auth.onAuthStateChange(()=>{setTimeout(()=>{if(root())refresh(true)},50)});
  ticker=setInterval(()=>{if(root()&&document.visibilityState==='visible'&&state.user&&!state.busy)refresh(true)},18000);
 }
 await refresh();
}
const oldPage=window.page;
window.page=function(id){
 if(id!=='chatroom')return oldPage(id);
 setTimeout(activate,0);
 return '<div class="lc-root" id="lcRoot"><div class="lc-loader">Opening Lolite Chat…</div></div>';
};
window.LoliteChat={open:()=>window.openApp('chatroom','Lolite Chat',1100,700),refresh:()=>refresh(true)};
})();