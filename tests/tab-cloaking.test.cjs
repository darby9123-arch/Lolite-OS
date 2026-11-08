const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'core/tab-cloaking.js'),'utf8');

function setup(previous=null){
 const events={},toasts=[],storage=new Map(),links=[
  {href:'',type:'image/svg+xml',removeAttribute(key){if(key==='type')delete this.type}},
  {href:'',type:'image/svg+xml',removeAttribute(key){if(key==='type')delete this.type}}
 ];
 if(previous)storage.set('loliteTabAppearanceV1',JSON.stringify(previous));
 const fields={
  '[data-ltc-website-url]':{value:'https://drive.google.com/drive/u/0/my-drive'},
  '[data-ltc-website-title]':{value:''}
 };
 const doc={
  baseURI:'https://darby9123-arch.github.io/Lolite-OS/',
  title:'Lolite OS',
  head:{appendChild(){}},
  createElement(tag){assert.equal(tag,'style');return {textContent:''}},
  querySelectorAll(selector){return selector==='link[rel~="icon"]'?links:[]},
  querySelector(selector){return fields[selector]||null},
  addEventListener(name,handler){events[name]=handler}
 };
 class FakeImage{set src(value){this._src=value}get src(){return this._src}}
 const localStorage={getItem:key=>storage.get(key)||null,setItem:(key,v)=>storage.set(key,v),removeItem:key=>storage.delete(key)};
 const win={toast:message=>toasts.push(message)};
 vm.runInNewContext(source,{
  window:win,document:doc,localStorage,Image:FakeImage,FileReader:class{},
  URL,encodeURIComponent,console
 });
 function clickWebsite(){
  events.click({target:{closest:()=>({
   dataset:{},hasAttribute:name=>name==='data-ltc-website'
  })}});
 }
 function reset(){
  win.LoliteTabCloak.reset();
 }
 return {events,fields,doc,links,storage,win,toasts,clickWebsite,reset};
}

test('Custom website URL automatically sets the exact tab name and matching favicon',()=>{
 const h=setup();h.clickWebsite();
 assert.equal(h.doc.title,'Google Drive');
 assert.ok(h.links.every(link=>link.href==='https://www.google.com/s2/favicons?domain=drive.google.com&sz=64'));
 assert.ok(h.links.every(link=>!('type' in link)),'SVG MIME must be removed for PNG/ICO favicons');
 const saved=JSON.parse(h.storage.get('loliteTabAppearanceV1'));
 assert.equal(saved.mode,'website');
 assert.equal(saved.websiteUrl,'https://drive.google.com/drive/u/0/my-drive');
});

test('Unknown HTTPS domains use the actual hostname without Lolite OS prefix',()=>{
 const h=setup();h.fields['[data-ltc-website-url]'].value='https://www.example.net/some/page';
 h.clickWebsite();
 assert.equal(h.doc.title,'example.net');
 assert.match(h.links[0].href,/domain=www\.example\.net/);
});

test('Optional website title overrides the inferred domain and is saved on this browser',()=>{
 const h=setup();h.fields['[data-ltc-website-title]'].value='Important notes';
 h.clickWebsite();
 assert.equal(h.doc.title,'Important notes');
 assert.equal(JSON.parse(h.storage.get('loliteTabAppearanceV1')).websiteTitle,'Important notes');
 h.fields['[data-ltc-website-title]'].value='My saved work';
 h.events.input({target:{matches:selector=>selector==='[data-ltc-website-title]',value:'My saved work'}});
 assert.equal(h.doc.title,'My saved work');
});

test('Reject unsafe URLs and do not navigate or spoof the actual browser location',()=>{
 const h=setup();h.fields['[data-ltc-website-url]'].value='http://example.com';
 h.clickWebsite();
 assert.equal(h.doc.title,'Lolite OS');
 assert.equal(h.storage.size,0);
 assert.match(h.toasts.join(' '),/HTTPS/);
 assert.doesNotMatch(source,/history\.(?:pushState|replaceState)|location\.(?:assign|replace)\(/);
 assert.match(h.win.LoliteTabCloak.markup(),/address bar/);
});

test('Previously saved website appearance restores the favicon and tab title',()=>{
 const h=setup({mode:'website',websiteUrl:'https://classroom.google.com/u/0/h',websiteTitle:''});
 assert.equal(h.doc.title,'Google Classroom');
 assert.match(h.links[0].href,/domain=classroom\.google\.com/);
 h.reset();
 assert.equal(h.doc.title,'Lolite OS');
 assert.ok(h.links[0].href.startsWith('assets/lolite-cosmos-logo.svg'));
 assert.equal(h.storage.size,0);
});

test('Website favicon fetch failures have a safe default icon fallback',()=>{
 const h=setup();h.clickWebsite();
 assert.match(source,/fallbackIcon:site\.origin\+'\/favicon\.ico'/);
 assert.match(source,/test\.onerror=/);
 assert.match(source,/link\.removeAttribute\('type'\)/);
});

test('Published index loads the refreshed tab appearance code',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(html,/core\/tab-cloaking\.js\?v=custom-favicon-20261109/);
});
