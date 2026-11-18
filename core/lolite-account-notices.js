/* One-time account notices. User-controlled new-tab action only: no unsolicited windows. */
(()=>{'use strict';
 const client=()=>window.LoliteAccounts?.getClient?.()||window.LoliteBrowserAccounts?.getClient?.();
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 let busy=false,current=null,notice=null,lastCheck=0;
 const enabled=()=>window.LoliteAccounts?.isReady?.()===true&&!document.hidden&&
  !document.fullscreenElement&&!document.querySelector('#loliteClipCaptureStatus:not([hidden])');
 const user=()=>window.LoliteAccounts?.getUser?.();
 function remove(){notice?.remove();notice=null;current=null}
 async function acknowledge(id){
  const sb=client(),u=user();
  if(!sb||!u||!id)return;
  const result=await sb.from('lolite_account_notices').update({seen_at:new Date().toISOString()})
   .eq('id',id).eq('target_user_id',u.id);
  if(result.error)console.warn('Lolite notice acknowledgement:',result.error.message);
 }
 function dismiss(){
  const id=current?.id;remove();if(id)void acknowledge(id);
 }
 function render(row){
  if(notice||!enabled())return;
  current=row;
  notice=document.createElement('section');
  notice.id='loliteAdminNotice';
  notice.className='lolite-admin-notice';
  notice.setAttribute('role','dialog');
  notice.setAttribute('aria-label','Lolite admin notice');
  notice.innerHTML='<div class="lan-icon" aria-hidden="true">L</div>'+
   '<div class="lan-copy"><small>MESSAGE FROM LOLITE ADMINISTRATION</small>'+
   '<h2>Notice from Lolite</h2><p>'+esc(row.message)+'</p>'+
   '<div class="lan-actions"><button type="button" data-lan-dismiss>Got it</button>'+
   '<button type="button" data-lan-open>Open Lolite in a new tab</button></div></div>';
  document.body.appendChild(notice);
 }
 async function check(){
  if(busy||notice||!enabled()||Date.now()-lastCheck<12000)return;
  const u=user(),sb=client();if(!u||!sb)return;
  busy=true;lastCheck=Date.now();
  try{
   const r=await sb.from('lolite_account_notices')
    .select('id,message,created_at').eq('target_user_id',u.id)
    .is('seen_at',null).order('created_at',{ascending:true}).limit(1);
   if(r.error)throw r.error;
   if(r.data?.length)render(r.data[0]);
  }catch(error){console.warn('Lolite notices:',error?.message||error)}
  finally{busy=false}
 }
 document.addEventListener('click',event=>{
  const clicked=event.target.closest?.('[data-lan-dismiss],[data-lan-open]');
  if(!clicked||!clicked.closest('#loliteAdminNotice'))return;
  if(clicked.matches('[data-lan-open]')){
   // A new tab is opened only after the recipient explicitly clicks.
   const url=new URL('./',document.baseURI).href;
   window.open(url,'_blank','noopener,noreferrer');
  }
  dismiss();
 });
 window.addEventListener('lolite:account-ready',()=>void check());
 window.addEventListener('lolite:account-restricted',remove);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void check()});
 window.addEventListener('focus',()=>void check());
 // Infrequent, nonblocking check. Never open a tab or interrupt fullscreen games.
 setInterval(()=>{if(enabled())void check()},60000);
 window.LoliteAccountNotices=Object.freeze({check});
})();
