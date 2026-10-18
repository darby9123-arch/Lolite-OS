'use strict';
const https = require('node:https');
const {allowedDownloadURL} = require('./security.cjs');
function request(url, {headers={}, signal, redirects=0} = {}) {
  if (!allowedDownloadURL(url)) return Promise.reject(Error('Blocked update URL outside the official release service.'));
  if (redirects > 5) return Promise.reject(Error('Too many update redirects.'));
  return new Promise((resolve,reject) => {
    const req = https.get(url, {headers:{'User-Agent':'Lolite-Launcher','Accept':'application/vnd.github+json',...headers}, signal}, res => {
      if ([301,302,303,307,308].includes(res.statusCode)) {
        res.resume();
        const next = new URL(res.headers.location, url).href;
        request(next, {headers,signal,redirects:redirects+1}).then(resolve,reject);
      } else resolve(res);
    });
    req.setTimeout(30000, () => req.destroy(Error('The update server stopped responding. Please retry.')));
    req.on('error',reject);
  });
}
async function json(url, maxBytes=1024*1024) {
  const res = await request(url);
  if (res.statusCode !== 200) {res.resume(); throw Error(res.statusCode === 403 || res.statusCode === 429 ? 'GitHub update checks are temporarily rate limited. Try again later.' : `Release server returned HTTP ${res.statusCode}.`);}
  const parts=[]; let total=0;
  for await (const part of res) { total+=part.length; if(total>maxBytes){res.destroy();throw Error('Release metadata is too large.');}parts.push(part); }
  return JSON.parse(Buffer.concat(parts).toString('utf8'));
}
module.exports={request,json};
