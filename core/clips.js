/* Lolite Clips — user-initiated game/tab recording and opt-in community sharing.
 * Screen capture always requires a browser chooser. Local clips use IndexedDB;
 * cloud clips use Lolite Auth + a private Supabase bucket with admin moderation.
 */
(()=>{'use strict';
 const BUCKET='lolite-clips',DB_NAME='lolite-clips-local-v1',MAX_UPLOAD=20*1024*1024;
 const LENGTHS=[15,30,60,90],KEYS=['Alt+Shift+C','Ctrl+Shift+Y'];
 const QUALITIES=Object.freeze({compact:{label:'Compact · smaller files',bitrate:800000},
  balanced:{label:'Balanced · recommended',bitrate:1500000},
  high:{label:'High · sharper video',bitrate:3000000}});
 const S={tab:'library',local:[],remote:[],urls:new Map(),remoteUrls:new Map(),
  user:null,admin:false,loading:false,busy:false,error:'',message:'',
  stream:null,recorder:null,recording:false,paused:false,requesting:false,saving:false,
  started:0,elapsedMs:0,timer:null,tick:null,duration:30,hotkey:'Alt+Shift+C',quality:'balanced',
  shareId:null,renameId:null,libraryQuery:'',librarySort:'newest',favoriteOnly:false};
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeUUID=x=>/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(String(x||''))?String(x):'';
 const id=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>Math.floor(c==='x'?Math.random()*16:8+Math.random()*4).toString(16));
 const root=()=>document.querySelector('.window[data-window-id="clips"] #loliteClipsRoot')||document.getElementById('loliteClipsRoot');
 const client=()=>window.LoliteBrowserAccounts?.getClient?.();
 const media=()=>typeof MediaRecorder!=='undefined'&&!!navigator.mediaDevices?.getDisplayMedia;
 const mime=()=>{
  if(typeof MediaRecorder==='undefined')return '';
  for(const type of ['video/webm;codecs=vp8,opus','video/webm;codecs=vp8','video/webm','video/mp4']){
   if(!MediaRecorder.isTypeSupported||MediaRecorder.isTypeSupported(type))return type;
  }
  return '';
 };
 const stamp=value=>new Date(value).toLocaleString([],{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
 const size=n=>(n/1048576).toFixed(1)+' MB';
 const notify=(message,error=false)=>{
  S.message=message;S.error=error?message:'';
  const area=root()?.querySelector('[data-lclip-message]');if(area){area.textContent=message;area.classList.toggle('is-error',error)}
  window.toast?.(message);
 };
 function settings(){
  try{const d=localStorage.getItem('loliteClipsDuration');if(LENGTHS.includes(Number(d)))S.duration=Number(d);
   const key=localStorage.getItem('loliteClipsHotkey');if(KEYS.includes(key))S.hotkey=key;
   const quality=localStorage.getItem('loliteClipsQuality');if(QUALITIES[quality])S.quality=quality;}catch(_){}
 }
 function storeSetting(key,value){try{localStorage.setItem(key,String(value))}catch(_){}}
 function db(){
  return new Promise((resolve,reject)=>{
   if(!window.indexedDB){reject(Error('Local video storage is unavailable in this browser.'));return}
   const request=indexedDB.open(DB_NAME,1);
   request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('clips'))request.result.createObjectStore('clips',{keyPath:'id'})};
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>reject(request.error||Error('Cannot open local clips'));
  });
 }
 async function withStore(mode,fn){
  const conn=await db();
  return new Promise((resolve,reject)=>{
   const transaction=conn.transaction('clips',mode);
   const store=transaction.objectStore('clips');
   let result;
   const request=fn(store);
   request.onsuccess=()=>{result=request.result};
   transaction.oncomplete=()=>{conn.close();resolve(result)};
   transaction.onerror=()=>{const error=transaction.error||Error('Clip storage failed');conn.close();reject(error)};
   transaction.onabort=()=>{const error=transaction.error||Error('Clip storage was aborted');conn.close();reject(error)};
  });
 }
 const allLocal=()=>withStore('readonly',store=>store.getAll());
 const saveLocal=item=>withStore('readwrite',store=>store.put(item));
 const deleteLocal=item=>withStore('readwrite',store=>store.delete(item));
 // Keep local video URLs valid while playback is in progress. Recreating and
 // revoking them on each render caused flickering and broken seek/play buttons.
 const localVideoURL=clip=>{
  const existing=S.urls.get(clip.id);
  if(existing?.blob===clip.blob)return existing.url;
  if(existing)URL.revokeObjectURL(existing.url);
  const url=URL.createObjectURL(clip.blob);
  S.urls.set(clip.id,{url,blob:clip.blob});
  return url;
 };
 const pruneVideoURLs=()=>{
  const valid=new Map(S.local.map(clip=>[clip.id,clip.blob]));
  for(const [id,entry] of S.urls)if(valid.get(id)!==entry.blob){
   URL.revokeObjectURL(entry.url);S.urls.delete(id);
  }
 };
 async function refreshLocal(){
  try{S.local=(await allLocal()).sort((a,b)=>b.createdAt-a.createdAt)}
  catch(e){S.local=[];notify(e?.message||'Unable to read saved clips',true)}
 }
 function recordedMs(){
  return Math.max(0,S.elapsedMs+(S.recording&&!S.paused?Date.now()-S.started:0));
 }
 function remainingSeconds(){return Math.max(0,Math.ceil((S.duration*1000-recordedMs())/1000))}
 function updateRecordingProgress(){
  const container=root();
  const time=container?.querySelector('[data-lclip-record-time]');
  if(time)time.textContent=formatTime(Math.floor(recordedMs()/1000))+' / '+formatTime(S.duration);
  const bar=container?.querySelector('[data-lclip-record-fill]');
  if(bar)bar.style.width=Math.min(100,100*recordedMs()/(S.duration*1000))+'%';
  const left=container?.querySelector('[data-lclip-record-left]');
  if(left)left.textContent=S.paused?'Recording paused':remainingSeconds()+' seconds left';
 }
 function indicator(){
  let button=document.getElementById('loliteClipCaptureStatus');
  if(!button){button=document.createElement('button');button.id='loliteClipCaptureStatus';button.type='button';
   button.setAttribute('aria-label','Open Lolite Clips capture controls');document.body.appendChild(button);
   button.addEventListener('click',()=>window.openApp?.('clips','Lolite Clips',1020,720));
  }
  button.hidden=!S.stream&&!S.recording&&!S.saving;
  button.className='lclip-capture-indicator'+(S.recording?(S.paused?' is-paused':' is-recording'):'');
  button.textContent=S.recording?(S.paused?'Ⅱ PAUSED · ':'● REC · ')+remainingSeconds()+'s':
   S.saving?'Saving clip…':'Screen capture on';
  updateRecordingProgress();
  button.title='Open Lolite Clips to stop recording or capture';
 }
 function activeStream(){return !!S.stream&&S.stream.getVideoTracks().some(track=>track.readyState==='live')}
 function stopCapture(){
  if(S.recorder&&S.recorder.state!=='inactive')S.recorder.stop();
  if(S.stream)for(const track of S.stream.getTracks())track.stop();
  S.stream=null;indicator();render();
 }
 function finish(){
  if(S.recording)S.elapsedMs=recordedMs();
  S.recording=false;S.paused=false;
  clearTimeout(S.timer);clearInterval(S.tick);S.timer=null;S.tick=null;
  indicator();render();
 }
 function pauseClip(){
  if(!S.recording||S.paused||S.recorder?.state!=='recording')return;
  if(typeof S.recorder.pause!=='function'){notify('Pause is not supported by this browser.',true);return}
  try{
   S.elapsedMs=recordedMs();S.recorder.pause();S.paused=true;
   clearTimeout(S.timer);S.timer=null;
   indicator();render();notify('Clip paused. Resume when you are ready.');
  }catch(e){notify('Could not pause: '+(e?.message||e),true)}
 }
 function resumeClip(){
  if(!S.recording||!S.paused||S.recorder?.state!=='paused')return;
  try{
   S.recorder.resume();S.started=Date.now();S.paused=false;
   clearTimeout(S.timer);
   S.timer=setTimeout(stopClip,Math.max(1,S.duration*1000-S.elapsedMs));
   indicator();render();notify('Clip recording resumed.');
  }catch(e){notify('Could not resume: '+(e?.message||e),true)}
 }
 function stopClip(){
  if(!S.recorder||S.recorder.state==='inactive')return;
  try{S.recorder.stop()}catch(e){finish();notify('Could not finish recording: '+(e?.message||e),true)}
 }
 async function beginClip(){
  if(S.recording||S.requesting||S.saving)return;
  if(!media()){notify('Screen capture requires a supported HTTPS browser with MediaRecorder.',true);return}
  const type=mime();
  if(!type){notify('This browser cannot record WebM or MP4 video.',true);return}
  S.requesting=true;
  try{
   if(!activeStream()){
    // Browser permission is required for every new screen/tab source.
    S.stream=await navigator.mediaDevices.getDisplayMedia({
     video:{frameRate:30},audio:true,preferCurrentTab:true,selfBrowserSurface:'include'
    });
    const videoTrack=S.stream.getVideoTracks()[0];
    if(!videoTrack)throw Error('Choose a screen or game tab with video.');
    videoTrack.addEventListener('ended',()=>{
     if(S.recording)stopClip();
     S.stream=null;indicator();render();
    },{once:true});
   }
   const recorder=new MediaRecorder(S.stream,{mimeType:type,videoBitsPerSecond:QUALITIES[S.quality].bitrate,audioBitsPerSecond:96000});
   const chunks=[];S.recorder=recorder;
   const started=Date.now();
   recorder.addEventListener('dataavailable',event=>{if(event.data?.size)chunks.push(event.data)});
   recorder.addEventListener('error',event=>notify(event.error?.message||'Recording failed.',true));
   recorder.addEventListener('stop',async()=>{
    // A saved clip must also release browser screen-sharing permission.
    if(S.stream){for(const track of S.stream.getTracks())track.stop();S.stream=null}
    S.saving=true;finish();
    const blob=new Blob(chunks,{type:recorder.mimeType?.split(';')[0]||type.split(';')[0]});
    if(blob.size){
     const clip={id:id(),title:'Gameplay · '+stamp(started),createdAt:started,
      duration:Math.max(1,Math.round(S.elapsedMs/1000)),mimeType:blob.type,bytes:blob.size,blob,favorite:false};
     try{await saveLocal(clip);S.tab='library';await refreshLocal();notify('Clip saved privately in My Clips.')}
     catch(e){
      const url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download='lolite-clip-'+started+(blob.type==='video/mp4'?'.mp4':'.webm');
      link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
      notify('Browser storage was full or unavailable; downloading your clip instead.',true);
     }
    }else notify('No video was recorded. Check the captured tab and try again.',true);
    S.saving=false;S.recorder=null;indicator();render();
   },{once:true});
   recorder.start(1000);
   S.started=started;S.elapsedMs=0;S.paused=false;S.recording=true;S.tab='record';
   S.timer=setTimeout(stopClip,S.duration*1000);
   S.tick=setInterval(indicator,500);
   notify('Recording started. Press '+S.hotkey+' again to save your clip.');
   indicator();render();
  }catch(e){
   notify(e?.name==='NotAllowedError'?'Capture cancelled. No video was recorded.':
    'Cannot start capture: '+(e?.message||e),true);
   // Do not leave an active capture source behind after a start failure.
   if(S.stream){for(const track of S.stream.getTracks())track.stop();S.stream=null}
   indicator();render();
  }finally{S.requesting=false;render()}
 }
 const supportedMime=type=>type==='video/webm'||type==='video/mp4';
 async function refreshCloud(){
  const sb=client();
  if(!sb){S.remote=[];S.user=null;S.admin=false;return}
  S.loading=true;S.error='';render();
  try{
   const {data:{user},error:authError}=await sb.auth.getUser();
   if(authError&&authError.name!=='AuthSessionMissingError')throw authError;
   S.user=user||null;
   if(!user){S.remote=[];S.admin=false;S.remoteUrls.clear();return}
   const [role,clips]=await Promise.all([
    sb.from('lolite_admins').select('user_id').eq('user_id',user.id).maybeSingle(),
    sb.from('lolite_clips').select('id,uploader_id,title,storage_path,mime_type,file_bytes,duration_seconds,status,created_at')
     .order('created_at',{ascending:false}).limit(100)
   ]);
   if(role.error)throw role.error;
   if(clips.error)throw clips.error;
   S.admin=role.data?.user_id===user.id;S.remote=clips.data||[];
   S.remoteUrls.clear();
   const visible=S.remote.filter(r=>r.status==='approved'||S.admin||r.uploader_id===user.id);
   await Promise.all(visible.slice(0,30).map(async r=>{
    const res=await sb.storage.from(BUCKET).createSignedUrl(r.storage_path,900);
    if(!res.error&&res.data?.signedUrl)S.remoteUrls.set(r.id,res.data.signedUrl);
   }));
  }catch(e){S.error=e?.message||'Cannot load shared clips';notify(S.error,true)}
  finally{S.loading=false;render()}
 }
 const formatTime=n=>Math.floor(Number(n||0)/60)+':'+String(Math.floor(Number(n||0)%60)).padStart(2,'0');
 const localSize=()=>S.local.reduce((total,clip)=>total+(Number(clip.bytes)||0),0);
 function visibleClips(){
  const query=S.libraryQuery.trim().toLowerCase();
  const list=S.local.filter(clip=>(!S.favoriteOnly||!!clip.favorite)&&
   (!query||String(clip.title||'').toLowerCase().includes(query)));
  const sort=S.librarySort;
  list.sort((a,b)=>sort==='oldest'?a.createdAt-b.createdAt:
   sort==='largest'?b.bytes-a.bytes:
   sort==='favorites'?Number(!!b.favorite)-Number(!!a.favorite)||b.createdAt-a.createdAt:
   b.createdAt-a.createdAt);
  return list;
 }
 function libraryStats(){
  return '<span>'+S.local.length+' saved clips</span><span>'+size(localSize())+' stored locally</span>'+
   '<span>'+S.local.filter(item=>item.favorite).length+' favourites</span>';
 }
 function libraryToolbar(){
  return '<div class="lclip-library-stats" data-lclip-stats>'+libraryStats()+'</div>'+
   '<div class="lclip-library-tools"><label>Find a clip<input type="search" data-lclip-filter="search" placeholder="Search your recordings" value="'+esc(S.libraryQuery)+'"></label>'+
   '<label>Sort by<select data-lclip-filter="sort">'+[
    ['newest','Newest first'],['oldest','Oldest first'],['largest','Largest files'],['favorites','Favourites first']
   ].map(([id,label])=>'<option value="'+id+'"'+(S.librarySort===id?' selected':'')+'>'+label+'</option>').join('')+
   '</select></label><label class="lclip-favorites-only"><input type="checkbox" data-lclip-filter="favorites"'+
   (S.favoriteOnly?' checked':'')+'> Favourites only</label></div>';
 }
 function localCard(clip){
  const url=localVideoURL(clip);
  return '<article class="lclip-card" data-lclip-local-id="'+esc(clip.id)+'"><video controls playsinline preload="metadata" src="'+esc(url)+'" aria-label="'+esc(clip.title)+'"></video>'+
   '<div class="lclip-card-body"><div class="lclip-clip-heading"><h3>'+esc(clip.title)+'</h3>'+
   (clip.favorite?'<span class="lclip-favorite-mark" title="Favourite clip">★</span>':'')+'</div>'+
   '<p>'+esc(stamp(clip.createdAt))+' · '+formatTime(clip.duration)+' · '+size(clip.bytes)+'</p>'+
   '<div class="lclip-actions"><button data-lclip-action="download" data-lclip-id="'+esc(clip.id)+'">Download</button>'+
   '<button data-lclip-action="rename" data-lclip-id="'+esc(clip.id)+'">Rename</button>'+
   '<button data-lclip-action="favorite" data-lclip-id="'+esc(clip.id)+'" aria-pressed="'+!!clip.favorite+'">'+(clip.favorite?'★ Favourited':'☆ Favourite')+'</button>'+
   '<button data-lclip-action="share" data-lclip-id="'+esc(clip.id)+'" '+(clip.bytes>MAX_UPLOAD?'disabled title="Clip exceeds the 20 MB sharing limit"':'')+'>Share</button>'+
   '<button class="lclip-danger" data-lclip-action="delete-local" data-lclip-id="'+esc(clip.id)+'">Delete</button></div>'+
   (S.renameId===clip.id?'<form data-lclip-rename="'+esc(clip.id)+'" class="lclip-rename-form">'+
    '<label>New clip name<input name="title" required maxlength="100" value="'+esc(clip.title.slice(0,100))+'"></label>'+
    '<button class="lclip-primary" type="submit">Save name</button></form>':'')+
   (S.shareId===clip.id?'<form data-lclip-share="'+esc(clip.id)+'" class="lclip-share-form">'+
    '<label>Clip title<input name="title" required minlength="3" maxlength="100" value="'+esc(clip.title.slice(0,100))+'"></label>'+
    '<label class="lclip-consent"><input type="checkbox" name="confirm" required> I checked that this clip contains no private information and I have permission to share it.</label>'+
    '<small>Community uploads require a Lolite account and admin approval. Maximum upload: 20 MB.</small>'+
    '<button type="submit" class="lclip-primary" '+(S.busy?'disabled':'')+'>Submit for review</button></form>':'')+
   '</div></article>';
 }
 // Keep existing player nodes alive when editing or filtering other clips.
 function updateLibraryGrid(changedId=''){
  const container=root(),grid=container?.querySelector('[data-lclip-library-grid]');
  if(!grid||typeof grid.replaceChildren!=='function'||typeof grid.querySelectorAll!=='function'){
   render();return;
  }
  pruneVideoURLs();
  const stats=container.querySelector('[data-lclip-stats]');
  if(stats)stats.innerHTML=libraryStats();
  const clips=visibleClips(),existing=[...grid.querySelectorAll('[data-lclip-local-id]')];
  const byId=new Map(existing.map(item=>[item.dataset.lclipLocalId,item]));
  const same=existing.length===clips.length&&clips.every((clip,index)=>
   existing[index].dataset.lclipLocalId===clip.id);
  if(same&&!changedId)return;
  const make=clip=>{
   const template=document.createElement('template');
   template.innerHTML=localCard(clip);
   return template.content.firstElementChild;
  };
  if(same&&changedId){
   const old=byId.get(changedId),clip=clips.find(item=>item.id===changedId);
   if(old&&clip){old.replaceWith(make(clip));return}
   if(!old&&!clip)return;
  }
  const fragment=document.createDocumentFragment();
  if(!clips.length){
   const empty=document.createElement('div');
   empty.className='lclip-empty';
   empty.textContent=S.local.length?'No clips match your filters. Try a different search.':
    'No clips yet. Open Record and capture your first game moment.';
   fragment.appendChild(empty);
  }else for(const clip of clips)fragment.appendChild(
   clip.id!==changedId&&byId.has(clip.id)?byId.get(clip.id):make(clip));
  grid.replaceChildren(fragment);
 }
 function remoteCard(clip){
  const mine=clip.uploader_id===S.user?.id,url=S.remoteUrls.get(clip.id);
  return '<article class="lclip-card lclip-cloud-card">'+
   (url?'<video controls playsinline preload="metadata" src="'+esc(url)+'" aria-label="'+esc(clip.title)+'"></video>':
    '<div class="lclip-preview-missing">Video preview unavailable. Refresh to retry.</div>')+
   '<div class="lclip-card-body"><div class="lclip-topline"><span class="lclip-status lclip-status-'+esc(clip.status)+'">'+
    (clip.status==='approved'?'Published':clip.status==='pending'?'Pending review':'Not approved')+'</span>'+
    (mine?'<span class="lclip-mine">Your upload</span>':'')+'</div>'+
   '<h3>'+esc(clip.title)+'</h3><p>'+esc(stamp(clip.created_at))+' · '+formatTime(clip.duration_seconds)+' · '+size(clip.file_bytes)+'</p>'+
   '<div class="lclip-actions">'+
    (mine||S.admin?'<button class="lclip-danger" data-lclip-action="remove-cloud" data-lclip-id="'+esc(clip.id)+'">Remove</button>':'')+
    (S.admin&&clip.status==='pending'?'<button data-lclip-action="moderate" data-lclip-status="approved" data-lclip-id="'+esc(clip.id)+'">Approve</button>'+
    '<button class="lclip-danger" data-lclip-action="moderate" data-lclip-status="rejected" data-lclip-id="'+esc(clip.id)+'">Reject</button>':'')+
   '</div></div></article>';
 }
 function capturePanel(){
  return '<section class="lclip-hero"><div><div class="lclip-kicker">RECORD · SAVE · SHARE</div><h2>Clip your gameplay.</h2>'+
   '<p>Choose the game tab or screen in the browser permission window. Your recording stays on this device unless you choose to upload it.</p></div>'+
   '<span class="lclip-live '+(S.recording?'on':'')+'">'+(S.recording?'● REC':activeStream()?'Capture active':'Not recording')+'</span></section>'+
   '<div class="lclip-controls"><button class="lclip-primary" data-lclip-action="toggle" '+(S.saving||S.requesting?'disabled':'')+'>'+
    (S.recording?'■ Stop & save clip':'● Start recording')+'</button>'+
   (S.recording?'<button data-lclip-action="'+(S.paused?'resume':'pause')+'">'+
    (S.paused?'▶ Resume recording':'Ⅱ Pause recording')+'</button>':'')+
   (activeStream()?'<button data-lclip-action="stop-capture">Stop sharing screen</button>':'')+'</div>'+
   (S.recording?'<div class="lclip-record-progress"><div class="lclip-record-progress-top"><strong data-lclip-record-time>'+
    formatTime(Math.floor(recordedMs()/1000))+' / '+formatTime(S.duration)+'</strong><span data-lclip-record-left>'+
    (S.paused?'Recording paused':remainingSeconds()+' seconds left')+'</span></div>'+
    '<div class="lclip-record-track"><div data-lclip-record-fill style="width:'+Math.min(100,100*recordedMs()/(S.duration*1000))+'%"></div></div></div>':'')+
   '<div class="lclip-settings"><label>Recording limit<select data-lclip-setting="duration" '+(S.recording?'disabled':'')+'>'+
    LENGTHS.map(n=>'<option value="'+n+'"'+(n===S.duration?' selected':'')+'>'+n+' seconds</option>').join('')+
   '</select></label><label>Video quality<select data-lclip-setting="quality" '+(S.recording?'disabled':'')+'>'+
    Object.entries(QUALITIES).map(([name,info])=>'<option value="'+name+'"'+(name===S.quality?' selected':'')+'>'+info.label+'</option>').join('')+
   '</select></label><label>Keyboard shortcut<select data-lclip-setting="hotkey">'+KEYS.map(k=>'<option'+(k===S.hotkey?' selected':'')+'>'+k+'</option>').join('')+
   '</select></label></div>'+
   '<div class="lclip-help"><h3>How it works</h3><p>Press <kbd>'+esc(S.hotkey)+'</kbd> while Lolite has keyboard focus, or use the button above. Choose the game tab or window when your browser asks. Press the shortcut again to stop, or the clip will finish automatically at your limit.</p>'+
   '<p>Keep the chosen game tab visible and check what you are sharing. Game sound is captured only when the browser supports it and you allow audio. Cross-origin games may still block keyboard shortcuts while their iframe has focus; use the capture controls in that case.</p>'+
   '<p>This records from when you start it; it does <strong>not</strong> retroactively capture gameplay before the shortcut was pressed.</p></div>';
 }
 function render(){
  const el=root();indicator();if(!el)return;
  pruneVideoURLs();
  const tabs=[['record','Record'],['library','My Clips'],['community','Community']];
  if(S.admin)tabs.push(['review','Admin review']);
  const published=S.remote.filter(c=>c.status==='approved'),pending=S.remote.filter(c=>c.status==='pending');
  const mineUploads=S.remote.filter(c=>c.uploader_id===S.user?.id&&c.status!=='approved');
  const remoteItems=S.tab==='review'?(S.admin?S.remote:[]):
   S.tab==='community'?published:[];
  el.innerHTML='<div class="lclip-header"><div><small>LOLITE OS · GAMING</small><h1>Lolite Clips</h1><p>Record moments, save them privately and share the best ones.</p></div>'+
   '<span class="lclip-count">'+S.local.length+' local clips</span></div>'+
   '<nav class="lclip-nav">'+tabs.map(([tab,label])=>'<button data-lclip-tab="'+tab+'" class="'+(S.tab===tab?'active':'')+'">'+label+
    (tab==='review'&&S.admin&&pending.length?' ('+pending.length+')':'')+'</button>').join('')+
   '<button class="lclip-refresh" data-lclip-action="refresh">↻ Refresh</button></nav>'+
   '<main class="lclip-main"><div data-lclip-message role="status" aria-live="polite" class="lclip-message'+(S.error?' is-error':'')+'">'+esc(S.message)+'</div>'+
   (S.tab==='record'?capturePanel():
    S.tab==='library'?'<div class="lclip-section-heading"><h2>My Clips</h2><p>Saved only in this browser. Download any important clips as backup.</p></div>'+
     libraryToolbar()+
     '<div class="lclip-grid" data-lclip-library-grid>'+(visibleClips().length?visibleClips().map(localCard).join(''):
      '<div class="lclip-empty">'+(S.local.length?'No clips match your filters. Try a different search.':
      'No clips yet. Open Record and capture your first game moment.')+'</div>')+'</div>':
    '<div class="lclip-section-heading"><h2>'+(S.tab==='review'?'Clip moderation':'Community Clips')+'</h2>'+
     '<p>'+(S.tab==='review'?'Approve videos before they become visible to the community.':'Only admin-approved clips appear here. Uploads are shared only when you explicitly submit them.')+'</p></div>'+
    (!S.user?'<div class="lclip-empty">Sign in with your Lolite account to see and share community clips. <button data-lclip-action="signin">Open Lolite Chat</button></div>':
     '<div class="lclip-grid">'+(remoteItems.length?remoteItems.map(remoteCard).join(''):'<div class="lclip-empty">Nothing published here yet.</div>')+'</div>'+
     (S.tab==='community'&&mineUploads.length?'<section class="lclip-my-uploads"><h3>My submitted clips</h3><p>Only you and admins can see unapproved uploads.</p><div class="lclip-grid">'+mineUploads.map(remoteCard).join('')+'</div></section>':'')))+
   '</main>';
 }
 async function share(form){
  if(S.busy)return;
  const clip=S.local.find(x=>x.id===form.dataset.lclipShare);if(!clip)return;
  const title=String(form.elements.title.value||'').trim();
  if(title.length<3||title.length>100||!form.elements.confirm.checked){notify('Enter a title and confirm the clip is safe to share.',true);return}
  if(clip.bytes>MAX_UPLOAD||!supportedMime(clip.mimeType)){notify('Only WebM/MP4 clips up to 20 MB can be shared.',true);return}
  if(!S.user){notify('Sign in with Lolite Chat before sharing a clip.',true);window.openApp?.('chatroom','Lolite Chat',1000,680);return}
  const sb=client();S.busy=true;
  const clipId=id(),ext=clip.mimeType==='video/mp4'?'.mp4':'.webm';
  const storagePath=S.user.id+'/'+clipId+ext;
  let uploaded=false;
  try{
   const result=await sb.storage.from(BUCKET).upload(storagePath,clip.blob,{contentType:clip.mimeType,upsert:false,cacheControl:'3600'});
   if(result.error)throw result.error;
   uploaded=true;
   const metadata=await sb.from('lolite_clips').insert({id:clipId,uploader_id:S.user.id,title,storage_path:storagePath,
    mime_type:clip.mimeType,file_bytes:clip.bytes,duration_seconds:Math.min(120,Math.max(1,clip.duration)),status:'pending'});
   if(metadata.error)throw metadata.error;
   S.shareId=null;notify('Clip sent for admin review. Your local copy is unchanged.');
   await refreshCloud();render();
  }catch(e){
   if(uploaded)try{await sb.storage.from(BUCKET).remove([storagePath])}catch(_){}
   notify('Clip was not shared: '+(e?.message||e),true);
  }finally{S.busy=false;render()}
 }
 async function moderate(clipId,status){
  if(S.busy||!S.admin||!['approved','rejected'].includes(status))return;
  S.busy=true;
  try{
   const result=await client().from('lolite_clips').update({status,reviewer_id:S.user.id,reviewed_at:new Date().toISOString()})
    .eq('id',clipId).select('id');
   if(result.error||!result.data?.length)throw result.error||Error('Could not update clip');
   notify(status==='approved'?'Clip published to the community.':'Clip declined.');
   await refreshCloud();
  }catch(e){notify('Moderation failed: '+(e?.message||e),true)}
  finally{S.busy=false;render()}
 }
 async function removeCloud(clipId){
  const clip=S.remote.find(x=>x.id===clipId);
  if(!clip||(!S.admin&&clip.uploader_id!==S.user?.id)||S.busy)return;
  if(!confirm('Remove this uploaded clip from the community? This cannot be undone.'))return;
  S.busy=true;
  try{
   const sb=client();
   const deleted=await sb.from('lolite_clips').delete().eq('id',clipId).select('id');
   if(deleted.error||!deleted.data?.length)throw deleted.error||Error('Could not remove clip');
   const object=await sb.storage.from(BUCKET).remove([clip.storage_path]);
   if(object.error)notify('Clip removed from gallery. The file may require admin cleanup.',true);
   else notify('Shared clip removed. Your local copy is unchanged.');
   await refreshCloud();
  }catch(e){notify('Could not remove shared clip: '+(e?.message||e),true)}
  finally{S.busy=false;render()}
 }
 async function updateLocal(clipId,changes){
  const clip=S.local.find(item=>item.id===clipId);if(!clip)return;
  await saveLocal({...clip,...changes});
  await refreshLocal();updateLibraryGrid(clipId);
 }
 async function renameClip(form){
  const clipId=safeUUID(form.dataset.lclipRename);
  const title=String(form.elements.title.value||'').trim().replace(/\s+/g,' ');
  if(!clipId||!title||title.length>100){notify('Choose a clip name up to 100 characters.',true);return}
  try{S.renameId=null;await updateLocal(clipId,{title});notify('Clip renamed.')}
  catch(e){notify('Could not rename the clip: '+(e?.message||e),true)}
 }
 function download(clip){
  const url=URL.createObjectURL(clip.blob),a=document.createElement('a');
  const name=String(clip.title||'clip').normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
   .replace(/[^a-zA-Z0-9 -]/g,'').trim().replace(/\s+/g,'-').slice(0,64)||'clip';
  a.href=url;a.download=name+'-'+clip.createdAt+(clip.mimeType==='video/mp4'?'.mp4':'.webm');
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
 }
 document.addEventListener('click',event=>{
  if(!event.target.closest?.('#loliteClipsRoot'))return;
  const tab=event.target.closest('[data-lclip-tab]');
  if(tab){if(tab.dataset.lclipTab==='review'&&!S.admin)return;S.tab=tab.dataset.lclipTab;render();return}
  const button=event.target.closest('[data-lclip-action]');if(!button)return;
  const action=button.dataset.lclipAction,clipId=safeUUID(button.dataset.lclipId);
  if(action==='toggle'){if(S.recording)stopClip();else void beginClip();return}
  if(action==='pause'){pauseClip();return}
  if(action==='resume'){resumeClip();return}
  if(action==='stop-capture'){stopCapture();return}
  if(action==='refresh'){void refreshLocal().then(()=>refreshCloud());return}
  if(action==='signin'){window.openApp?.('chatroom','Lolite Chat',1000,680);return}
  if(!clipId)return;
  const clip=S.local.find(c=>c.id===clipId);
  if(action==='download'&&clip){download(clip);return}
  if(action==='rename'&&clip){S.renameId=S.renameId===clipId?null:clipId;S.shareId=null;updateLibraryGrid(clipId);return}
  if(action==='favorite'&&clip){
   void updateLocal(clipId,{favorite:!clip.favorite}).then(()=>notify(clip.favorite?'Removed from favourites.':'Added to favourites.'))
    .catch(e=>notify('Could not update favourites: '+(e?.message||e),true));return;
  }
  if(action==='share'&&clip){S.shareId=S.shareId===clipId?null:clipId;S.renameId=null;updateLibraryGrid(clipId);return}
  if(action==='delete-local'&&clip){
   if(confirm('Delete this clip from this browser? Download it first if you want to keep it.')){
    void deleteLocal(clip.id).then(()=>refreshLocal()).then(()=>{notify('Local clip deleted.');updateLibraryGrid()})
     .catch(e=>notify('Cannot delete clip: '+(e?.message||e),true));
   }return;
  }
  if(action==='moderate')void moderate(clipId,button.dataset.lclipStatus);
  if(action==='remove-cloud')void removeCloud(clipId);
 });
 document.addEventListener('submit',event=>{
  const rename=event.target.closest?.('#loliteClipsRoot form[data-lclip-rename]');
  if(rename){event.preventDefault();void renameClip(rename);return}
  const form=event.target.closest?.('#loliteClipsRoot form[data-lclip-share]');if(!form)return;
  event.preventDefault();void share(form);
 });
 document.addEventListener('input',event=>{
  const input=event.target.closest?.('#loliteClipsRoot [data-lclip-filter="search"]');
  if(!input)return;
  S.libraryQuery=input.value;
  updateLibraryGrid();
 });
 document.addEventListener('change',event=>{
  const filter=event.target.closest?.('#loliteClipsRoot [data-lclip-filter]');
  if(filter){
   if(filter.dataset.lclipFilter==='sort'&&['newest','oldest','largest','favorites'].includes(filter.value))
    S.librarySort=filter.value;
   if(filter.dataset.lclipFilter==='favorites')S.favoriteOnly=filter.checked;
   updateLibraryGrid();return;
  }
  const field=event.target.closest?.('#loliteClipsRoot [data-lclip-setting]');if(!field)return;
  if(field.dataset.lclipSetting==='duration'&&LENGTHS.includes(Number(field.value))){
   S.duration=Number(field.value);storeSetting('loliteClipsDuration',S.duration);
  }else if(field.dataset.lclipSetting==='quality'&&QUALITIES[field.value]&&!S.recording){
   S.quality=field.value;storeSetting('loliteClipsQuality',S.quality);
  }else if(field.dataset.lclipSetting==='hotkey'&&KEYS.includes(field.value)){
   S.hotkey=field.value;storeSetting('loliteClipsHotkey',S.hotkey);
  }
  render();
 });
 // Shortcuts only reach Lolite when the OS page has keyboard focus. They do
 // not bypass browser permission prompts or capture keystrokes from other apps.
 function handleClipHotkey(event){
  if(event.repeat||event.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
  const match=S.hotkey==='Alt+Shift+C'?event.altKey&&event.shiftKey&&!event.ctrlKey&&event.code==='KeyC':
   event.ctrlKey&&event.shiftKey&&!event.altKey&&event.code==='KeyY';
  if(!match)return;
  event.preventDefault();
  if(S.recording)stopClip();else void beginClip();
 }
 document.addEventListener('keydown',handleClipHotkey,true);
 // Same-origin game iframes have their own keyboard focus. Register the hotkey
 // inside those frames too; cross-origin frames remain inaccessible by design.
 function bindFrameShortcuts(){
  if(!document.querySelectorAll)return;
  for(const frame of document.querySelectorAll('#windows iframe')){
   if(frame.__loliteClipsFrameBound)continue;
   frame.__loliteClipsFrameBound=true;
   const attach=()=>{
    try{
     const child=frame.contentDocument;
     if(!child||child.__loliteClipsHotkeyBound)return;
     child.addEventListener('keydown',handleClipHotkey,true);
     child.__loliteClipsHotkeyBound=true;
    }catch(_){/* Browser security blocks cross-origin iframe listeners. */}
   };
   frame.addEventListener('load',attach);
   attach();
  }
 }
 const gameWindows=document.getElementById('windows');
 if(gameWindows&&typeof MutationObserver!=='undefined'){
  const watcher=new MutationObserver(records=>{
   if(records.some(record=>Array.from(record.addedNodes||[]).some(node=>
     node.nodeName==='IFRAME'||!!node.querySelector?.('iframe'))))bindFrameShortcuts();
  });
  watcher.observe(gameWindows,{childList:true,subtree:true});
 }
 bindFrameShortcuts();
 const originalPage=window.page;
 window.page=function(app){
  if(app==='clips'){
   setTimeout(()=>{settings();void refreshLocal().then(()=>refreshCloud()).then(render)},0);
   return '<div class="lclip-shell" id="loliteClipsRoot"><div class="lclip-loading">Opening Lolite Clips…</div></div>';
  }
  return originalPage(app);
 };
 settings();
 client()?.auth.onAuthStateChange(()=>{setTimeout(()=>{if(root())void refreshCloud()},0)});
 window.LoliteClips=Object.freeze({open:()=>window.openApp?.('clips','Lolite Clips',1020,720),stop:stopClip,stopCapture,
  status:()=>({recording:S.recording,paused:S.paused,elapsedSeconds:Math.floor(recordedMs()/1000),
   captureActive:activeStream(),shortcut:S.hotkey,quality:S.quality})});
})();
