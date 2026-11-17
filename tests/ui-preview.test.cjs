/* Standalone UI Lab regression tests. No browser, backend or OS login required. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const HTML=read('ui-preview/index.html'),CSS=read('ui-preview/styles.css'),JS=read('ui-preview/app.js');

function mockNode(){
 const attrs=new Map(),classes=new Set(),props={};
 return {
  dataset:{},style:{setProperty(name,value){props[name]=value},getPropertyValue(name){return props[name]||''}},
  classList:{add(name){classes.add(name)},remove(name){classes.delete(name)},contains(name){return classes.has(name)},
   toggle(name,forced){if(forced===true){classes.add(name);return true}if(forced===false){classes.delete(name);return false}
    if(classes.has(name)){classes.delete(name);return false}classes.add(name);return true}},
  hidden:false,checked:false,value:'',innerHTML:'',textContent:'',offsetLeft:50,offsetTop:50,
  offsetWidth:250,offsetHeight:200,clientWidth:600,clientHeight:400,children:[],
  setAttribute(name,value){attrs.set(name,String(value))},
  getAttribute(name){return attrs.get(name)||null},
  removeAttribute(name){attrs.delete(name)},
  appendChild(child){this.children.push(child)},replaceChildren(...children){this.children=[...children]},
  querySelector(){return null},focus(){this.focused=true},matches(){return false},
  getBoundingClientRect(){return {left:0,top:0,width:100,height:100}},
  setPointerCapture(){},addEventListener(){},scrollTop:0,scrollHeight:0
 };
}
function harness({saved=null,matchMedia=true}={}){
 const nodes=new Map(),listeners={},storage=new Map();
 if(saved!==null)storage.set('loliteUiLabV1',saved);
 function get(selector){if(!nodes.has(selector))nodes.set(selector,mockNode());return nodes.get(selector)}
 const themes=['cosmos','aero','minimal'].map(x=>Object.assign(mockNode(),{dataset:{themeChoice:x}}));
 const walls=['aurora','horizon','night'].map(x=>Object.assign(mockNode(),{dataset:{wallpaperChoice:x}}));
 const colors=['blue','purple','cyan','white'].map(x=>Object.assign(mockNode(),{dataset:{glowColor:x}}));
 const surfaces=['button','card','taskbar'].map(x=>Object.assign(mockNode(),{dataset:{glowSurface:x}}));
 const scenes=['desktop','start','window','games','chat','settings','wallpapers','components']
  .map(x=>Object.assign(mockNode(),{dataset:{scene:x}}));
 const chats=['Alex','Jamie','Marcus'].map(x=>Object.assign(mockNode(),{dataset:{chatContact:x}}));
 const all={'[data-theme-choice]':themes,'[data-wallpaper-choice]':walls,
  '[data-glow-color]':colors,'[data-glow-surface]':surfaces,
  '[data-scene]':scenes,'.scene-item':scenes,
  '[data-chat-contact]':chats,'[data-game-category]':[]};
 const doc={
  documentElement:mockNode(),fullscreenElement:null,
  querySelector:get,querySelectorAll:selector=>all[selector]||[],
  createElement:()=>mockNode(),
  addEventListener(type,listener){(listeners[type]??=[]).push(listener)}
 };
 const quickGlow=mockNode();get('#quickPanel').querySelector=selector=>selector==='[data-quick="glow"]'?quickGlow:null;
 const clip=mockNode();get('#fullscreenPreview').querySelector=selector=>selector==='span'?clip:null;
 const clock=mockNode();
 get('#windowDragHandle').addEventListener=(type,fn)=>{(listeners['drag:'+type]??=[]).push(fn)};
 get('#startSearch').addEventListener=(type,fn)=>{(listeners['search:'+type]??=[]).push(fn)};
 get('#glowEnabled').addEventListener=(type,fn)=>{(listeners['enabled:'+type]??=[]).push(fn)};
 get('#glowIntensity').addEventListener=(type,fn)=>{(listeners['intensity:'+type]??=[]).push(fn)};
 get('#glowSize').addEventListener=(type,fn)=>{(listeners['size:'+type]??=[]).push(fn)};
 get('#previewVolume').addEventListener=(type,fn)=>{(listeners['volume:'+type]??=[]).push(fn)};
 const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v))};
 const win={navigator:{},...matchMedia?{matchMedia:()=>({matches:false})}:{}};
 const ctx={window:win,document:doc,localStorage,navigator:{clipboard:{writeText:async()=>{}}},
  setInterval(){},setTimeout(){return 1},clearTimeout(){},Date,Math,JSON,Number,
  String,Array,Map,Set,Object,Promise};
 vm.runInNewContext(JS,ctx,{timeout:2500});
 function click(selectors){
  const target={closest(selector){return selectors[selector]||null}};
  for(const fn of listeners.click||[])fn({target});
 }
 function send(type,event){for(const fn of listeners[type]||[])fn(event)}
 return {doc,nodes,get,storage,click,send,listeners,scenes,themes,walls,colors,surfaces,quickGlow};
}
test('UI Lab is a separate GitHub Pages-ready site with local assets',()=>{
 assert.match(HTML,/<title>Lolite UI Lab — Design Preview<\/title>/);
 assert.match(HTML,/href="\.\/styles\.css\?v=/);
 assert.match(HTML,/src="\.\/app\.js\?v=/);
 assert.match(HTML,/href="\.\.\/" target="_blank"/);
 assert.match(HTML,/\.\.\/assets\/lolite-cosmos-logo\.svg/);
 assert.doesNotMatch(HTML,/<iframe|supabase-js|src="https?:\/\//i);
});
test('Eight previews have accessible, functional scene navigation and descriptive headings',()=>{
 const h=harness();
 assert.equal((HTML.match(/class="scene-item/g)||[]).length,8);
 assert.equal(h.get('#sceneTitle').textContent,'Desktop UI');
 h.click({'[data-scene]':h.scenes.find(n=>n.dataset.scene==='start')});
 assert.equal(h.get('#sceneTitle').textContent,'Start menu 3.0');
 assert.equal(h.get('#startMenu').hidden,false);
 assert.equal(h.get('#previewWindow').hidden,true);
 h.click({'[data-scene]':h.scenes.find(n=>n.dataset.scene==='games')});
 assert.equal(h.get('#sceneTitle').textContent,'Game Store 4.0');
 assert.equal(h.get('#previewWindow').hidden,false);
 assert.match(h.get('#windowContent').innerHTML,/Discover something new/);
 assert.equal(h.get('#startMenu').hidden,true);
 h.click({'[data-scene]':h.scenes.find(n=>n.dataset.scene==='components')});
 assert.match(h.get('#windowContent').innerHTML,/BUTTON STATES/);
});
test('Glow settings adjust CSS variables live and save only to an isolated UI Lab key',()=>{
 const h=harness();
 assert.equal(h.doc.documentElement.dataset.glow,'on');
 h.send('enabled:change',{target:{checked:false}});
 assert.equal(h.doc.documentElement.dataset.glow,'off');
 h.send('intensity:input',{target:{value:'81'}});
 h.send('size:input',{target:{value:'240'}});
 assert.equal(h.doc.documentElement.style.getPropertyValue('--glow-size'),'240px');
 assert.equal(h.get('#glowIntensityValue').textContent,'81%');
 h.click({'[data-glow-color]':h.colors.find(n=>n.dataset.glowColor==='purple')});
 assert.equal(h.doc.documentElement.style.getPropertyValue('--glow-rgb'),'165 139 255');
 assert.deepEqual([...h.storage.keys()],['loliteUiLabV1']);
 assert.equal(JSON.parse(h.storage.get('loliteUiLabV1')).intensity,81);
 assert.equal(JSON.parse(h.storage.get('loliteUiLabV1')).glow,false);
});
test('Theme and wallpaper buttons update a real preview with persistent values',()=>{
 const h=harness();
 h.click({'[data-theme-choice]':h.themes[1]});
 assert.equal(h.doc.documentElement.dataset.theme,'aero');
 h.click({'[data-wallpaper-choice]':h.walls[2]});
 assert.equal(h.get('#previewDesktop').dataset.wallpaperPreview,'night');
 assert.equal(JSON.parse(h.storage.get('loliteUiLabV1')).wallpaper,'night');
});
test('Broken settings cannot crash startup or inject styles from untrusted saved fields',()=>{
 const h=harness({saved:'{'});
 assert.equal(h.doc.documentElement.dataset.theme,'cosmos');
 const bad=harness({saved:JSON.stringify({theme:'javascript:alert(1)',wallpaper:'<script>',
  intensity:9999,size:-50,color:'evil',surfaces:{button:false}})});
 assert.equal(bad.doc.documentElement.dataset.theme,'cosmos');
 assert.equal(bad.doc.documentElement.dataset.wallpaper,'aurora');
 assert.equal(bad.get('#glowIntensity').value,'100');
 assert.equal(bad.get('#glowSize').value,'70');
 assert.equal(bad.doc.documentElement.dataset.glowButton,'off');
});
test('Pointer glow follows hovered elements only, and handles missing matchMedia',()=>{
 const h=harness({matchMedia:false});
 const tile=mockNode();tile.dataset.glowType='card';
 h.send('pointermove',{clientX:25,clientY:80,target:{closest:s=>s==='[data-glow]'?tile:null}});
 assert.equal(tile.style.getPropertyValue('--gx'),'25.00%');
 assert.equal(tile.style.getPropertyValue('--gy'),'80.00%');
 h.send('enabled:change',{target:{checked:false}});
 h.send('pointermove',{clientX:35,clientY:50,target:{closest:s=>s==='[data-glow]'?tile:null}});
 assert.equal(tile.style.getPropertyValue('--gx'),'25.00%');
});
test('Taskbar opens the Start menu and settings can be reset without touching the OS',()=>{
 const h=harness();
 h.click({'#taskStart':h.get('#taskStart')});
 assert.equal(h.get('#startMenu').hidden,false);
 h.click({'#taskStart':h.get('#taskStart')});
 assert.equal(h.get('#startMenu').hidden,true);
 h.click({'[data-theme-choice]':h.themes[2]});
 h.click({'#resetSettings':h.get('#resetSettings')});
 assert.equal(h.doc.documentElement.dataset.theme,'cosmos');
 assert.equal(JSON.parse(h.storage.get('loliteUiLabV1')).theme,'cosmos');
});
test('CSS restricts glow to hovered elements and respects touch and reduced motion',()=>{
 assert.match(CSS,/html\[data-glow="on"\] \[data-glow\]:hover::before/);
 assert.match(CSS,/radial-gradient\(circle var\(--glow-size\) at var\(--gx/);
 assert.match(CSS,/@media\(hover:none\),\(pointer:coarse\)/);
 assert.match(CSS,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(CSS,/@container \(max-width:495px\)/);
 assert.doesNotMatch(CSS,/\.\.inspector/);
});
test('UI Lab includes functional window controls, quick settings, preview-only chat and copy control',()=>{
 assert.match(JS,/setPointerCapture/);
 assert.match(JS,/function toggleMaximize/);
 assert.match(JS,/function renderStartApps/);
 assert.match(JS,/function selectChat/);
 assert.match(JS,/function copySettings/);
 assert.match(JS,/bubble\.textContent=message/);
 assert.match(JS,/windowEl\.classList\.toggle\('maximized'\)/);
 assert.match(JS,/function gameCards/);
 assert.match(JS,/localStorage\.setItem\('loliteUiLabV1'/);
 assert.doesNotMatch(JS,/getDisplayMedia|MediaRecorder|fetch\(|\.from\('lolite_/);
});

test('Minimized preview windows are restored from the taskbar',()=>{
 const h=harness();
 h.click({'[data-scene]':h.scenes.find(n=>n.dataset.scene==='window')});
 assert.equal(h.get('#previewWindow').hidden,false);
 assert.equal(h.get('#taskWindows').hidden,false);
 const minimize=Object.assign(mockNode(),{dataset:{windowAction:'minimize'}});
 h.click({'[data-window-action]':minimize});
 assert.equal(h.get('#previewWindow').hidden,true);
 assert.equal(h.get('#taskWindows').getAttribute('aria-pressed'),'false');
 h.click({'#taskWindows':h.get('#taskWindows')});
 assert.equal(h.get('#previewWindow').hidden,false);
 assert.equal(h.get('#taskWindows').getAttribute('aria-pressed'),'true');
 const close=Object.assign(mockNode(),{dataset:{windowAction:'close'}});
 h.click({'[data-window-action]':close});
 assert.equal(h.get('#previewWindow').hidden,true);
 assert.equal(h.get('#taskWindows').hidden,true);
 assert.equal(h.get('#sceneTitle').textContent,'Desktop UI');
});

test('Live liquid glass modes are independently editable and survive saving',()=>{
 const h=harness();
 assert.equal(h.get('#liquidBend').value,'60');
 const off=Object.assign(mockNode(),{dataset:{liquidMode:'off'}});
 h.click({'[data-liquid-mode]':off});
 assert.equal(h.doc.documentElement.dataset.theme,'cosmos');
 assert.equal(JSON.parse(h.storage.get('loliteUiLabV1')).liquid.mode,'off');
 assert.equal(h.get('#liquidEngineBadge').textContent,'OFF');
 const high=Object.assign(mockNode(),{dataset:{liquidMode:'high'}});
 h.click({'[data-liquid-mode]':high});
 assert.equal(JSON.parse(h.storage.get('loliteUiLabV1')).liquid.mode,'high');
 assert.equal(h.get('#liquidEngineBadge').textContent,'CSS FALLBACK');
 assert.match(read('ui-preview/app.js'),/LoliteLiquidGlassRenderer\?\.create/);
 assert.match(read('ui-preview/app.js'),/glassEngine\?\.update/);
});
test('Untrusted saved liquid glass settings are clamped and invalid modes rejected',()=>{
 const h=harness({saved:JSON.stringify({liquid:{mode:'unsafe',bend:999,thickness:-44,shine:65,motion:true}})});
 assert.equal(h.get('#liquidBend').value,'100');
 assert.equal(h.get('#liquidThickness').value,'0');
 assert.equal(h.get('#liquidShine').value,'65');
 assert.equal(h.get('#liquidMotion').checked,true);
 assert.equal(h.get('#liquidEngineBadge').textContent,'CSS FALLBACK');
 const settings=JSON.parse(h.storage.get('loliteUiLabV1'));
 assert.equal(settings.liquid.mode,'unsafe'); // unchanged input is never executed
});
