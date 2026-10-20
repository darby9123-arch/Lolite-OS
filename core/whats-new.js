/* Lolite What's New: release notes from the actual README Update Log. */
(()=>{
'use strict';
const URL='README.md',GH='https://github.com/darby9123-arch/Lolite-OS#update-log';
const fallback=[
 ['Lolite Life RP Online Mode — Private Rooms & Cloud Saves — 2026-10-20','Private live multiplayer rooms, co-op community challenges and optional cloud saves using Lolite Chat accounts.'],
 ['Lolite Life RP — Jobs, Properties & Season Pass — 2026-10-20','Twenty careers, twelve activities, ten properties and a virtual-money season pass are now playable.'],
 ['Lolite Academy — Interactive Guide & Courses — 2026-10-20','New Lolite Academy app with 7 courses, 21 guided lessons, quizzes and saved progress.'],
 ['Game cover image fix — 2026-10-20','Game Store covers now show a per-game fallback poster when outside images fail.'],
 ['3.15.3 — Cloud Gaming launcher — 2026-10-19','Cloud Gaming app adds links to official gaming providers, search, and favourites.'],
 ['3.15.1 — Reliable desktop updates and fresh reinstall — 2026-10-19','Windows launcher can refresh files and reinstall even when on the latest version.'],
 ['3.14.0 — File viewers and Explorer workspace — 2026-10-16','File Explorer has new built-in file viewers and organisation tools.']
].map(x=>({title:x[0],bullets:[x[1]]}));
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const plain=s=>String(s??'').replace(/!?\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/[*_]/g,'').trim();
const dateOf=s=>(String(s).match(/20\d{2}-\d{2}-\d{2}/)||[])[0]||'';
function typeOf(s){
 s=s.toLowerCase();
 if(s.includes('life rp'))return 'life-rp';
 if(s.includes('academy'))return 'academy';
 if(/cover|artwork|game store/.test(s))return 'artwork';
 if(s.includes('cloud gaming'))return 'cloud';
 if(/installer|desktop update|windows update|windows desktop|launcher/.test(s))return 'windows';
 if(/file viewer|file explorer/.test(s))return 'files';
 if(s.includes('chat'))return 'chat';
 if(/browser|ultraviolet|scramjet/.test(s))return 'browser';
 if(/wallpaper|interface/.test(s))return 'desktop';
 return 'general';
}
function parseMarkdown(markdown){
 const lines=String(markdown).split(/\r?\n/);
 const pos=lines.findIndex(x=>/^##\s+Update Log\s*$/i.test(x.trim()));
 if(pos<0)return [];
 const entries=[];let cur=null;
 const save=()=>{if(cur&&cur.bullets.length)entries.push(cur)};
 for(let i=pos+1;i<lines.length;i++){
  const l=lines[i].trim();
  if(/^##\s+/.test(l))break;
  const head=l.match(/^###\s+(.+)/);
  if(head){save();cur={title:head[1],bullets:[]};continue}
  if(!cur)continue;
  const bullet=l.match(/^[-*]\s+(.+)/);
  if(bullet)cur.bullets.push(bullet[1]);
  else if(l&&cur.bullets.length&&!l.startsWith('#')&&!l.startsWith(String.fromCharCode(96)))
   cur.bullets[cur.bullets.length-1]+=' '+l;
 }
 save();return entries;
}
const prepare=list=>list.map((x,i)=>({
 title:plain(x.title),bullets:x.bullets.map(plain).filter(Boolean),
 date:dateOf(x.title),type:typeOf(x.title),order:i
})).filter(x=>x.title&&x.bullets.length)
 .sort((a,b)=>b.date.localeCompare(a.date)||a.order-b.order)
 .map((x,index)=>({...x,index}));
let entries=prepare(fallback),selected=null;
function recent(limit=4){
 const out=[],types=new Set();
 for(const x of entries){if(types.has(x.type))continue;types.add(x.type);out.push(x);if(out.length>=limit)break}
 return out;
}
function dateText(x){
 if(!x.date)return 'Recent update';
 const [y,m,d]=x.date.split('-').map(Number);
 return new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,d)));
}
const short=x=>x.title.replace(/\s*[—-]\s*20\d{2}-\d{2}-\d{2}\s*$/,'').replace(/^\d+\.\d+(?:\.\d+)?\s*[—-]\s*/,'');
const destinations={
 'life-rp':['life-rp','Lolite Life RP','Play Life RP'],
 academy:['academy','Lolite Academy','Try Academy'],
 artwork:['games','Game Store','View game art'],
 cloud:['cloud-gaming','Cloud Gaming','Try Cloud Gaming'],
 files:['files','Files','Open Files'],
 chat:['chatroom','Lolite Chat','Open Chat'],
 browser:['browser','Lolite Browser','Open Browser'],
 desktop:['settings','Settings','Open Settings'],
 windows:['releases','','Windows releases']
};
function action(x){
 const d=destinations[x.type];if(!d)return '';
 return '<button type="button" class="lu-action" data-lu-action="launch" data-lu-type="'+esc(x.type)+'">'+esc(d[2])+' ↗</button>';
}
function card(x){
 return '<article class="lu-card"><div class="lu-meta"><span>'+esc(x.type.toUpperCase())+'</span><time datetime="'+esc(x.date)+'">'+esc(dateText(x))+'</time></div>'+
 '<h3>'+esc(short(x))+'</h3><p>'+esc(x.bullets[0])+'</p>'+
 '<footer>'+action(x)+'<button type="button" class="lu-action lu-subtle" data-lu-action="detail" data-lu-index="'+x.index+'">Read notes →</button></footer></article>';
}
function homeMarkup(){
 return '<section class="lu-home"><header class="lu-heading"><div><div class="ui-eyebrow">LATEST RELEASES</div><h2>What’s New</h2><p>Real changes from the Lolite OS update log.</p></div>'+
 '<button type="button" class="lu-view-all" data-lu-action="all">See all updates →</button></header>'+
 '<div class="lu-card-grid">'+recent().map(card).join('')+'</div></section>';
}
const welcomeMarkup=()=>'<ul>'+recent().map(x=>'<li><strong>'+esc(short(x))+'</strong><span>'+esc(x.bullets[0])+'</span></li>').join('')+'</ul>';
function appMarkup(){
 const item=typeof selected==='number'?entries[selected]:null;
 let body='';
 if(item){
  body='<button class="lu-back" type="button" data-lu-action="back">← All updates</button>'+
    '<article class="lu-detail"><div class="lu-kicker">'+esc(item.type.toUpperCase())+' · '+esc(dateText(item))+'</div>'+
    '<h2>'+esc(item.title)+'</h2><ul>'+item.bullets.map(b=>'<li>'+esc(b)+'</li>').join('')+'</ul>'+
    '<div class="lu-detail-actions">'+action(item)+'</div></article>';
 }else{
  body='<div class="lu-release-list">'+entries.slice(0,30).map(x=>
   '<article class="lu-release"><time datetime="'+esc(x.date)+'">'+esc(dateText(x))+'</time>'+
   '<div><strong>'+esc(x.title)+'</strong><p>'+esc(x.bullets[0])+'</p></div>'+
   '<button class="lu-action" type="button" data-lu-action="detail" data-lu-index="'+x.index+'">Read notes →</button></article>'
  ).join('')+'</div>';
 }
 return '<div class="lu-update-app" id="lolite-updates"><header class="lu-app-header"><div class="lu-kicker">LOLITE OS · RELEASE HISTORY</div>'+
 '<h1>What’s New</h1><p>Actual updates recorded in the project README.</p></header>'+body+
 '<footer class="lu-foot">Source: <a href="'+GH+'" target="_blank" rel="noopener noreferrer">GitHub update log ↗</a></footer></div>';
}
function refresh(){
 document.querySelectorAll('[data-lu-feed]').forEach(el=>el.innerHTML=homeMarkup());
 document.querySelectorAll('[data-lu-welcome]').forEach(el=>el.innerHTML=welcomeMarkup());
 const root=document.querySelector('#lolite-updates');
 if(root)root.outerHTML=appMarkup();
}
function open(index=null){selected=index;window.openApp('updates','What’s New',970,680);refresh()}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-lu-action]');if(!b)return;
 const type=b.dataset.luAction;
 if(type==='all'){open();return}
 if(type==='detail'){const i=Number(b.dataset.luIndex);if(entries[i])open(i);return}
 if(type==='back'){selected=null;refresh();return}
 if(type==='launch'){
  const dest=destinations[b.dataset.luType];if(!dest)return;
  if(dest[0]==='releases'){window.open('https://github.com/darby9123-arch/Lolite-OS/releases','_blank','noopener,noreferrer');return}
  window.openApp(dest[0],dest[1],dest[0]==='academy'?1050:960,650);
 }
});
const previousPage=window.page;
window.page=function(id){return id==='updates'?appMarkup():previousPage(id)};
const loading=(async()=>{
 // Static hosting may transform README.md into HTML or omit the original file.
 // Both URLs are public project files, and the request sends no user credentials.
 const sources=[URL,'https://raw.githubusercontent.com/darby9123-arch/Lolite-OS/main/README.md'];
 for(const source of sources){
  try{
   const res=await fetch(source,{cache:'no-store',credentials:'omit'});
   if(!res.ok)continue;
   const parsed=prepare(parseMarkdown(await res.text()));
   if(parsed.length<3)continue;
   entries=parsed;selected=null;refresh();
   break;
  }catch(error){console.warn('Lolite What’s New: source unavailable',source,error)}
 }
 return entries;
})();
window.LoliteWhatsNew=Object.freeze({
 homeMarkup,welcomeMarkup,open,load:()=>loading,parseMarkdown,
 getRecent:()=>recent().map(x=>({title:x.title,date:x.date,summary:x.bullets[0]})),
 getAll:()=>entries.map(x=>({title:x.title,date:x.date,bullets:x.bullets.slice()}))
});
})();