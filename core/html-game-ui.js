/* Lolite local HTML games — import files you own or may redistribute.
 * HTML files and full ZIP/folder packages stay in this device's browser storage.
 * External catalogue links are NOT automatically downloaded or mirrored.
 */
(()=>{
"use strict";
const storage=window.LoliteHTMLGameFiles,packages=window.LoliteLocalGamePackages;
if(!storage)return;
const titleKey=value=>String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]/g,"");
const genizyTitles=new Set((Array.isArray(window.LoliteGenizyCatalog)?window.LoliteGenizyCatalog:[]).map(entry=>titleKey(entry.title)));
let saved=[],installed=[],scheduled=false,loading=false;
const notify=msg=>typeof window.toast==="function"?window.toast(msg):console.info(msg);
function button(label,action){
 const btn=document.createElement("button");
 btn.type="button";btn.textContent=label;btn.className="store-play";
 btn.style.cssText="width:auto;min-width:95px;flex:1;padding:8px 10px;font-size:11px;";
 btn.addEventListener("click",action);
 return btn;
}
function actions(){
 const box=document.createElement("div");box.className="lolite-html-game-actions";
 box.style.cssText="display:flex;flex-wrap:wrap;gap:8px;margin-top:9px;";
 return box;
}
async function refresh(){
 if(loading)return;
 loading=true;
 try{
  const results=await Promise.all([
    storage.list().catch(error=>{console.warn("HTML files unavailable",error);return []}),
    packages?packages.list().catch(error=>{console.warn("Local packages unavailable",error);return []}):[]
  ]);
  saved=results[0];installed=results[1];
 }finally{loading=false}
 // Force visible cards to reflect newly installed or removed local game ZIPs.
 document.querySelectorAll(".lolite-local-source-actions").forEach(el=>el.remove());
 document.querySelectorAll(".store-card[data-local-source-enhanced]").forEach(el=>delete el.dataset.localSourceEnhanced);
 schedule();
}
function openPackage(record){
 if(!packages)return notify("Local package importer is unavailable");
 // Direct, same-tab document navigation. The installed HTML becomes the page,
 // with its relative JS, CSS, image and sound files served from IndexedDB.
 // Browser Back returns to Lolite; no iframe or popup is involved.
 notify("Opening "+(record.title||"local game")+"… Use your browser's Back button to return to Lolite.");
 packages.launchUrl(record).then(url=>window.location.assign(url))
 .catch(error=>notify(error?.message||"Could not start the installed game"));
}
async function openHtml(record){
 if(!record||!packages)return notify("Local HTML game loader is unavailable");
 try{
  const installedGame=await packages.importSavedHtml(record);
  await storage.remove(record.id);
  await refresh();
  openPackage(installedGame);
 }catch(error){notify(error?.message||"Could not migrate this saved HTML game")}
}
// Game Store can prefer a locally installed package when the matching
// GenizyMath title's normal Play button is pressed.
window.LoliteInstalledGameByTitle=title=>{
 const key=titleKey(title);
 return key&&genizyTitles.has(key)?installed.find(game=>titleKey(game.title)===key)||null:null;
};
window.LoliteOpenInstalledGame=openPackage;

/* Launch the real upstream HTML as a locally stored, top-level document.
 * Fetches only on an explicit Play click and stores nothing in the public
 * Lolite repository. The local-game service worker enforces an opaque-origin
 * CSP sandbox to keep third-party game scripts away from Lolite account data.
 */
const installingGenizy=new Set();
window.LolitePlayGenizyHTML=async title=>{
 if(!packages){notify("Local HTML game support is unavailable");return}
 const key=titleKey(title);
 const item=(window.LoliteGenizyCatalog||[]).find(x=>titleKey(x.title)===key);
 if(!item||typeof item.path!=="string"||!/^iframe\/[A-Za-z0-9_.-]+\.html$/.test(item.path)){
  notify("This game has no supported HTML launch file");return
 }
 if(installingGenizy.has(key))return;
 installingGenizy.add(key);
 try{
  const already=installed.find(record=>titleKey(record.title)===key);
  if(already){openPackage(already);return}
  notify("Loading "+item.title+" HTML…");
  const source="https://raw.githubusercontent.com/genizymath/genizymath.github.io/main/"+item.path;
  const response=await fetch(source,{cache:"no-store"});
  if(!response.ok)throw new Error("Could not get this game's source HTML ("+response.status+")");
  if(Number(response.headers.get("content-length")||0)>40*1024*1024)throw new Error("Game HTML exceeds the 40 MB safety limit");
  let html=await response.text();
  if(new Blob([html]).size>40*1024*1024)throw new Error("Game HTML exceeds the 40 MB safety limit");
  if(!/<(?:html|script|canvas|div|body|head)\b/i.test(html))throw new Error("The source did not return a usable HTML document");
  if(/<iframe\b/i.test(html))throw new Error("This game is an external iframe wrapper rather than direct playable HTML");
  // Relative asset paths resolve to the upstream game's iframe directory.
  // External assets can still need internet; they are not silently mirrored.
  if(!/<base(?:\s|>)/i.test(html)){
   const base='<base href="https://genizymath.github.io/iframe/">';
   if(/<head(?:\s[^>]*)?>/i.test(html))html=html.replace(/<head(?:\s[^>]*)?>/i,match=>match+base);
   else html=base+html;
  }
  // A CSP sandbox applied by the local game service worker makes the game
  // an opaque-origin page with no access to the Lolite OS account/session.
  const record=await packages.importSavedHtml({title:item.title,html});
  installed.unshift(record);
  openPackage(record);
 }catch(error){
  notify((error?.message||"Could not load the direct HTML game")+
   ". You can use the source selector for its original hosted version.");
  console.warn("GenizyMath HTML launch failed",item.path,error);
 }finally{installingGenizy.delete(key)}
};

