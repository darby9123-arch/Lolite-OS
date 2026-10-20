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
})();
