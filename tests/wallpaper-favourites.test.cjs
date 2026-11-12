/* Lolite OS Wallpaper Favourites regression tests. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

const adminId='11111111-1111-4111-8111-111111111111';
function harness({storage=new Map(),version='v1',failWrites=false}={}){
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
 vm.runInNewContext(read('core/wallpapers.js'),ctx,{timeout:2500});
 return {api:win.LoliteWallpapers,events,storage,win,doc};
}
const uploaded=()=>({id:adminId,kind:'wallpaper',title:'My Uploaded Video',
 url:'https://example.com/uploaded.mp4',poster_url:'https://example.com/uploaded.jpg',
 created_at:'2026-11-12T00:00:00Z'});
test('Wallpaper gallery has independent accessible heart buttons and a Favourites filter',()=>{
 const {api}=harness();
 const all=api.markup('All');
 assert.match(all,/data-wall-filter="Favourites"/);
 assert.match(all,/data-wall-favourite="nature-one"/);
 assert.match(all,/aria-pressed="false" aria-label="Add Forest Sunrise to favourites"/);
 assert.match(all,/<\/button><button type="button" class="cr-wall-favourite/);
 assert.doesNotMatch(all,/data-wall-id="embed-city"/);
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
 assert.match(api.cards('Favourites'),/No wallpapers match/);
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
 assert.match(html,/core\/wallpapers\.js\?v=favourites-20261112/);
 assert.match(html,/core\/crimson\.js\?v=favourites-20261112/);
});
