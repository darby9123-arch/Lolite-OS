/* Local Game Packages: user-selected HTML/ZIP packages, stored in browser IndexedDB.
 * Nothing is downloaded from external game sites or copied to the Lolite repository.
 * Only import files you own or have permission to use.
 */
(()=>{
"use strict";
const DB="lolite-local-game-packages-v1",PKGS="packages",ASSETS="assets";
const MAX_ZIP=90*1024*1024,MAX_TOTAL=150*1024*1024,MAX_ENTRY=40*1024*1024,MAX_FILES=650;
let dbPromise=null,workerPromise=null;
const decoder=new TextDecoder("utf-8");
const safeId=x=>typeof x==="string"&&/^pkg-[a-f0-9-]{16,60}$/.test(x);
function safePath(path){
 if(typeof path!=="string"||!path||path.length>500||/[\x00-\x1f\x7f]/.test(path))return false;
 const normalized=path.replace(/\\/g,"/");
 if(normalized.startsWith("/")||normalized.startsWith("//")||/^[a-z]:/i.test(normalized))return false;
 return normalized.split("/").every(segment=>segment&&segment!=="."&&segment!==".."&&!segment.includes(":"));
}
function mime(path){
 const ext=String(path).toLowerCase().split(".").pop();
 return ({html:"text/html;charset=utf-8",htm:"text/html;charset=utf-8",js:"text/javascript;charset=utf-8",mjs:"text/javascript;charset=utf-8",css:"text/css;charset=utf-8",json:"application/json",wasm:"application/wasm",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",webp:"image/webp",svg:"image/svg+xml",ico:"image/x-icon",woff:"font/woff",woff2:"font/woff2",ttf:"font/ttf",otf:"font/otf",mp3:"audio/mpeg",wav:"audio/wav",ogg:"audio/ogg",mp4:"video/mp4",webm:"video/webm",txt:"text/plain;charset=utf-8",xml:"text/xml;charset=utf-8",bin:"application/octet-stream",data:"application/octet-stream",unityweb:"application/octet-stream"})[ext]||"application/octet-stream";
}
function database(){
 if(dbPromise)return dbPromise;
 if(!("indexedDB" in window))return Promise.reject(new Error("Browser storage is not available"));
 dbPromise=new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB,1);
  request.onupgradeneeded=()=>{
   const db=request.result;
   if(!db.objectStoreNames.contains(PKGS))db.createObjectStore(PKGS,{keyPath:"id"});
   if(!db.objectStoreNames.contains(ASSETS)){
    const store=db.createObjectStore(ASSETS,{keyPath:"key"});
    store.createIndex("packageId","packageId",{unique:false});
   }
  };
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error("Could not open local game storage"));
  request.onblocked=()=>reject(new Error("Game storage is busy in another tab"));
 }).catch(e=>{dbPromise=null;throw e});
 return dbPromise;
}
async function getAll(){
 const db=await database();
 return new Promise((resolve,reject)=>{
  const transaction=db.transaction(PKGS,"readonly"),request=transaction.objectStore(PKGS).getAll();
  request.onsuccess=()=>resolve((request.result||[]).sort((a,b)=>b.savedAt-a.savedAt));
  request.onerror=()=>reject(request.error||new Error("Cannot read local games"));
 });
}
async function erase(id){
 if(!safeId(id))throw new Error("Invalid package ID");
 const db=await database();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction([PKGS,ASSETS],"readwrite");
  tx.objectStore(PKGS).delete(id);
  const index=tx.objectStore(ASSETS).index("packageId");
  const cursor=index.openCursor(IDBKeyRange.only(id));
  cursor.onsuccess=()=>{const item=cursor.result;if(item){item.delete();item.continue()}};
  tx.oncomplete=()=>{window.dispatchEvent(new CustomEvent("lolite-local-packages-changed"));resolve()};
  tx.onerror=()=>reject(tx.error||new Error("Failed to remove package"));
  tx.onabort=()=>reject(tx.error||new Error("Removal was cancelled"));
 });
}
function validEntryName(raw){
 if(!raw||raw.endsWith("/"))return null;
 const path=raw.replace(/\\/g,"/");
 if(path.startsWith("__MACOSX/")||/(?:^|\/)\.DS_Store$/.test(path))return null;
 if(!safePath(path))throw new Error("Unsafe path in ZIP: "+raw.slice(0,80));
 return path;
}
async function unzip(file,maxFiles=MAX_FILES,includePath=null){
 if(!(file instanceof Blob)||file.size>MAX_ZIP)throw new Error("ZIP must be under 90 MB");
 const bytes=new Uint8Array(await file.arrayBuffer());
 const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 let eocd=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){
  if(dv.getUint32(i,true)===0x06054b50){eocd=i;break}
 }
 if(eocd<0)throw new Error("This is not a supported ZIP archive");
 const count=dv.getUint16(eocd+10,true),offset=dv.getUint32(eocd+16,true);
 if(!count||count>maxFiles)throw new Error("ZIP must contain between 1 and "+maxFiles+" files");
 if(offset>bytes.length)throw new Error("Invalid ZIP central directory");
 const entries=[];
 let pos=offset,total=0;
 for(let i=0;i<count;i++){
  if(pos+46>bytes.length||dv.getUint32(pos,true)!==0x02014b50)throw new Error("Damaged ZIP file table");
  const flags=dv.getUint16(pos+8,true),method=dv.getUint16(pos+10,true);
  const compressed=dv.getUint32(pos+20,true),uncompressed=dv.getUint32(pos+24,true);
  const nameLen=dv.getUint16(pos+28,true),extraLen=dv.getUint16(pos+30,true),commentLen=dv.getUint16(pos+32,true);
  const localOffset=dv.getUint32(pos+42,true);
  if(pos+46+nameLen+extraLen+commentLen>bytes.length)throw new Error("Damaged ZIP filename table");
  const raw=decoder.decode(bytes.subarray(pos+46,pos+46+nameLen));
  pos+=46+nameLen+extraLen+commentLen;
  const path=validEntryName(raw);if(path===null||(includePath&&!includePath(path)))continue;
  if(flags&1)throw new Error("Encrypted ZIP files are not supported");
  if(method!==0&&method!==8)throw new Error("Unsupported ZIP compression method ("+method+")");
  if(uncompressed>MAX_ENTRY||compressed>MAX_ZIP||uncompressed===0xffffffff||localOffset===0xffffffff)throw new Error("An archive entry exceeds the safety limit");
  total+=uncompressed;
  if(total>MAX_TOTAL)throw new Error("Unpacked files exceed the 150 MB limit");
  if(localOffset+30>bytes.length||dv.getUint32(localOffset,true)!==0x04034b50)throw new Error("Invalid ZIP file data");
  const localNameLen=dv.getUint16(localOffset+26,true),localExtraLen=dv.getUint16(localOffset+28,true);
  const beginning=localOffset+30+localNameLen+localExtraLen;
  if(beginning+compressed>bytes.length)throw new Error("ZIP content is incomplete");
  entries.push({path,method,compressed,uncompressed,beginning});
 }
 if(!entries.length)throw new Error("No game files were found in the ZIP");
 const result=[],seen=new Set();
 for(const entry of entries){
  let data=bytes.slice(entry.beginning,entry.beginning+entry.compressed);
  if(entry.method===8){
   if(typeof DecompressionStream!=="function")throw new Error("Your browser doesn't support ZIP extraction. Try an uncompressed game folder.");
   try{
    const reader=new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw")).getReader();
    const chunks=[];let size=0;
    while(true){
     const {value,done}=await reader.read();
     if(done)break;
     size+=value.byteLength;
     if(size>entry.uncompressed||size>MAX_ENTRY){
      await reader.cancel();
      throw new Error("Unpacked file exceeded its declared size");
     }
     chunks.push(value);
    }
    data=new Uint8Array(size);
    let offset=0;
    for(const part of chunks){data.set(part,offset);offset+=part.byteLength}
   }catch(error){throw new Error("Could not unpack "+entry.path+": "+(error?.message||"invalid data"))}
  }
  if(data.length!==entry.uncompressed)throw new Error("ZIP content size mismatch for "+entry.path);
  if(seen.has(entry.path))throw new Error("Duplicate game file in ZIP: "+entry.path);
  seen.add(entry.path);
  result.push({path:entry.path,blob:new Blob([data],{type:mime(entry.path)}),size:data.length,type:mime(entry.path)});
 }
 return result;
}
function rootFile(entries){
 const html=entries.filter(e=>/\.html?$/i.test(e.path));
 if(!html.length)throw new Error("No HTML launch file found (index.html or game.html)");
 const named=html.filter(x=>/(^|\/)index\.html?$/i.test(x.path));
 const pool=named.length?named:html;
 return [...pool].sort((a,b)=>a.path.split("/").length-b.path.split("/").length||a.path.length-b.path.length)[0].path;
}
async function storeEntries(entries,title){
 if(entries.length>MAX_FILES)throw new Error("Too many game files");
 let total=0;
 const unique=new Set();
 for(const entry of entries){
  if(!safePath(entry.path))throw new Error("Invalid game path");
  if(unique.has(entry.path))throw new Error("Duplicate file in game package: "+entry.path);
  if(!(entry.blob instanceof Blob)||entry.size>MAX_ENTRY)throw new Error("Game file exceeds the 40 MB per-file limit");
  unique.add(entry.path);total+=entry.size;
  if(total>MAX_TOTAL)throw new Error("Game exceeds the 150 MB total limit");
 }
 const root=rootFile(entries);
 const id="pkg-"+(crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,"0")).join(""));
 const record={id,title:String(title||"My HTML Game").replace(/[<>]/g,"").trim().slice(0,90),root,files:entries.length,bytes:total,savedAt:Date.now()};
 const db=await database();
 await new Promise((resolve,reject)=>{
  const tx=db.transaction([PKGS,ASSETS],"readwrite");
  tx.objectStore(PKGS).put(record);
  const store=tx.objectStore(ASSETS);
  for(const entry of entries)store.put({key:id+"/"+entry.path,packageId:id,path:entry.path,data:entry.blob,type:entry.type});
  tx.oncomplete=resolve;
  tx.onerror=()=>reject(tx.error||new Error("Not enough browser storage for this game"));
  tx.onabort=()=>reject(tx.error||new Error("Import cancelled; check available storage"));
 });
 window.dispatchEvent(new CustomEvent("lolite-local-packages-changed",{detail:{id}}));
 return record;
}

