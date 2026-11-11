const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
const css=read('core/taskbar-alignment-fix.css');
const index=read('index.html');
const settings=read('core/taskbar-customization.js');
test('Taskbar hotfix loads last, after Cosmos, Taskbar Studio and Lolite 5 styles',()=>{
 const entry='core/taskbar-alignment-fix.css?v=';
 assert.ok(index.includes(entry),'Taskbar hotfix must ship in HTML');
 for(const earlier of ['core/cosmos.css?v=','core/taskbar-customization.css?v=','core/lolite-5-panels.css?v=','core/icon-material-polish.css?v=']){
  assert.ok(index.indexOf(entry)>index.indexOf(earlier),'Hotfix must override '+earlier);
 }
});
test('Cosmos taskbar is one centred interactive dock, not two vertically offset bars',()=>{
 assert.match(css,/#desktop #taskbar\{\s*position:fixed!important;/);
 assert.match(css,/height:64px!important/);
 assert.match(css,/align-items:center!important/);
 assert.match(css,/pointer-events:auto!important/);
 assert.match(css,/#desktop #taskbar \.win-taskbar-center\{\s*position:relative!important;/);
 assert.match(css,/bottom:auto!important/);
 assert.match(css,/min-height:0!important/);
 assert.match(css,/background:transparent!important/);
});
test('Former top-right tray now sits inside dock and icons share one baseline',()=>{
 assert.match(css,/#desktop #taskbar \.tray\{\s*position:relative!important;/);
 assert.match(css,/top:auto!important;/);
 assert.match(css,/align-items:center!important;/);
 assert.match(css,/#desktop #taskbar \.win-taskbar-center :is\(\.task,\.taskwin,\.win-pinned\)\{/);
 assert.match(css,/align-self:center!important;/);
 assert.match(css,/width:44px!important;/);
 assert.match(css,/height:44px!important;/);
 assert.match(css,/margin:auto!important;/);
 assert.match(css,/:hover\{\s*transform:none!important;\s*translate:0!important;/);
});
test('User saved taskbar height and app icon size override the dock defaults',()=>{
 assert.match(css,/html\.ltc-applied\[data-lolite-design="cosmos"\]/);
 assert.match(css,/height:var\(--ltc-height,56px\)!important/);
 assert.match(css,/width:var\(--ltc-button-size,44px\)!important/);
 assert.match(css,/width:var\(--ltc-icon-size,27px\)!important/);
 assert.match(css,/data-ltc-align="left"/);
 assert.match(settings,/const KEY='lolite\.taskbar\.v1\.'/);
});
test('Styles, top placement, tray dropdowns and responsive controls stay usable',()=>{
 for(const variant of ['pill','aero','minimal','classic']){
  assert.ok(css.includes('[data-ltc-style="'+variant+'"]'),'Missing style '+variant);
 }
 assert.ok(css.includes('[data-ltc-position="top"]'));
 assert.ok(css.includes('[data-ltc-position="bottom"]'));
 assert.match(css,/is\(#winCalendar,#winQuickSettings\)/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/@media\(max-width:520px\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
