const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const read=name=>fs.readFileSync(name,'utf8');
function harness({graphics=true,fetchImpl,blockedCache=false}={}){
 const scripts=[],calls=[],nodes={};let reloads=0;
 for(const id of ['vc-loading','loading-text','vc-detail','vc-progress','vc-retry','vc-gamepad','vc-runtime','intro'])
  nodes[id]={textContent:id,hidden:false,addEventListener(name,cb){this[name]=cb}};
 const fetch=async(input,options)=>{
  calls.push(String(input));
  if(fetchImpl)return fetchImpl(input,options);
  let sent=false;
  return {ok:true,headers:new Headers({'Content-Type':'application/octet-stream'}),body:{getReader(){return {async read(){if(sent)return {done:true};sent=true;return {value:new Uint8Array([1,2,3]),done:false}}}}}};
 };
 const window={fetch,addEventListener(){}};
 const document={baseURI:'https://cdn.example/vice/',getElementById:id=>nodes[id],querySelector:()=>nodes.intro,
  createElement:tag=>tag==='canvas'?{getContext:()=>graphics?{getExtension:()=>({loseContext(){}})}:null}:{},
  body:{appendChild(el){scripts.push(el.src);queueMicrotask(()=>el.onload())}}};
 let blob=0;
 vm.runInNewContext(read('core/vice-city-loader.js'),{
  window,document,fetch,console,Request,Response,Headers,Blob,Uint8Array,AbortController,
  URL:class extends URL{static createObjectURL(){return 'blob:test-'+(++blob)}},
  XMLHttpRequest:class{open(){}},
  indexedDB:{open(){if(blockedCache)return {};throw Error('SecurityError')}},
  location:{reload(){reloads++}},
  setTimeout:(cb,ms)=>setTimeout(cb,ms===1500?5:ms),clearTimeout
 });
 return {nodes,scripts,calls,window,reloads:()=>reloads};
}
async function settle(h){for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,2));if(h.scripts.length===3||h.nodes['loading-text'].textContent==='Unable to start Vice City')return}throw Error('Loader did not settle')}
test('Opaque sandbox storage failures do not prevent all 36 resources downloading in order',async()=>{
 const h=harness();await settle(h);
 assert.equal(h.calls.length,36);
 assert.equal(h.nodes['vc-progress'].value,36);
 assert.match(h.nodes['vc-detail'].textContent,/36 \/ 36 resource files/);
 assert.equal(h.nodes['loading-text'].textContent,'Resources ready');
 assert.match(h.scripts[0],/^blob:/);
 assert.equal(h.scripts[1],'https://cdn.example/vice/idbfs.js');
 assert.match(h.scripts[2],/^blob:/);
 h.window.LoliteViceCity.ready();assert.equal(h.nodes['vc-loading'].hidden,true);
});
test('An indefinitely blocked IndexedDB request times out and loading proceeds',async()=>{
 const h=harness({blockedCache:true});await settle(h);assert.equal(h.calls.length,36);
});
test('Failed resource transfers stop after bounded retries and expose Retry loading',async()=>{
 const h=harness({fetchImpl:async()=>({ok:false,status:503})});await settle(h);
 assert.match(h.nodes['vc-detail'].textContent,/HTTP 503/);
 assert.equal(h.nodes['vc-retry'].hidden,false);
 assert.equal(h.scripts.length,2);
 const counts=new Map();for(const url of h.calls)counts.set(url,(counts.get(url)||0)+1);
 assert.ok([...counts.values()].every(n=>n<=3));
 h.nodes['vc-retry'].click();assert.equal(h.reloads(),1);
});
test('Unavailable graphics fails before a large download',async()=>{
 const h=harness({graphics:false});await settle(h);
 assert.match(h.nodes['vc-detail'].textContent,/WebGL is unavailable/);
 assert.equal(h.calls.length,0);assert.equal(h.scripts.length,0);
});
test('An HTML error page cannot be accepted as a successful game resource',async()=>{
 const h=harness({fetchImpl:async()=>({ok:true,headers:new Headers({'Content-Type':'text/html'})})});await settle(h);
 assert.match(h.nodes['vc-detail'].textContent,/web page instead of game data/);
});
test('Both launch pages bundle the maintained runtime and the existing licensed GamepadEmulator',()=>{
 execFileSync('python3',['scripts/build-vice-city.py','--check']);
 const html=read('html games/Grand Theft Auto Vice City.html');
 assert.equal(html,read('html games/collections/chicken-kings-vault/gamefiles/Grand Theft Auto Vice City.html'));
 assert.ok(html.includes(read('html games/gamepademulator.js')));
 assert.match(read('html games/gamepademulator.LICENSE.txt'),/MIT License/);
 assert.match(html,/id="vc-start">Play Vice City/);
 assert.doesNotMatch(html,/googletagmanager/);
 assert.match(read('core/vice-city-runtime.js'),/startGame\(\)\.catch\(window\.LoliteViceCity.fail\)/);
 assert.match(read('core/game-player.js'),/allow-scripts allow-forms/);
});
