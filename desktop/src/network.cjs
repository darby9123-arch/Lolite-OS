'use strict';
const https = require('node:https');
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
function createClient(createRequest, timeoutMs=30000) {
  async function send(url,{headers={},signal}={}) {
    if(!allowedDownloadURL(url))throw Error('Blocked update URL outside the official release service.');
    if(signal?.aborted)throw signal.reason;
    return new Promise((resolve,reject)=>{
      const req=createRequest({url,method:'GET',redirect:'manual',cache:'no-store',credentials:'omit',headers:{'User-Agent':'Lolite-Launcher','Accept':'application/vnd.github+json','Cache-Control':'no-cache',...headers}});
      let timer,response,failed=false,redirects=0,current=url;
      const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);};
      const fail=error=>{if(failed)return;failed=true;cleanup();response?.destroy(error);try{req.abort();}catch{}reject(error);};
      const cancel=()=>fail(signal.reason);
      const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>fail(Error('The update server stopped responding. Please retry.')),timeoutMs);timer.unref?.();};
      req.on('error',fail);req.on('close',cleanup);
      // Electron must follow a manual redirect synchronously inside this event.
      // net.fetch with redirect:manual cancels GitHub's asset redirect instead.
      req.on('redirect',(_status,method,destination)=>{
        try{const next=new URL(destination,current).href;
          if(method!=='GET'||!allowedDownloadURL(next))throw Error('Blocked update URL outside the official release service.');
          if(++redirects>5)throw Error('Too many update redirects.');
          current=next;arm();req.followRedirect();
        }catch(e){fail(e);}
      });
      req.on('response',res=>{
        response=res;res.once('end',cleanup);res.once('close',cleanup);res.on('error',fail);
        res.once('aborted',()=>fail(Error('The update download was interrupted. Please retry.')));
        // Observe arrivals without putting the stream into flowing mode before its consumer is ready.
        res.on('readable',arm);resolve(res);
      });
      signal?.addEventListener('abort',cancel,{once:true});
      if(signal?.aborted){cancel();return;}
      arm();req.end();
    });
  }
  return {request:send,json:(url,maxBytes)=>readJSON(send,url,maxBytes)};
}
module.exports={request,json,createClient};
