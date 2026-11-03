/* Service worker for user-imported LOCAL game assets only.
 * Runs under /core/ and responds ONLY to /core/local-games/<package>/<path>.
 * No network proxying, rewriting, or external URL interception.
 */
"use strict";
const DB="lolite-local-game-packages-v1",STORE="assets";
const base=new URL(self.registration.scope);
const prefix=base.pathname+"local-games/";
self.addEventListener("install",event=>event.waitUntil(self.skipWaiting()));
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
let cached=null;
function database(){
 if(cached)return cached;
 cached=new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB,1);
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error("Local package storage unavailable"));
 }).catch(error=>{cached=null;throw error});
 return cached;
}
async function getAsset(key){
 const db=await database();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,"readonly");
  const req=tx.objectStore(STORE).get(key);
  req.onsuccess=()=>resolve(req.result||null);
  req.onerror=()=>reject(req.error||new Error("Could not read local game file"));
 });
}
const forbidden=part=>!part||part===".."||part==="."||/[\x00-\x1f\x7f]/.test(part);
function response(code,message){
 return new Response(message,{status:code,headers:{"Content-Type":"text/plain;charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Access-Control-Allow-Origin":"*"}});
}
async function serve(request){
 const url=new URL(request.url);
 let relative;
 try{relative=decodeURIComponent(url.pathname.slice(prefix.length))}
 catch{return response(400,"Invalid local file path")}
 const segments=relative.split("/");
 const id=segments.shift(),path=segments.join("/");
 if(!/^pkg-[a-f0-9-]{16,60}$/.test(id)||!path||segments.some(forbidden)||path.includes("\\")||path.includes(":")||path.length>500)return response(400,"Invalid local game file");
 let asset;
 try{asset=await getAsset(id+"/"+path)}
 catch{return response(503,"Local game storage is unavailable")}
 if(!asset||!(asset.data instanceof Blob))return response(404,"Local game file not found. Re-import the full game ZIP.");
 const data=asset.data,headers=new Headers({
  "Content-Type":asset.type||data.type||"application/octet-stream",
  "Cache-Control":"no-store",
  "X-Content-Type-Options":"nosniff",
  "Cross-Origin-Resource-Policy":"cross-origin",
  "Access-Control-Allow-Origin":"*",
  "Accept-Ranges":"bytes"
 });
 // Top-level imported HTML runs under an opaque origin. It must not read
 // Lolite's cookies, localStorage, IndexedDB, or linked account credentials.
 // Unlike an iframe, CSP sandbox also applies to directly opened documents.
 if(/text\/html(?:;|$)/i.test(asset.type||data.type||"")){
  headers.set("Content-Security-Policy","sandbox allow-scripts allow-forms allow-pointer-lock allow-downloads");
 }
 const range=request.headers.get("range");
 if(range){
  const match=range.match(/^bytes=(\d+)-(\d*)$/);
  if(!match)return new Response(null,{status:416,headers:{"Content-Range":"bytes */"+data.size}});
  const from=Number(match[1]),to=match[2]?Number(match[2]):data.size-1;
  if(from>=data.size||to<from)return new Response(null,{status:416,headers:{"Content-Range":"bytes */"+data.size}});
  const last=Math.min(to,data.size-1);
  headers.set("Content-Range","bytes "+from+"-"+last+"/"+data.size);
  headers.set("Content-Length",String(last-from+1));
  return new Response(request.method==="HEAD"?null:data.slice(from,last+1),{status:206,headers});
 }
 headers.set("Content-Length",String(data.size));
 return new Response(request.method==="HEAD"?null:data,{status:200,headers});
}
self.addEventListener("fetch",event=>{
 const url=new URL(event.request.url);
 if(url.origin!==base.origin||!url.pathname.startsWith(prefix))return;
 if(event.request.method!=="GET"&&event.request.method!=="HEAD")return;
 event.respondWith(serve(event.request));
});
