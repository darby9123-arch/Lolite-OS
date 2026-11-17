/* Lolite Quests — free achievements, Academy milestones and real app usage. */
(function(){
"use strict";
const RP="lolite-life-rp-v1",USAGE="lolite-quests-active-v1",FOCUS="lolite-focus-board-v1";
const esc=x=>String(x??"").replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
const tasks=[
{id:"notes",name:"Thoughtful Notes",app:"notes",seconds:120,clicks:4,reward:220,desc:"Actively use Quick Notes for 2 minutes."},
{id:"paint",name:"Creative Practice",app:"paint",seconds:180,clicks:5,reward:340,desc:"Draw and work in Lolite Paint for 3 minutes."},
{id:"files",name:"File Explorer",app:"files",seconds:120,clicks:4,reward:220,desc:"Explore Files for 2 active minutes."},
{id:"academy",name:"Learning Session",app:"academy",seconds:120,clicks:3,reward:300,desc:"Use Lolite Academy for 2 active minutes."},
{id:"games",name:"Browse the Games",app:"games",seconds:120,clicks:4,reward:220,desc:"Explore the Game Store for 2 active minutes."},
{id:"settings",name:"Personalise Your OS",app:"settings",seconds:90,clicks:3,reward:175,desc:"Interact with Settings for 90 active seconds."},
{id:"appstore",name:"Find an App",app:"appstore",seconds:90,clicks:3,reward:175,desc:"Explore the App Store for 90 active seconds."}
];
const milestones=[
{id:"three",name:"New Learner",metric:"lessons",need:3,reward:240},
{id:"eight",name:"Dedicated Student",metric:"lessons",need:8,reward:500},
{id:"fifteen",name:"Lolite Scholar",metric:"lessons",need:15,reward:850},
{id:"graduate",name:"Course Graduate",metric:"courses",need:1,reward:500}
];
const goods=[
{id:"game-pong",name:"Pong Shortcut",type:"game",value:"pong",desc:"Launcher shortcut to Lolite Pong."},
{id:"game-2048",name:"2048 Shortcut",type:"game",value:"2048",desc:"Shortcut to Lolite 2048."},
{id:"game-sokoban",name:"Sokoban Shortcut",type:"game",value:"sokoban",desc:"Shortcut to Lolite Sokoban."},
{id:"game-minecraft",name:"Minecraft 1.8 Shortcut",type:"game",value:"minecraft",desc:"Shortcut to existing Lolite launcher, not an official Minecraft licence."},
{id:"theme-ocean",name:"Ocean Theme",type:"wallpaper",value:"ocean-dawn",desc:"Ocean RP theme and matching desktop wallpaper."},
{id:"theme-forest",name:"Forest Theme",type:"wallpaper",value:"forest-mist",desc:"Forest RP theme and matching wallpaper."},
{id:"cursor-glass",name:"Glass Cursor",type:"cursor",value:"glass",desc:"Lolite OS Glass cursor pack."},
{id:"cursor-neon",name:"Neon Cursor",type:"cursor",value:"neon",desc:"Lolite OS Neon cursor pack."},
{id:"focus",name:"Lolite Focus Board",type:"app",desc:"An actual personal task and project planning mini app."},
{id:"arcade",name:"Arcade Shelf",type:"app",desc:"A free hub for your game shortcuts."},
{id:"plus",name:"Lolite Plus",type:"member",desc:"Activate the in-game Plus perk for free."},
{id:"pro",name:"Lolite Pro",type:"member",desc:"Activate the in-game Pro perk for free, including Plus extras."}
];
let tab="quests",alertMessage="",usage={apps:{}},activity={};
try{const raw=JSON.parse(localStorage.getItem(USAGE)||"{}");if(raw&&raw.apps&&typeof raw.apps==="object")usage=raw}catch{}
const style=document.createElement("style");
style.textContent=[
'.window[data-window-id="lolite-quests"]>.content{padding:0!important;overflow:hidden!important}',
'.lq{height:100%;overflow:auto;color:#eef7ff;background:#0c1523;font:13px/1.5 system-ui,sans-serif}.lq *{box-sizing:border-box}',
'.lq-shell{display:grid;grid-template-columns:200px 1fr;min-height:100%}.lq-side{background:#0d1c30;border-right:1px solid #2b435b;padding:22px 12px;display:flex;flex-direction:column;gap:6px}',
'.lq-logo{font-size:20px;font-weight:900;margin:0 9px 18px}.lq-logo span{color:#6ae8e6}.lq-nav{border:0;border-radius:9px;background:transparent;color:#a4bdd4;padding:11px;text-align:left;cursor:pointer}',
'.lq-nav.active,.lq-nav:hover{background:#24435e;color:#fff}.lq-main{padding:25px clamp(13px,3vw,36px) 55px;min-width:0}',
'.lq-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:19px}.lq-head h1{font-size:27px;margin:0}',
'.lq-hero{padding:20px;border:1px solid #3d7490;border-radius:13px;background:linear-gradient(130deg,#173d54,#182b46);margin-bottom:18px}.lq-hero h2{margin:0;font-size:23px}.lq-hero p,.lq-card p{color:#acc1d5;font-size:12px;line-height:1.6}',
'.lq-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:12px}.lq-card{border:1px solid #2a4b62;border-radius:12px;padding:15px;background:#14283d}.lq-card h3{margin:7px 0;font-size:16px}',
'.lq-tag{display:inline-block;font-size:10px;color:#b2f3ff;background:#28475f;border-radius:7px;padding:4px 7px;font-weight:800}.lq-free{font-size:11px;color:#90eeb4;font-weight:800}',
'.lq-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px}.lq-btn{cursor:pointer;border:1px solid #4b7b95;border-radius:8px;background:#22435d;padding:9px 12px;color:#effaff;font-weight:700}.lq-btn.primary{background:#24839e}.lq-btn:disabled{cursor:default;opacity:.52}',
'.lq-bar{height:7px;border-radius:8px;background:#254054;overflow:hidden;margin:10px 0}.lq-bar span{height:100%;background:#6ae3be;display:block}.lq-section{margin:27px 0 12px;display:flex;justify-content:space-between;align-items:baseline}',
'.lq-muted{color:#a4b9d0;font-size:12px}.lq-toast{background:#15413f;border:1px solid #318a7b;border-radius:9px;padding:11px;margin-bottom:13px}',
'.lq-row{display:flex;align-items:center;justify-content:space-between;padding:10px;border-bottom:1px solid #28445a}.lq-field{padding:11px;border:1px solid #44647b;background:#0b1b2c;border-radius:8px;color:#fff;width:min(400px,100%)}',
'@media(max-width:680px){.lq-shell{display:block}.lq-side{flex-direction:row;flex-wrap:wrap;padding:11px}.lq-logo{width:100%;margin:0 4px}.lq-main{padding:15px}}'
].join("");
document.head.appendChild(style);
function read(){try{const s=JSON.parse(localStorage.getItem(RP)||"null");if(s&&typeof s==="object"&&!Array.isArray(s)){s.cash=Number.isFinite(s.cash)?Math.max(0,s.cash):250;s.extras=s.extras&&typeof s.extras==="object"&&!Array.isArray(s.extras)?s.extras:{};s.history=Array.isArray(s.history)?s.history:[];return s}}catch{}return{cash:250,name:"New Resident",extras:{},history:[]}}
function ledger(s){
 const e=s.extras;e.osQuests=e.osQuests&&typeof e.osQuests==="object"?e.osQuests:{};
 const l=e.osQuests;l.claimed=Array.isArray(l.claimed)?l.claimed:[];l.lessons=Array.isArray(l.lessons)?l.lessons:[];l.courses=Array.isArray(l.courses)?l.courses:[];return l;
}
function mutate(fn){const s=read(),l=ledger(s);if(fn(s,l)===false)return false;
 try{localStorage.setItem(RP,JSON.stringify(s));render();return true}catch{return false}
}
function reward(key){return mutate((s,l)=>{if(l.claimed.includes(key))return false;l.claimed.push(key)})}
function academyCompleted(course,lesson){
 const item=course+":"+lesson,courses=window.LoliteAcademyCourses||[];
 if(!courses.some(c=>c.id===course&&c.lessons.some(q=>q.id===lesson)))return false;
 let added=false;
 mutate((s,l)=>{if(l.lessons.includes(item))return false;l.lessons.push(item);added=true});
 for(const c of courses){const d=ledger(read());if(d.courses.includes(c.id)||!c.lessons.every(q=>d.lessons.includes(c.id+":"+q.id)))continue;
 mutate((s,l)=>{if(l.courses.includes(c.id))return false;l.courses.push(c.id)});
 }
 if(added)announce("Academy lesson completed!");return added;
}
function reconcile(){
 try{const d=JSON.parse(localStorage.getItem("loliteAcademyProgressV1")||"{}");if(!Array.isArray(d.completed))return;
 for(const item of d.completed){const n=item.indexOf(":");if(n>0)academyCompleted(item.slice(0,n),item.slice(n+1))}
 }catch{}
}
function progress(id){return usage.apps[id]||{time:0,actions:0}}
function canClaim(q){const p=progress(q.app);return p.time>=q.seconds&&p.actions>=q.clicks}
function persist(){try{localStorage.setItem(USAGE,JSON.stringify(usage))}catch{}}
function interact(ev){
 if(ev.isTrusted===false)return;
 const node=ev.target.closest?.(".window[data-window-id]");const id=node?.dataset.windowId;
 if(!tasks.some(q=>q.app===id))return;
 activity[id]=Date.now();const p=usage.apps[id]||(usage.apps[id]={time:0,actions:0});
 p.actions=Math.min(9999,(p.actions||0)+1);persist();
}
document.addEventListener("pointerdown",interact,true);document.addEventListener("keydown",interact,true);
let tickTime=Date.now();
setInterval(()=>{
 const now=Date.now(),elapsed=Math.min(3,Math.max(0,(now-tickTime)/1000));tickTime=now;
 if(document.hidden||!document.hasFocus())return;
 const visible=[...document.querySelectorAll(".window[data-window-id]")].filter(x=>x.style.display!=="none");
 visible.sort((a,b)=>(Number(b.style.zIndex)||0)-(Number(a.style.zIndex)||0));
 const id=visible[0]?.dataset.windowId;
 if(!tasks.some(q=>q.app===id)||now-(activity[id]||0)>22000)return;
 const p=usage.apps[id]||(usage.apps[id]={time:0,actions:0});
 p.time=Math.min(900,(p.time||0)+elapsed);persist();if(tab==="quests")render();
},2000);
function qclaim(id){
 const a=tasks.find(q=>q.id===id);
 if(a){if(!canClaim(a))return announce("More active app use needed.");if(reward("app:"+id))announce("Quest completed!");return}
 const m=milestones.find(x=>x.id===id);if(!m)return;
 const l=ledger(read()),have=m.metric==="lessons"?l.lessons.length:l.courses.length;if(have<m.need)return announce("Complete more lessons first.");
 if(reward("academy:"+id))announce("Academy achievement unlocked!");
}
function owned(g,s){
 // Focus Board, Arcade Shelf and every game shortcut are now free.
 if(g.type==="app"||g.type==="game")return true;
 const e=s.extras;
 if(g.type==="member")return g.id==="plus"?["plus","pro"].includes(e.membership):e.membership==="pro";
 return (e.owned||[]).includes(g.id);
}
function buy(id){
 const g=goods.find(x=>x.id===id);if(!g)return;
 let activated=false;
 mutate((s,l)=>{
  if(owned(g,s))return false;
  if(g.type==="member")s.extras.membership=g.id;
  else{
   s.extras.owned=Array.isArray(s.extras.owned)?s.extras.owned:[];
   if(!s.extras.owned.includes(g.id))s.extras.owned.push(g.id);
  }
  activated=true;
 });
 if(activated)announce(g.name+" enabled for free.");
}
function announce(msg){alertMessage=msg;render();clearTimeout(announce.t);announce.t=setTimeout(()=>{alertMessage="";render()},3200)}
function button(label,cmd,id,klass,disabled){return '<button type="button" class="lq-btn '+(klass||"")+'" data-lq="'+cmd+'"'+(id!=null?' data-id="'+esc(id)+'"':"")+(disabled?" disabled":"")+">"+label+"</button>"}
function head(title,desc){
 return '<div class="lq-head"><div><h1>'+esc(title)+'</h1><span class="lq-muted">'+esc(desc)+'</span></div></div>';
}
function questsPage(){
 const l=ledger(read());
 return head("Quest Board","Complete activities and collect achievements.")+
 '<section class="lq-hero"><h2>Play, learn and achieve.</h2><p>App-use quests require genuine foreground interaction: time does not run if Lolite loses focus, the app is minimised, or you leave the window unattended. Each quest can be completed once.</p><div class="lq-actions">'+button("Open Academy","open","academy","primary")+button("Play Life RP","open","life-rp")+'</div></section>'+
 '<div class="lq-section"><h2>Use Lolite Apps</h2><span class="lq-muted">Active time + real interactions</span></div><div class="lq-grid">'+tasks.map(q=>{const p=progress(q.app),claimed=l.claimed.includes("app:"+q.id),ready=canClaim(q);return '<article class="lq-card"><span class="lq-tag">'+esc(q.app.toUpperCase())+'</span><h3>'+esc(q.name)+'</h3><p>'+esc(q.desc)+'</p><div class="lq-bar"><span style="width:'+Math.min(100,p.time/q.seconds*100)+'%"></span></div><div class="lq-muted">'+Math.floor(p.time)+' / '+q.seconds+' seconds · '+Math.min(p.actions,q.clicks)+' / '+q.clicks+' interactions</div><div class="lq-actions"><span class="lq-free">ACHIEVEMENT</span>'+button(claimed?"Completed":ready?"Claim":"Not ready","claim",q.id,ready?"primary":"",claimed||!ready)+button("Open app","open",q.app)+'</div></article>'}).join("")+'</div>'+
 '<div class="lq-section"><h2>Academy Milestones</h2></div><div class="lq-grid">'+milestones.map(m=>{const count=m.metric==="lessons"?l.lessons.length:l.courses.length,claimed=l.claimed.includes("academy:"+m.id),ready=count>=m.need;return '<article class="lq-card"><span class="lq-tag">ACADEMY</span><h3>'+esc(m.name)+'</h3><p>Complete '+m.need+' '+m.metric+' to unlock this achievement.</p><div class="lq-bar"><span style="width:'+Math.min(100,count/m.need*100)+'%"></span></div><span class="lq-muted">'+count+' / '+m.need+'</span><div class="lq-actions"><span class="lq-free">ACHIEVEMENT</span>'+button(claimed?"Completed":ready?"Claim":"Locked","claim",m.id,ready?"primary":"",claimed||!ready)+'</div></article>'}).join("")+'</div>';
}
function coursesPage(){
 const l=ledger(read()),courses=window.LoliteAcademyCourses||[];
 return head("Academy Achievements","Track completed lessons and courses.")+
 '<div class="lq-hero"><h2>Learn and make progress.</h2><p>Complete Academy knowledge checks. Your finished lessons and courses count toward achievements, including lessons completed before this update.</p>'+button("Open Academy","open","academy","primary")+'</div>'+
 '<div class="lq-grid">'+courses.map(c=>{const n=c.lessons.filter(q=>l.lessons.includes(c.id+":"+q.id)).length;return '<article class="lq-card"><h3>'+esc(c.title)+'</h3><p>'+n+' / '+c.lessons.length+' lessons · '+(l.courses.includes(c.id)?"Completed":"Keep learning")+'</p><div class="lq-bar"><span style="width:'+(n/c.lessons.length*100)+'%"></span></div>'+button("Continue course","open","academy","primary")+'</article>'}).join("")+'</div>';
}
function marketPage(){
 const s=read();
 return head("Free Extras","Game shortcuts, desktop cosmetics and mini apps are available for free.")+
 '<section class="lq-hero"><h2>Everything here is free.</h2><p>Open game shortcuts and mini apps instantly. Choose any theme, cursor or in-game perk whenever you like.</p><div class="lq-actions">'+button("Browse Game Store","open","games","primary")+button("Browse App Store","open","appstore","primary")+'</div></section>'+
 '<div class="lq-grid">'+goods.map(g=>{const have=owned(g,s);return '<article class="lq-card"><span class="lq-tag">'+esc(g.type.toUpperCase())+'</span><h3>'+esc(g.name)+'</h3><p>'+esc(g.desc)+'</p><div class="lq-actions"><span class="lq-free">FREE</span>'+
 (g.type==="app"||g.type==="game"?button("Open →","launch",g.id,"primary"):
 g.type==="member"?button(have?"Active":"Activate for free","buy",g.id,have?"":"primary",have):
 have?button("Apply","apply",g.id,"primary"):button("Enable for free","buy",g.id,"primary"))+
 '</div></article>'}).join("")+'</div>';
}
function focusList(){let a=[];try{a=JSON.parse(localStorage.getItem(FOCUS)||"[]")}catch{}return Array.isArray(a)?a:[]}
function focusPage(){const tasks=focusList();return head("Focus Board","Your free mini project planner.")+
 '<div class="lq-hero"><h2>What will you build next?</h2><p>Create a checklist, complete tasks and organise your projects. Saved to this device.</p><form data-lq-form="focus"><input class="lq-field" name="task" placeholder="What do you want to do?" required minlength="2" maxlength="120"> <button class="lq-btn primary">Add</button></form></div>'+
 '<div class="lq-card">'+(tasks.length?tasks.map((x,i)=>'<div class="lq-row"><label><input type="checkbox" data-lq="toggle" data-id="'+i+'" '+(x.done?"checked":"")+'> <span style="'+(x.done?"text-decoration:line-through;":"")+'">'+esc(x.name)+'</span></label>'+button("Delete","delete",i)+'</div>').join(""):'<p>No tasks yet. Add your first one!</p>')+'</div>';
}
function shelfPage(){return head("Arcade Shelf","One place for free game shortcuts.")+
 '<div class="lq-grid">'+goods.filter(g=>g.type==="game"&&owned(g,read())).map(g=>'<div class="lq-card"><h3>'+esc(g.name)+'</h3>'+button("Play game","launch",g.id,"primary")+'</div>').join("")+'</div>';
}
function render(){
 const root=document.querySelector('.window[data-window-id="lolite-quests"] #lq-root');if(!root)return;
 const pages=[["quests","Quest Board"],["courses","Academy"],["market","Free Extras"],["focus","Focus Board"],["arcade","Arcade Shelf"]];
 const page={quests:questsPage,courses:coursesPage,market:marketPage,focus:focusPage,arcade:shelfPage}[tab]||questsPage;
 root.innerHTML='<div class="lq-shell"><aside class="lq-side"><div class="lq-logo">Lolite <span>Quests</span></div>'+pages.map(p=>'<button class="lq-nav '+(tab===p[0]?"active":"")+'" data-lq="tab" data-id="'+p[0]+'">'+p[1]+'</button>').join("")+'<small class="lq-muted" style="margin-top:auto;padding:13px">All extras are free</small></aside><main class="lq-main">'+(alertMessage?'<div class="lq-toast" role="status">'+esc(alertMessage)+'</div>':"")+page()+'</main></div>';
}
function openApp(id){const names={notes:"Quick Notes",paint:"Lolite Paint",files:"Files",academy:"Lolite Academy",games:"Game Store",settings:"Settings",appstore:"App Store","life-rp":"Lolite Life RP"};if(!Object.prototype.hasOwnProperty.call(names,id))return;window.openApp(id,names[id],id==="life-rp"?1120:980,id==="life-rp"?745:710)}
function launch(id){
 const g=goods.find(g=>g.id===id);if(!g||!owned(g,read()))return;
 if(g.type==="app"){tab=id;render()}
 if(g.type==="game")window.LoliteRPLaunchGame?.(g.value);
}
function apply(id){const g=goods.find(g=>g.id===id);if(!g||!owned(g,read()))return;if(g.type==="cursor")window.loliteSetCursorPack?.(g.value);if(g.type==="wallpaper")window.loliteWallpaper?.(g.value);announce(g.name+" applied!")}
function editFocus(fn){const a=focusList();fn(a);localStorage.setItem(FOCUS,JSON.stringify(a.slice(0,80)));render()}
document.addEventListener("click",e=>{const b=e.target.closest?.('.window[data-window-id="lolite-quests"] [data-lq]');if(!b||b.disabled)return;const act=b.dataset.lq,id=b.dataset.id;
 if(act==="tab"){tab=id;render()}else if(act==="claim")qclaim(id);else if(act==="buy")buy(id);else if(act==="open")openApp(id);else if(act==="launch")launch(id);else if(act==="apply")apply(id);
 else if(act==="toggle")editFocus(a=>{if(a[Number(id)])a[Number(id)].done=!a[Number(id)].done});
 else if(act==="delete")editFocus(a=>a.splice(Number(id),1));
});
document.addEventListener("submit",e=>{if(!e.target.matches?.('.window[data-window-id="lolite-quests"] form[data-lq-form="focus"]'))return;e.preventDefault();const t=e.target.elements.task.value.trim().slice(0,120);if(t.length>1)editFocus(a=>a.push({name:t,done:false}))});
const page=window.page;window.page=function(id){return id==="lolite-quests"?'<div class="lq" id="lq-root"></div>':page(id)};
const oldOpen=window.openApp;window.openApp=function(id,title,w,h){const result=oldOpen(id,id==="lolite-quests"?"Lolite Quests":title,id==="lolite-quests"?(w||1040):w,id==="lolite-quests"?(h||710):h);if(id==="lolite-quests")setTimeout(render,0);return result};
const oldIcons=window.renderIcons;window.renderIcons=function(){if(typeof oldIcons==="function")oldIcons();const area=document.getElementById("icons");if(!area||area.querySelector("[data-lq-shortcut]"))return;const b=document.createElement("button");b.type="button";b.className="desktop-icon";b.dataset.lqShortcut="1";b.innerHTML=(window.LoliteIcons?.tile("quests")||"★")+"<span>Lolite Quests</span>";b.addEventListener("click",()=>window.openApp("lolite-quests","Lolite Quests",1040,710));area.appendChild(b)};
window.LoliteQuests=Object.freeze({open:()=>window.openApp("lolite-quests","Lolite Quests",1040,710),openView:id=>{if(!["focus","arcade"].includes(id))return;tab=id;window.openApp("lolite-quests","Lolite Quests",1040,710);setTimeout(render,65)},academyCompleted:academyCompleted,reconcile:reconcile,getAppProgress:id=>progress(id),canClaim:id=>{const q=tasks.find(q=>q.id===id);return q?canClaim(q):false}});
setTimeout(reconcile,300);
window.addEventListener("storage",e=>{if(e.key===RP||e.key===USAGE)render()});
})();
