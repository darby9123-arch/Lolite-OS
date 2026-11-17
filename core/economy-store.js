/* Lolite OS storefront compatibility.
 * All Lolite apps and games are free: no wallet, prices, purchases or
 * entitlement checks. Existing Life RP and saved app data are left untouched.
 */
(function(){
"use strict";
const INSTALLED="loliteInstalledApps",RP_SAVE="lolite-life-rp-v1";
const APP_IDS=["sandstone","music","feature-requests","clips","focus","arcade",
 "lolite-quests","life-rp","academy","lowlight-ai","chatroom","notes","calculator",
 "paint","wallpaper-editor"];
const idFor=app=>typeof app==="string"?app:app?.id;
const hasApp=app=>typeof idFor(app)==="string"&&idFor(app).length>0;
const hasGame=game=>!!game&&typeof game.file==="string"&&game.file.length>0;
const grant=(valid)=>valid
 ? {ok:true,alreadyOwned:true,spent:0}
 : {ok:false,reason:"Unknown app or game."};
const legacyPurchased=(type)=>{
 try{
  const data=JSON.parse(localStorage.getItem(RP_SAVE)||"null");
  const purchases=data?.extras?.storePurchases?.[type];
  return Array.isArray(purchases)?purchases.filter(x=>typeof x==="string"):[];
 }catch{return []}
};
window.LoliteEconomy=Object.freeze({
 gamePrice:()=>0,appPrice:()=>0,hasApp,hasGame,
 buyGame:game=>grant(hasGame(game)),buyApp:app=>grant(hasApp(app)),
 purchasedGames:()=>legacyPurchased("games"),
 purchasedApps:()=>legacyPurchased("apps"),
 ownedGameCount:()=>legacyPurchased("games").length,
 freeApps:APP_IDS.slice()
});
// Do not migrate, reset, or charge users' legacy wallet/RP saves.
// The separate Life RP game retains its own in-game progression.
})();
