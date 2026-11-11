const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

function interactive(){
 const win={};
 vm.runInNewContext(read('core/interactive-wallpapers.js'),{
  window:win,encodeURIComponent,URL,console
 });
 return win.LoliteInteractiveWallpapers;
}
test('16 interactive wallpaper scenes have stable names, palettes and original preview artwork',()=>{
 const catalog=interactive().catalog;
 assert.equal(catalog.length,16);
 assert.equal(new Set(catalog.map(w=>w.id)).size,16);
 assert.ok(catalog.every(w=>w.category==='Interactive'&&w.scene.startsWith('interactive-')));
 assert.ok(new Set(catalog.map(w=>w.kind)).size>=7);
 for(const item of catalog){
  const xml=decodeURIComponent(item.src.slice('data:image/svg+xml,'.length));
  assert.match(xml,/<svg[^>]+viewBox=/);
  assert.match(xml,/<\/svg>$/);
  assert.equal(item.poster,item.src);
  assert.doesNotMatch(xml,/<script|onload=|onerror=/);
 }
});
test('Every interactive wallpaper renders using live canvas drawing operations',()=>{
 const effects=interactive();
 let paints=0,paths=0;
 const gradient=()=>({addColorStop(){}});
 const ctx=new Proxy({}, {get(target,key){
  if(key==='createLinearGradient'||key==='createRadialGradient')return gradient;
  if(key==='fillRect')return ()=>{paints++};
  if(key==='beginPath')return ()=>{paths++};
  return ()=>{};
 }});
 const cursor={x:.66,y:.25,strength:.9};
 for(const wall of effects.catalog){
  const before=paints;
  effects.render(ctx,{wall,t:3.5,w:1280,h:720,cursor});
  assert.ok(paints>before,wall.id+' did not paint');
 }
 assert.ok(paths>400);
});
test('Published uploaded MP4s are verified before cards are added',async()=>{
 const events=[],visited=[];
 const win={dispatchEvent:e=>events.push(e)};
 const fetch=async(path,options)=>{
  visited.push({path,method:options.method});
  const exists=/minecraft-aquarium|where-whales-fly|motorcycle-parked/.test(path);
  return {ok:exists,status:exists?200:404,headers:{get:()=>exists?'video/mp4':'text/html'}};
 };
 vm.runInNewContext(read('core/uploaded-wallpapers-catalog.js'),{
  window:win,fetch,CustomEvent:class{constructor(type,arg){this.type=type;this.detail=arg.detail}},
  Date,encodeURIComponent,console
 });
 const api=win.LoliteUploadedWallpapers;
 assert.equal(api.knownFiles,20);
 assert.equal(api.catalog.length,0,'No unverified video cards may be shown');
 const found=await api.discover();
 assert.equal(found.length,3);
 assert.equal(visited.length,20);
 assert.ok(visited.every(v=>v.method==='HEAD'&&v.path.startsWith('assets/wallpapers/videos/')));
 assert.ok(found.some(x=>x.originalName==='minecraft-aquarium.3840x2160.mp4'));
 assert.ok(found.some(x=>x.originalName==='motorcycle-parked.3840x2160(1).mp4'));
 assert.ok(found.every(x=>x.video.endsWith('.mp4')&&x.category==='Videos'));
 assert.equal(events[0].detail.added,3);
 await api.discover();
 assert.equal(visited.length,20,'Repeat check uses a short cache');
});
test('Unhosted video links and HTML error pages are never shown as wallpaper cards',async()=>{
 const win={dispatchEvent(){}};
 vm.runInNewContext(read('core/uploaded-wallpapers-catalog.js'),{
  window:win,
  fetch:async()=>({ok:true,headers:{get:()=> 'text/html; charset=utf-8'}}),
  CustomEvent:class{},Date,encodeURIComponent,console
 });
 const result=await win.LoliteUploadedWallpapers.discover();
 assert.equal(result.length,0);
});
test('Live wallpapers use one passive document-level cursor observer and cap click ripples',()=>{
 const js=read('core/wallpapers.js');
 assert.match(js,/document\.addEventListener\('pointermove'/);
 assert.match(js,/document\.addEventListener\('pointerdown'/);
 assert.match(js,/pointer-events:none/);
 assert.match(js,/if\(ripples\.length>=10\)ripples\.shift\(\)/);
 assert.match(js,/pointerAllowed=\(\)=>interactionOn&&!paused\(\)&&visible\(\)/);
 assert.match(js,/const cursor=getCursor\(\)/);
 assert.match(js,/effects\?\.render\(ctx,/);
 assert.match(js,/effects\?\.overlay\(ctx,/);
});
test('retired interactive and uploaded catalogues are no longer loaded in Settings',()=>{
 const panel=read('core/crimson.js'),index=read('index.html');
 assert.doesNotMatch(panel,/data-wall-interactive|data-wall-interaction-strength/);
 assert.match(panel,/lolite:wallpapercollectionchange/);
 assert.doesNotMatch(index,/src="core\/interactive-wallpapers\.js|src="core\/uploaded-wallpapers-catalog\.js/);
 assert.ok(index.indexOf('core/lively-wallpapers-catalog.js')<index.indexOf('core/wallpapers.js'));
});
