const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=path=>fs.readFileSync(path,'utf8');
const source=read('core/ugs-presentation.js');
function harness(options={}){
 const calls=[];
 const win={};
 const html=options.html||'<html><head><base href="https://cdn.jsdelivr.net/gh/example/game@main/"><link rel="icon" href="icons/icon-256.png"></head></html>';
 const fetch=async url=>{
  calls.push(String(url));
  return {ok:options.ok!==false,text:async()=>html};
 };
 class FakeDOMParser{
  parseFromString(source){
   return {querySelector(selector){
    const base=source.match(/<base\b[^>]*href=["']([^"']+)["']/i)?.[1];
    const icon=source.match(/<link\b[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["']/i)?.[1];
    const meta=source.match(/<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];
    const value=selector==='base[href]'?base:selector==='link[rel~="icon"]'?icon:selector==='meta[property="og:image"]'?meta:null;
    return value?{getAttribute:attribute=>value}:null;
   }};
  }
 }
 const context={
  window:win,document:{baseURI:'https://lolite.example/Lolite-OS/'},
  fetch,DOMParser:FakeDOMParser,URL,TextDecoder,Promise,console
 };
 vm.runInNewContext(source,context,{timeout:2000});
 return {api:win.LoliteUGSPresentation,calls};
}
const hosted=(name='clantimatterdimensions.html')=>({
 url:'html%20games/ugs/'+name,
 ugsEntry:{filename:name,title:'Antimatter Dimensions'}
});
test('UGS metadata scripts are loaded before the Game Store',()=>{
 const index=read('index.html'),store=read('core/game-store.js');
 assert.ok(index.indexOf('core/ugs-catalog.js')>=0);
 assert.ok(index.indexOf('core/ugs-hosted-catalog.js')<index.indexOf('core/ugs-presentation.js'));
 assert.ok(index.indexOf('core/ugs-presentation.js')<index.indexOf('core/game-store.js'));
 assert.match(store,/LoliteUGSPresentation\?\.title\(sourceTitle,filename\)/);
 assert.match(store,/game\?\.ugsEntry\?\.filename/);
 assert.match(store,/LoliteUGSPresentation\.discover\(ugsGame\)/);
 assert.match(store,/ugsDiscoveredArt\.set\(file,src\)/);
 assert.match(store,/const preferredURL=hasLocalInstall\?ugsFileURL\(record\):hostedURL/);
});
test('UGS names use real word spacing, correct acronyms and preserve distinct variants',()=>{
 const {api}=harness();
 const cases=[
  ['Baconmaydie','Bacon May Die'],
  ['3pandasbrazil','3 Pandas: Brazil'],
  ['Antimatterdimensions','Antimatter Dimensions'],
  ['Basketballstars','Basketball Stars'],
  ['Basketballsuperstars','Basketball Superstars'],
  ['Bloons TD4','Bloons TD 4'],
  ['Ageofwar2','Age of War 2'],
  ['Clashofvikings','Clash of Vikings'],
  ['Badicecream2','Bad Ice-Cream 2'],
  ['Vex3','Vex 3'],
  ['BFDIBranches','BFDI Branches'],
  ['Bitlife','BitLife'],
  ['Hextris','Hextris'],
  ['3slices2','3 Slices 2']
 ];
 for(const [original,expected] of cases)
  assert.equal(api.title(original,'cl'+original.toLowerCase()+'.html'),expected,original);
 assert.equal(api.title('','clbaconmaydie.html'),'Bacon May Die');
});
test('Real game-owned icons are resolved from hosted HTML metadata and cached',async()=>{
 const h=harness();
 const game=hosted();
 const first=await h.api.discover(game),second=await h.api.discover(game);
 assert.equal(first,'https://cdn.jsdelivr.net/gh/example/game@main/icons/icon-256.png');
 assert.equal(second,first);
 assert.deepEqual(h.calls,['html%20games/ugs/clantimatterdimensions.html']);
});
test('Game-owned social artwork has priority over a favicon',async()=>{
 const h=harness({html:'<html><base href="https://cdn.jsdelivr.net/gh/example/game@main/">'+
  '<meta property="og:image" content="images/cover.png"><link rel="icon" href="favicon.png"></html>'});
 assert.equal(await h.api.discover(hosted()),'https://cdn.jsdelivr.net/gh/example/game@main/images/cover.png');
});
test('Missing icons or non-UGS URLs never cause new game requests',async()=>{
 const h=harness({ok:false});
 assert.equal(await h.api.discover(hosted()),'');
 assert.equal(await h.api.discover({url:'https://drive.google.com/example',ugsEntry:{filename:'x.html'}}),'');
 assert.equal(await h.api.discover({url:'html%20games/ugs/missing.html'}),'');
 assert.equal(h.calls.length,1);
});
test('Original game HTML remains untouched; the only new network requests look up covers lazily',()=>{
 const store=read('core/game-store.js');
 assert.match(store,/if\(ugsGame&&!el\.dataset\.ugsArtChecked/);
 assert.match(source,/running<3&&queue\.length/);
 assert.match(source,/while\(text\.length<65536\)/);
 assert.doesNotMatch(source,/eval\(|innerHTML\s*=|<iframe|window\.open/);
});
