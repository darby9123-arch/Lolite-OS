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
function playerWindow(id,title,render){
 if(typeof window.openApp!=="function"){notify("Window manager unavailable");return}
 window.openApp(id,title,1000,720);
 let attempts=0;
 function populate(){
  const root=window.state?.windows?.[id]?.el?.querySelector(".content")||
    (typeof state!=="undefined"?state.windows[id]?.el?.querySelector(".content"):null);
  if(!root){if(++attempts<45)setTimeout(populate,40);return}
  root.textContent="";
  const pane=document.createElement("div");pane.className="store-player";
  const head=document.createElement("div");head.className="store-player-head";
  const name=document.createElement("strong");name.textContent=title;
  const buttons=document.createElement("div");buttons.className="store-player-actions";
  buttons.append(button("Fullscreen",()=>pane.requestFullscreen?.()));
  head.append(name,buttons);
  const note=document.createElement("div");note.className="store-external-player-note";
  note.textContent="Game code runs in an isolated sandbox. Some games still require online services or unsupported browser features.";
  const frame=document.createElement("iframe");frame.className="store-frame";frame.title=title;
  frame.setAttribute("sandbox","allow-scripts allow-forms allow-pointer-lock allow-downloads");
  frame.setAttribute("allow","fullscreen; autoplay; gamepad; pointer-lock");
  frame.allowFullscreen=true;frame.tabIndex=0;
  render(frame,buttons);
  pane.append(head,note,frame);root.append(pane);
 }
 populate();
}
function openHtml(record){
 if(!record)return;
 const id="lolite-local-html-"+record.id;
 playerWindow(id,record.title||"HTML Game",(frame,controls)=>{
  frame.src=storage.blobUrl(record);
  if(record.sourceUrl)controls.append(button("Original website",()=>window.open(record.sourceUrl,"_blank","noopener,noreferrer")));
 });
}
function openPackage(record){
 if(!packages)return notify("Local package importer is unavailable");
 // The browser opens a top-level tab instead of rendering the game in an iframe.
 // The game service worker sends CSP sandbox headers on imported HTML, so it
 // cannot read Lolite's local storage or its connected account credentials.
 const tab=window.open("about:blank","_blank");
 if(!tab)return notify("Allow popups for Lolite to open this locally saved game.");
 try{
  tab.opener=null;
  tab.document.title="Loading local game";
  tab.document.body.textContent="Starting your local game…";
 }catch(_){}
 packages.launchUrl(record).then(url=>{
  if(!tab.closed)tab.location.replace(url);
 }).catch(error=>{
  try{if(!tab.closed)tab.close()}catch(_){}
  notify(error?.message||"Could not start locally installed game");
 });
}
// Game Store can prefer a locally installed package when the matching
// GenizyMath title's normal Play button is pressed.
window.LoliteInstalledGameByTitle=title=>{
 const key=titleKey(title);
 return key&&genizyTitles.has(key)?installed.find(game=>titleKey(game.title)===key)||null:null;
};
window.LoliteOpenInstalledGame=openPackage;
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
  const n=await storage.importFiles(files);
  notify(n?n+" standalone HTML file"+(n===1?"":"s")+" imported.":"No HTML files selected.");
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
 const localBtn=button("My local games",()=>{
  const section=root.querySelector("#lolite-local-package-section")||root.querySelector("#lolite-saved-html-section");
  if(section)section.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});
  else notify("Import an HTML file, game ZIP or folder first.");
 });
 localBtn.style.flex="0 0 auto";
 top.append(zipBtn,zipInput,folderBtn,folderInput,localBtn);
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
  if(installedGame)controls.append(button("Play installed (no embed)",()=>openPackage(installedGame)));
  const input=fileInput(".zip,application/zip",async files=>{
   if(!files.length)return;
   const record=await packages.importZip(files[0],title);
   notify(record.title+" installed locally ("+record.files+" files). Use Play installed to run without an iframe.");
  });
  const install=button(installedGame?"Replace local ZIP":"Install game ZIP",()=>input.click());
  controls.append(install,input);body.append(controls);
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
 buildSection(root,"lolite-local-package-section","Installed HTML Game Packages",
   "Complete local HTML game packages, including scripts, images and sounds. Play locally opens in a separate tab without an iframe. Only import games you are authorised to use.",
   installed,openPackage,id=>packages.remove(id));
 buildSection(root,"lolite-saved-html-section","Saved Standalone HTML Games",
   "These are full HTML documents saved in this browser. Games that need additional assets should be imported as a complete ZIP or folder instead.",
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