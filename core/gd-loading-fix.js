/* Geometry Dash: use a real HTML game from the user's original ZIP.
 * No redirect to GenizyMath, no third-party HTML redistributed by Lolite.
 */
(()=>{
"use strict";
const gdFile="genizy-868.html";
const gdTitle="Geometry Dash";
const gdPath="iframe/868-F3.html";
let importInProgress=false;
let zipInput;
const notify=message=>typeof window.toast==="function"?window.toast(message):console.info(message);
function gamePackages(){return window.LoliteLocalGamePackages}
function importedGD(records){
 return records.find(record=>record.title===gdTitle&&record.source==="genizymath-user-zip")||null;
}
async function openGD(record){
 const packages=gamePackages();
 if(!packages)throw new Error("Lolite local game launcher is unavailable");
 notify("Launching Geometry Dash from your installed HTML…");
 const url=await packages.launchUrl(record);
 window.location.assign(url);
}
async function importGDFile(file){
 if(importInProgress||!file)return;
 importInProgress=true;
 try{
  const packages=gamePackages();
  if(!packages)throw new Error("The local game importer has not loaded");
  if(!/\.zip$/i.test(file.name))throw new Error("Select the original genizymath.github.io-main.zip");
  notify("Installing Geometry Dash HTML from your ZIP…");
  const record=await packages.importGenizyGameFromZip(file,gdPath,gdTitle);
  // Do not delete the other titles or a prior install if the ZIP import fails.
  const all=await packages.list();
  const older=all.filter(item=>item.id!==record.id&&item.title===gdTitle&&item.source==="genizymath-user-zip");
  for(const item of older)await packages.remove(item.id);
  await openGD(record);
 }catch(error){
  console.warn("Could not install Geometry Dash from the selected ZIP",error);
  notify(error?.message||"Could not install Geometry Dash from that ZIP");
 }finally{importInProgress=false}
}
function chooseZip(){
 if(!zipInput){
  zipInput=document.createElement("input");
  zipInput.type="file";zipInput.accept=".zip,application/zip";zipInput.hidden=true;
  zipInput.setAttribute("aria-label","Select the original GenizyMath source ZIP containing Geometry Dash");
  zipInput.addEventListener("change",()=>{
   const file=zipInput.files?.[0];
   zipInput.value="";
   if(file)void importGDFile(file);
  });
  document.body.append(zipInput);
 }
 zipInput.click();
}
async function playGD(){
 if(importInProgress)return;
 try{
  const installed=await gamePackages()?.list();
  const current=importedGD(installed||[]);
  if(current){await openGD(current);return}
 }catch(error){console.warn("Could not check installed Geometry Dash files",error)}
 notify("Choose the GenizyMath ZIP to play the real Geometry Dash HTML locally.");
 chooseZip();
}
function patchPlay(){
 const original=window.loliteStorePlay;
 if(typeof original!=="function"||original.gdLocalZipFix)return;
 function patched(file){
  if(file===gdFile){void playGD();return}
  return original.apply(this,arguments);
 }
 patched.gdLocalZipFix=true;
 window.loliteStorePlay=patched;
}
function addControls(){
 for(const card of document.querySelectorAll(".store-card")){
  if(card.querySelector(".gd-use-local-zip"))continue;
  const heading=card.querySelector(".store-card-body h3");
  if(heading?.textContent?.trim()!==gdTitle)continue;
  const body=card.querySelector(".store-card-body");
  if(!body)continue;
  const note=document.createElement("p");
  note.className="store-external-note";
  note.textContent="Runs the HTML from your GenizyMath source ZIP on this device. No redirect or embed. Internet may still be needed for game assets.";
  const select=document.createElement("button");
  select.type="button";select.className="store-play gd-use-local-zip";
  select.style.marginTop="8px";
  select.textContent="Install / replace Geometry Dash from ZIP";
  select.addEventListener("click",chooseZip);
  body.append(note,select);
  // Ensure the default Play button accurately describes the action.
  const play=body.querySelector(".store-play:not(.gd-use-local-zip)");
  if(play){play.title="Play your installed local Geometry Dash HTML, or select a source ZIP to install it";play.childNodes[0]&&(play.childNodes[0].textContent="Play local Geometry Dash ")}
 }
}
function init(){
 patchPlay();addControls();
 new MutationObserver(()=>{patchPlay();addControls()}).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();
