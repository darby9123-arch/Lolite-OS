const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('./chat/node_modules/jsdom');

const index = fs.readFileSync('index.html', 'utf8');
const shell = fs.readFileSync('core/interface.js', 'utf8');
const themes = fs.readFileSync('core/desktop-themes.js', 'utf8');
const credits = fs.readFileSync('core/game-credits.js', 'utf8');
const taskbarMarkup = index.match(/<footer id="taskbar">[\s\S]+?<\/footer>/)[0];

async function desktop(t, setup = () => {}) {
  const dom = new JSDOM('<div id="desktop"><div id="icons"></div>' + taskbarMarkup + '</div>', {
    url: 'https://lolite.example/',
    runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  const { window } = dom;
  window.state = { windows: {}, activeId: null, desktopIndex: 0 };
  setup(window);
  window.eval(shell);
  await new Promise(resolve => {
    window.document.addEventListener('DOMContentLoaded', () => window.setTimeout(resolve, 0), { once: true });
  });
  return window;
}

test('Desktop dock stylesheet loads after the shell and theme styles', () => {
  const entry = index.indexOf('core/taskbar-alignment-fix.css?v=');
  for (const earlier of ['core/cosmos.css?v=', 'core/taskbar-customization.css?v=', 'core/lolite-5-panels.css?v=', 'core/icon-material-polish.css?v=']) {
    const before = index.indexOf(earlier);
    assert.ok(before >= 0 && entry > before, 'Dock stylesheet must follow ' + earlier);
  }
});

test('Pinned apps have one visible button with stable focus and desktop-specific running state', async t => {
  const window = await desktop(t);
  const { document, state, LoliteDesktopShell } = window;
  const pin = document.querySelector('[data-task-app="files"]');
  const tasks = document.getElementById('tasks');
  tasks.innerHTML = '<button class="taskwin" data-app-id="files">Files</button>' +
    '<button class="taskwin" data-app-id="paint">Paint</button>';
  const files = tasks.querySelector('[data-app-id="files"]');
  const paint = tasks.querySelector('[data-app-id="paint"]');
  state.windows = { files: { desktopIndex: 0 }, paint: { desktopIndex: 0 } };
  state.activeId = 'files';
  pin.focus();
  window.dispatchEvent(new window.CustomEvent('lolite:windowchange', { detail: { type: 'focus', id: 'files' } }));
  assert.equal(pin, document.activeElement);
  assert.equal(pin.getAttribute('aria-pressed'), 'true');
  assert.equal(pin.classList.contains('running'), true);
  assert.equal(files.hidden, true);
  assert.equal(paint.hidden, false);

  state.desktopIndex = 1;
  state.activeId = null;
  window.dispatchEvent(new window.CustomEvent('lolite:desktopchange'));
  assert.equal(pin.getAttribute('aria-pressed'), 'false');
  assert.equal(pin.classList.contains('running'), false);
  assert.equal(paint.hidden, true);

  state.desktopIndex = 0;
  window.dispatchEvent(new window.CustomEvent('lolite:desktopchange'));
  assert.equal(paint.hidden, false);
  assert.equal(LoliteDesktopShell.unpin('files'), true);
  assert.equal(files.hidden, false);
  assert.equal(LoliteDesktopShell.pin('files'), true);
  assert.equal(files.hidden, true);
});

test('More moves the existing controls with their actions and returns keyboard focus', async t => {
  let calls = 0;
  let fullscreen;
  const window = await desktop(t, window => {
    fullscreen = window.document.getElementById('fullscreenBtn');
    fullscreen.addEventListener('click', () => calls++);
    window.eval(credits);
  });
  const { document } = window;
  const list = document.getElementById('winTrayTools');
  const menu = list.closest('details');
  const summary = menu.querySelector('summary');
  assert.equal(list.querySelector('#fullscreenBtn'), fullscreen);
  assert.equal(summary.getAttribute('aria-controls'), list.id);
  assert.equal(menu.open, false);
  summary.click();
  assert.equal(menu.open, true);
  fullscreen.focus();
  fullscreen.click();
  assert.equal(calls, 1);
  assert.equal(menu.open, false);
  assert.equal(document.activeElement, summary);

  summary.click();
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(menu.open, false);
  assert.equal(document.activeElement, summary);

  summary.click();
  document.getElementById('loliteCreditsButton').click();
  const panel = document.getElementById('loliteCreditsPanel');
  assert.equal(panel.hidden, false);
  assert.equal(menu.open, false);
  panel.querySelector('.credits-close').click();
  assert.equal(panel.hidden, true);
  assert.equal(document.activeElement, summary);
});

test('Workspace themes change the app launcher and keep the macOS menu bar controls functional', async t => {
  const opened = [];
  const window = await desktop(t, window => {
    window.document.getElementById('desktop').insertAdjacentHTML('afterbegin', '<div id="start" class="panel hidden"></div>');
    window.openApp = id => opened.push(id);
    window.eval(themes);
  });
  const { document, LoliteDesktopThemes } = window;
  const root = document.documentElement;
  const menu = document.getElementById('loliteMenuBar');
  const clock = document.getElementById('clock');
  const start = document.getElementById('start');
  const startButton = document.getElementById('startBtn');

  LoliteDesktopThemes.setTheme('windowsxp');
  startButton.click();
  assert.equal(start.dataset.launcher, 'classic');
  assert.equal(start.firstElementChild.className, 'win-start-profile');
  assert.ok(start.querySelector('.win-launcher-places [data-shell-open="files"]'));
  const toggle = () => start.querySelector('[data-shell-action="all-apps"]');
  toggle().click();
  assert.equal(toggle().textContent, 'Back');
  assert.equal(document.activeElement, toggle());

  LoliteDesktopThemes.setTheme('windows10');
  assert.ok(start.classList.contains('hidden'));
  startButton.click();
  assert.equal(start.dataset.launcher, 'tiles');
  assert.ok(start.querySelector('.win-launcher-tiles [data-shell-open="games"]'));

  LoliteDesktopThemes.setTheme('windows11');
  startButton.click();
  assert.equal(start.dataset.launcher, 'standard');
  assert.ok(start.querySelector('.win-start-recent'));

  clock.focus();
  LoliteDesktopThemes.setTheme('macos');
  assert.equal(menu.hidden, false);
  assert.equal(menu.querySelector('#clock'), clock);
  assert.equal(document.activeElement, clock);
  clock.click();
  assert.equal(clock.getAttribute('aria-expanded'), 'true');
  menu.querySelector('#loliteMenuApps').click();
  assert.equal(start.dataset.launcher, 'grid');
  assert.equal(clock.getAttribute('aria-expanded'), 'false');
  const search = document.getElementById('winStartSearch');
  assert.equal(document.activeElement, search);
  search.value = 'Quick Notes';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  search.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
  assert.deepEqual(opened, ['notes']);

  root.classList.add('ltc-applied');
  window.dispatchEvent(new window.Event('lolite:taskbarlayoutchange'));
  assert.equal(menu.hidden, true);
  assert.equal(document.querySelector('#taskbar #clock'), clock);
  root.classList.remove('ltc-applied');
  window.dispatchEvent(new window.Event('lolite:taskbarlayoutchange'));
  assert.equal(menu.querySelector('#clock'), clock);
  root.classList.add('browsing-mode');
  window.dispatchEvent(new window.Event('lolite:modechange'));
  assert.equal(menu.hidden, true);
  assert.equal(document.querySelector('#taskbar #clock'), clock);
});
