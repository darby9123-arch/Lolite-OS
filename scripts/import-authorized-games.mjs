#!/usr/bin/env node
/**
 * Import complete HTML game folders that you own or may redistribute.
 * This tool never downloads games from a third-party website.
 *
 * Usage:
 *   node scripts/import-authorized-games.mjs --source ./my-games --manifest ./my-games/games.json
 *
 * games.json example:
 * [
 *   {"title":"My Game","slug":"my-game","entry":"index.html",
 *    "rightsConfirmed":true,"rightsNote":"I created this game."}
 * ]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destinationRoot = path.join(projectRoot, 'html games', 'authorized');
const key = name => String(name).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');
const pathOK = value => typeof value === 'string' && value.length > 0 && value.length < 240 &&
  !value.includes('\\') && !value.startsWith('/') && value.split('/').every(p => p && p !== '.' && p !== '..' && !p.includes(':'));
const slugOK = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value);
const args = process.argv.slice(2);
if (args.includes('--help') || args.length === 0) {
  console.log('Usage: node scripts/import-authorized-games.mjs --source <folder> --manifest <json> [--dry-run]');
  process.exit(args.includes('--help') ? 0 : 1);
}
const arg = flag => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
const source = arg('--source') && path.resolve(arg('--source'));
const manifestFile = arg('--manifest') && path.resolve(arg('--manifest'));
const dryRun = args.includes('--dry-run');
if (!source || !manifestFile) throw Error('--source and --manifest are required');

const entries = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
if (!Array.isArray(entries) || !entries.length) throw Error('Manifest must contain a nonempty array of game entries');
const previousFile = path.join(destinationRoot, 'manifest.json');
let previous = {version: 1, games: []};
try { previous = JSON.parse(await fs.readFile(previousFile, 'utf8')); } catch(e) { if (e.code !== 'ENOENT') throw e; }
const games = Array.isArray(previous.games) ? [...previous.games] : [];
const imported = [];
for (const item of entries) {
  if (!item || !slugOK(item.slug) || !pathOK(item.entry) || !/\.html?$/i.test(item.entry) ||
      !item.title || typeof item.title !== 'string' || item.title.length > 100) {
    throw Error('Invalid game title, slug or HTML entry point');
  }
  if (item.rightsConfirmed !== true || typeof item.rightsNote !== 'string' || item.rightsNote.trim().length < 8) {
    throw Error(item.title + ': redistribution permission must be confirmed and explained in rightsNote');
  }
  const folder = item.folder ?? item.slug;
  if (!pathOK(folder)) throw Error(item.title + ': unsafe source folder');
  const from = path.resolve(source, folder);
  if (!from.startsWith(source + path.sep)) throw Error(item.title + ': source escapes selected directory');
  const stats = await fs.lstat(from);
  if (!stats.isDirectory()) throw Error(item.title + ': not a folder');
  const entry = path.join(from, item.entry);
  const html = await fs.readFile(entry, 'utf8');
  if (/<iframe\b[^>]*\bsrc\s*=\s*["']https?:\/\//i.test(html)) {
    throw Error(item.title + ': entry point embeds a remote site; supply actual playable HTML files');
  }
  let count = 0, bytes = 0;
  async function validate(dir) {
    for (const dirent of await fs.readdir(dir, {withFileTypes:true})) {
      if (dirent.name === '.git') throw Error(item.title + ': remove .git folders first');
      const full = path.join(dir, dirent.name);
      const st = await fs.lstat(full);
      if (st.isSymbolicLink() || (!st.isFile() && !st.isDirectory())) throw Error(item.title + ': unsupported link or asset');
      if (st.isDirectory()) await validate(full);
      else {
        count++; bytes += st.size;
        if (count > 2000 || bytes > 200 * 1024 * 1024) throw Error(item.title + ': package exceeds safety limits');
      }
    }
  }
  await validate(from);
  if (!count) throw Error(item.title + ': empty game folder');
  const to = path.join(destinationRoot, item.slug);
  const match = games.findIndex(g => key(g.title) === key(item.title) || g.slug === item.slug);
  const record = {title: item.title, slug: item.slug, entry: item.entry, category: item.category || 'Arcade & Action', source: 'Locally authorized game', rightsNote: item.rightsNote.trim()};
  if (!dryRun) {
    await fs.mkdir(destinationRoot, {recursive:true});
    await fs.rm(to, {recursive:true, force:true});
    await fs.cp(from, to, {recursive:true, dereference:false, errorOnExist:true});
  }
  if (match >= 0) games.splice(match, 1, record); else games.push(record);
  imported.push({title:item.title, files:count, bytes, replaced:match>=0});
}
if (!dryRun) await fs.writeFile(previousFile, JSON.stringify({version:1,games}, null, 2) + '\n');
console.log(JSON.stringify({dryRun, imported, totalCatalog:games.length}, null, 2));
