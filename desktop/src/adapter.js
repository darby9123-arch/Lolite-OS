/* Runs only in the bundled desktop app. The website is not modified. */
(()=>{
  'use strict';const native=window.loliteDesktop;if(!native)return;
  const notice=message=>window.toast?.(message);
  const run=async fn=>{try{return await fn();}catch(e){notice(e.message);}};
  document.addEventListener('DOMContentLoaded',()=>{
    const fs=window.FileOS;
    if(fs){
      fs.downloadBlob=async(blob,name)=>run(async()=>{const bytes=new Uint8Array(await blob.arrayBuffer());if(await native.saveFile({name,bytes}))notice('Saved to your computer.');});
      fs.chooseUpload=()=>run(async()=>{const items=await native.openFiles();await fs.handleUpload(items.map(f=>new File([f.bytes],f.name,{lastModified:f.modified})));});
    }
    const bar=document.createElement('div');bar.className='native-tools';bar.setAttribute('aria-label','Windows desktop controls');
    for(const [label,fn] of [['Lolite Launcher',()=>native.launcher()],['Open from PC',async()=>{window.openApp?.('files','File Explorer');await fs.chooseUpload();}],['Browse PC folder',browseFolder]]){
      const b=document.createElement('button');b.textContent=label;b.onclick=()=>run(fn);bar.append(b);
    }
    document.querySelector('.tray')?.prepend(bar);
    const offline=document.createElement('div');offline.id='desktop-offline';offline.textContent='Offline · Local apps and saved files are available. Online games, chat and downloads need a connection.';document.body.append(offline);
    const online=()=>{offline.hidden=navigator.onLine;};online();window.addEventListener('online',online);window.addEventListener('offline',online);
    document.getElementById('fullscreenBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();run(()=>native.fullscreen());},true);
    let attempts=0;const ready=setInterval(()=>{if(document.querySelector('#icons .desktop-icon') || document.querySelector('#windows .window')){clearInterval(ready);native.ready();}else if(++attempts>100)clearInterval(ready);},200);
    new MutationObserver(()=>{document.querySelectorAll('.fe-sidebar p').forEach(p=>{if(p.textContent==='Files saved in this browser')p.textContent='Files saved on this PC in Lolite data';});}).observe(document.body,{childList:true,subtree:true});
    // Frames use an opaque origin, including user-imported HTML. They cannot reach this bridge.
    const frameNotice=new MutationObserver(()=>{
      document.querySelectorAll('iframe:not([data-desktop-frame])').forEach(frame=>{
        frame.dataset.desktopFrame='true';
        frame.setAttribute('sandbox','allow-scripts allow-forms allow-pointer-lock allow-downloads allow-modals');
        const src=frame.getAttribute('src')||'';
        try{
          const target=new URL(src,location.href);
          if(target.protocol==='lolite:'&&/^\/(games|html%20games)\//i.test(target.pathname)){
            target.hostname='content';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads allow-modals');frame.src=target.href;
          }else if(target.protocol==='https:'){
            frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads allow-modals');frame.src=target.href;
          }
        }catch{}
        if(!navigator.onLine && /^https?:/.test(src)){const p=document.createElement('p');p.className='native-online-note';p.textContent='This app needs an internet connection. Reconnect, then reopen it.';frame.before(p);}
      });
    });frameNotice.observe(document.body,{childList:true,subtree:true});
  },{once:true});
  async function browseFolder(){
    const grant=await native.chooseFolder();if(!grant)return;
    const dialog=document.createElement('dialog');dialog.className='native-folder';
    const heading=document.createElement('h2'),info=document.createElement('p'),list=document.createElement('div'),close=document.createElement('button');
    info.textContent='Choose a file to copy into Lolite. Your original files stay in this folder.';close.textContent='Close';close.onclick=()=>dialog.close();dialog.append(heading,info,list,close);document.body.append(dialog);dialog.onclose=()=>dialog.remove();dialog.showModal();
    async function draw(relative=''){
      heading.textContent=grant.name+(relative?' / '+relative:'');list.replaceChildren();
      if(relative){const up=document.createElement('button');up.textContent='↑ Parent folder';up.onclick=()=>run(()=>draw(relative.split('/').slice(0,-1).join('/')));list.append(up);}
      for(const entry of await native.listFolder({token:grant.token,relative})){
        const button=document.createElement('button');button.textContent=(entry.directory?'Folder · ':'Import · ')+entry.name;
        button.onclick=()=>run(async()=>{if(entry.directory)return draw(entry.relative);const f=await native.readFile({token:grant.token,relative:entry.relative});await window.FileOS.handleUpload([new File([f.bytes],f.name,{lastModified:f.modified})]);notice('Imported '+f.name);});list.append(button);
      }
    }await draw();
  }
})();
