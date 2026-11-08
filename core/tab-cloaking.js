/* Browser-tab appearance controls for Lolite Settings. Stored on this device only. */
(()=>{'use strict';
 const KEY='loliteTabAppearanceV1';
 const DEFAULT_ICON='assets/lolite-cosmos-logo.svg?v=cosmos-1';
 const xmlIcon=(label,color)=>'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="3" y="3" width="58" height="58" rx="15" fill="'+color+'"/><text x="32" y="43" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="34" fill="#ffffff">'+label+'</text></svg>');
 const PRESETS={
  lolite:{label:'Lolite OS',title:'Lolite OS',icon:DEFAULT_ICON},
  blank:{label:'New Tab',title:'New Tab',icon:xmlIcon('·','#4b5563')},
  notes:{label:'Notes',title:'Notes',icon:xmlIcon('N','#55759a')},
  calculator:{label:'Calculator',title:'Calculator',icon:xmlIcon('=','#246c75')},
  workspace:{label:'Workspace',title:'Workspace',icon:xmlIcon('W','#704b93')},
  classroom:{label:'Google Classroom',title:'Lolite OS · Google Classroom',icon:'https://classroom.google.com/favicon.ico'},
  drive:{label:'Google Drive',title:'Lolite OS · Google Drive',icon:'https://drive.google.com/favicon.ico'}
 };
 const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const cleanTitle=value=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,'').slice(0,80);
 const validIcon=value=>typeof value==='string'&&value.length<450000&&/^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(value);
 // Link-based themes only use HTTPS domains for a favicon and a labelled title;
 // they never navigate Lolite or change the actual browser address.
 const normaliseWebsite=value=>{
  const raw=String(value||'').trim().slice(0,2048);
  if(!raw||/\s/.test(raw))return '';
  try{
   const site=new URL(/^[a-z]+:\/\//i.test(raw)?raw:'https://'+raw);
   if(site.protocol!=='https:'||site.username||site.password||!site.hostname.includes('.'))return '';
   return site.href;
  }catch{return ''}
 };
 // Most sites don't expose their favicon at /favicon.ico. Google's favicon
 // service resolves icons from the site's metadata without requiring CORS.
 const faviconFor=hostname=>'https://www.google.com/s2/favicons?domain='+encodeURIComponent(hostname)+'&sz=64';
 const siteChoice=(value,override='')=>{
  const href=normaliseWebsite(value);
  if(!href)return null;
  const site=new URL(href),host=site.hostname.toLowerCase();
  const known={'classroom.google.com':'Google Classroom','drive.google.com':'Google Drive',
   'docs.google.com':'Google Docs','mail.google.com':'Gmail','youtube.com':'YouTube',
   'www.youtube.com':'YouTube','github.com':'GitHub','www.wikipedia.org':'Wikipedia',
   'en.wikipedia.org':'Wikipedia','www.google.com':'Google','discord.com':'Discord',
   'www.reddit.com':'Reddit','reddit.com':'Reddit','www.roblox.com':'Roblox'};
  return {title:cleanTitle(override)||known[host]||host.replace(/^www\./,''),
    icon:faviconFor(host),fallbackIcon:site.origin+'/favicon.ico',websiteUrl:site.href};
 };
 function load(){
  try{
   const stored=JSON.parse(localStorage.getItem(KEY)||'{}');
   return {mode:stored.mode==='custom'||(stored.mode==='website'&&normaliseWebsite(stored.websiteUrl))||Object.hasOwn(PRESETS,stored.mode)?stored.mode:'lolite',
    customTitle:cleanTitle(stored.customTitle)||'My Tab',
    customIcon:validIcon(stored.customIcon)?stored.customIcon:'',
    websiteUrl:normaliseWebsite(stored.websiteUrl),
    websiteTitle:cleanTitle(stored.websiteTitle)};
  }catch{return {mode:'lolite',customTitle:'My Tab',customIcon:'',websiteUrl:'',websiteTitle:''}}
 }
 let state=load();
 const current=()=>state.mode==='custom'
  ?{title:cleanTitle(state.customTitle)||'My Tab',icon:state.customIcon||DEFAULT_ICON}
  :state.mode==='website'?(siteChoice(state.websiteUrl,state.websiteTitle)||PRESETS.lolite)
  :PRESETS[state.mode]||PRESETS.lolite;
 let iconGeneration=0;
 function updateIcons(icon){
  document.querySelectorAll('link[rel~="icon"]').forEach(link=>{
   // The original Lolite links specify SVG, which prevents PNG/ICO favicons
   // from displaying in some browsers if the MIME hint is left unchanged.
   link.removeAttribute('type');
   link.href=icon;
  });
  const preview=document.querySelector('[data-ltc-preview-icon]');
  if(preview)preview.src=icon;
 }
 function apply(){
  const choice=current(),generation=++iconGeneration;
  document.title=choice.title;
  updateIcons(choice.icon);
  if(choice.fallbackIcon){
   const test=new Image();
   test.onerror=()=>{
    if(generation===iconGeneration&&state.mode==='website')
      updateIcons(choice.fallbackIcon);
   };
   test.src=choice.icon;
  }
 }
 function save(){
  try{localStorage.setItem(KEY,JSON.stringify(state));return true}
  catch{window.toast?.('Your tab changed, but this browser could not save the setting.');return false}
 }
 function sync(){
  const panel=document.querySelector('[data-ltc-panel]');if(!panel)return;
  const choice=current();
  const title=panel.querySelector('[data-ltc-preview-title]');
  const icon=panel.querySelector('[data-ltc-preview-icon]');
  if(title)title.textContent=choice.title;
  if(icon){
   icon.onerror=()=>{
    if(choice.fallbackIcon&&icon.src!==choice.fallbackIcon)icon.src=choice.fallbackIcon;
    else if(icon.src!==new URL(DEFAULT_ICON,document.baseURI).href)icon.src=DEFAULT_ICON;
   };
   icon.src=choice.icon;
  }
  panel.querySelectorAll('[data-ltc-preset]').forEach(b=>b.setAttribute('aria-pressed',String(state.mode===b.dataset.ltcPreset)));
  const custom=panel.querySelector('[data-ltc-custom]');
  if(custom)custom.setAttribute('aria-pressed',String(state.mode==='custom'));
  const website=panel.querySelector('[data-ltc-website]');
  if(website)website.setAttribute('aria-pressed',String(state.mode==='website'));
 }
 function setMode(mode){
  if(mode!=='custom'&&mode!=='website'&&!Object.hasOwn(PRESETS,mode))return;
  if(mode==='website'&&!state.websiteUrl)return;
  state.mode=mode;apply();save();sync();
  window.toast?.('Browser tab appearance updated.');
 }
 function reset(){
  state={mode:'lolite',customTitle:'My Tab',customIcon:'',websiteUrl:'',websiteTitle:''};
  try{localStorage.removeItem(KEY)}catch{}
  apply();sync();
  const input=document.querySelector('[data-ltc-title]');if(input)input.value=state.customTitle;
  const website=document.querySelector('[data-ltc-website-url]');if(website)website.value='';
  const websiteTitle=document.querySelector('[data-ltc-website-title]');if(websiteTitle)websiteTitle.value='';
  window.toast?.('Original Lolite tab restored.');
 }
 function markup(){
  const choice=current();
  return '<div data-ltc-panel class="ltc-panel">'+
   '<div class="cr-section-head"><h2>Browser tab appearance</h2><span>Local to this browser</span></div>'+
   '<p class="cr-help">Choose a website to match its browser-tab title and icon, or use your own custom design. The real site address stays unchanged.</p>'+
   '<div class="ltc-preview" aria-label="Current tab preview"><span class="ltc-preview-caption">TAB PREVIEW</span><div class="ltc-preview-tab"><img data-ltc-preview-icon alt="" src="'+escapeHTML(choice.icon)+'"><span data-ltc-preview-title>'+escapeHTML(choice.title)+'</span><span aria-hidden="true">×</span></div></div>'+
   '<h2 class="cr-subheading">Quick presets</h2><div class="ltc-presets" role="group" aria-label="Tab appearance presets">'+
   Object.entries(PRESETS).map(([id,preset])=>'<button type="button" class="ltc-preset" data-ltc-preset="'+id+'" aria-pressed="'+(state.mode===id)+'"><img src="'+escapeHTML(preset.icon)+'" alt=""><span>'+escapeHTML(preset.label)+'</span></button>').join('')+
   '</div><h2 class="cr-subheading">Use a website link</h2><div class="cr-setting-group ltc-custom-settings">'+
   '<p class="cr-help">Paste an HTTPS website link. Lolite will use the website name and its favicon in your tab, without adding “Lolite OS” to the title. You can optionally choose a different tab title.</p>'+
   '<label class="ltc-field" for="ltc-website-url">Website URL<input id="ltc-website-url" data-ltc-website-url type="url" maxlength="2048" autocomplete="off" spellcheck="false" value="'+escapeHTML(state.websiteUrl)+'" placeholder="https://example.com"></label>'+
   '<label class="ltc-field" for="ltc-website-title">Tab title (optional)<input id="ltc-website-title" data-ltc-website-title type="text" maxlength="80" autocomplete="off" value="'+escapeHTML(state.websiteTitle)+'" placeholder="Use website name automatically"></label>'+
   '<div class="ltc-actions"><button type="button" class="cr-secondary" data-ltc-website aria-pressed="'+(state.mode==='website')+'">Use website appearance</button></div>'+
   '</div><h2 class="cr-subheading">Your own tab</h2><div class="cr-setting-group ltc-custom-settings">'+
   '<label class="ltc-field" for="ltc-title">Custom tab title<input id="ltc-title" data-ltc-title type="text" maxlength="80" autocomplete="off" value="'+escapeHTML(state.customTitle)+'" placeholder="My Tab"></label>'+
   '<label class="ltc-field" for="ltc-icon">Custom tab icon <span class="ltc-hint">PNG, JPG or WebP, up to 300 KB</span><input id="ltc-icon" data-ltc-icon type="file" accept="image/png,image/jpeg,image/webp"></label>'+
   '<div class="ltc-actions"><button type="button" class="cr-secondary" data-ltc-custom aria-pressed="'+(state.mode==='custom')+'">Use custom tab</button><button type="button" class="cr-secondary" data-ltc-clear-icon>Remove custom icon</button><button type="button" class="cr-secondary" data-ltc-reset>Restore Lolite tab</button></div>'+
   '<p class="cr-help">The site URL in the address bar, browser history, and browser security information cannot be disguised or changed into another domain or about:blank. These controls affect the tab name and favicon only. Preferences are saved on this device.</p>'+
   '</div></div>';
 }
 const style=document.createElement('style');style.textContent=
  '.ltc-panel{max-width:780px}.ltc-preview{padding:17px;border-radius:13px;background:#111827aa;border:1px solid #ffffff24;margin:18px 0 24px}.ltc-preview-caption{display:block;color:#a8b5c6;font-size:10px;font-weight:800;letter-spacing:1.3px;margin-bottom:12px}.ltc-preview-tab{display:flex;align-items:center;gap:10px;width:min(360px,100%);border:1px solid #ffffff25;border-bottom-color:transparent;background:#293242;border-radius:12px 12px 5px 5px;padding:11px 13px;color:#eef3fa;font-size:13px;min-height:46px}.ltc-preview-tab img{width:18px;height:18px;object-fit:contain}.ltc-preview-tab span:nth-child(2){overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}.ltc-preview-tab span:last-child{opacity:.6}.ltc-presets{display:grid;grid-template-columns:repeat(auto-fit,minmax(115px,1fr));gap:10px;margin:12px 0 26px}.ltc-preset{background:#ffffff0b;color:inherit;border:1px solid #ffffff26;border-radius:11px;min-height:78px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;padding:10px;font-size:12px}.ltc-preset img{width:23px;height:23px;object-fit:contain}.ltc-preset:hover{background:#ffffff19}.ltc-preset[aria-pressed=true],.ltc-actions [aria-pressed=true]{border-color:var(--accent,#76a9c4);box-shadow:inset 0 0 0 1px var(--accent,#76a9c4)}.ltc-custom-settings{padding:18px;display:grid;gap:16px}.ltc-field{display:flex;flex-direction:column;gap:8px;color:inherit;font-size:13px;font-weight:700}.ltc-field input[type=text],.ltc-field input[type=file]{width:100%;max-width:440px;min-width:0;box-sizing:border-box;background:#11182788;color:inherit;border:1px solid #ffffff38;border-radius:9px;padding:11px;font:inherit}.ltc-field input[type=file]{font-size:12px}.ltc-hint{font-weight:400;color:#a8b5c6;font-size:12px}.ltc-actions{display:flex;flex-wrap:wrap;gap:9px}.ltc-actions button{min-height:38px}.ltc-panel :is(button,input):focus-visible{outline:2px solid var(--accent,#76a9c4);outline-offset:2px}@media(max-width:520px){.ltc-presets{grid-template-columns:repeat(2,minmax(0,1fr))}.ltc-preview{padding:12px}}';
 style.textContent+='.ltc-panel input[type=url]{width:100%;max-width:440px;min-width:0;box-sizing:border-box;background:#11182788;color:inherit;border:1px solid #ffffff38;border-radius:9px;padding:11px;font:inherit}';
 document.head.appendChild(style);
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-ltc-preset],[data-ltc-custom],[data-ltc-website],[data-ltc-clear-icon],[data-ltc-reset]');
  if(!button)return;
  if(button.hasAttribute('data-ltc-preset'))setMode(button.dataset.ltcPreset);
  else if(button.hasAttribute('data-ltc-custom'))setMode('custom');
  else if(button.hasAttribute('data-ltc-website')){
   const value=document.querySelector('[data-ltc-website-url]')?.value;
   const parsed=normaliseWebsite(value);
   if(!parsed){window.toast?.('Enter a valid HTTPS website, such as https://example.com.');return}
   state.websiteUrl=parsed;
   state.websiteTitle=cleanTitle(document.querySelector('[data-ltc-website-title]')?.value);
   setMode('website');
   const input=document.querySelector('[data-ltc-website-url]');if(input)input.value=parsed;
  }
  else if(button.hasAttribute('data-ltc-clear-icon')){state.customIcon='';setMode('custom')}
  else if(button.hasAttribute('data-ltc-reset'))reset();
 });
 document.addEventListener('input',event=>{
  if(event.target.matches('[data-ltc-title]')){
   state.customTitle=cleanTitle(event.target.value)||'My Tab';state.mode='custom';
  }else if(event.target.matches('[data-ltc-website-title]')){
   state.websiteTitle=cleanTitle(event.target.value);
   if(state.mode!=='website')return;
  }else return;
  apply();save();sync();
 });
 document.addEventListener('change',event=>{
  if(!event.target.matches('[data-ltc-icon]'))return;
  const input=event.target,file=input.files?.[0];input.value='';
  if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>300*1024){
   window.toast?.('Choose a PNG, JPG or WebP icon under 300 KB.');return;
  }
  const reader=new FileReader();
  reader.onload=()=>{
   if(!validIcon(reader.result)){window.toast?.('That icon could not be read.');return}
   state.customIcon=reader.result;setMode('custom');
  };
  reader.onerror=()=>window.toast?.('Could not read that icon.');
  reader.readAsDataURL(file);
 });
 const olderReset=window.loliteResetSettings;
 if(typeof olderReset==='function')window.loliteResetSettings=function(){try{localStorage.removeItem(KEY)}catch{}return olderReset.apply(this,arguments)};
 apply();
 window.LoliteTabCloak={markup,reset,apply};
})();