/* Install one actual HTML document selected from the user's ZIP. The archive
 * remains on their own device; no game code is mirrored to GitHub. */
async function importGenizyGameFromZip(file,gamePath,title){
 if(!file||!/\.zip$/i.test(file.name||""))throw new Error("Select the GenizyMath ZIP file");
 const catalog=Array.isArray(window.LoliteGenizyCatalog)?window.LoliteGenizyCatalog:[];
 const match=catalog.find(entry=>entry.path===gamePath&&entry.title===title);
 if(!match||!/^[a-z0-9_./-]+\.html$/i.test(gamePath))throw new Error("Unrecognised game in GenizyMath collection");
 const getPath=raw=>{
  const normalized=raw.replace(/\\/g,"/");
  const segment=normalized.indexOf("/iframe/");
  return segment>=0?normalized.slice(segment+1):normalized;
 };
 const entries=await unzip(file,5000,path=>getPath(path)===gamePath);
 if(entries.length!==1)throw new Error("The selected ZIP does not contain "+gamePath);
 const html=await entries[0].blob.text();
 if(/<iframe\b/i.test(html))throw new Error("This game is a website iframe, not a standalone HTML game");
 const entry={path:"index.html",blob:new Blob([html],{type:"text/html;charset=utf-8"}),size:entries[0].size,type:"text/html;charset=utf-8"};
 const record=await storeEntries([entry],title);
 record.source="genizymath-user-zip";
 // Update source information for local library and selective cache clearance.
 const db=await database();
 await new Promise((resolve,reject)=>{
  const tx=db.transaction(PKGS,"readwrite");
  tx.objectStore(PKGS).put(record);
  tx.oncomplete=resolve;
  tx.onerror=()=>reject(tx.error||new Error("Could not save game source"));
 });
 return record;
}
async function clearAutoGameCache(){
 const all=await getAll();
 const auto=all.filter(record=>record.source==="genizymath-auto");
 for(const item of auto)await erase(item.id);
 return auto.length;
}
async function importStandaloneHtml(file,displayTitle){
 if(!(file instanceof Blob)||!file.name||!/\.html?$/i.test(file.name))throw new Error("Choose a standalone HTML game file");
 if(file.size>MAX_ENTRY)throw new Error("HTML file exceeds the 40 MB per-file limit");
 const title=displayTitle||file.name.replace(/\.html?$/i,"").replace(/[_-]/g," ");
 return storeEntries([{path:"index.html",blob:file,size:file.size,type:"text/html;charset=utf-8"}],title);
}
async function importSavedHtml(record){
 if(!record||typeof record.html!=="string"||!record.html.trim())throw new Error("The saved HTML game was empty");
 const blob=new Blob([record.html],{type:"text/html;charset=utf-8"});
 if(blob.size>MAX_ENTRY)throw new Error("HTML file exceeds the 40 MB per-file limit");
 const entry=await storeEntries([{path:"index.html",blob,size:blob.size,type:"text/html;charset=utf-8"}],record.title||"HTML Game");
 if(record.source==="genizymath-auto"){
  entry.source="genizymath-auto";
  const db=await database();
  await new Promise((resolve,reject)=>{
   const tx=db.transaction(PKGS,"readwrite");tx.objectStore(PKGS).put(entry);
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error("Could not save game cache status"));
  });
 }
 return entry;
}

