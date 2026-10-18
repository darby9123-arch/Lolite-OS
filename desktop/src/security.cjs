'use strict';
const path = require('node:path');
const fs = require('node:fs/promises');
const config = require('./config.cjs');
function trustedFrame(event, host) {
  if (!event.senderFrame || event.senderFrame !== event.sender.mainFrame) return false;
  try { const u = new URL(event.senderFrame.url); return u.protocol === 'lolite:' && u.hostname === host && u.pathname === '/index.html'; }
  catch { return false; }
}
function safeRelative(value) {
  if (typeof value !== 'string' || !value || value.length > 1024 || /[\\:\x00-\x1f]/.test(value)) throw Error('Invalid relative path.');
  const parts = value.split('/');
  if (parts.some(p => !p || p === '.' || p === '..' || /[. ]$/.test(p))) throw Error('Invalid relative path.');
  return parts.join(path.sep);
}
async function grantedPath(root, relative) {
  const candidate = path.resolve(root, safeRelative(relative));
  const real = await fs.realpath(candidate);
  const rel = path.relative(root, real);
  if (!rel || rel.startsWith('..' + path.sep) || rel === '..' || path.isAbsolute(rel)) throw Error('This item is outside the selected folder.');
  return real;
}
function safeName(value) {
  const name = String(value || 'Untitled').slice(0,180).replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/[. ]+$/,'');
  return /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(name) ? '_' + name : name || 'Untitled';
}
function officialAsset(url, tag, name) {
  const u = new URL(url);
  return u.protocol === 'https:' && !u.username && !u.password && !u.port && u.hostname === 'github.com' &&
    decodeURIComponent(u.pathname) === `/${config.repository}/releases/download/${tag}/${name}` && !u.search && !u.hash;
}
function allowedDownloadURL(url) {
  const u = new URL(url);
  return u.protocol === 'https:' && !u.username && !u.password && !u.port &&
    ((u.hostname === 'github.com' && u.pathname.startsWith(`/${config.repository}/releases/download/`)) ||
    (u.hostname === 'api.github.com' && u.pathname.startsWith(`/repos/${config.repository}/`)) ||
    ['release-assets.githubusercontent.com','objects.githubusercontent.com','github-releases.githubusercontent.com'].includes(u.hostname));
}
module.exports = {trustedFrame,safeRelative,grantedPath,safeName,officialAsset,allowedDownloadURL};
