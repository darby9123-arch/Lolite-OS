/* This directory is deployed as its own static origin, with no Lolite accounts. */
(() => {
 'use strict';
 const status = document.getElementById('status');
 async function launch() {
  if (!['/', '/index.html'].includes(location.pathname))
   throw Error('Open this browser through Lolite. The proxy runtime needs its dedicated website.');
  if (window.parent !== window) {
   let sharesOrigin = false;
   try { sharesOrigin = !!window.parent.document; } catch { /* Cross-origin parent is expected. */ }
   if (sharesOrigin) throw Error('The proxy must be separated from the Lolite desktop origin.');
  }
  const params = new URLSearchParams(location.hash.slice(1));
  if (!params.get('url')) { status.textContent = 'Open Ultraviolet Browser in Lolite to browse here.'; return; }
  const target = new URL(params.get('url'));
  const relay = new URL(params.get('relay'));
  if (!['http:', 'https:'].includes(target.protocol) || relay.protocol !== 'https:' || relay.username || relay.password || relay.search || relay.hash)
   throw Error('Invalid website or Bare relay address.');
  if (!navigator.serviceWorker) throw Error('Service workers are unavailable. Allow browser storage for this site, then retry.');
  const worker = new URL('sw.js', location.href);
  worker.searchParams.set('relay', relay.href);
  const registration = await navigator.serviceWorker.register(worker.href, {scope:'/', updateViaCache:'none'});
  const active = registration.installing || registration.waiting || registration.active;
  if (!active) throw Error('The browser worker could not start.');
  if (active.state !== 'activated') await new Promise((resolve, reject) => {
   const finish = error => {clearTimeout(timer);active.removeEventListener('statechange', change);error ? reject(error) : resolve();};
   const change = () => {
    if (active.state === 'activated') finish();
    else if (active.state === 'redundant') finish(Error('The browser worker could not activate.'));
   };
   const timer = setTimeout(() => finish(Error('The browser worker timed out. Please retry.')), 15000);
   active.addEventListener('statechange', change);change();
  });
  status.textContent = 'Opening website…';
  location.replace(window.__uv$config.prefix + window.__uv$config.encodeUrl(target.href));
 }
 launch().catch(error => { status.textContent = error.message; });
})();
