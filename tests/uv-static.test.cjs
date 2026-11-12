const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=name=>fs.readFileSync(name,'utf8');
test('Startup inline scripts parse and the UV client precedes the browser UI',()=>{
 const html=read('index.html');
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if(!/\bsrc=/.test(match[1]))assert.doesNotThrow(()=>new vm.Script(match[2]));
 }
 assert.ok(html.indexOf('core/uv-static-client.js')<html.indexOf('core/ultraviolet.js'));
});
function client({manifest={versions:['v1','v2']},secure=true}={}){
 const stored=new Map(),scripts=[],registrations=[],requests=[];
 const window={isSecureContext:secure,__uv$config:{prefix:'/Lolite-OS/browser/uv-static/service/',encodeUrl:encodeURIComponent}};
 const navigator={serviceWorker:{async register(url,options){registrations.push({url,options});return {active:{state:'activated'}}}}};
 vm.runInNewContext(read('core/uv-static-client.js'),{window,navigator,URL,URLSearchParams,location:{origin:"https://lolite.example"},AbortController,setTimeout,clearTimeout,
  localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)},
  document:{currentScript:{src:'https://lolite.example/Lolite-OS/core/uv-static-client.js'},createElement:()=>({}),head:{appendChild(el){scripts.push(el.src);queueMicrotask(el.onload)}}},
  fetch:async(url,options)=>{requests.push({url,options});return {ok:true,async json(){return manifest}}}
 });
 return {api:window.LoliteUVStatic,stored,scripts,registrations,requests};
}
test('UV-Static checks a relay and opens a separate origin without a worker on Lolite',async()=>{
 const h=client();h.api.setRelay('https://relay.example/bare');
 const target=await h.api.address('https://example.org/game');
 const address=new URL(target);
 assert.equal(address.origin,'https://lolite-uv-static.vercel.app');
 const params=new URLSearchParams(address.hash.slice(1));
 assert.equal(params.get('url'),'https://example.org/game');
 assert.equal(params.get('relay'),'https://relay.example/bare/');
 assert.equal(h.registrations.length,0);
 assert.equal(h.scripts.length,0);
 assert.equal(h.requests[0].options.credentials,'omit');
});
test('A non-relay response or insecure context fails before service worker registration',async()=>{
 const bad=client({manifest:{message:'Site unavailable'}});
 await assert.rejects(bad.api.address('https://example.org'),/relay is unavailable or incompatible/);
 assert.equal(bad.registrations.length,0);assert.equal(bad.scripts.length,0);
 const insecure=client({secure:false});
 await assert.rejects(insecure.api.address('https://example.org'),/needs HTTPS/);
});
test('Relay settings reject credentials and unsupported URLs',()=>{
 const {api}=client();
 for(const value of ['http://relay.example','https://user:secret@relay.example','https://relay.example/?secret=abc','javascript:alert(1)'])
  assert.throws(()=>api.setRelay(value));
});
test('UV configuration works under a GitHub Pages project path',()=>{
 const self={location:{href:'https://lolite.example/Lolite-OS/browser/uv-static/sw.js'}};
 vm.runInNewContext(read('browser/uv-static/uv.config.js'),{self,URL,Ultraviolet:{codec:{xor:{encode:encodeURIComponent,decode:decodeURIComponent}}}});
 assert.equal(self.__uv$config.prefix,'/Lolite-OS/browser/uv-static/service/');
 assert.equal(self.__uv$config.bundle,'/Lolite-OS/browser/uv-static/uv.bundle.js');
});
test('Worker ignores account, game and unrelated-origin requests',()=>{
 const handlers={},routed=[];
 const self={location:new URL('https://lolite.example/browser/uv-static/sw.js'),__uv$config:{prefix:'/browser/uv-static/service/'},addEventListener:(name,cb)=>handlers[name]=cb};
 vm.runInNewContext(read('browser/uv-static/sw.js'),{self,URL,importScripts(){},UVServiceWorker:class{fetch(event){routed.push(event.request.url);return Promise.resolve({})}}});
 for(const url of ['https://lolite.example/accounts','https://lolite.example/html%20games/test.html','https://other.example/browser/uv-static/service/foo','https://lolite.example/browser/uv-static/service/foo'])
  handlers.fetch({request:{url},respondWith(){}});
 assert.deepEqual(routed,['https://lolite.example/browser/uv-static/service/foo']);
 const frame=read('core/ultraviolet.js').match(/<iframe[^>]+>/)[0];
 assert.match(frame,/sandbox="allow-scripts/);assert.doesNotMatch(frame,/allow-same-origin/);
 assert.match(read('core/ultraviolet.js'),/origin===location.origin\|\|origin!==window.LoliteUVStatic.origin/);
});

async function launcher({parentDocument=false,path='/'}={}){
 const status={},registrations=[],destinations=[];
 const parent=parentDocument?{document:{}}:new Proxy({}, {get(){throw Error('Cross-origin')}});
 const window={parent,__uv$config:{prefix:'/service/',encodeUrl:encodeURIComponent}};
 const location={pathname:path,href:'https://proxy.example/',hash:'#url=https%3A%2F%2Fexample.org%2F&relay=https%3A%2F%2Frelay.example%2F',replace:value=>destinations.push(value)};
 vm.runInNewContext(read('browser/uv-static/launch.js'),{window,location,URL,URLSearchParams,setTimeout,clearTimeout,
  document:{getElementById:()=>status},navigator:{serviceWorker:{async register(url,options){registrations.push({url,options});return {active:{state:'activated'}}}}}
 });
 await new Promise(resolve=>setImmediate(resolve));return {status,registrations,destinations};
}
test('Isolated host registers its worker then navigates to the encoded target',async()=>{
 const h=await launcher();
 assert.equal(h.registrations[0].options.scope,'/');
 assert.equal(new URL(h.registrations[0].url).searchParams.get('relay'),'https://relay.example/');
 assert.deepEqual(h.destinations,['/service/https%3A%2F%2Fexample.org%2F']);
});
test('Proxy bootstrap refuses a same-origin parent and the main app subdirectory',async()=>{
 for(const options of [{parentDocument:true},{path:'/browser/uv-static/index.html'}]){
  const h=await launcher(options);assert.equal(h.registrations.length,0);assert.equal(h.destinations.length,0);
  assert.match(h.status.textContent,/separated|dedicated/);
 }
});
