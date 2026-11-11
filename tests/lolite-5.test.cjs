const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=path=>fs.readFileSync(path,'utf8');

function studioHarness(saved=new Map()){
 const events={},out={},motion=[],wallpaper=[],dispatched=[];
 const document={documentElement:{dataset:{},style:{setProperty(key,value){out[key]=value}}},
  getElementById:()=>null,addEventListener(type,fn){(events[type]??=[]).push(fn)}};
 const window={LoliteMotion:{setMode:m=>motion.push(m)},LoliteWallpapers:{setTransitionMode:m=>wallpaper.push(m)},
  dispatchEvent(e){dispatched.push(e)}};
 const storage={getItem:key=>saved.get(key)??null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)};
 vm.runInNewContext(read('core/lolite-5-customization.js'),{window,document,localStorage:storage,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}}},{timeout:2000});
 return {api:window.LoliteCustomizationStudio,document,saved,out,motion,wallpaper,events,dispatched};
}
test('Settings Studio has live window preview and independent desktop and wallpaper controls',()=>{
 const h=studioHarness(),html=h.api.markup();
 assert.match(html,/id="loliteCustomizationStudio"/);
 assert.match(html,/l5-preview-window/);
 assert.match(html,/data-l5-field="windowRadius"/);
 assert.match(html,/data-l5-field="panelOpacity"/);
 assert.match(html,/data-l5-field="taskbarOpacity"/);
 assert.match(html,/data-l5-field="density"/);
 assert.match(html,/data-l5-field="motion"/);
 assert.match(html,/data-l5-field="wallpaperTransition"/);
 assert.match(html,/data-l5-account-open/);
 assert.equal(h.api.get().windowRadius,12);
 assert.equal(h.document.documentElement.dataset.loliteUiDensity,'standard');
 assert.equal(h.out['--l5-window-radius'],'12px');
});
test('Studio settings persist, reject bad values and can be reset safely',()=>{
 const h=studioHarness();
 assert.equal(h.api.set('windowRadius',18),true);
 assert.equal(h.api.set('taskbarOpacity',10),true);
 assert.equal(h.api.set('density','compact'),true);
 assert.equal(h.api.set('motion','snappy'),true);
 assert.equal(h.api.set('wallpaperTransition','cinematic'),true);
 assert.equal(h.saved.get('lolite5WindowRadius'),'18');
 assert.equal(h.api.get().taskbarOpacity,70);
 assert.equal(h.out['--l5-taskbar-opacity'],'70%');
 assert.equal(h.document.documentElement.dataset.loliteUiDensity,'compact');
 assert.equal(h.motion.at(-1),'snappy');
 assert.equal(h.wallpaper.at(-1),'cinematic');
 assert.equal(h.api.set('bogus','x'),false);
 assert.equal(h.api.set('density','untrusted'),true);
 assert.equal(h.api.get().density,'standard');
 const again=studioHarness(h.saved);
 assert.equal(again.api.get().windowRadius,18);
 assert.equal(again.api.get().wallpaperTransition,'cinematic');
 h.api.reset();
 assert.equal(h.api.get().windowRadius,12);
 assert.equal(h.saved.has('lolite5WindowRadius'),false);
 assert.equal(h.api.get().wallpaperTransition,'smooth');
});
test('Studio controls apply live without replacing the Settings page',()=>{
 const h=studioHarness();
 const field={dataset:{l5Field:'windowRadius'},value:'20'};
 field.closest=s=>s.includes('data-l5-field')?field:null;
 for(const fn of h.events.input)fn({target:field});
 assert.equal(h.out['--l5-window-radius'],'20px');
 assert.equal(h.saved.get('lolite5WindowRadius'),'20');
 assert.ok(h.dispatched.some(e=>e.type==='lolite:customizationchange'));
});
test('Desktop motion respects snappy mode and accessibility',()=>{
 const root={dataset:{},classList:{contains:()=>false}};
 const media={matches:false,addEventListener(){}};
 const saved=new Map(),record=[];
 const window={},document={documentElement:root};
 const storage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v))};
 vm.runInNewContext(read('core/motion.js'),{window,document,localStorage:storage,Map,
  matchMedia:()=>media,MutationObserver:class{observe(){}},
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}}},{timeout:2000});
 const api=window.LoliteMotion;
 assert.equal(api.getMode(),'smooth');
 api.setMode('snappy');
 const el={isConnected:true,animate(_frames,options){record.push(options);return {finished:new Promise(()=>{}),cancel(){}}}};
 api.animate(el,[{opacity:0},{opacity:1}],{duration:200});
 assert.equal(record[0].duration,116);
 assert.equal(root.dataset.loliteMotion,'snappy');
 assert.equal(saved.get('loliteMotionMode'),'snappy');
 api.setMode('off');
 let done=false;
 api.animate(el,[{opacity:0},{opacity:1}],{},()=>{done=true});
 assert.equal(api.reduced(),true);assert.equal(done,true);
 assert.equal(record.length,1);
});
test('V5 sidebar, CSS, accounts and wallpaper engine are integrated on the real site',()=>{
 const html=read('index.html'),crimson=read('core/crimson.js');
 const css=read('core/lolite-5.css'),accounts=read('core/accounts.js'),walls=read('core/wallpapers.js');
 assert.match(crimson,/\['studio','Customization Studio','settings'\]/);
 assert.match(crimson,/LoliteCustomizationStudio\?\.markup/);
 assert.ok(html.indexOf('core/lolite-5.css')>html.indexOf('core/desktop-icon-customization.css'));
 assert.ok(html.indexOf('core/lolite-5-customization.js')>html.indexOf('core/wallpapers.js'));
 assert.match(css,/\.l5-studio/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/--l5-window-radius/);
 for(const key of ['loliteMotionMode','loliteWallpaperTransitionMode','lolite5WindowRadius','lolite5TaskbarOpacity']){
  assert.ok(accounts.includes(key),'Account sync is missing '+key);
 }
 assert.match(accounts,/data-account-sync-now/);
 assert.match(accounts,/window\.addEventListener\('online'/);
 assert.match(accounts,/if\(storage\.id!=='guest'\)syncKeys\.add/);
 assert.match(walls,/function transitionTo\(target,newPoster\)/);
 assert.match(walls,/function clearWallpaperFade/);
 assert.match(walls,/preload\.onload=reveal/);
 assert.match(walls,/fadeTimer=setTimeout\(reveal,1500\)/);
 assert.match(walls,/getTransitionMode:\(\)=>transitionMode,setTransitionMode/);
 assert.match(walls,/if\(force\)clearWallpaperFade\(\)/);
});
