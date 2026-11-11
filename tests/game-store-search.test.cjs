const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const script=fs.readFileSync('core/game-store.js','utf8');

function setup(){
 const events={},windowEvents={},results={innerHTML:''};
 const input={value:'',matches:s=>s==='.store-v41 .store-search',focus(){}};
 const clear={hidden:true};
 const category={value:'All Games'};
 const toolbar={querySelector(s){
  if(s==='.store-search')return input;
  if(s==='[data-store-clear-search]')return clear;
  if(s==='[data-store-category-jump]')return category;
  return null;
 }};
 const store={dataset:{},querySelectorAll:()=>[]};
 const main={
  markup:'',scrollTop:0,dataset:{},
  closest:s=>s==='.store-v41'?store:null,
  querySelector(s){
   if(s==='.store-top')return this.markup.includes('class="store-top"')?toolbar:null;
   if(s==='.store-results')return this.markup.includes('class="store-results"')?results:null;
   return null;
  },
  querySelectorAll:()=>[],
  get innerHTML(){return this.markup},
  set innerHTML(v){this.markup=v;results.innerHTML=''}
 };
 const style={textContent:''};
 const document={
  baseURI:'https://lolite.example/',
  activeElement:null,
  documentElement:{dataset:{},classList:{contains:()=>false}},
  head:{appendChild(){}},
  getElementById:()=>style,
  createElement:()=>({style:{},textContent:''}),
  querySelector:s=>s==='.store-main'?main:s==='.store-v41'?store:s==='.store-v41 .store-search'?input:null,
  querySelectorAll:()=>[],
  addEventListener(type,fn){(events[type]??=[]).push(fn)}
 };
 const win={
  page:id=>id,
  addEventListener(type,fn){(windowEvents[type]??=[]).push(fn)},
  dispatchEvent(evt){for(const fn of windowEvents[evt.type]||[])fn(evt)},
  LoliteEconomy:{gamePrice:()=>0,hasGame:()=>true},
  LoliteGameHealth:{isUnavailable:()=>false,summary:()=>({}),scan:()=>Promise.resolve({})}
 };
 const ctx={
  window:win,document,localStorage:{getItem:()=>null,setItem(){}},
  location:{origin:'https://lolite.example'},console:{warn(){},error(){},info(){}},
  Map,Set,Math,Date,URL,Number,AbortController,
  MutationObserver:class{observe(){}disconnect(){}},
  IntersectionObserver:class{observe(){}unobserve(){}},
  ResizeObserver:class{observe(){}disconnect(){}},
  Image:class{set src(v){this._src=v}},
  fetch:async()=>({ok:false,status:404,json:async()=>[]}),
  setTimeout(){return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){},
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}}
 };
 vm.runInNewContext(script,ctx,{timeout:6000});
 return {win,events,document,input,clear,main,results,category};
}

test('Search is global, not restricted to the previously selected category',()=>{
 const h=setup();
 h.win.loliteStoreCategory('Racing & Driving');
 h.win.loliteStoreSearch('minecraft');
 assert.match(h.results.innerHTML,/Minecraft: Pocket Edition/);
 h.win.loliteStoreCategory('Popular Games');
 h.win.loliteStoreSearch('baldi');
 assert.match(h.results.innerHTML,/Baldi/);
 assert.match(h.results.innerHTML,/Search results for/);
});

test('Search matches abbreviations and punctuation-free titles',()=>{
 const h=setup();
 h.win.loliteStoreCategory('All Games');
 h.win.loliteStoreSearch('gta vice');
 assert.match(h.results.innerHTML,/Grand Theft Auto/);
 h.win.loliteStoreSearch('geometrydash');
 assert.match(h.results.innerHTML,/Geometry Dash/);
 h.win.loliteStoreSearch('fnaf');
 assert.match(h.results.innerHTML,/Five Nights at Freddy/);
 h.win.loliteStoreSearch('nothere987123');
 assert.match(h.results.innerHTML,/No games found/);
});

test('Health and wallet refresh do not destroy focused search or input value',()=>{
 const h=setup();
 h.win.loliteStoreCategory('All Games');
 h.win.loliteStoreSearch('minecraft');
 const toolbarMarkup=h.main.innerHTML;
 h.input.value='minecraft';h.document.activeElement=h.input;
 h.win.dispatchEvent({type:'lolite-wallet-updated'});
 h.win.dispatchEvent({type:'lolite:gamehealthchange'});
 assert.equal(h.main.innerHTML,toolbarMarkup);
 assert.equal(h.document.activeElement,h.input);
 assert.equal(h.input.value,'minecraft');
 assert.equal(h.clear.hidden,false);
 assert.match(h.results.innerHTML,/Minecraft/);
});

test('Native clear-search, Escape and IME commit update the existing toolbar',()=>{
 const h=setup();
 h.win.loliteStoreCategory('Racing & Driving');
 h.win.loliteStoreSearch('minecraft');
 const button={closest:s=>s.includes('data-store-clear-search')?button:null};
 for(const fn of h.events.click||[])fn({target:button,preventDefault(){}});
 assert.equal(h.clear.hidden,true);
 assert.match(h.results.innerHTML,/Racing/);
 const searchInput={value:'fnaf',closest:s=>s.includes('store-search')?searchInput:null};
 for(const fn of h.events.compositionend||[])fn({target:searchInput});
 assert.match(h.results.innerHTML,/Five Nights at Freddy/);
 searchInput.value='fnaf';
 const evt={target:searchInput,key:'Escape',preventDefault(){this.prevented=true}};
 for(const fn of h.events.keydown||[])fn(evt);
 assert.equal(evt.prevented,true);
 assert.equal(searchInput.value,'');
 assert.equal(h.clear.hidden,true);
});

test('Search controls retain accessibility, responsive layout and fast-path optimizations',()=>{
 const css=fs.readFileSync('core/game-store-ui-cleanup.css','utf8');
 assert.match(script,/aria-label="Search all games"/);
 assert.match(script,/data-store-clear-search/);
 assert.match(script,/lastBackgroundHealthScan/);
 assert.match(script,/if\(!keepToolbar&&!query\.trim\(\)\)\{refreshActivity\(\);refreshSidebarIcons\(\)\}/);
 assert.match(script,/visibleCount=next\.trim\(\)\?30:60/);
 assert.match(css,/\.store-clear-search\[hidden\]\{display:none!important\}/);
});
