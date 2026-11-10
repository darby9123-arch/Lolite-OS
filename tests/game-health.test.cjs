const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../core/game-health.js'),'utf8');

function healthHarness(){
 let now=1000000, events=0, fetchCount=0;
 const win={dispatchEvent:()=>{events++}};
 const RealDate=Date;
 const Clock=class extends RealDate{static now(){return now}};
 const context={
  window:win,
  document:{baseURI:'https://lolite.example/Lolite-OS/'},
  location:{origin:'https://lolite.example'},
  CustomEvent:class{constructor(name,options){this.type=name;this.detail=options?.detail}},
  Date:Clock,URL,AbortController,setTimeout,clearTimeout,
  fetch:async(url,opts)=>{fetchCount++;return{status:404,ok:false}},
  console
 };
 vm.runInNewContext(source,context);
 return {health:win.LoliteGameHealth,advance:ms=>{now+=ms},
  events:()=>events,fetchCount:()=>fetchCount};
}

test('Confirmed remote 404 is remembered without issuing an extra request',()=>{
 const h=healthHarness(),url='https://genizymath.github.io/iframe/0-fix2.html';
 assert.equal(h.health.status({url}),'unverified');
 h.health.markHttpError(url,404);
 assert.equal(h.health.isUnavailable({url}),true);
 assert.equal(h.health.status(url),'missing');
 assert.equal(h.fetchCount(),0);
 assert.ok(h.events()>0);
});

test('Other HTTP errors and CORS uncertainty never become a false 404',()=>{
 const h=healthHarness(),url='https://mountain658.github.io/mountain.html';
 h.health.markHttpError(url,403);
 assert.equal(h.health.isUnavailable({url}),false);
 h.health.markHttpError(url,500);
 assert.equal(h.health.isUnavailable({url}),false);
 h.health.markHttpError(url,410);
 assert.equal(h.health.isUnavailable({url}),true);
});

test('Broken external URLs become eligible to retry after ten minutes',()=>{
 const h=healthHarness(),url='https://wanocapy.github.io/ChickenKingsVault/gamefiles/example.html';
 h.health.markHttpError(url,404);
 h.advance(10*60*1000+1);
 assert.equal(h.health.isUnavailable({url}),false);
 assert.equal(h.health.status({url}),'unverified');
});

test('Local repository 404 is still detected by the original HEAD check',async()=>{
 const h=healthHarness();
 const local={url:'html%20games/missing-game.html'};
 const result=await h.health.probe(local);
 assert.equal(result.status,'missing');
 assert.equal(h.health.isUnavailable(local),true);
 assert.equal(h.fetchCount(),1);
});
