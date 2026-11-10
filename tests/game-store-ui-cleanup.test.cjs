const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

function harness(){
 const listeners={};
 const results={innerHTML:''};
 const store={dataset:{}};
 const main={
  _markup:'',scrollTop:0,dataset:{},results,
  closest:selector=>selector==='.store-v41'?store:null,
  querySelector(selector){
   if(selector==='.store-top')return this._markup.includes('class="store-top"')?{}:null;
   if(selector==='.store-results')return this._markup.includes('class="store-results"')?results:null;
   return null;
  },
  querySelectorAll:()=>[],
  get innerHTML(){return this._markup},
  set innerHTML(value){this._markup=value;results.innerHTML=''}
 };
 const style={id:'lolite-game-store-style',textContent:''};
 const document={
  baseURI:'https://lolite.example/Lolite-OS/',
  head:{appendChild(){}},
  documentElement:{dataset:{},classList:{contains:()=>false}},
  getElementById:id=>id==='lolite-game-store-style'?style:null,
  createElement:tag=>({tagName:tag.toUpperCase(),id:'',style:{},textContent:''}),
  querySelector:selector=>selector==='.store-main'?main:null,
  querySelectorAll:()=>[],
  addEventListener:(type,fn)=>{(listeners[type]??=[]).push(fn)}
 };
 const saved=new Map();
 const localStorage={
  getItem:key=>saved.get(key)||null,
  setItem:(key,value)=>saved.set(key,String(value))
 };
 const win={
  page:id=>'<div>'+id+'</div>',
  addEventListener(){},dispatchEvent(){},
  LoliteGameHealth:{isUnavailable:()=>false,scan:async()=>({}),summary:()=>({})},
  LoliteEconomy:{gamePrice:()=>0,hasGame:()=>true}
 };
 const context={
  window:win,document,localStorage,
  location:{origin:'https://lolite.example'},
  console:{warn(){},error(){},info(){}},
  Map,Set,Number,Date,URL,Math,
  MutationObserver:class{observe(){}disconnect(){}},
  IntersectionObserver:class{observe(){}unobserve(){}disconnect(){}},
  ResizeObserver:class{observe(){}unobserve(){}disconnect(){}},
  Image:class{set src(value){this._src=value}},
  AbortController,
  fetch:async()=>({ok:false,status:404,json:async()=>[]}),
  setTimeout(){return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){},
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}}
 };
 vm.runInNewContext(read('core/game-store.js'),context,{timeout:5000});
 return {main,win,listeners,store};
}

test('The final stylesheet resolves hover-only controls into visible, readable card layouts',()=>{
 const css=read('core/game-store-ui-cleanup.css');
 const html=read('index.html');
 assert.match(css,/\.store\.store-v41 \.store-card \.store-card-actions\{/);
 assert.match(css,/max-height:none!important/);
 assert.match(css,/opacity:1!important;visibility:visible!important/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) auto!important/);
 assert.match(css,/\.store-card h3\{/);
 assert.match(css,/line-clamp:2!important/);
 assert.match(css,/\.store-category-jump\{display:flex!important\}/);
 assert.ok(html.indexOf('game-store-gallery.css')<html.indexOf('game-store-ui-cleanup.css'));
 assert.ok(html.indexOf('lolite-4-1.css')<html.indexOf('game-store-ui-cleanup.css'));
 assert.match(html,/game-store\.js\?v=store-ui-cleanup-20261111-1/);
});

test('Narrow-window category selector includes all existing game collections',()=>{
 const h=harness();
 h.win.loliteStoreCategory('All Games');
 assert.match(h.main.innerHTML,/data-store-category-jump/);
 assert.match(h.main.innerHTML,/Racing &amp; Driving/);
 assert.match(h.main.innerHTML,/value="Favorites"/);
 assert.match(h.main.innerHTML,/value="All Games" selected/);
 h.main.scrollTop=70;
 const select={value:'Racing & Driving',closest:selector=>selector.includes('data-store-category-jump')?select:null};
 for(const handler of h.listeners.change||[])handler({target:select});
 assert.match(h.main.innerHTML,/value="Racing &amp; Driving" selected/);
 assert.equal(h.main.scrollTop,0);
});

test('Live search updates results without replacing the focused toolbar',()=>{
 const h=harness();
 h.win.loliteStoreCategory('All Games');
 const toolbarMarkup=h.main.innerHTML;
 h.main.scrollTop=83;
 h.win.loliteStoreSearch('geometry');
 assert.equal(h.main.innerHTML,toolbarMarkup,'search should not replace the toolbar element');
 assert.match(h.main.results.innerHTML,/Search results/);
 assert.equal(h.main.scrollTop,0);
 h.win.loliteStoreSearch('geometr');
 assert.equal(h.main.innerHTML,toolbarMarkup);
 assert.match(h.main.results.innerHTML,/Search results/);
});

test('Incremental load-more keeps store scroll state',()=>{
 const h=harness();
 h.win.loliteStoreCategory('All Games');
 h.main.scrollTop=235;
 h.win.loliteStoreMore();
 assert.equal(h.main.scrollTop,235);
 assert.ok(h.main.results.innerHTML.length>0);
});

test('Server picker uses delegated change events and preserves original launch logic',()=>{
 const js=read('core/game-store.js');
 assert.match(js,/data-source-game/);
 assert.doesNotMatch(js,/onchange=\\'window\.loliteStorePickServer/);
 assert.match(js,/source=event\.target\.closest\?\.\('\.store-v41 \.store-server-select'\)/);
 assert.match(js,/window\.loliteStorePickServer\(source\.dataset\.sourceGame,source\.value\)/);
 assert.match(js,/window\.loliteStorePlay=file=>/);
 assert.match(js,/window\.LoliteGamePlayer\?\.open/);
});

test('IME composition updates results on completion, not during intermediate characters',()=>{
 const h=harness();
 h.win.loliteStoreCategory('All Games');
 const input={value:'geometry',closest:sel=>sel.includes('store-search')?input:null};
 h.main.results.innerHTML='sentinel';
 for(const handler of h.listeners.input||[])handler({target:input,isComposing:true});
 assert.equal(h.main.results.innerHTML,'sentinel');
 for(const handler of h.listeners.compositionend||[])handler({target:input});
 assert.match(h.main.results.innerHTML,/Search results/);
});
