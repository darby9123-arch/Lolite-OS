/* Lolite Admin Center: server-authorized roles, shared library and cosmetic tab appearance.
 * Supabase RLS, not this UI, decides who can publish and delete content.
 */
(()=>{
 'use strict';
 const sb=window.LoliteBrowserAccounts?.getClient?.();
 const BUCKET='lolite-admin-media';
 const state={user:null,admin:false,items:[],loaded:false,error:'',busy:false,zip:null,zipBusy:false,zipError:'',zipProgress:'',zipToken:0};
 const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const notify=message=>window.toast?.(String(message))||console.info(message);
 const validateURL=value=>{
  try{
   const u=new URL(String(value||'').trim());
   return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname.includes('.')&&u.href.length<=2048?u.href:'';
  }catch{return ''}
 };
 const getAdmin=()=>state.admin;
 function clearZip(){
  state.zipToken++;
  for(const entry of state.zip?.entries||[])if(entry.preview)URL.revokeObjectURL(entry.preview);
  state.zip=null;state.zipBusy=false;state.zipError='';state.zipProgress='';
 }
 const zipForm=()=>document.querySelector('.window[data-window-id="admin"] form[data-la-form]');
 function zipMarkup(){
  if(state.zipBusy)return '<p class="la-note" role="status">Inspecting ZIP, checking MP4 checksums and testing video playback…</p>';
  if(state.zipError)return '<p class="la-zip-error" role="alert">'+safe(state.zipError)+'</p>';
  if(!state.zip)return '';
  const entries=state.zip.entries,ready=entries.filter(e=>e.selected&&!e.error&&!e.published).length;
  return '<div class="la-zip-head"><div><strong>Review wallpaper ZIP</strong><p>'+entries.length+' video(s) found · '+ready+' selected for publishing. Only MP4 files are uploaded, not the ZIP.</p></div>'+
    '<span role="status">'+safe(state.zipProgress)+'</span></div>'+
    '<div class="la-zip-grid">'+entries.map((entry,i)=>'<label class="la-zip-card '+(entry.error?'la-zip-invalid':'')+'">'+
      '<video src="'+safe(entry.preview)+'" muted playsinline loop controls preload="none"></video>'+
      '<span class="la-zip-meta"><input type="checkbox" data-la-zip-entry="'+i+'" '+(entry.selected?'checked ':'')+(entry.error||entry.published||state.busy?'disabled ':'')+'>'+
      '<span><strong>'+safe(entry.name)+'</strong><small>'+safe(entry.error||entry.published?'Published':entry.width+' × '+entry.height+' · '+Math.round(entry.duration)+'s · '+(entry.size/1024/1024).toFixed(1)+' MB')+'</small>'+
      (entry.error?'<small class="la-zip-error">'+safe(entry.error)+'</small>':'')+'</span></span></label>').join('')+'</div>'+
    '<p class="la-note">The title above is an optional pack prefix; each video keeps its filename as its wallpaper name. Any previously published files are skipped if you retry.</p>';
 }
 function showZipPreview(){
  const form=zipForm(),box=form?.querySelector('[data-la-zip-preview]');
  if(!box)return;
  const kind=form.elements.kind?.value,file=form.elements.file?.files?.[0];
  const isZip=kind==='wallpaper'&&(/\.zip$/i.test(file?.name||'')||!!state.zip||state.zipBusy);
  box.hidden=!isZip;box.innerHTML=isZip?zipMarkup():'';
  if(form.elements.title)form.elements.title.required=!isZip;
 }
 async function prepareZip(file){
  clearZip();
  if(!file||!/\.zip$/i.test(file.name))return;
  const token=state.zipToken;
  state.zipBusy=true;showZipPreview();
  try{
   if(!window.LoliteWallpaperZip?.inspect)throw Error('ZIP inspector is unavailable. Reload Lolite OS.');
   const entries=await window.LoliteWallpaperZip.inspect(file);
   if(token!==state.zipToken)return;
   for(const entry of entries)entry.preview=URL.createObjectURL(entry.blob);
   state.zip={file,entries};
  }catch(error){if(token===state.zipToken)state.zipError=error?.message||String(error)}
  finally{if(token===state.zipToken){state.zipBusy=false;showZipPreview()}}
 }
 async function publishZip(form,file,prefix){
  if(state.zipBusy)throw Error('The ZIP is still being inspected.');
  if(state.zipError)throw Error(state.zipError);
  if(state.zip?.file!==file)throw Error('Select the ZIP again and review the videos before publishing.');
  const selected=state.zip.entries.filter(entry=>entry.selected&&!entry.error&&!entry.published);
  if(!selected.length)throw Error('Select at least one valid MP4 to publish.');
  state.busy=true;
  let published=0;
  try{
   for(const entry of selected){
    const title=(prefix?prefix+' — ':'')+entry.name;
    const finalTitle=title.slice(0,90);
    const unique=crypto.randomUUID();
    const storagePath='wallpapers/'+unique+'.mp4';
    state.zipProgress='Publishing '+(published+1)+' of '+selected.length+': '+entry.name;
    showZipPreview();
    const uploaded=await sb.storage.from(BUCKET).upload(storagePath,entry.blob,{contentType:'video/mp4',upsert:false});
    if(uploaded.error)throw Error('Upload failed for '+entry.name+': '+uploaded.error.message);
    const url=validateURL(sb.storage.from(BUCKET).getPublicUrl(storagePath).data?.publicUrl);
    if(!url){await sb.storage.from(BUCKET).remove([storagePath]);throw Error('Could not create a public URL for '+entry.name)}
    const added=await sb.from('lolite_library_items').insert({
     kind:'wallpaper',title:finalTitle,url,storage_path:storagePath,created_by:state.user.id
    }).select('id').single();
    if(added.error){
     await sb.storage.from(BUCKET).remove([storagePath]);
     throw Error('Publish failed for '+entry.name+': '+added.error.message);
    }
    entry.published=true;entry.selected=false;published++;
   }
   state.zipProgress=published+' wallpaper(s) published.';
   form.reset();clearZip();
   notify('Published '+published+' video wallpaper(s) for everyone.');
  }catch(error){
   state.zipProgress=published?published+' published; remaining clips can be retried.':'';
   throw error;
  }finally{
   state.busy=false;showZipPreview();
   if(published)await loadItems();
  }
 }
 const list=kind=>state.items.filter(item=>!kind||item.kind===kind);
 const adminRoot=()=>document.querySelector('.window[data-window-id="admin"] .content');
 const displayDate=value=>{const d=new Date(value);return Number.isNaN(d.getTime())?'New':d.toLocaleDateString([], {month:'short',day:'numeric',year:'numeric'})};
 const dispatchUpdated=()=>{
  window.dispatchEvent(new CustomEvent('lolite:library-updated',{detail:{items:state.items.slice()}}));
  draw();
 };
 async function loadItems(){
  if(!sb)return;
  const {data,error}=await sb.from('lolite_library_items')
   .select('id,kind,title,url,storage_path,created_by,created_at')
   .order('created_at',{ascending:false}).limit(500);
  if(error){state.error=error.message;console.warn('Shared Lolite library:',error.message);return}
  state.items=(data||[]).filter(item=>['game','wallpaper','website'].includes(item.kind)&&validateURL(item.url));
  state.error='';dispatchUpdated();
 }
 async function syncRole(){
  if(!sb)return;
  try{
   const {data:auth,error:authError}=await sb.auth.getUser();
   if(authError&&authError.name!=='AuthSessionMissingError')throw authError;
   state.user=auth?.user||null;
   state.admin=false;
   if(state.user){
    const {data,error}=await sb.from('lolite_admins').select('user_id').eq('user_id',state.user.id).maybeSingle();
    if(error)throw error;
    state.admin=Boolean(data?.user_id===state.user.id);
   }
   window.dispatchEvent(new CustomEvent('lolite:admin-status',{detail:{isAdmin:state.admin}}));
   draw();
  }catch(error){state.admin=false;console.warn('Lolite admin role:',error?.message||error)}
 }
 function row(item){
  return '<div class="la-item"><div class="la-item-copy"><strong>'+safe(item.title)+'</strong><small>'+
   safe(item.kind)+' · '+safe(displayDate(item.created_at))+'</small></div>'+
   (item.kind==='website'?'<button type="button" data-la-action="visit" data-la-id="'+safe(item.id)+'">Visit</button>'+
     '<button type="button" data-la-action="appearance" data-la-id="'+safe(item.id)+'">Use tab appearance</button>':
     item.kind==='game'?'<button type="button" data-la-action="play" data-la-id="'+safe(item.id)+'">Play</button>':
     '<button type="button" data-la-action="wallpaper" data-la-id="'+safe(item.id)+'">Apply</button>')+
   (state.admin?'<button class="la-danger" type="button" data-la-action="remove" data-la-id="'+safe(item.id)+'">Remove</button>':'')+'</div>';
 }
 function panel(){
  if(!state.admin)return '<section class="la-shell"><h1>Admin Center</h1><p>Sign in to the authorized admin account in Lolite Chat to manage the shared library.</p><button type="button" data-la-action="signin">Open Lolite Chat</button></section>';
  return '<section class="la-shell"><div class="la-head"><div><small>LOLITE OS · STAFF</small><h1>Admin Center</h1><p>Your changes are saved to the shared Lolite library. Public chat moderation is available in Lolite Chat.</p></div><button type="button" data-la-action="reload">Refresh library</button></div>'+
   '<form data-la-form class="la-form"><h2>Publish new content</h2>'+
   '<label>Content type<select name="kind" required data-la-kind><option value="game">HTML game</option><option value="wallpaper">Wallpaper</option><option value="website">Website shortcut</option></select></label>'+
   '<label>Title<input name="title" required maxlength="90" minlength="2" placeholder="Name to display (optional ZIP prefix)"></label>'+
   '<label>HTTPS website or file URL<input name="url" type="url" placeholder="https://example.com/game.html" autocomplete="url"></label>'+
   '<label data-la-upload-box>Or upload a file / MP4 wallpaper ZIP<input type="file" name="file" data-la-file accept=".html,.htm,text/html"></label>'+
   '<p class="la-note">Wallpapers: upload an image, MP4, WebM, or ZIP containing up to 24 MP4s. ZIPs are checked and reviewed before publishing. HTML games should be self-contained; website shortcuts require HTTPS.</p>'+   '<div data-la-zip-preview class="la-zip-review" hidden></div>'+
   '<button class="la-primary" type="submit" '+(state.busy?'disabled':'')+'>'+(state.busy?'Publishing…':'Publish to Lolite')+'</button></form>'+
   '<div class="la-list-head"><h2>Published items</h2><span>'+state.items.length+' total</span></div>'+
   '<div class="la-items">'+(state.items.length?state.items.map(row).join(''):'<p class="la-note">No shared items yet. Publish your first game, wallpaper or website.</p>')+'</div></section>';
 }
 function websites(){
  const entries=list('website');
  return '<section class="la-shell"><div class="la-head"><div><small>LOLITE OS · WEB</small><h1>Website Library</h1><p>Shared HTTPS website shortcuts. Your actual browser address remains unchanged.</p></div>'+
   (state.admin?'<button data-la-action="admin">Admin Center</button>':'')+'</div>'+
   '<div class="la-items">'+(entries.length?entries.map(row).join(''):'<p>No website shortcuts have been published yet.</p>')+'</div></section>';
 }
 function draw(){
  const root=adminRoot();
  if(root&&!state.zipBusy&&!state.zip&&!root.querySelector('[data-la-form]:focus-within'))root.innerHTML=panel();
  const web=document.querySelector('.window[data-window-id="websites"] .content');
  if(web)web.innerHTML=websites();
 }
 function open(){
  if(!state.admin){notify('Admin access requires the authorized Lolite Chat account.');window.LoliteChat?.open?.();return false}
  window.openApp?.('admin','Admin Center',960,720);
  window.LoliteDeviceMode?.activateWindow?.('admin');
  draw();return true;
 }
 function openWebsites(){
  window.openApp?.('websites','Website Library',920,670);
  window.LoliteDeviceMode?.activateWindow?.('websites');
  draw();
 }
 async function publish(form){
  if(!state.admin||!state.user||!sb)throw Error('Admin sign-in is required.');
  if(state.busy)return;
  const kind=form.elements.kind?.value;
  const title=String(form.elements.title?.value||'').trim().slice(0,90);
  const file=form.querySelector('input[name="file"]')?.files?.[0]||null;
  const isZip=kind==='wallpaper'&&/\.zip$/i.test(file?.name||'');
  if(!['game','wallpaper','website'].includes(kind)||(!isZip&&title.length<2))throw Error('Choose a type and enter a title.');
  if(isZip)return publishZip(form,file,title);
  let url=validateURL(form.elements.url?.value),storagePath=null;
  if(file){
   if(kind==='website')throw Error('Website shortcuts require an HTTPS link, not a file.');
   const ext=(file.name.split('.').pop()||'').toLowerCase();
   const type=kind==='game'?'text/html':file.type;
   if(kind==='game'&&!['html','htm'].includes(ext))throw Error('Upload a standalone .html or .htm game.');
   if(kind==='wallpaper'&&!['image/png','image/jpeg','image/webp','video/mp4','video/webm'].includes(type))throw Error('Choose a PNG, JPG, WebP, MP4 or WebM wallpaper.');
   if(file.size===0||file.size>25*1024*1024)throw Error('Files must be between 1 byte and 25 MB.');
   if(kind==='game'){
    const html=await file.text();
    if(!/<(?:html|head|body|script|canvas|div)\b/i.test(html))throw Error('This file does not contain an HTML game.');
    if(/<iframe\b/i.test(html))throw Error('Please upload an actual HTML game, not an iframe wrapper.');
   }
   const suffix=kind==='game'?'html':ext;
   const unique=typeof crypto?.randomUUID==='function'?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2);
   storagePath=(kind==='game'?'games/':'wallpapers/')+unique+'.'+suffix;
   state.busy=true;
   const uploaded=await sb.storage.from(BUCKET).upload(storagePath,file,{contentType:type,upsert:false});
   if(uploaded.error)throw Error('Upload failed: '+uploaded.error.message);
   url=validateURL(sb.storage.from(BUCKET).getPublicUrl(storagePath).data?.publicUrl);
  }
  if(!url)throw Error('Enter a valid HTTPS URL or choose a supported file.');
  const result=await sb.from('lolite_library_items')
    .insert({kind,title,url,storage_path:storagePath,created_by:state.user.id}).select('id').single();
  if(result.error){
   if(storagePath)void sb.storage.from(BUCKET).remove([storagePath]);
   throw Error('Publishing failed: '+result.error.message);
  }
  form.reset();notify('Published '+title+' to the shared '+kind+' library.');
  await loadItems();
 }
 async function removeItem(item){
  if(!state.admin)throw Error('Admin permission is required.');
  if(!window.confirm('Remove "'+item.title+'" from the shared Lolite library for everyone?'))return;
  const {data,error}=await sb.from('lolite_library_items').delete().eq('id',item.id).select('id');
  if(error)throw error;
  if(!data?.length)throw Error('No item was removed. Check your admin permissions.');
  if(item.storage_path){
   const cleanup=await sb.storage.from(BUCKET).remove([item.storage_path]);
   if(cleanup.error)console.warn('Removed listing, but could not delete uploaded file:',cleanup.error.message);
  }
  notify('Removed '+item.title+'.');await loadItems();
 }
 function itemById(id){return state.items.find(item=>item.id===id)}
 document.addEventListener('submit',async event=>{
  const form=event.target.closest('form[data-la-form]');if(!form)return;
  event.preventDefault();
  const button=form.querySelector('[type="submit"]');if(button?.disabled||state.busy)return;
  if(button)button.disabled=true;
  try{await publish(form)}catch(e){notify(e.message||String(e));console.warn('Admin publish:',e)}
  finally{state.busy=false;if(button?.isConnected)button.disabled=false;draw();showZipPreview()}
 });
 document.addEventListener('change',event=>{
  const checkbox=event.target.closest('[data-la-zip-entry]');
  if(checkbox){
   const entry=state.zip?.entries?.[Number(checkbox.dataset.laZipEntry)];
   if(entry&&!entry.error&&!entry.published)entry.selected=checkbox.checked;
   showZipPreview();return;
  }
  const kind=event.target.closest('[data-la-kind]');
  if(kind){
   const form=kind.closest('form'),file=form?.querySelector('input[type=file]');
   if(!file)return;
   clearZip();
   const website=kind.value==='website';
   file.disabled=website;file.value='';
   file.accept=kind.value==='game'?'.html,.htm,text/html':'.png,.jpg,.jpeg,.webp,.mp4,.webm,.zip,image/png,image/jpeg,image/webp,video/mp4,video/webm,application/zip';
   form.querySelector('[data-la-upload-box]')?.classList.toggle('la-hidden',website);
   showZipPreview();return;
  }
  const file=event.target.closest('[data-la-file]');
  if(file){
   if(file.closest('form')?.elements.kind?.value==='wallpaper'&&/\.zip$/i.test(file.files?.[0]?.name||'')){
    void prepareZip(file.files[0]);
   }else{clearZip();showZipPreview()}
  }
 });
 document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-la-action]');
  if(!button||!button.closest('.la-shell'))return;
  const action=button.dataset.laAction,item=itemById(button.dataset.laId);
  try{
   if(action==='reload'){await Promise.all([syncRole(),loadItems()]);return}
   if(action==='signin'){window.LoliteChat?.open?.();return}
   if(action==='admin'){open();return}
   if(!item)return;
   if(action==='remove'){await removeItem(item);return}
   if(action==='visit'){window.open(item.url,'_blank','noopener,noreferrer');return}
   if(action==='appearance'){
    if(!window.LoliteTabCloak?.useWebsite?.(item.url,item.title))throw Error('Tab appearance settings are unavailable.');
    notify('Tab title and icon updated. The website address has not changed.');return;
   }
   if(action==='play'){window.LoliteGamePlayer?.open({title:item.title,file:'admin-'+item.id,url:item.url,source:'Lolite admin library'});return}
   if(action==='wallpaper'){window.LoliteWallpapers?.apply('admin-'+item.id);return}
  }catch(error){notify(error?.message||String(error));console.error('Admin item:',error)}
 });
 const previous=window.page;
 window.page=function(id){
  if(id==='admin')return panel();
  if(id==='websites')return websites();
  return previous.apply(this,arguments);
 };
 window.LoliteAdmin=Object.freeze({open,openWebsites,isAdmin:getAdmin,items:()=>state.items.slice(),syncRole,refresh:loadItems});
 const start=async()=>{
  if(!sb){console.warn('Lolite Admin Center: Supabase client not connected');return}
  await Promise.all([loadItems(),syncRole()]);
  sb.auth.onAuthStateChange(()=>setTimeout(()=>void syncRole(),0));
  sb.channel('lolite-admin-library').on('postgres_changes',
   {event:'*',schema:'public',table:'lolite_library_items'},
   ()=>void loadItems()).subscribe();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else void start();
})();
