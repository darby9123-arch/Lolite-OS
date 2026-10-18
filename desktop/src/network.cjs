'use strict';
const https = require('node:https');
const {Readable} = require('node:stream');
const {allowedDownloadURL} = require('./security.cjs');
function request(url, {headers={}, signal, redirects=0} = {}) {
  if (!allowedDownloadURL(url)) return Promise.reject(Error('Blocked update URL outside the official release service.'));
  if (redirects > 5) return Promise.reject(Error('Too many update redirects.'));
  return new Promise((resolve,reject) => {
    const req = https.get(url, {headers:{'User-Agent':'Lolite-Launcher','Accept':'application/vnd.github+json','Cache-Control':'no-cache',...headers}, signal}, res => {
      if ([301,302,303,307,308].includes(res.statusCode)) {
        res.resume();
        try{const next = new URL(res.headers.location, url).href;request(next, {headers,signal,redirects:redirects+1}).then(resolve,reject);}catch(e){reject(e);}
      } else resolve(res);
    });
    req.setTimeout(30000, () => req.destroy(Error('The update server stopped responding. Please retry.')));
    req.on('error',reject);
  });
}
async function readJSON(send, url, maxBytes=1024*1024) {
  const res = await send(url);
  if (res.statusCode !== 200) {res.resume(); throw Error(res.statusCode === 403 || res.statusCode === 429 ? 'GitHub update checks are temporarily rate limited. Try again later.' : `Release server returned HTTP ${res.statusCode}.`);}
  const parts=[]; let total=0;
  for await (const part of res) { total+=part.length; if(total>maxBytes){res.destroy();throw Error('Release metadata is too large.');}parts.push(part); }
  return JSON.parse(Buffer.concat(parts).toString('utf8'));
}
const json=(url,maxBytes)=>readJSON(request,url,maxBytes);
// The installed app uses Chromium's system-proxy support. Node remains available for CI.
function createClient(fetcher, timeoutMs=30000) {
  async function send(url,{headers={},signal,redirects=0}={}) {
    if(!allowedDownloadURL(url))throw Error('Blocked update URL outside the official release service.');
    if(redirects>5)throw Error('Too many update redirects.');
    const controller=new AbortController();let timer;
    const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>controller.abort(Error('The update server stopped responding. Please retry.')),timeoutMs);timer.unref?.();};
    const cancel=()=>controller.abort(signal.reason);signal?.addEventListener('abort',cancel,{once:true});if(signal?.aborted)cancel();
    const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);};
    arm();
    try{
      const response=await fetcher(url,{method:'GET',redirect:'manual',cache:'no-store',credentials:'omit',signal:controller.signal,headers:{'User-Agent':'Lolite-Launcher','Accept':'application/vnd.github+json','Cache-Control':'no-cache',...headers}});
      if([301,302,303,307,308].includes(response.status)){
        await response.body?.cancel();cleanup();
        const location=response.headers.get('location');if(!location)throw Error('Update redirect is missing its destination.');
        return send(new URL(location,url).href,{headers,signal,redirects:redirects+1});
      }
      const stream=Readable.from((async function*(){try{if(response.body)for await(const chunk of response.body){arm();yield Buffer.from(chunk);}}finally{cleanup();}})());
      stream.statusCode=response.status;stream.headers=Object.fromEntries(response.headers.entries());
      stream.once('close',()=>{cleanup();controller.abort();});
      return stream;
    }catch(error){cleanup();throw error;}
  }
  return {request:send,json:(url,maxBytes)=>readJSON(send,url,maxBytes)};
}
module.exports={request,json,createClient};
