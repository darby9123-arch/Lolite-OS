/* Regular navigation is available on every host. UV-Static keeps its own origin. */
(() => {
 'use strict';
 const browser = window.LoliteBrowserNavigation;
 const extras = '<details class="lolite-browser-connection"><summary>UV-Static connection</summary>' +
  '<label>Bare relay URL <input type="url" data-uv-relay placeholder="https://your-relay.example/"></label>' +
  '<button type="button" data-uv-save>Save relay</button> <button type="button" data-uv-check>Check connection</button> ' +
  '<a data-uv-link hidden target="_blank" rel="noopener noreferrer">Open UV-Static in tab</a>' +
  '<p class="lolite-browser-status" data-uv-status role="status">UV-Static uses the relay configured here.</p></details>';

 function setup(root, controller) {
  const input = root.querySelector('[data-web-input]');
  const relay = root.querySelector('[data-uv-relay]');
  const check = root.querySelector('[data-uv-check]');
  const link = root.querySelector('[data-uv-link]');
  const status = root.querySelector('[data-uv-status]');
  const runtime = window.LoliteUVStatic;
  let request = 0;

  function invalidate() {
   request++;
   check.disabled = false;
   link.hidden = true;
   link.removeAttribute('href');
  }

  function message(value, error = false) {
   status.textContent = value;
   status.dataset.error = String(error);
  }

  if (runtime) relay.value = runtime.getRelay();
  input.addEventListener('input', invalidate);
  relay.addEventListener('input', invalidate);
  root.addEventListener('lolite:browseraddress', invalidate);
  root.querySelector('[data-uv-save]').addEventListener('click', () => {
   if (!browser.isAllowed()) return;
   try {
    if (!runtime) throw Error('UV-Static is unavailable.');
    relay.value = runtime.setRelay(relay.value);
    invalidate();
    message('Relay saved.');
   } catch (error) { message(error.message, true); }
  });

  check.addEventListener('click', async () => {
   if (!browser.isAllowed()) return;
   invalidate();
   const attempt = request;
   try {
    if (!runtime) throw Error('UV-Static is unavailable.');
    const target = controller.address();
    if (!target) throw Error('Enter a website address first.');
    if (relay.value !== runtime.getRelay()) throw Error('Save the relay address before checking it.');
    check.disabled = true;
    message('Checking the relay…');
    const url = new URL(await runtime.address(target.href));
    if (request !== attempt || !root.isConnected || !browser.isAllowed()) return;
    if (url.origin === location.origin || url.origin !== runtime.origin)
     throw Error('UV-Static needs its separate host.');
    link.href = url.href;
    link.hidden = false;
    message('Relay responded. Open UV-Static to continue.');
   } catch (error) {
    if (request === attempt) message(error.message, true);
   } finally {
    if (request === attempt) check.disabled = false;
   }
  });
  link.addEventListener('click', event => {
   if (!browser.isAllowed() || !link.href) event.preventDefault();
  });
 }

 browser.register(['browser', 'ultraviolet'], 'Ultraviolet Browser', { extras, setup });
 window.LoliteUltraviolet = { open: () => window.openApp('browser', 'Ultraviolet Browser', 900, 650) };
})();
