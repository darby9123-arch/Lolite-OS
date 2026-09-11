/* Hooks the persistent filesystem into the existing desktop shell without bloating app.js. */
(()=>{
  const originalPage=window.page;
  window.page=function(id){
    if(id==='files')return FileOS.filesPage();
    return originalPage(id);
  };
  const originalLaunch=window.launchGame;
  window.launchGame=async function(name){
    const installs=JSON.parse(localStorage.loliteGames||'[]');
    const installed=installs.find(x=>x.title===name||x.path.split('/').filter(Boolean).pop()===name);
    if(installed){
      const id='installed-'+installed.path.replace(/[^a-z0-9]+/gi,'-');
      openApp(id,name,760,620);
      const w=state.windows[id]?.el.querySelector('.content');
      if(w){
        const rows=await FileOS.all();
        const root=installed.path;
        const html=rows.find(x=>x.path===root+'index.html'||x.path===root+'/index.html');
        if(html?.data){
          const text=await html.data.text();
          const blob=new Blob([text],{type:'text/html'});
          w.innerHTML=`<iframe title="${name}" src="${URL.createObjectURL(blob)}" style="width:100%;height:100%;min-height:520px;border:0;border-radius:12px;background:#0b0716"></iframe>`;
        }
      }
      return;
    }
    return originalLaunch(name);
  };
})();
