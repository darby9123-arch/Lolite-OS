const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');

test('UI bugfix stylesheet loads last with a fresh version',()=>{
 const html=read('index.html');
 const sheet='core/ui-bugfixes.css?v=20261111-1';
 assert.ok(html.includes(sheet));
 assert.ok(html.indexOf(sheet)>html.indexOf('core/game-store-ui-cleanup.css'));
 assert.match(html,/core\/window-manager\.js\?v=ui-20261111-1/);
 assert.match(html,/core\/taskbar-enhancements\.js\?v=ui-20261111-1/);
});
test('Generated and brand app icons share a centred icon box',()=>{
 const css=read('core/ui-bugfixes.css');
 assert.match(css,/#icons \.desktop-icon > :is\(\.lolite-icon,\.app-symbol\)/);
 assert.match(css,/place-items:center!important/);
 assert.match(css,/#taskbar \.lolite-icon/);
 assert.match(css,/\.window-app-icon/);
});
test('Taskbar remains scrollable and Cosmos dock reserves space for the tray',()=>{
 const css=read('core/ui-bugfixes.css');
 assert.match(css,/#taskbar #tasks\{[^}]*overflow-x:auto!important/s);
 assert.match(css,/@media\(min-width:811px\) and \(max-width:1150px\)/);
 assert.match(css,/max-width:calc\(100vw - 320px\)!important/);
 assert.match(css,/@media\(max-width:810px\)/);
});
test('Window sizing remains viewport bound without breaking native fullscreen',()=>{
 const css=read('core/ui-bugfixes.css');
 assert.match(css,/\.window:not\(:fullscreen\)/);
 assert.match(css,/min-width:min\(280px,calc\(100vw - 16px\)\)!important/);
 assert.match(css,/min-height:min\(160px,22dvh\)!important/);
});
test('Fullscreen, orientation and visual viewport changes recompute window bounds',()=>{
 const code=read('core/window-manager.js');
 assert.match(code,/document\.addEventListener\('fullscreenchange',resizeToViewport\)/);
 assert.match(code,/window\.addEventListener\('orientationchange',resizeToViewport\)/);
 assert.match(code,/window\.visualViewport\?\.addEventListener\?\.\('resize',resizeToViewport\)/);
});
test('Taskbar previews account for top-mounted themes and narrow screens',()=>{
 const js=read('core/taskbar-enhancements.js');
 assert.match(js,/const topMounted=bar&&bar\.top<innerHeight\/2&&bar\.bottom<=innerHeight\/2/);
 assert.match(js,/popup\.style\.bottom='auto'/);
 assert.match(js,/popup\.style\.top='auto'/);
});
