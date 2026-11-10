const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html');
const store=read('core/game-store.js');
const packageStore=read('core/local-game-packages.js');
const catalogScript=read('core/ugs-catalog.js');
const context={window:{}};
vm.runInNewContext(catalogScript,context,{timeout:2000});
const catalog=Array.from(context.window.LoliteUGSCatalog||[]);

test('UGS Drive game catalogue loads before Game Store without mirroring game code',()=>{
 assert.ok(html.indexOf('core/ugs-catalog.js?v=')>-1,'UGS script must be present');
 assert.ok(html.indexOf('core/ugs-catalog.js?v=')<html.indexOf('core/game-store.js?v='),'UGS catalogue must be loaded before Game Store');
 assert.ok(catalog.length>1000,'UGS must include hundreds of HTML5 and Flash titles');
 assert.ok(catalog.every(row=>row.length===5 && /^[A-Za-z0-9_-]+$/.test(row[0]) &&
  (row[1].toLowerCase().endsWith('.html')||row[1].toLowerCase().endsWith('.htm')) && ['html5','flash'].includes(row[2]) &&
  Number.isFinite(row[3]) && typeof row[4]==='string'));
 assert.ok(catalog.some(row=>row[2]==='html5'));
 assert.ok(catalog.some(row=>row[2]==='flash'));
 assert.doesNotMatch(catalogScript,/<iframe|<html|<script src/i);
});

test('UGS is discoverable and only uses installed HTML as an actual game server',()=>{
 assert.match(store,/"UGS"/);
 assert.match(store,/active==='UGS'\?!!g\.ugsEntry/);
 assert.match(store,/g\.ugsPending\)return false/);
 assert.match(store,/const baseName=g\.ugsInstalled\?'UGS'/);
 assert.match(store,/if\(game\.ugsPending\)/);
 assert.match(store,/syncUGSCollection/);
 assert.match(store,/ugsFileURL\(record\)/);
 assert.match(store,/window\.loliteUGSImportHTML/);
 assert.match(store,/window\.loliteUGSImportZip/);
 assert.match(store,/data-ugs-source/);
 assert.match(store,/data-ugs-import-zip/);
});

test('UGS ZIP and individual HTML games are browser-local user-initiated imports',()=>{
 assert.match(packageStore,/async function importUGSZip\(file,onProgress\)/);
 assert.match(packageStore,/source:"ugs-collection"/);
 assert.ok(packageStore.includes('importUGSZip,importUGSFolder,removeGamefilesZip,list:getAll'));
 assert.match(packageStore,/async function importUGSFolder\(files,onProgress\)/);
 assert.match(packageStore,/source:"ugs-collection-assets"/);
 assert.match(store,/window\.loliteUGSImportFolder/);
 assert.match(store,/data-ugs-import-folder/);
 assert.match(store,/const hasLocalInstall=!!record/);
 assert.ok(packageStore.includes('Choose a ZIP containing UGS HTML5 games'));
 assert.match(store,/input\.type='file'/);
 assert.doesNotMatch(store,/fetch\(['"]https:\/\/drive\.google\.com/);
});

test('Repository hosts actual licensed UGS HTML files, not Drive redirects',()=>{
 const hostedScript=read('core/ugs-hosted-catalog.js');
 const env={window:{}};
 vm.runInNewContext(hostedScript,env,{timeout:2000});
 const hosted=env.window.LoliteUGSHosted||{};
 const entries=Object.entries(hosted);
 assert.ok(entries.length>=2,'At least two actual HTML games should be hosted');
 assert.ok(html.indexOf('core/ugs-hosted-catalog.js?v=')>html.indexOf('core/ugs-catalog.js?v='));
 assert.ok(html.indexOf('core/ugs-hosted-catalog.js?v=')<html.indexOf('core/game-store.js?v='));
 for(const [id,url] of entries){
  assert.ok(catalog.some(row=>row[0]===id&&row[2]==='html5'),'Hosted games must come from UGS index');
  assert.match(url,/^html%20games\/ugs\/[a-z0-9._-]+\.html?$/i);
  const file=decodeURIComponent(url);
  const source=read(file);
  assert.ok(source.length>600,'Actual game HTML must be committed, not an empty launcher');
  assert.match(source,/<html\b/i);
  assert.doesNotMatch(source,/^\s*<Module>/i,'UGS module wrappers must not precede HTML');
  assert.doesNotMatch(source,/https:\/\/drive\.google\.com\/file\/d\//i,'Hosted game must not be a Drive preview redirect');
 }
 assert.ok(fs.existsSync(path.join(root,'html games/ugs/LICENSE-antimatter-dimensions.txt')));
 assert.ok(fs.existsSync(path.join(root,'html games/ugs/LICENSE-hextris.md')));
 assert.ok(fs.existsSync(path.join(root,'html games/ugs/LICENSE-we-become-what-we-behold.md')));
 assert.match(store,/const hosted=window\.LoliteUGSHosted/);
 assert.match(store,/const preferredURL=hasLocalInstall\?ugsFileURL\(record\):hostedURL/);
});
