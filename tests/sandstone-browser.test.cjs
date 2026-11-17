const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=path=>fs.readFileSync(path,'utf8');
const app=read('app.js');
const index=read('index.html');
const compat=read('core/sandstone-original-compat.js');

function harness({ready=true,windowPresent=true}={}){
 const listeners=new Map(),innerNodes=new Map(),styles=[],links=[],frames=[],changes=[];
 class Node {
  constructor(name){
   this.name=name;this.listeners=new Map();this.children=[];
   this.dataset={};this.textContent='';this.style={setProperty:(key,value,priority)=>changes.push([name,key,value,priority])};
  }
  addEventListener(type,fn){this.listeners.set(type,fn)}
  trigger(type){this.listeners.get(type)?.()}
  append(...nodes){this.children.push(...nodes)}
  appendChild(node){this.children.push(node);if(node.name==='style')styles.push(node)}
  setAttribute(name,value){this[name]=value}
  querySelector(query){return this.children.find(x=>x.id===query.slice(1))||null}
  insertAdjacentElement(where,node){assert.equal(where,'afterend');innerNodes.set(node.id,node)}
 }
 const innerDoc={
  body:new Node('body'),head:new Node('head'),
  getElementById:id=>innerNodes.get(id)||null,
  querySelector:query=>query==='#frame_container iframe'&&ready?{}:null,
  createElement:name=>new Node(name)
 };
 const address=new Node('address_bar');innerNodes.set('address_bar',address);
 const win={main_frame:ready?{iframe:{}}:null,location:{reload(){links.push('reload')}},setTimeout:fn=>fn()};
 const content=new Node('content');
 const frame=new Node('frame');frame.contentDocument=windowPresent?innerDoc:null;frame.contentWindow=windowPresent?win:null;
 frame.closest=sel=>sel==='.content'?content:null;
 const document={
  readyState:'complete',
  body:new Node('outerbody'),
  getElementById:()=>null,
  querySelectorAll:query=>query==='iframe[data-sandstone-original="true"]'?[frame]:[]
 };
 const window={};
 class MutationObserver{constructor(callback){this.callback=callback}observe(){}}
 vm.runInNewContext(compat,{document,window,MutationObserver,console,Promise,WeakSet},{timeout:2000});
 return {frame,win,innerNodes,styles,changes,links,api:window.LoliteSandstoneCompat};
}
test('The Lolite app launches the original user-provided Sandstone HTML, not a replacement',()=>{
 assert.match(app,/if\(id==='sandstone'\).*?apps\/sandstone-browser\.html\?v=original-runtime/);
 assert.match(app,/data-sandstone-original="true"/);
 assert.doesNotMatch(app,/sandstone-desktop\.html/);
 assert.match(index,/core\/sandstone-original-compat\.js/);
 assert.ok(index.indexOf('app.js?v=')<index.indexOf('core/sandstone-original-compat.js'));
 const original=read('apps/sandstone-browser.html');
 assert.ok(original.length>1000000,'Keep the actual original bundled Sandstone engine');
 for(const part of ['id="url_box"','id="options_div"','id="wisp_url_input"',
  'id="frame_container"','id="navigate_button"','new U.ProxyFrame']){
  assert.ok(original.includes(part),'Missing original Sandstone component: '+part);
 }
});
test('Compatibility layer fills Sandstone window and removes only its generic app padding',()=>{
 const h=harness();h.frame.trigger('load');
 assert.ok(h.changes.some(([n,k,value])=>n==='content'&&k==='padding'&&value==='0'));
 assert.ok(h.changes.some(([n,k,value])=>n==='frame'&&k==='height'&&value==='100%'));
 assert.ok(h.styles[0].textContent.includes('#frame_container'));
 assert.ok(h.styles[0].textContent.includes('#options_div'));
 assert.ok(h.styles[0].textContent.includes('min-height:0'));
});
test('Renderer status is honest about the actual missing proxy transport',()=>{
 const h=harness();h.frame.trigger('load');
 const status=h.innerNodes.get('loliteSandstoneStatus');
 assert.ok(status);
 assert.equal(status.dataset.error,'false');
 assert.match(status.children[0].textContent,/Original Sandstone renderer loaded/);
 assert.match(status.children[0].textContent,/this Lolite host does not supply one/);
 assert.doesNotMatch(status.children[0].textContent,/website successfully loaded|proxy connected/i);
 const button=status.children[1];button.trigger('click');
 assert.deepEqual(h.links,['reload']);
});
test('Broken renderer displays an understandable error instead of staying silent',()=>{
 const h=harness({ready:false});h.frame.trigger('load');
 const status=h.innerNodes.get('loliteSandstoneStatus');
 assert.equal(status.dataset.error,'true');
 assert.match(status.children[0].textContent,/failed to initialise/);
});
test('Frames are only mounted once, including after a window rescan',()=>{
 const h=harness();
 h.api.scan();h.api.scan();
 h.frame.trigger('load');
 assert.equal(h.styles.length,1);
 assert.equal(h.innerNodes.get('loliteSandstoneStatus').children.length,2);
});
test('Compatibility layer does not touch Sandstone proxy engine, networks, or other apps',()=>{
 assert.doesNotMatch(compat,/set_websocket|\.navigate_to|WebSocket\s*\(|new WebSocket|serviceWorker|wss:\/\//);
 assert.doesNotMatch(compat,/\beval\s*\(|document\.write|innerHTML\s*=/);
 assert.match(compat,/iframe\[data-sandstone-original="true"\]/);
 assert.match(compat,/frame\.contentDocument/);
 assert.match(compat,/\.content/);
});
