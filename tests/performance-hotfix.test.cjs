const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=path=>fs.readFileSync(path,'utf8');
const game=read('core/game-store.js');
const wallpaper=read('core/wallpapers.js');
const loop=read('core/wallpaper-loop.js');
const ui=read('core/lolite-5.js');

test('game artwork no longer monitors the entire OS document',()=>{
 assert.doesNotMatch(game,/storeFinder\.observe\(document\.documentElement/);
 assert.doesNotMatch(game,/new MutationObserver\(watchArtwork\)/);
 assert.match(game,/const artworkMutationObserver=new MutationObserver\(records=>/);
 assert.match(game,/artworkMutationObserver\.observe\(root,\{childList:true,subtree:true\}\)/);
 assert.match(game,/const registerArtwork=el=>/);
 assert.match(game,/  watchArtwork\(\);/);
});
test('Game Store stops animating its huge background and defers art until near viewport',()=>{
 assert.doesNotMatch(game,/animation:storeAurora 30s ease-in-out infinite/);
 assert.match(game,/rootMargin:'240px 0px'/);
 assert.match(game,/searchTimer=setTimeout\(\(\)=>flushSearch\(input\),110\)/);
 assert.doesNotMatch(game,/rootMargin:'900px 0px'/);
});
test('5.0 handles inserted cards by app instead of scanning all windows',()=>{
 assert.match(ui,/const store=\$\('\.store-main'\);if\(!store\)return;/);
 assert.match(ui,/store\.querySelectorAll\('\.store-gallery-card/);
 assert.match(ui,/container\.querySelectorAll\('\.appstore-card'\)/);
 assert.match(ui,/let gamesChanged=false,appsChanged=false/);
 assert.match(ui,/if\(gamesChanged\)scheduleGames\(\)/);
 assert.match(ui,/if\(appsChanged\)scheduleAppStore\(\)/);
});
test('wallpaper quality starts Balanced for new installs but respects explicit Max',()=>{
 assert.match(wallpaper,/const initialQuality=read\('loliteWallpaperQuality','balanced'\)/);
 assert.match(wallpaper,/dual:quality==='max'/);
 assert.match(wallpaper,/const ordered=quality==='lite'/);
 assert.match(wallpaper,/quality==='balanced'\?\[wall\.src1080,original,wall\.preview\]/);
 assert.match(wallpaper,/const paused=\(\)=>/);
});
test('single decoder uses metadata preload, Max mode preserves dual seamless playback',()=>{
 const videos=[];
 const fake=()=>{const handlers={},v={src:'',preload:'',loop:false,muted:false,style:{},paused:true,
  setAttribute(){},removeAttribute(){this.src=''},addEventListener(n,cb){handlers[n]=cb},
  play(){this.paused=false;return Promise.resolve()},pause(){this.paused=true},load(){},
  remove(){},emit:n=>handlers[n]?.()};videos.push(v);return v};
 const ctx={window:{},document:{createElement:fake},clearInterval(){},clearTimeout(){},setInterval(){return 1},setTimeout(){return 1},requestAnimationFrame:()=>1,console};
 vm.runInNewContext(loop,ctx);
 const create=ctx.window.LoliteSeamlessVideo.create;
 const host={appendChild(){}};
 const single=create({target:host,sources:['a.mp4','b.mp4'],poster:'still.png',dual:false});
 assert.equal(single.getVideoCount(),1);
 assert.equal(single.getCurrent().src,'a.mp4');
 assert.equal(single.getCurrent().preload,'metadata');
 single.sync(true);
 single.getCurrent().emit('error');
 assert.equal(single.getCurrent().src,'b.mp4','Fallback must switch sources without recreating videos');
 single.destroy();
 const dual=create({target:host,sources:['4k.mp4'],poster:'still.png',dual:true});
 assert.equal(dual.getVideoCount(),2);
 assert.equal(dual.getCurrent().preload,'auto');
 dual.destroy();
});
