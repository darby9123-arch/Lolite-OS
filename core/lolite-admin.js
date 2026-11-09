/* Lolite Admin Center: server-authorized roles, shared library and cosmetic tab appearance.
 * Supabase RLS, not this UI, decides who can publish and delete content.
 */
(()=>{
 'use strict';
 const sb=window.LoliteBrowserAccounts?.getClient?.();
 const BUCKET='lolite-admin-media';
 const state={user:null,admin:false,items:[],loaded:false,error:'',busy:false};
 const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const notify=message=>window.toast?.(String(message))||console.info(message);
 const validateURL=value=>{
  try{
   const u=new URL(String(value||'').trim());
   return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname.includes('.')&&u.href.length<=2048?u.href:'';
  }catch{return ''}
 };
 const getAdmin=()=>state.admin;
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
   '<label>Title<input name="title" required maxlength="90" minlength="2" placeholder="Name to display"></label>'+
   '<label>HTTPS website or file URL<input name="url" type="url" placeholder="https://example.com/game.html" autocomplete="url"></label>'+
   '<label data-la-upload-box>Or upload an HTML game / wallpaper file<input type="file" name="file" accept=".html,.htm,text/html"></label>'+
   '<p class="la-note">HTML uploads work best as self-contained games. Files that need additional scripts or assets may need a fully hosted URL. Website shortcuts only change the tab title/icon when you choose that option; they cannot change the real address.</p>'+
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
  if(root&&!root.querySelector('[data-la-form]:focus-within'))root.innerHTML=panel();
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
  if(!['game','wallpaper','website'].includes(kind)||title.length<2)throw Error('Choose a type and enter a title.');
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
   state.busy=true;draw();
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
  finally{state.busy=false;if(button?.isConnected)button.disabled=false;draw()}
 });
 document.addEventListener('change',event=>{
  const kind=event.target.closest('[data-la-kind]');if(!kind)return;
  const form=kind.closest('form'),file=form?.querySelector('input[type=file]');
  if(!file)return;
  const website=kind.value==='website';
  file.disabled=website;file.value='';
  file.accept=kind.value==='game'?'.html,.htm,text/html':'.png,.jpg,.jpeg,.webp,.mp4,.webm,image/png,image/jpeg,image/webp,video/mp4,video/webm';
  form.querySelector('[data-la-upload-box]')?.classList.toggle('la-hidden',website);
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