/* Import only the 850 chosen HTML launch documents from a user-supplied
 * GenizyMath source ZIP. Nothing is copied into Lolite's public repository.
 * Ignore the upstream game-list wrappers and any pages that embed another site.
 */
async function importGenizyZip(file,onProgress){
 if(!file||!/\.zip$/i.test(file.name||""))throw new Error("Choose the GenizyMath source ZIP");
 const catalog=Array.isArray(window.LoliteGenizyCatalog)?window.LoliteGenizyCatalog:[];
 const wanted=new Set(catalog.filter(x=>x&&typeof x.path==="string"&&/^iframe\/[a-zA-Z0-9_.-]+\.html$/.test(x.path)).map(x=>x.path));
 if(!wanted.size)throw new Error("The GenizyMath game list is not loaded");
 const sourcePath=raw=>{
  const path=raw.replace(/\\/g,"/");
  const i=path.indexOf("/iframe/");
  return i>=0?path.slice(i+1):path;
 };
 onProgress?.("Reading game files…");
 const extracted=await unzip(file,5000,raw=>wanted.has(sourcePath(raw)));
 const byPath=new Map(extracted.map(entry=>[sourcePath(entry.path),entry]));
 if(!byPath.size)throw new Error("No matching GenizyMath games found. Select genizymath.github.io-main.zip");
 const existing=await getAll();
 const normalize=x=>String(x||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]/g,"");
 const installedTitles=new Set(existing.map(game=>normalize(game.title)));
 const ready=[];
 let skippedEmbeds=0,missing=0,alreadyInstalled=0;
 for(const item of catalog){
  if(!item||!wanted.has(item.path))continue;
  const entry=byPath.get(item.path);
  if(!entry){missing++;continue}
  const title=String(item.title||"").replace(/[<>]/g,"").trim().slice(0,90);
  const key=normalize(title);
  if(!key)continue;
  if(installedTitles.has(key)){alreadyInstalled++;continue}
  const html=await entry.blob.text();
  if(/<iframe\b/i.test(html)){skippedEmbeds++;continue}
  ready.push({title,entry});
  installedTitles.add(key);
 }
 if(!ready.length)return {imported:0,skippedEmbeds,missing,alreadyInstalled};
 onProgress?.("Installing "+ready.length+" games…");
 const db=await database();
 await new Promise((resolve,reject)=>{
  const tx=db.transaction([PKGS,ASSETS],"readwrite");
  const pkgs=tx.objectStore(PKGS),assets=tx.objectStore(ASSETS);
  const now=Date.now();
  for(const {title,entry} of ready){
   const id="pkg-"+(crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,"0")).join(""));
   pkgs.put({id,title,root:"index.html",files:1,bytes:entry.size,savedAt:now,source:"genizymath-zip"});
   assets.put({key:id+"/index.html",packageId:id,path:"index.html",data:entry.blob,type:"text/html;charset=utf-8"});
  }
  tx.oncomplete=resolve;
  tx.onerror=()=>reject(tx.error||new Error("Not enough browser storage for the game collection"));
  tx.onabort=()=>reject(tx.error||new Error("Game collection install was cancelled"));
 });
 window.dispatchEvent(new CustomEvent("lolite-local-packages-changed"));
 return {imported:ready.length,skippedEmbeds,missing,alreadyInstalled};
}

