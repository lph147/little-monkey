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
const BANK = get('WORD_BANK'), PICTURES = get('PICTURES'), MAP_SPRITES = get('MAP_SPRITES'), AREA = get('AREA'), PUNCT = get('[...PUNCT]');
const LOOKS = get('Object.keys(LOOKS)'), ACTIONS = get('Object.keys(ACTIONS)'), STEPS = get('Object.keys(STEPS)');   // what the engine can draw and do
const STEP_OPTIONS = get('STEP_OPTIONS'), COUNTS = get('Object.keys(COUNTS)');
const remembered = [...Object.keys(AREA.progress), ...Object.keys(AREA.requests), 'done'];   // what the area keeps in the save
const placeholders = text => [...String(text).matchAll(/\{([^}|]+)(?:\|[^}]*)?\}/g)].map(m => m[1]);   // (a word's, without the English that fits the sentence: {石头|stones})
// A step, and the steps inside it for if you win (a battle's, or a word game's)
const withWins = (where, s, who) => [[where, s, who], ...[...(s.win || []), ...((s.wordGame || {}).win || [])].flatMap(w => withWins(`${where}, if you win`, w, who))];
const allSteps = () => [
  ...Object.entries(AREA.talk).flatMap(([who, parts]) => parts.flatMap((p, i) => p.do.flatMap(s => withWins(`${who}'s talk, part ${i + 1}`, s, who)))),
  ...AREA.events.flatMap((e, i) => e.do.map(s => [`event ${i + 1}`, s, null])),
  ...AREA.begin.map(s => ['begin', s, null]),
  ...allLegend.flatMap(([ch, t, from]) => (t.onLook || []).flatMap((p, i) => p.do.map(s => [`looking at ${from}, part ${i + 1}`, s, null]))),
  ...(AREA.spots || []).flatMap((sp, n) => sp.onLook.flatMap((p, i) => p.do.map(s => [`looking at spot ${n + 1}, part ${i + 1}`, s, null]))),
  ...Object.entries(AREA.countGames || {}).flatMap(([id, g]) => (g.win || []).map(s => [`the counting game ${id}, if you win`, s, null])),
  ...AREA.animals.flatMap(a => (a.counted || []).flatMap((c, i) => c.map(s => [`the ${a.id}, as friend ${i + 1} of ${a.many}`, s, null]))),
  ...((AREA.battles || {}).afterLoss || []).flatMap((a, i) => a.do.map(s => [`after losing a battle, part ${i + 1}`, s, null]))
];
const allIfs = () => [
  ...Object.entries(AREA.talk).flatMap(([who, parts]) => parts.filter(p => p.if).map((p, i) => [`${who}'s talk`, p.if])),
  ...AREA.events.map((e, i) => [`event ${i + 1}`, e.if]),
  ...((AREA.battles || {}).afterLoss || []).filter(a => a.if).map((a, i) => [`after losing a battle, part ${i + 1}`, a.if]),
  ...AREA.tasks.map(t => [`task ${t.id}`, t.if]),
  ...AREA.hints.map((h, i) => [`hint ${i + 1}`, h.if]),
  ...AREA.checklist.map((c, i) => [`checklist item ${i + 1}`, c.done]),
  ...AREA.checklist.filter(c => c.show).map((c, i) => [`checklist item ${AREA.checklist.indexOf(c) + 1}'s show`, c.show]),
  ...Object.entries(AREA.bubbles).flatMap(([who, list]) => list.map(b => [`${who}'s bubble`, b.if])),
  ...AREA.sparkles.filter(s => s.if).map(s => [`the sparkle for ${s.word || 'what’s at ' + s.at}`, s.if]),
  ...(AREA.spots || []).flatMap((sp, n) => sp.onLook.filter(p => p.if).map(p => [`spot ${n + 1}`, p.if])),
  ...(AREA.lessons || []).filter(l => l.if).map(l => [`the lessons ${l.id}`, l.if]),
  ...allLegend.filter(([, t]) => t.pick && t.pick.if).map(([, t, from]) => [`picking at ${from}`, t.pick.if]),
  ...allSteps().filter(([, s]) => s.if).map(([where, s]) => [`a step in ${where}`, s.if]),
  ['animalsAppear', AREA.animalsAppear]
];
const okPlaceholder = w => BANK[w] || AREA.counters[w] || (w.startsWith('holding:') && AREA.requests[w.slice(8)]) || (w.startsWith('wanted:') && (AREA.requests[w.slice(7)] || {}).choices)
  || (w.startsWith('left:') && (AREA.counters[w.slice(5)] || {}).count === 'known');   // (what a counter of words you know still waits for)
// A request's sentences: its own, or each of its choices' (a fussy request, such as the hungry monkey's fruit).
const asked = r => (r.choices ? Object.entries(r.choices).map(([wants, c]) => ({...r, ...c, wants})) : [r]);
const collectible = Object.keys(BANK).filter(w => BANK[w].area === AREA.number);
const where = `content/ (area ${AREA.number})`;
// Positions are [x, y] in the first place, or [x, y, 'place'] in another.
const FIRST = Object.keys(AREA.places)[0];
const mapOf = p => (AREA.places[p || FIRST] || {}).map;
const onMap = ([x, y, p]) => { const m = mapOf(p); return !!m && y >= 0 && y < m.length && x >= 0 && x < m[0].length; };
const tile = ([x, y, p]) => mapOf(p)[y][x];
const allMaps = Object.entries(AREA.places).map(([id, p]) => [id, p.map]);
// The legend in a place: the area's, with the place's own letters if it has any. Every legend entry, with its letter, where
// it's from (for messages) and the place whose legend it's in (none for the area's).
const legendOf = p => ({...AREA.legend, ...((AREA.places[p || FIRST] || {}).legend || {})});
const allLegend = [...Object.entries(AREA.legend).map(([ch, t]) => [ch, t, `legend "${ch}"`, null]),
  ...Object.entries(AREA.places).flatMap(([id, p]) => Object.entries(p.legend || {}).map(([ch, t]) => [ch, t, `${id}'s legend "${ch}"`, id]))];
const canWalk = at => { const l = legendOf(at[2]), t = l[tile(at)] || {}; return !!t.walk || (t.becomes || []).some(b => (l[b.to] || {}).walk); };   // (or will be, once the story opens it)
const sentences = [
  ...Object.entries(AREA.lines).map(([k, l]) => [`line "${k}"`, l]),
  ...AREA.story.map((s, i) => [`story sentence ${i + 1}`, s]),
  ...AREA.storyQuestions.map((q, i) => [`story question ${i + 1}`, q]),
  ...Object.entries(AREA.examples).map(([w, e]) => [`the example for ${w}`, e]),
  ['the sign', AREA.sign.says],
  ...AREA.intro.map((c, i) => [`the opening's caption ${i + 1}`, c]),
  ...Object.entries(AREA.scenes || {}).flatMap(([id, sc]) => sc.captions.map((c, i) => [`the ${id} scene's caption ${i + 1}`, c])),
  ...allLegend.filter(([, t]) => t.sign).map(([, t, from]) => [`the sign on ${from}`, t.sign.says]),
  ...allLegend.filter(([, t]) => t.gather && t.gather.picked).map(([, t, from]) => [`what you pick at ${from}`, t.gather.picked]),
  ...Object.values(AREA.talk).flatMap(parts => parts.flatMap(p => p.do.filter(s => s.gap).map(s => [`the gap sentence "${s.gap.sentence}"`, {zh: s.gap.sentence, en: s.gap.en}])))
];

