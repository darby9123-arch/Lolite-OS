const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.resolve(__dirname,'..',file),'utf8');

function harness(counts={}){
 const document={
  baseURI:'https://lolite.example/',
  head:{appendChild(){}},
  documentElement:{dataset:{},classList:{contains:()=>false}},
  getElementById:()=>({textContent:''}),
  createElement:tag=>({tagName:tag.toUpperCase(),style:{},textContent:''}),
  querySelector:()=>null,querySelectorAll:()=>[],
  addEventListener(){}
 };
 const art={
  'clminecraftpocketedition.html':{title:'Minecraft: Pocket Edition',src:'https://covers.example/minecraft.png'},
  'clblockblast.html':{title:'Block Blast',src:'https://covers.example/blockblast.png'},
  'Drift-Hunters.html':{title:'Drift Hunters',src:'https://covers.example/drift.png'},
  'clbaldisbasics.html':{title:'Baldi’s Basics',src:'https://covers.example/baldi.png'},
  'clFNAF.html':{title:'Five Nights at Freddy’s',src:'https://covers.example/fnaf.png'},
  'clsupermariobros.html':{title:'Super Mario Bros.',src:'https://covers.example/mario.png'},
  'Geometry Dash webport.html':{title:'Geometry Dash',src:'assets/games/geometry-dash-full-logo.svg'}
 };
 const win={
  page:id=>id,
  addEventListener(){},dispatchEvent(){},
  loliteGameArt:art,
  LoliteGameHealth:{isUnavailable:()=>false},
  LoliteEconomy:{gamePrice:()=>0,hasGame:()=>true},
  LoliteGamePopularity:{
   countFor:file=>counts[file]||0,
   isEligible:()=>true
  }
 };
 const sandbox={
  window:win,document,console:{warn(){},error(){},info(){}},Math,Date,URL,Map,Set,Number,
  localStorage:{getItem:()=>null,setItem(){}},
  location:{origin:'https://lolite.example'},
  MutationObserver:class{observe(){}disconnect(){}},
  IntersectionObserver:class{observe(){}unobserve(){}},
  Image:class{set src(v){this._src=v}},
  fetch:async()=>({ok:false,status:404,json:async()=>[]}),
  setInterval(){},setTimeout(){},clearTimeout(){},clearInterval(){},
  CustomEvent:class{constructor(type,props){this.type=type;this.detail=props?.detail}}
 };
 vm.runInNewContext(read('core/game-store.js'),sandbox,{timeout:2000});
 return win;
}
function categoryIcon(html,name){
 const tag='<button type="button"';
 return html.split(tag).find(part=>part.includes('data-category="'+name+'"'))||'';
}
test('Sidebar uses representative game thumbnails instead of text badges',()=>{
 const win=harness(),html=win.page('games');
 for(const [category,fragment] of [
  ['All Games','minecraft.png'],['Sandbox &amp; Building','minecraft.png'],
  ['Puzzle &amp; Brain','blockblast.png'],['Racing &amp; Driving','drift.png'],
  ['Baldi’s Basics','baldi.png'],['Horror &amp; Survival','fnaf.png'],
  ['Platformers','mario.png'],['Featured','geometry-dash-full-logo.svg']
 ]){
  const button=categoryIcon(html,category);
  assert.ok(button,'Missing sidebar category '+category);
  assert.match(button,/class="nav-game-thumb"/);
  assert.ok(button.includes(fragment),category+' should display '+fragment);
 }
 assert.doesNotMatch(html,/class="nav-mark" aria-hidden="true">(?:ALL|RACE|PUZ|BB|HTML|TOP|JUMP)</);
 assert.match(html,/assets\/icons\/cosmos\/selected\/games.png/);
});
test('Popular Games navigation favors actual recent launch counts',()=>{
 const win=harness({'Drift-Hunters.html':25,'clblockblast.html':12});
 const html=win.page('games');
 assert.match(categoryIcon(html,'Popular Games'),/drift.png/);
 assert.match(categoryIcon(html,'Racing &amp; Driving'),/drift.png/);
});
test('Favorites and recent games still navigate and use game icons when populated',()=>{
 const win=harness();
 win.LoliteGameStoreGallery.toggleFavorite('clFNAF.html');
 win.LoliteGameStoreGallery.recordRecent('clminecraftpocketedition.html');
 const html=win.page('games');
 assert.match(categoryIcon(html,'Favorites'),/fnaf.png/);
 assert.match(categoryIcon(html,'Recently Played'),/minecraft.png/);
 assert.match(html,/data-category="Favorites"/);
 assert.match(html,/data-category="Recently Played"/);
});
test('Responsive CSS gives game thumbnails an image rather than a text style',()=>{
 const css=read('core/game-store-gallery.css');
 assert.match(css,/\.nav-game-thumb\{/);
 assert.match(css,/object-fit:cover/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
