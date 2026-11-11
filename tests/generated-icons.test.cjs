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
  assert.match(html,/core\/app-icon-pngs\.js\?v=[a-z0-9._-]+/i);
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

test('Brand icon pack loads after PNG icons on desktop and in gallery',()=>{
 for(const page of ['index.html','icons.html']){
  const html=read(page);
  const png=html.indexOf('core/app-icon-pngs.js');
  const brand=html.indexOf('core/app-icon-brand-pack.js');
  assert.ok(png>=0 && brand>png,page+' incorrect icon loader order');
  assert.ok(brand<html.indexOf(page==='index.html'?'src="app.js':'src="core/icon-preview.js'),page+' icon pack loads too late');
 }
});
test('Blue and purple icon pack has two complete ten-app batches',()=>{
 const vm=require('node:vm');
 const code=read('core/app-icon-brand-pack.js');
 const nodes=new Map();
 const head={appendChild(el){nodes.set(el.id,el)}};
 const document={
  head,
  getElementById(id){return nodes.get(id)||null},
  createElement(name){assert.equal(name,'style');return {id:'',textContent:''}}
 };
 const previous={
  names:['home','games','files','browser'],
  resolve(id){return id},
  tile(id){return '<fallback data-id="'+id+'"></fallback>'}
 };
 const window={LoliteIcons:previous};
 vm.runInNewContext(code,{window,document});
 const api=window.LoliteIcons;
 const first=['music','steam','youtube','discord','roblox','github','spotify','docs','sheets','slides'];
 const second=['browser','files','settings','appstore','camera','photos','mail','calendar','weather','chatroom'];
 for(const id of [...first,...second]){
  const html=api.tile(id);
  assert.match(html,/lolite-icon--brand-real/,'not branded: '+id);
  assert.match(html,/<svg /,'missing SVG: '+id);
 }
 assert.equal(api.resolve('app-music'),'music');
 assert.equal(api.resolve('app-steam'),'steam');
 assert.equal(api.resolve('app-chat'),'chatroom');
 assert.match(api.tile('unknown-app'),/fallback/);
 const style=nodes.get('lolite-brand-real-icons-style').textContent;
 assert.match(style,/place-items:center!important/);
 assert.match(style,/#taskbar/);
});
test('Complete brand pack covers every bundled app icon while preserving fallbacks',()=>{
 const vm=require('node:vm');
 const styles=new Map(),document={
  head:{appendChild(node){styles.set(node.id,node)}},
  getElementById(id){return styles.get(id)||null},
  createElement(name){assert.equal(name,'style');return {id:'',textContent:''}}
 };
 const fallback={
  names:Object.keys(manifest.selected_source_files),
  resolve(id){return id},
  tile(id){return '<old-icon data-id="'+id+'"></old-icon>'}
 };
 const window={LoliteIcons:fallback};
 vm.runInNewContext(read('core/app-icon-brand-pack.js'),{window,document});
 vm.runInNewContext(read('core/app-icon-brand-rest.js'),{window,document});
 const api=window.LoliteIcons;
 const all=Object.keys(manifest.selected_source_files);
 for(const key of all){
  assert.match(api.tile(key),/lolite-icon--brand-real/,'Missing blue-purple icon for '+key);
  assert.match(api.tile(key),/<svg\b/,'No native vector for '+key);
 }
 for(const extra of ['steam','autoclick','arcade','feature-request','sandstone-browser']){
  assert.match(api.tile(extra),/lolite-icon--brand-real/,'Missing icon for '+extra);
 }
 for(const alias of ['app-home','app-scramjet','app-quests','lolite-quests','app-autoclicker']){
  assert.match(api.tile(alias),/lolite-icon--brand-real/,'Missing alias for '+alias);
 }
 assert.match(api.tile('completely-unknown-app'),/old-icon/);
 assert.ok(styles.get('lolite-brand-real-icons-style')?.textContent.includes('place-items:center!important'));
});
test('Extended brand pack loads after its base and before consumers',()=>{
 for(const page of ['index.html','icons.html']){
  const html=read(page),first=html.indexOf('core/app-icon-brand-pack.js'),rest=html.indexOf('core/app-icon-brand-rest.js');
  const consumer=html.indexOf(page==='index.html'?'src="app.js':'src="core/icon-preview.js');
  assert.ok(first!==-1 && rest>first && consumer>rest,page+' icon order broken');
 }
});