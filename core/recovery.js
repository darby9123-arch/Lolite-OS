/* Lolite OS recovery: verify the actual desktop rendered, not merely that functions exist. */
(()=> {
 const $=s=>document.querySelector(s);
 function showGuide(){
  let panel=$('#lolite-recovery-guide');
  if(panel){panel.remove();return;}
  panel=document.createElement('section');panel.id='lolite-recovery-guide';
  panel.style.cssText='position:fixed;z-index:2147483647;left:8%;top:8%;width:min(760px,84vw);max-height:80vh;overflow:auto;padding:22px;background:#151820;color:#eef1f5;border:1px solid #626b7a;border-radius:12px;box-shadow:0 20px 60px #000';
  panel.innerHTML='<button type="button" id="lolite-guide-close" style="float:right;padding:8px;background:#343b49;color:white;border-radius:6px">Close</button><h2>Hardware Acceleration Guide</h2><p><b>Firefox:</b> Open Settings → General → Performance. Try the recommended performance settings and restart Firefox.</p><p><b>Chrome, Brave or Opera GX:</b> Open Settings and search for “hardware acceleration” or “graphics acceleration”. Enable the available option and restart the browser.</p><p>If the browser keeps slowing down, try turning hardware acceleration off and restarting.</p>';
  document.body.appendChild(panel);$('#lolite-guide-close').onclick=()=>panel.remove();
 }
 window.loliteOpenAccelerationGuide=showGuide;
 function fallback(){
  const icons=$('#icons');if(!icons)return;
  const rendered=icons.querySelectorAll('.desktop-icon').length;
  if(rendered>=6)return;
  icons.innerHTML='';
  icons.style.cssText+=';display:grid;grid-template-columns:repeat(auto-fill,90px);gap:14px;padding:20px;position:relative;z-index:5';
  const apps=[['Home','home'],['Game Store','games'],['Files','files'],['Ultraviolet Browser','browser'],['Settings','settings'],['App Store','appstore'],['Hardware Acceleration Guide','guide']];
  for(const [label,id] of apps){
   const b=document.createElement('button');b.type='button';b.className='desktop-icon';
   b.style.cssText='width:86px;min-height:76px;padding:8px;background:#1b202a;color:#fff;border:1px solid #444b5a;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px';
   b.innerHTML='<span style="font-size:24px">'+({'home':'⌂','games':'▣','files':'▤','browser':'◎','settings':'⚙','appstore':'＋','guide':'⚡'}[id])+'</span><span>'+label+'</span>';
   b.addEventListener('click',()=>{try{if(id==='guide'||typeof window.openApp!=='function'){showGuide();return;}window.openApp(id,label,900,650);if(!$('#windows .window'))showGuide();}catch(e){showGuide();}});
   icons.appendChild(b);
  }
 }
 function ensureVisible(){const d=$('#desktop');if(d){d.classList.remove('hidden');d.style.display='block';d.style.visibility='visible';d.style.opacity='1';}fallback();}
 window.addEventListener('error',e=>{if(e.message)console.error('[Lolite startup]',e.message,e.filename,e.lineno);});
 window.addEventListener('unhandledrejection',e=>console.error('[Lolite async error]',e.reason));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ensureVisible,1200),{once:true});else setTimeout(ensureVisible,1200);
})();
