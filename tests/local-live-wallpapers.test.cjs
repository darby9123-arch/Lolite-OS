const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
function catalogue(){
 const context={window:{}};vm.runInNewContext(read('core/lively-wallpapers-catalog.js'),context);
 return context.window.LoliteLivelyWallpapers;
}
test('all 840 source entries have unique IDs, original MP4s and real poster metadata',()=>{
 const {catalog,defaultId}=catalogue();
 assert.equal(catalog.length,840);assert.equal(new Set(catalog.map(w=>w.id)).size,840);
 assert.equal(defaultId,catalog[0].id);
 for(const wall of catalog){
  assert.match(wall.id,/^lively-[a-z0-9-]+$/);
  assert.match(wall.video,/^https:\/\/cdn\.livelywallpaper\.app\/wallpapers\/[a-z0-9-]+\/download\.mp4$/);
  assert.match(wall.preview,/\/preview\.mp4$/);
  assert.match(wall.poster,/^https:\/\/cdn\.livelywallpaper\.app\/images\/wallpapers\/library\/.+-640\.webp$/);
  assert.match(wall.source,/^https:\/\/livelywallpaper\.app\/live-wallpapers\//);
  assert.ok(wall.width>0&&wall.height>0&&wall.duration>0);
  assert.ok(wall.palette.length&&wall.palette.every(c=>/^#[0-9a-f]{6}$/.test(c)));
  assert.equal(wall.scene,undefined);
 }
 assert.equal(catalog.filter(w=>w.src1080).length,240);
 assert.equal(catalog.filter(w=>w.resolution==='4K').length,750);
});
test('all six source categories are included with their full original counts',()=>{
 const counts={};for(const wall of catalogue().catalog)counts[wall.category]=(counts[wall.category]||0)+1;
 assert.deepEqual(counts,{'Games':195,'Art & Fantasy':100,'Cars':130,'Anime':193,'Nature':140,'Space':82});
});
test('startup loads only the replacement catalogue before the player',()=>{
 const html=read('index.html');
 assert.match(html,/src="core\/lively-wallpapers-catalog\.js/);
 assert.doesNotMatch(html,/src="core\/(?:live-wallpapers-catalog|interactive-wallpapers|uploaded-wallpapers-catalog|user-live-wallpapers)\.js/);
 assert.ok(html.indexOf('core/lively-wallpapers-catalog.js')<html.indexOf('core/wallpapers.js'));
 assert.ok(html.indexOf('core/performance-mode.js')<html.indexOf('core/wallpapers.js'));
 const ui=read('core/crimson.js');
 assert.doesNotMatch(ui,/52 original moving wallpapers|Interactive mouse effects|data-wall-interactive/);
 assert.match(ui,/Original · up to 4K/);assert.match(ui,/Balanced · HD when available/);
 assert.match(ui,/data-wall-retry/);
});
test('wallpaper defaults migrate once and old auto-discovery is disabled',()=>{
 const source=read('core/wallpapers.js');
 assert.match(source,/loliteWallpaperCollection/);
 assert.match(source,/const discoverVideos=async\(\)=>\[\]/);
 assert.doesNotMatch(source,/collection\.push\(\.\.\.\(window\.Lolite(?:Live|Interactive|Uploaded)Wallpapers/);
 assert.match(source,/Date\.parse\(item\.created_at\)>Date\.parse\(catalog\.replacedBefore\)/);
});
