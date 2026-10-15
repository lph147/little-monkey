// Checks the content files (content/) for mistakes that would break the game
// or the learning rules in CLAUDE.md.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadGame, ROOT} = require('./fake-browser');

const game = loadGame();
const get = expr => JSON.parse(game.run(`JSON.stringify(${expr})`));
const BANK = get('WORD_BANK'), SPRITES = get('SPRITES'), AREA = get('AREA'), PUNCT = get('[...PUNCT]');
const LOOKS = get('Object.keys(LOOKS)'), ACTIONS = get('Object.keys(ACTIONS)');   // what the engine can draw and do
const collectible = Object.keys(BANK).filter(w => BANK[w].area === AREA.number);
const where = `content/ (area ${AREA.number})`;
const onMap = ([x, y]) => y >= 0 && y < AREA.map.length && x >= 0 && x < AREA.map[0].length;
const tile = ([x, y]) => AREA.map[y][x];
const canWalk = at => !!(AREA.legend[tile(at)] || {}).walk;
const sentences = [
  ...Object.entries(AREA.lines).map(([k, l]) => [`line "${k}"`, l]),
  ...AREA.story.map((s, i) => [`story sentence ${i + 1}`, s]),
  ...AREA.storyQuestions.map((q, i) => [`story question ${i + 1}`, q]),
  ['the sign', AREA.sign.says]
];

test('every word in the word bank has pinyin and English', () => {
  for (const [w, d] of Object.entries(BANK)){
    assert.ok(d.py && d.en, `${w} needs both py (pinyin) and en (English) in content/words.js`);
    assert.ok(d.area === undefined || Number.isInteger(d.area), `${w} has an area that isn't a number`);
  }
});

test('the word bank lists each word only once', () => {
  const text = fs.readFileSync(path.join(ROOT, 'content', 'words.js'), 'utf8');
  const seen = new Set();
  for (const [, w] of text.matchAll(/^\s*'([^']+)'\s*:/gm)){
    assert.ok(!seen.has(w), `${w} is in content/words.js twice; the second one silently replaces the first`);
    seen.add(w);
  }
});

test('every word in every sentence is in the word bank', () => {
  for (const [name, s] of sentences){
    assert.equal(s.zh, s.zh.trim().replace(/ {2,}/g, ' '), `${name} has extra spaces: "${s.zh}"`);
    for (const t of s.zh.split(' ')){
      assert.ok(BANK[t] || PUNCT.includes(t), `${name} uses ${t}, which isn't in the word bank (content/words.js). Sentence: "${s.zh}"`);
    }
  }
});

test('every line and story sentence has an English translation', () => {
  for (const [name, s] of sentences.filter(([n]) => !n.startsWith('story question'))) assert.ok(s.en, `${name} has no English`);
});

test('every collectible picture is different', () => {
  const byPic = {};
  for (const w of collectible.filter(w => BANK[w].pic)){
    const p = BANK[w].pic;
    assert.ok(!byPic[p], `${w} and ${byPic[p]} share the picture ${p}; every picture must be unique`);
    byPic[p] = w;
  }
});

test('the map is a rectangle', () => {
  const width = AREA.map[0].length;
  AREA.map.forEach((row, y) => assert.equal(row.length, width, `map row ${y} is ${row.length} tiles wide, not ${width}`));
});

test('every letter on the map is in the legend', () => {
  AREA.map.forEach((row, y) => [...row].forEach((ch, x) => {
    assert.ok(AREA.legend[ch], `the map has "${ch}" at ${x},${y}, but the legend doesn't say what "${ch}" is`);
  }));
});

test('the legend only uses looks and actions the engine has', () => {
  for (const [ch, t] of Object.entries(AREA.legend)){
    assert.equal(ch.length, 1, `legend entry "${ch}" should be a single letter`);
    assert.ok(LOOKS.includes(t.look), `legend "${ch}" has look "${t.look}"; the looks are ${LOOKS.join(', ')}`);
    if (t.action) assert.ok(ACTIONS.includes(t.action), `legend "${ch}" has action "${t.action}"; the actions are ${ACTIONS.join(', ')}`);
  }
});

