const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

function icons(){
 const written=[];
 const context={
  window:{},
  document:{head:{appendChild:node=>written.push(node)},createElement:()=>({id:'',textContent:''})}
 };
 vm.runInNewContext(read('core/app-icons.js'),context);
 vm.runInNewContext(read('core/app-icon-art.js'),context);
 return {api:context.window.LoliteIcons,written};
}

test('Cosmos artwork provides at least 30 original local SVG icons',()=>{
 const {api,written}=icons();
 assert.ok(api.names.length>=30);
 assert.ok(written.some(node=>node.id==='lolite-icon-art-style'));
 for(const key of api.names){
  const svg=api.tile(key);
  assert.match(svg,/<svg[^>]*viewBox="0 0 32 32"/);
  assert.match(svg,/lolite-icon--art/);
  assert.doesNotMatch(svg,/<(?:image|foreignObject|script)\b/i);
  assert.doesNotMatch(svg,/<iframe\b/i);
 }
});

test('Main Cosmos apps have distinct icons, not the generic default',()=>{
 const {api}=icons();
 const ids=['files','browser','appstore','games','chatroom','lowlight-ai',
  'terminal','settings','wallpaper-editor','paint','notes','calculator',
  'clock','capture','academy','cloud-gaming','minecraft18','quests','life-rp'];
 for(const id of ids){
  assert.notEqual(api.resolve(id),'default');
  assert.notEqual(api.tile(id),api.tile('default'));
 }
 assert.notEqual(api.tile('files'),api.tile('browser'));
 assert.notEqual(api.tile('appstore'),api.tile('games'));
});

test('Every production app shortcut maps to an icon',()=>{
 const {api}=icons();
 const cosmos=read('core/cosmos.js'),shell=read('core/interface.js'),store=read('core/app-store.js');
 const ids=new Set();
 for(const match of cosmos.matchAll(/\['([^']+)','[^']+'\]/g))ids.add(match[1]);
 for(const match of shell.matchAll(/\['([^']+)','[^']+','[^']+'\]/g))ids.add(match[1]);
 for(const match of store.matchAll(/icon:'([^']+)'/g))ids.add(match[1]);
 for(const id of ids)assert.notEqual(api.resolve(id),'default',`App ${id} has no icon`);
});

test('Icons and refreshed logo load before the desktop',()=>{
 const html=read('index.html');
 const start=html.indexOf('core/app-icons.js');
 const art=html.indexOf('core/app-icon-art.js');
 const app=html.indexOf('src="app.js');
 assert.ok(start>=0&&art>start&&app>art);
 assert.match(html,/assets\/lolite-cosmos-logo\.svg\?v=cosmos-icons-20261109/);
 const logo=read('assets/lolite-cosmos-logo.svg');
 assert.match(logo,/<svg[^>]+viewBox="0 0 96 96"/);
 assert.match(logo,/Lolite OS orbital L logo/);
 assert.doesNotMatch(logo,/<image\b|https?:\/\//i);
});

test('Icon gallery renders the same production artwork',()=>{
 const preview=read('icons.html');
 const script=read('core/icon-preview.js');
 assert.match(preview,/core\/app-icon-art\.js\?v=/);
 assert.match(preview,/assets\/lolite-cosmos-logo\.svg/);
 assert.match(script,/api\.tile\(key\)/);
 assert.doesNotMatch(script,/<iframe|fetch\(/i);
});
