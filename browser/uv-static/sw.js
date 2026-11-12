importScripts('uv.sw.js');
const relay = new URL(self.location.href).searchParams.get('relay');
if (relay) {
 const url = new URL(relay);
 if (url.protocol !== 'https:' || url.username || url.password) throw Error('Invalid relay');
 self.__uv$config.bare = url.href;
}
const ultraviolet = new UVServiceWorker(self.__uv$config);
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
 const url = new URL(event.request.url);
 if (url.origin === self.location.origin && url.pathname.startsWith(self.__uv$config.prefix)) {
  event.respondWith(ultraviolet.fetch(event));
 }
});
