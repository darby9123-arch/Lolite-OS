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

test('Legacy remote provider catalogues stay retired while uploaded game packs are hosted locally',()=>{
 const retired=['genizymath-catalog.js','mountain-games-catalog.js','chickenkings-catalog.js'];
 for(const file of retired){
  assert.equal(fs.existsSync(path.join(root,'core',file)),false,'Retired catalog still exists: '+file);
  assert.ok(!mainSource.includes('core/'+file),'Retired catalog still loads: '+file);
 }
 assert.ok(fs.existsSync(path.join(root,'core/additional-game-servers.js')));
 assert.match(source,/loadAdditionalServers\(\)/);
 assert.match(source,/await syncGamefilesCollection\(\)/);
 assert.match(source,/local:true,external:false,source:'Lolite OS · repository HTML'/);
 assert.match(source,/local:true,external:false,source:'Lolite OS · built-in HTML'/);
 assert.match(source,/const raw=\[\{name:baseName,url:g\.url\}/);
 assert.doesNotMatch(source,/Mountain Games/);
 assert.ok(mainSource.includes('core/uploaded-game-packs.js?v='));
 assert.match(source,/loadUploadedGamePacks\(\)/);
 assert.match(source,/"DAKNUX"/);
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

test('Geometry Dash Full webport has matching featured art and playable local HTML',()=>{
 const webport='Geometry Dash webport.html';
 const {files}=catalog();
 assert.ok(files.includes(webport),'Webport must be in the HTML game manifest');
 assert.ok(fs.existsSync(path.join(root,'html games',webport)),'Playable local HTML must exist');
 const g=JSON.parse(source.match(/const featuredGames=(\[[^\n]+\]);/)[1]);
 const entry=g.find(x=>x.file===webport);
 assert.ok(entry,'Geometry Dash Full should replace GD Breeze on Featured');
 assert.equal(entry.title,'Geometry Dash Full');
 assert.ok(!g.some(x=>x.file==='clgdbreeze.html'),'Old GD Breeze card must not remain Featured');
 assert.ok(fs.existsSync(path.join(root,entry.background)),'Featured gameplay background must exist');
 const art=fs.readFileSync(path.join(root,'core/game-art.js'),'utf8');
 assert.match(art,/"Geometry Dash webport\.html"\s*:\s*\{\s*"src"\s*:\s*"assets\/games\/geometry-dash-full-logo\.svg"/);
 assert.ok(fs.existsSync(path.join(root,'assets/games/geometry-dash-full-logo.svg')));
 assert.doesNotMatch(mainSource,/gd-loading-fix\.js/);
 assert.match(source,/Geometry Dash webport\.html/);
});