test('the legend only teaches collectible words', () => {
  for (const [ch, t] of Object.entries(AREA.legend)){
    for (const w of [t.word, t.learnFirst, t.gather && t.gather.item].filter(Boolean)){
      assert.ok(collectible.includes(w), `legend "${ch}" teaches ${w}, which isn't a word you can collect in ${where}`);
    }
    if (t.learnOnStep || t.newNote || t.learnFirst) assert.ok(t.word, `legend "${ch}" needs a word`);
    if (t.gather) assert.ok(t.gather.label && t.gather.note, `legend "${ch}": gather needs a label and a note`);
    if (t.whenGateOpens) assert.ok(AREA.legend[t.whenGateOpens], `legend "${ch}" turns into "${t.whenGateOpens}", which isn't in the legend`);
  }
});

test('you start on a tile you can walk on', () => {
  const at = [AREA.start.x, AREA.start.y];
  assert.ok(onMap(at) && canWalk(at), `the start ${at} isn't a walkable tile`);
});

test('characters stand on the map, on walkable tiles, one per tile', () => {
  const taken = new Set([`${AREA.start.x},${AREA.start.y}`]);
  for (const c of AREA.characters){
    const at = [c.x, c.y];
    assert.ok(onMap(at), `${c.id} at ${at} is off the map`);
    assert.ok(canWalk(at), `${c.id} stands on "${tile(at)}" at ${at}, which isn't walkable`);
    assert.ok(!taken.has(String(at)), `${c.id} at ${at} shares a tile with someone else or the start`);
    taken.add(String(at));
    assert.ok(['up', 'down', 'left', 'right'].includes(c.facing), `${c.id} faces "${c.facing}"`);
  }
});

test('character names show Chinese, pinyin and English', () => {
  for (const c of AREA.characters.filter(c => c.name || c.palette)){
    assert.ok(c.name && c.name.zh && c.name.py && c.name.en, `${c.id} needs a name with zh, py and en`);
  }
  const n = AREA.sign.name;
  assert.ok(n && n.zh && n.py && n.en, 'the sign needs a name with zh, py and en');
});

test('sparkles are on collectible words, on the map', () => {
  for (const [w, at] of Object.entries(AREA.sparkles)){
    assert.ok(collectible.includes(w), `${w} sparkles, but it isn't a word you can collect in ${where}`);
    assert.ok(onMap(at), `the sparkle for ${w} at ${at} is off the map`);
  }
});

test('animals are collectible words, each with a 16 × 16 sprite', () => {
  const ids = new Set();
  for (const a of AREA.animals){
    assert.ok(!ids.has(a.id), `two animals have the id ${a.id}`); ids.add(a.id);
    assert.ok(collectible.includes(a.word), `the ${a.id}'s word ${a.word} isn't a word you can collect in ${where}`);
    assert.ok(SPRITES[a.word], `${a.word} has no sprite in content/sprites.js`);
  }
});

test('sprites are 16 × 16 and every letter has a colour', () => {
  for (const [w, s] of Object.entries(SPRITES)){
    assert.ok(BANK[w], `content/sprites.js has a sprite for ${w}, which isn't in the word bank`);
    assert.equal(s.rows.length, 16, `${w}'s sprite has ${s.rows.length} rows, not 16`);
    s.rows.forEach((r, y) => {
      assert.equal(r.length, 16, `${w}'s sprite row ${y} is ${r.length} pixels wide, not 16`);
      for (const ch of r) assert.ok(ch === '.' || s.palette[ch], `${w}'s sprite uses "${ch}", which isn't in its palette`);
    });
  }
});

test('story questions offer different collectible pictures, one of them the answer', () => {
  AREA.storyQuestions.forEach((q, i) => {
    assert.equal(new Set(q.options).size, q.options.length, `story question ${i + 1} repeats an option`);
    for (const w of q.options) assert.ok(collectible.includes(w) && BANK[w].pic, `story question ${i + 1}: ${w} isn't a collectible word with a picture`);
    assert.ok(q.options.includes(q.answer), `story question ${i + 1}: the answer ${q.answer} isn't one of the options`);
  });
});

test('intro captions are in time order, with Chinese, pinyin and English', () => {
  AREA.intro.forEach((c, i) => {
    assert.ok(c.zh && c.py && c.en, `intro caption ${i + 1} needs zh, py and en`);
    if (i) assert.ok(c.at > AREA.intro[i - 1].at, `intro caption ${i + 1} comes before the one above it`);
  });
});
