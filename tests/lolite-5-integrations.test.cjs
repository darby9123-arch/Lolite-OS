const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('index.html'),shell=read('core/lolite-5.js'),music=read('core/music.js'),spot=read('core/spotlight.js');
function storage(){const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}}
test('all eight selected Lolite OS 5.0 areas are integrated after their existing apps',()=>{
 const assets=['core/lolite-5.js?v=','core/lolite-5-panels.css?v=','core/lolite-5-music.css?v='];
 for(const item of assets)assert.ok(html.includes(item),item+' should be loaded');
 assert.ok(html.indexOf('core/lolite-5.js?v=')>html.indexOf('core/music.js?v='));
 assert.ok(html.indexOf('core/lolite-5.js?v=')>html.indexOf('core/game-store.js?v='));
 assert.ok(html.indexOf('core/lolite-5.js?v=')>html.indexOf('core/spotlight.js?v='));
 assert.equal((html.match(/<script\b/g)||[]).length,(html.match(/<\/script>/g)||[]).length,'No broken script tags');
 for(const token of ['LoliteWindows5','LoliteThemeStudio','LoliteNotifications5','LoliteAchievements5','LoliteGameFeedback5','LoliteMusicMini5','data-l5-app-sort'])assert.ok(shell.includes(token));
 assert.match(spot,/calculate\(q\)/);
});
test('Window Management 3.0 reuses original snapping and adds Alt+Tab and tile shortcuts',()=>{
 const wm=read('core/window-manager.js');
 assert.match(wm,/const snapWin=\(/);
 assert.match(wm,/savedLayouts:\(\)=>/);
 assert.match(shell,/e\.altKey&&e\.key==='Tab'/);
 assert.match(shell,/function tileWindows/);
 assert.match(shell,/lolite5:windowtiled/);
 assert.match(read('core/lolite-5-panels.css'),/\.l5-switcher/);
});
test('Music 3.0 contains optional real equaliser, local listening history and user-written lyrics',()=>{
 for(const item of ['function configureEQ5(', 'ctx.createMediaElementSource(audio)', 'function extras5(', 'data-lm5-speed', 'data-lm5-band', 'data-lm5-visualizer','data-lm5-save-lyrics','MUSIC5_HISTORY+S.user.id','data-lm5-mini-toggle'])assert.ok(music.includes(item),item);
 assert.match(read('core/lolite-5-music.css'),/\.lm5-studio-grid/);
 assert.match(shell,/data-l5-mini-control/);
});
test('Game Store 4.0 rating and reporting are local; achievements follow loaded game frames',()=>{
 assert.match(shell,/FEEDBACK_KEY='lolite5\.game-feedback\.v1'/);
 assert.match(shell,/data-l5-feedback/);
 assert.match(shell,/data-l5-game-copy/);
 assert.match(read('core/game-player.js'),/lolite5:gameplayed/);
 assert.match(shell,/lolite5:gameplayed/);
 assert.doesNotMatch(shell,/fetch\(['"]https:\/\/.*issues/i);
});
test('Spotlight 2.0 calculates safely and returns settings quick actions',()=>{
 const env={window:{addEventListener(){}},document:{readyState:'loading',addEventListener(){}},localStorage:storage(),navigator:{},CustomEvent:class{},console};
 vm.runInNewContext(spot,env,{timeout:3000});
 const calc=env.window.LoliteSpotlight.calculate;
 assert.equal(calc('3 + 4 * 2'),11);
 assert.equal(calc('(3 + 4) * 2'),14);
 assert.equal(calc('= 7 / 2'),3.5);
 assert.equal(calc('2^3'),8);
 assert.equal(calc('5 / 0'),null);
 assert.equal(calc('alert(1)'),null);
 assert.equal(calc('1+'),null);
 assert.ok(env.window.LoliteSpotlight.search('9*9').some(x=>x.kind==='calculator'&&x.label==='81'));
 assert.ok(env.window.LoliteSpotlight.search('Theme Studio').some(x=>x.id==='setting:theme-studio'));
});
test('Lolite 5 shell initialises without replacing existing apps and validates theme settings',()=>{
 const root={style:{setProperty(){}},dataset:{},classList:{contains(){return false}}};
 const env={window:{addEventListener(){},dispatchEvent(){},page:id=>'PAGE:'+id},document:{documentElement:root,readyState:'loading',addEventListener(){},querySelector(){return null},querySelectorAll(){return []}},localStorage:storage(),navigator:{},MutationObserver:class {observe(){}},CustomEvent:class {constructor(type,init){this.type=type;this.detail=init?.detail}},console,requestAnimationFrame(){}};
 vm.runInNewContext(shell,env,{timeout:4000});
 assert.equal(env.window.LoliteOS5.version,'5.0.0');
 assert.equal(env.window.page('notes'),'PAGE:notes');
 assert.match(env.window.page('settings'),/Theme Studio/);
 assert.equal(env.window.LoliteThemeStudio.get().radius,12);
 env.window.LoliteThemeStudio.set('radius',19);
 assert.equal(env.window.LoliteThemeStudio.get().radius,19);
 assert.match(env.localStorage.getItem('lolite5.theme.v1'),/"radius":19/);
 assert.equal(env.window.LoliteNotifications5.getAll().length,0);
 assert.ok(env.window.LoliteAchievements5.list().length>=8);
});
