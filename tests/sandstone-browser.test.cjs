const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('apps/sandstone-desktop.html','utf8');
const match=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match,'Sandstone direct shell must contain executable browser code');
const source=match[1];

function harness(existing=new Map()){
 const nodes=new Map(),opens=[];
 class Element{
  constructor(id){this.id=id;this.children=[];this.listeners={};this.dataset={};this.style={};this.attributes={};this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.className='';this.src='';
   this.classList={toggle(name,on){this.classes??=new Set();if(on)this.classes.add(name);else this.classes.delete(name)}};
  }
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
  click(){for(const fn of this.listeners.click||[])fn({target:this,preventDefault(){}})}
  submit(){for(const fn of this.listeners.submit||[])fn({target:this,preventDefault(){}})}
  append(...els){this.children.push(...els)}
  replaceChildren(...els){this.children=els}
  setAttribute(key,value){this.attributes[key]=String(value);if(key==='src')this.src=String(value)}
  getAttribute(key){if(key==='src')return this.src||null;return this.attributes[key]??null}
  removeAttribute(key){delete this.attributes[key];if(key==='src')this.src=''}
  focus(){this.focused=true}
  select(){this.selected=true}
 }
 for(const id of ['tabs','new-tab','go-form','address','go','back','forward','reload','home-button','bookmark','external','home','viewport','frame','status-left','bookmarks','notice','open-tab'])nodes.set(id,new Element(id));
 const docListeners={};
 const document={
  getElementById:id=>nodes.get(id)||null,
  createElement:tag=>new Element(tag),
  querySelectorAll:()=>[],
  addEventListener:(type,fn)=>{(docListeners[type]??=[]).push(fn)}
 };
 const win={open:(...args)=>{opens.push(args);return null}};
 const storage={getItem:key=>existing.has(key)?existing.get(key):null,setItem:(key,val)=>existing.set(key,String(val))};
 vm.runInNewContext(source,{window:win,document,URL,location:{origin:'https://lolite.example'},localStorage:storage,encodeURIComponent,Math,Date,console},{timeout:3000});
 return {api:win.SandstoneDesktop,nodes,opens,storage,document,docListeners};
}

test('Sandstone launches the direct browser shell while retaining the uploaded original',()=>{
 const app=fs.readFileSync('app.js','utf8');
 const index=fs.readFileSync('index.html','utf8');
 assert.match(app,/if\(id==='sandstone'\).*?apps\/sandstone-desktop\.html/);
 assert.match(app,/title="Sandstone Browser"/);
 assert.ok(fs.statSync('apps/sandstone-browser.html').size>1000000,'Original uploaded Sandstone HTML must remain intact');
 assert.match(index,/app\.js\?v=/);
 assert.match(html,/Sandstone Browser/);
 assert.match(html,/Original.*proxy requires a separate server|original proxy requires a separate server/i);
});
test('Address input accepts HTTPS sites and turns plain search text into web searches',()=>{
 const h=harness();
 assert.equal(h.api.getURL(),'sandstone:home');
 assert.equal(h.api.normalize('example.org'),'https://example.org/');
 assert.equal(h.api.normalize('https://www.wikipedia.org/'),'https://www.wikipedia.org/');
 assert.equal(h.api.normalize('game physics tips'),'https://duckduckgo.com/?q=game%20physics%20tips');
 assert.equal(h.api.normalize('http://example.org/'),'https://example.org/');
 assert.throws(()=>h.api.normalize('javascript:alert(1)'),/Only HTTPS websites/);
 assert.throws(()=>h.api.normalize('https://user:pass@example.org/'),/ordinary websites/);
 assert.throws(()=>h.api.normalize('https://lolite.example/'),/main desktop/);
});
test('Go, Back, Forward and Home update tab history and the actual preview URL',()=>{
 const h=harness(),a='https://example.org/',b='https://www.wikipedia.org/';
 h.api.go('example.org');
 assert.equal(h.api.getURL(),a);
 assert.equal(h.nodes.get('frame').src,a);
 assert.equal(h.nodes.get('viewport').style.display,'flex');
 h.api.go(b);
 assert.equal(h.api.getURL(),b);
 h.nodes.get('back').click();
 assert.equal(h.api.getURL(),a);
 h.nodes.get('forward').click();
 assert.equal(h.api.getURL(),b);
 h.nodes.get('home-button').click();
 assert.equal(h.api.getURL(),'sandstone:home');
 assert.equal(h.nodes.get('frame').src,'');
 assert.equal(h.nodes.get('viewport').style.display,'none');
});
test('Separate tabs can be opened and closed without losing another tab',()=>{
 const h=harness();
 h.api.go('example.org');
 h.nodes.get('new-tab').click();
 assert.equal(h.api.getTabs().length,2);
 assert.equal(h.api.getURL(),'sandstone:home');
 const first=h.api.getTabs()[0].id;
 const tabElements=h.nodes.get('tabs').children;
 assert.equal(tabElements.length,2);
 tabElements[0].children[0].click();
 assert.equal(h.api.getURL(),'https://example.org/');
 const second=h.api.getTabs()[1].id;
 h.nodes.get('tabs').children[1].children[1].click();
 assert.equal(h.api.getTabs().length,1);
 assert.equal(h.api.getTabs()[0].id,first);
 assert.notEqual(first,second);
});
test('External-tab fallback always opens the original URL without a proxy rewrite',()=>{
 const h=harness();
 h.api.go('https://example.org/path?q=1');
 h.nodes.get('external').click();
 assert.deepEqual(h.opens[0],['https://example.org/path?q=1','_blank','noopener,noreferrer']);
});
test('Bookmarks persist locally and never become remote account data',()=>{
 const storage=new Map(),h=harness(storage);
 h.api.go('https://example.org/');
 h.nodes.get('bookmark').click();
 assert.deepEqual(JSON.parse(storage.get('lolite-sandstone-bookmarks-v2')),[{url:'https://example.org/',name:'example.org'}]);
 assert.equal(h.nodes.get('bookmark').textContent,'★');
 const h2=harness(storage);
 assert.equal(h2.nodes.get('bookmarks').children.length,1);
 h2.nodes.get('bookmarks').children[0].click();
 assert.equal(h2.api.getURL(),'https://example.org/');
 h2.nodes.get('bookmark').click();
 assert.deepEqual(JSON.parse(storage.get('lolite-sandstone-bookmarks-v2')),[]);
});
test('The website preview has an explicit honest no-proxy fallback, not unsafe injected script',()=>{
 assert.match(html,/sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"/);
 assert.doesNotMatch(html,/sandbox="[^"]*allow-same-origin/);
 assert.match(html,/id="open-tab"/);
 assert.match(html,/site may block embedded browsers/);
 assert.doesNotMatch(source,/\beval\s*\(|document\.write\s*\(|\.innerHTML\s*=/);
 assert.doesNotMatch(source,/wisp\.mercurywork\.shop|scramjet\.wasm|bareMux|serviceWorker\.register/);
});
