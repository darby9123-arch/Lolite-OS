/* Lolite local HTML games — import files you own or may redistribute.
 * HTML files and full ZIP/folder packages stay in this device's browser storage.
 * External catalogue links are NOT automatically downloaded or mirrored.
 */
(()=>{
"use strict";
const storage=window.LoliteHTMLGameFiles,packages=window.LoliteLocalGamePackages;
if(!storage)return;
const titleKey=value=>String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]/g,"");
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
 notify("Opening "+(record.title||"local game")+" inside Lolite…");
 packages.launchUrl(record).then(url=>{
  if(!window.LoliteGamePlayer?.open({title:record.title||"Local game",url,file:window.loliteStoreFileForTitle?.(record.title)||"local-"+record.id,source:"Installed HTML"}))notify("Could not open this HTML game inside Lolite.");
 }).catch(error=>notify(error?.message||"Could not start the installed game"));
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
 const collectionInput=fileInput(".zip,application/zip",async files=>{
  if(!files.length)return;
  if(typeof packages.importGamefilesZip!=="function")throw new Error("Game collection importer is unavailable");
  collectionBtn.disabled=true;collectionBtn.textContent="Reading game collection…";
  try{
   const result=await packages.importGamefilesZip(files[0],status=>{collectionBtn.textContent=status});
   notify("Added "+result.imported+" HTML games from gamefiles.zip to the Lolite Game Store.");
  }finally{collectionBtn.disabled=false;collectionBtn.textContent="Import gamefiles.zip"}
 });
 const collectionBtn=button("Import gamefiles.zip",()=>collectionInput.click());
  window.LoliteChooseGamefilesZip=()=>collectionInput.click();
 const removeCollectionBtn=button("Remove gamefiles.zip",async()=>{
  if(!window.confirm("Remove the imported gamefiles.zip collection from this device?"))return;
  try{const count=await packages.removeGamefilesZip();notify("Removed "+count+" games.");await refresh()}
  catch(error){notify(error?.message||"Could not remove the game collection")}
 });
 const tools=document.createElement("details");tools.className="store-import-tools";
 const summary=document.createElement("summary");summary.textContent="Import games";
 tools.append(summary,collectionBtn,collectionInput,removeCollectionBtn,htmlBtn,htmlInput,zipBtn,zipInput,folderBtn,folderInput);
 top.append(tools);
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
  const controls=document.createElement("div");controls.className="store-card-actions";
  const play=button("▶ Play",()=>openFn(record));play.style.width="100%";
  const server=document.createElement("span");server.className="store-local-server";server.textContent="Server · Installed HTML";
  controls.append(play,server);
  const manage=document.createElement("details");manage.className="store-local-manage";
  const summary=document.createElement("summary");summary.textContent="Manage installation";
  const remove=button("Remove game",async()=>{
   if(!window.confirm("Remove "+record.title+" from this browser?"))return;
   try{await removeFn(record.id);await refresh();notify("Removed "+record.title)}
   catch(error){notify(error?.message||"Cannot remove game")}
  });
  manage.append(summary,remove);
  body.append(title,controls,manage);card.append(body);grid.append(card);
 }
 section.append(heading,help,grid);
}
function enhance(){
 const root=document.querySelector(".store-main");if(!root)return;
 ensureTop(root);
 // Installed packages remain playable from their normal Game Store cards, without a separate listing.
 root.querySelector("#lolite-local-package-section")?.remove();
 buildSection(root,"lolite-saved-html-section","Saved Standalone HTML Games",
   "Older HTML imports will be migrated into direct-play local packages when launched. Multi-file games still require their complete ZIP or folder.",
   saved,openHtml,id=>storage.remove(id));

 // Game tiles keep only Play and Server; import tools live above the grid.
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