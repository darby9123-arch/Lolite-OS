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
