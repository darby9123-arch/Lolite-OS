const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const manifest=JSON.parse(read('assets/icons/cosmos/manifest.json'));
test('All 64 local PNG icons are valid and mapped',()=>{
 assert.equal(manifest.original_png_options,108);
 assert.equal(manifest.selected_icon_count,64);
 assert.equal(Object.keys(manifest.selected_source_files).length,64);
 for(const app of Object.keys(manifest.selected_source_files)){
  const png=path.join(root,'assets/icons/cosmos/selected',app+'.png');
  assert.ok(fs.existsSync(png),app+' missing');
  const b=fs.readFileSync(png);
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(b.readUInt32BE(16),128);
  assert.equal(b.readUInt32BE(20),128);
 }
});
test('All 108 alternatives are installed in three folders',()=>{
 for(const folder of ['primary','alternate','space-extra'])
  assert.equal(fs.readdirSync(path.join(root,'assets/icons/cosmos',folder)).filter(x=>x.endsWith('.png')).length,36);
});
test('PNG icon loader is correctly ordered in desktop and gallery',()=>{
 assert.match(read('core/app-icon-pngs.js'),/assets\/icons\/cosmos\/selected\//);
 for(const page of ['index.html','icons.html']){
  const html=read(page);
  assert.ok(html.indexOf('core/app-icon-art.js')<html.indexOf('core/app-icon-pngs.js'));
  assert.match(html,/core\/app-icon-pngs\.js\?v=cosmos-png-centered-20261110/);
 }
});

test('Generated icon artwork is centred without changing app icon hit areas',()=>{
 const loader=read('core/app-icon-pngs.js');
 assert.match(loader,/\.lolite-icon\.lolite-icon--generated\{display:inline-grid!important;place-items:center!important/);
 assert.match(loader,/object-position:center center!important/);
 assert.match(loader,/#icons \.desktop-icon > \.lolite-icon--generated/);
 assert.match(loader,/\.lm-app-icon > \.lolite-icon--generated/);
 assert.match(loader,/\.appstore-icon > \.lolite-icon--generated/);
});
