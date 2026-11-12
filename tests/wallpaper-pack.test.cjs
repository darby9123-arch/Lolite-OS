const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');
const context={window:{}};
vm.runInNewContext(read('core/wallpaper-pack-catalog.js'),context);
const pack=context.window.LoliteWallpaperPack;
test('103 original videos have complete metadata and permanent Lolite-hosted media URLs',()=>{
 assert.equal(pack.catalog.length,103);
 assert.equal(new Set(pack.catalog.map(w=>w.id)).size,103);
 assert.equal(new Set(pack.catalog.map(w=>w.video)).size,103);
 assert.equal(pack.catalog.reduce((sum,w)=>sum+w.bytes,0),2642179179);
 for(const wall of pack.catalog){
  assert.equal(wall.embedded,false);
  assert.equal(wall.provider,'Lolite Wallpaper Pack');
  assert.ok(wall.categories.includes('Special Live Wallpapers'));
  assert.match(wall.video,/^https:\/\/github\.com\/darby9123-arch\/Lolite-OS\/releases\/download\/wallpapers-20261113\/[a-z0-9-]+\.\d+x\d+\.mp4$/);
  assert.match(wall.poster,/^https:\/\/github\.com\/darby9123-arch\/Lolite-OS\/releases\/download\/wallpapers-20261113\/[a-z0-9-]+\.jpg$/);
  assert.equal(wall.src,wall.poster);
  assert.match(wall.sha256,/^[a-f0-9]{64}$/);
  assert.ok(wall.duration>0&&wall.width>0&&wall.height>0);
  assert.equal(wall.resolution,wall.width>=3840?'4K':'1080p');
  assert.doesNotMatch(wall.name,/\.mp4|\d+x\d+|Hole2|Sunset2/);
 }
});
test('Original pack loads before the wallpaper engine and never exposes temporary source links',()=>{
 const html=read('index.html');
 assert.ok(html.indexOf('core/wallpaper-pack-catalog.js')>0);
 assert.ok(html.indexOf('core/wallpaper-pack-catalog.js')<html.indexOf('core/wallpapers.js'));
 assert.doesNotMatch(read('core/wallpaper-pack-catalog.js'),/drive\.google|oaiusercontent|untagged-|<iframe/);
});
