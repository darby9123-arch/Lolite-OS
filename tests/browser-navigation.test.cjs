const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('./chat/node_modules/jsdom');

function setup(t, { signedIn = true, native = false } = {}) {
 const dom = new JSDOM('<div id="icons"></div><main id="windows"></main>', {
  url: 'https://lolite.example/Lolite-OS/',
  runScripts: 'outside-only'
 });
 t.after(() => dom.window.close());
 const { window } = dom;
 const { document } = window;
 const tabs = [];
 window.open = (...args) => tabs.push(args);
 window.LoliteAccounts = { isReady: () => signedIn };
 window.LoliteIcons = { tile: () => '' };
 if (native) window.loliteDesktop = {};
 window.page = id => '<div>' + id + '</div>';
 window.openApp = id => {
  const existing = document.querySelector('[data-window-id="' + id + '"]');
  if (existing) return existing;
  const app = document.createElement('section');
  app.dataset.windowId = id;
  app.innerHTML = '<div class="content">' + window.page(id) + '</div>';
  document.getElementById('windows').append(app);
  return app;
 };
 for (const name of ['browser-navigation', 'ultraviolet', 'scramjet-browser', 'sandstone-original-compat'])
  window.eval(fs.readFileSync('core/' + name + '.js', 'utf8'));
 return { window, tabs };
}

const submit = (window, node, value) => {
 node.querySelector('[data-web-input]').value = value;
 node.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
};

test('Ultraviolet, Scramjet and installed Sandstone open independent direct browsing windows', t => {
 const { window } = setup(t, { native: true });
 const ultraviolet = window.openApp('browser');
 const scramjet = window.openApp('scramjet');
 const sandstone = window.openApp('sandstone');
 for (const [app, url, expected] of [
  [ultraviolet, 'example.org', 'https://example.org/'],
  [scramjet, 'https://example.com/docs', 'https://example.com/docs'],
  [sandstone, 'example.net', 'https://example.net/']
 ]) {
  submit(window, app, url);
  const frame = app.querySelector('iframe');
  assert.equal(frame.src, expected);
  assert.ok(frame.hasAttribute('sandbox'));
  assert.doesNotMatch(frame.getAttribute('sandbox'), /allow-same-origin|allow-top-navigation/);
  assert.equal(frame.referrerPolicy, 'no-referrer');
  assert.equal(app.querySelector('[data-web-tab]').href, frame.src);
 }
 submit(window, ultraviolet, 'second.example.org');
 ultraviolet.querySelector('[data-web-back]').click();
 assert.equal(ultraviolet.querySelector('iframe').src, 'https://example.org/');
 ultraviolet.querySelector('[data-web-forward]').click();
 assert.equal(ultraviolet.querySelector('iframe').src, 'https://second.example.org/');
 assert.equal(scramjet.querySelector('iframe').src, 'https://example.com/docs');
});

test('Searches open in a regular tab and invalid schemes never reach a frame or tab', t => {
 const { window, tabs } = setup(t);
 const app = window.openApp('scramjet');
 submit(window, app, 'Lolite wallpapers');
 assert.equal(tabs.length, 1);
 assert.equal(new URL(tabs[0][0]).searchParams.get('q'), 'Lolite wallpapers');
 assert.equal(tabs[0][2], 'noopener,noreferrer');
 assert.equal(app.querySelector('iframe'), null);
 for (const value of ['javascript:alert(1)', 'file:///tmp/test', 'https://username:password@example.com']) {
  submit(window, app, value);
  assert.equal(app.querySelector('[data-web-status]').dataset.error, 'true');
  assert.equal(app.querySelector('iframe'), null);
 }
 assert.equal(tabs.length, 1);
 submit(window, app, 'example.com:8443/path');
 assert.equal(app.querySelector('iframe').src, 'https://example.com:8443/path');
});

test('Signed-out and restricted workspaces cannot navigate or keep a page open', t => {
 const { window, tabs } = setup(t);
 const app = window.openApp('browser');
 submit(window, app, 'example.com');
 assert.ok(app.querySelector('iframe'));
 window.dispatchEvent(new window.Event('lolite:account-restricted'));
 assert.equal(app.querySelector('iframe'), null);
 assert.equal(app.querySelector('[data-web-tab]').hasAttribute('href'), false);
 assert.equal(app.querySelector('[data-web-input]').value, '');
 submit(window, app, 'search for a site');
 assert.equal(tabs.length, 0);
 const loggedOut = setup(t, { signedIn: false });
 const other = loggedOut.window.openApp('browser');
 submit(loggedOut.window, other, 'example.com');
 assert.equal(other.querySelector('iframe'), null);
});

test('An unavailable or stale UV-Static check leaves direct browsing usable', async t => {
 const { window } = setup(t);
 let responded;
 window.LoliteUVStatic = {
  getRelay: () => 'https://relay.example/',
  origin: 'https://proxy.example/',
  address: () => new Promise(resolve => { responded = resolve; })
 };
 const app = window.openApp('browser');
 submit(window, app, 'example.com');
 const check = app.querySelector('[data-uv-check]');
 check.click();
 assert.equal(check.disabled, true);
 submit(window, app, 'example.org');
 responded('https://proxy.example/?previous');
 await new Promise(resolve => setImmediate(resolve));
 assert.equal(app.querySelector('[data-uv-link]').hidden, true);
 window.LoliteUVStatic.address = async () => { throw Error('Relay unavailable'); };
 check.click();
 await new Promise(resolve => setImmediate(resolve));
 assert.equal(app.querySelector('[data-uv-status]').textContent, 'Relay unavailable');
 assert.equal(app.querySelector('iframe').src, 'https://example.org/');
 window.LoliteUVStatic.address = async () => 'https://lolite.example/';
 check.click();
 await new Promise(resolve => setImmediate(resolve));
 assert.equal(app.querySelector('[data-uv-link]').hasAttribute('href'), false);
});

test('Sandstone keeps its own controls and can switch from direct navigation to the original view', t => {
 const { window } = setup(t);
 const { document } = window;
 const shell = document.createElement('div');
 shell.className = 'content';
 const outer = document.createElement('iframe');
 outer.dataset.sandstoneOriginal = 'true';
 shell.append(outer);
 document.getElementById('windows').append(shell);
 const doc = outer.contentDocument;
 doc.body.innerHTML = '<div id="address_bar"><input id="url_box" value="sandstone://home">' +
  '<button id="navigate_button">Submit</button><button id="options_button">Options</button></div>' +
  '<div id="frame_container"><iframe></iframe></div><div id="options_div"></div>';
 outer.contentWindow.main_frame = { iframe: doc.querySelector('iframe') };
 window.LoliteSandstoneCompat.scan();
 outer.dispatchEvent(new window.Event('load'));
 const direct = doc.querySelector('.lolite-sandstone-direct');
 assert.ok(direct);
 const address = doc.getElementById('loliteSandstoneAddress');
 address.value = 'example.com';
 address.dispatchEvent(new outer.contentWindow.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
 assert.equal(direct.querySelector('iframe').src, 'https://example.com/');
 assert.equal(doc.getElementById('frame_container').hidden, true);
 const toggle = doc.querySelector('#loliteSandstoneStatus button[aria-pressed]');
 toggle.click();
 assert.equal(direct.hidden, true);
 assert.equal(doc.getElementById('frame_container').hidden, false);
 assert.equal(doc.getElementById('url_box').value, 'sandstone://home');
});
