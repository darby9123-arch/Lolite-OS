/* Lolite Movies — local personal video library with gated external sources.
   Cinema-style interface informed by CINEXTMA's open-source UX.
   External CINEXTMA-style source choices live in cinextma-streams.js. */
(()=>{
 'use strict';
 const GATE_KEY='loliteMoviesAdBlockNoticeV1';
 let acceptedNotice=false;
 try{acceptedNotice=sessionStorage.getItem(GATE_KEY)==='accepted'}catch(error){console.info('Movie session preference is not available')}
 const acceptsNotice=()=>acceptedNotice;
 function acceptNotice(){
   acceptedNotice=true;
   try{sessionStorage.setItem(GATE_KEY,'accepted')}catch(error){console.info('Cannot store movie acknowledgment')}
   const content=document.querySelector('#windows .window[data-window-id="movies"] .content');
   if(!content)return;
   content.innerHTML=createPage();
   bind();
 }
 function bindGate(){
   const root=document.querySelector('#windows .window[data-window-id="movies"] .lm-movies');
   if(!root||root.dataset.gateBound==='1')return;
   root.dataset.gateBound='1';
   root.querySelector('#lmAdBlockContinue')?.addEventListener('click',acceptNotice);
   root.querySelector('#lmAdBlockClose')?.addEventListener('click',()=>window.closeWin?.('movies'));
 }
 const KEY='loliteMoviesLibraryV1';
 const dbName='lolite-movies-offline',store='videos',limit=150*1024*1024;
 let entries=[],objects=new Map(),selected=null,filter='all',query='',dbPromise;
 try{entries=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(entries))entries=[]}catch{entries=[]}
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(entries))}catch(e){console.warn('Movie metadata not saved',e)}};
 const css=`
 .lm-movies{height:100%;box-sizing:border-box;margin:-18px;background:#0d1018;color:#f3f5fc;font:14px 'Segoe UI',sans-serif;display:flex;flex-direction:column;overflow:hidden}
 .lm-movies *{box-sizing:border-box}.lm-top{padding:19px 24px 15px;background:linear-gradient(125deg,#1b2134,#111721);border-bottom:1px solid #313849;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
 .lm-brand{font-size:21px;font-weight:800;letter-spacing:-.6px}.lm-brand em{font-style:normal;color:#bba9fa}.lm-muted{color:#a6afc3;font-size:12px;line-height:1.5}
 .lm-actions{display:flex;gap:8px;flex-wrap:wrap}.lm-movies button,.lm-movies input,.lm-movies select{font:inherit}
 .lm-movies button{border:1px solid #47516a;color:#fff;background:#222c40;border-radius:7px;padding:9px 13px;cursor:pointer}
 .lm-movies button:hover{background:#35425a}.lm-movies button.primary{background:#6655c9;border-color:#8875e8}
 .lm-body{padding:23px;flex:1;overflow:auto;min-height:0}
 .lm-hero{padding:24px;border:1px solid #35354f;border-radius:13px;background:radial-gradient(ellipse at 85% 25%,#573e9466,transparent 50%),linear-gradient(120deg,#211f35,#141922);margin-bottom:20px}
 .lm-hero h1{font-size:27px;margin:8px 0;font-weight:800}.lm-hero p{max-width:620px;color:#b7c1d2;font-size:13px;line-height:1.6}
 .lm-search{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}.lm-search input{flex:1;min-width:180px;background:#141b29;color:#fff;border:1px solid #3e4860;border-radius:8px;padding:11px 14px}
 .lm-filters{display:flex;gap:7px;flex-wrap:wrap}.lm-filters button{padding:10px}.lm-filters button[aria-pressed=true]{background:#6251b4;border-color:#ad9ee9}
 .lm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:14px}.lm-card{border:1px solid #30394c;border-radius:10px;overflow:hidden;background:#181f2d}
 .lm-poster{aspect-ratio:2/3;background:radial-gradient(circle at 80% 16%,#a17bef70,transparent 46%),linear-gradient(145deg,#353f5d,#161d2d);display:flex;align-items:center;justify-content:center;position:relative;padding:12px;text-align:center}
 .lm-poster span{font-size:18px;font-weight:850;overflow-wrap:anywhere;text-shadow:0 2px 13px #000b}.lm-poster small{position:absolute;top:9px;left:9px;font-size:10px;background:#161c29cc;padding:5px 7px;border-radius:6px}
 .lm-card-body{padding:12px}.lm-card h3{font-size:13px;margin:0 0 6px;overflow-wrap:anywhere}.lm-card .lm-actions{margin-top:10px}.lm-card button{font-size:12px;padding:7px;flex:1}
 .lm-video-page{display:none;flex:1;min-height:0;overflow:auto;padding:20px}.lm-video-page.active{display:block}
 .lm-player{display:block;width:100%;max-height:66vh;background:#000;border-radius:10px;outline:none}
 .lm-video-actions{display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0}
 .lm-empty{border:1px dashed #3b465d;border-radius:12px;padding:24px;color:#aebbd0;line-height:1.7}
 .lm-progress{height:3px;background:#30394b;margin:10px 0;border-radius:4px;overflow:hidden}.lm-progress div{height:100%;background:#9e8ff4}
 .lm-adgate{flex:1;min-height:0;display:grid;place-items:center;overflow:auto;padding:clamp(22px,4vw,42px);background:radial-gradient(circle at 50% 20%,#34305460,transparent 55%),#0d1018}
 .lm-adgate-card{max-width:570px;border:1px solid #384362;border-radius:16px;background:#171f2e;padding:clamp(20px,4vw,36px);box-shadow:0 18px 70px #0005}
 .lm-adgate-kicker{font-size:11px;letter-spacing:.14em;color:#ad9cf9;font-weight:800}
 .lm-adgate h1{margin:12px 0;font-size:clamp(24px,4vw,34px);letter-spacing:-.04em}
 .lm-adgate p{color:#b7c1d3;line-height:1.65;font-size:14px}
 .lm-adgate-buttons{display:flex;gap:9px;flex-wrap:wrap;margin-top:20px}
 .lm-adgate-buttons button{font-weight:700;padding:12px 16px}
 .lm-adgate-caution{margin-top:18px;padding:12px;background:#202637;border-left:3px solid #9e8be7;border-radius:7px;color:#ced7e9;font-size:12px;line-height:1.6}
 @media(max-width:620px){.lm-top{padding:14px}.lm-body{padding:14px}.lm-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.lm-hero h1{font-size:21px}}
 `;
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 function database(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(dbName,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(store))req.result.createObjectStore(store)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return dbPromise}
 async function offlinePut(id,file){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(file,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
 async function offlineGet(id){const db=await database();return new Promise((resolve,reject)=>{const req=db.transaction(store,'readonly').objectStore(store).get(id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
 async function offlineDelete(id){try{const db=await database();const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(id)}catch(e){console.warn(e)}}
 const find=id=>entries.find(e=>e.id===id);
 const slug=name=>name.replace(/\.[^.]+$/,'').replace(/[._-]/g,' ').replace(/\s+/g,' ').trim();
 function movieWindow(){return document.querySelector('#windows .window[data-window-id="movies"] .content')}
 function root(){return movieWindow()?.querySelector('.lm-movies')}
 function notify(text){if(typeof window.toast==='function')window.toast(text);else console.info(text)}
 function createPage(){
   if(!acceptsNotice())return `<div class="lm-movies">
     <section class="lm-adgate" aria-labelledby="lmAdGateTitle"><div class="lm-adgate-card">
       <div class="lm-adgate-kicker">LOLITE MOVIES · BEFORE YOU WATCH</div>
       <h1 id="lmAdGateTitle">Ad blocker required</h1>
       <p>Some third-party movie and TV hosts used by CINEXTMA show pop-up, redirect and in-player advertisements. For safer browsing, use a trusted ad blocker before opening these players.</p>
       <div class="lm-adgate-caution">Lolite cannot detect whether an ad blocker is installed or guarantee that one will block every ad. Clicking Continue is an acknowledgment only. Third-party streams may have different content rights, privacy practices and availability.</div>
       <div class="lm-adgate-buttons">
         <button id="lmAdBlockContinue" class="primary" type="button">I have an ad blocker</button>
         <button id="lmAdBlockClose" type="button">Go back</button>
       </div>
       <p class="lm-muted">Lolite Movies remembers your acknowledgment for this browser tab session. Only watch content you have the right to access.</p>
     </div></section></div>`;
   return `<div class="lm-movies">
     <header class="lm-top"><div><div class="lm-brand">LOLITE <em>MOVIES</em></div><div class="lm-muted">Movies & TV · Local library and streaming sources</div></div><div class="lm-actions"><button type="button" data-lm="browse">My Library</button><button type="button" data-lm="add" class="primary">+ Add videos</button></div></header>
     <section class="lm-body" id="lmCatalog"><div class="lm-hero"><div class="lm-muted">YOUR ENTERTAINMENT SPACE</div><h1>Enjoy movies and shows, your way.</h1><p>Add videos you own or have permission to use, keep a watchlist, resume where you stopped and watch locally without Lolite-inserted ads. Video files remain local unless you choose Save offline.</p><div class="lm-actions"><button class="primary" data-lm="add">Import movie or episode</button><button data-lm="discover">Discover film information ↗</button></div></div>
     <div class="lm-search"><input type="search" id="lmSearch" placeholder="Search your movies and shows…" autocomplete="off"><div class="lm-filters" role="group" aria-label="Library filter"><button data-filter="all" aria-pressed="true">All</button><button data-filter="movie" aria-pressed="false">Movies</button><button data-filter="tv" aria-pressed="false">TV Shows</button><button data-filter="favourites" aria-pressed="false">Favourites</button></div></div>
     <div id="lmGrid" class="lm-grid"></div><p class="lm-muted" style="margin-top:18px">Movie discovery interface inspired by the open-source CINEXTMA project. CINEXTMA-style third-party streaming servers can be selected from Streaming Sources. Those external players may contain ads and their licensing and availability are not verified. <a target="_blank" rel="noopener noreferrer" href="https://github.com/wisnuwirayuda15/cinextma" style="color:#baa9fc">Original project ↗</a></p></section>
     <section id="lmPlayerPage" class="lm-video-page" aria-label="Movie player"><div class="lm-actions"><button data-lm="browse">← Back to library</button><button data-lm="subtitle">Load subtitles (.vtt)</button><button data-lm="full">Fullscreen</button></div><h2 id="lmPlayingTitle"></h2><video class="lm-player" id="lmVideo" controls playsinline preload="metadata"></video><div class="lm-video-actions"><span id="lmPlaybackState" class="lm-muted">Ready to play</span><div class="lm-actions"><button data-lm="favorite">☆ Favourite</button><button data-lm="remove">Remove</button></div></div></section>
     <input type="file" id="lmImport" hidden multiple accept="video/mp4,video/webm,video/ogg,video/x-matroska,.mp4,.webm,.m4v,.mov,.mkv,.ogv,.avi"><input type="file" id="lmSubs" hidden accept=".vtt,text/vtt"></div>`;
 }
 function paint(){
   const grid=root()?.querySelector('#lmGrid');if(!grid)return;
   grid.replaceChildren();
   const list=entries.filter(e=>(filter==='all'||(filter==='favourites'?e.favorite:e.type===filter))&&e.title.toLowerCase().includes(query.toLowerCase()));
   if(!list.length){grid.innerHTML='<div class="lm-empty">No videos in this view yet. Choose <b>+ Add videos</b> to import an MP4, WebM or other file supported by your browser.</div>';return}
   for(const entry of list){
     const card=document.createElement('article');card.className='lm-card';
     const poster=document.createElement('div');poster.className='lm-poster';
     const label=document.createElement('small');label.textContent=entry.type==='tv'?'TV SHOW':'MOVIE';
     const big=document.createElement('span');big.textContent=entry.title;poster.append(label,big);
     const body=document.createElement('div');body.className='lm-card-body';
     const h=document.createElement('h3');h.textContent=entry.title;body.append(h);
     const progress=document.createElement('div');progress.className='lm-progress';const fill=document.createElement('div');
     fill.style.width=(entry.duration?Math.min(100,(entry.progress||0)/entry.duration*100):0)+'%';progress.append(fill);body.append(progress);
     const muted=document.createElement('div');muted.className='lm-muted';muted.textContent=(entry.year?entry.year+' · ':'')+(entry.offline?'Saved offline':objects.has(entry.id)?'Ready to watch':'Relink file to watch');body.append(muted);
     const row=document.createElement('div');row.className='lm-actions';
     const play=document.createElement('button');play.textContent='Play';play.className='primary';play.addEventListener('click',()=>watch(entry.id));
     const fav=document.createElement('button');fav.textContent=entry.favorite?'★':'☆';fav.title=entry.favorite?'Remove favourite':'Add favourite';fav.addEventListener('click',()=>{entry.favorite=!entry.favorite;save();paint()});
     const edit=document.createElement('button');edit.textContent='Edit';edit.addEventListener('click',()=>{const newName=prompt('Video title',entry.title);if(newName===null)return;entry.title=newName.trim().slice(0,110)||entry.title;const newType=prompt('Type: movie or tv',entry.type);if(newType!==null&&['movie','tv'].includes(newType.trim().toLowerCase()))entry.type=newType.trim().toLowerCase();const newYear=prompt('Release year (optional)',entry.year||'');if(newYear!==null)entry.year=newYear.replace(/[^0-9]/g,'').slice(0,4);save();paint()});row.append(play,fav,edit);body.append(row);card.append(poster,body);grid.append(card);
   }
 }
 function showLibrary(){
   selected=null;const r=root();if(!r)return;const video=r.querySelector('#lmVideo');video.pause();video.removeAttribute('src');video.load();
   r.querySelector('#lmPlayerPage').classList.remove('active');r.querySelector('#lmCatalog').style.display='';paint()
 }
 async function watch(id){
   const item=find(id),r=root();if(!item||!r)return;
   let file=objects.get(id);
   if(!file&&item.offline){try{file=await offlineGet(id)}catch(e){console.warn(e)}}
   if(!file){notify('Choose this video file again to relink it.');const input=r.querySelector('#lmImport');input.dataset.relink=id;input.click();return}
   const old=r.querySelector('#lmVideo').dataset.url;if(old)URL.revokeObjectURL(old);
   const url=URL.createObjectURL(file);selected=id;
   r.querySelector('#lmCatalog').style.display='none';r.querySelector('#lmPlayerPage').classList.add('active');
   r.querySelector('#lmPlayingTitle').textContent=item.title;
   const video=r.querySelector('#lmVideo');video.dataset.url=url;video.src=url;video.load();
   video.onloadedmetadata=()=>{item.duration=video.duration||0;video.currentTime=Math.min(Math.max(0,item.progress||0),Math.max(0,video.duration-2));save()};
   video.ontimeupdate=()=>{if(!Number.isFinite(video.currentTime))return;if(Math.abs(video.currentTime-(item.progress||0))>2){item.progress=video.currentTime;save()}r.querySelector('#lmPlaybackState').textContent='Playing · '+Math.floor(video.currentTime/60)+' min / '+Math.floor((video.duration||0)/60)+' min'};
   video.onended=()=>{item.progress=0;save()};
   video.play().catch(()=>{});
   r.querySelector('[data-lm="favorite"]').textContent=item.favorite?'★ Favourited':'☆ Favourite';
 }
 async function importFiles(files,relink){
   for(const file of files){
     if(!file||!(/\.(mp4|webm|m4v|mov|mkv|ogv|avi)$/i.test(file.name)||file.type.startsWith('video/')))continue;
     if(relink&&find(relink)){objects.set(relink,file);await watch(relink);continue}
     const id='lm-'+Date.now()+'-'+Math.random().toString(36).slice(2,9);
     const title=slug(file.name);
     const type=/s\d{1,2}e\d{1,2}|episode|season/i.test(title)?'tv':'movie';
     const item={id,title,type,year:'',favorite:false,progress:0,duration:0,offline:false};
     entries.unshift(item);objects.set(id,file);
     if(file.size<=limit && confirm('Save "'+title+'" offline in this browser? This uses local device storage. Cancel to keep it only until this page is reloaded.')){
       try{await offlinePut(id,file);item.offline=true}catch(e){notify('Not enough storage to save offline. The video still works this session.')}
     }
   }
   save();paint();
 }
 function bind(){
   const r=root();if(!r||r.dataset.bound)return;r.dataset.bound='1';
   r.addEventListener('click',async e=>{
     const b=e.target.closest('[data-lm]');if(!b)return;
     const act=b.dataset.lm;
     if(act==='add')r.querySelector('#lmImport').click();
     if(act==='browse')showLibrary();
     if(act==='discover')window.open('https://www.themoviedb.org/','_blank','noopener,noreferrer');
     if(act==='full'){const player=r.querySelector('#lmVideo');try{if(document.fullscreenElement===player)await document.exitFullscreen();else await player.requestFullscreen()}catch(e){notify('Fullscreen unavailable in this browser')}}
     if(act==='subtitle')r.querySelector('#lmSubs').click();
     if(act==='favorite'&&selected){const item=find(selected);item.favorite=!item.favorite;save();b.textContent=item.favorite?'★ Favourited':'☆ Favourite'}
     if(act==='remove'&&selected&&confirm('Remove this video from your Lolite Movies library?')){const id=selected;entries=entries.filter(e=>e.id!==id);objects.delete(id);await offlineDelete(id);save();showLibrary()}
   });
   r.querySelector('#lmSearch').addEventListener('input',e=>{query=e.target.value;paint()});
   r.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;r.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));paint()}));
   r.querySelector('#lmImport').addEventListener('change',async e=>{const id=e.target.dataset.relink||'';delete e.target.dataset.relink;await importFiles(Array.from(e.target.files||[]),id);e.target.value=''});
   r.querySelector('#lmSubs').addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;const video=r.querySelector('#lmVideo');video.querySelectorAll('track[data-local]').forEach(t=>t.remove());const track=document.createElement('track');track.kind='subtitles';track.label='Local subtitles';track.srclang='en';track.default=true;track.dataset.local='1';track.src=URL.createObjectURL(file);video.append(track);video.textTracks[0].mode='showing';e.target.value=''});
   r.addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('Files'))e.preventDefault()});
   r.addEventListener('drop',async e=>{e.preventDefault();await importFiles(Array.from(e.dataTransfer?.files||[]),'')});
   paint();
 }
 const oldPage=window.page;window.page=function(id){if(id==='movies'){setTimeout(()=>acceptsNotice()?bind():bindGate(),0);return createPage()}return oldPage(id)};
 window.LoliteMovies={open:()=>window.openApp?.('movies','Lolite Movies',1120,740)};
})();