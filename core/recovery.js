/* Lolite OS startup recovery: keep the desktop usable if a primary script fails. */
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
    box.innerHTML='<strong style="font-size:15px">Lolite startup needs recovery</strong><p style="margin:7px 0;color:#ffd5dd">'+esc(message)+'</p><small style="color:#e7b9c2">'+esc(source?source.split('/').pop():'')+(line?':'+line:'')+'</small><div style="display:flex;gap:8px;margin-top:12px"><button id="loliteRecoveryReload" style="padding:8px 12px;border-radius:7px;background:#8054df;color:#fff">Reload Lolite</button><button id="loliteRecoveryDismiss" style="padding:8px 12px;border-radius:7px;background:#3c2930;color:#fff">Dismiss</button></div>';
    (document.body||document.documentElement).appendChild(box);
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
  const apps=[['app-home','Home','home'],['app-games','Game Store','games'],['app-files','Files','files'],['app-browser','Ultraviolet Browser','browser'],['app-settings','Settings','settings'],['app-store','App Store','appstore']];
  function renderFallbackIcons(){
    const icons=document.getElementById('icons');
    if(!icons||typeof window.renderIcons==='function'||icons.querySelector('.desktop-icon[data-recovery-app]'))return;
    icons.innerHTML=apps.map(([cls,label,id])=>'<button class="desktop-icon" data-recovery-app="'+id+'" type="button"><b class="app-symbol '+cls+'" aria-hidden="true"></b><span>'+label+'</span></button>').join('');
    icons.querySelectorAll('[data-recovery-app]').forEach(button=>button.addEventListener('click',()=>window.openApp(button.dataset.recoveryApp,button.querySelector('span')?.textContent||'App')));
  }
  window.loliteOpenAccelerationGuide=window.loliteOpenAccelerationGuide||function(){
    const body='<div style="padding:18px;overflow:auto;height:100%;color:#eef1f5;background:#11151e"><h2 style="margin-top:0">Hardware Acceleration Guide</h2><p>Hardware acceleration lets your browser use your graphics hardware for smoother animations and web games.</p><h3>Chrome, Brave or Opera GX</h3><ol><li>Open browser Settings.</li><li>Search for “hardware acceleration”.</li><li>Turn on “Use graphics acceleration when available”.</li><li>Restart the browser.</li></ol><h3>Firefox</h3><ol><li>Open Settings → General → Performance.</li><li>Enable recommended performance settings, or enable hardware acceleration if available.</li><li>Restart Firefox.</li></ol><p><b>Tip:</b> Options vary by browser and device. If the screen flickers, turn the setting off again.</p></div>';
    if(typeof window.openApp==='function'){window.openApp('hardware-guide','Hardware Acceleration Guide');const w=document.querySelector('#windows .window[data-window-id="hardware-guide"] .content');if(w)w.innerHTML=body;else {const win=[...document.querySelectorAll('#windows .window')].find(x=>x.querySelector('.titlebar strong')?.textContent==='Hardware Acceleration Guide');if(win)win.querySelector('.content').innerHTML=body;}return;}
    const host=document.getElementById('windows');if(!host)return;
    let win=document.getElementById('lolite-guide-fallback');if(!win){win=document.createElement('section');win.id='lolite-guide-fallback';win.className='window';win.style.cssText='position:absolute;left:12%;top:10%;width:min(720px,76vw);height:min(520px,75vh);z-index:1000;background:#151820;border:1px solid #414857;border-radius:10px;box-shadow:0 16px 50px #0009;overflow:auto';win.innerHTML='<header class="titlebar" style="padding:12px;font-weight:bold">Hardware Acceleration Guide <button style="float:right" onclick="document.getElementById(\'lolite-guide-fallback\').remove()">Close</button></header><div class="content" style="height:calc(100% - 45px)">'+body+'</div>';host.appendChild(win);}
  };
  function recover(){
    const desktop=document.getElementById('desktop');
    if(desktop){desktop.classList.remove('hidden');desktop.style.display='block';desktop.style.visibility='visible';desktop.style.opacity='1';}
    renderFallbackIcons();
    if(typeof window.renderIcons==='function'){try{window.renderIcons()}catch(error){report('Desktop icons failed: '+error.message)}}
    if(typeof window.openApp==='function'&&!document.querySelector('#windows .window')){try{window.openApp('home','Home',760,600)}catch(error){report('Home could not open: '+error.message)}}
    const guide=document.getElementById('hardware-acceleration-shortcut');
    if(guide&&!guide.dataset.recoveryBound){guide.dataset.recoveryBound='1';guide.addEventListener('click',()=>window.loliteOpenAccelerationGuide());}
    document.querySelectorAll('#icons .desktop-icon').forEach(button=>{
      if(button.dataset.recoveryBound)return;
      button.dataset.recoveryBound='1';
      button.addEventListener('click',()=>{
        if(button.id==='hardware-acceleration-shortcut'){window.loliteOpenAccelerationGuide();return;}
        const label=button.querySelector('span')?.textContent||'Home';
        const id=button.dataset.recoveryApp||(label==='Game Store'?'games':label==='Files'?'files':label==='Ultraviolet Browser'?'browser':label==='Settings'?'settings':label==='App Store'?'appstore':'home');
        if(typeof window.openApp==='function')window.openApp(id,label,900,650);
        else window.loliteOpenAccelerationGuide();
      });
    });
    if(typeof window.page!=='function')report('The main app script did not start. Recovery mode is showing the desktop and hardware guide.');
  }
  const run=()=>window.setTimeout(recover,900);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();