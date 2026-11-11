/* Account activity, measured game sessions and safe catalog-only game shares. */
(()=>{
 'use strict';
 const accounts=window.LoliteAccounts,sb=accounts?.getClient(),session=crypto.randomUUID();
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeKey=s=>typeof s==='string'&&s.length>0&&s.length<=180&&!/[\x00-\x1f\x7f]/.test(s);
 let profiles=[],presences=[],requests=[],stats=[],started=0,busy=false,last='',queued=false,stopped=false,error='',polling=false;
 const game=key=>window.LoliteGameStoreGallery?.getGame?.(key);
 const duration=n=>n>=3600?(n/3600).toFixed(1)+' h':n>=60?Math.floor(n/60)+' min':Math.floor(n||0)+' sec';
 const label=p=>p?.display_name||p?.username||'Lolite player';
 const current=id=>presences.find(p=>p.user_id===id&&Date.now()-Date.parse(p.updated_at)<75000&&p.kind!=='offline');
 function activityText(id){const p=current(id);return !p?'Offline':p.kind==='playing'?'Playing '+p.game_title:({chatting:'Chatting on Lolite',settings:'Changing settings',browsing:'Browsing the game library',idle:'Away',online:'On Lolite'})[p.kind]||'On Lolite';}
 function active(){
  if(!accounts?.isReady()||document.hidden||stopped)return {kind:'idle'};
  const win=document.querySelector('.window.is-active:not(.minimised)');
  const player=win?.querySelector('.store-player');const frame=player?.querySelector('iframe[data-game-ready="1"][data-popularity-recorded="yes"]');
  if(frame&&game(player.dataset.gameFile))return {kind:'playing',key:player.dataset.gameFile,title:game(player.dataset.gameFile).title};
  const id=win?.dataset.windowId;
  return {kind:id==='chatroom'?'chatting':id==='settings'?'settings':id==='games'?'browsing':'online'};
 }
 async function discord(a){
  if(!window.loliteDesktop?.presence)return;
  try{const p=accounts?.getProfile();await window.loliteDesktop.presence.update(localStorage.loliteDiscordEnabled==='false'||!accounts?.isReady()||stopped||p?.status==='invisible'?null:{kind:a.kind,title:a.title||'',startedAt:started});}catch{}
 }
 function emit(){window.dispatchEvent(new CustomEvent('lolite:activitychange'));document.querySelectorAll('[data-player-presence]').forEach(n=>{n.textContent=activityText(n.dataset.playerPresence);});}
 async function update(force=false,override){
  const a=override||active(),signature=JSON.stringify(a);
  if(signature!==last){started=Date.now();last=signature;force=true;}
  void discord(a);
  if(!accounts?.getUser()||!accounts.isReady())return;
  if(busy){queued=true;return;}
  busy=true;
  try{
   const r=await sb.rpc('lolite_activity_heartbeat',{p_session:session,p_kind:a.kind,p_game_key:a.key||null,p_title:(a.title||'').slice(0,120)||null});
   if(r.error)throw r.error;
   if(r.data?.game_key){stats=stats.filter(s=>s.game_key!==r.data.game_key);stats.push(r.data);}
   const mine={user_id:accounts.getUser().id,kind:a.kind,game_key:a.key,game_title:a.title,started_at:new Date(started).toISOString(),updated_at:new Date().toISOString()};
   presences=presences.filter(p=>p.user_id!==mine.user_id);presences.push(mine);error='';emit();
  }catch{error='Activity is offline. Playtime resumes when Lolite reconnects.';emit();}
  finally{busy=false;if(queued){queued=false;setTimeout(()=>update(true),0);}}
 }
 async function refresh(){
  if(!accounts?.getUser()||!accounts.isReady()||document.hidden||polling)return;polling=true;
  try{
   const results=await Promise.all([sb.from('profiles').select('id,username,display_name,about,avatar,status,show_games').order('username').limit(500),sb.from('lolite_presence').select('*').gt('updated_at',new Date(Date.now()-75000).toISOString()).limit(500),sb.from('friend_requests').select('from_id,to_id,status').eq('status','accepted'),sb.from('lolite_game_stats').select('*').eq('user_id',accounts.getUser().id).order('total_seconds',{ascending:false}).limit(1000)]);
   if(results.some(r=>r.error))throw Error('Unavailable');
   [profiles,presences,requests,stats]=results.map(r=>r.data||[]);
   accounts.refreshProfile(profiles.find(p=>p.id===accounts.getUser().id));
   const fav=stats.filter(s=>s.favorite).map(s=>s.game_key),hadPending=Object.keys(pendingFavorites()).length>0;
   // Pending offline favourite changes are retried before applying cloud state.
   await flushFavorites();
   if(!hadPending&&!Object.keys(pendingFavorites()).length)window.LoliteGameStoreGallery?.replaceFavorites?.(fav);
   emit();
  }catch{}finally{polling=false;}
 }
 const pendingFavorites=()=>{try{return JSON.parse(localStorage.lolitePendingFavorites||'{}')}catch{return {}}};
 async function flushFavorites(){
  if(!accounts.getUser())return;
  const pending=pendingFavorites();
  for(const [key,value] of Object.entries(pending)){
   const g=game(key);if(!g||!safeKey(key))continue;
   const r=await sb.rpc('lolite_set_favorite',{p_game_key:key,p_title:g.title.slice(0,120),p_favorite:!!value});
   if(!r.error){const now=pendingFavorites();if(now[key]===value)delete now[key];localStorage.lolitePendingFavorites=JSON.stringify(now);}
  }
 }
 function favorite(key,value){const p=pendingFavorites();p[key]=value;localStorage.lolitePendingFavorites=JSON.stringify(p);void flushFavorites();}
 function friends(){const id=accounts?.getUser()?.id;const ids=new Set(requests.flatMap(r=>r.from_id===id?[r.to_id]:r.to_id===id?[r.from_id]:[]));return profiles.filter(p=>ids.has(p.id));}
 function peopleRows(people){return people.map(p=>'<button class="la-person" data-lolite-profile="'+esc(p.id)+'"><span class="la-person-avatar">'+esc((p.avatar||label(p).slice(0,2)).toUpperCase())+'</span><span><strong>'+esc(label(p))+'</strong><small data-player-presence="'+esc(p.id)+'">'+esc(activityText(p.id))+'</small></span><i class="'+(current(p.id)?'online':'')+'"></i></button>').join('');}
 function sidebar(){
  if(!accounts?.getUser())return '<p class="store-activity-empty">Sign in to see friends, profiles and playtime.</p><button class="store-social-button" data-account-signin>Sign in to Lolite</button>';
  const f=friends().sort((a,b)=>Number(!!current(b.id))-Number(!!current(a.id)));
  return '<button class="store-social-button" data-lolite-profile="'+esc(accounts.getUser().id)+'">My gaming profile · '+duration(stats.reduce((n,s)=>n+Number(s.total_seconds),0))+'</button>'+peopleRows(f.slice(0,8))+(f.length?'':'<p class="store-activity-empty">Add friends in Lolite Chat to see what they’re playing here.</p>')+'<button class="store-social-button" data-lolite-players>Find players</button>'+(error?'<p class="la-muted">'+esc(error)+'</p>':'');
 }
 function dialog(title){document.querySelector('#lolitePlayerDialog')?.remove();const d=document.createElement('dialog');d.id='lolitePlayerDialog';d.className='la-player-dialog';d.innerHTML='<header><h2>'+esc(title)+'</h2><button data-player-close aria-label="Close player profile">×</button></header><div data-player-body>Loading…</div>';document.body.append(d);d.showModal();d.addEventListener('close',()=>d.remove());return d;}
 async function showPlayers(){if(!accounts.getUser()){accounts.showLogin();return;}const d=dialog('Lolite players');await refresh();if(!d.isConnected)return;d.querySelector('[data-player-body]').innerHTML='<label>Find a player<input data-player-search placeholder="Search by username or name"></label><div data-player-list>'+peopleRows(profiles)+'</div>'+(profiles.length?'':'<p>No players could be loaded. Check your connection and retry.</p>');}
 function gameRow(row){const g=game(row.game_key);return '<div class="la-game-row"><div><strong>'+esc(g?.title||row.game_title)+'</strong><small>'+duration(Number(row.total_seconds))+' total · longest session '+duration(Number(row.longest_session_seconds))+'</small></div>'+(g?'<button data-lolite-play="'+esc(row.game_key)+'">Play</button>':'<small>Unavailable on this device</small>')+'</div>';}
 async function showProfile(id){
  if(!accounts.getUser()){accounts.showLogin();return;}if(!storageId(id))return;
  const d=dialog('Player profile');const [p,s]=await Promise.all([sb.from('profiles').select('id,username,display_name,about,avatar,show_games').eq('id',id).single(),sb.from('lolite_game_stats').select('*').eq('user_id',id).order('total_seconds',{ascending:false}).limit(1000)]);
  if(!d.isConnected)return;const body=d.querySelector('[data-player-body]');
  if(p.error||s.error){body.textContent='This profile could not load. Check your connection and retry.';return;}
  const who=p.data,rows=s.data||[],own=id===accounts.getUser().id,friend=friends().some(f=>f.id===id);
  body.innerHTML='<div class="la-profile-hero"><div class="la-avatar">'+esc((who.avatar||label(who).slice(0,2)).toUpperCase())+'</div><h1>'+esc(label(who))+'</h1><p>@'+esc(who.username)+'</p><p data-player-presence="'+esc(id)+'">'+esc(activityText(id))+'</p><p>'+esc(who.about||'')+'</p>'+(!own?'<button data-player-chat="'+esc(id)+'" data-player-username="'+esc(who.username)+'">'+(friend?'Message in Lolite Chat':'Add friend')+'</button>':'<button data-account-edit-profile>Edit profile</button>')+'</div><div class="la-stats"><div><strong>'+duration(rows.reduce((n,r)=>n+Number(r.total_seconds),0))+'</strong><small>Total playtime</small></div><div><strong>'+rows.filter(r=>r.total_seconds>0).length+'</strong><small>Games played</small></div><div><strong>'+rows.filter(r=>r.favorite).length+'</strong><small>Favourites</small></div></div>'+(!own&&!who.show_games?'<p>This player’s game library is private.</p>':'<h3>Most played</h3>'+(rows.filter(r=>r.total_seconds>0).slice(0,12).map(gameRow).join('')||'<p>No recorded playtime yet. Time starts when a game loads.</p>')+'<h3>Favourite games</h3>'+(rows.filter(r=>r.favorite).slice(0,50).map(gameRow).join('')||'<p>No favourite games yet.</p>'));
 }
 const storageId=id=>window.LoliteAccountStorage.validId(id);
 const token=key=>safeKey(key)&&game(key)?'lolite://game/'+encodeURIComponent(key).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16)):null;
 async function copyGame(key){const value=token(key);if(!value)return;try{await navigator.clipboard.writeText(value);window.toast?.('Game copied. Paste it into a Lolite chat.');}catch{const d=dialog('Copy game');d.querySelector('[data-player-body]').innerHTML='<p>Copy this and paste it into a Lolite chat.</p><input readonly value="'+esc(value)+'">';const input=d.querySelector('input');input.focus();input.select();}}
 function formatMessage(text,format){
  // Ignore unrecognised IDs, external URLs and arbitrary titles/artwork supplied by a message.
  const pattern=/lolite:\/\/game\/([a-zA-Z0-9_.%~-]{1,1800})(?![a-zA-Z0-9_.%~\/-])/g;
  let result='',at=0,count=0;
  for(const match of String(text).matchAll(pattern)){
   let key;try{key=decodeURIComponent(match[1]);}catch{continue;}const g=safeKey(key)&&game(key);if(!g||++count>5)continue;
   result+=format(String(text).slice(at,match.index));result+='<span class="la-share-card"><span><small>LOLITE GAME</small><strong>'+esc(g.title)+'</strong></span><button type="button" data-lolite-play="'+esc(g.file)+'">Play</button></span>';at=match.index+match[0].length;
  }
  return result+format(String(text).slice(at));
 }
 document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-lolite-profile],[data-lolite-players],[data-player-close],[data-lolite-play],[data-copy-game],[data-player-chat]');if(!b)return;
  if(b.hasAttribute('data-player-close'))b.closest('dialog')?.close();
  if(b.dataset.loliteProfile)void showProfile(b.dataset.loliteProfile);
  if(b.hasAttribute('data-lolite-players'))void showPlayers();
  if(b.dataset.copyGame)void copyGame(b.dataset.copyGame);
  if(b.dataset.lolitePlay&&game(b.dataset.lolitePlay)){b.closest('dialog')?.close();window.loliteStoreAction(b.dataset.lolitePlay);}
  if(b.dataset.playerChat){try{window.LoliteChat.open();await window.LoliteChat.refresh();if(friends().some(p=>p.id===b.dataset.playerChat))await window.LoliteChat.createDM(b.dataset.playerChat);else await window.LoliteChat.sendFriendRequest(b.dataset.playerUsername);b.closest('dialog')?.close();}catch(error){window.toast?.(error.message);}}
 });
 document.addEventListener('input',e=>{if(e.target.matches('[data-player-search]')){const q=e.target.value.toLowerCase();document.querySelector('[data-player-list]').innerHTML=peopleRows(profiles.filter(p=>(p.username+' '+p.display_name).toLowerCase().includes(q)));}});
 document.addEventListener('submit',async e=>{if(!e.target.matches('[data-discord-config]'))return;e.preventDefault();try{await window.loliteDesktop.presence.configure(e.target.elements.clientId.value);await update();await discordStatus();}catch(error){window.toast?.(error.message);}});
 async function discordStatus(){const target=document.querySelector('[data-discord-status]');if(!target||!window.loliteDesktop?.presence)return;try{const s=await window.loliteDesktop.presence.status();target.textContent=s.message;}catch{target.textContent='Discord could not connect.';}}
 const changed=()=>{if(JSON.stringify(active())!==last)void update(true);void discordStatus();};
 window.addEventListener('lolite:windowchange',changed);window.addEventListener('lolite:desktopchange',changed);document.addEventListener('visibilitychange',()=>update(true));
 window.addEventListener('lolite:account-ready',()=>{void update();void refresh();});
 window.addEventListener('pagehide',()=>{stopped=true;void discord({kind:'offline'});});
 setInterval(()=>{if(accounts?.isReady())void update();},15000);
 setInterval(()=>{void refresh();void discordStatus();},20000);
 // Detect successful frame loads and tab/app changes without crediting a failed launch.
 setInterval(changed,1000);
 window.LoliteActivity=Object.freeze({update,refresh,sidebar,activityText,presenceMarkup:id=>'<small data-player-presence="'+esc(id)+'">'+esc(activityText(id))+'</small>',showProfile,showPlayers,favorite,formatMessage,copyGame,duration,statsFor:key=>stats.find(s=>s.game_key===key),stop:async()=>{stopped=true;for(let i=0;busy&&i<30;i++)await new Promise(resolve=>setTimeout(resolve,100));await update(true,{kind:'offline'});await window.loliteDesktop?.presence?.update(null);}});
 if(accounts?.isReady()){void update();void refresh();}
})();
