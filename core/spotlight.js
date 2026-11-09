/* Lolite OS 4.0 — Spotlight launcher for apps, games, local files and settings. */
(()=>{'use strict';
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const settings=[
  {id:'settings',name:'Settings',hint:'Personalisation and preferences',term:'preferences theme settings',go:()=>launch('settings')},
  {id:'wallpapers',name:'Wallpapers & Live Effects',hint:'Change the desktop wallpaper',term:'wallpapers background interactive',go:()=>{if(window.LoliteCrimson?.openSettings)window.LoliteCrimson.openSettings('wallpapers');else launch('settings')}},
  {id:'hosts',name:'Hosting Status',hint:'Check GitHub Pages, Vercel and Railway',term:'hosting servers versions status uptime',go:()=>window.LoliteHostStatus?.openPanel?.()},
  {id:'games-health',name:'Check Game Files',hint:'Scan for missing repository HTML games',term:'broken game files missing check',go:()=>{launch('games');window.loliteStoreCheckFiles?.()}},
  {id:'taskbar',name:'Taskbar & Pinned Apps',hint:'Right-click a taskbar icon to pin or unpin it',term:'taskbar pinned app preview',go:()=>launch('settings')}
 ];
 const favorites=()=>{try{return JSON.parse(localStorage.getItem('loliteRecentAppsV2')||'[]')}catch{return []}};
 let modal=null,input=null,results=null,active=0,items=[],files=[],opened=false,seq=0;
 const appList=()=>Array.isArray(window.LoliteDesktopShell?.apps)?window.LoliteDesktopShell.apps:[];
 const launch=id=>{if(window.LoliteDesktopShell?.launch)window.LoliteDesktopShell.launch(id);else window.openApp?.(id,id)};
 const score=(name,detail,q)=>{
  const n=String(name).toLowerCase(),d=String(detail||'').toLowerCase();
  if(n===q)return 100;
  if(n.startsWith(q))return 70;
  if(n.split(/[\s._/-]+/).some(w=>w.startsWith(q)))return 50;
  if(n.includes(q))return 35;
  return d.includes(q)?14:-1;
 };
 function build(query){
  const q=query.trim().toLowerCase(),recent=favorites(),out=[];
  for(const a of appList()){
   const points=q?score(a[1],a[2],q):recent.includes(a[0])?60-recent.indexOf(a[0]):10;
   if(points<0)continue;
   out.push({kind:'app',id:'app:'+a[0],label:a[1],detail:a[2]||'Application',points,
    icon:window.LoliteIcons?.tile?.(a[0])||'◫',go:()=>launch(a[0])});
  }
  if(q){
   for(const g of window.LoliteGameSearch?.(q,12)||[]){
    out.push({kind:'game',id:'game:'+g.file,label:g.title,
     detail:g.unlocked?'Game · '+g.category:'Game · View in store',
     points:score(g.title,g.category,q)+2,icon:'◈',
     go:()=>{launch('games');if(g.unlocked)window.loliteStorePlay?.(g.file);else window.loliteStoreSearch?.(g.title)}});
   }
   for(const row of files){
    const points=score(row.path,'File',q);
    if(points<0)continue;
    out.push({kind:'file',id:'file:'+row.path,label:row.path.split('/').filter(Boolean).pop()||row.path,
     detail:'My files · '+row.path,points,icon:'▤',
     go:()=>{launch('files');window.toast?.('Find '+row.path+' in Files')}});
   }
  }
  for(const s of settings){
   const points=q?score(s.name,s.term,q):s.id==='hosts'?4:s.id==='wallpapers'?3:-1;
   if(points<0)continue;
   out.push({kind:'setting',id:'setting:'+s.id,label:s.name,detail:s.hint,points,icon:'⚙',go:s.go});
  }
  out.sort((a,b)=>b.points-a.points||a.label.localeCompare(b.label));
  return out.slice(0,q?36:12);
 }
 const hint=(q)=>q?'No results. Try a different app, game, file or setting.':'Type to search your Lolite workspace.';
 function render(){
  if(!opened||!results)return;
  const q=input.value||'';
  items=build(q);
  active=Math.min(active,Math.max(0,items.length-1));
  const frag=items.map((item,i)=>'<button type="button" class="lolite-spot-item'+(i===active?' is-selected':'')+
   '" data-spot-index="'+i+'" role="option" aria-selected="'+(i===active)+'" id="lolite-spot-result-'+i+'">'+
   '<span class="lolite-spot-icon" aria-hidden="true">'+item.icon+'</span><span class="lolite-spot-copy"><strong>'+
   esc(item.label)+'</strong><small>'+esc(item.detail)+'</small></span><span class="lolite-spot-kind">'+
   esc(item.kind)+'</span></button>').join('');
  results.innerHTML=frag||'<p class="lolite-spot-empty">'+esc(hint(q))+'</p>';
  input.setAttribute('aria-activedescendant',items.length?'lolite-spot-result-'+active:'');
 }
 function select(n){
  if(!items.length)return;
  active=(n+items.length)%items.length;
  results.querySelectorAll('[data-spot-index]').forEach(el=>{
   const on=Number(el.dataset.spotIndex)===active;
   el.classList.toggle('is-selected',on);
   el.setAttribute('aria-selected',String(on));
   if(on)el.scrollIntoView?.({block:'nearest'});
  });
  input.setAttribute('aria-activedescendant','lolite-spot-result-'+active);
 }
 function activate(n=active){
  const item=items[n];if(!item)return;
  close();item.go();
 }
 function close(){
  if(!opened)return;
  opened=false;modal?.classList.add('hidden');
  modal?.setAttribute('aria-hidden','true');
  window.dispatchEvent(new CustomEvent('lolite:panelchange',{detail:{open:false,id:'loliteSpotlight'}}));
 }
 function ensure(){
  if(modal)return;
  modal=document.createElement('section');
  modal.id='loliteSpotlight';
  modal.className='lolite-spotlight hidden';
  modal.setAttribute('role','dialog');modal.setAttribute('aria-label','Lolite Spotlight Search');
  modal.setAttribute('aria-modal','true');modal.setAttribute('aria-hidden','true');
  modal.innerHTML='<div class="lolite-spot-backdrop" data-spot-close></div>'+
    '<div class="lolite-spot-window"><label class="lolite-spot-search"><span aria-hidden="true">⌕</span>'+
    '<input type="search" autocomplete="off" spellcheck="false" placeholder="Search apps, games, files and settings…" aria-label="Search Lolite" role="combobox" aria-autocomplete="list" aria-controls="loliteSpotlightResults" aria-expanded="true">'+
    '<kbd>Esc</kbd></label><div class="lolite-spot-results" role="listbox" id="loliteSpotlightResults"></div>'+
    '<footer><span>↑ ↓ Navigate · Enter Open</span><span>Ctrl + Space</span></footer></div>';
  document.body.appendChild(modal);
  input=modal.querySelector('input');results=modal.querySelector('.lolite-spot-results');
  input.addEventListener('input',()=>{active=0;render()});
  input.addEventListener('keydown',e=>{
   if(e.key==='ArrowDown'){e.preventDefault();select(active+1)}
   else if(e.key==='ArrowUp'){e.preventDefault();select(active-1)}
   else if(e.key==='Enter'){e.preventDefault();activate()}
   else if(e.key==='Escape'){e.preventDefault();close()}
  });
  modal.addEventListener('click',e=>{
   if(e.target.closest('[data-spot-close]'))close();
   const button=e.target.closest('[data-spot-index]');
   if(button)activate(Number(button.dataset.spotIndex));
  });
 }
 async function loadFiles(){
  const marker=++seq;
  try{
   const rows=await window.FileOS?.all?.();
   if(marker!==seq||!opened)return;
   files=(Array.isArray(rows)?rows:[]).filter(x=>!x.trashed&&typeof x.path==='string').slice(0,2000);
   render();
  }catch{files=[]}
 }
 function open(initial=''){
  if(document.documentElement.classList.contains('browsing-mode'))return;
  ensure();opened=true;active=0;
  modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');
  input.value=String(initial).slice(0,120);render();input.focus({preventScroll:true});
  window.dispatchEvent(new CustomEvent('lolite:panelchange',{detail:{open:true,id:'loliteSpotlight'}}));
  void loadFiles();
 }
 document.addEventListener('keydown',e=>{
  if(e.ctrlKey&&!e.altKey&&!e.metaKey&&e.code==='Space'){
   e.preventDefault();if(opened)close();else open();return;
  }
  if(opened&&e.key==='Escape'){e.preventDefault();close()}
 });
 window.addEventListener('lolite:modechange',close);
 const init=()=>{
  const search=document.getElementById('searchBtn');
  if(search){search.onclick=()=>open();search.title='Spotlight · Ctrl + Space';search.setAttribute('aria-label','Open Spotlight Search')}
  window.openSearch=()=>open();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.LoliteSpotlight=Object.freeze({open,close,search:build,get isOpen(){return opened}});
})();
