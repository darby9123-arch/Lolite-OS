const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../core/game-store.js'), 'utf8');
const start = source.indexOf(' const availableServers=g=>{');
const end = source.indexOf(' // If a public game host has moved', start);

function counters() {
  assert.ok(start >= 0 && end > start, 'The real Game Store server helpers must be present');
  return vm.runInNewContext(source.slice(start, end) + '\n({availableServers,playableVersionCount})');
}

test('Each distinct playable server counts as a game version but duplicate URLs do not', () => {
  const { availableServers, playableVersionCount } = counters();
  const game = {
    title: 'Example racer',
    file: 'racer.html',
    url: 'html%20games/racer.html',
    local: true,
    servers: [
      {name: 'Server A', url: 'https://one.example/racer.html'},
      {name: 'Server B', url: 'https://two.example/racer.html'},
      {name: 'Duplicate', url: 'https://one.example/racer.html'},
      {name: 'Same as primary', url: 'html%20games/racer.html'},
      {name: 'Empty', url: ''},
      {name: 'Unsafe', url: 'javascript:alert(1)'}
    ]
  };
  const solo = { title: 'Example puzzle', file: 'puzzle.html', url: 'games/puzzle/index.html', local: true };
  assert.equal(availableServers(game).length, 3);
  assert.equal(availableServers(solo).length, 1);
  assert.equal(playableVersionCount([game,solo]), 4);
  assert.equal(playableVersionCount([]), 0);
});

test('Game Library count and category totals include server versions without multiplying cards', () => {
  assert.match(source, /totalPlayable=playableVersionCount\(totalGames\)/);
  assert.match(source, /totalPlayable\.toLocaleString\(\)\+' games incl\. servers/);
  assert.match(source, /playableVersionCount\(list\)\.toLocaleString\(\)/);
  assert.match(source, /list\.slice\(0,visibleCount\)\.map\(card\)/);
});
