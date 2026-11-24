const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('./chat/node_modules/jsdom');

const read = file => fs.readFileSync(file, 'utf8');

function browser(t, body = '') {
 const dom = new JSDOM(body, { url: 'https://lolite.example/', runScripts: 'outside-only' });
 t.after(() => dom.window.close());
 return dom.window;
}

async function ready(window) {
 if (window.document.readyState !== 'loading') return;
 await new Promise(resolve => window.document.addEventListener('DOMContentLoaded', resolve, { once: true }));
}

test('Home updates use the newest dated release and retain the release detail action', async t => {
 const window = browser(t);
 window.page = () => '';
 window.fetch = async () => ({ ok: true, text: async () => [
  '## Update Log', '### Earlier release — 2026-11-24', '- Older note.',
  '### A newer release — 2026-11-25', '- The newest note.',
  '### Older release — 2026-11-18', '- Another note.'
 ].join('\n') });
 window.eval(read('core/whats-new.js'));
 window.eval(read('core/home.js'));
 window.document.body.innerHTML = window.LoliteHome.markup({ quick: '', themes: '', recent: '' });
 await window.LoliteWhatsNew.load();
 const update = window.document.querySelector('[data-lh-update]');
 assert.equal(update.querySelector('h2').textContent, 'A newer release');
 assert.equal(update.querySelector('time').dateTime, '2026-11-25');
 assert.equal(update.querySelector('p').textContent, 'The newest note.');
 assert.equal(update.querySelector('[data-lu-action="detail"]').dataset.luIndex, '0');
});

test('Home shows seven featured workspace themes below the update and saves each selection', async t => {
 const taskbar = read('index.html').match(/<footer id="taskbar">[\s\S]+?<\/footer>/)[0];
 const window = browser(t, '<div id="desktop"><div id="icons"></div><main id="windows"></main>' + taskbar + '</div>');
 const { document, localStorage } = window;
 window.page = () => '';
 window.state = { windows: {}, activeId: null, desktopIndex: 0 };
 window.LoliteWallpapers = { collection: [], current: () => null, restore() {} };
 localStorage.setItem('loliteDesktopTheme', 'cosmos');
 localStorage.setItem('loliteCustomWallpaper', 'existing-wallpaper');
 for (const script of ['desktop-themes', 'browser-themes', 'interface', 'crimson', 'home'])
  window.eval(read('core/' + script + '.js'));
 await ready(window);

 document.querySelector('#windows').innerHTML = window.page('home');
 const home = document.querySelector('.lolite-home');
 const panel = home.querySelector('[data-cr-theme-panel]');
 assert.ok(panel.previousElementSibling.matches('.lh-update'));
 assert.ok(panel.nextElementSibling.matches('.lh-discover'));
 assert.equal(panel.querySelector('[data-cr-theme-current]').textContent, 'Lolite Cosmos');
 const cards = [...panel.querySelectorAll(':scope > .cr-theme-grid button')];
 assert.equal(cards.length, 7);
 assert.deepEqual(cards.slice(0, 4).map(card => card.querySelector('strong').textContent),
  ['Windows XP', 'macOS', 'Windows 11', 'Windows 10']);
 assert.equal(new Set(cards.map(card => card.dataset.crThemeSelect)).size, 7);
 assert.doesNotMatch(panel.textContent, /surprise me/i);

 for (const card of cards) {
  card.focus();
  card.click();
  const id = card.dataset.crThemeSelect;
  assert.equal(card.querySelector('.ldt-scene').dataset.ldtPreview, id);
  assert.equal(document.documentElement.dataset.desktopTheme, id);
  assert.equal(localStorage.getItem('loliteDesktopTheme'), id);
  assert.equal(panel.querySelector('button[data-cr-theme-select][aria-pressed="true"]'), card);
  assert.equal(document.activeElement, card);
 }
 const pick = cards.at(-1).dataset.crThemeSelect;
 window.LoliteDesktopThemes.setTheme('aero7', false);
 assert.equal(panel.querySelector('[data-cr-theme-current]').textContent, 'Windows 7 Aero');
 assert.ok(panel.querySelector('details [data-cr-theme-select="aero7"][aria-pressed="true"]'));
 window.LoliteDesktopThemes.restore();
 assert.equal(document.documentElement.dataset.desktopTheme, pick);
 assert.equal(localStorage.getItem('loliteCustomWallpaper'), 'existing-wallpaper');

 panel.querySelector('[data-cr-theme-mode="browser"]').click();
 const browserPanel = home.querySelector('[data-cr-mode="browser"]');
 assert.equal(document.activeElement, browserPanel.querySelector('[data-cr-theme-mode="browser"]'));
 browserPanel.querySelector('[data-cr-theme-select="zen"]').click();
 assert.equal(document.documentElement.dataset.browserTheme, 'zen');
 assert.equal(localStorage.getItem('loliteDesktopTheme'), pick);
 browserPanel.querySelector('[data-cr-theme-mode="desktop"]').click();
 assert.equal(home.querySelector('[data-cr-theme-select][aria-pressed="true"]').dataset.crThemeSelect, pick);
});