test('every word in the word bank has pinyin and English', () => {
  for (const [w, d] of Object.entries(BANK)){
    assert.ok(d.py && d.en, `${w} needs both py (pinyin) and en (English) in content/words.js`);
    assert.ok(d.area === undefined || Number.isInteger(d.area), `${w} has an area that isn't a number`);
  }
});

test('every word you can collect has a Word Scroll category', () => {
  const CATEGORIES = get('CATEGORIES');
  for (const [w, d] of Object.entries(BANK)){
    if (d.area !== undefined) assert.ok(CATEGORIES[d.category], `${w} needs a category in content/words.js, one of: ${Object.keys(CATEGORIES).join(', ')}`);
    else assert.equal(d.category, undefined, `${w} can't be collected yet, so it goes in the Heard list, not a category`);
  }
});

test('every word you can collect here says where you found it', () => {
  for (const w of collectible) assert.ok(AREA.found[w], `${w} needs a note in found, in ${where}`);
  for (const w of Object.keys(AREA.found)) assert.ok(collectible.includes(w), `found has a note for ${w}, which you can't collect here`);
});

test('the word bank lists each word only once', () => {
  const file = fs.readFileSync(path.join(ROOT, 'content', 'words.js'), 'utf8');
  const text = file.slice(file.indexOf('const WORD_BANK'), file.indexOf('\n};', file.indexOf('const WORD_BANK')));   // (the bank, not MADE after it)
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

test('look-alikes (alike) are other words in the word bank, or a category of them, each pair listed once', () => {
  const categories = new Set(Object.values(BANK).map(d => d.category));
  for (const [w, d] of Object.entries(BANK)) for (const a of d.alike || []){
    if (a[0] === '*'){ assert.ok(categories.has(a.slice(1)), `${w}: '${a}' isn't a category of words`); continue; }
    assert.ok(BANK[a] && a !== w, `${w}: its look-alike ${a} isn't another word in the word bank`);
    assert.ok(!(BANK[a].alike || []).includes(w), `${w} and ${a} both list each other: it works both ways, so list it once`);
  }
});

test('the map of every place is a rectangle', () => {
  for (const [id, map] of allMaps){
    const width = map[0].length;
    map.forEach((row, y) => assert.equal(row.length, width, `${id}: map row ${y} is ${row.length} tiles wide, not ${width}`));
  }
});

test('cliffs and banks are two squares high, so every level looks as high as the next (at the top of the map, the rest is out of sight); steps climb all of one, between walls of rock', () => {
  const EDGES = ['cliffFace', 'bank', 'steps'], ROCK = ['heights', 'cliffFace', 'bank'];
  for (const [id, map] of allMaps){
    const look = (x, y) => (legendOf(id)[(map[y] || '')[x]] || {}).look;
    map.forEach((row, y) => [...row].forEach((ch, x) => {
      const l = look(x, y);
      if (EDGES.includes(l) && !EDGES.includes(look(x, y - 1))){   // the top of a drop
        let n = 1; while (EDGES.includes(look(x, y + n))) n++;
        assert.ok(n === 2 || (y === 0 && n < 2), `${id}: the ${l} at ${x},${y} is ${n} square${n === 1 ? "" : "s"} high; make it 2, as everywhere`);
      }
      if (l === 'heights') assert.ok(y === map.length - 1 || ['heights', 'cliffFace'].includes(look(x, y + 1)),
        `${id}: the top of the rock at ${x},${y} needs more rock or a cliff below it, not ${look(x, y + 1)}`);
      if (l === 'steps') for (const dx of [-1, 1]){
        let a = x + dx; while (look(a, y) === 'steps') a += dx;
        assert.ok(a < 0 || a >= row.length || ROCK.includes(look(a, y)), `${id}: the steps at ${x},${y} need rock beside them, not ${look(a, y)}`);
      }
    }));
  }
});

test('every letter on the map is in the legend (the area’s, or the place’s own)', () => {
  for (const [id, map] of allMaps) map.forEach((row, y) => [...row].forEach((ch, x) => {
    assert.ok(legendOf(id)[ch], `${id}: the map has "${ch}" at ${x},${y}, but the legend doesn't say what "${ch}" is`);
  }));
});

test('the legend only uses looks and actions the engine has', () => {
  for (const [ch, t, from] of allLegend){
    assert.equal(ch.length, 1, `${from} should be a single letter`);
    assert.ok(LOOKS.includes(t.look), `${from} has look "${t.look}"; the looks are ${LOOKS.join(', ')}`);
    if (t.action) assert.ok(ACTIONS.includes(t.action), `${from} has action "${t.action}"; the actions are ${ACTIONS.join(', ')}`);
  }
});

test('the legend only teaches collectible words', () => {
  for (const [, t, from, place] of allLegend){
    for (const w of [t.word, t.learnFirst, t.gather && t.gather.item].filter(Boolean)){
      assert.ok(collectible.includes(w), `${from} teaches ${w}, which isn't a word you can collect in ${where}`);
    }
    if (t.learnOnStep || t.newNote || t.learnFirst) assert.ok(t.word, `${from} needs a word`);
    if (t.gather) assert.ok(t.gather.label && t.gather.note, `${from}: gather needs a label and a note`);
    for (const b of t.becomes || []) assert.ok((place ? legendOf(place) : AREA.legend)[b.to] && b.if, `${from} turns into "${b.to}" (once its if matches), which isn't in the legend`);
  }
});

test('you start on a tile you can walk on', () => {
  const at = [AREA.start.x, AREA.start.y, AREA.start.place];
  assert.ok(onMap(at) && canWalk(at), `the start ${at} isn't a walkable tile`);
});

test('characters stand on the map, on walkable tiles (or in the water, splashing about, or bathing in a warm pool, or on what they peck at), one per tile', () => {
  const taken = new Set([String([AREA.start.x, AREA.start.y, AREA.start.place || FIRST])]);
  for (const c of AREA.characters){
    const at = [c.x, c.y, c.place || FIRST];
    assert.ok(onMap(at), `${c.id} at ${at} is off the map`);
    if (c.plays === 'splash') assert.equal((legendOf(at[2])[tile(at)] || {}).look, 'water', `${c.id} splashes about in the water, not on "${tile(at)}" at ${at}`);
    else if (c.plays === 'bathe') assert.equal((legendOf(at[2])[tile(at)] || {}).look, 'hotPool', `${c.id} bathes in a warm pool, not on "${tile(at)}" at ${at}`);
    else if (c.pecks) assert.ok((legendOf(at[2])[tile(at)] || {}).word, `${c.id} pecks at "${tile(at)}" at ${at}, which has no word: what is it?`);   // (a bird on a wild melon)
    else assert.ok(canWalk(at), `${c.id} stands on "${tile(at)}" at ${at}, which isn't walkable`);
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

test('sparkles are on collectible words, on the map (or, with no word, say when they sparkle, such as the sign’s)', () => {
  for (const {word: w, at, if: when} of AREA.sparkles){
    if (!w){ assert.ok(when, `the sparkle at ${at} has no word, so it needs an if: when it sparkles`); assert.ok(onMap(at), `the sparkle at ${at} is off the map`); continue; }
    assert.ok(collectible.includes(w), `${w} sparkles, but it isn't a word you can collect in ${where}`);
    assert.ok(onMap(at), `the sparkle for ${w} at ${at} is off the map`);
  }
});

test('the area has a name, and somewhere for animals to hide', () => {
  const n = AREA.name;
  assert.ok(n && n.zh && n.py && n.en, 'the area needs a name with zh, py and en');
  const hiding = Object.values(AREA.legend).filter(t => t.animals);
  assert.ok(hiding.length && hiding.every(t => collectible.includes(t.word)), 'some legend tile needs animals:true and a word, such as 草');
  for (const k of ['notReady', 'ready', 'tryAgain', 'passButton', 'failButton', 'done', 'notBuilt']) assert.ok(AREA.exit[k], `exit needs ${k}`);
  const back = AREA.exit.returnTo;
  assert.ok(onMap([back.x, back.y, back.place]) && canWalk([back.x, back.y, back.place]), `exit.returnTo ${back.x},${back.y} isn't a walkable tile`);
  assert.ok(['up', 'down', 'left', 'right'].includes(back.facing), 'exit.returnTo needs facing');
  assert.ok(['up', 'down', 'left', 'right'].includes(AREA.start.facing), 'start needs facing');
});

test('places have names, and every way between them lands on a walkable tile and has a way back', () => {
  const dirs = ['up', 'down', 'left', 'right'];
  for (const [id, p] of Object.entries(AREA.places)){
    assert.ok(p.name && p.name.zh && p.name.py && p.name.en, `the place ${id} needs a name with zh, py and en`);
    for (const e of p.exits || []){
      const what = `the way from ${id} at ${e.at}`;
      if (e.by === 'A') assert.ok(onMap([...e.at, id]), `${what} isn't on the map`);   // a way you go through by pressing A, facing it
      else assert.ok(onMap([...e.at, id]) && canWalk([...e.at, id]), `${what} isn't on a walkable tile`);
      assert.ok(AREA.places[e.to], `${what} goes to ${e.to}, which isn't a place`);
      assert.ok(onMap([...e.arrive, e.to]) && canWalk([...e.arrive, e.to]), `${what} arrives at ${e.arrive} in ${e.to}, which isn't a walkable tile`);
      assert.ok(!e.facing || dirs.includes(e.facing), `${what} faces ${e.facing}`);
      assert.ok(!e.if || e.by === 'A' || e.closed, `${what} can be shut, so it needs a closed message`);
      assert.ok((AREA.places[e.to].exits || []).some(b => b.to === id), `${what} goes to ${e.to}, which has no way back`);
      assert.ok(!(AREA.places[e.to].exits || []).some(b => b.to === id && String(b.at) === String(e.arrive)), `${what} arrives right on the way back, so you'd bounce straight back`);
    }
  }
});

test('the story ending has a title, a reward and text', () => {
  const e = AREA.storyEnd;
  assert.ok(e.title && e.reward >= 0 && e.text.length, 'storyEnd needs title, reward and text');
});

test('fish jump out of water', () => {
  for (const at of AREA.fish){
    assert.ok(onMap(at) && (legendOf(at[2])[tile(at)] || {}).look === 'water', `the fish at ${at} isn't in water`);
  }
});

test('characters are drawn as monkeys (with colours), birds or an animal with a map sprite, and sparkle on real words', () => {
  for (const c of AREA.characters){
    assert.ok(c.look === undefined || ['monkey', 'bird'].includes(c.look) || (c.look === 'swarm' && c.flies) || MAP_SPRITES[c.look], `${c.id} has look "${c.look}"; it can be monkey, bird, a swarm of bees (that flies) or a word with a map sprite`);
    if (!c.look || c.look === 'monkey') assert.ok(c.palette, `${c.id} is a monkey, so it needs a palette`);
    if (c.word) assert.ok(collectible.includes(c.word), `${c.id}'s word ${c.word} isn't a word you can collect in ${where}`);
  }
});

test('animals are collectible words, each with a sprite for the map', () => {
  const ids = new Set();
  for (const a of AREA.animals){
    assert.ok(!ids.has(a.id), `two animals have the id ${a.id}`); ids.add(a.id);
    assert.ok(collectible.includes(a.word), `the ${a.id}'s word ${a.word} isn't a word you can collect in ${where}`);
    assert.ok(MAP_SPRITES[a.word], `${a.word} has no sprite for the map in content/sprites.js`);
  }
});

test('every word with a picture has its own pixel picture, and so does what you pick (such as 红色 的 花, a red flower)', () => {
  const seen = {}, picked = allLegend.filter(([, t]) => t.gather && t.gather.picked).map(([, t]) => t.gather.picked.zh);
  for (const w of [...collectible.filter(w => BANK[w].pic), ...new Set(picked)]){
    assert.ok(PICTURES[w], `${w} has a picture (${(BANK[w] || {}).pic || 'what you pick'}) but no pixel picture in content/pictures.js (draw it in tools/draw-pictures.js)`);
    const key = JSON.stringify([PICTURES[w].rows, PICTURES[w].palette]);
    assert.ok(!seen[key], `${w} and ${seen[key]} have the same picture; every picture must be unique`);
    seen[key] = w;
  }
});

// Each picture's rows of letters: the right size, and every letter with a colour.
const checkPixels = (file, pics, size) => {
  for (const [w, s] of Object.entries(pics)){
    assert.ok(BANK[w] || w.split(' ').every(x => BANK[x]), `${file} has a picture for ${w}, which isn't in the word bank (nor a few words from it, with spaces between)`);
    assert.equal(s.rows.length, size, `${w}'s picture in ${file} has ${s.rows.length} rows, not ${size}`);
    s.rows.forEach((r, y) => {
      assert.equal(r.length, size, `${w}'s picture in ${file}: row ${y} is ${r.length} pixels wide, not ${size}`);
      for (const ch of r) assert.ok(ch === '.' || s.palette[ch], `${w}'s picture in ${file} uses "${ch}", which isn't in its palette`);
    });
  }
};
test('word pictures are 32 × 32 and every letter has a colour', () => checkPixels('content/pictures.js', PICTURES, 32));
test('animals on the map are 16 × 16 and every letter has a colour', () => checkPixels('content/sprites.js', MAP_SPRITES, 16));

test('content/pictures.js is up to date with tools/draw-pictures.js', () => {
  const made = require('../tools/draw-pictures.js').text();
  assert.equal(fs.readFileSync(path.join(ROOT, 'content/pictures.js'), 'utf8').replace(/\r\n/g, '\n'), made,
    'a drawing has changed: run  npm run pictures');
});

test('story questions offer different collectible pictures, one of them the answer, and no two look-alikes', () => {
  AREA.storyQuestions.forEach((q, i) => {
    assert.equal(new Set(q.options).size, q.options.length, `story question ${i + 1} repeats an option`);
    for (const w of q.options) assert.ok(collectible.includes(w) && BANK[w].pic, `story question ${i + 1}: ${w} isn't a collectible word with a picture`);
    assert.ok(q.options.includes(q.answer), `story question ${i + 1}: the answer ${q.answer} isn't one of the options`);
    for (const a of q.options) for (const b of q.options) assert.ok(a === b || !game.run(`alike('${a}', '${b}')`), `story question ${i + 1}: ${a} and ${b} look alike, so they can't both be answers`);
  });
});

test('the area says what it remembers in the save, with starting values', () => {
  assert.ok(AREA.progress && Object.keys(AREA.progress).length, 'the area needs a progress list');
  for (const [k, v] of Object.entries(AREA.progress)){
    assert.ok(['number', 'boolean'].includes(typeof v), `progress ${k} should start as a number or true/false`);
    assert.notEqual(k, 'done', 'progress can\'t be called done; the game adds that itself');
  }
  for (const id of Object.keys(AREA.requests)){
    assert.ok(!(id in AREA.progress) && !['done', 'holding'].includes(id), `request ${id} has the same name as something in progress`);
  }
});

test('requests use real characters, lines and words', () => {
  for (const [id, r] of Object.entries(AREA.requests).flatMap(([id, r]) => asked(r).map(a => [id, a]))){
    assert.ok(AREA.characters.some(c => c.id === r.from), `request ${id}: from "${r.from}" isn't a character`);
    for (const w of [r.wants, r.verb].filter(Boolean)) assert.ok(collectible.includes(w), `request ${id}: ${w} isn't a word you can collect in ${where}`);
    for (const k of ['ask', 'offer', 'thanks']) assert.ok(AREA.lines[r[k]], `request ${id}: ${k} "${r[k]}" isn't one of the lines`);
    if (r.wrong) assert.ok(AREA.lines[r.wrong], `request ${id}: wrong "${r.wrong}" isn't one of the lines`);
    const sentence = r.sentence.split(' ');
    assert.ok(sentence.includes(r.wants) && (!r.verb || sentence.includes(r.verb)), `request ${id}: the sentence "${r.sentence}" should use ${r.wants} and ${r.verb}`);
    assert.ok(r.sentenceEn, `request ${id}: the sentence needs its English (sentenceEn)`);
    assert.ok(sentence.includes(r.gap || r.wants), `request ${id}: the missing word ${r.gap || r.wants} should be in the sentence`);
    for (const w of sentence) assert.ok(BANK[w], `request ${id}: ${w} isn't in the word bank`);
    for (const f of r.firstTeach || []) assert.ok(BANK[f.word] && f.note, `request ${id}: firstTeach needs words from the bank, each with a note`);
    assert.ok(r.asked && r.reward > 0, `request ${id} needs asked and a reward`);
  }
});

test('everything you can gather is for a request, and the wrong thing has a line', () => {
  for (const [, t, from] of allLegend){
    if (!t.gather) continue;
    const r = AREA.requests[t.gather.for];
    assert.ok(r, `${from} gathers for "${t.gather.for}", which isn't a request`);
    assert.ok(t.gather.message, `${from}: gather needs a message`);
    if (!r.choices && t.gather.item !== r.wants) assert.ok(r.wrong && r.wrongMessage, `request ${t.gather.for} needs wrong and wrongMessage, because ${from} gives ${t.gather.item}`);
  }
});

test('every character has a talk script (or, a bird, is shooed away: shoo), and every script is for a character', () => {
  for (const c of AREA.characters) assert.ok((AREA.talk[c.id] && AREA.talk[c.id].length) || c.shoo, `${c.id} has nothing in talk`);
  for (const who of Object.keys(AREA.talk)) assert.ok(AREA.characters.some(c => c.id === who), `talk has a script for "${who}", who isn't a character`);
});

test('every if only checks things the game knows about', () => {
  const keys = [...remembered, ...Object.keys(AREA.counters), 'new', 'knows', 'holding', 'wanted', 'bought', 'ready', 'place', 'hurt', 'near', 'at', 'around', 'following', 'practice', 'lesson', 'lessonWaits', 'hiding', 'hidesFound', 'any'];
  for (const [where, cond] of allIfs()){
    for (const [k, v] of Object.entries(cond)){
      assert.ok(keys.includes(k), `${where} checks "${k}"; it can check ${keys.join(', ')}`);
      if (k === 'new' || k === 'knows') assert.ok(collectible.includes(v), `${where}: ${v} isn't a word you can collect in ${where}`);
      if (k === 'holding') for (const id of Object.keys(v)) assert.ok(AREA.requests[id], `${where} checks holding for "${id}", which isn't a request`);
      if (k === 'place') assert.ok(AREA.places[v], `${where} checks place ${v}, which isn't a place`);
      if (k === 'near') assert.ok(AREA.characters.some(c => c.id === v), `${where} checks near "${v}", who isn't a character`);
      if (k === 'following') for (const id of Object.keys(v)) assert.ok(AREA.characters.some(c => c.id === id), `${where} checks following for "${id}", who isn't a character`);
      if (k === 'at') assert.ok(onMap(v) && canWalk(v), `${where} checks at ${JSON.stringify(v)}, which isn't somewhere you can stand`);
      if (k === 'bought') for (const w of Object.keys(v)) assert.ok(AREA.shop.items.some(i => i.item === w), `${where} checks bought for ${w}, which the shop doesn't sell`);
    }
  }
});

test('every step does one thing, with settings that exist, using real lines and words', () => {
  for (const [where, s, who] of allSteps()){
    const actions = Object.keys(s).filter(k => STEPS.includes(k));
    assert.equal(actions.length, 1, `${where}: each step needs exactly one of ${STEPS.join(', ')}, not ${JSON.stringify(s)}`);
    const a = actions[0];
    for (const k of Object.keys(s)) if (k !== a && k !== 'if') assert.ok((STEP_OPTIONS[a] || []).includes(k), `${where}: "${k}" isn't a setting for ${a}`);   // (any step can have an if)
    if (a === 'say'){
      assert.ok(AREA.lines[s.say], `${where}: "${s.say}" isn't one of the lines`);
      if (s.teach) assert.ok(AREA.lines[s.say].zh.split(' ').includes(s.teach), `${where}: line "${s.say}" doesn't contain ${s.teach}, so it can't be taught there`);
    }
    if (a === 'newWord' || a === 'card') assert.ok(collectible.includes(s[a]), `${where}: ${s[a]} isn't a word you can collect in ${where}`);
    if (a === 'set' || a === 'markOut') for (const k of Object.keys(s[a])) assert.ok(remembered.includes(k), `${where} sets "${k}", which the area doesn't remember`);
    if (a === 'shop') assert.ok(AREA.shop && AREA.shop.who === who, `${where}: ${who} doesn't run the shop`);
    if (a === 'request') assert.ok(AREA.requests[s.request] && AREA.requests[s.request].from === who, `${where}: "${s.request}" isn't a request from ${who}`);
    if (a === 'reply') assert.ok(BANK[s.reply] && BANK[s.reply].phrase && collectible.includes(s.reply), `${where}: ${s.reply} isn't a phrase you can learn here`);
    if (a === 'wordGame') assert.ok(s.wordGame.ask && s.wordGame.notYet && collectible.includes(s.wordGame.word), `${where}: wordGame needs ask, notYet and a word`);
    if (a === 'bag') assert.ok((AREA.food || {})[s.bag], `${where}: ${s.bag} isn't one of the area's food`);
    if (a === 'follow') for (const id of s.follow) assert.ok(AREA.characters.some(c => c.id === id), `${where}: "${id}" can't follow you: they aren't a character`);
    if (a === 'stopsYou') assert.ok(AREA.characters.some(c => c.id === s.stopsYou) && AREA.talk[s.stopsYou], `${where}: "${s.stopsYou}" isn't a character with something to say`);
    if (a === 'talkTo') assert.ok(AREA.characters.some(c => c.id === s.talkTo) && AREA.talk[s.talkTo], `${where}: "${s.talkTo}" isn't a character with something to say`);
    if (a === 'countGame') assert.ok((AREA.countGames || {})[s.countGame], `${where}: "${s.countGame}" isn't one of the area's countGames`);
  }
});

test('a counting game counts things you can see, with a question about them, and says when you know too few numbers', () => {
  for (const [id, g] of Object.entries(AREA.countGames || {})){
    assert.ok(BANK[g.thing.word] && PICTURES[g.thing.word], `counting game ${id}: ${g.thing.word} needs a picture to count`);
    assert.ok(['table', 'grass', 'tower'].includes(g.thing.on), `counting game ${id}: its things are on the table, the grass or a tower, not ${g.thing.on}`);
    assert.ok(AREA.lines[g.thing.ask] && AREA.lines[g.thing.ask].zh.split(' ').includes(g.thing.word), `counting game ${id}: its question (${g.thing.ask}) asks how many ${g.thing.word} there are`);
    assert.ok(g.start && g.notYet, `counting game ${id} needs start and notYet`);
  }
});

test('every phrase can be caught: a reply, a card or a request teaches it', () => {
  const taught = new Set([
    ...allSteps().flatMap(([, s]) => [s.reply, s.newWord, s.card]),
    ...Object.values(AREA.requests).flatMap(r => [r.wrongReply, r.thanksReply]),
    ...(AREA.shop ? [AREA.shop.reply, AREA.shop.no] : [])
  ].filter(Boolean));
  for (const p of collectible.filter(w => BANK[w].phrase)) assert.ok(taught.has(p), `${p} is a phrase you can never catch: nothing teaches it`);
});

// Two entries with the same name in one list can't both be right: JavaScript keeps the last, and the first is lost without a
// word (26 October 2026: the cow's 我有家了！, called haveHome, quietly replaced the old monkey's 我们有家了！). Reads the
// content files as text: each name at the start of a line, among those in the same braces.
test('no two entries in the same list in the content have the same name', () => {
  for (const name of fs.readdirSync(path.join(ROOT, 'content')).filter(f => f.endsWith('.js') && f !== 'pictures.js' && f !== 'voices.js')){
    const seen = [new Map()];
    fs.readFileSync(path.join(ROOT, 'content', name), 'utf8').split('\n').forEach((line, i) => {
      const key = (line.match(/^\s*('(?:[^'\\]|\\.)*'|[A-Za-z_$][\w$]*)\s*:/) || [])[1];
      const code = line.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g, m => m.replace(/[{}[\]]/g, ' ')).replace(/\/\/.*$/, '');   // (brackets in its strings don't count)
      if (key){
        const here = seen[seen.length - 1];
        assert.ok(!here.has(key), `content/${name}, line ${i + 1}: ${key} is there already, on line ${here.get(key)}: give one another name`);
        here.set(key, i + 1);
      }
      for (const ch of code){ if (ch === '{' || ch === '[') seen.push(new Map()); else if ((ch === '}' || ch === ']') && seen.length > 1) seen.pop(); }
    });
  }
});

test('every line is said somewhere', () => {
  const said = new Set([
    ...allSteps().filter(([, s]) => s.say).map(([, s]) => s.say),
    ...Object.values(AREA.requests).flatMap(asked).flatMap(r => [r.ask, r.offer, r.thanks, r.wrong, r.wrongAnswer].filter(Boolean)),
    ...(AREA.shop ? [AREA.shop.ask, AREA.shop.welcome] : []),
    ...(AREA.lessons || []).flatMap(l => [...Object.values(l.teach || {}), ...(l.things || []).map(t => t.ask)]),
    ...Object.values(AREA.countGames || {}).map(g => g.thing.ask),
    ...(AREA.hideSeek ? [AREA.hideSeek.count, AREA.hideSeek.coming, AREA.hideSeek.found, ...AREA.hideSeek.spots.map(p => p.say)] : [])
  ]);
  for (const key of Object.keys(AREA.lines)) assert.ok(said.has(key), `line "${key}" is never said; use it or remove it`);
});

test('counters count things the engine can count', () => {
  for (const [name, c] of Object.entries(AREA.counters)){
    assert.ok(COUNTS.includes(c.count), `counter ${name} counts "${c.count}"; it can count ${COUNTS.join(', ')}`);
    assert.ok(!BANK[name], `counter ${name} has the same name as a word`);
  }
});

test('every {word} or {counter} in content text is real', () => {
  const texts = [
    ...allSteps().flatMap(([, s]) => [s.message, s.hint, s.note]),
    ...allLegend.map(([, t]) => t.gather && t.gather.message),
    ...AREA.tasks.flatMap(t => [t.id, t.text]), ...AREA.hints.map(h => h.text), ...AREA.checklist.map(c => c.text),
    ...Object.values(AREA.found)
  ].filter(Boolean);
  for (const t of texts) for (const w of placeholders(t)) assert.ok(okPlaceholder(w), `"${t}" has {${w}}, which isn't a word in the word bank, a counter or holding:<a request>`);
});

// English text's sentences (split after . ! ?), and the words from the word bank a sentence writes as 汉字 (English): {水}
const sentencesOf = text => String(text).split(/(?<=[.!?])\s+/);
const wordsIn = sentence => placeholders(sentence).filter(w => BANK[w]);

test('English text writes at most two words as 汉字 (English) in a sentence, never two side by side, so it never reads as Chinese in English word order', () => {
  // (a red 花 (flower), not a 红色 (red) 花 (flower): read without the English, that's 红色花, where the game teaches 红色的花.
  // Decided 22 October 2026: every word you knew written that way piled up, and read as Chinese with English grammar.)
  const texts = [];
  (function walk(o){ if (typeof o === 'string'){ if (/\{/.test(o) && /[a-z]/i.test(o)) texts.push(o); } else if (o && typeof o === 'object') for (const k in o) walk(o[k]); })(AREA);
  assert.ok(texts.length > 50);
  for (const t of texts) for (const sentence of sentencesOf(t)){
    assert.ok(wordsIn(sentence).length <= 2, `"${sentence}" writes ${wordsIn(sentence).length} words as 汉字 (English): two at most, best one, the word it's about`);
    for (const [, a, b] of sentence.matchAll(/\{([^}|]+)[^}]*\}[\s,]*(?=\{([^}|]+)[^}]*\})/g))
      assert.ok(!(BANK[a] && BANK[b]), `"${sentence}" has ${a} and ${b} side by side: keep English between them (a red {花}, not a {红色} {花})`);
  }
});

test('a sentence in your tasks, the checklist or hints that mentions words from the word bank writes one of them as 汉字 (English)', () => {
  // ({水} in the content: 水 (water), or just water till you've caught it. Names stay English, as do places' names, numbers,
  // and want and have, which are what 要 and 有 mean but aren't them in these sentences: the old monkey, the home ground, the
  // pine wood, Flower Fruit Mountain, three pieces of wood, things that sparkle have words.)
  const names = /\b(monkeys?|home ground|pine wood|Flower Fruit Mountain|wants?|have|one|two|three|four|five|six|seven|eight|nine|ten)\b/gi;
  const meanings = Object.entries(BANK).filter(([, b]) => b.area <= AREA.number).flatMap(([w, b]) => b.en.split(/,\s*/)
    .map(e => e.replace(/^(a|an|the|to) /, '')).filter(e => e.length > 2).map(e => [w, e]));
  const texts = [...AREA.tasks.map(t => t.text), ...AREA.hints.map(h => h.text), ...AREA.checklist.map(c => c.text)];
  for (const t of texts) for (const sentence of sentencesOf(t)){
    if (wordsIn(sentence).length) continue;
    const english = sentence.replace(/\{[^}]*\}/g, '').replace(names, '');
    for (const [w, e] of meanings){
      const said = new RegExp(`\\b${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|es)?\\b`, 'i');
      assert.doesNotMatch(english, said, `"${sentence}" says ${e} but writes no word as 汉字 (English): write {${w}}, which shows as ${w} (${e}), or just ${e} till you've caught it`);
    }
  }
});

test('tasks have different ids, and their arrows point at a character, a place on the map, the way to a place, or the nearest thing that sparkles', () => {
  const ids = AREA.tasks.map(t => t.id);
  assert.equal(new Set(ids).size, ids.length, 'two tasks have the same id');
  for (const t of AREA.tasks){
    assert.ok(t.text, `task ${t.id} needs text`);
    if (typeof t.arrow === 'string') assert.ok(AREA.characters.some(c => c.id === t.arrow), `task ${t.id} points at "${t.arrow}", who isn't a character`);
    else if (t.arrow && t.arrow.place) assert.ok(AREA.places[t.arrow.place], `task ${t.id} points the way to "${t.arrow.place}", which isn't a place`);
    else if (t.arrow && t.arrow.sparkle) assert.equal(t.arrow.sparkle, true, `task ${t.id}'s arrow says {sparkle:true}`);
    else if (t.arrow) assert.ok(onMap(t.arrow), `task ${t.id} points at ${t.arrow}, which is off the map`);
  }
});

test('chapters have names and titles, the checklist is in chapter order, any exit test is last, and every hint has text', () => {
  assert.ok(AREA.chapters.length && AREA.chapters.every(c => c.name && c.title), 'each chapter needs a name and a title');
  const ch = AREA.checklist.map(c => c.chapter || 0);
  assert.deepEqual(ch, [...ch].sort((a, b) => a - b), 'the checklist goes chapter by chapter');
  for (const c of ch) assert.ok(AREA.chapters[c], `the checklist has an item for chapter ${c}, which isn't in chapters`);
  assert.ok(AREA.checklist.filter(c => c.exitTest).length <= 1, 'one exit test at most');
  assert.ok(!AREA.checklist.some((c, i) => c.exitTest && i < AREA.checklist.length - 1), 'the exit test should be the last item on the checklist');
  for (const h of AREA.hints) assert.ok(h.text && h.if, 'each hint needs if and text');
});

test('bubbles are for characters, and show ! or ?', () => {
  for (const [who, list] of Object.entries(AREA.bubbles)){
    assert.ok(AREA.characters.some(c => c.id === who), `bubbles for "${who}", who isn't a character`);
    for (const b of list) assert.ok(['!', '?'].includes(b.show), `${who}'s bubble shows "${b.show}"; it can show ! or ?`);
  }
});

test('intro captions are in time order, each with its Chinese and English (its words are checked with every sentence)', () => {
  AREA.intro.forEach((c, i) => {
    assert.ok(c.zh && c.en, `intro caption ${i + 1} needs its Chinese (zh, words with spaces between) and English (en)`);
    if (i) assert.ok(c.at > AREA.intro[i - 1].at, `intro caption ${i + 1} comes before the one above it`);
  });
});

test('every scene has pictures, captions in time order (each with Chinese and English, teaching only a word it says), and a Settings button to watch it again (but a lesson’s, played after it, or one you see again where it is)', () => {
  const afterLessons = (AREA.lessons || []).flatMap(l => Object.values(l.scenes || {}));
  const legends = [AREA.legend, ...Object.values(AREA.places || {}).map(p => p.legend || {})];
  const onMap = legends.flatMap(l => Object.values(l)).flatMap(t => (t.onLook || []).flatMap(p => p.do)).map(s => s.scene).filter(Boolean);   // (A at something on the map plays it, such as the lookout's view)
  for (const [id, sc] of Object.entries(AREA.scenes || {})){
    assert.ok(get(`typeof SCENE_ART[${JSON.stringify(sc.art || id)}] === 'function'`), `the ${id} scene needs its pictures in SCENE_ART (js/draw.js), named by its art or its id`);
    if (afterLessons.includes(id)) assert.ok(!sc.watch, `the ${id} scene is played after a lesson: it doesn't need a button in Settings`);
    else if (onMap.includes(id)) assert.ok(!sc.watch, `the ${id} scene is played by A at something on the map, any time: it doesn't need a button in Settings`);
    else assert.ok(sc.watch && sc.when, `the ${id} scene needs watch (its button in Settings) and when (once it's been seen)`);
    sc.captions.forEach((c, i) => {
      assert.ok(c.zh && c.en, `the ${id} scene's caption ${i + 1} needs its Chinese and English`);
      if (i) assert.ok(c.at > sc.captions[i - 1].at, `the ${id} scene's caption ${i + 1} comes before the one above it`);
      if (c.teach) assert.ok(c.zh.split(' ').includes(c.teach) && collectible.includes(c.teach), `the ${id} scene's caption ${i + 1} teaches ${c.teach}, which it should say, and you should be able to collect`);
    });
  }
});

test('every word you can collect has an example sentence for its page', () => {
  const inSentence = w => [...Object.values(AREA.lines), ...AREA.story].some(s => s.zh.split(' ').includes(w));
  const built = w => [...Object.values(AREA.requests).flatMap(asked), ...(AREA.shop ? AREA.shop.items : []), ...(AREA.wardrobe || [])].some(b => b.sentence.split(' ').includes(w));
  for (const [w, e] of Object.entries(AREA.examples)){
    assert.ok(collectible.includes(w), `there's an example for ${w}, which isn't a word you can collect in ${where}`);
    assert.ok(e.zh.split(' ').includes(w), `the example for ${w} doesn't use ${w}: "${e.zh}"`);
    assert.ok(e.en, `the example for ${w} has no English`);
    assert.ok(!inSentence(w), `${w} is already in a line or the story, so it doesn't need an example`);
  }
  for (const w of collectible.filter(w => !BANK[w].phrase)) assert.ok(inSentence(w) || AREA.examples[w] || built(w), `${w} has no example: add one to examples in the area file (checked first)`);   // phrases are used by replying
});

test('every word you only hear is used in a sentence somewhere', () => {
  const used = new Set([
    ...sentences.flatMap(([, s]) => s.zh.split(' ')),
    ...Object.values(AREA.requests).flatMap(asked).flatMap(r => r.sentence.split(' ')),
    ...(AREA.shop ? AREA.shop.items.flatMap(i => i.sentence.split(' ')) : []),
    ...(AREA.wardrobe || []).flatMap(c => c.sentence.split(' '))
  ]);
  for (const w of Object.keys(BANK).filter(w => !BANK[w].area)) assert.ok(used.has(w), `${w} is in the word bank, but no sentence uses it: use it or remove it`);
});

test('replies after requests and the shop are phrases you can learn here', () => {
  const isPhrase = p => BANK[p] && BANK[p].phrase && collectible.includes(p);
  for (const [id, r] of Object.entries(AREA.requests)) for (const k of ['thanksReply', 'wrongReply']) if (r[k]) assert.ok(isPhrase(r[k]), `request ${id}: ${k} ${r[k]} isn't a phrase you can learn here`);
  if (AREA.shop) for (const k of ['reply', 'no']) if (AREA.shop[k]) assert.ok(isPhrase(AREA.shop[k]), `shop: ${k} ${AREA.shop[k]} isn't a phrase you can learn here`);
});


test('no word tiles anywhere: sentences are completed by filling a gap, never put in order', () => {
  const things = [...Object.values(AREA.requests).flatMap(asked), ...(AREA.shop ? AREA.shop.items : []), ...(AREA.wardrobe || [])];
  for (const b of things) for (const old of ['build', 'buildEn', 'extraTile', 'buildPrompt']) assert.ok(!(old in b), `"${old}" is from word tiles: use sentence, sentenceEn and gap`);
});

test('every enemy is a collectible word with a picture and a map sprite, attacking from words with pictures', () => {
  for (const [id, e] of Object.entries(AREA.enemies)){
    assert.ok(collectible.includes(e.word) && BANK[e.word].pic, `${id}'s word ${e.word} should be a word you can collect, with a picture`);
    assert.ok(PICTURES[e.word] && MAP_SPRITES[e.word], `${e.word} needs a picture and a map sprite`);
    assert.ok(e.health >= 1 && e.hits >= 1 && e.attacks.length >= 3, `${id} needs health, how much it hits for, and at least 3 places to attack from`);
    assert.ok(e.health / AREA.battles.hits >= 2 && e.health / AREA.battles.hits <= (e.boss ? 8 : 5), `${id}: a fight is set by how many hits it takes (2 to 5 for a wild creature, more for a boss)`);
    for (const w of e.attacks) assert.ok(collectible.includes(w) && BANK[w].pic, `${id} attacks from ${w}, which should be a word with a picture`);
  }
  for (const [, t] of allLegend.filter(([, t]) => t.wild)) for (const id of t.wild) assert.ok(AREA.enemies[id], `wild ground has ${id}, which isn't one of the enemies`);
});

test('food: each says what it does, how many you can carry, and heals, helps or gives you energy; fruit trees give food', () => {
  for (const [w, f] of Object.entries(AREA.food || {})){
    assert.ok(collectible.includes(w), `${w} is a word you can collect here`);
    assert.ok(f.does && f.carry > 0 && [f.heal > 0, f.helps === true, f.fast > 0].filter(Boolean).length === 1, `${w}: does, carry, and heal, helps or fast (one thing each)`);
  }
  for (const [, t, from] of allLegend) if (t.pick) assert.ok((AREA.food || {})[t.pick.item], `picking at ${from} gives ${t.pick.item}, which isn't food`);
});

test('each lesson series is one the engine can give, teaching words you can collect, with lines that exist', () => {
  const KINDS = get('Object.keys(LESSON_KINDS)');
  for (const l of AREA.lessons || []){
    assert.ok(KINDS.includes(l.kind), `the lessons ${l.id} are of kind "${l.kind}"; the kinds are ${KINDS.join(', ')}`);
    assert.ok(l.start && AREA.characters.some(c => c.id === l.by), `the lessons ${l.id} need start, and by: the character who teaches them`);
    for (const w of l.words){
      assert.ok(collectible.includes(w), `the lessons ${l.id} teach ${w}, which isn't a word you can collect in ${where}`);
      if (l.teach) assert.ok(AREA.lines[l.teach[w]] && AREA.lines[l.teach[w]].zh.split(' ').includes(w), `the lessons ${l.id}: the line teaching ${w} should be a line with ${w} in it`);
    }
    for (const t of l.things || []) assert.ok(collectible.includes(t.word) && BANK[t.word].pic && AREA.lines[t.ask] && AREA.lines[t.ask].zh.split(' ').includes(t.word), `the lessons ${l.id}: ${t.word} should be a word with a picture, asked about in a line with it`);
    if (l.kind === 'count') assert.deepEqual(l.words, get('COUNTING').slice(get('COUNTING').indexOf(l.words[0]), get('COUNTING').indexOf(l.words[0]) + l.words.length), 'numbers are learned in order');
    if (l.kind === 'paint'){
      const PARTS = get('SCHOOL_PARTS');
      for (const w of l.words) assert.ok(BANK[w].category === 'colours' && get(`!!PAINT[${JSON.stringify(w)}]`), `the lessons ${l.id}: ${w} should be a colour, with its paint in PAINT (js/art.js)`);
      for (const [w, part] of Object.entries(l.paint || {})){   // (a colour that paints a part of the school, such as red the lanterns)
        assert.ok(l.words.includes(w) && PARTS.includes(part), `the lessons ${l.id}: ${w} should paint a part of the school (paint), one of ${PARTS.join(', ')}`);
        const sc = (AREA.scenes || {})[(l.scenes || {})[w]];
        assert.ok(sc && sc.paints === w, `the lessons ${l.id}: ${w} needs its scene (scenes), painting with it (paints)`);
      }
      for (const w of Object.keys(l.scenes || {})) assert.ok((l.paint || {})[w], `the lessons ${l.id}: ${w} has a scene, but paints nothing`);
      assert.equal(new Set(Object.values(l.paint || {})).size, Object.keys(l.paint || {}).length, `the lessons ${l.id}: each colour paints a different part`);
    }
  }
});

test('a place’s own songs, backdrop, gloom and sounds, and every sound a step plays, are ones the game has', () => {
  const SONGS = get('Object.keys(SONGS)'), SFX = get('Object.keys(SFX)');
  for (const [id, p] of Object.entries(AREA.places)){
    if (p.music) assert.ok(SONGS.includes(p.music), `${id}'s music, ${p.music}, isn't one of the songs (js/sound.js)`);
    if (p.battleMusic) assert.ok(SONGS.includes(p.battleMusic), `${id}'s battle music, ${p.battleMusic}, isn't one of the songs (js/sound.js)`);
    if (p.backdrop) assert.ok(get('Object.keys(BACKDROPS)').includes(p.backdrop), `${id}'s backdrop, ${p.backdrop}, isn't one of the backdrops (js/art.js)`);
    const parts = (p.sounds || []).filter(s => typeof s !== 'string');   // (sounds that change from one part of the place to another)
    for (const s of (p.sounds || []).flatMap(s => typeof s === 'string' ? [s] : s.sounds)) assert.ok(SFX.includes(s), `${id}'s sound ${s} isn't one of the sound effects (js/sound.js)`);
    if (parts.length){
      assert.equal(parts.length, p.sounds.length, `${id}'s sounds: all of them by part of the place, or none`);
      const whole = parts.filter(q => !q.cols && !q.if);   // (rows right across, always: some columns, or while the story says, go before them)
      whole.forEach((q, i) => assert.equal(q.rows[0], i ? whole[i - 1].rows[1] + 1 : 0, `${id}'s sounds: each part starts where the one before it ends, from the top`));
      assert.equal(whole[whole.length - 1].rows[1], p.map.length - 1, `${id}'s sounds: the parts go right down to its bottom row`);
      parts.forEach((q, i) => { if (q.cols || q.if) assert.ok(parts.slice(i + 1).some(w => !w.cols && !w.if && w.rows[0] <= q.rows[0] && w.rows[1] >= q.rows[1]), `${id}'s sounds: a part for some columns, or with an if, needs a part for the whole rows after it`); });
    }
    if (p.gloom){
      assert.ok(p.gloom.deep > p.gloom.open && p.gloom.open >= 0 && p.gloom.deep < 1, `${id}'s gloom: deep (${p.gloom.deep}) should be darker than open (${p.gloom.open}), and never black`);
      for (const k of Object.keys(p.gloom)) assert.ok(['deep', 'open', 'mist', 'eyes'].includes(k), `${id}'s gloom: "${k}" isn't one of its settings`);
    }
  }
  for (const [where, s] of allSteps().filter(([, s]) => s.sound)) assert.ok(SFX.includes(s.sound), `${where}: there's no sound ${s.sound} (js/sound.js)`);
});

test('writing in the world is real Chinese, in characters drawn for it: the school’s sign, the cave’s tablet, the blackboard, the gate of heaven', () => {
  const g = loadGame({save: {version: 24, started: true}});
  const HANZI = JSON.parse(g.run('JSON.stringify(HANZI)'));
  for (const [c, rows] of Object.entries(HANZI)){
    assert.ok(rows.length >= 7 && rows.every(r => r.length === rows[0].length && /^[#.]+$/.test(r)), `${c} (js/art.js): rows of # and ., all as long, at least 7 tall`);
    assert.ok(rows.join('').includes('#'), `${c} has ink`);
  }
  g.run("globalThis.__ink = []; write({fillRect(x, y){ __ink.push([x, y]); }}, '学', 10, 20, '#000')");
  const where = HANZI['学'].flatMap((row, y) => [...row].flatMap((c, x) => c === '#' ? [[10 + x, 20 + y]] : []));
  assert.deepEqual(JSON.parse(g.run('JSON.stringify(__ink)')), where, 'write() puts ink just where the character’s # are');
  // what each thing with writing on it writes, as it's drawn
  g.run(`globalThis.__wrote = []; const write0 = write; write = (g, text, ...rest) => { __wrote.push(text); return write0(g, text, ...rest); };
    const pen = {fillRect(){}, save(){}, restore(){}, beginPath(){}, rect(){}, clip(){}};
    schoolHouse(pen, 0, 0, 128, 64, {walls: 1, roof: 1, sign: true});
    blackboard(pen, {x: 4, y: 0, w: 7, h: 2});
    const sofar = __wrote.length; S.pos = {place: 'cave', x: 8, y: 8, dir: 'down'}; placePlayer(); __wrote.length = sofar;   // (going in draws it too)
    for (const o of mapObjects()) if (o.look === 'tablet') OBJECT_ART.tablet(pen, o);
    drawScene(13.4, 0, 1);`);
  const wrote = JSON.parse(g.run('JSON.stringify(__wrote)'));
  assert.deepEqual(wrote, ['学校', '一二三四五六七八九十', '水帘洞', '南天门'], 'the school’s sign, the blackboard, the cave’s tablet, the gate of heaven in the opening');
  const IN_THE_BOOK = {'南天门': 'the Southern Gate of Heaven, which the gods came out of to look at the light from your eyes'};
  for (const text of wrote){
    for (const c of text) assert.ok(HANZI[c], `${c} is drawn in HANZI (js/art.js)`);
    assert.ok(BANK[text] || [...text].every(c => BANK[c]) || Object.values(AREA.places).some(p => p.name.zh === text) || IN_THE_BOOK[text], `${text}: a word, words, or a name (a place’s, or one in the book), never made up`);
  }
});

test('a task that points its arrow at someone gives them a ! or ? too, so you can see who to go to', () => {
  const tasks = AREA.tasks.filter(t => typeof t.arrow === 'string');
  let checked = 0;
  for (const t of tasks){
    const g = loadGame({save: {version: 29, started: true, w: {}, areas: {1: {elder: 2}}}});   // (you've met the old monkey: the story starts there)
    // the game as the task's if says, each condition in its simplest form (words caught, counters' words caught, values)
    const ready = g.run(`(() => {
      const c = ${JSON.stringify(t.if)}, h = here(); h.holding = h.holding || {};
      for (const [k, v] of Object.entries(c)){
        const n = typeof v === 'object' && v !== null ? (v.atLeast ?? v.below - 1) : v;
        if (k === 'new') delete S.w[v];
        else if (k === 'knows') S.w[v] = {lv: 1, ok: 0};
        else if (k === 'holding') for (const [id, want] of Object.entries(v)) h.holding[id] = want === true ? 'it' : want;
        else if (AREA.counters[k]){ const cn = AREA.counters[k]; if (cn.count !== 'known') return false; cn.words.slice(0, n).forEach(w => { S.w[w] = {lv: 1, ok: 0}; }); }
        else h[k] = n;
      }
      return matches(c);
    })()`);
    if (!ready) continue;   // (a condition too involved to set up simply)
    checked++;
    const show = g.run(`((AREA.bubbles[${JSON.stringify(t.arrow)}] || []).find(b => matches(b.if)) || {}).show`);
    assert.ok(show === '!' || show === '?', `the task "${t.text}" points at ${t.arrow}, who has no ! or ? then`);
  }
  assert.ok(checked >= 12, `checked ${checked} of the ${tasks.length} tasks that point at someone`);
});
