const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

function editorHarness(){
 const saved=new Map(),styles=new Map(),listeners=new Map(),windowListeners=new Map();
 const root={
  dataset:{desktopTheme:'cosmos'},
  style:{setProperty(k,v){styles.set(k,String(v))},removeProperty(k){styles.delete(k)}},
  classList:{states:new Set(),toggle(k,val){if(val)this.states.add(k);else this.states.delete(k)}}
 };
 const doc={
  documentElement:root,readyState:'complete',
  addEventListener(type,fn){listeners.set(type,fn)},
  getElementById(){return null},
  querySelector(){return null}
 };
 const win={
  innerWidth:1200,
  addEventListener(type,fn){windowListeners.set(type,fn)},
  LoliteBrowserAccounts:null
 };
 const localStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};
 vm.runInNewContext(read('core/desktop-icon-customization.js'),{
  document:doc,window:win,localStorage,
  console:{warn(){}},Math,Number,String,Array,Object
 },{timeout:3500});
 function change(name,value,checked=false){
  const input={dataset:{licField:name},value,checked};
  input.closest=()=>input;
  listeners.get('input')?.({target:input});
 }
 return {api:win.LoliteIconCustomization,root,styles,saved,change};
}

test('Desktop icon settings present actual logo colour and independent tile and glass choices',()=>{
 const h=editorHarness(),markup=h.api.markup();
 for(const field of ['symbolMode','symbolColor','tileSource','finish','glassBlur','size','opacity','visible','position']){
  assert.match(markup,new RegExp(field),'Missing editor control '+field);
 }
 for(const option of ['Frosted glass','Soft solid','Minimal / transparent','Match wallpaper','Original icon colours']){
  assert.ok(markup.includes(option),'Missing style option '+option);
 }
 assert.ok(markup.includes('LIVE DESKTOP PREVIEW'));
});
test('Desktop icon editor saves independent custom SVG ink and frosted-glass preferences',()=>{
 const h=editorHarness();
 h.change('symbolMode','custom');
 h.change('symbolColor','#d94a95');
 h.change('tileSource','custom');
 h.change('color','#3e5daa');
 h.change('finish','glass');
 h.change('glassBlur','18');
 const state=h.api.get();
 assert.equal(state.symbolMode,'custom');
 assert.equal(state.symbolColor,'#d94a95');
 assert.equal(state.color,'#3e5daa');
 assert.equal(state.tileSource,'custom');
 assert.equal(state.finish,'glass');
 assert.equal(state.glassBlur,18);
 assert.equal(h.root.dataset.licFinish,'glass');
 assert.equal(h.root.dataset.licSymbolMode,'custom');
 assert.equal(h.styles.get('--lic-symbol-color'),'#d94a95');
 assert.equal(h.styles.get('--lic-glass-blur'),'18px');
 assert.ok(h.saved.has('lolite.desktop-icons.v1.guest'));
 h.api.reset();
 assert.equal(h.root.classList.states.has('lic-applied'),false);
 assert.equal(h.root.dataset.licFinish,undefined);
 assert.equal(h.styles.has('--lic-symbol-color'),false);
});
test('All branded symbols expose their actual coloured paths through CSS variables',()=>{
 const elements=new Map();
 const doc={
  head:{appendChild(node){elements.set(node.id,node)}},
  getElementById(id){return elements.get(id)||null},
  createElement(){return {id:'',textContent:''}}
 };
 const window={LoliteIcons:{names:['fallback'],resolve:id=>id,tile:id=>'<fallback>'+id+'</fallback>'}};
 for(const file of ['core/app-icon-brand-pack.js','core/app-icon-brand-rest.js']){
  vm.runInNewContext(read(file),{window,document:doc},{timeout:3500});
 }
 for(const key of ['music','spotify','steam','youtube','discord','roblox','browser','calculator','paint']){
  const art=window.LoliteIcons.tile(key);
  assert.match(art,/<svg/,'Missing SVG for '+key);
  assert.match(art,/var\(--lic-symbol-color,#/,'Actual ink cannot be recoloured in '+key);
 }
 assert.match(window.LoliteIcons.tile('unknown'),/fallback/);
});
test('Refined icon material CSS follows theme styles and keeps glass translucent',()=>{
 const html=read('index.html'),css=read('core/icon-material-polish.css');
 assert.ok(html.includes('core/icon-material-polish.css'));
 assert.ok(html.indexOf('core/icon-material-polish.css')>html.indexOf('core/desktop-icon-customization.css'));
 assert.match(css,/data-lic-finish="glass"/);
 assert.match(css,/backdrop-filter:blur\(var\(--lic-glass-blur,12px\)\)/);
 assert.match(css,/data-lic-finish="minimal"/);
 assert.match(css,/\.lic-mini-icon/);
 assert.match(css,/--lic-symbol-color/);
 assert.match(css,/background:transparent!important/);
});
