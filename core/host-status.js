/* Lolite OS 4.0 — honest hosting status and source-commit comparison.
   Reports "unverified" for network/CORS failures, never invents uptime. */
(()=>{'use strict';
 const hosts=Object.freeze([
  {id:'pages',name:'GitHub Pages',url:'https://darby9123-arch.github.io/Lolite-OS/',status:'https://darby9123-arch.github.io/Lolite-OS/core/lolite-build.json'},
  {id:'vercel',name:'Vercel',url:'https://lolite-os.vercel.app/',status:'https://lolite-os.vercel.app/healthz'},
  {id:'vercel-play',name:'Vercel Play',url:'https://lolite-play.vercel.app/',status:'https://lolite-play.vercel.app/healthz'},
  {id:'railway',name:'Railway',url:'https://lolite-os-public-production.up.railway.app/',status:'https://lolite-os-public-production.up.railway.app/healthz'},
  {id:'railway-mirror',name:'Railway Mirror',url:'https://lolite-os-mirror-production.up.railway.app/',status:'https://lolite-os-mirror-production.up.railway.app/healthz'}
 ]);
 const head='https://api.github.com/repos/darby9123-arch/Lolite-OS/commits/main';
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let panel=null,running=null,entries=[],latest=null,lastAt=0;
 const withTimeout=async(url,ms=7000)=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),ms);
  try{
   const response=await fetch(url,{cache:'no-store',mode:'cors',signal:controller.signal,credentials:'omit'});
   if(!response.ok)throw Error('HTTP '+response.status);
   return await response.json();
  }finally{clearTimeout(timer)}
 };
 const normalized=value=>typeof value==='string'&&/^[a-f0-9]{40}$/i.test(value)?value.toLowerCase():null;
 const describe=(entry,sha)=>{
  if(entry.error)return {...entry,status:'unverified',label:'Could not verify',detail:'The host may block cross-origin status requests. Open it to check.'};
  const commit=normalized(entry?.data?.commit);
  if(entry.data?.ok!==true)return {...entry,status:'unverified',label:'Unverified',detail:'No trustworthy version data returned.'};
  if(!commit)return {...entry,status:'online',label:'Online · commit unknown',detail:'This host does not yet report its deployed source commit.'};
  if(!sha)return {...entry,status:'online',label:'Online · '+commit.slice(0,8),detail:'GitHub reference temporarily unavailable.'};
  return {...entry,status:commit===sha?'current':'outdated',
    label:commit===sha?'Current · '+commit.slice(0,8):'Behind · '+commit.slice(0,8),
    detail:commit===sha?'Matches the latest GitHub main commit.':'Different from GitHub main ('+sha.slice(0,8)+'). Redeploy this provider.'};
 };
 function paint(){
  if(!panel)return;
  const list=panel.querySelector('[data-host-list]');
  if(!list)return;
  if(!entries.length){list.innerHTML='<p class="lolite-host-empty">Checking exact deployed builds…</p>';return}
  list.innerHTML=entries.map(entry=>{
   const info=describe(entry,latest);
   return '<div class="lolite-host-row"><div><strong>'+escape(info.name)+'</strong>'+
    '<span class="lolite-host-label is-'+info.status+'">'+escape(info.label)+'</span>'+
    '<small>'+escape(info.detail)+'</small></div>'+
    '<a href="'+escape(info.url)+'" target="_blank" rel="noopener noreferrer">Open ↗</a></div>';
  }).join('');
  const stamp=panel.querySelector('[data-host-reference]');
  if(stamp)stamp.textContent=latest?'Latest GitHub main: '+latest.slice(0,8):
   'Latest commit could not be verified. Results may be incomplete.';
 }
 async function check(force=false){
  if(running)return running;
  if(!force&&Date.now()-lastAt<45000&&entries.length)return entries.map(x=>describe(x,latest));
  entries=[];paint();
  running=(async()=>{
   const [current,...statuses]=await Promise.all([
    withTimeout(head).catch(()=>null),
    ...hosts.map(h=>withTimeout(h.status).catch(error=>({_error:String(error)})))
   ]);
   latest=normalized(current?.sha);
   entries=hosts.map((h,i)=>({...h,data:statuses[i],error:!!statuses[i]?._error}));
   lastAt=Date.now();paint();running=null;return entries.map(x=>describe(x,latest));
  })().catch(err=>{running=null;console.warn('Host status unavailable',err);return []});
  return running;
 }
 function close(){panel?.remove();panel=null}
 function openPanel(){
  if(panel){close();return}
  panel=document.createElement('section');panel.id='loliteHostStatus';panel.className='lolite-host-panel';
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Lolite hosting and version status');
  panel.innerHTML='<div class="lolite-host-backdrop" data-host-close></div>'+
   '<div class="lolite-host-dialog"><header><div><span class="lolite-host-kicker">LOLITE OS 4.0</span>'+
   '<h2>Hosting Status</h2><p>Live checks across every Lolite web host. No guessed uptime.</p></div>'+
   '<button data-host-close type="button" aria-label="Close hosting status">×</button></header>'+
   '<div class="lolite-host-list" data-host-list></div><footer><small data-host-reference>Checking latest GitHub commit…</small>'+
   '<button data-host-refresh type="button">Check again</button></footer></div>';
  document.body.appendChild(panel);
  panel.addEventListener('click',e=>{
   if(e.target.closest('[data-host-close]'))close();
   if(e.target.closest('[data-host-refresh]'))void check(true);
  });
  paint();void check();
 }
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel)close()});
 window.LoliteHostStatus=Object.freeze({openPanel,close,check,getResults:()=>entries.map(x=>describe(x,latest)),hosts});
})();
