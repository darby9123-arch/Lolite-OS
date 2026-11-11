const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('core/taskbar-customization.js','utf8');
const css=fs.readFileSync('core/taskbar-customization.css','utf8');
function load(saved=new Map()){
 const handlers={};
 const styles=new Map(),dataset={},classes=new Set();
 const root={
  dataset,
  style:{setProperty:(k,v)=>styles.set(k,v)},
  classList:{toggle:(name,on)=>on?classes.add(name):classes.delete(name),contains:name=>classes.has(name)}
 };
 const document={
  readyState:'complete',documentElement:root,
  addEventListener:(type,handler)=>handlers[type]=handler,
  getElementById:()=>null
 };
 const localStorage={
  getItem:key=>saved.has(key)?saved.get(key):null,
  setItem:(key,value)=>saved.set(key,String(value)),
  removeItem:key=>saved.delete(key)
 };
 const window={};
 vm.runInNewContext(src,{window,document,localStorage,console},{timeout:2000});
 const api=window.LoliteTaskbarCustomization;
 const set=(field,value)=>{
  const element={
   dataset:{ltcField:field},value,
   checked:Boolean(value),
   closest:()=>element
  };
  handlers.input({target:element});
 };
 return {api,styles,dataset,classes,saved,set,handlers};
}
test('Desktop tab contains both the original icon editor and taskbar customisation',()=>{
 const crimson=fs.readFileSync('core/crimson.js','utf8');
 const index=fs.readFileSync('index.html','utf8');
 assert.match(crimson,/\['icons','Desktop','paint'\]/);
 assert.doesNotMatch(crimson,/\['icons','Desktop Icons','paint'\]/);
 assert.match(crimson,/LoliteIconCustomization\?\.markup/);
 assert.match(crimson,/LoliteTaskbarCustomization\?\.markup/);
 assert.match(crimson,/LoliteTaskbarCustomization\?\.preview/);
 assert.ok(index.indexOf('core/desktop-icon-customization.js')<index.indexOf('core/taskbar-customization.js'));
 assert.ok(index.includes('core/taskbar-customization.css'));
});
test('Taskbar controls are practical, live and account-scoped',()=>{
 const h=load();
 const html=h.api.markup();
 for(const field of ['height','iconSize','opacity','color','position','align','blur','autoHide','search','clock','settings']){
  assert.ok(html.includes('data-ltc-field="'+field+'"'),'Missing '+field);
 }
 assert.match(html,/LIVE TASKBAR PREVIEW/);
 assert.match(html,/Reset taskbar/);
 h.set('height','68');
 h.set('iconSize','33');
 h.set('opacity','72');
 h.set('color','#5164dd');
 h.set('position','top');
 h.set('align','left');
 assert.equal(h.api.get().height,68);
 assert.equal(h.api.get().position,'top');
 assert.equal(h.dataset.ltcPosition,'top');
 assert.equal(h.dataset.ltcAlign,'left');
 assert.equal(h.styles.get('--ltc-icon-size'),'33px');
 assert.equal(h.styles.get('--ltc-opacity'),'72%');
 assert.equal(h.styles.get('--ltc-color'),'#5164dd');
 assert.equal(h.classes.has('ltc-applied'),true);
 assert.ok(h.saved.has('lolite.taskbar.v1.guest'));
});
test('Taskbar changes sanitize corrupted preferences and restore defaults',()=>{
 const prefs=new Map([['lolite.taskbar.v1.guest',JSON.stringify({
  height:9999,iconSize:-6,opacity:4,color:'red',
  position:'outside',align:'right',autoHide:true,search:false
 })]]);
 const h=load(prefs);
 assert.equal(h.api.get().height,76);
 assert.equal(h.api.get().iconSize,20);
 assert.equal(h.api.get().opacity,30);
 assert.equal(h.api.get().color,'#252225');
 assert.equal(h.api.get().position,'bottom');
 assert.equal(h.api.get().align,'center');
 assert.equal(h.dataset.ltcSearch,'false');
 assert.equal(h.dataset.ltcAutohide,'true');
 h.api.reset();
 assert.equal(h.classes.has('ltc-applied'),false);
 assert.equal(h.dataset.ltcSearch,undefined);
 assert.equal(prefs.has('lolite.taskbar.v1.guest'),false);
 assert.equal(h.api.get().height,56);
});
test('Search, clock, Settings and top/bottom auto-hide have actual CSS selectors',()=>{
 assert.match(css,/\[data-ltc-search=false\]/);
 assert.match(css,/\[data-ltc-clock=false\]/);
 assert.match(css,/\[data-ltc-settings=false\]/);
 assert.match(css,/\[data-ltc-position=top\]/);
 assert.match(css,/\[data-ltc-position=bottom\]/);
 assert.match(css,/\[data-ltc-align=left\]/);
 assert.match(css,/\[data-ltc-align=center\]/);
 assert.match(css,/not\(:hover\):not\(:focus-within\)/);
 assert.match(css,/pointer:fine/);
 assert.match(css,/translate:0 calc\(-100% \+ 5px\)/);
 assert.match(css,/#start/);
 assert.match(css,/#winCalendar/);
});
test('Taskbar settings do not modify desktop icons or browser/mobile modes',()=>{
 assert.doesNotMatch(src,/localStorage\.clear\(/);
 assert.doesNotMatch(src,/lolite\.desktop-icons\.v1\./);
 assert.match(css,/not\(\.browsing-mode\)/);
 assert.match(css,/not\(\.mobile-mode\)/);
});


function iconHarness(saved=new Map()){
 const events={},classes=new Set(),dataset={},styles=new Map();
 const root={
  dataset,
  classList:{toggle:(name,value)=>value?classes.add(name):classes.delete(name)},
  style:{setProperty:(name,value)=>styles.set(name,value)}
 };
 const document={
  readyState:'complete',documentElement:root,
  addEventListener:(name,fn)=>events[name]=fn,
  getElementById:()=>null
 };
 const localStorage={
  getItem:key=>saved.has(key)?saved.get(key):null,
  setItem:(key,value)=>saved.set(key,String(value)),
  removeItem:key=>saved.delete(key)
 };
 const window={innerWidth:1200,addEventListener(){}};
 vm.runInNewContext(fs.readFileSync('core/desktop-icon-customization.js','utf8'),
  {window,document,localStorage,console,Number,Math},
  {timeout:2000});
 const setVisible=checked=>{
  const input={dataset:{licField:'visible'},checked,type:'checkbox',closest:()=>input};
  events.input({target:input});
 };
 return {api:window.LoliteIconCustomization,setVisible,classes,dataset,styles,saved};
}
test('Desktop visibility switch hides all shortcuts without deleting their settings',()=>{
 const h=iconHarness();
 assert.equal(h.api.get().visible,true,'Existing users see their shortcuts by default');
 assert.match(h.api.markup(),/data-lic-field="visible"/);
 assert.match(h.api.markup(),/Show desktop icons/);
 h.setVisible(false);
 assert.equal(h.api.get().visible,false);
 assert.equal(h.dataset.licIconsVisible,'false');
 assert.equal(h.classes.has('lic-applied'),true);
 assert.equal(JSON.parse(h.saved.get('lolite.desktop-icons.v1.guest')).visible,false);
 h.setVisible(true);
 assert.equal(h.api.get().visible,true);
 assert.equal(h.dataset.licIconsVisible,'true');
});
test('Old desktop icon preferences and Reset icons both restore shortcut visibility',()=>{
 const saved=new Map([['lolite.desktop-icons.v1.guest',JSON.stringify({size:72,position:'right'})]]);
 const h=iconHarness(saved);
 assert.equal(h.api.get().size,72);
 assert.equal(h.api.get().visible,true,'Old saved preferences remain compatible');
 h.setVisible(false);
 assert.equal(h.api.get().size,72,'Hiding shortcuts preserves their size');
 h.api.reset();
 assert.equal(h.api.get().visible,true);
 assert.equal(h.classes.has('lic-applied'),false);
 assert.equal(h.dataset.licIconsVisible,undefined);
 assert.equal(saved.has('lolite.desktop-icons.v1.guest'),false);
});
test('Icon visibility rule targets only the shortcut layer in desktop mode',()=>{
 const iconCss=fs.readFileSync('core/desktop-icon-customization.css','utf8');
 const index=fs.readFileSync('index.html','utf8');
 assert.match(iconCss,/html\.lic-applied\[data-lic-icons-visible="false"\]:not\(\.browsing-mode\):not\(\.mobile-mode\) #desktop #icons\s*\{\s*display:none!important;/);
 assert.match(iconCss,/\.lic-preview-grid\[hidden\]\s*\{\s*display:none!important;/);
 assert.doesNotMatch(iconCss,/data-lic-icons-visible="false"[^}]*#taskbar/);
 assert.match(index,/core\/desktop-icon-customization\.css\?v=hide-desktop-icons-20261112/);
 assert.match(index,/core\/desktop-icon-customization\.js\?v=hide-desktop-icons-20261112/);
});


test('Taskbar style gallery offers five distinctive, selectable saved styles',()=>{
 const h=load();
 const html=h.api.markup();
 for(const [id,title] of [
  ['floating','Floating Glass'],
  ['pill','Pill Dock'],
  ['minimal','Minimal'],
  ['aero','Aero Glass'],
  ['classic','Classic']
 ]){
  assert.ok(html.includes('data-ltc-style="'+id+'"'),'Missing '+title+' style card');
  assert.ok(html.includes(title),'Missing '+title+' label');
  assert.match(css,new RegExp('data-ltc-style='+id+'(?:\\]|\\))'),'Style lacks a real taskbar CSS rule: '+id);
 }
 assert.equal(h.api.get().style,'floating','Floating Glass is the cleaner default');
 const clickStyle=id=>h.handlers.click({
  target:{closest:selector=>selector.includes('[data-ltc-style]')?{dataset:{ltcStyle:id}}:null}
 });
 clickStyle('pill');
 assert.equal(h.api.get().style,'pill');
 assert.equal(h.dataset.ltcStyle,'pill');
 assert.equal(JSON.parse(h.saved.get('lolite.taskbar.v1.guest')).style,'pill');
 clickStyle('minimal');
 assert.equal(h.dataset.ltcStyle,'minimal');
 clickStyle('aero');
 assert.equal(h.api.get().style,'aero');
 clickStyle('invalid');
 assert.equal(h.api.get().style,'aero','Invalid styles must be ignored');
 h.api.reset();
 assert.equal(h.api.get().style,'floating');
 assert.equal(h.dataset.ltcStyle,undefined,'Reset removes forced style overrides');
});
test('No oversized opaque black taskbar is forced on the default live preview',()=>{
 assert.match(css,/#lolite-taskbar-settings \.ltc-preview-bar\s*\{/);
 assert.match(css,/left:50%;right:auto;bottom:10px;top:auto/);
 assert.match(css,/width:min\(86%,720px\)/);
 assert.match(css,/\[data-style=minimal\]/);
 assert.match(css,/\[data-style=pill\]/);
 assert.match(css,/\[data-style=aero\]/);
 assert.match(css,/\[data-style=classic\]/);
 assert.match(css,/\[data-ltc-style=floating\]/);
 assert.match(css,/\[data-ltc-style=minimal\][\s\S]*?#desktop #taskbar\{[\s\S]*?background:transparent!important/);
 assert.match(css,/\[data-ltc-position=top\][\s\S]*?#desktop #taskbar/);
 assert.match(css,/var\(--ltc-opacity\)/);
});
