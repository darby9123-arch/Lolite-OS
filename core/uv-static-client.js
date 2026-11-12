/* UV-Static setup for Lolite's existing browser. No relay credentials are sent. */
(() => {
 'use strict';
 const root = new URL('https://lolite-uv-static.vercel.app/');
 const defaultRelay = 'https://bare.benrogo.net/';
 function normalizeRelay(value) {
  const url = new URL(String(value || defaultRelay).trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash)
   throw Error('Enter an HTTPS Bare relay URL without credentials, a query, or a fragment.');
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url.href;
 }
 function getRelay() {
  try { return normalizeRelay(localStorage.getItem('loliteUVRelay') || defaultRelay); }
  catch { return defaultRelay; }
 }
 function setRelay(value) {
  const relay = normalizeRelay(value);
  localStorage.setItem('loliteUVRelay', relay);
  return relay;
 }
 async function checkRelay(relay) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
   const response = await fetch(relay, {credentials:'omit', cache:'no-store', signal:controller.signal});
   if (!response.ok) throw Error('HTTP ' + response.status);
   const manifest = await response.json();
   if (!Array.isArray(manifest.versions) || !manifest.versions.some(v => /^v?[12]$/.test(String(v))))
    throw Error('This address is not a compatible Bare relay.');
  } catch (error) {
   throw Error('The Bare relay is unavailable or incompatible. Choose a working relay in Connection settings. ' +
    (error.name === 'AbortError' ? 'Connection timed out.' : error.message));
  } finally { clearTimeout(timer); }
 }
 async function address(target) {
  if (!window.isSecureContext)
   throw Error('UV-Static needs HTTPS and a browser with service workers enabled.');
  const url = new URL(target);
  if (!['http:', 'https:'].includes(url.protocol)) throw Error('Only HTTP and HTTPS websites are supported.');
  const relay = getRelay();
  await checkRelay(relay);
  if (root.origin === location.origin) throw Error('UV-Static must use a separate origin from Lolite accounts.');
  const address = new URL(root);
  address.hash = new URLSearchParams({url:url.href, relay}).toString();
  return address.href;
 }
 window.LoliteUVStatic = Object.freeze({address, getRelay, setRelay, origin:root.origin});
})();
