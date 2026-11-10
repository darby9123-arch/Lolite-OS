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

test('UGS appears as playable built-in HTML only; no import or Drive source controls',()=>{
 assert.match(store,/"UGS"/);
 assert.match(store,/active==='UGS'\?!!g\.ugsEntry/);
 assert.match(store,/if\(!hasInstall\)continue/);
 assert.match(store,/const baseName=g\.ugsInstalled\?'UGS'/);
 assert.match(store,/syncUGSCollection/);
 assert.match(store,/ugsFileURL\(record\)/);
 assert.match(store,/const hasLocalInstall=!!record/);
 assert.doesNotMatch(store,/ugsPending|ugsHasOther/);
 assert.doesNotMatch(store,/data-ugs-source|data-ugs-install|data-ugs-import-zip|data-ugs-import-folder/);
 assert.doesNotMatch(store,/window\.loliteUGSImport|window\.loliteUGSViewSource/);
 assert.doesNotMatch(store,/Import UGS ZIP|Import UGS Folder|View UGS Drive file|View source|Import HTML/);
 assert.doesNotMatch(store,/https:\/\/drive\.google\.com\/file\/d\//);
});

test('Existing local UGS game storage remains compatible but is not required to play bundled games',()=>{
 assert.match(packageStore,/async function importUGSZip\(file,onProgress\)/);
 assert.match(packageStore,/source:"ugs-collection"/);
 assert.ok(packageStore.includes('importUGSZip,importUGSFolder,removeGamefilesZip,list:getAll'));
 assert.match(packageStore,/async function importUGSFolder\(files,onProgress\)/);
 assert.match(store,/const hasInstall=hasLocalInstall\|\|hasHosted/);
 assert.match(store,/const preferredURL=hasLocalInstall\?ugsFileURL\(record\):hostedURL/);
});

test('Repository hosts actual licensed UGS HTML files, not Drive redirects',()=>{
 const hostedScript=read('core/ugs-hosted-catalog.js');
 const env={window:{}};
 vm.runInNewContext(hostedScript,env,{timeout:2000});
 const hosted=env.window.LoliteUGSHosted||{};
 const entries=Object.entries(hosted);
 assert.ok(entries.length>=6,'The UGS category should include at least six repository-hosted HTML games');
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
 assert.ok(fs.existsSync(path.join(root,'html games/ugs/LICENSE-space-company.txt')));
 assert.ok(fs.existsSync(path.join(root,'html games/ugs/LICENSE-google-dino.txt')));
 assert.match(store,/const hosted=window\.LoliteUGSHosted/);
 assert.ok(entries.some(([id])=>id==='1HckIkpHaaVIrOMJUuh7YaXcBfBF9m7L5'),'Chrome Dino HTML is mapped to UGS');
 assert.match(store,/const preferredURL=hasLocalInstall\?ugsFileURL\(record\):hostedURL/);
});
