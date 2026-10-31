// The map (地图, js/map.js; decided 31 October 2026): MAP opens it once you have it. The whole area on one screen, each
// place you've been where its onMap says, joined by paths, with a ? on an open way to somewhere you haven't been.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const json = s => JSON.parse(s);
const saveOf = game => json(game.storage.get('xiaohouzi-v2'));
// A game you're playing: progress in the area (on top of a new game's), and where you are.
function playing(progress = {}, pos = {place: 'meadow', x: 9, y: 3, dir: 'down'}){
  const game = loadGame({dom: true, save: {version: 33, started: true, pos, areas: {1: progress}}});
  game.run("mode = 'play'");
  return {game, run: code => game.run(code), sheet: game.el('#sheet')};
}

test('every place has a spot on the map, inside it, and no two places’ pictures overlap', () => {
  const run = loadGame().run;
  const spots = json(run('JSON.stringify(Object.fromEntries(Object.keys(PLACES).map(id => [id, onMapAt(id)])))'));
  for (const [id, [x, y, w, h]] of Object.entries(spots)){
    assert.ok(x >= 2 && y >= 2 && x + w <= 238 && y + h <= 158, `${id} is on the map's paper (${x}, ${y}, ${w} x ${h})`);
  }
  const ids = Object.keys(spots);
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++){
    const [ax, ay, aw, ah] = spots[ids[i]], [bx, by, bw, bh] = spots[ids[j]];
    const apart = ax + aw + 2 <= bx || bx + bw + 2 <= ax || ay + ah + 2 <= by || by + bh + 2 <= ay;   // (a pixel's frame round each)
    assert.ok(apart, `${ids[i]} and ${ids[j]} overlap on the map`);
  }
});

test('the game remembers the places you’ve been, each once: a new game has been to the first place', () => {
  const {run} = playing();
  assert.deepEqual(json(run('JSON.stringify(here().visited)')), ['meadow']);
  run("enterPlace('path'); enterPlace('meadow'); enterPlace('path')");
  assert.deepEqual(json(run('JSON.stringify(here().visited)')), ['meadow', 'path']);
});

test('an old save (version 32) starts its map with the places on the way to where you are', () => {
  const game = loadGame({save: {version: 32, started: true, pos: {place: 'valley', x: 19, y: 10, dir: 'up'},
    areas: {1: {climb: 1, changed: {'hillside:3,4': 'g'}}}}});
  const s = saveOf(game);
  assert.equal(s.version, 33);
  assert.deepEqual(s.areas[1].visited, ['meadow', 'path', 'valley', 'falls', 'homeGround', 'hillside'],
    'the way to the valley, and to the hillside, where a square was changed');
  const fresh = loadGame({save: {version: 32, started: true, pos: {place: 'meadow', x: 9, y: 3, dir: 'down'}, areas: {1: {}}}});
  assert.deepEqual(saveOf(fresh).areas[1].visited, ['meadow']);
});

test('MAP says you don’t have a map yet, till you set off up the mountain path', () => {
  const {run, sheet} = playing();
  assert.equal(run('hasMap()'), false);
  run('globalThis.__said = []; toast = m => __said.push(m); pressMap()');
  assert.deepEqual(json(run('JSON.stringify(__said)')), [run('AREA.areaMap.notYet')]);
  assert.equal(sheet.querySelector('.mapview'), null, 'no map');
  assert.equal(playing({gate: true, climb: 1}).run('hasMap()'), true);
});

test('MAP opens the map on the place you’re in, with a button for each place you’ve been; MAP or Back closes it', () => {
  const {game, run, sheet} = playing({gate: true, climb: 2, visited: ['meadow', 'path', 'valley']}, {place: 'path', x: 16, y: 10, dir: 'up'});
  run('pressMap()');
  assert.ok(sheet.querySelector('.mapview'), 'the map');
  const places = sheet.querySelectorAll('.mapplace').map(b => b.dataset.place);
  assert.deepEqual(places.sort(), ['meadow', 'path', 'valley']);
  assert.match(sheet.querySelector('.mapname').textContent, /山路[\s\S]*shānlù[\s\S]*The mountain path[\s\S]*You are here/);
  run('pressMap()');
  assert.equal(run('modal.hidden'), true, 'MAP again closes it');
  game.key('p');
  assert.ok(sheet.querySelector('.mapview'), 'P opens it');
  sheet.querySelector('[data-a=back]').click();
  assert.equal(run('modal.hidden'), true, 'Back closes it');
});

