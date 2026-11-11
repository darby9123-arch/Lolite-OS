/* Lolite Clips — user-initiated game/tab recording and opt-in community sharing.
 * Screen capture always requires a browser chooser. Local clips use IndexedDB;
 * cloud clips use Lolite Auth + a private Supabase bucket with admin moderation.
 */
(()=>{'use strict';
 const BUCKET='lolite-clips',DB_NAME='lolite-clips-local-v1',MAX_UPLOAD=20*1024*1024;
 const LENGTHS=[15,30,60,90],KEYS=['Alt+Shift+C','Ctrl+Shift+Y'];
 const S={tab:'library',local:[],remote:[],urls:new Map(),remoteUrls:new Map(),
  user:null,admin:false,loading:false,busy:false,error:'',message:'',
  stream:null,recorder:null,recording:false,requesting:false,saving:false,started:0,timer:null,
  duration:30,hotkey:'Alt+Shift+C',shareId:null};
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeUUID=x=>/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(String(x||''))?String(x):'';
 const id=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>Math.floor(c==='x'?Math.random()*16:8+Math.random()*4).toString(16));
 const root=()=>document.querySelector('.window[data-window-id="clips"] #lcRoot')||document.getElementById('lcRoot');
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
  const area=root()?.querySelector('[data-lc-message]');if(area){area.textContent=message;area.classList.toggle('is-error',error)}
  window.toast?.(message);
 };
 function settings(){
  try{const d=localStorage.getItem('loliteClipsDuration');if(LENGTHS.includes(Number(d)))S.duration=Number(d);
   const key=localStorage.getItem('loliteClipsHotkey');if(KEYS.includes(key))S.hotkey=key;}catch(_){}
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
 const revoke=()=>{for(const url of S.urls.values())URL.revokeObjectURL(url);S.urls.clear()};
 async function refreshLocal(){
  try{S.local=(await allLocal()).sort((a,b)=>b.createdAt-a.createdAt)}
  catch(e){S.local=[];notify(e?.message||'Unable to read saved clips',true)}
 }
 function indicator(){
  let button=document.getElementById('loliteClipCaptureStatus');
  if(!button){button=document.createElement('button');button.id='loliteClipCaptureStatus';button.type='button';
   button.setAttribute('aria-label','Open Lolite Clips capture controls');document.body.appendChild(button);
   button.addEventListener('click',()=>window.openApp?.('clips','Lolite Clips',1020,720));
  }
  button.hidden=!S.stream&&!S.recording&&!S.saving;
  button.className='lc-capture-indicator'+(S.recording?' is-recording':'');
  button.textContent=S.recording?'● REC · '+Math.max(0,Math.ceil((S.duration*1000-(Date.now()-S.started))/1000))+'s':
   S.saving?'Saving clip…':'Screen capture on';
  button.title='Open Lolite Clips to stop recording or capture';
 }
 function activeStream(){return !!S.stream&&S.stream.getVideoTracks().some(track=>track.readyState==='live')}
 function stopCapture(){
  if(S.recorder?.state==='recording')S.recorder.stop();
  if(S.stream)for(const track of S.stream.getTracks())track.stop();
  S.stream=null;indicator();render();
 }
 function finish(){
  S.recording=false;
  clearTimeout(S.timer);clearInterval(S.tick);S.timer=null;S.tick=null;
  indicator();render();
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
   const recorder=new MediaRecorder(S.stream,{mimeType:type,videoBitsPerSecond:1500000,audioBitsPerSecond:96000});
   const chunks=[];S.recorder=recorder;
   const started=Date.now();
   recorder.addEventListener('dataavailable',event=>{if(event.data?.size)chunks.push(event.data)});
   recorder.addEventListener('error',event=>notify(event.error?.message||'Recording failed.',true));
   recorder.addEventListener('stop',async()=>{
    S.saving=true;finish();
    const blob=new Blob(chunks,{type:recorder.mimeType?.split(';')[0]||type.split(';')[0]});
    if(blob.size){
     const clip={id:id(),title:'Gameplay · '+stamp(started),createdAt:started,
      duration:Math.max(1,Math.round((Date.now()-started)/1000)),mimeType:blob.type,bytes:blob.size,blob};
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
   S.started=started;S.recording=true;S.tab='record';
   S.timer=setTimeout(()=>stopClip(),S.duration*1000);
   S.tick=setInterval(indicator,1000);
   notify('Recording started. Press '+S.hotkey+' again to save your clip.');
   indicator();render();
  }catch(e){
   notify(e?.name==='NotAllowedError'?'Capture cancelled. No video was recorded.':
    'Cannot start capture: '+(e?.message||e),true);
   if(S.stream&&!activeStream())S.stream=null;
   indicator();render();
  }finally{S.requesting=false}
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
 const formatTime=n=>Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0');
 function localCard(clip){
  const url=URL.createObjectURL(clip.blob);S.urls.set(clip.id,url);
  return '<article class="lc-card"><video controls playsinline preload="metadata" src="'+esc(url)+'" aria-label="'+esc(clip.title)+'"></video>'+
   '<div class="lc-card-body"><h3>'+esc(clip.title)+'</h3><p>'+esc(stamp(clip.createdAt))+' · '+formatTime(clip.duration)+' · '+size(clip.bytes)+'</p>'+
   '<div class="lc-actions"><button data-lc-action="download" data-lc-id="'+esc(clip.id)+'">Download</button>'+
   '<button data-lc-action="share" data-lc-id="'+esc(clip.id)+'" '+(clip.bytes>MAX_UPLOAD?'disabled title="Clip exceeds the 20 MB sharing limit"':'')+'>Share</button>'+
   '<button class="lc-danger" data-lc-action="delete-local" data-lc-id="'+esc(clip.id)+'">Delete</button></div>'+
   (S.shareId===clip.id?'<form data-lc-share="'+esc(clip.id)+'" class="lc-share-form">'+
    '<label>Clip title<input name="title" required minlength="3" maxlength="100" value="'+esc(clip.title.slice(0,100))+'"></label>'+
    '<label class="lc-consent"><input type="checkbox" name="confirm" required> I checked that this clip contains no private information and I have permission to share it.</label>'+
    '<small>Community uploads require a Lolite account and admin approval. Maximum upload: 20 MB.</small>'+
    '<button type="submit" class="lc-primary" '+(S.busy?'disabled':'')+'>Submit for review</button></form>':'')+
   '</div></article>';
 }
 function remoteCard(clip){
  const mine=clip.uploader_id===S.user?.id,url=S.remoteUrls.get(clip.id);
  return '<article class="lc-card lc-cloud-card">'+
   (url?'<video controls playsinline preload="metadata" src="'+esc(url)+'" aria-label="'+esc(clip.title)+'"></video>':
    '<div class="lc-preview-missing">Video preview unavailable. Refresh to retry.</div>')+
   '<div class="lc-card-body"><div class="lc-topline"><span class="lc-status lc-status-'+esc(clip.status)+'">'+
    (clip.status==='approved'?'Published':clip.status==='pending'?'Pending review':'Not approved')+'</span>'+
    (mine?'<span class="lc-mine">Your upload</span>':'')+'</div>'+
   '<h3>'+esc(clip.title)+'</h3><p>'+esc(stamp(clip.created_at))+' · '+formatTime(clip.duration_seconds)+' · '+size(clip.file_bytes)+'</p>'+
   '<div class="lc-actions">'+
    (mine||S.admin?'<button class="lc-danger" data-lc-action="remove-cloud" data-lc-id="'+esc(clip.id)+'">Remove</button>':'')+
    (S.admin&&clip.status==='pending'?'<button data-lc-action="moderate" data-lc-status="approved" data-lc-id="'+esc(clip.id)+'">Approve</button>'+
    '<button class="lc-danger" data-lc-action="moderate" data-lc-status="rejected" data-lc-id="'+esc(clip.id)+'">Reject</button>':'')+
   '</div></div></article>';
 }
 function capturePanel(){
  return '<section class="lc-hero"><div><div class="lc-kicker">RECORD · SAVE · SHARE</div><h2>Clip your gameplay.</h2>'+
   '<p>Choose the game tab or screen in the browser permission window. Your recording stays on this device unless you choose to upload it.</p></div>'+
   '<span class="lc-live '+(S.recording?'on':'')+'">'+(S.recording?'● REC':activeStream()?'Capture active':'Not recording')+'</span></section>'+
   '<div class="lc-controls"><button class="lc-primary" data-lc-action="toggle" '+(S.saving||S.requesting?'disabled':'')+'>'+
    (S.recording?'■ Stop & save clip':'● Start recording')+'</button>'+
   (activeStream()?'<button data-lc-action="stop-capture">Stop sharing screen</button>':'')+'</div>'+
   '<div class="lc-settings"><label>Recording limit<select data-lc-setting="duration">'+
    LENGTHS.map(n=>'<option value="'+n+'"'+(n===S.duration?' selected':'')+'>'+n+' seconds</option>').join('')+
   '</select></label><label>Keyboard shortcut<select data-lc-setting="hotkey">'+KEYS.map(k=>'<option'+(k===S.hotkey?' selected':'')+'>'+k+'</option>').join('')+
   '</select></label></div>'+
   '<div class="lc-help"><h3>How it works</h3><p>Press <kbd>'+esc(S.hotkey)+'</kbd> while Lolite has keyboard focus, or use the button above. Choose the game tab or window when your browser asks. Press the shortcut again to stop, or the clip will finish automatically at your limit.</p>'+
   '<p>Keep the chosen game tab visible and check what you are sharing. Game sound is captured only when the browser supports it and you allow audio. Cross-origin games may still block keyboard shortcuts while their iframe has focus; use the capture controls in that case.</p>'+
   '<p>This records from when you start it; it does <strong>not</strong> retroactively capture gameplay before the shortcut was pressed.</p></div>';
 }
 function render(){
  const el=root();indicator();if(!el)return;
  revoke();
  const tabs=[['record','Record'],['library','My Clips'],['community','Community']];
  if(S.admin)tabs.push(['review','Admin review']);
  const published=S.remote.filter(c=>c.status==='approved'),pending=S.remote.filter(c=>c.status==='pending');
  const mineUploads=S.remote.filter(c=>c.uploader_id===S.user?.id&&c.status!=='approved');
  const remoteItems=S.tab==='review'?(S.admin?S.remote:[]):
   S.tab==='community'?published:[];
  el.innerHTML='<div class="lc-header"><div><small>LOLITE OS · GAMING</small><h1>Lolite Clips</h1><p>Record moments, save them privately and share the best ones.</p></div>'+
   '<span class="lc-count">'+S.local.length+' local clips</span></div>'+
   '<nav class="lc-nav">'+tabs.map(([tab,label])=>'<button data-lc-tab="'+tab+'" class="'+(S.tab===tab?'active':'')+'">'+label+
    (tab==='review'&&S.admin&&pending.length?' ('+pending.length+')':'')+'</button>').join('')+
   '<button class="lc-refresh" data-lc-action="refresh">↻ Refresh</button></nav>'+
   '<main class="lc-main"><div data-lc-message role="status" aria-live="polite" class="lc-message'+(S.error?' is-error':'')+'">'+esc(S.message)+'</div>'+
   (S.tab==='record'?capturePanel():
    S.tab==='library'?'<div class="lc-section-heading"><h2>My Clips</h2><p>Saved only in this browser. Download any important clips as backup.</p></div>'+
     '<div class="lc-grid">'+(S.local.length?S.local.map(localCard).join(''):'<div class="lc-empty">No clips yet. Open Record and capture your first game moment.</div>')+'</div>':
    '<div class="lc-section-heading"><h2>'+(S.tab==='review'?'Clip moderation':'Community Clips')+'</h2>'+
     '<p>'+(S.tab==='review'?'Approve videos before they become visible to the community.':'Only admin-approved clips appear here. Uploads are shared only when you explicitly submit them.')+'</p></div>'+
    (!S.user?'<div class="lc-empty">Sign in with your Lolite account to see and share community clips. <button data-lc-action="signin">Open Lolite Chat</button></div>':
     '<div class="lc-grid">'+(remoteItems.length?remoteItems.map(remoteCard).join(''):'<div class="lc-empty">Nothing published here yet.</div>')+'</div>'+
     (S.tab==='community'&&mineUploads.length?'<section class="lc-my-uploads"><h3>My submitted clips</h3><p>Only you and admins can see unapproved uploads.</p><div class="lc-grid">'+mineUploads.map(remoteCard).join('')+'</div></section>':'')))+
   '</main>';
 }
 async function share(form){
  if(S.busy)return;
  const clip=S.local.find(x=>x.id===form.dataset.lcShare);if(!clip)return;
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
 function download(clip){
  const url=URL.createObjectURL(clip.blob),a=document.createElement('a');
  a.href=url;a.download='lolite-clip-'+clip.createdAt+(clip.mimeType==='video/mp4'?'.mp4':'.webm');
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
 }
 document.addEventListener('click',event=>{
  if(!event.target.closest?.('#lcRoot'))return;
  const tab=event.target.closest('[data-lc-tab]');
  if(tab){if(tab.dataset.lcTab==='review'&&!S.admin)return;S.tab=tab.dataset.lcTab;render();return}
  const button=event.target.closest('[data-lc-action]');if(!button)return;
  const action=button.dataset.lcAction,clipId=safeUUID(button.dataset.lcId);
  if(action==='toggle'){if(S.recording)stopClip();else void beginClip();return}
  if(action==='stop-capture'){stopCapture();return}
  if(action==='refresh'){void refreshLocal().then(()=>refreshCloud());return}
  if(action==='signin'){window.openApp?.('chatroom','Lolite Chat',1000,680);return}
  if(!clipId)return;
  const clip=S.local.find(c=>c.id===clipId);
  if(action==='download'&&clip){download(clip);return}
  if(action==='share'&&clip){S.shareId=S.shareId===clipId?null:clipId;render();return}
  if(action==='delete-local'&&clip){
   if(confirm('Delete this clip from this browser? Download it first if you want to keep it.')){
    void deleteLocal(clip.id).then(()=>refreshLocal()).then(()=>{notify('Local clip deleted.');render()})
     .catch(e=>notify('Cannot delete clip: '+(e?.message||e),true));
   }return;
  }
  if(action==='moderate')void moderate(clipId,button.dataset.lcStatus);
  if(action==='remove-cloud')void removeCloud(clipId);
 });
 document.addEventListener('submit',event=>{
  const form=event.target.closest?.('#lcRoot form[data-lc-share]');if(!form)return;
  event.preventDefault();void share(form);
 });
 document.addEventListener('change',event=>{
  const field=event.target.closest?.('#lcRoot [data-lc-setting]');if(!field)return;
  if(field.dataset.lcSetting==='duration'&&LENGTHS.includes(Number(field.value))){
   S.duration=Number(field.value);storeSetting('loliteClipsDuration',S.duration);
  }else if(field.dataset.lcSetting==='hotkey'&&KEYS.includes(field.value)){
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
   return '<div class="lc-shell" id="lcRoot"><div class="lc-loading">Opening Lolite Clips…</div></div>';
  }
  return originalPage(app);
 };
 settings();
 client()?.auth.onAuthStateChange(()=>{setTimeout(()=>{if(root())void refreshCloud()},0)});
 window.LoliteClips=Object.freeze({open:()=>window.openApp?.('clips','Lolite Clips',1020,720),stop:stopClip,stopCapture,
  status:()=>({recording:S.recording,captureActive:activeStream(),shortcut:S.hotkey})});
})();
