/* Lolite Life RP online rooms and opt-in account cloud saves.
   Uses the existing Lolite Chat Supabase Auth account. No credentials or secret keys are stored here. */
(function(){
"use strict";
var URL="https://rztxhwfdbrzuhdqpegar.supabase.co",KEY="sb_publishable_I3eswNK0zu8qQvDp1Kcfbw_zZzzi18u";
var client=null,user=null,profile=null,connected=false,cloudEnabled=false,cloudDecision=false,cloudRow=null;
var room=null,roomCode="",roomStatus="",players=[],friends=[],events=[],community=0,lastAction=0,saveTimer=null,uploading=false,dirty=false,lastSaved="",error="",busy=false;
var ROOMS=/^[A-HJ-NP-Z2-9]{10}$/,EMOTES={wave:"Wave hello",cheer:"Cheer for the team",dance:"Do a victory dance",highfive:"Offer a high five",welcome:"Welcome everyone"},MAX_EVENTS=18;
var bridge=window.LoliteLifeRPBridge;
if(!bridge)return;
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function getClient(){
 if(client)return client;
 try{if(window.parent!==window&&window.parent.LoliteBrowserAccounts?.getClient){client=window.parent.LoliteBrowserAccounts.getClient()}}catch(_){}
 if(!client&&window.supabase?.createClient){client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}})}
 return client;
}
function refresh(){if(bridge.activeTab()==="online")bridge.refresh()}
function tell(v){error=v||"";refresh()}
function setBusy(value){busy=value;refresh()}
function button(text,action,id,cls,disabled){return '<button type="button" class="btn '+(cls||"soft")+'" data-online-action="'+action+'"'+(id!==undefined?' data-online-id="'+esc(id)+'"':"")+(disabled?" disabled":"")+">"+text+"</button>"}
function box(title,html){return '<section class="panel"><h2>'+title+'</h2>'+html+'</section>'}
function mark(txt){events.unshift({text:txt,at:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})});events=events.slice(0,MAX_EVENTS);refresh()}
function display(){return String(profile?.display_name||profile?.username||bridge.name()||"Resident").slice(0,28)}
function userStatus(){return connected?'<span class="tag green">ONLINE</span>':'<span class="tag">OFFLINE</span>'}
function banner(){return '<section class="panel hero" style="min-height:170px;margin-bottom:17px"><div><div class="eyebrow">LOLITE LIFE / MULTIPLAYER</div><h2>Life is better with friends.</h2><p>Create a private room, invite people with a code, enjoy live roleplay actions and share a community goal. Offline mode always stays available.</p><div class="selectrow">'+userStatus()+(connected?button("Disconnect","disconnect",undefined,"ghost"):button("Connect online","connect",undefined,"primary",busy))+'</div></div><div class="hero-art" aria-hidden="true">🌐</div></section>'}
function authBox(){
 return box("Use your Lolite Chat account",'<p>Online Mode uses the same account as Lolite Chat. Your password is handled by Supabase Auth, not saved by Life RP.</p><form id="life-online-login" class="stack" style="max-width:420px"><label class="subtle">Username<input required minlength="3" maxlength="24" pattern="[A-Za-z0-9_]{3,24}" name="username" autocomplete="username" class="field" style="display:block;width:100%;margin-top:5px"></label><label class="subtle">Password<input required type="password" name="password" autocomplete="current-password" class="field" style="display:block;width:100%;margin-top:5px"></label><button class="btn primary" type="submit" '+(busy?"disabled":"")+'>Sign in to Online Mode</button></form><div class="selectrow" style="margin-top:13px">'+button("Create an account in Lolite Chat","openchat")+'</div><p class="hint">You can also sign in inside Lolite Chat and return here. Never share your password or room code publicly.</p>');
}
function cloudBox(){
 if(cloudDecision){return box("Choose your saved progress",'<p>You already have a Life RP save stored in your account. Choose which copy to continue with. Your local progress is backed up before loading the cloud copy.</p><div class="selectrow">'+button("Load cloud progress","loadcloud",undefined,"primary",busy)+button("Keep local progress & replace cloud","keeplocal",undefined,"soft",busy)+'</div><p class="hint">Cloud changes are not merged; choose carefully, especially when playing on another device.</p>')}
 return box("Cloud Progress",'<p>'+(cloudEnabled?'Your game now saves to your Lolite Chat account while Online Mode is connected.':'Cloud syncing is not active.')+'</p><div class="stats"><span><b>'+(cloudEnabled?'Cloud sync active':'Local save only')+'</b></span><span>'+(lastSaved?"Last synced "+esc(lastSaved):"")+'</span></div><div class="selectrow" style="margin-top:12px">'+(cloudEnabled?button("Save now","save",undefined,"soft",busy):button("Turn on cloud save","activatecloud",undefined,"primary",busy))+'</div>');
}
function roomBox(){
 if(!roomCode){
  return box("Private Multiplayer Rooms",'<p>Share a 10-character code privately with friends. Only people with the code and a Lolite account can join. Live activity is not recorded as chat history.</p><div class="selectrow">'+button("Create room","create",undefined,"primary",busy)+'</div><form id="life-room-join" class="selectrow" style="margin-top:15px"><input class="field" name="room" autocomplete="off" maxlength="10" pattern="[A-HJ-NP-Z2-9]{10}" placeholder="Enter a room code" aria-label="Room code" required><button class="btn soft" '+(busy?"disabled":"")+' type="submit">Join room</button></form><p class="hint">Rooms are temporary. Anyone who receives a room code can enter; only share it with people you trust.</p>');
 }
 return box("Your Multiplayer Room",'<div class="selectrow" style="justify-content:space-between"><div><div class="eyebrow">PRIVATE ROOM CODE</div><h2 style="letter-spacing:3px;margin-top:6px">'+esc(roomCode)+'</h2><div class="subtle">'+esc(roomStatus||"Connecting…")+' · '+players.length+' connected</div></div><div class="selectrow">'+button("Copy invite code","copy",undefined,"soft")+button("Leave room","leave",undefined,"ghost")+'</div></div><p class="hint">Names shown are chosen by the players, not identity verification. Share codes privately and use Lolite Chat to talk with your friends.</p><div class="section-head"><h2>Players Here</h2><span>Live presence</span></div><div class="grid">'+(players.length?players.map(function(p){return '<div class="card"><div class="feature-kicker"><span class="icon-tile">'+esc(p.avatar)+'</span><b>'+esc(p.name)+'</b></div><div class="subtle">'+esc(p.job||"Resident")+'</div>'+(p.user_id===user.id?'<span class="tag">YOU</span>':'<span class="tag green">CONNECTED</span>')+'</div>'}).join(""):'<p class="subtle">Connecting to the room…</p>')+'</div>');
}
function socialBox(){
 if(!roomCode||roomStatus!=="Connected")return "";
 return '<div class="columns" style="margin-top:16px"><section class="panel"><h2>Roleplay Together</h2><p>Send quick, safe in-game actions to everyone in your room.</p><div class="selectrow">'+Object.entries(EMOTES).map(function(x){return button(esc(x[1]),"emote",x[0],"soft")}).join("")+'</div><div class="section-head"><h2>Community Challenge</h2><span>Live co-op goal</span></div><p>Work together to spruce up the town square. Each player can help once every 10 seconds.</p><div class="progress"><span style="width:'+Math.min(100,community/10*100)+'%"></span></div><p><b>'+community+' / 10</b> contributions this room session</p>'+button("Help improve the town","contribute",undefined,"primary",community>=10)+'</section><section class="panel"><h2>Room Activity</h2><div class="log">'+(events.length?events.map(function(e){return '<div class="log-item"><span>'+esc(e.text)+'</span><small>'+esc(e.at)+'</small></div>'}).join(""):'<p class="subtle">Start with a wave or help the town.</p>')+'</div></section></div>';
}
function friendsBox(){
 if(!connected)return"";
 return '<div class="section-head"><h2>Your Lolite Chat Friends</h2><span>'+friends.length+' accepted friends</span></div><section class="panel"><p>Invite a friend by sending them your private room code using Lolite Chat. Friends are only shown here once they join your room.</p><div class="selectrow">'+button("Refresh friends","friends")+button("Open Lolite Chat","openchat",undefined,"primary")+'</div><div class="grid" style="margin-top:15px">'+(friends.length?friends.map(function(p){return '<div class="card"><b>'+esc(p.display_name||p.username||"Friend")+'</b><span class="subtle">@'+esc(p.username||"friend")+'</span></div>'}).join(""):'<div class="empty">No friends have been loaded. Add friends in Lolite Chat.</div>')+'</div></section>';
}
function renderPage(){
 return banner()+(error?'<section class="feedback bad" role="alert" style="margin-bottom:15px">'+esc(error)+'</section>':"")+
 (!connected?authBox():'<div class="stack">'+cloudBox()+roomBox()+socialBox()+friendsBox()+'</div>')+
 '<section class="panel" style="margin-top:16px"><h2>How Online Mode works</h2><p>Cloud save keeps your own career, properties, money and battle pass progress on your account. Multiplayer rooms show the players who are connected and support shared roleplay actions and a community challenge. Everyone keeps their own wallet; there is no player trading or real-money purchase.</p><p class="hint">Online Mode is optional and requires internet. No location sharing or free-text public chat is included in Life RP.</p></section>';
}
async function profileAndFriends(){
 if(!client||!user)return;
 try{var [p,fr]=await Promise.all([
  client.from("profiles").select("username,display_name").eq("id",user.id).maybeSingle(),
  client.from("friend_requests").select("from_id,to_id,status").eq("status","accepted")
 ]);
 if(p.error)throw p.error;
 profile=p.data||null;
 if(fr.error)throw fr.error;
 var ids=[...new Set((fr.data||[]).map(function(row){return row.from_id===user.id?row.to_id:row.from_id}).filter(Boolean))];
 if(!ids.length){friends=[];refresh();return}
 var blocked=await client.from("blocks").select("blocked_id").eq("blocker_id",user.id);
 var blockedIds=new Set((blocked.data||[]).map(function(b){return b.blocked_id}));
 var profiles=await client.from("profiles").select("id,username,display_name").in("id",ids.filter(function(id){return !blockedIds.has(id)}));
 if(profiles.error)throw profiles.error;
 friends=profiles.data||[];
 }catch(e){tell("Could not load Lolite Chat friends: "+(e.message||e))}refresh();
}
async function connect(){
 if(busy)return;
 var sb=getClient();if(!sb)return tell("Lolite account services are unavailable. Check your internet connection and reload.");
 busy=true;error="";refresh();
 try{
 var result=await sb.auth.getUser();if(result.error)throw result.error;
 if(!result.data.user){tell("Sign in below with your Lolite Chat username and password.");return}
 user=result.data.user;
 connected=true;cloudDecision=false;cloudEnabled=false;
 await profileAndFriends();
 await inspectCloud();
 }catch(e){tell("Unable to connect: "+(e.message||e))}finally{busy=false;refresh()}
}
async function signIn(username,password){
 var sb=getClient();if(!sb)return tell("Login service is unavailable.");
 if(!/^[A-Za-z0-9_]{3,24}$/.test(username))return tell("Enter a valid Lolite Chat username.");
 if(busy)return;busy=true;error="";refresh();
 try{
 var answer=await sb.auth.signInWithPassword({email:username.toLowerCase()+"@accounts.lolite.chat",password:password});
 if(answer.error)throw answer.error;
 }catch(e){tell("Sign-in failed: "+(e.message||e));busy=false;refresh();return}
 busy=false;await connect();
}
async function inspectCloud(){
 var ans=await client.from("life_rp_cloud_saves").select("progress,updated_at").eq("player_id",user.id).maybeSingle();
 if(ans.error)throw ans.error;
 cloudRow=ans.data;
 if(ans.data&&ans.data.progress&&typeof ans.data.progress==="object"){cloudDecision=true;cloudEnabled=false;}
 else{cloudDecision=false;cloudEnabled=true;await uploadNow();}
 refresh();
}
function onLocalSave(){
 if(!connected||!cloudEnabled||!user)return;
 dirty=true;clearTimeout(saveTimer);
 saveTimer=setTimeout(function(){void uploadNow()},1300);
}
async function uploadNow(){
 if(!connected||!cloudEnabled||!user)return;
 if(uploading){dirty=true;return}
 clearTimeout(saveTimer);uploading=true;dirty=false;
 var snapshot=bridge.snapshot(),target=user.id;
 try{
 var saved=await client.from("life_rp_cloud_saves").upsert({player_id:target,progress:snapshot,updated_at:new Date().toISOString()},{onConflict:"player_id"});
 if(saved.error)throw saved.error;
 lastSaved=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});error="";
 }catch(e){dirty=true;error="Cloud save failed; local progress is safe. "+(e.message||e)}
 finally{uploading=false;refresh();if(dirty&&connected&&cloudEnabled){clearTimeout(saveTimer);saveTimer=setTimeout(function(){void uploadNow()},6000)}}
}
async function loadCloud(){
 if(!cloudDecision||!cloudRow)return;
 var snap=cloudRow.progress;
 try{
 var backupKey="life-rp-local-backup-"+Date.now();localStorage.setItem(backupKey,JSON.stringify(bridge.snapshot()));
 cloudEnabled=false;bridge.replace(snap);cloudEnabled=true;cloudDecision=false;error="";
 lastSaved=new Date(cloudRow.updated_at).toLocaleString();
 refresh();
 }catch(e){tell("Could not load cloud save: "+(e.message||e))}
}
async function keepLocal(){
 if(!cloudDecision)return;cloudDecision=false;cloudEnabled=true;await uploadNow();refresh();
}
async function leaveRoom(){
 var old=room;room=null;roomCode="";roomStatus="";players=[];events=[];community=0;
 if(old&&client){try{await client.removeChannel(old)}catch(e){}}
 refresh();
}
async function disconnect(){
 clearTimeout(saveTimer);
 // Flush any pending progress before leaving Online Mode.
 if(connected&&cloudEnabled&&dirty)await uploadNow();
 await leaveRoom();connected=false;cloudEnabled=false;cloudDecision=false;user=null;profile=null;friends=[];
 error="";refresh();
}
function randomCode(){
 if(!window.crypto||!window.crypto.getRandomValues)throw Error("Secure random room codes are unavailable on this device.");
 var chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",bytes=new Uint8Array(20);
 window.crypto.getRandomValues(bytes);
 return Array.from(bytes.slice(0,10),function(b){return chars[b%chars.length]}).join("");
}
async function joinRoom(code){
 if(!connected||!user)return tell("Connect to your account before joining rooms.");
 code=String(code||"").trim().toUpperCase();
 if(!ROOMS.test(code))return tell("Room codes must contain 10 letters or numbers.");
 if(busy)return;busy=true;error="";refresh();
 await leaveRoom();
 roomCode=code;roomStatus="Connecting…";community=0;events=[];
 try{
 var session=await client.auth.getSession();
 if(!session?.data?.session?.access_token)throw Error("Please sign in again.");
 // Private channel RLS checks the authenticated user and the room topic format.
 await client.realtime.setAuth(session.data.session.access_token);
 var ch=client.channel("life-rp:"+code,{config:{private:true,presence:{key:user.id}}});
 room=ch;
 ch.on("presence",{event:"sync"},function(){
  if(room!==ch)return;
  var rows=Object.values(ch.presenceState()).flat();
  var seen=new Set();
  players=rows.filter(function(p){
   if(typeof p?.user_id!=="string"||seen.has(p.user_id))return false;
   seen.add(p.user_id);return true;
  }).slice(0,30).map(function(p){return {
    user_id:p.user_id,
    name:String(p.name||"Resident").slice(0,28),
    avatar:["🧑","👩","👨","🧑‍💻","👩‍🎨","👨‍🍳","🧑‍🚀","🧑‍🎤"].includes(p.avatar)?p.avatar:"🧑",
    job:String(p.job||"Resident").slice(0,36)
  }});
  refresh();
 });
 ch.on("broadcast",{event:"emote"},function(v){
  if(room!==ch)return;var p=v.payload||{},what=EMOTES[p.action];
  if(!what)return;mark(String(p.name||"Another player").slice(0,28)+" · "+what);
 });
 ch.on("broadcast",{event:"quest"},function(v){
  if(room!==ch||community>=10)return;
  var p=v.payload||{};
  if(p.type!=="town")return;community=Math.min(10,community+1);
  mark(String(p.name||"A player").slice(0,28)+" helped improve the town"+(community===10?" — community goal reached!":""));
 });
 ch.subscribe(async function(status,err){
  if(room!==ch)return;
  if(status==="SUBSCRIBED"){
   roomStatus="Connected";
   var snap=bridge.snapshot();
   var tr=await ch.track({user_id:user.id,name:display(),avatar:snap.avatar,job:bridge.job()});
   if(tr!=="ok")tell("Room joined, but player presence could not be published.");
   mark("Joined room "+code);
  }else if(status==="CHANNEL_ERROR"||status==="TIMED_OUT"||status==="CLOSED"){
   roomStatus=status==="CLOSED"?"Disconnected":"Connection interrupted";
   if(err)tell("Room connection issue: "+(err.message||err));else refresh();
  }
 });
 }catch(e){await leaveRoom();tell("Couldn't join this room: "+(e.message||e))}
 finally{busy=false;refresh()}
}
function onRoomAction(action){
 if(!room||roomStatus!=="Connected")return tell("Join a room first.");
 var now=Date.now();
 if(action==="contribute"){
  if(community>=10)return;
  if(now-lastAction<10000)return tell("You can help again after 10 seconds.");
  lastAction=now;community++;
  mark(display()+" helped improve the town"+(community===10?" — community goal reached!":""));
  room.send({type:"broadcast",event:"quest",payload:{type:"town",name:display()}});
 }else if(EMOTES[action]){
  if(now-lastAction<2500)return tell("Give everyone a moment before your next action.");
  lastAction=now;mark(display()+" · "+EMOTES[action]);
  room.send({type:"broadcast",event:"emote",payload:{action:action,name:display()}});
 }
 refresh();
}
async function handle(name,id){
 if(name==="connect"){await connect();return}
 if(name==="disconnect"){await disconnect();return}
 if(name==="openchat"){try{window.parent?.openApp?.("chatroom","Lolite Chat",1050,710)}catch(e){tell("Open Lolite Chat from the desktop to make an account.")}return}
 if(name==="loadcloud"){await loadCloud();return}
 if(name==="keeplocal"){await keepLocal();return}
 if(name==="activatecloud"){await inspectCloud();return}
 if(name==="save"){await uploadNow();return}
 if(name==="create"){try{await joinRoom(randomCode())}catch(e){tell(e.message||String(e))}return}
 if(name==="leave"){await leaveRoom();return}
 if(name==="friends"){await profileAndFriends();return}
 if(name==="copy"){if(!roomCode)return;try{await navigator.clipboard.writeText(roomCode);tell("Room code copied. Share it privately.")}catch(e){tell("Copy isn't available here. Select the room code above instead.")}return}
 if(name==="emote"){onRoomAction(id);return}
 if(name==="contribute"){onRoomAction("contribute");return}
}
document.addEventListener("click",function(e){var b=e.target.closest("[data-online-action]");if(!b||b.disabled)return;e.preventDefault();void handle(b.dataset.onlineAction,b.dataset.onlineId)});
document.addEventListener("submit",function(e){
 if(e.target.id==="life-online-login"){
  e.preventDefault();var username=e.target.elements.username.value.trim(),password=e.target.elements.password.value;
  void signIn(username,password);
 }
 if(e.target.id==="life-room-join"){
  e.preventDefault();void joinRoom(e.target.elements.room.value);
 }
});
getClient()?.auth.onAuthStateChange(function(event){
 if(event==="SIGNED_OUT"){clearTimeout(saveTimer);void leaveRoom();connected=false;cloudEnabled=false;cloudDecision=false;user=null;profile=null;friends=[];tell("Your Lolite Chat account signed out. Online Mode has disconnected.")}
});
window.LoliteLifeOnline=Object.freeze({renderPage:renderPage,onLocalSave:onLocalSave,refresh:refresh});
})();
