/* Auto-detect actual uploaded MP4 assets in the public Lolite repository.
 * A card becomes available ONLY if the corresponding video file is hosted.
 * Never claim the files exist merely because they were uploaded to a chat.
 */
(()=>{'use strict';
 const FILES=[["sukuna-fuga-flames","Sukuna — Fuga Flames","Anime","3840x2160","crimson-fold"],["nissan-gt-r32-rocket-bunny","Nissan GT-R R32","Cars","3840x2160","red-ridges"],["hiyuki-silent-storm","Hiyuki — Silent Storm","Anime","3840x2160","lunar"],["minecraft-aquarium","Minecraft Aquarium","Gaming","3840x2160","tidal-night"],["spider-man-2","Spider-Man 2","Gaming","3840x2160","rain-city"],["zelda-starlight-adventure","Zelda — Starlight Adventure","Gaming","3840x2160","lunar"],["fortnite-stormy-sky","Fortnite — Stormy Sky","Gaming","1920x1080","rain-city"],["japans-majestic-peaks-and-cherry-blossoms","Japan's Majestic Peaks","Nature","1920x1080","pine-silence"],["isagi-yoichi-devil-eyes","Isagi Yoichi — Devil Eyes","Anime","3840x2160","carbon"],["where-whales-fly","Where Whales Fly","Nature","3840x2160","tidal-night"],["minecraft-dog","Minecraft Dog","Gaming","3840x2160","pine-silence"],["kakashi-hatake-naruto","Kakashi Hatake — Naruto","Anime","3840x2160","lunar"],["liquid-lines-cyan","Liquid Lines — Cyan","Abstract","3840x2160","contour"],["aesthetic-mountains-in-front-of-the-sky","Aesthetic Mountains","Nature","3840x2160","red-ridges"],["forest-rainfall","Forest Rainfall","Nature","1920x1080","pine-silence"],["konata-on-windows-xp","Konata on Windows XP","Anime","3840x2160","carbon"],["audi-rs-7-sportback-under-the-rain","Audi RS 7 — Rain","Cars","3840x2160","rain-city"],["rain-drops-on-window","Raindrops on Window","Nature","3840x2160","rain-city"],["blurred-sunset-while-raining","Blurred Sunset in Rain","Nature","3840x2160","red-ridges"],["motorcycle-parked","Motorcycle Parked","Cars","3840x2160(1)","carbon"]];
 const catalog=[];
 let inflight=null,lastChecked=0;
 const seen=new Set();
 const posterPath=art=>'assets/wallpapers/'+(art==='crimson-dunes'?'crimson-dunes.webp':art+'.svg');
 const hostPath=filename=>'assets/wallpapers/videos/'+encodeURIComponent(filename);
 const check=async entry=>{
  const [slug,name,category,resolution,art]=entry;
  const filename=slug+'.'+resolution+'.mp4',path=hostPath(filename);
  try{
   const response=await fetch(path,{method:'HEAD',cache:'no-store',credentials:'same-origin'});
   if(!response.ok)return null;
   const mime=String(response.headers.get('content-type')||'').toLowerCase();
   if(mime.startsWith('text/html')||mime.startsWith('text/plain')||mime.includes('json'))return null;
   const knownSource='Original uploaded video · '+(resolution.startsWith('3840')?'4K':'Full HD');
   return Object.freeze({id:'user-'+slug,name,category:'Videos',group:category,
    video:path,src:posterPath(art),poster:posterPath(art),originalName:filename,
    provider:knownSource});
  }catch(error){return null}
 };
 async function discover(force=false){
  if(inflight)return inflight;
  if(!force&&Date.now()-lastChecked<60_000)return catalog;
  inflight=(async()=>{
   const results=await Promise.all(FILES.map(check));
   let added=0;
   for(const entry of results){
    if(!entry||seen.has(entry.id))continue;
    seen.add(entry.id);catalog.push(entry);added++;
   }
   lastChecked=Date.now();
   if(added)window.dispatchEvent(new CustomEvent('lolite:uploaded-wallpapers-ready',{detail:{added,total:catalog.length}}));
   return catalog;
  })();
  try{return await inflight}finally{inflight=null}
 }
 window.LoliteUploadedWallpapers=Object.freeze({catalog,discover,knownFiles:FILES.length});
})();