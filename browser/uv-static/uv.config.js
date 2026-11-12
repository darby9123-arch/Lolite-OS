/* Relative paths support both root hosting and GitHub Pages project paths. */
(() => {
 const script = typeof document !== 'undefined' ? document.currentScript?.src : self.location.href;
 const root = new URL('./', script || self.location.href);
 self.__uv$config = {
  prefix: new URL('service/', root).pathname,
  bare: 'https://bare.benrogo.net/',
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: new URL('uv.handler.js', root).pathname,
  bundle: new URL('uv.bundle.js', root).pathname,
  config: new URL('uv.config.js', root).pathname,
  sw: new URL('uv.sw.js', root).pathname
 };
})();
