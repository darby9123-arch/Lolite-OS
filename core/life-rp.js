/* Lolite Life RP: integrated city-roleplay app. Gameplay is isolated in its own iframe. */
(function(){
"use strict";
var appId="life-rp",title="Lolite Life RP";
var style=document.createElement("style");
style.textContent='.window[data-window-id="life-rp"]>.content{padding:0!important;height:calc(100% - 44px)!important;overflow:hidden!important}.window[data-window-id="life-rp"] iframe{display:block;border:0;width:100%;height:100%;background:#09111e}';
document.head.appendChild(style);
var priorPage=window.page;
window.page=function(id){return id===appId?'<iframe src="games/life-rp/index.html?v=online-2" title="Lolite Life RP" referrerpolicy="same-origin" allow="fullscreen"></iframe>':priorPage(id)};
var priorOpen=window.openApp;
window.openApp=function(id,name,w,h){return priorOpen(id,id===appId?title:name,id===appId?(w||1120):w,id===appId?(h||745):h)};
var priorIcons=window.renderIcons;
window.renderIcons=function(){
 if(typeof priorIcons==="function")priorIcons();
 var root=document.getElementById("icons");
 if(!root||root.querySelector('[data-life-rp-shortcut]'))return;
 var button=document.createElement("button");
 button.type="button";button.className="desktop-icon";
 button.dataset.lifeRpShortcut="1";button.setAttribute("aria-label",title);
 button.innerHTML=(window.LoliteIcons?window.LoliteIcons.tile(appId):"🏙️")+'<span>'+title+'</span>';
 button.addEventListener("click",function(){window.openApp(appId,title,1120,745)});
 root.appendChild(button);
};
window.LoliteLifeRP=Object.freeze({open:function(){window.openApp(appId,title,1120,745)}});

/* Origin and iframe source checked: no arbitrary URLs, HTML, or pack IDs accepted. */
var earnedGames={
 pong:{title:"Lolite Pong",path:"html games/lolite-pong.html"},
 "2048":{title:"Lolite 2048",path:"html games/lolite-2048.html"},
 sokoban:{title:"Lolite Sokoban",path:"html games/lolite-sokoban.html"}
};
var earnedWalls=new Set(["ocean-dawn","forest-mist","retro-sunset","cyber-grid","animated-solar","animated-galaxy"]);
var earnedCursors=new Set(["classic","glass","retro","neon"]);
window.addEventListener("message",function(event){
 if(event.origin!==location.origin||!event.data||event.data.type!=="lolite-life-rp")return;
 var frame=document.querySelector('.window[data-window-id="life-rp"] iframe');
 if(!frame||event.source!==frame.contentWindow)return;
 var kind=event.data.kind,value=event.data.value;
 if(typeof value!=="string")return;
 if(kind==="cursor"&&earnedCursors.has(value)){window.loliteSetCursorPack?.(value);return;}
 if(kind==="wallpaper"&&earnedWalls.has(value)){window.loliteWallpaper?.(value);return;}
 if(kind==="game"){
  if(value==="minecraft"){window.lolitePlayMinecraft?.();return;}
  var game=Object.prototype.hasOwnProperty.call(earnedGames,value)?earnedGames[value]:null;
  if(!game)return;
  var id="life-rp-game-"+value;
  window.openApp(id,game.title,900,700);
  var content=document.querySelector('.window[data-window-id="'+id+'"]>.content');
  if(content){
   content.style.cssText+=";padding:0!important;overflow:hidden!important";
   var iframe=document.createElement("iframe");
   iframe.title=game.title;
   iframe.src=game.path;
   iframe.referrerPolicy="same-origin";
   iframe.style.cssText="width:100%;height:100%;display:block;border:0;background:#090c12";
   content.replaceChildren(iframe);
  }
 }
});
})();
