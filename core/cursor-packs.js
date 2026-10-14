/* Lolite OS cursor packs: Classic, Glass, Neon, Retro. */
(()=>{
 const storageKey='loliteCursorPack';
 const packs={
  classic:{label:'Classic',fill:'#f8fbff',stroke:'#17315b',glow:'#6aaeff'},
  glass:{label:'Glass',fill:'#b9edff',stroke:'#1672bf',glow:'#62dfff'},
  neon:{label:'Neon',fill:'#121a30',stroke:'#69ffda',glow:'#2affbf'},
  retro:{label:'Retro',fill:'#ffe4a0',stroke:'#674425',glow:'#ffb13b'}
 };
 const keys=Object.keys(packs);
 const get=()=>{try{return localStorage.getItem(storageKey)||'classic'}catch{return 'classic'}};
 const save=v=>{try{localStorage.setItem(storageKey,v)}catch{}};
 const svg=(body)=>'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">'+body+'</svg>');
 const url=(body,x=16,y=16,fallback='auto')=>'url("'+svg(body)+'") '+x+' '+y+', '+fallback;
 const build=(name)=>{
  const p=packs[name],f=p.fill,s=p.stroke,g=p.glow;
  const line=(path,width=2)=>'<path d="'+path+'" fill="none" stroke="'+s+'" stroke-width="'+(width+2)+'" stroke-linecap="round"/><path d="'+path+'" fill="none" stroke="'+g+'" stroke-width="'+width+'" stroke-linecap="round"/>';
  return {
   arrow:url('<path d="M5 3V27L11 21L16 29L21 26L16 18H26Z" fill="'+f+'" stroke="'+s+'" stroke-width="2" stroke-linejoin="round"/>',5,3),
   hand:url('<path d="M7 20Q6 17 9 17L13 21V8Q13 5 16 5T19 8V16Q22 13 24 17Q28 15 29 20V24Q29 30 22 30H15Q12 30 10 26Z" fill="'+f+'" stroke="'+s+'" stroke-width="2"/>',16,7,'pointer'),
   text:url(line('M9 5H23M16 5V27M9 27H23',2),16,16,'text'),
   cross:url(line('M16 2V11M16 21V30M2 16H11M21 16H30',2)+'<circle cx="16" cy="16" r="3" fill="'+f+'" stroke="'+s+'" stroke-width="1.5"/>',16,16,'crosshair'),
   move:url('<path d="M16 2L11 9H14V14H9V11L2 16L9 21V18H14V23H11L16 30L21 23H18V18H23V21L30 16L23 11V14H18V9H21Z" fill="'+f+'" stroke="'+s+'" stroke-width="1.7"/>',16,16,'move'),
   ew:url(line('M4 16H28M4 16L10 10M4 16L10 22M28 16L22 10M28 16L22 22'),16,16,'ew-resize'),
   ns:url(line('M16 4V28M16 4L10 10M16 4L22 10M16 28L10 22M16 28L22 22'),16,16,'ns-resize'),
   nwse:url(line('M5 5L27 27M5 5V13M5 5H13M27 27V19M27 27H19'),16,16,'nwse-resize'),
   nesw:url(line('M27 5L5 27M27 5V13M27 5H19M5 27V19M5 27H13'),16,16,'nesw-resize'),
   grab:url('<path d="M7 16V10Q7 7 10 7T13 10V7Q13 4 16 4T19 7V10Q19 7 22 7T25 10V14Q29 12 29 17V22Q29 29 22 29H14Q10 29 8 24L4 19Q3 15 7 16Z" fill="'+f+'" stroke="'+s+'" stroke-width="1.8"/>',16,14,'grab'),
   wait:url('<circle cx="16" cy="16" r="12" fill="'+f+'" stroke="'+s+'" stroke-width="2"/>'+line('M16 7V16L23 20',2),16,16,'wait'),
   no:url('<circle cx="16" cy="16" r="12" fill="'+f+'" stroke="'+s+'" stroke-width="2"/>'+line('M8 8L24 24',3),16,16,'not-allowed')
  };
 };
 const style=document.createElement('style');style.id='lolite-cursor-pack-css';document.head.appendChild(style);
 const esc=v=>v.replace(/"/g,'&quot;');
 function apply(name){
  if(!packs[name])name='classic';
  save(name);
  // Use the existing cursor system's 'System' mode to avoid its legacy overrides.
  window.loliteApplyCursor?.('default');
  const c=build(name);
  const rule=(sel,value)=>sel+'{cursor:'+value+'!important}';
  style.textContent='@media(pointer:fine){'+
   rule('html,body,body *,#desktop,#loliteModeChooser,#loliteMobileShell',c.arrow)+
   rule('button,a,[role="button"],select,summary,input[type="button"],input[type="submit"],.desktop-icon,.lm-choice,.lm-device',c.hand)+
   rule('input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]),textarea,[contenteditable="true"]',c.text)+
   rule('canvas,.paint-app canvas,.crosshair-cursor,[data-tool="crosshair"]',c.cross)+
   rule('.titlebar,[draggable="true"]',c.grab)+
   rule('.titlebar:active,[draggable="true"]:active',c.move)+
   rule('.resize-handle,[data-resize="ew"],[style*="ew-resize"]',c.ew)+
   rule('[data-resize="ns"],[style*="ns-resize"]',c.ns)+
   rule('[data-resize="nwse"],[style*="nwse-resize"]',c.nwse)+
   rule('[data-resize="nesw"],[style*="nesw-resize"]',c.nesw)+
   rule('[style*="move"],.move-cursor',c.move)+
   rule('[aria-busy="true"],.loading',c.wait)+
   rule(':disabled,[aria-disabled="true"]',c.no)+
   '}';
  document.querySelectorAll('[data-lolite-pack]').forEach(b=>{const active=b.dataset.lolitePack===name;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 }
 window.loliteSetCursorPack=apply;
 const oldPage=window.page;
 if(typeof oldPage==='function')window.page=function(id){
  const html=oldPage.apply(this,arguments);
  if(id!=='settings')return html;
  const active=get();
  return html+'<section class="card" style="margin:14px 0;padding:18px"><h3>Cursor Packs</h3><p class="muted">Choose a complete Lolite cursor style. Applies to pointer, text, crosshair, dragging, resizing and loading. Your choice is saved.</p><div class="setting-row" style="gap:10px;flex-wrap:wrap">'+keys.map(k=>'<button type="button" class="setting-btn '+(active===k?'active':'')+'" data-lolite-pack="'+k+'" aria-pressed="'+(active===k)+'" onclick="loliteSetCursorPack(\''+k+'\')">'+packs[k].label+'</button>').join('')+'</div><p class="muted" style="margin-top:12px">Preview: move over these examples</p><div class="setting-row" style="gap:12px;flex-wrap:wrap"><button type="button" class="setting-btn">Pointer</button><input aria-label="Cursor text preview" placeholder="Text cursor" style="max-width:170px"><span class="crosshair-cursor setting-btn">Crosshair</span><span class="setting-btn" data-resize="ew">↔ Resize</span><span class="setting-btn" data-resize="ns">↕ Resize</span></div></section>';
 };
 // Preserve compatibility with existing settings reset and cursor choices.
 const reset=window.loliteResetSettings;
 if(typeof reset==='function')window.loliteResetSettings=function(){try{localStorage.removeItem(storageKey)}catch{}reset()};
 apply(packs[get()]?get():'classic');
})();