async function importZip(file,displayTitle){
 if(!file||!/\.(zip)$/i.test(file.name||""))throw new Error("Choose a ZIP file");
 const entries=await unzip(file);
 return storeEntries(entries,displayTitle||file.name.replace(/\.zip$/i,"").replace(/[_-]/g," "));
}
async function importFolder(files,displayTitle){
 const chosen=Array.from(files||[]);
 if(!chosen.length)throw new Error("Choose a folder containing your HTML game");
 const entries=chosen.filter(f=>!f.name.startsWith(".")).map(f=>{
  let path=f.webkitRelativePath||f.name;
  if(!safePath(path))throw new Error("Unsafe file path in selected folder");
  return {path,blob:f,size:f.size,type:mime(path)};
 });
 if(!entries.length)throw new Error("The selected folder was empty");
 const first=entries[0].path.split("/")[0];
 if(first&&entries.every(e=>e.path.startsWith(first+"/")))for(const e of entries)e.path=e.path.slice(first.length+1);
 return storeEntries(entries,displayTitle||first||"Local Game");
}

/* Import a user-selected gamefiles.zip as a single shared local asset pack.
 * Does not publish game HTML/JS/assets to GitHub or copy games across devices. */
const GAMEFILES_SOURCE="gamefiles-collection";
const GAMEFILES_PARENT="gamefiles-collection-assets";
const GAMEFILES_SKIP=/^(?:apps|gamepage|index|home|ai|search|settings|sandstoneproxy|heliosbrowser|nautilisos|sites|about|faq|credits|login|register|options|games|tools)$/i;
const GAMEFILES_BLOCK=/(?:casino|poker|blackjack|roulette|slot[\s_-]*machine|sportsbook|betting|wager|porn|adult|sex)/i;
const gamefilesId=()=>"pkg-"+(crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,"0")).join(""));
async function importGamefilesZip(file,onProgress){
 if(!file||!/\.zip$/i.test(file.name||""))throw new Error("Choose your gamefiles.zip archive");
 onProgress?.("Unpacking your HTML game collection…");
 const files=await unzip(file,3000,path=>path.startsWith("gamefiles/"));
 const formats=new Set(["html","htm","css","js","mjs","json","wasm","png","jpg","jpeg","gif","webp","svg","ico","mp3","wav","ogg","mp4","webm","otf","ttf","woff","woff2","manifest","bin","data","xml"]);
 const assets=files.filter(entry=>formats.has(entry.path.split(".").pop().toLowerCase()));
 const matches=new Map();let checked=0,skipped=0;
 for(const entry of assets){
  if(!/^gamefiles\/[^/]+\.html?$/i.test(entry.path))continue;
  const title=entry.path.slice("gamefiles/".length).replace(/\.html?$/i,"");
  const key=title.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]/g,"").toLowerCase();
  if(!key||GAMEFILES_SKIP.test(key)||GAMEFILES_BLOCK.test(title)||entry.size<700){skipped++;continue}
  const html=await entry.blob.text();
  if(!/<(?:html|head|body|canvas|script|div)\b/i.test(html)||/<Module\s*>/i.test(html)||/<iframe\b/i.test(html)){skipped++;continue}
  const score=(/[A-Z]/.test(title)?4:0)+(/\s/.test(title)?2:0)+(entry.size>7000?1:0);
  const before=matches.get(key);
  if(!before||score>before.score)matches.set(key,{title:title.replace(/[<>]/g,"").trim().slice(0,90),root:entry.path,bytes:entry.size,score});
  if(++checked%200===0)onProgress?.("Checking playable HTML… "+checked+" pages checked");
 }
 const games=[...matches.values()];
 if(!games.length)throw new Error("No standalone HTML games found in this ZIP");
 const previous=(await getAll()).filter(rec=>rec.source===GAMEFILES_SOURCE||rec.source===GAMEFILES_PARENT);
 const packId=gamefilesId(),db=await database(),now=Date.now();
 const total=assets.reduce((sum,item)=>sum+item.size,0);
 onProgress?.("Installing "+games.length+" games…");
 await new Promise((resolve,reject)=>{
  const tx=db.transaction([PKGS,ASSETS],"readwrite"),pkgs=tx.objectStore(PKGS),stored=tx.objectStore(ASSETS);
  pkgs.put({id:packId,title:"gamefiles.zip",root:games[0].root,files:assets.length,bytes:total,savedAt:now,source:GAMEFILES_PARENT});
  for(const game of games){
   pkgs.put({id:gamefilesId(),title:game.title,root:game.root,packId,files:1,bytes:game.bytes,savedAt:now,source:GAMEFILES_SOURCE});
  }
  for(const entry of assets)stored.put({key:packId+"/"+entry.path,packageId:packId,path:entry.path,data:entry.blob,type:entry.type});
  for(const old of previous)pkgs.delete(old.id);
  for(const old of previous.filter(rec=>rec.source===GAMEFILES_PARENT)){
   const cursor=stored.index("packageId").openCursor(IDBKeyRange.only(old.id));
   cursor.onsuccess=()=>{const row=cursor.result;if(row){row.delete();row.continue()}};
  }
  tx.oncomplete=resolve;
  tx.onerror=()=>reject(tx.error||new Error("Not enough browser storage for your game collection"));
  tx.onabort=()=>reject(tx.error||new Error("Game collection import was cancelled"));
 });
 window.dispatchEvent(new CustomEvent("lolite-local-packages-changed",{detail:{source:GAMEFILES_SOURCE,count:games.length}}));
 return {imported:games.length,skipped,assets:assets.length,bytes:total,replaced:previous.filter(rec=>rec.source===GAMEFILES_SOURCE).length};
}
async function removeGamefilesZip(){
 const previous=(await getAll()).filter(rec=>rec.source===GAMEFILES_SOURCE||rec.source===GAMEFILES_PARENT);
 if(!previous.length)return 0;
 const db=await database();
 await new Promise((resolve,reject)=>{
  const tx=db.transaction([PKGS,ASSETS],"readwrite"),pkgs=tx.objectStore(PKGS),stored=tx.objectStore(ASSETS);
  previous.forEach(rec=>pkgs.delete(rec.id));
  for(const parent of previous.filter(rec=>rec.source===GAMEFILES_PARENT)){
   const cursor=stored.index("packageId").openCursor(IDBKeyRange.only(parent.id));
   cursor.onsuccess=()=>{const row=cursor.result;if(row){row.delete();row.continue()}};
  }
  tx.oncomplete=resolve;
  tx.onerror=()=>reject(tx.error||new Error("Could not remove game collection"));
  tx.onabort=()=>reject(tx.error||new Error("Removal cancelled"));
 });
 window.dispatchEvent(new CustomEvent("lolite-local-packages-changed",{detail:{source:GAMEFILES_SOURCE,count:0}}));
 return previous.filter(rec=>rec.source===GAMEFILES_SOURCE).length;
}

