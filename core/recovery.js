/* Lolite OS recovery guard: report runtime failures and restore a usable desktop. */
(()=> {
  const esc=value=>String(value??'Unknown error').replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  let shown=false;
  function report(message,source,line){
    console.error('[Lolite recovery]',message,source||'',line||'');
    if(shown)return;
    shown=true;
    const box=document.createElement('section');
    box.id='lolite-recovery-error';
    box.style.cssText='position:fixed;z-index:2147483647;left:12px;right:12px;bottom:12px;max-height:45vh;overflow:auto;padding:16px;background:#21151b;color:#fff;border:1px solid #a94d62;border-radius:12px;box-shadow:0 12px 40px #0009;font:13px/1.5 system-ui,sans-serif';
    box.innerHTML='<strong style="font-size:15px">Lolite hit a JavaScript error</strong><p style="margin:7px 0;color:#ffd5dd">'+esc(message)+'</p><small style="color:#e7b9c2">'+esc(source?source.split('/').pop():'')+(line?':'+line:'')+'</small><div style="display:flex;gap:8px;margin-top:12px"><button id="loliteRecoveryReload" style="padding:8px 12px;border-radius:7px;background:#8054df;color:#fff">Reload Lolite</button><button id="loliteRecoveryDismiss" style="padding:8px 12px;border-radius:7px;background:#3c2930;color:#fff">Dismiss</button></div>';
    document.body.appendChild(box);
    box.querySelector('#loliteRecoveryReload').onclick=()=>location.reload();
    box.querySelector('#loliteRecoveryDismiss').onclick=()=>box.remove();
  }
  window.addEventListener('error',event=>{
    if(event.target&&event.target!==window){
      const target=event.target;
      if(target.tagName==='SCRIPT')report('A script failed to load: '+(target.src||'unknown script'));
      return;
    }
    report(event.message||'A script failed',event.filename,event.lineno);
  },true);
  window.addEventListener('unhandledrejection',event=>report(event.reason?.stack||event.reason?.message||event.reason||'An async operation failed'));
  function recover(){
    const desktop=document.getElementById('desktop');
    if(desktop){desktop.classList.remove('hidden');desktop.style.display='block';desktop.style.visibility='visible'}
    if(typeof window.renderIcons==='function'){try{window.renderIcons()}catch(error){report('Desktop icons failed: '+error.message)}}
    if(!document.querySelector('#windows .window')&&typeof window.openApp==='function'){
      try{window.openApp('home','Home',760,600)}catch(error){report('Home could not open: '+error.message)}
    }
    document.querySelectorAll('#icons .desktop-icon').forEach(button=>{
      if(button.dataset.recoveryBound)return;
      button.dataset.recoveryBound='1';
      button.addEventListener('click',()=>{
        const label=button.querySelector('span')?.textContent||'Home';
        const id=label==='Game Store'?'games':label==='Files'?'files':label==='Ultraviolet Browser'?'browser':label==='Settings'?'settings':label==='App Store'?'appstore':'home';
        if(typeof window.openApp==='function')window.openApp(id,label,900,650);
      });
    });
  }
  const run=()=>setTimeout(recover,900);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();