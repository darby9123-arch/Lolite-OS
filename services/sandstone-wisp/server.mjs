import http from 'node:http';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import { isAllowedUpgrade, isAllowedOrigin, limitWispServer, ALLOWED_DESTINATION_HOSTS } from './security.mjs';
import { verifyLoliteUser, TicketStore } from './tickets.mjs';

limitWispServer(wisp);
const port = Number(process.env.PORT || 3000);
const maxActive = 32;
let active = 0;
const rates = new Map();
const tickets = new TicketStore();

function reject(socket, code, reason) {
  if (socket.destroyed) return;
  socket.end('HTTP/1.1 ' + code + ' ' + reason +
    '\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
}

function rateAllowed(address) {
  const now = Date.now();
  const value = rates.get(address) || { start: now, count: 0 };
  if (now - value.start > 60_000) { value.start = now; value.count = 0; }
  value.count++;
  rates.set(address, value);
  if (rates.size > 500) {
    for (const [key, item] of rates) if (now - item.start > 60_000) rates.delete(key);
  }
  return value.count <= 24;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const path=String(req.url||'').split('?')[0];
  // Browser clients receive CORS permission only for a known Lolite frontend.
  const origin=String(req.headers.origin||'');
  if(path==='/api/ticket'){
    if(!isAllowedOrigin(origin)){
      res.writeHead(403).end();return;
    }
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Authorization');
    res.setHeader('Access-Control-Max-Age','300');
    if(req.method==='OPTIONS'){res.writeHead(204).end();return}
    if(req.method!=='POST'){res.writeHead(405).end();return}
    if(!rateAllowed(req.socket.remoteAddress||'unknown')){
      res.writeHead(429).end();return;
    }
    const user=await verifyLoliteUser(req.headers.authorization);
    if(!user){res.writeHead(401,{ 'Content-Type':'application/json' });
      res.end(JSON.stringify({error:'Valid Lolite account required'}));return}
    const grant=tickets.issue(user.id,origin);
    if(!grant){res.writeHead(429).end();return}
    res.writeHead(200,{ 'Content-Type':'application/json' });
    res.end(JSON.stringify(grant));return;
  }
  if (req.method === 'GET' && req.url?.split('?')[0] === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true, service: 'lolite-sandstone-wisp',
      version: 1, mode: 'restricted', destinationHosts: ALLOWED_DESTINATION_HOSTS,
      openConnections: active
    }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found. Only /healthz and WebSocket upgrades at /wisp/ are supported.');
});

server.on('upgrade', (req, socket, head) => {
  if (!isAllowedUpgrade(req)) { reject(socket, 403, 'Forbidden'); return; }
  if (active >= maxActive || !rateAllowed(req.socket.remoteAddress || 'unknown')) {
    reject(socket, 429, 'Too Many Requests');
    return;
  }
  let grant='';
  try{
    const address=new URL(req.url,'http://localhost');
    if(address.searchParams.size!==1)throw new Error('Invalid query');
    grant=address.searchParams.get('ticket')||'';
  }catch{reject(socket,401,'Unauthorized');return}
  // Origin checks alone are NOT account authentication. Each websocket upgrade
  // needs its own verified, single-use account ticket with a 30-second lifetime.
  if(!tickets.consume(grant,req.headers.origin)){
    reject(socket,401,'Unauthorized');return;
  }
  active++;
  let released = false;
  function release() {
    if (released) return;
    released = true;
    active = Math.max(0, active - 1);
  }
  socket.once('close', release);
  try { wisp.routeRequest(req, socket, head); }
  catch (error) {
    release();
    socket.destroy();
    console.error('Wisp upgrade failed:', error?.message || error);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log('Restricted Lolite Wisp relay listening on port ' + port);
});
