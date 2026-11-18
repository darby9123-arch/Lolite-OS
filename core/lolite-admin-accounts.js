/* Lolite Admin Center — account directory, reversible moderation and one-time notices.
 * The browser only requests actions. Supabase RPC verifies admin membership, prevents
 * self/other-admin moderation, validates reasons, and records an audit trail.
 */
(()=>{'use strict';
 const sb=()=>window.LoliteBrowserAccounts?.getClient?.()||window.LoliteAccounts?.getClient?.();
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const validId=s=>/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(String(s||''))?String(s):'';
 const isAdmin=()=>window.LoliteAdmin?.isAdmin?.()===true;
 const S={rows:[],moderation:new Map(),admins:new Set(),audit:[],search:'',filter:'all',selected:'',
  limit:100,total:0,loading:false,busy:false,loaded:false,error:'',note:''};
 const root=()=>document.querySelector('.window[data-window-id="admin"] [data-lam-root]')||
  document.querySelector('[data-lam-root]');
 const validArtPath=p=>/^ban-images\/[0-9a-f-]{36}\.(png|jpg|jpeg|webp)$/i.test(String(p||''))?p:'';
 const artUrl=p=>validArtPath(p)?sb()?.storage?.from?.('lolite-admin-media')?.getPublicUrl?.(p)?.data?.publicUrl||'':'';
 const fmtDate=value=>{const d=new Date(value);return Number.isFinite(d.getTime())?
  d.toLocaleString([],{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'Unknown'};
 const isRestricted=row=>row&&(row.action==='ban'||(row.action==='timeout'&&new Date(row.ends_at).getTime()>Date.now()));
 const labelFor=id=>{
  const row=S.moderation.get(id);
  if(!isRestricted(row))return 'Active';
  return row.action==='ban'?'Banned':'Timed out';
 };
 const selectedUser=()=>S.rows.find(x=>x.id===S.selected);
 const statusHtml=id=>{
  const text=labelFor(id);
  return '<span class="lam-status lam-'+(text==='Banned'?'ban':text==='Timed out'?'timeout':'active')+'">'+esc(text)+'</span>';
 };
 const userText=p=>esc(p.display_name||p.username||'Account');
 function userList(){
  const q=S.search.trim().toLowerCase();
  const matches=S.rows.filter(p=>{
   const mod=S.moderation.get(p.id),status=labelFor(p.id);
   const search=(p.username+' '+(p.display_name||'')).toLowerCase().includes(q);
   return search&&(S.filter==='all'||S.filter==='restricted'&&status!=='Active'||S.filter==='active'&&status==='Active');
  });
  return matches.length?matches.map(p=>{
   const admin=S.admins.has(p.id);
   return '<button type="button" class="lam-account'+(S.selected===p.id?' selected':'')+'" data-lam-user="'+esc(p.id)+'" aria-pressed="'+String(S.selected===p.id)+'">'+
    '<span class="lam-avatar">'+esc((p.username||'?').slice(0,1).toUpperCase())+'</span>'+
    '<span class="lam-account-copy"><strong>'+userText(p)+'</strong><small>@'+esc(p.username)+
    ' · Created '+esc(fmtDate(p.created_at))+'</small></span>'+
    (admin?'<span class="lam-status lam-admin">Admin</span>':statusHtml(p.id))+
    '</button>';
  }).join(''):'<p class="lam-empty">No accounts match this search.</p>';
 }
 function userPanel(){
  const p=selectedUser();
  if(!p)return '<p class="lam-empty">Choose an account to view details and moderation options.</p>';
  const admin=S.admins.has(p.id),mod=S.moderation.get(p.id),active=isRestricted(mod);
  const image=mod?.action==='ban'&&validArtPath(mod.ban_image_path)?artUrl(mod.ban_image_path):'';
  const banImagePanel=!admin&&mod?.action==='ban'?
   '<div class="lam-ban-art"><h4>Ban screen picture</h4>'+
    '<p>Optional picture displayed beside the ban reason. You can hide or change it without unbanning.</p>'+
    (image?'<img src="'+esc(image)+'" alt="Selected ban-screen picture" class="lam-ban-art-preview">':'')+
    '<label>Choose image from your files (PNG, JPG, WebP · up to 2 MB)'+
    '<input type="file" data-lam-ban-file accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"></label>'+
    '<div class="lam-ban-actions">'+
    (image?'<button type="button" data-lam-ban-image-toggle data-enable="'+(mod.ban_image_enabled?'false':'true')+'">'+
      (mod.ban_image_enabled?'Hide ban picture':'Show ban picture')+'</button>':'<small>Choose an image to enable the picture.</small>')+
    '<button type="button" class="lam-danger" data-lam-unban>Unban account</button></div>'+
    '<small>Picture: '+(mod.ban_image_enabled?'On':'Off')+'. The account can always sign out or close Lolite.</small>'+
   '</div>':'';

  return '<div class="lam-detail-head"><div><span class="lam-eyebrow">SELECTED ACCOUNT</span>'+
   '<h3>'+userText(p)+'</h3><p>@'+esc(p.username)+' · Joined '+esc(fmtDate(p.created_at))+'</p></div>'+
   (admin?'<span class="lam-status lam-admin">Admin account</span>':statusHtml(p.id))+'</div>'+
   (active?'<div class="lam-current"><strong>'+esc(mod.action==='ban'?'Ban active':'Timeout active')+'</strong>'+
    '<p>Reason: '+esc(mod.reason)+'</p>'+
    (mod.ends_at?'<small>Ends '+esc(fmtDate(mod.ends_at))+'</small>':'<small>Permanent until an admin removes it</small>')+'</div>':'')+
   (admin?'<p class="lam-empty">Other administrator accounts are protected from bans and timeouts.</p>':
    '<div class="lam-classroom"><div><strong>Classroom Pause</strong><p>Temporarily locks this Lolite account for the remainder of a class. The user sees the duration and reason, with no dismiss button to return to Lolite.</p></div>'+ 
    '<button type="button" data-lam-classroom-pause class="lam-danger"'+(S.busy?' disabled':'')+'>Pause for 45 minutes</button></div>'+
    '<form data-lam-moderate class="lam-form">'+
    '<h4>Moderation action</h4><label>Action<select name="action" data-lam-action-select>'+
     '<option value="timeout">Timeout</option><option value="ban">Ban</option><option value="clear">Remove ban / timeout</option>'+
    '</select></label>'+
    '<label data-lam-duration>Timeout length<select name="minutes">'+
     '<option value="10">10 minutes</option><option value="60">1 hour</option><option value="1440">1 day</option>'+
     '<option value="10080">7 days</option><option value="43200">30 days</option>'+
    '</select></label>'+
    '<label>Reason<textarea name="reason" rows="2" maxlength="240" placeholder="Explain why this account is being moderated" required></textarea></label>'+
    '<button type="submit" class="lam-danger"'+(S.busy?' disabled':'')+'>Apply moderation</button>'+
    '<small>Moderation is logged, reversible, and cannot target administrators. The user sees the reason.</small></form>')+
   banImagePanel+
   '<form data-lam-notice class="lam-form">'+
    '<h4>Send a one-time Lolite notice</h4>'+
    '<label>Message<textarea name="message" rows="2" maxlength="240" minlength="3" placeholder="Write a short announcement…" required></textarea></label>'+
    '<button type="submit"'+(S.busy?' disabled':'')+'>Send announcement</button>'+
    '<small>Appears once in Lolite. The recipient can choose to open a new Lolite tab; no forced or repeating pop-ups. Maximum one notice per user per 15 minutes.</small>'+
    '</form>';
 }
 function auditList(){
  return S.audit.length?S.audit.slice(0,20).map(entry=>{
   const target=S.rows.find(r=>r.id===entry.target_id),actor=S.rows.find(r=>r.id===entry.actor_id);
   return '<div class="lam-audit-row"><strong>'+esc(entry.action.toUpperCase())+
    '</strong><span>'+esc(target?.username||'Account')+' · by '+esc(actor?.username||'Staff')+
    '</span><small>'+esc(fmtDate(entry.created_at))+'</small></div>';
  }).join(''):'<p class="lam-empty">No moderation actions recorded yet.</p>';
 }
 function markup(){
  if(!isAdmin())return '';
  return '<section class="lam-root" data-lam-root aria-label="Account management">'+
   '<header class="lam-header"><div><span class="lam-eyebrow">ADMIN CENTER · ACCOUNTS</span>'+
   '<h2>Accounts & moderation</h2><p>See when Lolite accounts were created, manage access, and send one-time notices.</p></div>'+
   '<button type="button" data-lam-refresh>Refresh accounts</button></header>'+
   '<div class="lam-toolbar"><input type="search" data-lam-search value="'+esc(S.search)+'" placeholder="Find a username…" aria-label="Search Lolite accounts">'+
   '<select data-lam-filter aria-label="Filter accounts"><option value="all"'+(S.filter==='all'?' selected':'')+'>All accounts</option>'+
   '<option value="active"'+(S.filter==='active'?' selected':'')+'>Active</option>'+
   '<option value="restricted"'+(S.filter==='restricted'?' selected':'')+'>Banned / timed out</option></select></div>'+
   '<p class="lam-message" data-lam-message role="status" aria-live="polite">'+
   esc(S.error||S.note||(S.loading?'Loading accounts…':S.loaded?'Showing '+S.rows.length+(S.total>S.rows.length?' of '+S.total:'')+' accounts':'Load accounts to begin.'))+'</p>'+
   '<div class="lam-columns"><div class="lam-directory"><div class="lam-account-list" data-lam-list>'+
    userList()+'</div>'+
    (S.total>S.rows.length?'<button type="button" data-lam-more>Load older accounts</button>':'')+
    '</div><div class="lam-details" data-lam-details>'+userPanel()+'</div></div>'+
   '<details class="lam-audit"><summary>Recent moderation history</summary><div data-lam-audit>'+auditList()+'</div></details>'+
   '</section>';
 }
 function setNote(value,error=false){
  S.note=error?'':String(value||'').slice(0,300);S.error=error?String(value||'').slice(0,300):'';
  const el=root()?.querySelector('[data-lam-message]');
  if(el)el.textContent=S.error||S.note;
 }
 function render({force=false}={}){
  const el=root();if(!el)return;
  // Keep an actively edited form, but refresh fully when moderation succeeds.
  if(!force&&el.querySelector('form:focus-within'))return;
  const wrapper=document.createElement('div');wrapper.innerHTML=markup();
  const fresh=wrapper.firstElementChild;
  if(fresh)el.replaceWith(fresh);
 }
 function updateList(){
  const el=root();if(!el)return;
  const list=el.querySelector('[data-lam-list]');
  if(list)list.innerHTML=userList();
  const detail=el.querySelector('[data-lam-details]');
  if(detail&&!detail.querySelector('form:focus-within'))detail.innerHTML=userPanel();
 }
 async function load({more=false}={}){
  const client=sb();
  if(!client||!isAdmin()||S.loading)return false;
  S.loading=true;S.error='';setNote('Loading account creation dates…');
  if(more)S.limit=Math.min(2000,S.limit+100);
  try{
   const auth=await client.auth.getUser();
   if(!auth.data?.user)throw Error('Sign in to an admin account.');
   const results=await Promise.all([
    client.from('profiles').select('id,username,display_name,created_at',{count:'exact'})
     .order('created_at',{ascending:false}).range(0,S.limit-1),
    client.from('lolite_account_moderation').select('user_id,action,reason,ends_at,updated_at,ban_image_path,ban_image_enabled').limit(2000),
    client.from('lolite_admins').select('user_id').limit(100),
    client.from('lolite_moderation_audit').select('id,actor_id,target_id,action,reason,ends_at,created_at')
     .order('created_at',{ascending:false}).limit(30)
   ]);
   for(const result of results)if(result.error)throw result.error;
   S.rows=results[0].data||[];S.total=results[0].count??S.rows.length;
   S.moderation=new Map((results[1].data||[]).map(x=>[x.user_id,x]));
   S.admins=new Set((results[2].data||[]).map(x=>x.user_id));
   S.audit=results[3].data||[];
   S.loaded=true;
   if(S.selected&&!S.rows.some(r=>r.id===S.selected))S.selected='';
   setNote(S.rows.length+' account'+(S.rows.length===1?'':'s')+' loaded.');
   render({force:S.busy});return true;
  }catch(error){
   setNote(error?.message||'Account directory unavailable',true);
   render({force:S.busy});return false;
  }finally{S.loading=false}
 }
 async function moderate(form){
  const p=selectedUser(),action=String(form.elements.action.value);
  if(!p||!validId(p.id)||!isAdmin()||S.busy)throw Error('Choose an account with admin access.');
  if(S.admins.has(p.id))throw Error('Admin accounts cannot be moderated.');
  const reason=String(form.elements.reason.value||'').trim(),minutes=Number(form.elements.minutes.value);
  if(reason.length<3||reason.length>240)throw Error('Enter a reason between 3 and 240 characters.');
  if(!['timeout','ban','clear'].includes(action))throw Error('Invalid action.');
  if(action==='ban'&&!window.confirm('Ban @'+p.username+' from Lolite OS? Reason: '+reason))return;
  S.busy=true;
  try{
   const result=await sb().rpc('lolite_admin_moderate_account',{
    p_target:p.id,p_action:action,p_reason:reason,p_minutes:action==='timeout'?minutes:null
   });
   if(result.error)throw result.error;
   setNote(action==='ban'?'Account banned.':action==='timeout'?'Account timed out.':'Account restriction removed.');
   await load();
  }finally{S.busy=false}
 }
 async function classroomPause(){
  const p=selectedUser(),client=sb();
  if(!p||!validId(p.id)||!client||!isAdmin()||S.busy||S.admins.has(p.id))
   throw Error('Select a non-admin account first.');
  if(!window.confirm('Pause Lolite for @'+p.username+' for 45 minutes? They will see the reason and cannot dismiss the Lolite timeout.'))return;
  S.busy=true;
  try{
   const result=await client.rpc('lolite_admin_moderate_account',{
    p_target:p.id,p_action:'timeout',p_reason:'Using Lolite during class',
    p_minutes:45
   });
   if(result.error)throw result.error;
   setNote('Classroom Pause applied to @'+p.username+' for 45 minutes.');
   S.loading=false;
   await load();
  }finally{S.busy=false}
 }
 async function unban(){
  const p=selectedUser(),client=sb();
  if(!p||!validId(p.id)||!client||!isAdmin()||S.busy||S.admins.has(p.id))
   throw Error('Select a banned non-admin account.');
  if(S.moderation.get(p.id)?.action!=='ban')throw Error('This account is not banned.');
  if(!window.confirm('Unban @'+p.username+' and restore Lolite access?'))return;
  S.busy=true;
  try{
   const result=await client.rpc('lolite_admin_moderate_account',{
    p_target:p.id,p_action:'clear',p_reason:'Unbanned by an administrator',p_minutes:null
   });
   if(result.error)throw result.error;
   setNote('@'+p.username+' has been unbanned.');
   await load();
  }finally{S.busy=false}
 }
 async function setBanArt(path,enabled){
  const p=selectedUser(),client=sb();
  if(!p||!validId(p.id)||!client||!isAdmin()||S.busy||S.admins.has(p.id))
   throw Error('Select a banned non-admin account.');
  S.busy=true;
  try{
   const response=await client.rpc('lolite_admin_set_ban_image',{
    p_target:p.id,p_image_path:path||null,p_enabled:!!enabled
   });
   if(response.error)throw response.error;
   setNote(enabled?'Ban-screen picture enabled.':'Ban-screen picture hidden.');
   await load();
  }finally{S.busy=false}
 }
 async function uploadBanArt(input){
  const file=input?.files?.[0],p=selectedUser(),client=sb();
  if(!file)return;
  if(!p||!client||!isAdmin()||S.busy||S.admins.has(p.id)||S.moderation.get(p.id)?.action!=='ban')
   throw Error('Select a banned non-admin account first.');
  const ext=(file.name.split('.').pop()||'').toLowerCase();
  const mime={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp'}[ext];
  if(!mime||!file.size||file.size>2*1024*1024)
   throw Error('Choose a PNG, JPG or WebP picture smaller than 2 MB.');
  if(file.type&&file.type!==mime)throw Error('Picture file extension and type do not match.');
  // Reject non-images before storage upload.
  const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
  const ascii=(start,len)=>String.fromCharCode(...bytes.slice(start,start+len));
  const correct=mime==='image/png'?bytes[0]===137&&ascii(1,3)==='PNG':
   mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:
   ascii(0,4)==='RIFF'&&ascii(8,4)==='WEBP';
  if(!correct)throw Error('This file does not contain a supported image.');
  S.busy=true;
  const path='ban-images/'+crypto.randomUUID()+'.'+(ext==='jpeg'?'jpg':ext);
  try{
   const upload=await client.storage.from('lolite-admin-media')
    .upload(path,file,{contentType:mime,upsert:false});
   if(upload.error)throw upload.error;
   const response=await client.rpc('lolite_admin_set_ban_image',{
    p_target:p.id,p_image_path:path,p_enabled:true
   });
   if(response.error)throw response.error;
   setNote('Ban picture saved and enabled for @'+p.username+'.');
   await load();
  }finally{S.busy=false}
 }
 async function sendNotice(form){
  const p=selectedUser();
  if(!p||!isAdmin()||S.busy)throw Error('Select an account first.');
  const message=String(form.elements.message.value||'').trim();
  if(message.length<3||message.length>240)throw Error('Announcement must be 3–240 characters.');
  S.busy=true;
  try{
   const result=await sb().rpc('lolite_admin_send_notice',{p_target:p.id,p_message:message});
   if(result.error)throw result.error;
   form.reset();setNote('One-time announcement sent to @'+p.username+'.');
   await load();
  }finally{S.busy=false}
 }
 document.addEventListener('click',event=>{
  const el=event.target.closest?.('[data-lam-user],[data-lam-refresh],[data-lam-more],[data-lam-classroom-pause],[data-lam-unban],[data-lam-ban-image-toggle]');
  if(!el||!el.closest('[data-lam-root]')||!isAdmin())return;
  if(el.matches('[data-lam-user]')){
   S.selected=validId(el.dataset.lamUser);
   updateList();
  }else if(el.matches('[data-lam-classroom-pause]')){
   el.disabled=true;
   void classroomPause().catch(error=>setNote(error?.message||'Classroom Pause failed',true))
    .finally(()=>{if(el.isConnected)el.disabled=false});
  }else if(el.matches('[data-lam-unban]')){
   el.disabled=true;
   void unban().catch(error=>setNote(error?.message||'Unban failed',true))
    .finally(()=>{if(el.isConnected)el.disabled=false});
  }else if(el.matches('[data-lam-ban-image-toggle]')){
   el.disabled=true;
   void setBanArt(null,el.dataset.enable==='true')
    .catch(error=>setNote(error?.message||'Could not update ban picture',true))
    .finally(()=>{if(el.isConnected)el.disabled=false});
  }else if(el.matches('[data-lam-refresh]'))void load();
  else if(el.matches('[data-lam-more]'))void load({more:true});
 });
 document.addEventListener('input',event=>{
  const el=event.target.closest?.('[data-lam-search]');
  if(el&&el.closest('[data-lam-root]')){S.search=el.value.slice(0,80);updateList()}
 });
 document.addEventListener('change',event=>{
  const el=event.target.closest?.('[data-lam-filter],[data-lam-action-select],[data-lam-ban-file]');
  if(!el||!el.closest('[data-lam-root]'))return;
  if(el.matches('[data-lam-ban-file]')){
   void uploadBanArt(el).catch(error=>setNote(error?.message||'Could not upload picture',true));
   return;
  }
  if(el.matches('[data-lam-filter]')){S.filter=el.value;updateList()}
  if(el.matches('[data-lam-action-select]')){
   const label=el.closest('form')?.querySelector('[data-lam-duration]');
   if(label)label.hidden=el.value!=='timeout';
  }
 });
 document.addEventListener('submit',async event=>{
  const form=event.target.closest?.('[data-lam-moderate],[data-lam-notice]');
  if(!form||!form.closest('[data-lam-root]'))return;
  event.preventDefault();
  const button=form.querySelector('[type=submit]');
  if(button?.disabled||S.busy)return;
  if(button)button.disabled=true;
  try{
   if(form.matches('[data-lam-moderate]'))await moderate(form);
   else await sendNotice(form);
  }catch(error){setNote(error?.message||'Action failed',true)}
  finally{S.busy=false;if(button?.isConnected)button.disabled=false}
 });
 window.LoliteAdminAccounts=Object.freeze({markup,refresh:load,render,state:()=>({
  count:S.rows.length,selected:S.selected,loading:S.loading,loaded:S.loaded
 })});
})();