test('Home rolls a different suggestion and forwards the visible game and wallpaper to their apps', t => {
 const window = browser(t);
 const { document } = window;
 const games = [
  { file: 'first.html', title: 'First game', category: 'Arcade', cover: 'cover.webp' },
  { file: 'second.html', title: 'Second game', category: 'Arcade', cover: 'cover2.webp' }
 ];
 let played, active = { id: 'existing' };
 window.Math.random = () => 0;
 window.LoliteGameStoreGallery = { randomGame: previous => games.find(game => game.file !== previous) };
 window.loliteStoreAction = file => { played = file; };
 const wallpapers = [
  { id: 'existing', name: 'Current wallpaper', src: 'current.webp' },
  { id: 'embedded', name: 'Embed without real preview', src: 'placeholder.svg', category: 'Embedded Wallpapers' },
  { id: 'mountain', name: 'Mountain', src: 'mountain.webp' },
  { id: 'coast', name: 'Coast', src: 'coast.webp' }
 ];
 window.LoliteWallpapers = {
  collection: wallpapers, current: () => active,
  apply(id) {
   active = wallpapers.find(wall => wall.id === id);
   window.dispatchEvent(new window.Event('lolite:wallpaperchange'));
   return Boolean(active);
  }
 };
 window.eval(read('core/home.js'));
 document.body.innerHTML = window.LoliteHome.markup({ quick: '', recent: '', themes: '' });
 const game = document.querySelector('[data-lh-pick="game"]');
 const wall = document.querySelector('[data-lh-pick="wallpaper"]');
 assert.equal(game.dataset.pickId, 'first.html');
 assert.equal(wall.dataset.pickId, 'mountain');
 document.querySelector('[data-lh-action="another-game"]').click();
 document.querySelector('[data-lh-action="another-wallpaper"]').click();
 assert.equal(game.querySelector('h3').textContent, 'Second game');
 assert.equal(wall.querySelector('h3').textContent, 'Coast');
 game.querySelector('[data-lh-action="play"]').click();
 assert.equal(played, 'second.html');
 const apply = wall.querySelector('[data-lh-action="apply"]');
 apply.click();
 assert.equal(active.id, 'coast');
 assert.equal(apply.getAttribute('aria-disabled'), 'true');
 assert.equal(apply.textContent, 'Applied');
});

test('Game discovery picks from the actual shipped catalogue and skips unavailable sources', async t => {
 const window = browser(t);
 window.page = () => '';
 window.fetch = async () => ({ ok: true, json: async () => ({ version: 1, games: [] }) });
 window.Math.random = () => 0;
 window.eval(read('core/game-store.js'));
 await new Promise(resolve => setImmediate(resolve));
 const api = window.LoliteGameStoreGallery;
 const first = api.randomGame();
 assert.equal(api.getGame(first.file).title, first.title);
 assert.ok(first.cover);
 assert.notEqual(api.randomGame(first.file).file, first.file);
 window.LoliteGameHealth = { isUnavailable: () => true };
 assert.equal(api.randomGame(), null);
});

test('Home changes the same saved desktop icon preferences as Settings', async t => {
 const window = browser(t);
 const { document, localStorage } = window;
 const key = 'lolite.desktop-icons.v1.guest';
 localStorage.setItem(key, JSON.stringify({ size: 72, position: 'right', visible: false }));
 window.eval(read('core/desktop-icon-customization.js'));
 await ready(window);
 window.eval(read('core/home.js'));
 document.body.innerHTML = window.LoliteHome.markup({ quick: '', recent: '', themes: '' });
 document.querySelector('[data-lh-icon="shape"][value="circle"]').click();
 document.querySelector('[data-lh-icon="finish"][value="minimal"]').click();
 const slider = document.querySelector('[data-lh-opacity]');
 slider.value = '65';
 slider.dispatchEvent(new window.Event('input', { bubbles: true }));
 const saved = JSON.parse(localStorage.getItem(key));
 assert.equal(saved.shape, 'circle');
 assert.equal(saved.finish, 'minimal');
 assert.equal(saved.opacity, 65);
 assert.equal(saved.size, 72);
 assert.equal(saved.position, 'right');
 assert.equal(saved.visible, false);
 assert.equal(document.documentElement.style.getPropertyValue('--lic-radius'), '50%');
 assert.equal(document.querySelector('.lh-icon-preview').style.getPropertyValue('--lh-icon-opacity'), '0.65');
 window.LoliteIconCustomization.reset();
 assert.equal(slider.value, '100');
 assert.equal(document.querySelector('[data-lh-icon="shape"][value="rounded"]').getAttribute('aria-pressed'), 'true');
});

test('Desktop Home waits for sign-in, opens once and honours an existing startup preference', async t => {
 for (const enabled of [true, false]) {
  const window = browser(t, '<div id="desktop"><div id="icons"></div><main id="windows"></main><div id="taskbar"></div></div><div id="lolite-splash"></div>');
  const { document } = window;
  let signedIn = false, opens = 0;
  window.LoliteHome = {};
  window.LoliteAccounts = { isReady: () => signedIn };
  window.openApp = id => {
   assert.equal(id, 'home');
   opens++;
   document.getElementById('windows').innerHTML = '<section class="window"></section>';
  };
  if (!enabled) window.localStorage.setItem('startHome', 'false');
  window.eval(read('core/device-mode.js'));
  await ready(window);
  window.dispatchEvent(new window.Event('lolite:splashdone'));
  assert.equal(opens, 0);
  signedIn = true;
  window.dispatchEvent(new window.Event('lolite:account-ready'));
  assert.equal(opens, enabled ? 1 : 0);
  document.getElementById('windows').replaceChildren();
  window.LoliteDeviceMode.startDesktop();
  assert.equal(opens, enabled ? 1 : 0);
 }
});
