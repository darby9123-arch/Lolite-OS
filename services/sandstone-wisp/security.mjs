// A narrow Wisp compatibility relay for testing Lolite's own pages.
// This MUST NOT be turned into a general-purpose public proxy.
export const ALLOWED_ORIGINS = Object.freeze([
  'https://darby9123-arch.github.io',
  'http://localhost:3000'
]);
export const ALLOWED_DESTINATION_HOSTS = Object.freeze([
  'darby9123-arch.github.io'
]);
const acceptedHosts = ALLOWED_DESTINATION_HOSTS.map(host =>
  new RegExp('^' + host.replaceAll('.', '\\.') + '$', 'i')
);

export function isAllowedOrigin(header) {
  if (typeof header !== 'string' || header.length > 300) return false;
  try {
    const url = new URL(header);
    return ALLOWED_ORIGINS.includes(url.origin) && url.origin === header;
  } catch {
    return false;
  }
}

export function isAllowedUpgrade(req) {
  const path = String(req.url || '').split('?')[0];
  return path === '/wisp/' &&
    String(req.method || '').toUpperCase() === 'GET' &&
    String(req.headers?.upgrade || '').toLowerCase() === 'websocket' &&
    isAllowedOrigin(req.headers?.origin);
}

export function limitWispServer(wisp) {
  const o = wisp.options;
  o.hostname_whitelist = acceptedHosts;
  o.port_whitelist = [443];
  o.allow_direct_ip = false;
  o.allow_private_ips = false;
  o.allow_loopback_ips = false;
  o.allow_udp_streams = false;
  o.allow_tcp_streams = true;
  o.stream_limit_per_host = 4;
  o.stream_limit_total = 8;
  o.wisp_version = 2;
}

export function isAllowedHost(host) {
  return typeof host === 'string' && acceptedHosts.some(re => re.test(host));
}