async function ensureWorker(){
 if(workerPromise)return workerPromise;
 workerPromise=(async()=>{
  if(!("serviceWorker" in navigator))throw new Error("This browser doesn't support local packaged games");
  const script=new URL("core/local-game-sw.js?v=in-app-player-20261106",document.baseURI);
  const scope=new URL("core/",document.baseURI);
  const registration=await navigator.serviceWorker.register(script.href,{scope:scope.href});
  const sw=registration.active||registration.waiting||registration.installing;
  if(!sw)throw new Error("Local game service is not ready");
  if(sw.state!=="activated"){
   await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error("Local game service could not start")),12000);
    const check=()=>{if(sw.state==="activated"){clearTimeout(timeout);resolve()}else if(sw.state==="redundant"){clearTimeout(timeout);reject(new Error("Local game service failed to install"))}};
    sw.addEventListener("statechange",check);check();
   });
  }
  return scope.href;
 })().catch(error=>{workerPromise=null;throw error});
 return workerPromise;
}
async function launchUrl(record){
 if(!record||!safeId(record.id)||!safePath(record.root))throw new Error("Invalid local game");
 const scope=await ensureWorker();
 const id=record.packId&&safeId(record.packId)?record.packId:record.id;
 return new URL("local-games/"+id+"/"+record.root.split("/").map(encodeURIComponent).join("/"),scope).href;
}
window.LoliteLocalGamePackages=Object.freeze({importZip,importGenizyZip,importGenizyGameFromZip,clearAutoGameCache,importFolder,importStandaloneHtml,importSavedHtml,importGamefilesZip,removeGamefilesZip,list:getAll,remove:erase,ensureWorker,launchUrl});
})();