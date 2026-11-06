const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../core/game-player.js'),'utf8');

class MockElement {
 constructor(tag){
  this.tagName=tag.toUpperCase();this.children=[];this.dataset={};
  this.attributes={};this.style={};this.className='';this.isConnected=false;
  this.src='';this.srcdoc='';this.listeners={};this.parent=null;
 }
 setAttribute(key,value){this.attributes[key]=String(value)}
 append(...nodes){
  for(const child of nodes){this.children.push(child);child.parent=this;child.connect()}
 }
 connect(){this.isConnected=true;for(const child of this.children)child.connect()}
 replaceChildren(){for(const child of this.children)child.disconnect();this.children=[]}
 disconnect(){this.isConnected=false;for(const child of this.children)child.disconnect()}
 replaceWith(next){
  if(this.parent){const i=this.parent.children.indexOf(this);
   this.parent.children[i]=next;next.parent=this.parent;next.connect()}
  this.disconnect();this.replacedBy=next;
 }
 addEventListener(name,callback){this.listeners[name]=callback}
 querySelector(selector){
  const matches=node=>selector.startsWith('.')?
   node.className.split(/\s+/).includes(selector.slice(1)):
   selector===node.tagName.toLowerCase();
  const queue=[...this.children];
  while(queue.length){const e=queue.shift();if(matches(e))return e;queue.unshift(...e.children)}
  return null;
 }
 focus(){}
}
function harness({mime='text/plain',html='<!doctype html><html><head><title>Game</title></head><body><canvas></canvas></body></html>',httpStatus=200,corsBlocked=false}={}){
 const calls=[],opened=[],head=new MockElement('head'),content=new MockElement('main');
 content.connect();head.connect();
 const doc={
  baseURI:'https://lolite.example/Lolite-OS/',
  head,
  createElement:tag=>new MockElement(tag),
  querySelector:()=>null
 };
 const root=new MockElement('section');
 const win={
  openApp(){return {querySelector:()=>content,focus(){}}},
  toast(msg){opened.push(msg)}
 };
 const fetch=async (url,opts)=>{
  calls.push({url,method:opts.method});
  if(opts.method==='HEAD'){
   return {ok:httpStatus>=200&&httpStatus<300,status:httpStatus,
     headers:{get:key=>key==='content-type'?mime:null}};
  }
  if(corsBlocked)throw new TypeError('Failed to fetch');
  return {ok:true,status:200,headers:{get:key=>key==='content-length'?String(Buffer.byteLength(html)):null},
    text:async()=>html};
 };
 vm.runInNewContext(source,{
  window:win,document:doc,location:{origin:'https://lolite.example'},
  URL,AbortController,Blob,fetch,console,setTimeout,clearTimeout
 },{timeout:1500});
 const success=win.LoliteGamePlayer.open({
  title:'Test game',file:'test-game.html',
  url:'https://cdn.example/games/demo.html',source:'Test server'
 });
 assert.equal(success,true);
 const player=content.querySelector('.store-player');
 const frame=player.querySelector('.store-frame');
 return {win,player,frame,content,calls,opened};
}
async function flush(){
 await new Promise(resolve=>setTimeout(resolve,5));
}
test('HTML served as text/plain renders as a playable srcdoc page',async()=>{
 const h=harness({html:'<!-- game -->\n<!doctype html><html><head><script src="game.js"></script></head><body><canvas></canvas></body></html>'});
 await flush();
 assert.equal(h.frame.dataset.gameRender,'raw-html');
 assert.match(h.frame.srcdoc,/<!doctype html>/i);
 assert.match(h.frame.srcdoc,/<base href="https:\/\/cdn\.example\/games\/demo\.html">/);
 assert.match(h.frame.srcdoc,/<script src="game\.js">/);
 assert.equal(h.frame.attributes.sandbox.includes('allow-scripts'),true);
 assert.equal(h.frame.attributes.sandbox.includes('allow-same-origin'),false);
 assert.deepEqual(h.calls.map(x=>x.method),['HEAD','GET']);
});
test('Existing game base href is preserved',async()=>{
 const h=harness({html:'<html><head><base href="https://assets.example/game/"></head><body><canvas></canvas></body></html>'});
 await flush();
 assert.equal((h.frame.srcdoc.match(/<base\b/g)||[]).length,1);
 assert.match(h.frame.srcdoc,/assets\.example\/game\//);
});
test('Non-HTML source code never executes in a frame',async()=>{
 const h=harness({html:'const app = { hello: 1 };'});
 await flush();
 const error=h.frame.replacedBy;
 assert.equal(error?.className,'store-load-error');
 assert.equal(h.frame.srcdoc,'');
});
test('CORS-blocked HTML shows an explanation rather than a code dump',async()=>{
 const h=harness({corsBlocked:true});
 await flush();
 const error=h.frame.replacedBy;
 assert.equal(error?.className,'store-load-error');
 assert.match(error.children[1].textContent,/CORS/);
});
test('Proper HTML sources continue opening normally without downloading',async()=>{
 const h=harness({mime:'text/html'});
 await flush();
 assert.equal(h.frame.src,'https://cdn.example/games/demo.html');
 assert.equal(h.frame.srcdoc,'');
 assert.deepEqual(h.calls.map(x=>x.method),['HEAD']);
});
test('Missing HTML pages are not shown as 404 inside the game',async()=>{
 const h=harness({httpStatus:404});
 await flush();
 assert.equal(h.frame.replacedBy?.className,'store-load-error');
 assert.match(h.frame.replacedBy.children[1].textContent,/404/);
});
test('Neon Tide makes its original raw HTML server selectable again',()=>{
 const store=fs.readFileSync(path.join(__dirname,'../core/game-store.js'),'utf8');
 assert.match(store,/DAKNUX \(raw HTML\)/);
 assert.match(store,/neonTide\.servers=\[\{name:'DAKNUX \(raw HTML\)',url:rawHTML\}\]/);
});
