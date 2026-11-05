/* User-supplied live wallpapers: local browser import and storage, no remote stream links. */
(()=>{'use strict';
 const entries=[["sukuna-fuga-flames","Sukuna — Fuga Flames","Anime","crimson-fold"],["nissan-gt-r32-rocket-bunny","Nissan GT-R R32 Rocket Bunny","Cars","red-ridges"],["hiyuki-silent-storm","Hiyuki — Silent Storm","Anime","crimson-fold"],["minecraft-aquarium","Minecraft Aquarium","Gaming","tidal-night"],["spider-man-2","Spider-Man 2","Gaming","red-ridges"],["zelda-starlight-adventure","Zelda — Starlight Adventure","Gaming","lunar"],["fortnite-stormy-sky","Fortnite — Stormy Sky","Gaming","rain-city"],["japans-majestic-peaks-and-cherry-blossoms","Japan's Majestic Peaks & Cherry Blossoms","Nature","pine-silence"],["isagi-yoichi-devil-eyes","Isagi Yoichi — Devil Eyes","Anime","contour"],["where-whales-fly","Where Whales Fly","Nature","tidal-night"],["minecraft-dog","Minecraft Dog","Gaming","pine-silence"],["kakashi-hatake-naruto","Kakashi Hatake — Naruto","Anime","lunar"],["liquid-lines-cyan","Liquid Lines — Cyan","Abstract","contour"],["aesthetic-mountains-in-front-of-the-sky","Aesthetic Mountains in Front of the Sky","Nature","red-ridges"],["forest-rainfall","Forest Rainfall","Nature","pine-silence"],["konata-on-windows-xp","Konata on Windows XP","Anime","carbon"],["audi-rs-7-sportback-under-the-rain","Audi RS 7 — Rain","Cars","rain-city"],["rain-drops-on-window","Raindrops on Window","Nature","rain-city"],["blurred-sunset-while-raining","Blurred Sunset While Raining","Nature","red-ridges"],["motorcycle-parked","Motorcycle Parked","Cars","carbon"]];
 const catalog=Object.freeze(entries.map(([slug,name,category,art])=>Object.freeze({
   id:'user-'+slug,name,category,local:true,video:'local',
   src:'assets/wallpapers/'+(art==='crimson-dunes'?'crimson-dunes.webp':art+'.svg'),slug,
   provider:'Local video'
 })));
 const byId=new Map(catalog.map(x=>[x.id,x]));
 const bySlug=new Map(catalog.map(x=>[x.slug,x]));
 const installed=new Set();
 const DB='lolite-user-wallpapers-v1', STORE='videos';
 let dbPromise=null,loading=false;
 const normalized=name=>String(name||'').toLowerCase().replace(/\.mp4$/,'')
  .replace(/\.\d{3,4}x\d{3,4}(?:\(\d+\))?$/,'').replace(/\(\d+\)$/,'')
  .replace(/[^a-z0-9]/g,'');
 const byName=new Map(catalog.map(x=>[normalized(x.slug),x]));
 const signal=(detail={})=>window.dispatchEvent(new CustomEvent('lolite:wallpaperpackchange',{
   detail:{installed:installed.size,total:catalog.length,...detail}
 }));
 function openDb(){
   if(!('indexedDB' in window))return Promise.reject(new Error('This browser cannot store local wallpaper videos.'));
   if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
     const req=indexedDB.open(DB,1);
     req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};
     req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>db.close();resolve(db)};
     req.onerror=()=>reject(req.error||new Error('Wallpaper storage could not open.'));
     req.onblocked=()=>reject(new Error('Close other Lolite tabs and try again.'));
   }).catch(e=>{dbPromise=null;throw e});
   return dbPromise;
 }
 async function queryAllIds(){
   const db=await openDb();
   return new Promise((resolve,reject)=>{
     const t=db.transaction(STORE,'readonly'),req=t.objectStore(STORE).getAllKeys();
     req.onsuccess=()=>resolve(req.result);
     req.onerror=()=>reject(req.error||new Error('Could not check installed wallpapers.'));
   });
 }
 async function get(id){
   if(!byId.has(id))return null;
   const db=await openDb();
   return new Promise((resolve,reject)=>{
     const req=db.transaction(STORE,'readonly').objectStore(STORE).get(id);
     req.onsuccess=()=>resolve(req.result||null);
     req.onerror=()=>reject(req.error||new Error('Could not load local wallpaper.'));
   });
 }
 async function put(record){
   const db=await openDb();
   return new Promise((resolve,reject)=>{
     const tx=db.transaction(STORE,'readwrite');
     tx.objectStore(STORE).put(record);
     tx.oncomplete=()=>resolve();
     tx.onerror=()=>reject(tx.error||new Error('Unable to save wallpaper. Check browser storage space.'));
     tx.onabort=()=>reject(tx.error||new Error('Wallpaper import was cancelled.'));
   });
 }
 async function remove(id){
   if(!byId.has(id))return false;
   const db=await openDb();
   await new Promise((resolve,reject)=>{
     const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);
     tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
   });
   installed.delete(id);signal();return true;
 }
 async function restore(){
   try{(await queryAllIds()).forEach(id=>{if(byId.has(id))installed.add(id)});signal({ready:true})}
   catch(e){signal({error:e.message,ready:true})}
 }
 function match(file){
   return byName.get(normalized(file.name))||null;
 }
 async function importFiles(files){
   if(loading)throw new Error('An import is already running.');
   const list=Array.from(files||[]),selected=new Map(),unknown=[];
   for(const file of list){
     const entry=match(file);
     if(!entry||!(/\.mp4$/i.test(file.name))) {unknown.push(file.name);continue}
     if(!file.size||file.size>125*1024*1024){unknown.push(file.name+' (exceeds 125 MB)');continue}
     selected.set(entry.id,{id:entry.id,name:file.name,blob:file,modified:file.lastModified,bytes:file.size});
   }
   if(!selected.size)throw new Error('No matching MP4 files were selected. Select the 20 uploaded wallpaper videos.');
   loading=true;let added=0,error=null;
   try{
     for(const record of selected.values()){
       try{await put(record);installed.add(record.id);added++;signal({progress:added,totalSelected:selected.size,current:record.name})}
       catch(e){error=e;break}
     }
     try{await navigator.storage?.persist?.()}catch(_){}
   }finally{loading=false;signal({ready:true,added,error:error?.message||null})}
   if(error)throw new Error(added+' installed; '+(selected.size-added)+' not installed: '+error.message);
   return {added,total:catalog.length,installed:installed.size,unrecognized:unknown};
 }
 async function openUrl(id){
   const record=await get(id);
   if(!record?.blob)return null;
   return URL.createObjectURL(record.blob);
 }
 window.LoliteWallpaperImports=Object.freeze({
   catalog,installed,importFiles,openUrl,get,remove,match,restore,
   isInstalled:id=>installed.has(id),
   status:()=>({installed:installed.size,total:catalog.length,loading})
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore,{once:true});else restore();
})();
