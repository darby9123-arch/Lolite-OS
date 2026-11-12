/* Bundled into both Vice City launch pages by scripts/build-vice-city.py. */
(() => {
 'use strict';
 const panel = document.getElementById('vc-loading');
 const title = document.getElementById('loading-text');
 const detail = document.getElementById('vc-detail');
 const progress = document.getElementById('vc-progress');
 const retry = document.getElementById('vc-retry');
 const nativeFetch = window.fetch.bind(window);
 const controllers = new Set();
 const groups = [['index.data',7],['audio/emotion.adf',3],['audio/espant.adf',3],
  ['audio/fever.adf',3],['audio/flash.adf',3],['audio/kchat.adf',3],
  ['audio/vcpr.adf',2],['audio/vrock.adf',4],['audio/wave.adf',4],['audio/wild.adf',4]];
 const total = groups.reduce((n, [,count]) => n + count, 0);
 const resources = new Map();
 let downloaded = 0, cached = 0, completed = 0, failed = false;
 function update(stage = 'Downloading resources') {
  if (failed) return;
  title.textContent = stage;
  detail.textContent = `${completed} / ${total} resource files · ${(downloaded/1048576).toFixed(1)} MB downloaded` +
   (cached ? ` · ${(cached/1048576).toFixed(1)} MB cached` : '');
  progress.max = total; progress.value = completed;
 }
 function fail(error) {
  if (failed) return;
  failed = true;
  for (const controller of controllers) controller.abort();
  panel.hidden = false;
  title.textContent = 'Unable to start Vice City';
  detail.textContent = error?.message || String(error || 'Please try again.');
  progress.hidden = true; retry.hidden = false;
  document.querySelector('.intro-container').hidden = true;
 }
 window.LoliteViceCity = {
  fail, stage:update,
  ready() { if (!failed) { panel.hidden = true; document.querySelector('.intro-container').hidden = true; } }
 };
 retry.addEventListener('click', () => location.reload());
 window.addEventListener('unhandledrejection', event => fail(event.reason));
 // Storage is optional: opaque game frames intentionally cannot use Lolite's storage.
 const database = new Promise(resolve => {
  let settled = false;
  const finish = value => { if (settled) { value?.close(); return; } settled = true; clearTimeout(timer); resolve(value); };
  const timer = setTimeout(() => finish(null), 1500);
  try {
   const request = indexedDB.open('lolite-vice-city-796678be', 1);
   request.onupgradeneeded = () => request.result.createObjectStore('files');
   request.onsuccess = () => finish(request.result);
   request.onerror = request.onblocked = () => finish(null);
  } catch { finish(null); }
 });
 async function cacheRead(name) {
  const db = await database;
  if (!db) return null;
  return new Promise(resolve => {
   const timer = setTimeout(() => resolve(null), 1500);
   const finish = value => { clearTimeout(timer); resolve(value); };
   try {
    const request = db.transaction('files').objectStore('files').get(name);
    request.onsuccess = () => finish(request.result);
    request.onerror = () => finish(null);
   } catch { finish(null); }
  });
 }
 async function cacheWrite(name, buffer) {
  const db = await database;
  if (!db) return;
  try {
   const transaction = db.transaction('files', 'readwrite');
   transaction.onerror = () => {}; transaction.onabort = () => {};
   transaction.objectStore('files').put(buffer, name);
  } catch { /* Quota/storage failure must not stop a completed download. */ }
 }
 async function download(name, stage = 'Downloading resources') {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
   if (failed) throw Error('Loading cancelled.');
   const controller = new AbortController(); controllers.add(controller);
   let timer;
   const reset = () => { clearTimeout(timer); timer = setTimeout(() => controller.abort(), 30000); };
   try {
    reset();
    const response = await nativeFetch(new URL(name, document.baseURI), {signal:controller.signal, credentials:'omit'});
    if (!response.ok) throw Error(`${name}: download failed (HTTP ${response.status}).`);
    if (/text\/html/i.test(response.headers?.get('content-type') || '')) throw Error(`${name}: the host returned a web page instead of game data.`);
    const chunks = []; let size = 0;
    if (response.body?.getReader) {
     const reader = response.body.getReader();
     while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      reset(); chunks.push(value); size += value.byteLength; downloaded += value.byteLength; update(stage);
     }
    } else {
     const value = new Uint8Array(await response.arrayBuffer());
     chunks.push(value); size = value.byteLength; downloaded += size; update(stage);
    }
    if (!size) throw Error(`${name}: the downloaded file is empty.`);
    const buffer = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
    return buffer.buffer;
   } catch (error) {
    lastError = error.name === 'AbortError' ? Error(`${name}: download stalled for 30 seconds. Check your connection and retry.`) : error;
    if (attempt < 3) update(`Retrying ${name} (${attempt + 1}/3)`);
   } finally { clearTimeout(timer); controllers.delete(controller); }
  }
  throw lastError;
 }
 async function part(name) {
  let buffer = await cacheRead(name);
  if (buffer?.byteLength) { cached += buffer.byteLength; }
  else { buffer = await download(name); void cacheWrite(name, buffer); }
  completed++; update();
  return buffer;
 }
 function script(src) {
  return new Promise((resolve, reject) => {
   const el = document.createElement('script');
   const timer = setTimeout(() => reject(Error('An engine script timed out. Please retry.')), 20000);
   el.async = false; el.crossOrigin = 'anonymous'; el.src = src;
   el.onload = () => { clearTimeout(timer); resolve(); };
   el.onerror = () => { clearTimeout(timer); reject(Error('Could not load the Vice City engine. Please retry.')); };
   document.body.appendChild(el);
  });
 }
 const bundledScript = id => URL.createObjectURL(new Blob([document.getElementById(id).textContent], {type:'text/javascript'}));
 function mapped(input) {
  const raw = input instanceof Request ? input.url : String(input);
  const name = new URL(raw, document.baseURI).pathname.split('/').pop().toLowerCase();
  return resources.get(name) || raw;
 }
 async function boot() {
  const probe = document.createElement('canvas');
  const graphics = probe.getContext('webgl2') || probe.getContext('webgl');
  if (!graphics) throw Error('WebGL is unavailable. Enable hardware acceleration in your browser, restart it, and retry Vice City.');
  graphics.getExtension('WEBGL_lose_context')?.loseContext();
  // A missing script should fail before the large resource transfer.
  await script(bundledScript('vc-gamepad'));
  await script(new URL('idbfs.js', document.baseURI).href);
  let next = 0;
  await Promise.all(Array.from({length:3}, async () => {
   while (next < groups.length && !failed) {
    const [name, count] = groups[next++], buffers = [];
    for (let i = 1; i <= count; i++) buffers.push(await part(`${name}.part${i}`));
    resources.set(name.split('/').pop(), URL.createObjectURL(new Blob(buffers)));
   }
  }));
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
   return originalOpen.call(this, method, mapped(String(url).replace('https://cdn.dos.zone/vcsky/fetched/', '')), ...rest);
  };
  window.fetch = async (input, init) => {
   const raw = input instanceof Request ? input.url : String(input);
   if (new URL(raw, document.baseURI).pathname.endsWith('/index.wasm')) {
    const buffer = await download('index.wasm', 'Downloading game engine');
    update('Compiling game engine');
    return new Response(buffer, {headers:{'Content-Type':'application/wasm'}});
   }
   return nativeFetch(mapped(input), init);
  };
  update('Resources ready');
  await script(bundledScript('vc-runtime'));
 }
 void boot().catch(fail);
})();
