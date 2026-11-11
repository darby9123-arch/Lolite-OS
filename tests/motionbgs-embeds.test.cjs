const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const source=read('core/motionbgs-embeds.js');
const player=read('core/wallpapers.js');
function catalog(){
 const window={};
 vm.runInNewContext(source,{window,encodeURIComponent});
 return window.LoliteMotionBGSEmbeds;
}
test('16 MotionBGS remote embeds have stable distinct IDs and official source URLs',()=>{
 const {catalog:items}=catalog();
 assert.equal(items.length,16);
 assert.equal(new Set(items.map(w=>w.id)).size,items.length);
 for(const w of items){
  assert.match(w.id,/^motionbgs-[a-z0-9-]+$/);
  assert.equal(w.category,'Embedded Wallpapers');
  assert.equal(w.provider,'MotionBGS · Remote Embed');
  assert.equal(w.embedded,true);
  assert.match(w.source,/^https:\/\/motionbgs\.com\/[a-z0-9-]+$/);
  assert.match(w.video,/^https:\/\/motionbgs\.com\/dl\/hd\/[0-9]+$/);
  assert.match(w.src1080,/^https:\/\/motionbgs\.com\/dl\/hd\/[0-9]+$/);
  if(w.src4k)assert.match(w.src4k,/^https:\/\/motionbgs\.com\/dl\/4k\/[0-9]+$/);
  assert.match(decodeURIComponent(w.poster.slice('data:image/svg+xml,'.length)),/<svg[^>]+/);
 }
});
test('Embedding never loads MotionBGS pages as iframe and never republishes the video',()=>{
 assert.doesNotMatch(source,/\.mp4["']/);
 assert.doesNotMatch(source,/<iframe|document\.createElement\(['"]iframe/);
 assert.doesNotMatch(source,/fetch\(|XMLHttpRequest/);
 assert.match(player,/!wall\.embedded&&window\.LoliteSeamlessVideo/);
 assert.match(player,/el\.loop=true/);
 assert.match(player,/report\('Video unavailable · Try again'\)/);
});
test('Embedded collection remains out of All and non-embedded categories',()=>{
 assert.match(player,/const motionBGS=Array\.isArray\(window\.LoliteMotionBGSEmbeds\?\.catalog\)/);
 assert.match(player,/collection=\[\.\.\.catalog\.catalog\.map/);
 assert.match(player,/filter==='All'&&!wall\.embedded/);
 assert.match(player,/filter==='Embedded Wallpapers'&&!!wall\.embedded/);
 assert.match(player,/!wall\.embedded&&filter==='4K'/);
 assert.match(player,/if\(motionBGS\.length\)cats\.push\('Embedded Wallpapers'\)/);
 assert.match(player,/View on MotionBGS/);
 assert.match(player,/Remote streaming may be restricted|If playback is blocked/);
});
test('MotionBGS catalogue loads before wallpaper engine and keeps the normal library',()=>{
 const html=read('index.html');
 assert.ok(html.indexOf('core/lively-wallpapers-catalog.js')>=0);
 assert.ok(html.indexOf('core/motionbgs-embeds.js')>html.indexOf('core/lively-wallpapers-catalog.js'));
 assert.ok(html.indexOf('core/motionbgs-embeds.js')<html.indexOf('core/wallpapers.js'));
 assert.match(read('tests/local-live-wallpapers.test.cjs'),/catalog\.length,840/);
});