function fileInput(accept,change,folder=false){
 const input=document.createElement("input");input.type="file";input.hidden=true;input.accept=accept;
 if(folder){input.setAttribute("webkitdirectory","");input.setAttribute("directory","");input.multiple=true}
 else input.multiple=!accept.includes("zip");
 input.addEventListener("change",async()=>{
  try{await change(input.files)}catch(error){notify(error?.message||"Game import failed");console.warn(error)}
  finally{input.value="";await refresh()}
 });
 return input;
}
function ensureTop(root){
 const top=root.querySelector(".store-top");
 if(!top||top.querySelector(".lolite-html-import"))return;
 const htmlInput=fileInput(".html,.htm,text/html",async files=>{
  if(!files.length)return;
  if(!packages)throw new Error("Local game package storage is unavailable");
  let count=0;
  for(const file of files){
    await packages.importStandaloneHtml(file);
    count++;
  }
  notify(count+" standalone HTML game"+(count===1?"":"s")+" installed for direct play.");
 });
 const htmlBtn=button("Import HTML",()=>htmlInput.click());htmlBtn.classList.add("lolite-html-import");
 htmlBtn.style.flex="0 0 auto";
 top.append(htmlBtn,htmlInput);
 if(!packages)return;
 const zipBtn=button("Import game ZIP",()=>zipInput.click());
 zipBtn.style.flex="0 0 auto";
 const zipInput=fileInput(".zip,application/zip",async files=>{
  if(!files.length)return;
  zipBtn.disabled=true;zipBtn.textContent="Importing ZIP…";
  try{
   const game=await packages.importZip(files[0]);
   notify(game.title+" installed locally ("+game.files+" files).");
  }finally{zipBtn.disabled=false;zipBtn.textContent="Import game ZIP"}
 });

 const genizyInput=fileInput(".zip,application/zip",async files=>{
  if(!files.length)return;
  if(typeof packages.importGenizyZip!=="function")throw new Error("GenizyMath ZIP importer is unavailable");
  genizyBtn.disabled=true;genizyBtn.textContent="Reading ZIP…";
  try{
   const result=await packages.importGenizyZip(files[0],status=>{genizyBtn.textContent=status});
   notify(result.imported+" GenizyMath HTML games installed locally. "+
     result.skippedEmbeds+" iframe-only games skipped; "+result.alreadyInstalled+" already installed."+
     " Games requiring external assets still need internet.");
  }finally{genizyBtn.disabled=false;genizyBtn.textContent="Import GenizyMath ZIP"}
 });
 const genizyBtn=button("Import GenizyMath ZIP",()=>genizyInput.click());
 genizyBtn.style.flex="0 0 auto";
 const folderBtn=button("Import game folder",()=>folderInput.click());
 folderBtn.style.flex="0 0 auto";
 const folderInput=fileInput("",async files=>{
  if(!files.length)return;
  folderBtn.disabled=true;folderBtn.textContent="Importing folder…";
  try{
   const game=await packages.importFolder(files);
   notify(game.title+" installed locally ("+game.files+" files).");
  }finally{folderBtn.disabled=false;folderBtn.textContent="Import game folder"}
 },true);
 const localBtn=button("My local games",()=>{
  const section=root.querySelector("#lolite-local-package-section")||root.querySelector("#lolite-saved-html-section");
  if(section)section.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});
  else notify("Import an HTML file, game ZIP or folder first.");
 });
 localBtn.style.flex="0 0 auto";
 top.append(zipBtn,zipInput,genizyBtn,genizyInput,folderBtn,folderInput,localBtn);
}
function enhanceGenizyCards(root){
 if(!packages||!genizyTitles.size)return;
 const installedByTitle=new Map();
 for(const game of installed){
  const key=titleKey(game.title);
  if(key&&!installedByTitle.has(key))installedByTitle.set(key,game);
 }
 for(const card of root.querySelectorAll(".store-card")){
  if(card.dataset.localSourceEnhanced==="1"||card.closest("#lolite-local-package-section,#lolite-saved-html-section"))continue;
  const body=card.querySelector(".store-card-body");
  const title=body?.querySelector("h3")?.textContent?.trim();
  if(!title||!genizyTitles.has(titleKey(title)))continue;
  card.dataset.localSourceEnhanced="1";
  const controls=actions();controls.classList.add("lolite-local-source-actions");
  const installedGame=installedByTitle.get(titleKey(title));
  if(installedGame)controls.append(button("Play installed HTML",()=>openPackage(installedGame)));
  async function replaceWith(importGame){
   // Keep the old package if the new import fails; remove only after success.
   const record=await importGame();
   if(installedGame&&installedGame.id!==record.id)await packages.remove(installedGame.id);
   notify(record.title+" installed locally ("+record.files+" files). Play now uses the replacement HTML.");
  }
  const input=fileInput(".zip,application/zip",async files=>{
   if(!files.length)return;
   await replaceWith(()=>packages.importZip(files[0],title));
  });
  const install=button(installedGame?"Replace local ZIP":"Install game ZIP",()=>input.click());
  const folderInput=fileInput("",async files=>{
   if(!files.length)return;
   await replaceWith(()=>packages.importFolder(files,title));
  },true);
  const folderButton=button(installedGame?"Replace with folder":"Install game folder",()=>folderInput.click());
  controls.append(install,input,folderButton,folderInput);body.append(controls);
 }
}
function buildSection(root,id,label,description,records,openFn,removeFn){
 let section=root.querySelector("#"+id);
 if(!records.length){section?.remove();return}
 if(!section){
  section=document.createElement("section");section.id=id;section.className="store-section";
  section.style.cssText="margin-top:28px;scroll-margin-top:80px;";
  root.append(section);
 }
 const fingerprint=records.map(r=>r.id+":"+r.savedAt).join("|");
 if(section.dataset.fingerprint===fingerprint)return;
 section.dataset.fingerprint=fingerprint;section.textContent="";
 const heading=document.createElement("h2");heading.textContent=label+" ("+records.length+")";
 heading.style.cssText="font-size:19px;margin:0 0 8px";
 const help=document.createElement("p");help.className="store-external-note";help.textContent=description;
 const grid=document.createElement("div");grid.className="store-grid";grid.style.marginTop="12px";
 for(const record of records){
  const card=document.createElement("article");card.className="store-card";
  const body=document.createElement("div");body.className="store-card-body";
  const title=document.createElement("h3");title.textContent=record.title;
  const subtitle=document.createElement("p");subtitle.style.cssText="font-size:11px;color:#aabbcc;margin:7px 0;";
  subtitle.textContent=record.files?record.files+" files · "+(record.bytes/1048576).toFixed(1)+" MB · stored on this device":"Single HTML file · stored on this device";
  const row=actions();
  row.append(button("Play locally",()=>openFn(record)));
  row.append(button("Remove",async()=>{
   if(!window.confirm("Remove "+record.title+" from this browser?"))return;
   try{await removeFn(record.id);await refresh();notify("Removed "+record.title)}
   catch(error){notify(error?.message||"Cannot remove game")}
  }));
  body.append(title,subtitle,row);card.append(body);grid.append(card);
 }
 section.append(heading,help,grid);
}
function enhance(){
 const root=document.querySelector(".store-main");if(!root)return;
 ensureTop(root);
 const genizyImported=installed.filter(record=>record.source==="genizymath-zip");
 let summary=root.querySelector("#lolite-genizy-import-summary");
 if(genizyImported.length){
  if(!summary){
   summary=document.createElement("p");summary.id="lolite-genizy-import-summary";summary.className="store-external-note";
   summary.style.cssText="padding:10px 12px;margin:12px 0;border:1px solid #394559;border-radius:9px;";
   root.querySelector(".store-top")?.after(summary);
  }
  summary.textContent=genizyImported.length+" GenizyMath HTML games installed on this device. Select a GenizyMath game and press Play to open its local HTML directly. Some games need internet for external assets; source-site iframe wrappers are excluded.";
 }else summary?.remove();
 buildSection(root,"lolite-local-package-section","Installed HTML Game Packages",
   "Local HTML games, including scripts, images and sounds. Play locally opens the actual HTML in this same browser tab, with no iframe or popup. Use your browser's Back button to return to Lolite.",
   installed.filter(record=>record.source!=="genizymath-zip"),openPackage,id=>packages.remove(id));
 buildSection(root,"lolite-saved-html-section","Saved Standalone HTML Games",
   "Older HTML imports will be migrated into direct-play local packages when launched. Multi-file games still require their complete ZIP or folder.",
   saved,openHtml,id=>storage.remove(id));
 enhanceGenizyCards(root);
}
function schedule(){
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;enhance()});
}
const observer=new MutationObserver(schedule);
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener("lolite-html-game-saved",refresh);
window.addEventListener("lolite-local-packages-changed",refresh);
refresh();schedule();
})();