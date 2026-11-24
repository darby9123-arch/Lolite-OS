/* Web navigation shared by Lolite's three browser apps. */
(() => {
 'use strict';

 const sandbox = 'allow-scripts allow-forms allow-downloads';
 const hostAddress = /^(?:localhost|\[[\da-f:.]+\]|(?:[\p{L}\p{N}-]+\.)+[\p{L}\p{N}-]+)(?::\d+)?(?:[/?#]|$)/iu;
 const controllers = new WeakMap();
 let signedOut = false;
 const isAllowed = () => !signedOut && window.LoliteAccounts?.isReady?.() === true &&
  !document.documentElement.classList.contains('lolite-account-locked');

 function address(value) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  let target;
  if (text.startsWith('//')) target = new URL('https:' + text);
  else if (hostAddress.test(text)) {
   const protocol = /^localhost(?=[:/?#]|$)/i.test(text) ? 'http://' : 'https://';
   target = new URL(protocol + text);
  } else if (/^[a-z][a-z\d+.-]*:/i.test(text)) target = new URL(text);
  else target = new URL('https://duckduckgo.com/?q=' + encodeURIComponent(text));
  if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password)
   throw Error('Enter an HTTP or HTTPS address without a username or password.');
  return target;
 }

 function needsTab(target) {
  const host = target.hostname.toLowerCase();
  return ['duckduckgo.com', 'google.com', 'bing.com'].some(site => host === site || host.endsWith('.' + site)) ||
   (target.protocol === 'http:' && location.protocol !== 'http:');
 }

 function controls() {
  return '<div class="lolite-browser-actions">' +
   '<button type="button" data-web-back disabled>Back</button><button type="button" data-web-forward disabled>Forward</button>' +
   '<button type="button" data-web-reload disabled>Reload</button><button type="button" data-web-home>Home</button>' +
   '<a data-web-tab target="_blank" rel="noopener noreferrer" aria-disabled="true">Open in tab</a></div>';
 }

 const stage = () => '<p class="lolite-browser-status" data-web-status role="status"></p><div class="lolite-browser-stage" data-web-stage></div>';

 function markup(name, extras = '') {
  return '<div class="lolite-web-browser" data-web-name="' + name + '">' +
   '<form class="lolite-browser-address" data-web-form><input type="text" data-web-input aria-label="Website address" ' +
   'placeholder="Enter a website or search the web" inputmode="url" autocomplete="off" spellcheck="false">' +
   '<button type="submit">Go</button></form>' + controls() + extras + stage() + '</div>';
 }

 function mount(root, input = root?.querySelector('[data-web-input]')) {
  if (!root || !input) return null;
  if (controllers.has(root)) return controllers.get(root);

  const doc = root.ownerDocument;
  const stage = root.querySelector('[data-web-stage]');
  const status = root.querySelector('[data-web-status]');
  const back = root.querySelector('[data-web-back]');
  const forward = root.querySelector('[data-web-forward]');
  const reload = root.querySelector('[data-web-reload]');
  const tab = root.querySelector('[data-web-tab]');
  const partition = window.loliteDesktop?.browserPartition;
  let guest = null;
  let guestReady = false;
  let desktopURL = null;
  const trail = [null];
  let position = 0;
  const current = () => trail[position] ?? null;

  function setStatus(message, error = false) {
   status.textContent = message;
   status.dataset.error = String(error);
  }

  function syncControls() {
   const ready = isAllowed();
   back.disabled = !ready || (partition ? !guestReady || !guest.canGoBack() : position <= 0);
   forward.disabled = !ready || (partition ? !guestReady || !guest.canGoForward() : position >= trail.length - 1);
   reload.disabled = !ready || !(partition ? desktopURL : current());
   let target = null;
   try { if (ready) target = address(input.value) || (partition ? desktopURL : current()); } catch {}
   if (target) tab.href = target.href;
   else tab.removeAttribute('href');
   tab.setAttribute('aria-disabled', String(!target));
  }

  function notice(title, description) {
   const panel = doc.createElement('section');
   panel.className = 'lolite-browser-notice';
   const heading = doc.createElement('h2');
   heading.textContent = title;
   const copy = doc.createElement('p');
   copy.textContent = description;
   panel.append(heading, copy);
   stage.replaceChildren(panel);
  }

  function showHome() {
   guest?.remove();
   guest = null;
   guestReady = false;
   desktopURL = null;
   input.value = '';
   notice(root.dataset.webName, 'Enter an address or search above.');
   setStatus(isAllowed() ? 'Ready to browse' : 'Sign in to Lolite to browse.');
   syncControls();
   root.dispatchEvent(new Event('lolite:browseraddress'));
  }

  function showDesktop(target) {
   desktopURL = target;
   input.value = target.href;
   setStatus('Loading ' + target.host + '…');
   if (!guestReady) {
    const view = doc.createElement('webview');
    guest = view;
    view.setAttribute('partition', partition);
    view.setAttribute('src', target.href);
    view.setAttribute('aria-label', root.dataset.webName + ' page');
    view.addEventListener('dom-ready', () => {
     if (guest !== view) return;
     guestReady = true;
     syncControls();
    });
    function navigated(event) {
     if (guest !== view || event.isMainFrame === false || !isAllowed()) return;
     try { desktopURL = address(event.url); } catch { return; }
     if (!desktopURL) return;
     input.value = desktopURL.href;
     setStatus(desktopURL.host);
     syncControls();
     root.dispatchEvent(new Event('lolite:browseraddress'));
    }
    view.addEventListener('did-navigate', navigated);
    view.addEventListener('did-navigate-in-page', navigated);
    view.addEventListener('did-fail-load', event => {
     if (guest === view && event.isMainFrame && event.errorCode !== -3)
      setStatus('Couldn’t load the page. Select Reload to try again.', true);
    });
    view.addEventListener('render-process-gone', () => {
     if (guest !== view) return;
     guestReady = false;
     notice('Page closed unexpectedly', 'Select Reload to open the page again.');
     syncControls();
    });
    stage.replaceChildren(view);
   } else {
    const view = guest;
    void view.loadURL(target.href).catch(error => {
     if (guest === view && desktopURL === target && !String(error).includes('ERR_ABORTED'))
      setStatus('Couldn’t load the page. Select Reload to try again.', true);
    });
   }
   syncControls();
   root.dispatchEvent(new Event('lolite:browseraddress'));
   return true;
  }

  function show(target) {
   if (!isAllowed()) return false;
   input.value = target.href;
   if (needsTab(target)) {
    notice('This site needs Lolite Desktop', 'The web version can only display sites that allow embedding. You can also select Open in tab to visit this address.');
    setStatus(target.host);
   } else {
    const frame = doc.createElement('iframe');
    frame.title = root.dataset.webName + ' page';
    frame.dataset.loliteBrowserFrame = 'direct';
    frame.setAttribute('sandbox', sandbox);
    frame.referrerPolicy = 'no-referrer';
    frame.src = target.href;
    stage.replaceChildren(frame);
    setStatus('Direct browsing · ' + target.host + ' · Use Open in tab if the page does not display.');
   }
   syncControls();
   root.dispatchEvent(new Event('lolite:browseraddress'));
   return true;
  }

  function remember(target) {
   if (current()?.href === target?.href) return;
   trail.splice(position + 1);
   trail.push(target);
   position = trail.length - 1;
  }

  function go(value) {
   if (!isAllowed()) return false;
   try {
    const target = address(value);
    if (!target) { setStatus('Enter a website or search term.'); return false; }
    if (partition) return showDesktop(target);
    remember(target);
    return show(target);
   } catch (error) {
    setStatus(error instanceof TypeError ? 'Enter a valid website address.' : error.message, true);
    return false;
   }
  }

  function reset() {
   trail.splice(0, trail.length, null);
   position = 0;
   showHome();
  }

  function move(step) {
   const next = position + step;
   if (!isAllowed() || next < 0 || next >= trail.length) return;
   position = next;
   if (current()) show(current());
   else showHome();
  }

  root.querySelector('[data-web-form]')?.addEventListener('submit', event => {
   event.preventDefault();
   go(input.value);
  });
  input.addEventListener('input', syncControls);
  back.addEventListener('click', () => {
   if (!partition) move(-1);
   else if (guestReady && isAllowed()) guest.goBack();
  });
  forward.addEventListener('click', () => {
   if (!partition) move(1);
   else if (guestReady && isAllowed()) guest.goForward();
  });
  reload.addEventListener('click', () => {
   if (!isAllowed()) return;
   if (partition && desktopURL) showDesktop(desktopURL);
   if (!partition && current()) show(current());
  });
  root.querySelector('[data-web-home]').addEventListener('click', () => {
   remember(null);
   showHome();
   input.focus();
  });
  tab.addEventListener('click', event => {
   if (!isAllowed() || !tab.href) event.preventDefault();
  });

  const controller = { go, reset, showHome, address: () => address(input.value) || (partition ? desktopURL : current()) };
  controllers.set(root, controller);
  showHome();
  return controller;
 }

 function register(ids, name, { extras = '', setup, query } = {}) {
  const previousPage = window.page;
  window.page = id => ids.includes(id) ? markup(name, extras) : previousPage(id);
  const previousOpen = window.openApp;
  window.openApp = function(id, title, width, height) {
   if (!ids.includes(id)) return previousOpen(id, title, width, height);
   const opened = previousOpen(id, title || name, width ?? 900, height ?? 650);
   const root = opened?.querySelector?.('.lolite-web-browser');
   if (root && !controllers.has(root)) {
    const controller = mount(root);
    setup?.(root, controller);
    const initial = query && new URLSearchParams(location.search).get(query);
    if (initial) controller.go(initial);
   }
   return opened;
  };
 }

 function clearOnLock() {
  signedOut = true;
  document.querySelectorAll('.lolite-web-browser').forEach(root => controllers.get(root)?.reset());
 }
 window.addEventListener('lolite:account-restricted', clearOnLock);
 window.addEventListener('lolite:browser-signout', clearOnLock);
 window.addEventListener('lolite:account-ready', () => {
  if (!signedOut) return;
  signedOut = false;
  document.querySelectorAll('.lolite-web-browser').forEach(root => controllers.get(root)?.showHome());
 });
 window.LoliteBrowserNavigation = Object.freeze({ register, mount, controls, stage, isAllowed });
})();
