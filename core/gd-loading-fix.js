/* Geometry Dash launcher: never interrupt Play with an unexpected OS file picker.
 * Prefer the user's installed Geometry Dash source HTML; otherwise open the
 * included Geometry Dash webport.
 */
(()=>{
 'use strict';
 const gdFile='genizy-868.html';
 const gdTitle='Geometry Dash';
 const notify=message=>typeof window.toast==='function'?window.toast(message):console.info(message);
 let launching=false;
 const packages=()=>window.LoliteLocalGamePackages;
 async function playGD(){
  if(launching)return;
  launching=true;
  try{
   const list=await packages()?.list?.()||[];
   const installed=list.find(record=>record.title===gdTitle&&record.source==='genizymath-user-zip');
   if(installed){
    const url=await packages().launchUrl(installed);
    if(!window.LoliteGamePlayer?.open({title:gdTitle,url,file:gdFile,source:'Your installed Geometry Dash HTML'}))
     throw new Error('Could not start installed Geometry Dash.');
    return;
   }
   // This browser webport is present in the Lolite repository.
   // It uses an upstream CDN for its additional game resources.
   notify('Original Geometry Dash is not installed. Opening Geometry Dash Full instead.');
   if(!window.LoliteGamePlayer?.open({
     title:'Geometry Dash Full',
     file:'Geometry Dash webport.html',
     url:'html%20games/Geometry%20Dash%20webport.html?v=gd-gamepad-policy-fix-20261110',
     source:'Lolite OS · included HTML game'
   }))throw new Error('Could not start Geometry Dash Full.');
  }catch(error){
   console.warn('Geometry Dash launch issue',error);
   notify(error?.message||'Geometry Dash could not start.');
  }finally{launching=false}
 }
 function patchPlay(){
  const original=window.loliteStorePlay;
  if(typeof original!=='function'||original.gdLocalZipFix)return;
  function patched(file){
   if(file===gdFile && !window.loliteStoreSelectedIndex?.(file)){void playGD();return}
   return original.apply(this,arguments);
  }
  patched.gdLocalZipFix=true;
  window.loliteStorePlay=patched;
 }
 function addControls(){
  document.querySelectorAll('.store-card').forEach(card=>{
   const heading=card.querySelector('.store-card-body h3');
   if(heading?.textContent?.trim()!==gdTitle)return;
   const play=card.querySelector('.store-card-actions .store-play');
   if(play)play.title='Launch installed Geometry Dash or play the included Geometry Dash Full webport';
  });
 }
 function init(){
  patchPlay();addControls();
  new MutationObserver(()=>{patchPlay();addControls()}).observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();