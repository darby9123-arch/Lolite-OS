/* Lolite Music — rights-respecting, ad-free community audio library. */
(()=>{
 'use strict';
 const BUCKET='lolite-music';
 const MAX_TRACK_BYTES=50*1024*1024;
 const MIME={mp3:'audio/mpeg',m4a:'audio/mp4',ogg:'audio/ogg',wav:'audio/wav',webm:'audio/webm',aac:'audio/aac'};
 const sb=window.LoliteBrowserAccounts?.getClient?.();
 const audio=new Audio();
 audio.preload='metadata';
 audio.volume=.75;
 const S={user:null,admin:false,loading:true,tab:'discover',query:'',tracks:[],playlists:[],entries:[],requests:[],selectedPlaylist:null,current:null,queue:[],working:false,error:'',notice:'',shuffle:false,repeat:'off'};
 const FAV_PREFIX='lolite.music.favourites.v2.';
 let favourites=new Set();
 function loadFavourites(){
  try{const ids=JSON.parse(localStorage.getItem(FAV_PREFIX+S.user.id)||'[]');favourites=new Set(Array.isArray(ids)?ids.filter(cleanId).slice(0,500):[])}
  catch{favourites=new Set()}
 }
 function toggleFavourite(id){
  if(!cleanId(id)||!track(id)||track(id).status!=='approved')return;
  if(favourites.has(id))favourites.delete(id);else favourites.add(id);
  try{localStorage.setItem(FAV_PREFIX+S.user.id,JSON.stringify([...favourites]))}catch{}
  render();
 }
 function publishState(){
  const t=track(S.current);
  window.dispatchEvent(new CustomEvent('lolite:musicstate',{detail:{
   title:t?.title||'',artist:t?.artist||'',playing:!!t&&!audio.paused,
   shuffle:S.shuffle,repeat:S.repeat
  }}));
 }
 const root=()=>document.querySelector('.window[data-window-id="music"] #lmRoot');
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
 const date=v=>{const d=new Date(v);return isNaN(d)?'':d.toLocaleDateString([],{month:'short',day:'numeric'})};
 const fmt=s=>{const v=Number(s);return Number.isFinite(v)?Math.floor(v/60)+':'+String(Math.floor(v%60)).padStart(2,'0'):'0:00'};
 const available=()=>S.tracks.filter(t=>t.status==='approved');
 const mine=()=>S.tracks.filter(t=>t.uploader_id===S.user?.id);
 const playlist=id=>S.playlists.find(p=>p.id===id);
 const track=id=>S.tracks.find(t=>t.id===id);
 const playlistIds=id=>S.entries.filter(e=>e.playlist_id===id).map(e=>e.track_id).filter(tid=>track(tid)?.status==='approved');
 const cleanId=v=>/^[0-9a-f-]{36}$/i.test(v||'')?v:'';
 function notify(message){S.notice=String(message);if(root())setMessage(S.notice);window.toast?.(S.notice)}
 function setMessage(message){const el=root()?.querySelector('[data-lm-message]');if(el)el.textContent=message||''}
 const ensure=r=>{if(r?.error)throw Error(r.error.message||'Music service error');return r?.data||[]};
 let ticket=0;
 async function fetchTracks(){
  // Supabase limits each response; archive imports must not disappear after 500 songs.
  const all=[];
  for(let offset=0;offset<10000;offset+=500){
   const rows=ensure(await sb.from('lolite_music_tracks')
    .select('id,uploader_id,title,artist,album,storage_path,mime_type,file_bytes,status,created_at')
    .order('created_at',{ascending:false}).range(offset,offset+499));
   all.push(...rows);
   if(rows.length<500)break;
  }
  return {data:all};
 }
 async function load(){
  const n=++ticket;
  if(!sb){S.error='Music needs the Lolite account service. Reload Lolite and try again.';S.loading=false;render();return}
  S.loading=true;S.error='';render();
  try{
   const identity=await sb.auth.getUser();
   if(identity.error&&identity.error.name!=='AuthSessionMissingError')throw identity.error;
   if(n!==ticket)return;
   S.user=identity.data?.user||null;S.admin=false;
   if(!S.user){S.tracks=[];S.playlists=[];S.entries=[];S.requests=[];favourites.clear();publishState();return}
   loadFavourites();
   const admin=await sb.from('lolite_admins').select('user_id').eq('user_id',S.user.id).maybeSingle();
   if(admin.error)throw admin.error;
   S.admin=admin.data?.user_id===S.user.id;
   const results=await Promise.all([
    fetchTracks(),
    sb.from('lolite_music_playlists').select('id,owner_id,name,created_at').order('created_at',{ascending:false}).limit(100),
    sb.from('lolite_music_playlist_tracks').select('playlist_id,track_id,added_at').order('added_at',{ascending:true}).limit(1000),
    sb.from('lolite_music_requests').select('id,requested_by,title,artist,note,status,created_at').order('created_at',{ascending:false}).limit(300)
   ]);
   if(n!==ticket)return;
   S.tracks=ensure(results[0]);S.playlists=ensure(results[1]);S.entries=ensure(results[2]);S.requests=ensure(results[3]);
   if(S.selectedPlaylist&&!playlist(S.selectedPlaylist))S.selectedPlaylist=null;
   if(S.tab==='admin'&&!S.admin)S.tab='discover';
  }catch(e){if(n===ticket)S.error=e?.message||'Unable to load music'}
  finally{if(n===ticket){S.loading=false;render()}}
 }
 function header(){
  const tabs=[['discover','Discover'],['favourites','Favourites'],['playlists','Playlists'],['upload','Upload'],['requests','Requests']];
  if(S.admin)tabs.push(['admin','Admin']);
  return '<header class="lm-header"><div class="lm-brand"><span class="lm-brand-icon">♫</span><div><small>LOLITE OS</small><h1>Lolite Music</h1></div></div><span class="lm-adfree">No ads. Just music.</span></header>'+
   '<nav class="lm-nav" aria-label="Music sections">'+tabs.map(([id,label])=>'<button type="button" data-lm-tab="'+id+'" class="'+(S.tab===id?'active':'')+'">'+label+(id==='admin'?' <span class="lm-count">'+S.tracks.filter(x=>x.status==='pending').length+'</span>':'')+'</button>').join('')+'</nav>';
 }
 function row(t,opts={}){
  const current=S.current===t.id,approved=t.status==='approved';
  const options=approved&&S.playlists.length?'<select data-lm-add-track="'+esc(t.id)+'" aria-label="Save '+esc(t.title)+' to a playlist"><option value="">+ Playlist</option>'+S.playlists.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join('')+'</select>':'';
  const status=!approved?'<span class="lm-chip '+esc(t.status)+'">'+esc(t.status)+'</span>':'';
  const fav=approved?'<button type="button" class="lm-favourite" data-lm-action="favourite" data-lm-id="'+esc(t.id)+'" aria-pressed="'+favourites.has(t.id)+'" aria-label="'+(favourites.has(t.id)?'Remove '+esc(t.title)+' from favourites':'Add '+esc(t.title)+' to favourites')+'" title="Save locally">'+(favourites.has(t.id)?'♥':'♡')+'</button>':'';
  const actions=(opts.moderate&&S.admin?'<button type="button" data-lm-action="approve" data-lm-id="'+esc(t.id)+'">Approve</button><button type="button" class="lm-negative" data-lm-action="reject" data-lm-id="'+esc(t.id)+'">Reject</button>':'')+
   (opts.playlist?'<button type="button" data-lm-action="remove-entry" data-lm-id="'+esc(t.id)+'" data-lm-playlist="'+esc(opts.playlist)+'">Remove</button>':'')+
   ((S.admin||t.uploader_id===S.user?.id&&t.status!=='approved')&&opts.manage?'<button type="button" class="lm-negative" data-lm-action="delete-track" data-lm-id="'+esc(t.id)+'">Delete</button>':'');
  return '<article class="lm-track '+(current?'playing':'')+'"><div class="lm-record" aria-hidden="true">♫</div>'+
   '<div class="lm-track-details"><strong>'+esc(t.title)+'</strong><span>'+esc(t.artist)+(t.album?' · '+esc(t.album):'')+'</span></div>'+status+
   '<div class="lm-track-actions">'+fav+'<button type="button" class="lm-play" data-lm-action="play" data-lm-id="'+esc(t.id)+'" '+(opts.playlist?'data-lm-playlist="'+esc(opts.playlist)+'"':'')+' aria-label="Play '+esc(t.title)+'">▶</button>'+options+actions+'</div></article>';
 }
 function discoverRows(){
  const q=S.query.toLocaleLowerCase();
  const songs=available().filter(t=>(t.title+' '+t.artist+' '+t.album).toLocaleLowerCase().includes(q));
  return songs.length?songs.map(t=>row(t)).join(''):'<div class="lm-empty">No songs found yet. Approved uploads will appear here.</div>';
 }
 function discover(){return '<section class="lm-heading"><div><small>THE COMMUNITY LIBRARY</small><h2>Discover music</h2><p>Listen to approved tracks uploaded by Lolite members.</p></div><span class="lm-total">'+available().length+' songs</span></section>'+
  '<label class="lm-search"><span>⌕</span><input id="lmSearch" aria-label="Search songs and artists" placeholder="Search songs, artists or albums" value="'+esc(S.query)+'"></label>'+
  '<div class="lm-track-list" id="lmTracks">'+discoverRows()+'</div>';
 }
 function favouriteSongs(){
  const songs=available().filter(t=>favourites.has(t.id));
  return '<section class="lm-heading"><div><small>YOUR FAVOURITES</small><h2>Liked songs</h2><p>Your favourite approved tracks, saved on this device.</p></div><span class="lm-total">'+songs.length+' songs</span></section>'+
   '<p class="lm-library-note">Likes are saved in this browser per Lolite account, not synced between devices.</p>'+
   (songs.length?'<div class="lm-track-list">'+songs.map(t=>row(t)).join('')+'</div>':
    '<div class="lm-empty">Use the ♡ button on a song in Discover to save it here.</div>');
 }
 function playlists(){
  const selected=playlist(S.selectedPlaylist);
  const ids=selected?playlistIds(selected.id):[];
  const chosen=ids.map(id=>track(id)).filter(Boolean);
  return '<section class="lm-heading"><div><small>YOUR COLLECTION</small><h2>My playlists</h2><p>Organise approved songs into your own playlists.</p></div></section>'+
   '<form class="lm-inline-form" data-lm-form="playlist"><input name="name" maxlength="80" placeholder="New playlist name" aria-label="Playlist name" required><button class="lm-primary" type="submit">Create playlist</button></form>'+
   '<div class="lm-playlist-layout"><aside class="lm-playlist-sidebar">'+(S.playlists.length?S.playlists.map(p=>'<button type="button" data-lm-action="choose-playlist" data-lm-id="'+esc(p.id)+'" class="'+(S.selectedPlaylist===p.id?'active':'')+'"><b>'+esc(p.name)+'</b><small>'+playlistIds(p.id).length+' songs</small></button>').join(''):'<div class="lm-empty">Create a playlist to get started.</div>')+'</aside>'+
   '<div class="lm-playlist-content">'+(selected?'<div class="lm-playlist-head"><div><small>PLAYLIST</small><h3>'+esc(selected.name)+'</h3><span>'+chosen.length+' songs</span></div><div class="lm-row-buttons"><button type="button" data-lm-action="play-playlist" data-lm-id="'+esc(selected.id)+'" '+(chosen.length?'':'disabled')+'>▶ Play all</button><button type="button" class="lm-negative" data-lm-action="delete-playlist" data-lm-id="'+esc(selected.id)+'">Delete playlist</button></div></div>'+
   (chosen.length?chosen.map(t=>row(t,{playlist:selected.id})).join(''):'<div class="lm-empty">Open Discover and use + Playlist on a song to add it here.</div>'):
   '<div class="lm-empty">Choose a playlist on the left.</div>')+'</div></div>';
 }
 function upload(){
  return '<section class="lm-heading"><div><small>SHARE YOUR SOUND</small><h2>Upload a song</h2><p>Upload music you created or have permission to distribute. Copyrighted tracks without permission are not allowed.</p></div></section>'+
   '<form data-lm-form="upload" class="lm-form"><label>Song title<input name="title" minlength="1" maxlength="120" placeholder="Song name" required></label>'+
   '<label>Artist<input name="artist" minlength="1" maxlength="80" placeholder="Artist name" required></label>'+
   '<label>Album (optional)<input name="album" maxlength="80" placeholder="Album or EP"></label>'+
   '<label>Audio file · max 50 MB<input type="file" name="audio" accept=".mp3,.m4a,.ogg,.wav,.webm,.aac,audio/*" required></label>'+
   '<p class="lm-hint">MP3, M4A, OGG, WAV, WebM and AAC. Your upload stays private until approved. Admin uploads publish straight away.</p>'+
   '<label class="lm-agree"><input type="checkbox" name="rights" required> I made this music or have permission to share it publicly.</label>'+
   '<button class="lm-primary" type="submit"> '+(S.admin?'Upload and publish':'Send for approval')+'</button></form>'+
   '<section class="lm-subsection lm-zip-section"><h3>Import a music ZIP</h3><p class="lm-hint">Upload a ZIP containing songs, even inside folders. MP3, M4A, OGG, WAV, WebM and AAC are supported. The ZIP is unpacked on your device; only the music files are uploaded. Each song can be up to 50 MB; the ZIP itself has no fixed size cap.</p>'+
   '<form class="lm-form" data-lm-form="zip"><label>Choose ZIP archive<input type="file" name="archive" accept=".zip,application/zip,application/x-zip-compressed" required></label>'+
   '<label>Default artist (optional)<input name="artist" maxlength="80" placeholder="Use names from filenames"></label>'+
   '<label>Default album (optional)<input name="album" maxlength="80" placeholder="Use folder names"></label>'+
   '<p class="lm-hint">Titles come from filenames. For Artist - Song.mp3, Lolite detects the artist automatically. Large ZIPs are processed one song at a time.</p>'+
   '<label class="lm-agree"><input type="checkbox" name="rights" required> I created these songs or have permission to distribute every song in this ZIP.</label>'+
   '<button class="lm-primary" type="submit">'+(S.admin?'Import and publish songs':'Import songs for approval')+'</button>'+
   '<div class="lm-zip-progress" role="status" aria-live="polite"><progress max="100" value="0" data-lm-zip-progress></progress><span data-lm-zip-status>Ready to import</span></div></form></section>'+
   '<section class="lm-subsection"><h3>My uploads</h3><div class="lm-track-list">'+(mine().length?mine().map(t=>row(t,{manage:true})).join(''):'<div class="lm-empty">You haven’t submitted any tracks yet.</div>')+'</div></section>';
 }
 function requests(){
  return '<section class="lm-heading"><div><small>WHAT SHOULD BE ADDED NEXT?</small><h2>Song requests</h2><p>Request a song. An admin can review your suggestion, but only licensed or permitted music can be published.</p></div></section>'+
   '<form class="lm-form" data-lm-form="request"><label>Song title<input name="title" maxlength="120" required placeholder="What song?"></label>'+
   '<label>Artist<input name="artist" maxlength="80" required placeholder="Who is it by?"></label>'+
   '<label>Optional note<textarea name="note" maxlength="400" rows="3" placeholder="Why should we add it?"></textarea></label>'+
   '<button class="lm-primary" type="submit">Submit request</button></form>'+
   '<section class="lm-subsection"><h3>My requests</h3>'+requestRows(S.requests.filter(r=>r.requested_by===S.user?.id),false)+'</section>';
 }
 function requestRows(rows,staff){return rows.length?rows.map(r=>'<article class="lm-request"><div><strong>'+esc(r.title)+'</strong><span>'+esc(r.artist)+' · '+date(r.created_at)+'</span>'+(r.note?'<p>'+esc(r.note)+'</p>':'')+'</div>'+
   '<span class="lm-chip '+esc(r.status)+'">'+esc(r.status)+'</span>'+
   (staff&&r.status==='open'?'<div class="lm-row-buttons"><button type="button" data-lm-action="fulfill-request" data-lm-id="'+esc(r.id)+'">Fulfilled</button><button type="button" class="lm-negative" data-lm-action="decline-request" data-lm-id="'+esc(r.id)+'">Decline</button></div>':'')+
   (!staff&&r.status==='open'?'<button type="button" data-lm-action="cancel-request" data-lm-id="'+esc(r.id)+'">Cancel</button>':'')+'</article>').join(''):'<div class="lm-empty">Nothing here yet.</div>'}
 function admin(){
  const pending=S.tracks.filter(t=>t.status==='pending');
  return '<section class="lm-heading"><div><small>AUTHORIZED STAFF ONLY</small><h2>Music moderation</h2><p>Check track details and listen before approving. Approved songs become available to all signed-in users.</p></div></section>'+
   '<section class="lm-subsection"><h3>Pending uploads <span class="lm-count">'+pending.length+'</span></h3><div class="lm-track-list">'+(pending.length?pending.map(t=>row(t,{moderate:true,manage:true})).join(''):'<div class="lm-empty">No songs awaiting approval.</div>')+'</div></section>'+
   '<section class="lm-subsection"><h3>Song requests</h3>'+requestRows(S.requests,true)+'</section>';
 }
 function player(){
  const t=track(S.current);
  return '<footer class="lm-player"><div class="lm-now"><span class="lm-record">♫</span><div><strong data-lm-now-title>'+esc(t?.title||'Nothing playing')+'</strong><small>'+esc(t?.artist||'Choose a song to start listening')+'</small></div></div>'+
   '<div class="lm-player-middle"><div class="lm-player-buttons"><button type="button" data-lm-action="shuffle" aria-pressed="'+S.shuffle+'" title="Shuffle" aria-label="Toggle shuffle">⇄</button><button type="button" data-lm-action="previous" aria-label="Previous track">⏮</button><button type="button" class="lm-main-play" data-lm-action="toggle" aria-label="Play or pause">'+(audio.paused?'▶':'❚❚')+'</button><button type="button" data-lm-action="next" aria-label="Next track">⏭</button><button type="button" data-lm-action="repeat" aria-pressed="'+(S.repeat!=='off')+'" title="Repeat: '+S.repeat+'" aria-label="Change repeat mode">'+(S.repeat==='one'?'↻1':'↻')+'</button></div>'+
   '<div class="lm-timeline"><span data-lm-elapsed>'+fmt(audio.currentTime)+'</span><input type="range" data-lm-seek min="0" max="1000" value="'+(audio.duration?Math.round(audio.currentTime/audio.duration*1000):0)+'" aria-label="Seek in track"><span data-lm-duration>'+fmt(audio.duration)+'</span></div></div>'+
   '<label class="lm-volume">Vol <input type="range" min="0" max="100" value="'+Math.round(audio.volume*100)+'" data-lm-volume aria-label="Volume"></label></footer>';
 }
 function render(){
  const el=root();if(!el)return;
  if(S.loading){el.innerHTML='<div class="lm-loading">Loading Lolite Music…</div>';return}
  if(S.error){el.innerHTML='<div class="lm-loading"><h2>Music unavailable</h2><p>'+esc(S.error)+'</p><button class="lm-primary" data-lm-action="reload">Retry</button></div>';return}
  if(!S.user){el.innerHTML='<div class="lm-login"><span class="lm-login-icon">♫</span><h1>Welcome to Lolite Music</h1><p>Listen to community tracks, build playlists, upload your own music and request songs. Sign in using your Lolite Chat account.</p><button class="lm-primary" data-lm-action="signin">Sign in with Lolite Chat</button><button data-lm-action="reload">I’ve signed in — refresh</button></div>';return}
  const contents={discover,favourites:favouriteSongs,playlists,upload,requests,admin};
  el.innerHTML=header()+'<main class="lm-main">'+(contents[S.tab]||discover)()+'<p class="lm-feedback" data-lm-message role="status">'+esc(S.notice)+'</p></main>'+player();
 }
 async function play(id,queue){
  const t=track(id);if(!t||!S.user||t.status!=='approved')return;
  const ids=Array.isArray(queue)?queue.filter(i=>track(i)?.status==='approved'):available().map(x=>x.id);
  try{
   if(id===S.current&&audio.src&&!audio.paused){audio.pause();return}
   if(id===S.current&&audio.src){await audio.play();return}
   const result=await sb.storage.from(BUCKET).createSignedUrl(t.storage_path,3600);
   if(result.error||!result.data?.signedUrl)throw Error(result.error?.message||'Cannot access this track');
   S.current=id;S.queue=ids.includes(id)?ids:[id,...ids];
   audio.src=result.data.signedUrl;
   audio.load();
   render();
   await audio.play();
  }catch(e){notify(e?.message||'Unable to play audio')}
  updatePlayer();publishState();
 }
 async function next(direction=1,fromEnd=false){
  if(!S.queue.length)return;
  const index=Math.max(0,S.queue.indexOf(S.current));
  if(fromEnd&&S.repeat==='one'){audio.currentTime=0;await audio.play();return}
  if(fromEnd&&S.repeat==='off'&&index===S.queue.length-1){audio.pause();publishState();return}
  let nextId;
  if(S.shuffle&&S.queue.length>1){
   const other=S.queue.filter(id=>id!==S.current);
   nextId=other[Math.floor(Math.random()*other.length)];
  }else nextId=S.queue[(index+direction+S.queue.length)%S.queue.length];
  if(nextId===S.current){audio.currentTime=0;await audio.play();return}
  if(nextId)await play(nextId,S.queue);
 }
 function updatePlayer(){
  const el=root();if(!el)return;
  const btn=el.querySelector('[data-lm-action="toggle"]');if(btn)btn.textContent=audio.paused?'▶':'❚❚';
  const seek=el.querySelector('[data-lm-seek]');if(seek&&document.activeElement!==seek)seek.value=audio.duration?String(Math.round(audio.currentTime/audio.duration*1000)):'0';
  const elapsed=el.querySelector('[data-lm-elapsed]');if(elapsed)elapsed.textContent=fmt(audio.currentTime);
  const duration=el.querySelector('[data-lm-duration]');if(duration)duration.textContent=fmt(audio.duration);
 }
 for(const name of ['timeupdate','loadedmetadata','play','pause','durationchange'])audio.addEventListener(name,updatePlayer);
 for(const name of ['loadedmetadata','play','pause'])audio.addEventListener(name,publishState);
 audio.addEventListener('ended',()=>{void next(1,true).catch(e=>notify(e?.message||'Cannot play next track'))});
 function audioSignatureOK(bytes,ext){
  const ascii=(start,len)=>String.fromCharCode(...bytes.slice(start,start+len));
  if(ext==='mp3')return ascii(0,3)==='ID3'||(bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0);
  if(ext==='m4a')return ascii(4,4)==='ftyp';
  if(ext==='wav')return ascii(0,4)==='RIFF'&&ascii(8,4)==='WAVE';
  if(ext==='ogg')return ascii(0,4)==='OggS';
  if(ext==='webm')return bytes[0]===0x1a&&bytes[1]===0x45&&bytes[2]===0xdf&&bytes[3]===0xa3;
  if(ext==='aac')return bytes[0]===0xff&&(bytes[1]&0xf6)===0xf0;
  return false;
 }
 async function sendAudio(blob,path,type,onProgress){
  // TUS chunks large files into 6 MB requests instead of risking timeout on a 50 MB POST.
  if(blob.size>6*1024*1024&&window.tus?.Upload){
   const session=ensureSession(await sb.auth.getSession());
   const host=new URL(sb.supabaseUrl).hostname.replace(/\.supabase\.co$/,'.storage.supabase.co');
   return new Promise((resolve,reject)=>{
    // Unique filename avoids resuming a different archive entry with an identical size.
    const transfer=new File([blob],path.split('/').pop(),{type,lastModified:Date.now()});
    const upload=new window.tus.Upload(transfer,{
     endpoint:'https://'+host+'/storage/v1/upload/resumable',
     retryDelays:[0,1000,3000,5000,10000],chunkSize:6*1024*1024,
     uploadDataDuringCreation:true,removeFingerprintOnSuccess:true,
     headers:{authorization:'Bearer '+session.access_token,'x-upsert':'false'},
     metadata:{bucketName:BUCKET,objectName:path,contentType:type,cacheControl:'3600'},
     onProgress:(sent,total)=>onProgress?.(sent,total),
     onError:error=>reject(Error('Upload failed: '+(error.message||error))),
     onSuccess:()=>resolve()
    });
    upload.start();
   });
  }
  const uploaded=await sb.storage.from(BUCKET).upload(path,blob,{contentType:type,upsert:false,cacheControl:'3600'});
  if(uploaded.error)throw Error('Upload failed: '+uploaded.error.message);
  onProgress?.(blob.size,blob.size);
 }
 function ensureSession(result){
  if(result.error||!result.data?.session?.access_token)throw Error('Sign in again to upload music.');
  return result.data.session;
 }
 async function saveAudio(blob,ext,details,onProgress){
  if(!MIME[ext]||!blob.size||blob.size>MAX_TRACK_BYTES)throw Error('Each song must be supported audio no larger than 50 MB.');
  const {title,artist,album}=details;
  if(!title||!artist||title.length>120||artist.length>80||album.length>80)throw Error('A song needs a title and artist.');
  const bytes=new Uint8Array(await blob.slice(0,16).arrayBuffer());
  if(!audioSignatureOK(bytes,ext))throw Error('Not a valid '+ext.toUpperCase()+' audio file.');
  const path=S.user.id+'/'+crypto.randomUUID()+'.'+ext;
  await sendAudio(blob,path,MIME[ext],onProgress);
  const record=await sb.from('lolite_music_tracks').insert({
   uploader_id:S.user.id,title,artist,album,storage_path:path,mime_type:MIME[ext],file_bytes:blob.size,
   status:S.admin?'approved':'pending'
  }).select('id').single();
  if(record.error){
   await sb.storage.from(BUCKET).remove([path]);
   throw Error('Could not save the song: '+record.error.message);
  }
 }
 async function uploadSong(form){
  const f=form.elements.audio.files?.[0],title=form.elements.title.value.trim(),artist=form.elements.artist.value.trim(),album=form.elements.album.value.trim();
  const ext=(f?.name.split('.').pop()||'').toLowerCase();
  if(!f)throw Error('Choose an audio file.');
  if(!form.elements.rights.checked)throw Error('Confirm you have permission to share this music.');
  setMessage('Uploading song…');
  await saveAudio(f,ext,{title,artist,album});
  notify(S.admin?'Song published to the library.':'Song sent for admin approval.');
  await load();
 }
 async function uploadZip(form){
  if(!window.LoliteMusicZip)throw Error('ZIP importer did not load. Reload Lolite Music.');
  const file=form.elements.archive.files?.[0];
  if(!file)throw Error('Choose a ZIP archive of music.');
  if(!form.elements.rights.checked)throw Error('Confirm you have permission to distribute every song.');
  const entries=await window.LoliteMusicZip.inspect(file);
  const defaultArtist=form.elements.artist.value.trim(),defaultAlbum=form.elements.album.value.trim();
  const progress=form.querySelector('[data-lm-zip-progress]'),status=form.querySelector('[data-lm-zip-status]');
  const setProgress=(index,name,ratio)=>{
   const pct=Math.min(100,Math.round((index+ratio)/entries.length*100));
   if(progress)progress.value=pct;
   if(status)status.textContent='Song '+(index+1)+' of '+entries.length+' · '+name+' · '+pct+'%';
   setMessage('Importing '+(index+1)+' / '+entries.length+' songs… '+pct+'%');
  };
  let succeeded=0;const failures=[];
  for(let i=0;i<entries.length;i++){
   const entry=entries[i];
   setProgress(i,entry.path,0);
   try{
    const blob=await window.LoliteMusicZip.extract(file,entry);
    const details=window.LoliteMusicZip.guess(entry.path,defaultArtist,defaultAlbum);
    await saveAudio(blob,entry.ext,details,(sent,total)=>setProgress(i,entry.path,total?sent/total:0));
    succeeded++;
   }catch(e){
    failures.push(entry.path+': '+(e.message||e));
   }
   setProgress(i,entry.path,1);
  }
  if(status)status.textContent='Finished · '+succeeded+' imported, '+failures.length+' failed.';
  if(!succeeded)throw Error('No songs could be imported. '+failures.slice(0,2).join(' | '));
  const summary=succeeded+' song'+(succeeded===1?'':'s')+(S.admin?' published.':' sent for approval.')+
   (failures.length?' '+failures.length+' failed: '+failures.slice(0,2).join(' | '):'');
  notify(summary);
  await load();
 }
 async function submit(form){
  if(S.working||!S.user)return;S.working=true;
  const btn=form.querySelector('[type="submit"]');if(btn)btn.disabled=true;
  try{
   if(form.dataset.lmForm==='upload'){await uploadSong(form);return}
   if(form.dataset.lmForm==='zip'){await uploadZip(form);return}
   if(form.dataset.lmForm==='playlist'){
    const name=form.elements.name.value.trim();if(!name||name.length>80)throw Error('Enter a playlist name.');
    const r=await sb.from('lolite_music_playlists').insert({owner_id:S.user.id,name}).select('id').single();
    ensure(r);S.selectedPlaylist=r.data.id;notify('Playlist created.');
   }
   if(form.dataset.lmForm==='request'){
    const title=form.elements.title.value.trim(),artist=form.elements.artist.value.trim(),note=form.elements.note.value.trim();
    if(!title||!artist||title.length>120||artist.length>80||note.length>400)throw Error('Enter a title and artist.');
    ensure(await sb.from('lolite_music_requests').insert({requested_by:S.user.id,title,artist,note,status:'open'}));
    notify('Song request sent to the admins.');
   }
   await load();
  }catch(e){notify(e?.message||'Unable to save')}
  finally{S.working=false;if(btn?.isConnected)btn.disabled=false}
 }
 async function command(action,id,button){
  if(S.working&&action!=='reload')return;
  if(action==='signin'){window.openApp?.('chatroom','Lolite Chat',1100,720);return}
  if(action==='reload'){await load();return}
  if(action==='toggle'){if(audio.paused){if(S.current)await play(S.current,S.queue)}else audio.pause();return}
  if(action==='next'||action==='previous'){await next(action==='next'?1:-1);return}
  if(action==='shuffle'){S.shuffle=!S.shuffle;render();publishState();return}
  if(action==='repeat'){S.repeat=S.repeat==='off'?'all':S.repeat==='all'?'one':'off';render();publishState();return}
  if(action==='favourite'){if(S.user)toggleFavourite(id);return}
  if(action==='choose-playlist'){S.selectedPlaylist=id;render();return}
  if(action==='play-playlist'){const ids=playlistIds(id);if(ids.length)await play(ids[0],ids);return}
  if(action==='play'){const p=cleanId(button.dataset.lmPlaylist);await play(id,p?playlistIds(p):available().map(t=>t.id));return}
  if(!S.user)return;
  S.working=true;
  try{
   if(action==='delete-playlist'){
    if(!confirm('Delete this playlist? Your music files will not be deleted.'))return;
    ensure(await sb.from('lolite_music_playlists').delete().eq('id',id));
    S.selectedPlaylist=null;notify('Playlist deleted.');
   }
   if(action==='remove-entry'){
    ensure(await sb.from('lolite_music_playlist_tracks').delete().eq('playlist_id',cleanId(button.dataset.lmPlaylist)).eq('track_id',id));
    notify('Song removed from playlist.');
   }
   if(action==='approve'||action==='reject'){
    if(!S.admin)return;
    ensure(await sb.from('lolite_music_tracks').update({status:action==='approve'?'approved':'rejected',reviewed_by:S.user.id,reviewed_at:new Date().toISOString()}).eq('id',id).eq('status','pending').select('id'));
    notify(action==='approve'?'Song approved and published.':'Song rejected.');
   }
   if(action==='delete-track'){
    const t=track(id);if(!t||!confirm('Delete this uploaded song and its audio file?'))return;
    ensure(await sb.from('lolite_music_tracks').delete().eq('id',id));
    const removal=await sb.storage.from(BUCKET).remove([t.storage_path]);
    if(removal.error)notify('Song listing removed; file cleanup needs staff attention.');
    else notify('Song deleted.');
    if(S.current===id){audio.pause();audio.removeAttribute('src');audio.load();S.current=null}
   }
   if(action==='fulfill-request'||action==='decline-request'){
    if(!S.admin)return;
    ensure(await sb.from('lolite_music_requests').update({status:action==='fulfill-request'?'fulfilled':'declined',reviewed_by:S.user.id,reviewed_at:new Date().toISOString()}).eq('id',id).eq('status','open').select('id'));
    notify('Request updated.');
   }
   if(action==='cancel-request'){
    ensure(await sb.from('lolite_music_requests').delete().eq('id',id).eq('status','open'));
    notify('Request cancelled.');
   }
   await load();
  }catch(e){notify(e?.message||'Action failed')}
  finally{S.working=false}
 }
 document.addEventListener('click',event=>{
  const tab=event.target.closest('[data-lm-tab]');
  if(tab?.closest('#lmRoot')){S.tab=tab.dataset.lmTab;render();return}
  const btn=event.target.closest('[data-lm-action]');
  if(!btn?.closest('#lmRoot'))return;
  void command(btn.dataset.lmAction,cleanId(btn.dataset.lmId),btn);
 });
 document.addEventListener('submit',event=>{
  const form=event.target.closest('[data-lm-form]');if(!form?.closest('#lmRoot'))return;
  event.preventDefault();void submit(form);
 });
 document.addEventListener('change',async event=>{
  const picker=event.target.closest('[data-lm-add-track]');
  if(!picker?.closest('#lmRoot')||!picker.value)return;
  const pid=cleanId(picker.value),tid=cleanId(picker.dataset.lmAddTrack);
  if(!pid||!tid)return;
  try{ensure(await sb.from('lolite_music_playlist_tracks').insert({playlist_id:pid,track_id:tid}));notify('Saved to playlist.');await load()}
  catch(e){notify(e?.code==='23505'?'Song is already in that playlist.':e?.message||'Unable to save song')}
 });
 document.addEventListener('input',event=>{
  const el=event.target;if(!el.closest('#lmRoot'))return;
  if(el.id==='lmSearch'){S.query=el.value;const list=root()?.querySelector('#lmTracks');if(list)list.innerHTML=discoverRows()}
  if(el.matches('[data-lm-volume]'))audio.volume=Math.max(0,Math.min(1,Number(el.value)/100));
  if(el.matches('[data-lm-seek]')&&audio.duration)audio.currentTime=Number(el.value)/1000*audio.duration;
 });
 const oldPage=window.page;
 window.page=function(id){if(id==='music'){setTimeout(load,0);return '<div id="lmRoot" class="lm-shell"><div class="lm-loading">Loading Lolite Music…</div></div>'}return oldPage(id)};
 sb?.auth.onAuthStateChange(event=>{
  if(event==='SIGNED_OUT'){
   audio.pause();audio.removeAttribute('src');audio.load();
   S.current=null;S.queue=[];S.user=null;favourites.clear();publishState();
  }
  setTimeout(()=>{if(root())void load()},0);
 });
 window.LoliteMusic=Object.freeze({
  open:()=>window.openApp?.('music','Lolite Music',1100,760),refresh:load,
  getState:()=>{const t=track(S.current);return{title:t?.title||'',artist:t?.artist||'',playing:!!t&&!audio.paused,shuffle:S.shuffle,repeat:S.repeat}},
  toggle:()=>{void command('toggle')},next:()=>{void command('next')},previous:()=>{void command('previous')}
 });
})();
