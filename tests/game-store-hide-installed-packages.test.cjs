const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const js=fs.readFileSync(path.join(__dirname,'../core/html-game-ui.js'),'utf8');

test('Game Store no longer shows Installed HTML Game Packages',()=>{
 assert.doesNotThrow(()=>new Function(js));
 assert.doesNotMatch(js,/Installed HTML Game Packages/);
 assert.doesNotMatch(js,/button\("My local games"/);
 assert.doesNotMatch(js,/buildSection\(root,"lolite-local-package-section"/);
});

test('Removing the section preserves imported game launch and upload tools',()=>{
 for(const marker of ['window.LoliteInstalledGameByTitle','window.LoliteOpenInstalledGame=openPackage',
  'packages.launchUrl(record)','button("Import HTML"','button("Import game ZIP"',
  'button("Import game folder"','button("Import GenizyMath ZIP"','button("Import gamefiles.zip"'])
  assert.ok(js.includes(marker),'Missing game functionality: '+marker);
});
