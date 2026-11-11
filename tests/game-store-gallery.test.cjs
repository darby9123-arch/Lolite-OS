const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

function storeHarness(saved=new Map()){
 const listeners={};
 const style={id:'lolite-game-store-style',textContent:''};
 const document={
  baseURI:'https://lolite.example/Lolite-OS/',
  head:{appendChild(){}},
  documentElement:{dataset:{},classList:{contains:()=>false}},
  getElementById:()=>style,
  createElement:tag=>({tagName:tag.toUpperCase(),id:'',style:{},textContent:''}),
  querySelector:()=>null,querySelectorAll:()=>[],
  addEventListener:(type,fn)=>{listeners[type]=fn}
 };
 const localStorage={
  getItem:key=>saved.has(key)?saved.get(key):null,
  setItem:(key,value)=>{saved.set(key,String(value))}
 };
 const win={
  page:id=>'<div>'+id+'</div>',
  addEventListener(){},dispatchEvent(){},
  LoliteGameHealth:{isUnavailable:()=>false},
  LoliteEconomy:{gamePrice:()=>0,hasGame:()=>true}
 };
 const context={
  window:win,document,localStorage,
  location:{origin:'https://lolite.example'},
  console:{warn(){},error(){},info(){}},
  Math,Date,Map,Set,URL,Number,
  MutationObserver:class{observe(){}disconnect(){}},
  IntersectionObserver:class{observe(){}unobserve(){}disconnect(){}},
  fetch:async()=>({ok:false,status:404,json:async()=>[]}),
  setInterval(){return 1},setTimeout(){return 1},
  clearInterval(){},clearTimeout(){},
  Image:class{set src(value){this._src=value}},AbortController,
  CustomEvent:class{constructor(type,args){this.type=type;this.detail=args?.detail}}
 };
 vm.runInNewContext(read('core/game-store.js'),context,{timeout:1800});
 return {win,document,saved,listeners,style};
}

test('Game Store layout uses the uploaded reference composition, not another standalone demo',()=>{
 const js=read('core/game-store.js'),css=read('core/game-store-gallery.css'),html=read('index.html');
 assert.match(js,/store store-v41/);
 assert.match(js,/store-logo-symbol/);
 assert.match(js,/store-social-inner/);
 assert.match(js,/store-cover-launch/);
 assert.match(js,/store-favourite/);
 assert.match(js,/MORE COLLECTIONS/);
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/store-cover-picture/);
 assert.match(css,/store-social/);
 assert.match(css,/data-size="compact"/);
 assert.match(css,/data-size="small"/);
 assert.match(html,/core\/game-store-gallery\.css/);
 assert.ok(html.indexOf('core/game-store-compact.css')<html.indexOf('core/game-store-gallery.css'));
 assert.ok(html.indexOf('core/game-store-gallery.css')<html.indexOf('core/game-store.js'));
});
test('New Store preserves real servers, game artwork and original launch code',()=>{
 const js=read('core/game-store.js');
 assert.match(js,/serverPickerMarkup\(g\)/);
 assert.match(js,/window\.loliteStorePlay=file=>/);
 assert.match(js,/window\.LoliteGamePlayer\?\.open/);
 assert.match(js,/window\.loliteStorePickServer=/);
 assert.match(js,/const coverFor=file=>/);
 assert.match(js,/window\.loliteStorePreview=/);
 assert.match(js,/window\.LoliteGameSearch=/);
 assert.match(js,/const ranked=list=>/);
 assert.doesNotMatch(js,/fake online friends|hardcoded friend statuses/i);
});
test('Bookmarks persist and Favorites is a real browseable collection',()=>{
 const h=storeHarness();
 const html=h.win.page('games');
 assert.match(html,/class="store store-v41"/);
 assert.match(html,/data-category="Favorites"/);
 assert.match(html,/data-category="Recently Played"/);
 assert.match(html,/class="store-social"/);
 const api=h.win.LoliteGameStoreGallery;
 assert.equal(api.isFavorite('clblockblast.html'),false);
 assert.equal(api.toggleFavorite('clblockblast.html'),true);
 assert.equal(api.isFavorite('clblockblast.html'),true);
 assert.deepEqual(JSON.parse(h.saved.get('loliteGameFavoritesV1')),['clblockblast.html']);
 h.win.loliteStoreCategory('Favorites');
 assert.match(h.win.page('games'),/data-category="Favorites" aria-pressed="true"/);
 const other=storeHarness(h.saved);
 assert.equal(other.win.LoliteGameStoreGallery.isFavorite('clblockblast.html'),true);
 assert.equal(other.win.LoliteGameStoreGallery.toggleFavorite('clblockblast.html'),false);
 assert.deepEqual(JSON.parse(h.saved.get('loliteGameFavoritesV1')),[]);
});
test('Recently played is recorded locally and the sidebar shows genuine history',()=>{
 const h=storeHarness();
 const api=h.win.LoliteGameStoreGallery;
 assert.match(api.getActivityMarkup(),/No games played yet/);
 assert.match(api.getActivityMarkup(),/Loading player activity/);
 api.recordRecent('clblockblast.html');
 api.recordRecent('slope.html');
 api.recordRecent('clblockblast.html');
 assert.equal(api.getRecent().length,2);
 assert.equal(api.getRecent()[0].file,'clblockblast.html');
 assert.equal(api.getRecent()[1].file,'slope.html');
 assert.equal(api.getActivityMarkup().includes('No games played yet'),false);
 assert.match(api.getActivityMarkup(),/Block Blast/i);
 assert.match(JSON.stringify(api.getRecent()),/at/);
 assert.deepEqual(JSON.parse(h.saved.get('loliteGameRecentlyPlayedV1')).map(x=>x.file),['clblockblast.html','slope.html']);
});
test('Click routes use data attributes rather than injecting filenames into new inline JS',()=>{
 const js=read('core/game-store.js');
 assert.match(js,/data-store-launch/);
 assert.match(js,/data-store-favorite/);
 assert.match(js,/document\.addEventListener\('click',event=>/);
 assert.match(js,/window\.loliteStoreAction\(node\.dataset\.storeLaunch\)/);
 assert.match(js,/toggleFavourite\(node\.dataset\.storeFavorite\)/);
 assert.match(js,/window\.loliteStoreCategory\(node\.dataset\.category\)/);
});
