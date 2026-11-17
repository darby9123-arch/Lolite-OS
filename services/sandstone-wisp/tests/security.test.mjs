import test from 'node:test';
import assert from 'node:assert/strict';
import { ALLOWED_ORIGINS, ALLOWED_DESTINATION_HOSTS,
  isAllowedOrigin, isAllowedUpgrade, isAllowedHost, limitWispServer } from '../security.mjs';

test('only known Lolite-controlled frontends can initiate browser upgrades', () => {
  assert.equal(isAllowedOrigin(ALLOWED_ORIGINS[0]), true);
  assert.equal(isAllowedOrigin('https://unknown.example'), false);
  assert.equal(isAllowedOrigin('null'), false);
  assert.equal(isAllowedOrigin('https://darby9123-arch.github.io.evil.test'), false);
  assert.equal(isAllowedOrigin('https://darby9123-arch.github.io/extra'), false);
});
test('only the documented WebSocket route upgrades', () => {
  const base = { url:'/wisp/', method:'GET', headers:{
    origin:'https://darby9123-arch.github.io',upgrade:'websocket'
  }};
  assert.equal(isAllowedUpgrade(base), true);
  assert.equal(isAllowedUpgrade({...base,url:'/other'}), false);
  assert.equal(isAllowedUpgrade({...base,method:'POST'}), false);
  assert.equal(isAllowedUpgrade({...base,headers:{...base.headers,upgrade:'h2c'}}), false);
  assert.equal(isAllowedUpgrade({...base,headers:{...base.headers,origin:'https://unknown.example'}}), false);
});
test('only Lolite-owned HTTPS destination hosts are permitted', () => {
  assert.deepEqual(ALLOWED_DESTINATION_HOSTS,['darby9123-arch.github.io']);
  assert.equal(isAllowedHost('darby9123-arch.github.io'), true);
  assert.equal(isAllowedHost('DARBY9123-ARCH.GITHUB.IO'), true);
  for (const input of ['127.0.0.1','localhost','10.0.0.1',
    'darby9123-arch.github.io.other-domain.com','example.com','wikipedia.org'])
    assert.equal(isAllowedHost(input), false, input);
});
test('wisp server is limited to HTTPS, TCP, safe DNS and small stream counts', () => {
  const server = { options: {} };
  limitWispServer(server);
  assert.deepEqual(server.options.port_whitelist,[443]);
  assert.equal(server.options.allow_private_ips,false);
  assert.equal(server.options.allow_loopback_ips,false);
  assert.equal(server.options.allow_direct_ip,false);
  assert.equal(server.options.allow_udp_streams,false);
  assert.ok(server.options.stream_limit_total <= 8);
  assert.ok(server.options.hostname_whitelist.every(re=>re instanceof RegExp));
  assert.equal(server.options.hostname_whitelist[0].test('other.example'),false);
});
