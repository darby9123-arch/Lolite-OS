const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function harness({saved='on',wall={id:'live-forest',palette:['#051812','#145b41','#52d88e','#dbffdc']},rgb=[35,200,80]}={}){
 const values=new Map([['loliteWallpaperColorMode',saved]]);
 const vars=new Map(),events=new Map();
 const root={dataset:{},style:{
  setProperty(key,val){vars.set(key,val)},
  removeProperty(key){vars.delete(key)},
  getPropertyValue(key){return vars.get(key)||''}
 },removeAttribute(name){if(name==='data-wallpaper-colors')delete this.dataset.wallpaperColors}};
 const buttons=[];
 const document={
  documentElement:root,readyState:'complete',
  addEventListener(){},querySelectorAll(){return buttons},
  createElement(name){
   assert.equal(name,'canvas');
   return {width:0,height:0,getContext(){return {
    drawImage(){},
    getImageData(){const pixels=new Uint8ClampedArray(48*30*4);
     for(let i=0;i<pixels.length;i+=4){pixels[i]=rgb[0];pixels[i+1]=rgb[1];pixels[i+2]=rgb[2];pixels[i+3]=255}
     return {data:pixels};
    }
   }}};
  }
 };
 const listeners=(type,fn)=>{const a=events.get(type)||[];a.push(fn);events.set(type,a)};
 const win={
  page:id=>'<section>'+id+'</section>',
  LoliteWallpapers:{current:()=>wall},
  addEventListener:listeners,
  dispatchEvent(event){for(const fn of events.get(event.type)||[])fn(event);}
 };
 class ImageMock{
  naturalWidth=150;naturalHeight=100;onload=null;onerror=null;
  set src(value){this._src=value;this.onload?.();}
 }
 const localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,val)=>values.set(key,String(val))};
 class CustomEvent{constructor(type,opts){this.type=type;this.detail=opts?.detail}}
 vm.runInNewContext(read('core/wallpaper-colors.js'),{window:win,document,localStorage,Image:ImageMock,CustomEvent,Uint8ClampedArray,Float64Array,Math,Number,String,Array,Map,Boolean},{timeout:2500});
 return {win,root,vars,values,setWall(next){wall=next;win.dispatchEvent(new CustomEvent('lolite:wallpaperchange',{detail:{id:next.id}}))}};
}
test('Wallpaper colours react to live wallpaper palette without changing icon artwork',()=>{
 const h=harness(),api=h.win.LoliteWallpaperColors;
 assert.equal(api.isEnabled(),true);
 assert.equal(h.root.dataset.wallpaperColors,'on');
 assert.match(h.vars.get('--wall-accent'),/^hsl\(1[0-7]\d /);
 assert.match(h.vars.get('--wall-icon-start'),/^hsl\(/);
 assert.match(h.vars.get('--wall-button'),/ 32%\)$/);
 assert.match(h.win.page('settings'),/data-wall-color-toggle/);
 h.setWall({id:'live-crimson',palette:['#20000b','#4e101c','#f06980','#ffe1e4']});
 assert.match(h.vars.get('--wall-accent'),/^hsl\((?:3[0-5]\d|0|[0-9]) /);
});
test('Uploaded wallpaper sampling detects actual image colour',()=>{
 const h=harness({wall:{id:'custom',src:'data:image/png;base64,test'}});
 assert.match(h.vars.get('--wall-accent'),/^hsl\(1[0-7]\d /);
 assert.equal(h.win.LoliteWallpaperColors.getScheme().saturation>30,true);
});
test('Turning off adaptive colours restores the saved accent and stops following wallpapers',()=>{
 const h=harness({saved:'off'});
 const api=h.win.LoliteWallpaperColors;
 assert.equal(api.isEnabled(),false);
 assert.equal(h.root.dataset.wallpaperColors,undefined);
 api.setEnabled(true);
 assert.equal(h.values.get('loliteWallpaperColorMode'),'on');
 const green=h.vars.get('--wall-accent');
 assert.ok(green);
 api.setEnabled(false);
 assert.equal(h.values.get('loliteWallpaperColorMode'),'off');
 assert.equal(h.root.dataset.wallpaperColors,undefined);
 assert.equal(h.vars.has('--wall-icon-start'),false);
 h.setWall({id:'red',palette:['#160207','#650d13','#ef3c52','#fff0ef']});
 assert.equal(h.vars.has('--wall-accent'),false);
 assert.match(h.win.page('settings'),/Off · Use original theme/);
});
test('Adaptive palettes are loaded last and cover UI and icon variants without touching app content',()=>{
 const html=read('index.html'),css=read('core/wallpaper-colors.css');
 assert.ok(html.indexOf('core/wallpaper-colors.css')>html.indexOf('core/game-store-ui-cleanup.css'));
 assert.ok(html.indexOf('core/wallpaper-colors.js')>html.indexOf('core/wallpapers.js'));
 assert.ok(html.indexOf('core/wallpaper-colors.js')>html.indexOf('core/settings-enhanced.js'));
 assert.match(css,/data-wallpaper-colors="on"/);
 assert.match(css,/--wall-icon-start/);
 assert.match(css,/\.window>\.titlebar/);
 assert.match(css,/\.win-taskbar-center/);
 assert.match(css,/\.lolite-icon--brand-real/);
 assert.match(read('core/wallpapers.js'),/lolite:wallpaperposter/);
 assert.match(read('core/settings-enhanced.js'),/loliteWallpaperColorMode/);
});