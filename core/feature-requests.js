/* Lolite OS Feature Requests: shared ideas, private moderation and one vote/account.
 * Uses existing Lolite Chat Supabase Auth and database RLS; no service-role keys.
 */
(()=>{'use strict';
 const CATEGORIES=['Apps','UI & Themes','Games','Music','Performance','Other'];
 const STATUSES=['pending','open','planned','in_progress','shipped','declined'];
 const LABELS={pending:'Awaiting review',open:'Open',planned:'Planned',in_progress:'In progress',shipped:'Done',declined:'Not planned'};
 const VOTABLE=new Set(['open','planned','in_progress']);
 const PROOF_BUCKET='lolite-feature-proofs';
 const PROOF_LIMIT=5*1024*1024;
 const IMAGE_TYPES=Object.freeze({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'});
 const PUBLISHED=new Set(['open','planned','in_progress','shipped']);
 const S={user:null,admin:false,loaded:false,loading:false,busy:false,tab:'browse',
  rows:[],votes:new Set(),replies:[],screenshots:new Map(),search:'',category:'All',sort:'top',status:'All',notice:'',error:''};
 const root=()=>document.querySelector('.window[data-window-id="feature-requests"] #lfrRoot')||document.getElementById('lfrRoot');
 const sb=()=>window.LoliteBrowserAccounts?.getClient?.();
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeId=id=>/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(String(id||''))?String(id):'';
 const ensure=r=>{if(r?.error)throw new Error(r.error.message||'Feature Requests service unavailable');return r?.data||[]};
 const date=x=>{const t=new Date(x);return Number.isFinite(t.getTime())?t.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'}):''};
 const statusBadge=status=>'<span class="lfr-badge lfr-status-'+esc(status)+'">'+esc(LABELS[status]||status)+'</span>';
 const notice=msg=>{
  S.notice=String(msg||'').slice(0,300);
  const el=root()?.querySelector('[data-lfr-notice]');if(el)el.textContent=S.notice;
  window.toast?.(S.notice);
 };
 const canVote=r=>VOTABLE.has(r.status)&&!!S.user;
 let requestTicket=0;
 async function load(){
  const ticket=++requestTicket,client=sb();
  if(!root())return;
  S.loading=true;S.error='';render();
  if(!client){S.error='Account service is not ready. Reload Lolite and try again.';S.loading=false;render();return}
  try{
   const identity=await client.auth.getUser();
   if(identity.error&&identity.error.name!=='AuthSessionMissingError')throw identity.error;
   if(ticket!==requestTicket)return;
   const user=identity.data?.user||null;
   S.user=user;S.admin=false;
   if(!user){S.rows=[];S.votes=new Set();S.replies=[];S.screenshots=new Map();S.loaded=true;return}
   const admin=await client.from('lolite_admins').select('user_id').eq('user_id',user.id).maybeSingle();
   if(admin.error)throw admin.error;
   if(ticket!==requestTicket)return;
   S.admin=admin.data?.user_id===user.id;
   const result=await Promise.all([
    client.from('lolite_feature_requests')
     .select('id,submitted_by,title,description,category,status,admin_note,vote_count,created_at,updated_at')
     .order('created_at',{ascending:false}).limit(500),
    client.from('lolite_feature_votes').select('request_id').eq('voter_id',user.id).limit(500),
    client.from('lolite_feature_replies')
     .select('id,request_id,author_id,kind,message,screenshot_path,created_at')
     .order('created_at',{ascending:true}).limit(800)
   ]);
   if(ticket!==requestTicket)return;
   const replies=ensure(result[2]);
   const screenshots=new Map();
   await Promise.all(replies.filter(r=>r.screenshot_path).slice(0,160).map(async r=>{
    try{
     const {data,error}=await client.storage.from(PROOF_BUCKET).createSignedUrl(r.screenshot_path,3600);
     if(!error&&typeof data?.signedUrl==='string')screenshots.set(r.screenshot_path,data.signedUrl);
    }catch(error){console.warn('Feature screenshot unavailable:',error?.message||error)}
   }));
   if(ticket!==requestTicket)return;
   S.rows=ensure(result[0]);
   S.votes=new Set(ensure(result[1]).map(v=>v.request_id));
   S.replies=replies;S.screenshots=screenshots;
   if(!S.admin&&S.tab==='admin')S.tab='browse';
   S.loaded=true;
  }catch(e){if(ticket===requestTicket)S.error=e?.message||'Unable to load feature requests'}
  finally{if(ticket===requestTicket){S.loading=false;render()}}
 }
 function visibleRows(){
  const q=S.search.trim().toLocaleLowerCase();
  let list=S.rows.filter(r=>{
   if(S.tab==='browse'&&!PUBLISHED.has(r.status))return false;
   if(S.tab==='mine'&&r.submitted_by!==S.user?.id)return false;
   if(S.tab==='admin'&&!S.admin)return false;
   if(S.category!=='All'&&r.category!==S.category)return false;
   if(S.status!=='All'&&r.status!==S.status)return false;
   return !q||(r.title+' '+r.description+' '+r.category).toLocaleLowerCase().includes(q);
  });
  list=list.slice();
  if(S.tab==='admin')list.sort((a,b)=>(a.status==='pending'?0:1)-(b.status==='pending'?0:1)||Date.parse(b.created_at)-Date.parse(a.created_at));
  else if(S.sort==='top')list.sort((a,b)=>b.vote_count-a.vote_count||Date.parse(b.created_at)-Date.parse(a.created_at));
  else if(S.sort==='new')list.sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
  else list.sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at));
  return list;
 }
 function replyMarkup(reply){
  const screenshot=reply.screenshot_path?S.screenshots.get(reply.screenshot_path):null;
  return '<div class="lfr-reply'+(reply.kind==='done'?' lfr-reply-done':'')+'">'+
   '<div class="lfr-reply-heading"><strong>'+(reply.kind==='done'?'✓ Done':'Admin reply')+'</strong><time>'+esc(date(reply.created_at))+'</time></div>'+
   '<p>'+esc(reply.message)+'</p>'+
   (reply.screenshot_path?
    (screenshot?'<a class="lfr-proof-link" href="'+esc(screenshot)+'" target="_blank" rel="noopener noreferrer" aria-label="Open screenshot for this reply">'+
      '<img class="lfr-proof-image" alt="Screenshot from the Lolite admin showing the feature" loading="lazy" src="'+esc(screenshot)+'">'+
      '<span>View screenshot full size ↗</span></a>':
     '<span class="lfr-proof-unavailable">Screenshot unavailable. Refresh to try again.</span>'):'')+
   '</div>';
 }
 function item(r){
  const voted=S.votes.has(r.id),allowed=canVote(r);
  const own=r.submitted_by===S.user?.id;
  const replies=S.replies.filter(reply=>reply.request_id===r.id);
  return '<article class="lfr-item" data-lfr-item="'+esc(r.id)+'">'+
   '<div class="lfr-votes"><button type="button" class="lfr-vote '+(voted?'lfr-voted':'')+'" data-lfr-action="vote" data-lfr-id="'+esc(r.id)+'" aria-label="'+(allowed?(voted?'Remove vote from ':'Vote for '):'Voting closed for ')+esc(r.title)+'" aria-pressed="'+voted+'" '+(!allowed||S.busy?'disabled':'')+'><span aria-hidden="true">▲</span><b>'+Number(r.vote_count||0).toLocaleString()+'</b></button><small>votes</small>'+
   (r.status==='shipped'?'<span class="lfr-vote-closed">Voting closed</span>':'')+'</div>'+
   '<div class="lfr-item-main"><div class="lfr-item-top">'+statusBadge(r.status)+
    '<span class="lfr-category">'+esc(r.category)+'</span>'+
    (own?'<span class="lfr-owned">Your request</span>':'')+'</div>'+
   '<h3>'+esc(r.title)+'</h3><p class="lfr-description">'+esc(r.description)+'</p>'+
   '<div class="lfr-date">Suggested '+esc(date(r.created_at))+'</div>'+
   (r.admin_note?'<div class="lfr-admin-message"><strong>Team update</strong><p>'+esc(r.admin_note)+'</p></div>':'')+
   (replies.length?'<div class="lfr-replies"><h4>Updates from Lolite</h4>'+replies.map(replyMarkup).join('')+'</div>':'')+
   (S.admin&&S.tab==='admin'?'<div class="lfr-admin-tools"><label>Status<select data-lfr-admin-status>'+
    STATUSES.map(status=>'<option value="'+status+'"'+(status===r.status?' selected':'')+'>'+esc(LABELS[status])+'</option>').join('')+
    '</select></label><label>Team note (optional)<textarea data-lfr-admin-note rows="2" maxlength="600" placeholder="What should members know?">'+esc(r.admin_note)+'</textarea></label>'+
    '<button type="button" class="lfr-primary" data-lfr-action="moderate" data-lfr-id="'+esc(r.id)+'" '+(S.busy?'disabled':'')+'>Save status</button></div>'+
    '<div class="lfr-reply-compose"><strong>Reply as admin</strong>'+
    '<label>Message<textarea data-lfr-reply-message rows="3" maxlength="1200" placeholder="Tell users what changed, or explain that the feature is done."></textarea></label>'+
    '<label class="lfr-proof-picker">Screenshot (optional, PNG, JPEG or WebP, max 5 MB)<input data-lfr-proof-file type="file" accept="image/png,image/jpeg,image/webp"><span data-lfr-proof-name>No screenshot selected</span></label>'+
    '<div class="lfr-compose-actions"><button type="button" data-lfr-action="post-reply" data-lfr-kind="update" data-lfr-id="'+esc(r.id)+'" '+(S.busy?'disabled':'')+'>Post reply</button>'+
    '<button type="button" class="lfr-primary" data-lfr-action="post-reply" data-lfr-kind="done" data-lfr-id="'+esc(r.id)+'" '+(S.busy||r.status==='shipped'?'disabled':'')+'>✓ Mark Done + Reply</button></div>'+
    '</div>':'')+
   '</div></article>';
 }
 function listMarkup(){
  const rows=visibleRows();
  return rows.length?rows.map(item).join(''):'<div class="lfr-empty">Nothing here yet. Try another filter, or submit the first idea!</div>';
 }
 function drawList(){const container=root()?.querySelector('#lfrList');if(container)container.innerHTML=listMarkup()}
 function suggest(){
  return '<section class="lfr-suggest"><div class="lfr-panel-heading"><h2>Suggest a feature</h2><p>Tell us what would make Lolite OS better. An admin reviews requests before they appear in the community feed.</p></div>'+
   '<form data-lfr-form="suggest" class="lfr-form"><label>What should we add?<input name="title" required minlength="6" maxlength="120" placeholder="e.g. Desktop folders with drag and drop" autocomplete="off"></label>'+
   '<label>Category<select name="category">'+CATEGORIES.map(s=>'<option>'+esc(s)+'</option>').join('')+'</select></label>'+
   '<label>Describe your idea<textarea name="description" rows="6" minlength="15" maxlength="2000" required placeholder="How would it work? What problem would it solve?"></textarea></label>'+
   '<p class="lfr-note">Please avoid including passwords, contact details or private information. Requests are reviewed before becoming public.</p>'+
   '<button type="submit" class="lfr-primary" '+(S.busy?'disabled':'')+'>Submit for review</button></form></section>';
 }
 function browse(){
  const rows=visibleRows();
  return '<div class="lfr-tools"><label class="lfr-search"><span aria-hidden="true">⌕</span><input data-lfr-search type="search" placeholder="Search requests…" aria-label="Search feature requests" value="'+esc(S.search)+'"></label>'+
   '<label>Category<select data-lfr-category><option value="All">All categories</option>'+
    CATEGORIES.map(s=>'<option value="'+esc(s)+'"'+(S.category===s?' selected':'')+'>'+esc(s)+'</option>').join('')+'</select></label>'+
   '<label>Status<select data-lfr-status><option value="All">All statuses</option>'+
    STATUSES.filter(s=>S.tab!=='browse'||s!=='pending').map(s=>'<option value="'+s+'"'+(S.status===s?' selected':'')+'>'+esc(LABELS[s])+'</option>').join('')+'</select></label>'+
   (S.tab==='admin'?'':'<label>Sort<select data-lfr-sort>'+
     [['top','Most voted'],['new','Newest'],['old','Oldest']].map(([key,s])=>'<option value="'+key+'"'+(S.sort===key?' selected':'')+'>'+s+'</option>').join('')+'</select></label>')+
   '</div><p class="lfr-results">'+rows.length+' request'+(rows.length===1?'':'s')+'</p><section class="lfr-list" id="lfrList">'+listMarkup()+'</section>';
 }
 function render(){
  const node=root();if(!node)return;
  if(S.loading&&!S.loaded){node.innerHTML='<div class="lfr-loading">Loading feature requests…</div>';return}
  if(S.error){node.innerHTML='<div class="lfr-loading"><h2>Feature Requests unavailable</h2><p>'+esc(S.error)+'</p><button type="button" data-lfr-action="reload">Retry</button></div>';return}
  if(!S.user){node.innerHTML='<div class="lfr-login"><h1>Help build Lolite OS</h1><p>Sign in with your Lolite Chat account to suggest features and vote for community ideas.</p><button type="button" class="lfr-primary" data-lfr-action="signin">Open Lolite Chat</button><button type="button" data-lfr-action="reload">I have signed in — refresh</button></div>';return}
  const tabs=[['browse','Community ideas'],['suggest','Suggest'],['mine','My requests']];
  if(S.admin)tabs.push(['admin','Admin review']);
  const published=S.rows.filter(r=>PUBLISHED.has(r.status)).length;
  const pending=S.rows.filter(r=>r.status==='pending').length;
  node.innerHTML='<header class="lfr-header"><div><div class="lfr-kicker">LOLITE OS · COMMUNITY</div>'+
   '<h1>Feature Requests</h1><p>Vote on ideas. Suggest improvements. See what\'s coming next.</p></div>'+
   '<div class="lfr-summary"><strong>'+published+'</strong><span>Visible ideas</span></div></header>'+
   '<nav class="lfr-nav" aria-label="Feature Request sections">'+tabs.map(([key,name])=>
    '<button type="button" class="'+(S.tab===key?'active':'')+'" data-lfr-tab="'+key+'" aria-pressed="'+(S.tab===key)+'">'+name+(key==='admin'&&pending?' <b>'+pending+'</b>':'')+'</button>').join('')+
   '<button type="button" class="lfr-refresh" data-lfr-action="reload" aria-label="Refresh requests">↻ Refresh</button></nav>'+
   '<main class="lfr-main">'+(S.tab==='suggest'?suggest():browse())+
   '<p class="lfr-feedback" data-lfr-notice role="status" aria-live="polite">'+esc(S.notice)+'</p></main>';
 }
 async function submit(form){
  if(S.busy||!S.user)return;
  const title=String(form.elements.title.value||'').trim();
  const description=String(form.elements.description.value||'').trim();
  const category=String(form.elements.category.value||'');
  if(title.length<6||title.length>120||description.length<15||description.length>2000||!CATEGORIES.includes(category)){
   notice('Enter a clear title, category and a description of at least 15 characters.');return;
  }
  if(S.rows.some(r=>r.submitted_by===S.user.id&&r.title.toLowerCase()===title.toLowerCase()&&r.status==='pending')){
   notice('You already have this idea awaiting review.');return;
  }
  S.busy=true;
  const button=form.querySelector('[type="submit"]');if(button)button.disabled=true;
  try{
   ensure(await sb().from('lolite_feature_requests').insert({
    submitted_by:S.user.id,title,description,category,status:'pending'
   }));
   S.tab='mine';S.search='';S.category='All';S.status='All';S.notice='Your idea was submitted for review.';
   await load();
  }catch(e){notice(e?.message||'Could not submit your request')}
  finally{S.busy=false;if(button?.isConnected)button.disabled=false}
 }
 async function vote(id){
  if(S.busy||!S.user)return;
  const r=S.rows.find(r=>r.id===id);
  if(!r||!canVote(r))return;
  S.busy=true;
  try{
   if(S.votes.has(id)){
    ensure(await sb().from('lolite_feature_votes').delete().eq('request_id',id).eq('voter_id',S.user.id));
   }else{
    ensure(await sb().from('lolite_feature_votes').insert({request_id:id,voter_id:S.user.id}));
   }
   await load();
  }catch(e){notice(e?.code==='23505'?'You already voted for this idea.':e?.message||'Could not update your vote')}
  finally{S.busy=false}
 }
 async function postReply(id,kind,button){
  if(S.busy||!S.admin||!S.user||!['update','done'].includes(kind))return;
  const row=S.rows.find(r=>r.id===id);
  if(!row||(kind==='done'&&row.status==='shipped'))return;
  const panel=button.closest('.lfr-item');
  const message=String(panel?.querySelector('[data-lfr-reply-message]')?.value||'').trim();
  const file=panel?.querySelector('[data-lfr-proof-file]')?.files?.[0];
  if(message.length<1||message.length>1200){notice('Write a reply before posting.');return}
  if(file&&(!IMAGE_TYPES[file.type]||file.size<1||file.size>PROOF_LIMIT)){
   notice('Choose a PNG, JPEG or WebP screenshot smaller than 5 MB.');return;
  }
  S.busy=true;button.disabled=true;
  const client=sb();
  let uploadedPath=null,committed=false;
  try{
   if(file){
    const suffix=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);
    uploadedPath=id+'/'+S.user.id+'/'+suffix+'.'+IMAGE_TYPES[file.type];
    const uploaded=await client.storage.from(PROOF_BUCKET).upload(uploadedPath,file,{
     contentType:file.type,upsert:false,cacheControl:'3600'
    });
    if(uploaded.error)throw uploaded.error;
   }
   const rows=await client.from('lolite_feature_replies').insert({
    request_id:id,author_id:S.user.id,kind,message,screenshot_path:uploadedPath
   });
   if(rows.error)throw rows.error;
   committed=true;
   S.notice=kind==='done'?'Marked Done. Voting is now closed, and your reply is visible.':'Admin reply posted.';
   await load();
  }catch(error){
   if(uploadedPath&&!committed){
    try{await client.storage.from(PROOF_BUCKET).remove([uploadedPath])}catch(_){}
   }
   notice(error?.message||'Could not post the admin reply.');
  }finally{S.busy=false;if(button.isConnected)button.disabled=false}
 }
 async function moderate(id,button){
  if(S.busy||!S.admin||!S.user)return;
  const row=S.rows.find(r=>r.id===id);
  const panel=button.closest('.lfr-item');
  const status=panel?.querySelector('[data-lfr-admin-status]')?.value;
  const admin_note=String(panel?.querySelector('[data-lfr-admin-note]')?.value||'').trim();
  if(!row||!STATUSES.includes(status)||admin_note.length>600)return;
  S.busy=true;button.disabled=true;
  try{
   const rows=ensure(await sb().from('lolite_feature_requests')
    .update({status,admin_note,updated_at:new Date().toISOString()}).eq('id',id).select('id'));
   if(!rows.length)throw Error('Request was not updated. Check your admin access.');
   S.notice='Request status saved.';await load();
  }catch(e){notice(e?.message||'Could not update request')}
  finally{S.busy=false;if(button.isConnected)button.disabled=false}
 }
 document.addEventListener('click',event=>{
  const el=event.target.closest?.('#lfrRoot');if(!el)return;
  const tab=event.target.closest('[data-lfr-tab]');
  if(tab){const value=tab.dataset.lfrTab;if(value==='admin'&&!S.admin)return;S.tab=value;S.search='';S.category='All';S.status='All';render();return}
  const button=event.target.closest('[data-lfr-action]');if(!button)return;
  const action=button.dataset.lfrAction,id=safeId(button.dataset.lfrId);
  if(action==='signin'){window.openApp?.('chatroom','Lolite Chat',1050,690);return}
  if(action==='reload'){void load();return}
  if(action==='vote'&&id){void vote(id);return}
  if(action==='moderate'&&id){void moderate(id,button);return}
  if(action==='post-reply'&&id){void postReply(id,button.dataset.lfrKind,button)}
 });
 document.addEventListener('submit',event=>{
  const form=event.target.closest?.('#lfrRoot form[data-lfr-form="suggest"]');
  if(!form)return;event.preventDefault();void submit(form);
 });
 document.addEventListener('input',event=>{
  const field=event.target.closest?.('#lfrRoot [data-lfr-search]');
  if(!field||event.isComposing)return;
  S.search=field.value;drawList();
  const count=root()?.querySelector('.lfr-results');
  if(count){const n=visibleRows().length;count.textContent=n+' request'+(n===1?'':'s')}
 });
 document.addEventListener('change',event=>{
  const screenshot=event.target.closest?.('#lfrRoot [data-lfr-proof-file]');
  if(screenshot){
   const name=screenshot.closest('.lfr-reply-compose')?.querySelector('[data-lfr-proof-name]');
   if(name)name.textContent=screenshot.files?.[0]?.name||'No screenshot selected';
   return;
  }
  const field=event.target.closest?.('#lfrRoot [data-lfr-category],#lfrRoot [data-lfr-status],#lfrRoot [data-lfr-sort]');
  if(!field)return;
  if(field.hasAttribute('data-lfr-category'))S.category=CATEGORIES.includes(field.value)?field.value:'All';
  if(field.hasAttribute('data-lfr-status'))S.status=STATUSES.includes(field.value)?field.value:'All';
  if(field.hasAttribute('data-lfr-sort'))S.sort=['top','new','old'].includes(field.value)?field.value:'top';
  drawList();
  const count=root()?.querySelector('.lfr-results');if(count){const n=visibleRows().length;count.textContent=n+' request'+(n===1?'':'s')}
 });
 document.addEventListener('compositionend',event=>{
  const field=event.target.closest?.('#lfrRoot [data-lfr-search]');
  if(!field)return;S.search=field.value;drawList();
 });
 const oldPage=window.page;
 window.page=function(id){
  if(id==='feature-requests'){setTimeout(()=>{void load()},0);return '<div class="lfr-shell" id="lfrRoot"><div class="lfr-loading">Loading feature requests…</div></div>'}
  return oldPage(id);
 };
 sb()?.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){S.user=null;S.admin=false;S.rows=[];S.votes.clear();S.replies=[];S.screenshots.clear();S.loaded=false}setTimeout(()=>{if(root())void load()},0)});
 window.LoliteFeatureRequests=Object.freeze({open:()=>window.openApp?.('feature-requests','Feature Requests',1060,740),refresh:load});
})();
