const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const importer = path.resolve(__dirname, '../scripts/import-authorized-games.mjs');
function setup(entry, overrides = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lolite-import-test-'));
  const game = path.join(dir, 'test-game');
  fs.mkdirSync(game);
  fs.writeFileSync(path.join(game, 'index.html'), entry);
  const item = {
    title: 'Test Game', slug: 'test-game', entry: 'index.html',
    rightsConfirmed: true, rightsNote: 'My own original test code.',
    ...overrides
  };
  const manifest = path.join(dir, 'list.json');
  fs.writeFileSync(manifest, JSON.stringify([item]));
  return {dir, manifest};
}
function run({dir, manifest}) {
  return spawnSync(process.execPath, [importer, '--source', dir, '--manifest', manifest, '--dry-run'], {encoding:'utf8'});
}

test('authorized standalone HTML package passes validation', t => {
  const fixture = setup('<!doctype html><title>Test</title><canvas></canvas>');
  t.after(() => fs.rmSync(fixture.dir, {recursive:true, force:true}));
  const result = run(fixture);
  assert.equal(result.status, 0, result.stderr);
  const data = JSON.parse(result.stdout);
  assert.equal(data.dryRun, true);
  assert.equal(data.imported[0].files, 1);
  assert.equal(data.imported[0].title, 'Test Game');
});

test('packages without redistribution permission are rejected', t => {
  const fixture = setup('<h1>Test</h1>', {rightsConfirmed:false});
  t.after(() => fs.rmSync(fixture.dir, {recursive:true, force:true}));
  const result = run(fixture);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /redistribution permission/);
});

test('remote iframe wrappers are not treated as complete games', t => {
  const fixture = setup('<iframe src="https://example.com/game"></iframe>');
  t.after(() => fs.rmSync(fixture.dir, {recursive:true, force:true}));
  const result = run(fixture);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /embeds a remote site/);
});
