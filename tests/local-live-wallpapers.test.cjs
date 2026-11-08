const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function catalog(){
 const context={window:{},URL,encodeURIComponent};
 vm.runInNewContext(read('core/live-wallpapers-catalog.js'),context);
 return context.window.LoliteLiveWallpapers.catalog;
}
test('36 original live scenes render without any local video install or remote stream',()=>{
 const walls=catalog();
 assert.equal(walls.length,36);
 assert.equal(new Set(walls.map(w=>w.id)).size,36);
 assert.ok(walls.every(w=>w.scene&&w.motion&&w.poster&&w.palette));
 assert.ok(walls.every(w=>w.src.startsWith('data:image/svg+xml,')));
 assert.ok(walls.every(w=>!w.video&&!w.local&&!w.src4k&&!w.src1080));
 const set=new Set(walls.map(w=>w.scene));
 assert.ok(set.size>=20,'Diverse animation types must exist');
});
test('Wallpaper category mix includes nature, neon, space, city and abstract',()=>{
 const cats=new Set(catalog().map(w=>w.category));
 for(const category of ['Space','Nature','City','Neon','Abstract'])assert.ok(cats.has(category));
});
test('All scene previews decode into standalone valid SVG image markup',()=>{
 for(const wall of catalog()){
  const xml=decodeURIComponent(wall.src.slice('data:image/svg+xml,'.length));
  assert.match(xml,/<svg[^>]+viewBox=/);
  assert.match(xml,/<linearGradient/);
  assert.match(xml,/<\/svg>$/);
  assert.doesNotMatch(xml,/https?:|<script|onerror=/i);
 }
});
test('Original static backgrounds and saved selections remain available',()=>{
 const js=read('core/wallpapers.js');
 const oldFiles=['cosmos-orbit.svg','crimson-dunes.webp','crimson-fold.svg',
  'red-ridges.svg','pine-silence.svg','tidal-night.svg','lunar.svg',
  'contour.svg','carbon.svg','rain-city.svg'];
 for(const f of oldFiles)assert.ok(fs.existsSync(path.join(root,'assets/wallpapers',f)));
 assert.match(js,/const legacy=/);
 assert.match(js,/setCustom\(image\)/);
 assert.match(js,/window\.LoliteWallpapers=/);
});
test('New controls do not request local video imports or unhosted videos',()=>{
 const html=read('index.html'),js=read('core/wallpapers.js');
 const settings=read('core/crimson.js');
 assert.match(html,/src="core\/live-wallpapers-catalog\.js/);
 assert.doesNotMatch(html,/src="core\/user-live-wallpapers\.js/);
 assert.ok(html.indexOf('core/live-wallpapers-catalog.js')<html.indexOf('core/wallpapers.js'));
 for(const source of [js,settings]){
  assert.doesNotMatch(source,/data-wall-pack-upload|LoliteWallpaperImports|Import video wallpapers|lolite:wallpaperpackchange/);
 }
});
test('Highest quality targets native 4K screens, while others have pixel budgets',()=>{
 const js=read('core/wallpapers.js'),settings=read('core/crimson.js');
 assert.match(js,/16_000_000/);
 assert.match(js,/devicePixelRatio/);
 assert.match(js,/canvas\.width=Math\.max/);
 assert.match(js,/requestAnimationFrame\(tick\)/);
 assert.match(settings,/Highest · native \/ 4K\+/);
 assert.match(settings,/Balanced/);
 assert.match(settings,/Performance/);
});
test('Only one live scene runs and browser visibility pauses playback',()=>{
 const js=read('core/wallpapers.js');
 assert.match(js,/cancelAnimationFrame\(raf\)/);
 assert.match(js,/canvas\.remove\(\)/);
 assert.match(js,/document\.addEventListener\('visibilitychange',sync\)/);
 assert.match(js,/media\.addEventListener\?\.\('change',sync\)/);
 assert.match(js,/root\.classList\.contains\('browsing-mode'\)/);
});
