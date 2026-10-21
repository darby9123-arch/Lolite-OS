/* HTML game import integration for Lolite's modern Game Library.
 * Files are saved in the user's browser. No third-party source is republished in this repository.
 */
(()=>{
 "use strict";
 const storage=window.LoliteHTMLGameFiles;
 if(!storage)return;
 const catalog=Array.isArray(window.LoliteGenizyCatalog)?window.LoliteGenizyCatalog:[];
 const key=text=>String(text||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]/g,"");
 const sourceByTitle=new Map(catalog.map(entry=>[key(entry.title),entry]));
 let saved=[],scheduled=false,loading=false;
 const notify=msg=>typeof window.toast==="function"?window.toast(msg):console.info(msg);
 function button(label,action){
   const b=document.createElement("button");
   b.type="button";b.textContent=label;b.className="store-play";
   b.style.cssText="width:auto;min-width:92px;flex:1;padding:7px 9px;font-size:11px;";
   b.addEventListener("click",action);
   return b;
 }
 const actions=()=>{const d=document.createElement("div");d.className="lolite-html-game-actions";d.style.cssText="display:flex;flex-wrap:wrap;gap:6px;margin-top:9px;";return d};
 const recordFor=entry=>saved.find(item=>item.id==="gn-"+entry.id);
 async function refresh(){
   if(loading)return;
   loading=true;
   try{saved=await storage.list()}catch(error){console.warn("Saved HTML game list unavailable",error);saved=[]}
   finally{loading=false}
   schedule();
 }
 async function downloadHTML(entry,buttonEl){
   if(!entry||!/^iframe\/[a-zA-Z0-9_.-]+\.html$/.test(entry.path))return;
   if(buttonEl){buttonEl.disabled=true;buttonEl.textContent="Saving…"}
   try{
     const source="https://cdn.jsdelivr.net/gh/genizymath/genizymath.github.io@main/"+entry.path;
     const result=await fetch(source,{cache:"no-store"});
     if(!result.ok)throw new Error("Source HTML unavailable (HTTP "+result.status+")");
     const declared=Number(result.headers.get("content-length")||0);
     if(declared>14*1024*1024)throw new Error("The HTML file is too big to save safely in browser storage.");
     const html=await result.text();
     if(!/<(?:html|script|canvas|body|iframe|div)\b/i.test(html))throw new Error("The downloaded file does not look like an HTML game.");
     await storage.save("gn-"+entry.id,entry.title,html,"https://genizymath.github.io/"+entry.path);
     notify(entry.title+" HTML saved inside Lolite on this browser.");
     await refresh();
   }catch(error){notify(error?.message||"Couldn't save the HTML file");console.warn(error)}
   finally{if(buttonEl){buttonEl.disabled=false;buttonEl.textContent="Save HTML"}}
 }
 function openLocal(record){
   if(!record)return;
   const id="lolite-local-html-"+record.id;
   const title=String(record.title||"HTML Game").slice(0,85);
   if(typeof window.openApp!=="function"){notify("Window manager is unavailable");return}
   window.openApp(id,title,1000,720);
   let retry=0;
   const populate=()=>{
     const root=state.windows[id]?.el.querySelector(".content");
     if(!root){if(++retry<35)setTimeout(populate,30);return}
     root.textContent="";
     const pane=document.createElement("div");pane.className="store-player";
     const head=document.createElement("div");head.className="store-player-head";
     const strong=document.createElement("strong");strong.textContent=title;
     const controls=document.createElement("div");controls.className="store-player-actions";
     controls.append(button("Fullscreen",()=>pane.requestFullscreen?.()));
     if(record.sourceUrl){
       const online=button("Play online",()=>window.open(record.sourceUrl,"_blank","noopener,noreferrer"));
       controls.append(online);
     }
     head.append(strong,controls);
     const note=document.createElement("div");note.className="store-external-player-note";
     note.textContent="Saved HTML runs in a sandbox. Some games still need online assets or browser permissions.";
     const iframe=document.createElement("iframe");iframe.className="store-frame";iframe.title=title;
     iframe.setAttribute("sandbox","allow-scripts allow-forms allow-pointer-lock allow-downloads");
     iframe.setAttribute("allow","fullscreen; autoplay; gamepad; pointer-lock");
     iframe.allowFullscreen=true;iframe.tabIndex=0;
     iframe.src=storage.blobUrl(record);
     pane.append(head,note,iframe);
     root.append(pane);
   };
   populate();
 }
 function ensureTop(root){
   const top=root.querySelector(".store-top");
   if(!top||top.querySelector(".lolite-html-import"))return;
   const control=button("Import HTML",()=>input.click());control.classList.add("lolite-html-import");control.style.flex="0 0 auto";
   const input=document.createElement("input");input.type="file";input.accept=".html,.htm,text/html";input.multiple=true;input.hidden=true;
   input.addEventListener("change",async()=>{
     try{const n=await storage.importFiles(input.files);notify(n+" HTML file"+(n===1?"":"s")+" imported into Lolite.");await refresh()}
     catch(error){notify(error?.message||"Import failed")}finally{input.value=""}
   });
   top.append(control,input);
 }
 function enhanceCards(root){
   root.querySelectorAll(".store-card").forEach(card=>{
     if(card.dataset.htmlEnhanced==="1")return;
     card.dataset.htmlEnhanced="1";
     const title=card.querySelector(".store-card-body h3")?.textContent;
     const entry=sourceByTitle.get(key(title));if(!entry)return;
     const body=card.querySelector(".store-card-body");if(!body)return;
     const group=actions();
     const save=button(recordFor(entry)?"Replace saved HTML":"Save HTML",()=>downloadHTML(entry,save));
     group.append(save);
     const savedRecord=recordFor(entry);
     if(savedRecord)group.append(button("Play saved HTML",()=>openLocal(savedRecord)));
     body.append(group);
   });
 }
 function ensureSaved(root){
   let section=root.querySelector("#lolite-saved-html-section");
   if(!saved.length){section?.remove();return}
   if(!section){
     section=document.createElement("section");section.id="lolite-saved-html-section";section.className="store-section";
     section.style.marginTop="25px";root.append(section);
   }
   const fingerprint=saved.map(x=>x.id+":"+x.savedAt).join("|");
   if(section.dataset.fingerprint===fingerprint)return;
   section.dataset.fingerprint=fingerprint;
   section.textContent="";
   const title=document.createElement("h2");title.textContent="Saved HTML Files ("+saved.length+")";title.style.cssText="font-size:18px;margin:0 0 8px";
   const description=document.createElement("p");description.textContent="Actual HTML saved in this browser, not copied into the public GitHub repository. Some games still need online assets.";
   description.className="store-external-note";
   const grid=document.createElement("div");grid.className="store-grid";grid.style.marginTop="12px";
   for(const record of saved){
     const card=document.createElement("article");card.className="store-card";
     const body=document.createElement("div");body.className="store-card-body";
     const heading=document.createElement("h3");heading.textContent=record.title;
     const row=actions();
     row.append(button("Play saved",()=>openLocal(record)));
     row.append(button("Remove",async()=>{await storage.remove(record.id);await refresh()}));
     body.append(heading,row);card.append(body);grid.append(card);
   }
   section.append(title,description,grid);
 }
 function enhance(){
   const root=document.querySelector(".store-main");if(!root)return;
   ensureTop(root);enhanceCards(root);ensureSaved(root);
 }
 function schedule(){
   if(scheduled)return;scheduled=true;
   requestAnimationFrame(()=>{scheduled=false;enhance()});
 }
 const observer=new MutationObserver(schedule);
 observer.observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener("lolite-html-game-saved",refresh);
 refresh();schedule();
})();
