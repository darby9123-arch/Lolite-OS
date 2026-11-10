/* Taskbar source acknowledgements for external game listings.
   Credits identify providers and creators; they are not redistribution licences. */
(()=>{
 "use strict";
 const button=document.getElementById("loliteCreditsButton");
 if(!button)return;
 const links=[
  {label:"DAKNUX",url:"https://github.com/daknux",description:"Alternate game listings and cover resources"}
 ];
 const style=document.createElement("style");
 style.textContent=`
 #loliteCreditsButton{display:grid;place-items:center;flex:none;width:32px;min-width:32px;height:32px;padding:0!important;border:1px solid transparent!important;border-radius:9px!important;background:transparent!important;color:#c0ccda!important;font:700 19px/1 system-ui,sans-serif!important;cursor:pointer;transition:background .12s,border-color .12s}
 #loliteCreditsButton:hover,#loliteCreditsButton[aria-expanded="true"]{background:#283241!important;border-color:#52637a!important;color:#fff!important}
 #loliteCreditsButton:focus-visible{outline:2px solid #af9aff;outline-offset:2px}
 .lolite-credits-panel{position:fixed;bottom:78px;right:16px;z-index:100030;width:min(355px,calc(100vw - 24px));max-height:min(560px,calc(100dvh - 95px));overflow:auto;padding:18px;background:#141b27;border:1px solid #39485d;border-radius:13px;box-shadow:0 20px 65px #000a;color:#edf2fa;font:13px/1.55 system-ui,sans-serif}
 .lolite-credits-panel[hidden]{display:none}
 .lolite-credits-panel h2{font-size:17px;letter-spacing:-.25px;margin:0 0 4px}
 .lolite-credits-panel p{margin:0 0 12px;color:#aebbd0}
 .lolite-credits-panel .credits-head{display:flex;align-items:start;justify-content:space-between;gap:14px}
 .lolite-credits-panel .credits-close{padding:4px 8px;background:transparent;border:1px solid #37465a;border-radius:6px;color:#c8d3e3;cursor:pointer}
 .lolite-credits-panel .credits-source{display:block;padding:10px 0;border-top:1px solid #2b3445}
 .lolite-credits-panel .credits-source a{color:#b6a9ff;text-decoration:underline;text-underline-offset:3px;font-weight:700}
 .lolite-credits-panel .credits-source small{display:block;margin-top:2px;color:#92a1b6}
 .lolite-credits-panel .credits-foot{margin:10px 0 0;padding-top:12px;border-top:1px solid #2b3445;font-size:11px;color:#9cabc0}
 @media(max-width:480px){.lolite-credits-panel{right:12px;bottom:75px}}
 `;
 document.head.appendChild(style);
 const panel=document.createElement("section");
 panel.id="loliteCreditsPanel";
 panel.className="lolite-credits-panel";
 panel.hidden=true;
 panel.tabIndex=-1;
 panel.setAttribute("role","dialog");
 panel.setAttribute("aria-label","Game source credits");
 panel.innerHTML='<div class="credits-head"><div><h2>Game credits</h2><p>Thanks to the people and projects behind the listed game collection.</p></div><button class="credits-close" type="button" aria-label="Close credits">✕</button></div>';
 for(const item of links){
  const section=document.createElement("div");section.className="credits-source";
  const a=document.createElement("a");a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=item.label+" ↗";
  const note=document.createElement("small");note.textContent=item.description;
  section.append(a,note);panel.append(section);
 }
 const foot=document.createElement("p");foot.className="credits-foot";
 foot.textContent="Game rights belong to their respective developers. Listing a source does not imply affiliation or grant redistribution rights. Local game packages are supplied by the user.";
 panel.append(foot);
 document.body.append(panel);
 button.setAttribute("aria-controls",panel.id);
 button.setAttribute("aria-expanded","false");
 const toggle=open=>{
  panel.hidden=!open;button.setAttribute("aria-expanded",String(open));
  if(open)panel.focus({preventScroll:true});else button.focus({preventScroll:true});
 };
 button.addEventListener("click",()=>toggle(panel.hidden));
 panel.querySelector(".credits-close").addEventListener("click",()=>toggle(false));
 document.addEventListener("pointerdown",event=>{
  if(!panel.hidden&&!panel.contains(event.target)&&!button.contains(event.target)){
   panel.hidden=true;button.setAttribute("aria-expanded","false");
  }
 });
 document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&!panel.hidden){event.preventDefault();toggle(false)}
 });
})();
