/* Lolite Chat v3.10.0 — free online accounts, friends, DMs, groups, channels and moderation.
   Uses public Supabase key and Postgres RLS. Passwords are handled by Supabase Auth. */
(()=>{
'use strict';
const URL='https://rztxhwfdbrzuhdqpegar.supabase.co';
const KEY='sb_publishable_I3eswNK0zu8qQvDp1Kcfbw_zZzzi18u';
const sb=window.LoliteBrowserAccounts?.getClient?.() || window.supabase?.createClient?.(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const $=sel=>document.querySelector('.window[data-window-id="chatroom"] #lcRoot '+sel);
const root=()=>document.querySelector('.window[data-window-id="chatroom"] #lcRoot');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const fmt=x=>esc(x).replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/(^|\s)\*([^*\n]+)\*/g,'$1<i>$2</i>').replace(/`([^`\n]+)`/g,'<code>$1</code>');

const lcPaths={
 chat:'<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-4 3v-8A7.5 7.5 0 0 1 9.5 6H12a8 8 0 0 1 8 5.5Z"/><path d="M9 10h7M9 14h5"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.35 1.91.69 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.69A2 2 0 0 1 22 16.92Z"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 search:'<circle cx="10.8" cy="10.8" r="7.5"/><path d="m16.5 16.5 5 5"/>',
 hash:'<path d="M5 9h14M4 15h14M11 3 7 21M17 3l-4 18"/>',
 group:'<rect x="2.5" y="5" width="19" height="15" rx="3"/><circle cx="9" cy="11" r="2"/><path d="M5.5 17c.2-1.5 1.5-2.4 3.5-2.4s3.3.9 3.5 2.4M15 10h4M15 14h3"/>',
 back:'<path d="m15 18-6-6 6-6"/>',
 pin:'<path d="m16 3 5 5-3 1-4 4-1 5-2-2-5-5 5-1 4-4 1-3ZM2 22l7-7"/>',
 send:'<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 shield:'<path d="m12 22 7-4V6l-7-4-7 4v12l7 4Z"/><path d="m9 12 2 2 4-4"/>'
};
const lcIcon=(key,size=18)=>'<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(lcPaths[key]||lcPaths.chat)+'</svg>';

const state={user:null,me:null,profiles:[],conversations:[],members:[],requests:[],blocks:[],messages:[],reactions:[],view:'browse',channel:'general',conversationId:null,replyTo:null,authTab:'login',authError:'',search:'',sidebarQuery:'',modal:null,showPins:false,error:'',busy:false,again:false,loading:true};
const meId=()=>state.user?.id;
const person=id=>state.profiles.find(p=>p.id===id);
const self=()=>state.me||person(meId());
const label=p=>p?.display_name||p?.username||'Lolite User';
const initials=p=>(p?.avatar||label(p).slice(0,2)).slice(0,2).toUpperCase();
const avatar=p=>'<span class="lc-avatar">'+esc(initials(p))+'</span>';
const friends=()=>[...new Map(state.requests.filter(r=>r.status==='accepted').map(r=>person(r.from_id===meId()?r.to_id:r.from_id)).filter(Boolean).map(p=>[p.id,p])).values()];
const blocked=id=>state.blocks.some(b=>b.blocked_id===id);
const isFriend=id=>friends().some(p=>p.id===id);
const activeConv=()=>state.view==='channel'?state.conversations.find(c=>c.type==='channel'&&c.name===state.channel):state.conversations.find(c=>c.id===state.conversationId);
const memberIds=id=>state.members.filter(m=>m.conversation_id===id).map(m=>m.user_id);
const convLabel=c=>{if(!c)return 'Messages';if(c.type==='channel')return '# '+(c.name||'chat');if(c.type==='group')return c.name||'Group chat';return label(person(memberIds(c.id).find(id=>id!==meId())))};
const check=r=>{if(r?.error){const err=r.error;throw Error((err.message||'Something went wrong.')+(err.code?' ['+err.code+']':''))}return r?.data};
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
 '<button class="lc-primary" type="submit">'+(state.authTab==='register'?'Create account':'Log in')+'</button></form>'+
 '<p class="lc-auth-hint">No Gmail or email needed. Your username and password work on other devices. Without an email, forgotten passwords cannot currently be reset, so keep yours safe.</p></div></div>';
}

function navItem(action,id,name,selected,picture,description=''){
 return '<button type="button" class="lc-side-row '+(selected?'active':'')+'" data-lc-action="'+action+'" data-lc-id="'+esc(id)+'" title="'+esc(name)+'" '+(selected?'aria-current="page"':'')+'>'+
 '<span class="lc-side-thumb">'+(picture||'<span class="lc-list-icon">'+lcIcon('chat',17)+'</span>')+'</span>'+
 '<span class="lc-side-label"><strong>'+esc(name)+'</strong>'+(description?'<small>'+esc(description)+'</small>':'')+'</span></button>';
}
function sideContents(){
 const query=(state.sidebarQuery||'').trim().toLowerCase();
 const matches=s=>!query||String(s).toLowerCase().includes(query);
 const dms=state.conversations.filter(c=>c.type==='dm'&&matches(convLabel(c))).sort((a,b)=>b.created_at.localeCompare(a.created_at));
 const groups=state.conversations.filter(c=>c.type==='group'&&matches(convLabel(c))).sort((a,b)=>b.created_at.localeCompare(a.created_at));
 const channels=state.conversations.filter(c=>c.type==='channel'&&matches(c.name)).sort((a,b)=>a.name.localeCompare(b.name));
 const section=(title,count,html)=>'<div class="lc-section-title"><span>'+title+'</span><span class="lc-section-count">'+count+'</span></div>'+html;
 const direct=section('Direct messages',dms.length,dms.map(c=>navItem('openConv',c.id,convLabel(c),state.view==='conversation'&&state.conversationId===c.id,avatar(person(memberIds(c.id).find(id=>id!==meId()))),'Private chat')).join('')||(!query?'<div class="lc-list-empty">No messages yet. Open Friends to get started.</div>':''));
 const groupList=section('Groups',groups.length,groups.map(c=>navItem('openConv',c.id,convLabel(c),state.view==='conversation'&&state.conversationId===c.id,'<span class="lc-list-icon lc-list-group">'+lcIcon('users',17)+'</span>',memberIds(c.id).length+' members')).join('')||(!query?'<div class="lc-list-empty">Your groups appear here.</div>':''));
 const channelList=section('Community',channels.length,channels.map(c=>navItem('channel',c.name,'# '+c.name,state.view==='channel'&&state.channel===c.name,'<span class="lc-list-icon">'+lcIcon('hash',16)+'</span>','Public channel')).join(''));
 const nothing=query&&!dms.length&&!groups.length&&!channels.length?'<div class="lc-list-empty lc-search-empty">No conversations match your search.</div>':'';
 return direct+groupList+channelList+nothing;
}
function sideHtml(){
 return '<aside class="lc-side" aria-label="Conversations"><div class="lc-side-head"><div><span class="lc-overline">YOUR WORKSPACE</span><h2>Messages</h2></div>'+
 '<button type="button" class="lc-iconbtn lc-create-group" data-lc-action="group" title="Create a group" aria-label="Create a group">'+lcIcon('plus',20)+'</button></div>'+
 '<div class="lc-side-search">'+lcIcon('search',16)+'<input type="search" autocomplete="off" data-lc-sidebar-search aria-label="Search conversations" placeholder="Search conversations" value="'+esc(state.sidebarQuery)+'"></div>'+
 '<div class="lc-side-shortcuts"><button type="button" data-lc-action="friends">'+lcIcon('users',15)+' Find friends</button>'+
 '<button type="button" data-lc-action="calls">'+lcIcon('phone',15)+' Calls</button></div>'+
 '<div class="lc-side-scroll" data-lc-sidebar-content>'+sideContents()+'</div>'+
 '<div class="lc-side-account">'+avatar(self())+'<span class="lc-account-label"><b>'+esc(label(self()))+'</b><small>@'+esc(self()?.username||'user')+'</small></span>'+
 '<button type="button" title="Edit profile" aria-label="Edit profile" class="lc-iconbtn" data-lc-action="profile">'+lcIcon('settings',18)+'</button></div></aside>';
}
function railTab(action,label,iconKey,active,extra=''){
 return '<button type="button" class="lc-rail-btn '+(active?'active':'')+'" title="'+esc(label)+'" aria-label="'+esc(label)+'" '+(active?'aria-current="page"':'')+' data-lc-action="'+action+'">'+lcIcon(iconKey,21)+'<span class="lc-rail-caption">'+label+'</span>'+extra+'</button>';
}
function railHtml(){
 return '<nav class="lc-rail" aria-label="Lolite Chat navigation">'+
 '<div class="lc-brand" title="Lolite Chat"><span class="lc-brand-glyph">L</span><span class="lc-brand-caption">CHAT</span></div>'+
 railTab('browse','Chats','chat',['browse','channel','conversation'].includes(state.view))+
 railTab('friends','Friends','users',state.view==='friends',unreadCount()?'<small class="lc-rail-badge">'+unreadCount()+'</small>':'')+
 railTab('calls','Calls','phone',state.view==='calls')+
 '<div class="lc-rail-separator"></div>'+
 railTab('profileView','Profile','user',state.view==='profile')+
 '</nav>';
}

function messageHtml(m){
 const p=person(m.sender_id),own=m.sender_id===meId();
 const reply=state.messages.find(x=>x.id===m.reply_to);
 const react=state.reactions.filter(r=>r.message_id===m.id);
 const counts={};react.forEach(r=>{(counts[r.emoji]??=[]).push(r.user_id)});
 return '<article class="lc-msg '+(own?'lc-msg-own':'')+'" data-lc-message="'+m.id+'"><button type="button" class="lc-user-avatar" data-lc-user="'+esc(m.sender_id)+'" title="View profile">'+avatar(p)+'</button>'+ 
 '<div class="lc-msg-body"><div class="lc-msg-title"><button type="button" class="lc-user-name" data-lc-user="'+esc(m.sender_id)+'" title="View profile">'+esc(label(p))+'</button><time>'+esc(new Date(m.created_at).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}))+'</time>'+
 (m.edited_at?'<small>(edited)</small>':'')+(m.is_pinned?'<small class="lc-msg-pin">'+lcIcon('pin',12)+' Pinned</small>':'')+'</div>'+
 (reply?'<div class="lc-replyref">↳ '+esc(label(person(reply.sender_id)))+': '+esc(reply.content.slice(0,75))+'</div>':'')+
 '<div class="lc-msg-content">'+fmt(m.content)+'</div>'+
 (Object.keys(counts).length?'<div class="lc-msg-reactions">'+Object.keys(counts).map(em=>'<button type="button" class="lc-reaction" data-lc-action="react" data-lc-id="'+m.id+'" data-lc-emoji="'+esc(em)+'">'+esc(em)+' '+counts[em].length+'</button>').join('')+'</div>':'')+
 '<details class="lc-msg-more"><summary aria-label="More message actions" title="Message actions"><span aria-hidden="true">···</span></summary><div class="lc-msg-actions"><button type="button" data-lc-action="reply" data-lc-id="'+m.id+'">Reply</button><button type="button" data-lc-action="copy" data-lc-id="'+m.id+'">Copy</button>'+
 ['👍','❤️','😂'].map(em=>'<button type="button" aria-label="React '+esc(em)+'" data-lc-action="react" data-lc-id="'+m.id+'" data-lc-emoji="'+esc(em)+'">'+em+'</button>').join('')+
 (own?'<button type="button" data-lc-action="edit" data-lc-id="'+m.id+'">Edit</button><button type="button" data-lc-action="pin" data-lc-id="'+m.id+'">'+(m.is_pinned?'Unpin':'Pin')+'</button><button type="button" data-lc-action="delete" data-lc-id="'+m.id+'">Delete</button>':
 '<button type="button" data-lc-action="report" data-lc-id="'+m.id+'">Report</button>')+
 '</div></details></div></article>';
}

function chatHtml(){
 const c=activeConv();
 if(!c)return '<main class="lc-main"><div class="lc-placeholder lc-empty-conversation"><div class="lc-empty-symbol">'+lcIcon('chat',34)+'</div><h2>Choose a conversation</h2><p>Your messages and groups are organized in the sidebar. Start by finding a friend.</p><button class="lc-primary" data-lc-action="friends">'+lcIcon('users',16)+' Go to friends</button></div></main>';
 const list=state.messages.filter(m=>(!state.showPins||m.is_pinned)&&(!state.search.trim()||m.content.toLowerCase().includes(state.search.trim().toLowerCase())));
 const reply=state.messages.find(m=>m.id===state.replyTo);
 const desc=c.type==='channel'?'Public community channel':c.type==='dm'?'Direct message · Private':memberIds(c.id).length+' members · Private group';
 return '<main class="lc-main lc-chat-main"><header class="lc-head">'+
 '<button class="lc-iconbtn lc-mobile-back" data-lc-action="browse" type="button" title="Back to conversations" aria-label="Back to conversations">'+lcIcon('back',21)+'</button>'+
 '<div class="lc-chat-header-avatar">'+(c.type==='dm'?avatar(person(memberIds(c.id).find(id=>id!==meId()))):'<span class="lc-list-icon">'+lcIcon(c.type==='group'?'users':'hash',19)+'</span>')+'</div>'+
 '<div class="lc-head-identity"><div class="lc-head-title">'+esc(convLabel(c))+'</div><span class="lc-head-sub">'+desc+'</span></div>'+
 '<div class="lc-head-tools"><button class="lc-iconbtn '+(state.showPins?'active':'')+'" title="Show pinned messages" aria-label="Show pinned messages" data-lc-action="pins" aria-pressed="'+state.showPins+'">'+lcIcon('pin',18)+'</button>'+
 '<button class="lc-iconbtn" title="Search messages" aria-label="Search messages" data-lc-action="search">'+lcIcon('search',19)+'</button></div></header>'+
 (state.search!==''?'<div class="lc-message-search">'+lcIcon('search',17)+'<input aria-label="Search loaded messages" data-lc-search value="'+esc(state.search)+'" placeholder="Search messages in this chat"></div>':'')+
 '<section class="lc-message-scroll" aria-label="Chat messages">'+
 (list.length?list.map(messageHtml).join(''):'<div class="lc-placeholder lc-message-empty"><div class="lc-empty-symbol">'+lcIcon('chat',27)+'</div><h2>'+ (state.search?'No matching messages':state.showPins?'No pinned messages':'No messages yet')+'</h2><p>'+ (state.search?'Try a different search.':state.showPins?'Pin a message to keep it handy.':'Say hello to start the conversation.')+'</p></div>')+
 '</section><form class="lc-composer" data-lc-form="send">'+
 (reply?'<div class="lc-reply-bar"><span>Replying to '+esc(label(person(reply.sender_id)))+'</span><button type="button" class="lc-iconbtn" data-lc-action="cancelReply" aria-label="Cancel reply">×</button></div>':'')+
 '<div class="lc-compose-wrap"><textarea rows="1" maxlength="4000" name="message" data-lc-message-input placeholder="Write a message…" aria-label="Message text" required></textarea>'+
 '<button class="lc-send" type="submit" title="Send message" aria-label="Send message">'+lcIcon('send',19)+'<span>Send</span></button></div>'+
 '<div class="lc-compose-help">Enter to send · Shift + Enter for a new line</div></form></main>';
}

function personCard(p,controls){
 return '<article class="lc-card" data-lc-user="'+esc(p.id)+'">'+avatar(p)+'<div class="lc-card-info"><b>'+esc(label(p))+'</b><small>@'+esc(p.username)+' · '+esc(p.status||'online')+'</small></div><div class="lc-card-actions">'+controls+'</div></article>';
}
const tinyBtn=(name,action,id,extra='')=>'<button type="button" class="lc-secondary '+extra+'" data-lc-action="'+action+'" data-lc-id="'+esc(id)+'">'+name+'</button>';

function friendsHtml(){
 const accepted=friends().filter(p=>!blocked(p.id));
 const incoming=state.requests.filter(r=>r.to_id===meId()&&r.status==='pending');
 const outgoing=state.requests.filter(r=>r.from_id===meId()&&r.status==='pending');
 return '<main class="lc-main"><div class="lc-area lc-people-page">'+
 '<header class="lc-page-header"><div><span class="lc-overline">PEOPLE</span><h2>Friends</h2><p class="lc-muted">Your contacts and friend requests, all in one place.</p></div>'+
 '<button class="lc-primary" data-lc-action="addFriend">'+lcIcon('plus',17)+' Add friend</button></header>'+
 '<div class="lc-section-title lc-page-section"><span>Your friends</span><span class="lc-section-count">'+accepted.length+'</span></div>'+
 (accepted.length?accepted.map(p=>personCard(p,tinyBtn('Message','dm',p.id)+tinyBtn('Remove','unfriend',p.id)+tinyBtn('Block','block',p.id,'lc-danger'))).join(''):'<div class="lc-empty-panel"><strong>No friends yet</strong><p>Add someone by their Lolite username to start a conversation or call.</p><button type="button" class="lc-secondary" data-lc-action="addFriend">Find a friend</button></div>')+
 '<div class="lc-section-title lc-page-section"><span>Friend requests</span><span class="lc-section-count">'+incoming.length+'</span></div>'+
 (incoming.length?incoming.map(r=>person(r.from_id)).filter(Boolean).map(p=>{const r=incoming.find(x=>x.from_id===p.id);return personCard(p,tinyBtn('Accept','accept',r.id)+tinyBtn('Decline','decline',r.id))}).join(''):'<p class="lc-muted lc-section-note">No pending requests.</p>')+
 (outgoing.length?'<div class="lc-section-title lc-page-section"><span>Sent requests</span></div>'+outgoing.map(r=>person(r.to_id)).filter(Boolean).map(p=>personCard(p,tinyBtn('Cancel request','cancelRequest',state.requests.find(r=>r.to_id===p.id&&r.from_id===meId())?.id))).join(''):'')+
 (state.blocks.length?'<div class="lc-section-title lc-page-section"><span>Blocked</span></div>'+state.blocks.map(b=>person(b.blocked_id)).filter(Boolean).map(p=>personCard(p,tinyBtn('Unblock','unblock',p.id))).join(''):'')+
 '</div></main>';
}
function browseHtml(){
 const channels=state.conversations.filter(c=>c.type==='channel');
 const chats=state.conversations.filter(c=>c.type!=='channel').sort((a,b)=>b.created_at.localeCompare(a.created_at));
 return '<main class="lc-main"><div class="lc-area lc-inbox-page"><header class="lc-page-header"><div><span class="lc-overline">WELCOME TO LOLITE</span><h2>Chats</h2><p class="lc-muted">Pick up where you left off, or start a new conversation.</p></div><button type="button" class="lc-primary" data-lc-action="group">'+lcIcon('plus',16)+' New group</button></header>'+
 '<div class="lc-shortcut-cards"><button data-lc-action="friends">'+lcIcon('users',23)+'<span><strong>Find friends</strong><small>Connect and start chatting</small></span>'+lcIcon('arrow',17)+'</button>'+
 '<button data-lc-action="calls">'+lcIcon('phone',23)+'<span><strong>Voice calls</strong><small>Call friends and groups</small></span>'+lcIcon('arrow',17)+'</button></div>'+
 '<div class="lc-section-title lc-page-section"><span>Recent conversations</span><span class="lc-section-count">'+chats.length+'</span></div>'+
 (chats.length?'<div class="lc-inbox-rows">'+chats.slice(0,10).map(c=>navItem('openConv',c.id,convLabel(c),false,c.type==='group'?'<span class="lc-list-icon">'+lcIcon('users',18)+'</span>':avatar(person(memberIds(c.id).find(id=>id!==meId()))),c.type==='group'?memberIds(c.id).length+' members':'Direct message')).join('')+'</div>':
 '<div class="lc-empty-panel"><strong>Your inbox is ready</strong><p>Once you message someone, your conversations will show up here.</p><button type="button" class="lc-secondary" data-lc-action="friends">Open friends</button></div>')+
 (channels.length?'<div class="lc-section-title lc-page-section"><span>Community</span></div><div class="lc-inbox-rows">'+channels.map(c=>navItem('channel',c.name,'# '+c.name,false,'<span class="lc-list-icon">'+lcIcon('hash',17)+'</span>','Public channel')).join('')+'</div>':'')+
 '</div></main>';
}


function profileHtml(){
 const p=self();
 return '<main class="lc-main"><div class="lc-area lc-profile-page"><header class="lc-page-header"><div><span class="lc-overline">ACCOUNT</span><h2>Your profile</h2><p class="lc-muted">Manage how you appear to people in Lolite Chat.</p></div></header>'+
 '<section class="lc-profile-card"><div class="lc-profile-banner"></div><div class="lc-profile-card-inner"><div class="lc-profile-avatar">'+avatar(p)+'</div><h2>'+esc(label(p))+'</h2><p>@'+esc(p?.username||'user')+'</p><p class="lc-profile-about">'+esc(p?.about||'No bio added yet.')+'</p><div class="lc-pills"><span class="lc-pill">'+esc(p?.status||'online')+'</span><span class="lc-pill">Lolite member</span></div><div class="lc-profile-actions"><button class="lc-primary" data-lc-action="profile">'+lcIcon('settings',16)+' Edit profile</button><button class="lc-secondary" data-lc-action="logout">Log out</button></div></div></section>'+
 '<p class="lc-muted lc-profile-note">Keep your password safe. Accounts without an email cannot currently use automatic password recovery.</p></div></main>';
}

function modalHtml(){
 if(!state.modal)return '';
 const m=state.modal;let title='',body='';
 if(m.type==='addFriend'){title='Add a friend';body='<p>Enter their exact Lolite username. They can accept or decline the request.</p><form data-lc-form="addFriend"><label>Username</label><input name="username" placeholder="friend_username" maxlength="24" required><div class="lc-dialog-actions"><button class="lc-secondary" type="button" data-lc-action="closeModal">Cancel</button><button class="lc-primary">Send request</button></div></form>'}
 else if(m.type==='group'){title='Create a group';const people=friends().filter(p=>!blocked(p.id));body='<p>Pick a name and choose the friends to include. Everyone will see the group in their chats.</p><form data-lc-form="group"><label for="lcGroupName">Group name</label><input id="lcGroupName" name="name" maxlength="50" required placeholder="e.g. Weekend plans"><label>Choose friends</label>'+
(people.length?'<div class="lc-friend-picker">'+people.map(p=>'<label class="lc-friend-choice"><input type="checkbox" name="invitee" value="'+esc(p.username)+'">'+avatar(p)+'<span><strong>'+esc(label(p))+'</strong><small>@'+esc(p.username)+'</small></span></label>').join('')+'</div>':'<p class="lc-muted">Add some friends first, then come back to create a group.</p>')+
'<div class="lc-dialog-actions"><button class="lc-secondary" type="button" data-lc-action="closeModal">Cancel</button><button class="lc-primary" '+(!people.length?'disabled':'')+' type="submit">Create group</button></div></form>'}
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
 const main=state.view==='calls'?(window.LoliteChatCalls?.renderCallsHtml?.()||'<main class="lc-main"><div class="lc-placeholder">Loading voice calls…</div></main>'):state.view==='friends'?friendsHtml():state.view==='browse'?browseHtml():state.view==='profile'?profileHtml():chatHtml();
 r.innerHTML='<div class="lc-shell" data-lc-view="'+esc(state.view)+'">'+railHtml()+sideHtml()+main+'</div>'+modalHtml();
 $('.lc-message-scroll')?.scrollTo(0,999999);
  window.LoliteChatExtra?.afterRender?.();window.LoliteChatCalls?.afterRender?.();
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
 if(!otherId||otherId===meId())throw Error('Choose someone else to message.');
 if(blocked(otherId))throw Error('Unblock this person before messaging.');
 if(!isFriend(otherId))throw Error('Add this person as a friend before sending a private message.');
 const old=state.conversations.filter(c=>c.type==='dm').find(c=>{const ids=memberIds(c.id);return ids.length===2&&ids.includes(meId())&&ids.includes(otherId)});
 // Atomic database function creates both conversation and membership together.
 const id=old?.id||check(await sb.rpc('lolite_create_conversation',{p_type:'dm',p_name:null,p_member_ids:[otherId]}));
 if(!id)throw Error('Could not create the private chat.');
 state.view='conversation';state.conversationId=id;state.search='';state.showPins=false;
 await refresh(true);return id;
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
 case 'browse':state.view='browse';state.conversationId=null;state.replyTo=null;return refresh(true);
 case 'friends':state.view='friends';state.replyTo=null;return refresh(true);
  case 'calls':state.view='calls';state.conversationId=null;state.replyTo=null;return refresh(true);
 case 'profileView':state.view='profile';state.replyTo=null;return render();
 case 'channel':state.view='channel';state.channel=id;state.conversationId=null;state.search='';state.showPins=false;state.replyTo=null;return refresh(true);
 case 'openConv':state.view='conversation';state.conversationId=id;state.search='';state.showPins=false;state.replyTo=null;return refresh(true);
 case 'addFriend':state.modal={type:'addFriend'};return render();
 case 'group':state.modal={type:'group'};return render();
 case 'profile':state.modal={type:'profile'};return render();
 case 'closeModal':state.modal=null;return render();
 case 'dm':return createDM(id);
 case 'reply':state.replyTo=Number(id);render();return $('[data-lc-message-input]')?.focus();
 case 'copy':{const m=state.messages.find(m=>m.id===Number(id));if(!m)return;await navigator.clipboard.writeText(m.content);return flash('Message copied.');}
 case 'pins':state.showPins=!state.showPins;return render();
 case 'cancelReply':state.replyTo=null;return render();
 case 'react':return react(Number(id),button.dataset.lcEmoji);
 case 'search':state.search=state.search?'':' ';return render();
 case 'edit':{const m=state.messages.find(m=>m.id===Number(id));if(!m||m.sender_id!==meId())return;const value=prompt('Edit your message:',m.content);if(value===null||!value.trim()||value===m.content)return;check(await sb.from('messages').update({content:value.trim(),edited_at:new Date().toISOString()}).eq('id',m.id));return refresh(true)}
 case 'delete':{const m=state.messages.find(m=>m.id===Number(id));if(!m||m.sender_id!==meId()||!confirm('Delete your message?'))return;check(await sb.from('messages').delete().eq('id',m.id));return refresh(true)}
 case 'pin':{const m=state.messages.find(m=>m.id===Number(id));if(!m||m.sender_id!==meId())return;check(await sb.from('messages').update({is_pinned:!m.is_pinned}).eq('id',m.id));return refresh(true)}
 case 'report':state.modal={type:'report',messageId:Number(id)};return render();
 case 'logout':{await sb.auth.signOut();state.view='browse';state.channel='general';state.conversationId=null;state.modal=null;return refresh(true)}
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
  const names=fd.getAll('invitee').map(n=>String(n).toLowerCase().trim()).filter(Boolean);
  const unique=[...new Set(names)];
  if(!unique.length||unique.length>12)throw Error('Add 1–12 friends.');
  const people=unique.map(n=>state.profiles.find(p=>p.username===n));
  if(people.some(p=>!p||!isFriend(p.id)||blocked(p.id)))throw Error('All group members must be your friends. Check their usernames.');
  const id=check(await sb.rpc('lolite_create_conversation',{p_type:'group',p_name:name,p_member_ids:people.map(p=>p.id)}));
  if(!id)throw Error('Could not create the group. Please retry.');
  state.modal=null;state.view='conversation';state.conversationId=id;state.search='';state.showPins=false;return refresh(true);
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
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&root()&&state.user){e.preventDefault();state.search=' ';render();$('[data-lc-search]')?.focus()}
});
document.addEventListener('input',e=>{
 if(e.target.matches('[data-lc-sidebar-search]')){state.sidebarQuery=e.target.value;const list=$('[data-lc-sidebar-content]');if(list)list.innerHTML=sideContents()}
 if(e.target.matches('[data-lc-search]')){
  state.search=e.target.value;
  const list=$('.lc-message-scroll');
  if(list){const matches=state.messages.filter(m=>(!state.showPins||m.is_pinned)&&(!state.search.trim()||m.content.toLowerCase().includes(state.search.trim().toLowerCase())));list.innerHTML=matches.length?matches.map(messageHtml).join(''):'<div class="lc-placeholder">No matching messages</div>'}
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
window.LoliteChatIcons=lcIcon;
window.LoliteChat={open:()=>window.openApp('chatroom','Lolite Chat',1100,700),refresh:()=>refresh(true),getClient:()=>sb,getState:()=>state,createDM,sendFriendRequest:requestFriend};
})();