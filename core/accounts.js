/* Existing username/password identities are Lolite-wide accounts. */
(()=>{
 'use strict';
 const storage=window.LoliteAccountStorage,device=storage.device;
 const client=window.supabase?.createClient('https://rztxhwfdbrzuhdqpegar.supabase.co','sb_publishable_I3eswNK0zu8qQvDp1Kcfbw_zZzzi18u',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 let user=null,profile=null,ready=false,leaving=false,syncTimer,hydrated=false,saveBusy=false;
 let syncState='idle',lastSync=null;
 function syncText(){
  if(syncState==='syncing')return 'Saving account preferences…';
  if(syncState==='saved')return 'Preferences saved to your account'+(lastSync?' · '+lastSync.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'')+'.';
  if(syncState==='offline')return 'Sync unavailable. Changes stay on this device and will retry when online.';
  return 'Desktop, wallpaper and Studio settings can sync to your Lolite account.';
 }
 function setSyncState(value){
  syncState=value;
  const node=document.querySelector('[data-account-sync-status]');
  if(node)node.textContent=syncText();
 }
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // Explicit small preferences only: never sync tokens, private drafts, imported files or game code.
 const syncKeys=new Set(['wallpaper','wallpaperId','loliteWallpaperQuality','loliteWallpaperCollection','glass','reduce','loliteGameFavoritesV1','loliteGameRecentlyPlayedV1','loliteDesktopTheme','loliteBrowserTheme','loliteDeviceMode','lolitePerformanceMode','loliteWindowLayoutsV4','loliteWidgetsV2','loliteSystemSounds','loliteCursor','loliteDiscordEnabled','lolite.widgets.v1','lolite.performance.lite.v1','loliteSounds','loliteSoundVolume','loliteCursorPack','loliteCursorSize']);
 // Only settings, not messages, documents, files or authentication secrets.
 [
  'loliteWallpaperColorMode','loliteWallpaperColorIntensity','loliteWallpaperPaused',
  'loliteWallpaperInteractive','loliteWallpaperInteractionStrength','loliteMotionMode',
  'loliteWallpaperTransitionMode','lolite5WindowRadius','lolite5PanelOpacity',
  'lolite5TaskbarOpacity','lolite5TaskbarDensity'
 ].forEach(key=>syncKeys.add(key));
 if(storage.id!=='guest')syncKeys.add('lolite.desktop-icons.v1.'+storage.id);
 const snapshot=()=>Object.fromEntries([...syncKeys].map(k=>[k,localStorage.getItem(k)]).filter(([,v])=>v!==null&&v.length<20000));
 function setMessage(message){const el=document.querySelector('[data-account-message]');if(el)el.textContent=message;}
 function gate(mode='login'){
  let d=document.querySelector('#loliteLogin');if(!d){d=document.createElement('dialog');d.id='loliteLogin';document.body.append(d);d.addEventListener('cancel',e=>e.preventDefault());}
  d.innerHTML='<div class="la-lock"><div class="la-time">'+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+'</div><div class="la-date">'+new Date().toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'})+'</div><form data-account-form="'+mode+'"><div class="la-avatar">L</div><h1>'+ (mode==='register'?'Create your Lolite account':'Welcome to Lolite')+'</h1><p>One account. Your desktop, games and friends.</p><label>Username<input name="username" autocomplete="username" pattern="[A-Za-z0-9_]{3,24}" minlength="3" maxlength="24" required></label>'+(mode==='register'?'<label>Display name<input name="display" maxlength="32" required></label>':'')+'<label>Password<input name="password" type="password" autocomplete="'+(mode==='register'?'new-password':'current-password')+'" minlength="8" maxlength="128" required></label><label class="la-check"><input name="auto" type="checkbox" '+(device.get('auto')==='true'?'checked':'')+'> Automatically log in on this device</label><p data-account-message role="status"></p><button class="la-primary" type="submit">'+(mode==='register'?'Create account':'Sign in')+'</button><button type="button" data-account-mode="'+(mode==='register'?'login':'register')+'">'+(mode==='register'?'Already have an account? Sign in':'Create an account')+'</button><button type="button" data-account-guest>Continue as guest</button><small>Your existing Lolite Chat username and password work here.</small></form></div>';
  if(!d.open)d.showModal();document.documentElement.classList.add('lolite-account-locked');
  document.querySelector('#desktop')?.setAttribute('inert','');
 }
 function unlock(){ready=true;document.querySelector('#loliteLogin')?.close();document.querySelector('#loliteLogin')?.remove();document.documentElement.classList.remove('lolite-account-locked');document.querySelector('#desktop')?.removeAttribute('inert');window.dispatchEvent(new CustomEvent('lolite:account-ready',{detail:{user,profile}}));}
 async function save(){
  if(!ready||!user||!hydrated||saveBusy)return false;
  saveBusy=true;setSyncState('syncing');const data=snapshot();
  try{
   const r=await client.from('lolite_account_data').upsert({user_id:user.id,data,updated_at:new Date().toISOString()});
   if(r.error)throw r.error;
   lastSync=new Date();setSyncState('saved');
   if(JSON.stringify(snapshot())===JSON.stringify(data))device.remove('dirty:'+user.id);
   else{clearTimeout(syncTimer);syncTimer=setTimeout(save,1000);}
   return true;
  }catch{
   device.set('dirty:'+user.id,'true');setSyncState('offline');return false;
  }finally{saveBusy=false;}
 }
 async function enter(session){
  if(!session?.user)throw Error('Sign in to continue.');
  const id=session.user.id;
  if(storage.id!==id){device.set('account',id);sessionStorage.setItem('lolite-login-handoff',id);location.reload();return;}
  user=session.user;
  const result=await client.from('profiles').select('*').eq('id',id).single();if(result.error)throw result.error;profile=result.data;
  if(sessionStorage.getItem('lolite-data-hydrated')!==id){
   const r=await client.from('lolite_account_data').select('data').eq('user_id',id).maybeSingle();
   if(!r.error&&r.data?.data&&device.get('dirty:'+id)!=='true'){
    let change=false;for(const [key,value] of Object.entries(r.data.data)){if(syncKeys.has(key)&&typeof value==='string'&&value.length<20000&&localStorage.getItem(key)!==value){localStorage.setItem(key,value);change=true;}}
    sessionStorage.setItem('lolite-data-hydrated',id);
    if(change){sessionStorage.setItem('lolite-login-handoff',id);location.reload();return;}
   }
  }
  hydrated=true;unlock();void save();
 }
 async function login(username,password,auto){
  if(!client)throw Error('Sign-in could not load. Check your internet connection and reload.');
  device.set('auto',!!auto);
  const r=await client.auth.signInWithPassword({email:username.trim().toLowerCase()+'@accounts.lolite.chat',password});
  if(r.error)throw r.error;await enter(r.data.session);
 }
 async function signOut(guest=false){
  if(leaving)return;leaving=true;
  await window.LoliteActivity?.stop?.();await save();
  // Local sign-out keeps other devices signed in, while this desktop closes completely.
  await client?.auth.signOut({scope:'local'});
  await window.LoliteBrowserAccounts?.syncCurrentSession?.(null);
  device.set('account','guest');device.set('auto',false);sessionStorage.removeItem('lolite-data-hydrated');
  if(guest)sessionStorage.setItem('lolite-guest-handoff','1');
  location.reload();
 }
 function settings(){return '<div class="la-settings"><h2>'+esc(profile?.display_name||profile?.username||'Guest desktop')+'</h2><p>'+esc(profile?'@'+profile.username:'Sign in to save your desktop to a Lolite account.')+'</p><div class="la-settings-actions">'+(user?'<button data-lolite-profile="'+esc(user.id)+'">View gaming profile</button><button data-account-edit-profile>Edit profile</button><button data-account-signout>Sign out / switch account</button>':'<button data-account-signin>Sign in</button>')+'</div><label><input type="checkbox" data-account-auto '+(device.get('auto')==='true'?'checked':'')+' '+(!user?'disabled':'')+'> Automatically log in on this device</label><p class="la-muted">Desktop preferences, favourites and playtime belong to your account. Uploaded files stay on this device, separately for each account.</p>'+(user?'<div class="la-sync-row"><p data-account-sync-status role="status" aria-live="polite">'+esc(syncText())+'</p><button type="button" data-account-sync-now>Sync now</button></div>':'')+(user?'<label><input type="checkbox" data-account-privacy="show_activity" '+(profile.show_activity?'checked':'')+'> Show my activity to Lolite players</label><label><input type="checkbox" data-account-privacy="show_games" '+(profile.show_games?'checked':'')+'> Show my games and playtime on my profile</label>':'')+'<h2>Discord Rich Presence</h2><label><input type="checkbox" data-account-discord '+(localStorage.loliteDiscordEnabled!=='false'?'checked':'')+'> Show what I’m doing on Discord</label><p data-discord-status>'+ (window.loliteDesktop?.presence?'Checking Discord…':'Use the installed Lolite app with desktop Discord open.')+'</p>'+(window.loliteDesktop?.presence?'<details><summary>Discord application setup</summary><p>The Lolite owner can enter the Discord application ID here until a shared ID is included in a release.</p><form data-discord-config><label>Application ID<input name="clientId" inputmode="numeric" pattern="[0-9]{17,20}" required></label><button>Save application ID</button></form></details>':'')+'</div>';}
 document.addEventListener('submit',async e=>{
  const form=e.target.closest('[data-account-form]');if(!form)return;e.preventDefault();const button=form.querySelector('[type="submit"]');button.disabled=true;setMessage('Signing in…');
  try{
   const username=form.elements.username.value,password=form.elements.password.value;
   if(form.dataset.accountForm==='register'){if(!client)throw Error('Account service unavailable. Reload and retry.');const r=await client.functions.invoke('lolite-account',{body:{action:'register',username,display_name:form.elements.display.value,password}});if(r.error||r.data?.error)throw Error(r.data?.error||r.error.message);}
   await login(username,password,form.elements.auto.checked);
  }catch(error){setMessage(error.message||'Could not sign in. Please retry.');}finally{button.disabled=false;}
 });
 document.addEventListener('click',e=>{if(e.target.closest('[data-account-mode]'))gate(e.target.closest('[data-account-mode]').dataset.accountMode);if(e.target.closest('[data-account-guest]'))void signOut(true);if(e.target.closest('[data-account-signout]'))void signOut();if(e.target.closest('[data-account-signin]'))gate();if(e.target.closest('[data-account-sync-now]'))void save();if(e.target.closest('[data-account-edit-profile]')){e.target.closest('dialog')?.close();void window.LoliteChat?.editProfile?.();}});
 document.addEventListener('change',async e=>{
  if(e.target.matches('[data-account-auto]'))device.set('auto',e.target.checked);
  if(e.target.matches('[data-account-discord]')){localStorage.loliteDiscordEnabled=String(e.target.checked);window.LoliteActivity?.update();}
  if(e.target.matches('[data-account-privacy]')&&user){const key=e.target.dataset.accountPrivacy;if(!['show_activity','show_games'].includes(key))return;const r=await client.from('profiles').update({[key]:e.target.checked}).eq('id',user.id);if(r.error){e.target.checked=!e.target.checked;window.toast?.(r.error.message);}else{profile[key]=e.target.checked;window.LoliteActivity?.update();}}
 });
 window.addEventListener('lolite:account-data',e=>{if(user&&syncKeys.has(e.detail.key)){device.set('dirty:'+user.id,'true');clearTimeout(syncTimer);syncTimer=setTimeout(save,2000);}});
 window.addEventListener('storage',e=>{if(e.key==='lolite-device:account'&&e.newValue!==storage.id){document.documentElement.classList.add('lolite-account-locked');location.reload();}});
 window.addEventListener('online',()=>{if(user&&hydrated&&device.get('dirty:'+user.id)==='true')void save()});
 window.LoliteAccounts=Object.freeze({getClient:()=>client,getUser:()=>user,getProfile:()=>profile,isReady:()=>ready,signIn:login,signOut,showLogin:gate,settingsMarkup:settings,save,syncStatus:()=>({state:syncState,lastSync}),refreshProfile:value=>{if(value?.id===user?.id)profile={...profile,...value};}});
 client?.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'&&ready&&user&&!leaving){leaving=true;device.set('account','guest');location.reload();}if(event==='SIGNED_IN'&&ready&&session?.user.id!==user?.id)setTimeout(()=>enter(session).catch(()=>gate()),0);});
 async function boot(){
  gate();
  if(sessionStorage.getItem('lolite-guest-handoff')==='1'&&storage.id==='guest'){sessionStorage.removeItem('lolite-guest-handoff');unlock();return;}
  const handoff=sessionStorage.getItem('lolite-login-handoff');sessionStorage.removeItem('lolite-login-handoff');
  if((device.get('auto')==='true'||handoff===storage.id)&&client){try{const r=await client.auth.getUser();if(r.error)throw r.error;const s=await client.auth.getSession();if(r.data.user&&s.data.session){await enter(s.data.session);return;}}catch{setMessage('Could not restore your login. Sign in again, or continue as guest.');}}
  // No automatic login means credentials are required on each desktop start.
  if(client)await client.auth.signOut({scope:'local'});
 }
 const startObserver=new MutationObserver(()=>{const start=document.querySelector('#start');if(!start?.children.length||start.querySelector('.la-start-account'))return;const row=document.createElement('div');row.className='la-start-account';row.innerHTML='<button type="button" '+(user?'data-account-signout':'data-account-signin')+'>'+esc(user?'Switch account · '+(profile?.display_name||profile?.username):'Sign in to Lolite')+'</button>';start.append(row);});
 startObserver.observe(document.body,{subtree:true,childList:true});
 void boot();
})();
