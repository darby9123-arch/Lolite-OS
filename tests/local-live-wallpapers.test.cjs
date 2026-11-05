const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

function catalogModule(){
  const listeners=new Map();
  const win={
    addEventListener(){},
    dispatchEvent(){},
    localStorage:{getItem(){return null}},
    document:{readyState:'loading',addEventListener(name,fn){listeners.set(name,fn)}}
  };
  vm.runInNewContext(read('core/user-live-wallpapers.js'),{
    window:win,document:win.document,localStorage:win.localStorage,CustomEvent:class{constructor(name,o){this.name=name;this.detail=o?.detail}},
    URL:{createObjectURL(){return 'blob:mock'},revokeObjectURL(){}},setTimeout,clearTimeout
  });
  return win.LoliteWallpaperImports;
}

test('20 user-submitted MP4 titles replace the external live catalog',()=>{
 const api=catalogModule();
 assert.equal(api.catalog.length,20);
 assert.equal(new Set(api.catalog.map(x=>x.id)).size,20);
 assert.ok(api.catalog.every(x=>x.local&&x.video==='local'&&!x.source));
 assert.ok(api.catalog.some(x=>x.name.includes('Nissan')));
 assert.ok(api.catalog.some(x=>x.name.includes('Whales')));
});
test('Each uploaded video filename matches an exact catalog item, including (1) suffix',()=>{
 const api=catalogModule();
 const files=[
 'sukuna-fuga-flames.3840x2160.mp4',
 'nissan-gt-r32-rocket-bunny.3840x2160.mp4',
 'hiyuki-silent-storm.3840x2160.mp4',
 'minecraft-aquarium.3840x2160.mp4',
 'spider-man-2.3840x2160.mp4',
 'zelda-starlight-adventure.3840x2160.mp4',
 'fortnite-stormy-sky.1920x1080.mp4',
 'japans-majestic-peaks-and-cherry-blossoms.1920x1080.mp4',
 'isagi-yoichi-devil-eyes.3840x2160.mp4',
 'where-whales-fly.3840x2160.mp4',
 'minecraft-dog.3840x2160.mp4',
 'kakashi-hatake-naruto.3840x2160.mp4',
 'liquid-lines-cyan.3840x2160.mp4',
 'aesthetic-mountains-in-front-of-the-sky.3840x2160.mp4',
 'forest-rainfall.1920x1080.mp4',
 'konata-on-windows-xp.3840x2160.mp4',
 'audi-rs-7-sportback-under-the-rain.3840x2160.mp4',
 'rain-drops-on-window.3840x2160.mp4',
 'blurred-sunset-while-raining.3840x2160.mp4',
 'motorcycle-parked.3840x2160(1).mp4'
 ];
 assert.equal(files.length,20);
 assert.equal(new Set(files.map(name=>api.match({name})?.id)).size,20);
 assert.ok(files.every(name=>api.match({name})?.local));
 assert.equal(api.match({name:'unknown.mp4'}),null);
});

test('Old MotionBGS and canvas animations are not in the live library',()=>{
 const js=read('core/wallpapers.js'),html=read('index.html');
 assert.doesNotMatch(js,/collection\.push\(\.\.\.\(window\.LoliteMotionBGS/);
 assert.doesNotMatch(js,/entry\('live-embers'/);
 assert.doesNotMatch(html,/src="core\/motionbgs-catalog\.js/);
 assert.match(html,/src="core\/user-live-wallpapers\.js/);
 assert.ok(html.indexOf('core/user-live-wallpapers.js')<html.indexOf('core/wallpapers.js'));
});

test('Local MP4 playback loads from IndexedDB Blob URLs with cleanup',()=>{
 const module=read('core/user-live-wallpapers.js'),js=read('core/wallpapers.js');
 assert.match(module,/indexedDB\.open\(DB,1\)/);
 assert.match(module,/URL\.createObjectURL\(record\.blob\)/);
 assert.match(js,/LoliteWallpaperImports\?\.openUrl\(w\.id\)/);
 assert.match(js,/URL\.revokeObjectURL\(localUrl\)/);
 assert.match(js,/current\.muted=true/);
 assert.match(js,/current\.loop=true/);
 assert.match(js,/current\.playsInline=true/);
});

test('User can import all MP4s at once and see real thumbnails',()=>{
 const importer=read('core/user-live-wallpapers.js');
 const settings=read('core/crimson.js');
 const wallpapers=read('core/wallpapers.js');
 assert.match(importer,/async function importFiles\(files\)/);
 assert.match(importer,/function thumbnail\(blob,id\)/);
 assert.match(importer,/canvas\.toDataURL\('image\/webp'/);
 assert.match(wallpapers,/data-wall-pack-upload/);
 assert.match(wallpapers,/accept="\.mp4,video\/mp4" multiple/);
 assert.match(settings,/LoliteWallpaperImports\.importFiles\(selected\)/);
 assert.match(settings,/lolite:wallpaperpackchange/);
});