test('the map joins the places you’ve been, and shows a ? only on a way that’s open', () => {
  const {run} = playing({gate: true, climb: 2, visited: ['meadow', 'path', 'valley', 'falls']});
  const {lines, ends} = json(run('JSON.stringify(mapPaths())'));
  const key = ([a, b]) => [a, b].sort().join('-');
  assert.deepEqual(lines.map(key).sort(), ['meadow-path', 'path-valley', 'falls-valley'].sort());
  // every way out of a place you've been to one you haven't: drawn with a ? if it's open, not at all if it isn't
  const ways = json(run(`JSON.stringify(here().visited.flatMap(a => PLACES[a].exits.filter(e => !here().visited.includes(e.to)).map(e => [a, e.to, isOpen(e)])))`));
  assert.ok(ways.some(([, , open]) => !open), 'some ways out are still shut here (the shore, the home ground)');
  for (const [a, b, open] of ways) assert.equal(ends.some(e => key(e) === key([a, b])), open || ways.some(([x, y, o]) => key([x, y]) === key([a, b]) && o), `${a} to ${b}`);
});

// A place's close-up (closeUp, js/map.js): A on it, or a tap, on the map.
test('a tap on a place shows its close-up: its name and the words you know from there; Back goes back to the map', () => {
  const words = {'河': {lv: 2}, '鱼': {lv: 1}, '羊': {lv: 1}, '山路': {lv: 1}};
  const {run, sheet} = playing({gate: true, climb: 2, visited: ['meadow', 'path', 'valley']}, {place: 'path', x: 16, y: 10, dir: 'up'});
  run(`Object.assign(S.w, ${JSON.stringify(words)})`);
  run('pressMap()');
  sheet.querySelector('.mapplace[data-place="valley"]').click();
  assert.ok(sheet.querySelector('.closeup'), 'the close-up');
  assert.match(sheet.querySelector('.closename').textContent, /河谷[\s\S]*The river valley/);
  assert.doesNotMatch(sheet.querySelector('.closename').textContent, /You are here/, 'you aren’t there');
  const stickers = sheet.querySelectorAll('.sticker').map(b => b.dataset.w);
  assert.deepEqual(stickers, json(run("JSON.stringify(placeWords('valley'))")));
  assert.ok(stickers.includes('河') && stickers.includes('羊'), 'the river there, and the sheep that lives there');
  assert.ok(!stickers.includes('山羊'), 'not a word you don’t know yet');
  run("globalThis.__said = []; say = w => __said.push(w)");
  sheet.querySelector('.sticker[data-w="河"]').click();
  assert.deepEqual(json(run('JSON.stringify(__said)')), ['河'], 'a tap says it');
  assert.match(sheet.querySelector('.gloss').textContent, /河 hé · river/, 'with what it means');
  sheet.querySelector('[data-a=back]').click();
  assert.ok(sheet.querySelector('.mapplaces'), 'back to the map');
  assert.match(sheet.querySelector('.mapname').textContent, /河谷/, 'on the place you looked at');
  run('pressMap()');
  assert.equal(sheet.querySelector('.mapview'), null, 'MAP closes it');
});

test('a close-up with no words you know there says so', () => {
  const {run, sheet} = playing({gate: true, climb: 2, visited: ['meadow', 'cave']}, {place: 'meadow', x: 9, y: 3, dir: 'down'});
  run("closeUp('cave')");
  assert.equal(sheet.querySelectorAll('.sticker').length, 0);
  assert.match(sheet.querySelector('.mapwords').textContent, /No words found here yet/);
});

test('every place’s words are words in the word bank, each once, and the ones you know', () => {
  const run = loadGame().run;
  run('for (const w in WORDS) S.w[w] = {lv: 1}');
  const all = json(run('JSON.stringify(Object.fromEntries(Object.keys(PLACES).map(id => [id, placeWords(id)])))'));
  for (const [id, ws] of Object.entries(all)){
    assert.ok(ws.length, `${id} has words`);
    assert.equal(new Set(ws).size, ws.length, `${id}: each once`);
    for (const w of ws) assert.ok(json(run(`JSON.stringify(!!WORDS[${JSON.stringify(w)}])`)), `${id}: ${w} is a word`);
  }
  run('S.w = {}');
  assert.deepEqual(json(run("JSON.stringify(placeWords('homeGround'))")), [], 'none you don’t know');
});

test('a new game, a deleted one or a loaded one forgets the pictures of the game that was there', () => {
  const run = loadGame().run;
  run("KEPT[pictureKey('meadow', 2)] = 'a'; KEPT[pictureKey('meadow', 1)] = 'b'; KEPT[pictureKey('path', 3)] = 'c'");
  run('newGameIn(2)');
  assert.deepEqual(json(run('JSON.stringify(Object.keys(KEPT))')), [run("pictureKey('meadow', 1)"), run("pictureKey('path', 3)")]);
  run('deleteSlot(3)');
  assert.deepEqual(json(run('JSON.stringify(Object.keys(KEPT))')), [run("pictureKey('meadow', 1)")]);
});
