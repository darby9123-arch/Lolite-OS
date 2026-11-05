const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');

test('Cosmos is an actual loaded desktop, not a static mockup', () => {
  const html=read('index.html'),js=read('core/cosmos.js');
  assert.match(html,/core\/cosmos\.css\?v=/);
  assert.match(html,/core\/cosmos\.js\?v=/);
  assert.match(js,/LoliteDesktopShell/);
  assert.match(js,/data-cosmos-open/);
  assert.match(js,/function renderRecent/);
});

test('Cosmos is registered in both themes and wallpapers', () => {
  assert.match(read('core/desktop-themes.js'),/id:'cosmos'/);
  assert.match(read('core/wallpapers.js'),/entry\('cosmos-orbit'/);
  assert.match(read('index.html'),/loliteCosmosUpgrade/);
});

test('Cosmos uses an original local background and favicon', () => {
  const svg=read('assets/wallpapers/cosmos-orbit.svg');
  assert.match(svg,/<svg[^>]+viewBox="0 0 1920 1080"/);
  assert.match(svg,/<radialGradient/);
  assert.doesNotMatch(svg,/<image[^>]+https?:\/\//);
  assert.match(read('index.html'),/assets\/lolite-cosmos-logo\.svg/);
});

test('Status widgets do not display fabricated telemetry', () => {
  const js=read('core/cosmos.js');
  assert.match(js,/navigator\.storage\?\.estimate/);
  assert.match(js,/navigator\.onLine/);
  assert.match(js,/navigator\.getBattery/);
  assert.match(js,/requestAnimationFrame\(fps\)/);
});

test('Cosmos local terminal does not execute operating-system commands', () => {
  const js=read('core/cosmos.js');
  assert.match(js,/function terminalMarkup/);
  assert.match(js,/cosmos-terminal-form/);
  assert.doesNotMatch(js,/\bchild_process\b|\bexecSync\b|\beval\(/);
});

test('Cosmos does not destroy original app shortcuts', () => {
  const js=read('core/cosmos.js');
  assert.match(js,/function removeExtraShortcuts/);
  assert.match(js,/document\.createDocumentFragment\(/);
  assert.doesNotMatch(js,/holder\.replaceChildren\(/);
  assert.match(js,/window\.openApp\?\.\('terminal','Terminal'/);
});

test('Cosmos is isolated from the red Crimson design and refreshes cached files', () => {
  const crimson=read('core/crimson.js');
  const css=read('core/cosmos.css');
  const html=read('index.html');
  assert.match(crimson,/root\.dataset\.loliteDesign=cosmos\?'cosmos':'crimson'/);
  assert.match(crimson,/lolite:desktopthemechange/);
  assert.match(css,/html\[data-lolite-design="cosmos"\]/);
  assert.match(css,/filter:brightness\(\.82\) saturate\(\.72\)/);
  assert.match(html,/core\/cosmos\.css\?v=wordmark-1/);
  assert.match(html,/core\/cosmos\.js\?v=wordmark-1/);
});

test('Cosmos control styles outrank legacy desktop selectors', () => {
  const css=read('core/cosmos.css');
  assert.match(css,/html\[data-lolite-design="cosmos"\]\[data-desktop-experience="windows"\] \.window\.is-active/);
  assert.match(css,/html\[data-lolite-design="cosmos"\]\[data-desktop-theme="cosmos"\] #taskbar #startBtn/);
});

test('User wordmark renders as a real transparent desktop image', () => {
  const js=read('core/cosmos.js');
  const css=read('core/cosmos.css');
  const bytes=fs.readFileSync(path.join(root,'assets/lolite-desktop-wordmark.webp'));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.match(js,/class="cosmos-wordmark"/);
  assert.match(js,/assets\/lolite-desktop-wordmark\.webp\?v=wordmark-1/);
  assert.doesNotMatch(js,/<h1>LOLITE OS<\/h1>/);
  assert.match(css,/\.cosmos-headline \.cosmos-wordmark/);
});
