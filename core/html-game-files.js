/* Lolite HTML Game Files: user-initiated personal downloads and imports, stored only in this browser.
 * Third-party games are not redistributed with Lolite OS. Relative external assets still require internet.
 */
(()=>{
 "use strict";
 const DB_NAME="lolite-html-game-files",STORE="html-games",MAX_BYTES=14*1024*1024;
 let pending=null;
 function database(){
   if(!("indexedDB" in window))return Promise.reject(new Error("Browser storage is unavailable"));
   if(pending)return pending;
   pending=new Promise((resolve,reject)=>{
     const request=indexedDB.open(DB_NAME,1);
     request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"id"})};
     request.onsuccess=()=>resolve(request.result);
     request.onerror=()=>reject(request.error||new Error("Cannot open saved game storage"));
   }).catch(err=>{pending=null;throw err});
   return pending;
 }
 async function transact(mode,operation){
   const db=await database();
   return new Promise((resolve,reject)=>{
     const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE);
     const request=operation(store);
     request.onsuccess=()=>resolve(request.result);
     request.onerror=()=>reject(request.error||new Error("Game file operation failed"));
     tx.onerror=()=>reject(tx.error||new Error("Game storage failed"));
   });
 }
 function validId(id){return typeof id==="string"&&/^([a-z0-9-]{1,80})$/i.test(id)}
 async function save(id,title,html,sourceUrl){
   if(!validId(id))throw new Error("Invalid local game ID");
   if(typeof html!=="string"||!html.trim())throw new Error("The HTML file was empty");
   if(new Blob([html]).size>MAX_BYTES)throw new Error("This HTML is larger than 14 MB and cannot be saved safely in the browser");
   const record={id,title:String(title||"HTML Game").slice(0,100),html,sourceUrl:String(sourceUrl||"").slice(0,500),savedAt:Date.now()};
   await transact("readwrite",store=>store.put(record));
   window.dispatchEvent(new CustomEvent("lolite-html-game-saved",{detail:{id,title:record.title}}));
   return record;
 }
 const read=id=>validId(id)?transact("readonly",store=>store.get(id)):Promise.resolve(null);
 const list=()=>transact("readonly",store=>store.getAll());
 const remove=id=>transact("readwrite",store=>store.delete(id));
 function blobUrl(record){
   if(!record||typeof record.html!=="string")throw new Error("Saved HTML not found");
   let html=record.html;
   if(!/<base\s/i.test(html)){
     let base="https://genizymath.github.io/iframe/";
     try { if(/^https:\/\//.test(record.sourceUrl))base=new URL(".",record.sourceUrl).href; }catch(_){}
     const tag="<base href=\""+base.replace(/&/g,"&amp;").replace(/"/g,"&quot;")+"\">";
     if(/<head(?:\s[^>]*)?>/i.test(html))html=html.replace(/<head(?:\s[^>]*)?>/i,match=>match+tag);
     else html=tag+html;
   }
   return URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"}));
 }
 async function importFiles(files){
   const list=Array.from(files||[]).filter(file=>/\.html?$/i.test(file.name));
   let success=0;
   for(const file of list){
     const title=file.name.replace(/\.html?$/i,"").replace(/[_-]/g," ").trim()||"HTML Game";
     const key=title.toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/^-|-$/g,"").slice(0,50);
     const id="user-"+key+"-"+file.size;
     await save(id,title,await file.text(),"");
     success++;
   }
   return success;
 }
 window.LoliteHTMLGameFiles=Object.freeze({save,read,list,remove,blobUrl,importFiles});
})();
