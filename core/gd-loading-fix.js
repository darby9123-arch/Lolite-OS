/* Geometry Dash compatibility patch: original-source top-level launch, not isolated local HTML. */
(()=>{
"use strict";
const gdFile="genizy-868.html";
const sourceUrl="https://genizymath.github.io/iframe/868-F3.html";
const demoUrl="https://geometrydash.com/game/index.html";
function patchPlay(){
 const previous=window.loliteStorePlay;
 if(typeof previous!=="function"||previous.gdSourceFix)return;
 const patched=function(file){
  // Ignore any previously cached, isolated Geometry Dash HTML. The original
  // web port needs its own origin for its externally hosted runtime resources.
  if(file===gdFile){window.location.assign(sourceUrl);return}
  return previous.apply(this,arguments);
 };
 patched.gdSourceFix=true;
 window.loliteStorePlay=patched;
}
function addDemoButtons(){
 document.querySelectorAll(".store-card").forEach(card=>{
  const name=card.querySelector(".store-card-body h3")?.textContent?.trim();
  if(name!=="Geometry Dash"||card.querySelector(".gd-official-demo"))return;
  const body=card.querySelector(".store-card-body");if(!body)return;
  const note=document.createElement("p");
  note.className="store-external-note";
  note.textContent="The web port opens at its source to avoid Lolite's isolated loader. If it fails, try RobTop's official one-level demo:";
  const button=document.createElement("button");
  button.type="button";button.className="store-play gd-official-demo";
  button.style.marginTop="8px";
  button.textContent="Play official GD demo (Stereo Madness)";
  button.addEventListener("click",()=>window.location.assign(demoUrl));
  body.append(note,button);
 });
}
function init(){
 patchPlay();addDemoButtons();
 const observer=new MutationObserver(()=>{patchPlay();addDemoButtons()});
 observer.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();
