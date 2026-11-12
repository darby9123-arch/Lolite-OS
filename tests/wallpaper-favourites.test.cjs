/* Lolite OS Wallpaper Favourites regression tests. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

const adminId='11111111-1111-4111-8111-111111111111';
function harness({storage=new Map(),version='v1',failWrites=false,pack=false}={}){
 const events=[],listeners={};
 const localStorage={
  getItem:key=>storage.has(key)?storage.get(key):null,
  setItem(key,value){if(failWrites)throw Error('Storage unavailable');storage.set(key,String(value))}
 };
 const catalog={
  version,defaultId:'nature-one',replacedBefore:'2026-01-01T00:00:00Z',
  catalog:[
   {id:'nature-one',name:'Forest Sunrise',category:'Nature',src:'https://example.com/forest.jpg'},
   {id:'space-live',name:'Orbiting Planet',category:'Space',video:'https://example.com/orbit.webm',
    poster:'https://example.com/orbit.jpg',src:'https://example.com/orbit.jpg'},
   {id:'other-live',name:'Stars',category:'Space',src:'https://example.com/stars.jpg',scene:'stars'}
  ]
 };
 const embedded={id:'embed-city',name:'City Rain',category:'Cars',embedded:true,
  group:'MotionBGS',video:'https://example.com/city.mp4',poster:'https://example.com/city.jpg',src:'https://example.com/city.jpg'};
 const win={
  LoliteLivelyWallpapers:catalog,LoliteMotionBGSEmbeds:{catalog:[embedded]},
  page:()=>'<div>old app</div>',dispatchEvent:event=>events.push(event),addEventListener(){},toast:message=>events.push({type:'toast',message})
 };
 const doc={
  documentElement:{classList:{contains:()=>false},dataset:{},style:{}},
  hidden:false,readyState:'loading',
  addEventListener:(name,handler)=>{(listeners[name]??=[]).push(handler)},
  getElementById:()=>null,querySelectorAll:()=>[]
 };
 class CustomEvent{constructor(type,options){this.type=type;this.detail=options?.detail}}
 const ctx={window:win,document:doc,localStorage,matchMedia:()=>({matches:false,addEventListener(){}}),
  CustomEvent,Event:CustomEvent,MutationObserver:class{observe(){}},addEventListener(){},
  Set,Map,Math,Date,Number,Array,String,Boolean,Promise,innerWidth:1280,innerHeight:720,
  cancelAnimationFrame(){},requestAnimationFrame:()=>1,clearTimeout(){},setTimeout:()=>1};
 if(pack)vm.runInNewContext(read('core/wallpaper-pack-catalog.js'),ctx,{timeout:2500});
 vm.runInNewContext(read('core/wallpapers.js'),ctx,{timeout:2500});
 return {api:win.LoliteWallpapers,events,storage,win,doc};
}
const uploaded=()=>({id:adminId,kind:'wallpaper',title:'My Uploaded Video',
 url:'https://example.com/uploaded.mp4',poster_url:'https://example.com/uploaded.jpg',
 created_at:'2026-11-12T00:00:00Z'});
test('Wallpaper gallery has independent accessible heart buttons and a Favourites filter',()=>{
 const {api}=harness();
 const all=api.markup('Embedded Wallpapers');
 assert.match(all,/data-wall-filter="Favourites"/);
 assert.match(all,/data-wall-favourite="nature-one"/);
 assert.match(all,/aria-pressed="false" aria-label="Add Forest Sunrise to favourites"/);
 assert.match(all,/<\/button><button type="button" class="cr-wall-favourite/);
 assert.match(all,/data-wall-id="embed-city"/);
 assert.doesNotMatch(api.cards('All'),/data-wall-id=/);
});
test('Favouriting and unfavouriting persists by wallpaper ID without applying it',()=>{
 const h=harness(),api=h.api;
 assert.equal(api.current(),null);
 assert.equal(api.toggleFavourite('nature-one'),true);
 assert.equal(api.isFavourite('nature-one'),true);
 assert.equal(api.favouriteCount(),1);
 assert.deepEqual(JSON.parse(h.storage.get('loliteWallpaperFavouritesV1')),['nature-one']);
 assert.match(api.cards('Favourites'),/Forest Sunrise/);
 assert.doesNotMatch(api.cards('Favourites'),/Orbiting Planet/);
 assert.equal(api.current(),null);
 assert.equal(api.toggleFavourite('nature-one'),true);
 assert.equal(api.isFavourite('nature-one'),false);
 assert.match(api.cards('Favourites'),/No favourite wallpapers yet/);
 assert.equal(h.events.filter(e=>e.type==='lolite:wallpaperfavouriteschange').length,2);
});
test('Saved favourites survive reloading and wallpaper catalog version changes',()=>{
 const saved=new Map();
 const one=harness({storage:saved,version:'v1'});
 assert.equal(one.api.toggleFavourite('space-live'),true);
 const two=harness({storage:saved,version:'v2'});
 assert.equal(two.api.isFavourite('space-live'),true);
 assert.match(two.api.cards('Favourites'),/Orbiting Planet/);
 assert.equal(saved.get('loliteWallpaperCollection'),'v2');
 assert.equal(JSON.parse(saved.get('loliteWallpaperFavouritesV1'))[0],'space-live');
});
test('Embedded wallpapers are hidden from All, but can be saved under Favourites',()=>{
 const {api}=harness();
 assert.doesNotMatch(api.cards('All'),/City Rain/);
 assert.equal(api.toggleFavourite('embed-city'),true);
 assert.match(api.cards('Favourites'),/City Rain/);
 assert.match(api.cards('Favourites'),/Embedded/);
 assert.match(api.cards('Embedded Wallpapers'),/City Rain/);
});
test('Admin-uploaded wallpapers support favourites without losing stored IDs on refresh',()=>{
 const {api,storage}=harness();
 api.syncAdminWallpapers([uploaded()]);
 const id='admin-'+adminId;
 assert.equal(api.toggleFavourite(id),true);
 assert.match(api.cards('Favourites'),/My Uploaded Video/);
 api.syncAdminWallpapers([]);
 assert.doesNotMatch(api.cards('Favourites'),/My Uploaded Video/);
 assert.equal(api.isFavourite(id),true);
 api.syncAdminWallpapers([uploaded()]);
 assert.match(api.cards('Favourites'),/My Uploaded Video/);
 assert.ok(JSON.parse(storage.get('loliteWallpaperFavouritesV1')).includes(id));
});
test('Personal custom image can be favourited and restored from the Favourites gallery',()=>{
 const h=harness(),api=h.api;
 assert.equal(api.setCustom('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB'),true);
 assert.equal(api.toggleFavourite('custom'),true);
 assert.match(api.cards('Favourites'),/Your custom wallpaper/);
 assert.match(api.cards('Favourites'),/data-wall-id="custom"/);
 assert.doesNotMatch(api.cards('All'),/data-wall-id="custom"/);
 assert.equal(api.apply('custom'),true);
 assert.equal(h.storage.get('loliteWallpaperCustomActive'),'true');
 assert.equal(h.storage.get('wallpaperId'),'custom');
});
test('Unknown wallpaper IDs are not saved and failed storage writes are rolled back',()=>{
 const h=harness();
 assert.equal(h.api.toggleFavourite('some-random-id'),false);
 assert.equal(h.api.favouriteCount(),0);
 const broken=harness({failWrites:true});
 assert.equal(broken.api.toggleFavourite('nature-one'),false);
 assert.equal(broken.api.isFavourite('nature-one'),false);
});
test('Wallpaper Settings handles favourite clicks separately from applying cards',()=>{
 const crimson=read('core/crimson.js');
 assert.match(crimson,/data-wall-favourite-current/);
 assert.match(crimson,/data-wall-favourite\]/);
 assert.match(crimson,/api\.toggleFavourite\(id\)/);
 assert.match(crimson,/lolite:wallpaperfavouriteschange/);
 assert.ok(crimson.indexOf("if(b.hasAttribute('data-wall-favourite')")<
  crimson.indexOf("if(b.dataset.wallId)window.LoliteWallpapers.apply"));
 assert.match(crimson,/api\.cards\(filter,wallQuery\)/);
 const html=read('index.html');
 assert.match(html,/core\/wallpaper-favourites\.css/);
 assert.match(html,/core\/wallpapers\.js\?v=20261113/);
 assert.match(html,/core\/crimson\.js\?v=20261113/);
});

const wallIds=html=>[...html.matchAll(/data-wall-id="([^"]+)"/g)].map(match=>match[1]);
test('Original wallpaper pack appears in All and Special Live Wallpapers, survives admin refresh and supports favourites',()=>{
 const {api,win}=harness({pack:true});
 const expected=Array.from(win.LoliteWallpaperPack.catalog,wall=>wall.id);
 assert.equal(expected.length,103);
 assert.deepEqual(wallIds(api.cards('All','',200)),expected);
 assert.deepEqual(wallIds(api.cards('Special Live Wallpapers','',200)),expected);
 assert.ok(wallIds(api.cards('Embedded Wallpapers','',200)).every(id=>!expected.includes(id)));
 assert.match(api.markup(),/data-wall-filter="Special Live Wallpapers"/);
 api.syncAdminWallpapers([uploaded()]);
 api.syncAdminWallpapers([]);
 assert.deepEqual(wallIds(api.cards('All','',200)),expected);
 api.toggleFavourite(expected[0]);
 assert.deepEqual(wallIds(api.cards('Favourites')),expected.slice(0,1));
 api.setSort('random');
 const shuffled=wallIds(api.cards('All','',200));
 assert.deepEqual([...shuffled].sort(),[...expected].sort());
 assert.deepEqual(wallIds(api.cards('All','',200)),shuffled);
 api.reshuffle();
 assert.notDeepEqual(wallIds(api.cards('All','',200)),shuffled);
});
function sortingHarness(){
 const h=harness();
 for(let i=0;i<110;i++)h.api.collection.push({id:'uploaded-'+i,name:'Landscape '+i,category:'Nature',src:'https://example.com/'+i+'.jpg'});
 return h;
}
test('Wallpaper Random preserves pagination, filters, favourites and incoming uploads',()=>{
 const {api}=sortingHarness();
 const catalogueOrder=api.collection.map(w=>w.id).join(',');
 api.setSort('random');
 const first=wallIds(api.cards('All')),all=wallIds(api.cards('All','',200));
 assert.equal(first.length,48);assert.equal(all.length,110);
 assert.deepEqual(all.slice(0,48),first);
 assert.equal(new Set(all).size,110);
 assert.deepEqual(wallIds(api.cards('All')),first);
 const matching=wallIds(api.cards('All','Landscape 1',200));
 assert.deepEqual(matching,all.filter(id=>id.slice('uploaded-'.length).includes('1')));
 for(const id of first.slice(0,3))api.toggleFavourite(id);
 assert.deepEqual(wallIds(api.cards('Favourites')),first.slice(0,3));
 assert.equal(api.collection.map(w=>w.id).join(','),catalogueOrder);
 assert.ok(wallIds(api.cards('Embedded Wallpapers')).every(id=>!id.startsWith('uploaded-')));
 api.syncAdminWallpapers([uploaded()]);
 assert.deepEqual(wallIds(api.cards('All','',200)).filter(id=>all.includes(id)),all);
 api.reshuffle('All');
 const shuffled=wallIds(api.cards('All','',200));
 assert.notDeepEqual(shuffled.slice(0,48),first);
 assert.deepEqual(shuffled.filter(id=>all.includes(id)).sort(),[...all].sort());
 assert.deepEqual(wallIds(api.cards('All')),shuffled.slice(0,48));
});
test('Wallpaper Sort by persists, uses numeric titles and shows Reshuffle only for Random',()=>{
 const h=sortingHarness(),api=h.api;
 assert.match(api.markup(),/data-wall-reshuffle hidden/);
 api.setSort('za');
 assert.deepEqual(wallIds(api.cards('All')).slice(0,3),['uploaded-109','uploaded-108','uploaded-107']);
 assert.equal(h.storage.get('loliteWallpaperSortV1'),'za');
 assert.equal(harness({storage:h.storage}).api.getSort(),'za');
 api.setSort('az');
 assert.deepEqual(wallIds(api.cards('All')).slice(0,3),['uploaded-0','uploaded-1','uploaded-2']);
 api.setSort('random');
 assert.doesNotMatch(api.markup(),/data-wall-reshuffle hidden/);
 assert.match(api.markup(),/<option value="random" selected>/);
 api.setSort('invalid');assert.equal(api.getSort(),'random');
});
