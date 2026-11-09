const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'core/game-store.js'),'utf8');
const mainSource=fs.readFileSync(path.join(root,'index.html'),'utf8');
const actualHtml=fs.readdirSync(path.join(root,'html games'))
  .filter(name=>/\.html?$/i.test(name)).sort();
const builtInDirectories=fs.readdirSync(path.join(root,'games'),{withFileTypes:true})
  .filter(entry=>entry.isDirectory()&&fs.existsSync(path.join(root,'games',entry.name,'index.html')))
  .map(entry=>entry.name).sort();

function catalog(){
 const manifest=source.match(/const manifest=\[([^\]]+)\];/);
 assert.ok(manifest,'Game Store must declare the local HTML files');
 const files=[...manifest[1].matchAll(/'([^']+\.html?)'/g)].map(m=>m[1]).sort();
 const builtIn=source.match(/const builtInHtmlGames=(\[[^\n]+\]);/);
 assert.ok(builtIn,'Game Store must declare built-in HTML launch pages');
 const builtIns=JSON.parse(builtIn[1]);
 return {files,builtIns};
}

test('Every HTML page in the Lolite game folders is listed exactly once',()=>{
 const {files,builtIns}=catalog();
 assert.deepEqual(files,actualHtml,'Keep the Game Store manifest in sync with actual HTML files');
 assert.deepEqual(builtIns.map(item=>item.url).sort(),
  builtInDirectories.map(name=>['games',name,'index.html'].join('/')).sort(),
  'All built-in games/index.html pages must be visible in the store');
 assert.equal(new Set([...files,...builtIns.map(x=>x.file)]).size,
  files.length+builtIns.length,'A game ID should never appear twice');
 for(const item of builtIns){
  assert.match(item.file,/^local-[a-z0-9-]+-index\.html$/);
  assert.equal(typeof item.title,'string');
  assert.ok(item.title.length>0);
 }
});

test('Game Store only loads repository HTML games, not remote catalog entries',()=>{
 assert.doesNotMatch(source,/^\s*loadGenizyCatalog\(\);\s*$/m);
 assert.doesNotMatch(source,/^\s*loadAdditionalServers\(\);\s*$/m);
 assert.doesNotMatch(source,/^\s*void syncGamefilesCollection\(\)/m);
 assert.match(source,/const raw=\[\{name:baseName,url:g\.url\}\];/);
 assert.match(source,/local:true,external:false,source:'Lolite OS · repository HTML'/);
 assert.match(source,/local:true,external:false,source:'Lolite OS · built-in HTML'/);
 assert.doesNotMatch(mainSource,/<script[^>]*\bsrc="core\/game-store\.js[^"]*"[^>]*>\s*<\/script>\s*<script[^>]*\bsrc="https?:\/\/[^"]+\.html"/i);
});

test('Featured games are all present as local HTML',()=>{
 const {files,builtIns}=catalog();
 const available=new Set([...files,...builtIns.map(x=>x.file)]);
 const match=source.match(/const featuredGames=(\[[^\n]+\]);/);
 assert.ok(match);
 const featured=JSON.parse(match[1]);
 assert.ok(featured.length>=4);
 for(const item of featured){
  assert.ok(available.has(item.file),'Featured title missing from repository: '+item.file);
 }
});
