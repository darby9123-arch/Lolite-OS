/* Lolite Dollars checkout: one virtual wallet for the actual Game Store and App Store.
   Browser-local game progression, not a real-money checkout or server-side DRM. */
(function(){
"use strict";
var SAVE="lolite-life-rp-v1",INSTALLED="loliteInstalledApps";
var FREE_GAMES=new Set(["lolite-pong.html","lolite-2048.html","lolite-sokoban.html"]);
var FREE_APPS=new Set(["life-rp","lolite-quests","academy","chatroom","notes"]);
var APP_PRICES=Object.freeze({calculator:180,paint:620,"wallpaper-editor":1450,"lowlight-ai":1800});
var PRIOR_GAME=Object.freeze({"lolite-pong.html":"game-pong","lolite-2048.html":"game-2048","lolite-sokoban.html":"game-sokoban","clminecraftpocketedition.html":"game-minecraft"});
function read(){
 try{var v=JSON.parse(localStorage.getItem(SAVE)||"null");if(v&&typeof v==="object"&&!Array.isArray(v)){
  v.cash=Number.isFinite(v.cash)?Math.max(0,Math.floor(v.cash)):250;
  v.extras=v.extras&&typeof v.extras==="object"&&!Array.isArray(v.extras)?v.extras:{};
  v.history=Array.isArray(v.history)?v.history:[];return v
 }}catch(e){}
 return {name:"New Resident",cash:250,history:[],extras:{}};
}
function storeState(s){
 var e=s.extras;
 if(!e.storePurchases||typeof e.storePurchases!=="object"||Array.isArray(e.storePurchases))e.storePurchases={};
 var p=e.storePurchases;
 p.games=Array.isArray(p.games)?p.games.filter(x=>typeof x==="string"):[];
 p.apps=Array.isArray(p.apps)?p.apps.filter(x=>typeof x==="string"):[];
 if(p.installedMigrated!==true){
  try{var old=JSON.parse(localStorage.getItem(INSTALLED)||"[]");if(Array.isArray(old)){
   old.forEach(id=>{if(typeof id==="string"&&!p.apps.includes(id))p.apps.push(id)})
  }}catch(e){}
  p.installedMigrated=true;
 }
 return p
}
function write(s){
 try{
  localStorage.setItem(SAVE,JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("lolite-wallet-updated",{detail:{balance:s.cash}}));
  window.dispatchEvent(new CustomEvent("lolite-store-purchase",{detail:{balance:s.cash}}));
  return true
 }catch(e){return false}
}
function initialize(){var s=read(),p=storeState(s);if(p.installedMigrated)write(s)}
function balance(){return read().cash}
function money(n){return "$"+Math.max(0,Math.floor(n||0)).toLocaleString("en-AU")}
function gamePrice(g){
 if(!g||typeof g.file!=="string")return 0;
 if(FREE_GAMES.has(g.file))return 0;
 if(g.file==="clminecraftpocketedition.html")return 3500;
 var name=(g.file+" "+(g.title||"")).toLowerCase();
 if(/gta|grand theft|half.life|rocket.league|fnaf|five.nights|geometry.dash|super.mario|mario.64/.test(name))return 1950;
 if(/baldi|pvz|plants.vs|angry.birds|granny|grow.a.garden|slope|subway|roblox|pixel.battle/.test(name))return 1200;
 var categories={"Horror":950,"Racing":760,"Simulation & Sandbox":850,"Platformers & Arcade":630,"Sports":570,"Puzzle":420,"IO & Casual":350,"Classics":300,"Baldi’s Basics":1100};
 var base=categories[g.category]||500,hash=0;
 for(var i=0;i<g.file.length;i++)hash=(Math.imul(hash,33)+g.file.charCodeAt(i))>>>0;
 return Math.round((base+(hash%7)*65)/10)*10;
}
function appPrice(app){
 var id=typeof app==="string"?app:app?.id;
 if(!id||FREE_APPS.has(id))return 0;
 return Object.prototype.hasOwnProperty.call(APP_PRICES,id)?APP_PRICES[id]:500;
}
function hasGame(g){
 if(!g||typeof g.file!=="string")return false;
 if(gamePrice(g)===0)return true;
 var s=read(),p=storeState(s);
 if(p.games.includes(g.file))return true;
 var prior=PRIOR_GAME[g.file];
 return !!prior&&Array.isArray(s.extras.owned)&&s.extras.owned.includes(prior);
}
function hasApp(app){
 var id=typeof app==="string"?app:app?.id;
 if(!id)return false;
 if(appPrice(id)===0)return true;
 var s=read(),p=storeState(s);return p.apps.includes(id);
}
function buy(type,thing){
 var key=type==="game"?thing?.file:(typeof thing==="string"?thing:thing?.id);
 if(!key||typeof key!=="string"||key.length>180)return {ok:false,reason:"Unknown item."};
 var cost=type==="game"?gamePrice(thing):appPrice(key);
 if(type==="game"&&!thing?.title)return {ok:false,reason:"Unknown game."};
 if(type==="app"&&!Object.prototype.hasOwnProperty.call(APP_PRICES,key)&&!FREE_APPS.has(key))return {ok:false,reason:"Unknown app."};
 if((type==="game"?hasGame(thing):hasApp(key)))return {ok:true,alreadyOwned:true,spent:0,balance:balance()};
 var s=read(),p=storeState(s),list=type==="game"?p.games:p.apps;
 if(list.includes(key))return {ok:true,alreadyOwned:true,spent:0,balance:s.cash};
 if(s.cash<cost)return {ok:false,reason:"Not enough Lolite Dollars. You need "+money(cost-s.cash)+" more.",shortfall:cost-s.cash};
 s.cash-=cost;list.push(key);
 var label=type==="game"?"Game Store: "+thing.title:"App Store: "+key;
 s.history.unshift({label:label,delta:-cost,date:new Date().toLocaleDateString("en-AU")});s.history=s.history.slice(0,15);
 if(!write(s))return {ok:false,reason:"Could not save the purchase. Nothing was charged."};
 return {ok:true,alreadyOwned:false,spent:cost,balance:s.cash}
}
function ownedGameCount(){var s=read();return storeState(s).games.length}
function purchasedGames(){var s=read();return storeState(s).games.slice()}
function purchasedApps(){var s=read();return storeState(s).apps.slice()}
var economy=Object.freeze({balance:balance,money:money,gamePrice:gamePrice,appPrice:appPrice,hasGame:hasGame,hasApp:hasApp,buyGame:g=>buy("game",g),buyApp:id=>buy("app",id),purchasedGames:purchasedGames,purchasedApps:purchasedApps,ownedGameCount:ownedGameCount,freeApps:Array.from(FREE_APPS)});
window.LoliteEconomy=economy;
initialize();
})();
