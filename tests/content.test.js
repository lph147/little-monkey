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
const LOOKS = get('Object.keys(LOOKS)'), ACTIONS = get('Object.keys(ACTIONS)'), STEPS = get('Object.keys(STEPS)');   // what the engine can draw and do
const STEP_OPTIONS = get('STEP_OPTIONS'), COUNTS = get('Object.keys(COUNTS)');
const remembered = [...Object.keys(AREA.progress), ...Object.keys(AREA.requests), 'done'];   // what the area keeps in the save
const placeholders = text => [...String(text).matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
const allSteps = () => [
  ...Object.entries(AREA.talk).flatMap(([who, parts]) => parts.flatMap((p, i) => p.do.map(s => [`${who}'s talk, part ${i + 1}`, s, who]))),
  ...AREA.events.flatMap((e, i) => e.do.map(s => [`event ${i + 1}`, s, null])),
  ...AREA.begin.map(s => ['begin', s, null])
];
const allIfs = () => [
  ...Object.entries(AREA.talk).flatMap(([who, parts]) => parts.filter(p => p.if).map((p, i) => [`${who}'s talk`, p.if])),
  ...AREA.events.map((e, i) => [`event ${i + 1}`, e.if]),
  ...AREA.tasks.map(t => [`task ${t.id}`, t.if]),
  ...AREA.hints.map((h, i) => [`hint ${i + 1}`, h.if]),
  ...AREA.checklist.map((c, i) => [`checklist item ${i + 1}`, c.done]),
  ...Object.entries(AREA.bubbles).flatMap(([who, list]) => list.map(b => [`${who}'s bubble`, b.if])),
  ...AREA.sparkles.filter(s => s.if).map(s => [`the sparkle for ${s.word}`, s.if]),
  ['animalsAppear', AREA.animalsAppear]
];
const okPlaceholder = w => BANK[w] || AREA.counters[w] || (w.startsWith('holding:') && AREA.requests[w.slice(8)]);
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
  for (const {word: w, at} of AREA.sparkles){
    assert.ok(collectible.includes(w), `${w} sparkles, but it isn't a word you can collect in ${where}`);
    assert.ok(onMap(at), `the sparkle for ${w} at ${at} is off the map`);
  }
});

test('the area has a name, a way out, and somewhere for animals to hide', () => {
  const n = AREA.name;
  assert.ok(n && n.zh && n.py && n.en, 'the area needs a name with zh, py and en');
  assert.ok(AREA.map.some(row => [...row].some(ch => (AREA.legend[ch] || {}).action === 'caveDoor')), 'the map needs a tile whose action is caveDoor (the way out)');
  const hiding = Object.values(AREA.legend).filter(t => t.animals);
  assert.ok(hiding.length && hiding.every(t => collectible.includes(t.word)), 'some legend tile needs animals:true and a word, such as 草');
  for (const k of ['notReady', 'ready', 'tryAgain', 'passButton', 'failButton', 'done', 'notBuilt']) assert.ok(AREA.exit[k], `exit needs ${k}`);
  const back = AREA.exit.returnTo;
  assert.ok(onMap([back.x, back.y]) && canWalk([back.x, back.y]), `exit.returnTo ${back.x},${back.y} isn't a walkable tile`);
  assert.ok(['up', 'down', 'left', 'right'].includes(back.facing), 'exit.returnTo needs facing');
  assert.ok(['up', 'down', 'left', 'right'].includes(AREA.start.facing), 'start needs facing');
});

test('the story ending has a title, a reward and text', () => {
  const e = AREA.storyEnd;
  assert.ok(e.title && e.reward >= 0 && e.text.length, 'storyEnd needs title, reward and text');
});

test('fish jump out of water', () => {
  for (const at of AREA.fish){
    assert.ok(onMap(at) && (AREA.legend[tile(at)] || {}).look === 'water', `the fish at ${at} isn't in water`);
  }
});

test('characters are drawn as monkeys (with colours) or birds, and sparkle on real words', () => {
  for (const c of AREA.characters){
    assert.ok(c.look === undefined || ['monkey', 'bird'].includes(c.look), `${c.id} has look "${c.look}"; it can be monkey or bird`);
    if (!c.look || c.look === 'monkey') assert.ok(c.palette, `${c.id} is a monkey, so it needs a palette`);
    if (c.word) assert.ok(collectible.includes(c.word), `${c.id}'s word ${c.word} isn't a word you can collect in ${where}`);
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
  for (const [id, r] of Object.entries(AREA.requests)){
    assert.ok(AREA.characters.some(c => c.id === r.from), `request ${id}: from "${r.from}" isn't a character`);
    for (const w of [r.wants, r.verb]) assert.ok(collectible.includes(w), `request ${id}: ${w} isn't a word you can collect in ${where}`);
    for (const k of ['ask', 'offer', 'thanks']) assert.ok(AREA.lines[r[k]], `request ${id}: ${k} "${r[k]}" isn't one of the lines`);
    if (r.wrong) assert.ok(AREA.lines[r.wrong], `request ${id}: wrong "${r.wrong}" isn't one of the lines`);
    const build = r.build.split(' ');
    assert.ok(build.includes(r.wants) && build.includes(r.verb), `request ${id}: the sentence "${r.build}" should use ${r.wants} and ${r.verb}`);
    for (const w of [...build, r.extraTile]) assert.ok(BANK[w], `request ${id}: ${w} isn't in the word bank`);
    for (const f of r.firstTeach) assert.ok(BANK[f.word] && f.note, `request ${id}: firstTeach needs words from the bank, each with a note`);
    assert.ok(r.asked && r.buildPrompt && r.reward > 0, `request ${id} needs asked, buildPrompt and a reward`);
  }
});

test('everything you can gather is for a request, and the wrong thing has a line', () => {
  for (const [ch, t] of Object.entries(AREA.legend)){
    if (!t.gather) continue;
    const r = AREA.requests[t.gather.for];
    assert.ok(r, `legend "${ch}" gathers for "${t.gather.for}", which isn't a request`);
    assert.ok(t.gather.message, `legend "${ch}": gather needs a message`);
    if (t.gather.item !== r.wants) assert.ok(r.wrong && r.wrongMessage, `request ${t.gather.for} needs wrong and wrongMessage, because legend "${ch}" gives ${t.gather.item}`);
  }
});

test('every character has a talk script, and every script is for a character', () => {
  for (const c of AREA.characters) assert.ok(AREA.talk[c.id] && AREA.talk[c.id].length, `${c.id} has nothing in talk`);
  for (const who of Object.keys(AREA.talk)) assert.ok(AREA.characters.some(c => c.id === who), `talk has a script for "${who}", who isn't a character`);
});

test('every if only checks things the game knows about', () => {
  const keys = [...remembered, ...Object.keys(AREA.counters), 'new', 'knows', 'holding', 'ready'];
  for (const [where, cond] of allIfs()){
    for (const [k, v] of Object.entries(cond)){
      assert.ok(keys.includes(k), `${where} checks "${k}"; it can check ${keys.join(', ')}`);
      if (k === 'new' || k === 'knows') assert.ok(collectible.includes(v), `${where}: ${v} isn't a word you can collect in ${where}`);
      if (k === 'holding') for (const id of Object.keys(v)) assert.ok(AREA.requests[id], `${where} checks holding for "${id}", which isn't a request`);
    }
  }
});

test('every step does one thing, with settings that exist, using real lines and words', () => {
  for (const [where, s, who] of allSteps()){
    const actions = Object.keys(s).filter(k => STEPS.includes(k));
    assert.equal(actions.length, 1, `${where}: each step needs exactly one of ${STEPS.join(', ')}, not ${JSON.stringify(s)}`);
    const a = actions[0];
    for (const k of Object.keys(s)) if (k !== a) assert.ok((STEP_OPTIONS[a] || []).includes(k), `${where}: "${k}" isn't a setting for ${a}`);
    if (a === 'say'){
      assert.ok(AREA.lines[s.say], `${where}: "${s.say}" isn't one of the lines`);
      if (s.teach) assert.ok(AREA.lines[s.say].zh.split(' ').includes(s.teach), `${where}: line "${s.say}" doesn't contain ${s.teach}, so it can't be taught there`);
    }
    if (a === 'newWord' || a === 'card') assert.ok(collectible.includes(s[a]), `${where}: ${s[a]} isn't a word you can collect in ${where}`);
    if (a === 'set') for (const k of Object.keys(s.set)) assert.ok(remembered.includes(k), `${where} sets "${k}", which the area doesn't remember`);
    if (a === 'request') assert.ok(AREA.requests[s.request] && AREA.requests[s.request].from === who, `${where}: "${s.request}" isn't a request from ${who}`);
    if (a === 'wordGame') assert.ok(s.wordGame.ask && s.wordGame.notYet && collectible.includes(s.wordGame.word), `${where}: wordGame needs ask, notYet and a word`);
  }
});

test('every line is said somewhere', () => {
  const said = new Set([
    ...allSteps().filter(([, s]) => s.say).map(([, s]) => s.say),
    ...Object.values(AREA.requests).flatMap(r => [r.ask, r.offer, r.thanks, r.wrong])
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
    ...Object.values(AREA.legend).map(t => t.gather && t.gather.message),
    ...AREA.tasks.flatMap(t => [t.id, t.text]), ...AREA.hints.map(h => h.text), ...AREA.checklist.map(c => c.text)
  ].filter(Boolean);
  for (const t of texts) for (const w of placeholders(t)) assert.ok(okPlaceholder(w), `"${t}" has {${w}}, which isn't a word in the word bank, a counter or holding:<a request>`);
});

test('tasks have different ids, and their arrows point at a character or a place on the map', () => {
  const ids = AREA.tasks.map(t => t.id);
  assert.equal(new Set(ids).size, ids.length, 'two tasks have the same id');
  for (const t of AREA.tasks){
    assert.ok(t.text, `task ${t.id} needs text`);
    if (typeof t.arrow === 'string') assert.ok(AREA.characters.some(c => c.id === t.arrow), `task ${t.id} points at "${t.arrow}", who isn't a character`);
    else if (t.arrow) assert.ok(onMap(t.arrow), `task ${t.id} points at ${t.arrow}, which is off the map`);
  }
});

test('the checklist ends with the exit test, and every hint has text', () => {
  assert.equal(AREA.checklist.filter(c => c.exitTest).length, 1, 'the checklist needs exactly one exitTest item');
  assert.ok(AREA.checklist[AREA.checklist.length - 1].exitTest, 'the exit test should be the last item on the checklist');
  for (const h of AREA.hints) assert.ok(h.text && h.if, 'each hint needs if and text');
});

test('bubbles are for characters, and show ! or ?', () => {
  for (const [who, list] of Object.entries(AREA.bubbles)){
    assert.ok(AREA.characters.some(c => c.id === who), `bubbles for "${who}", who isn't a character`);
    for (const b of list) assert.ok(['!', '?'].includes(b.show), `${who}'s bubble shows "${b.show}"; it can show ! or ?`);
  }
});

test('intro captions are in time order, with Chinese, pinyin and English', () => {
  AREA.intro.forEach((c, i) => {
    assert.ok(c.zh && c.py && c.en, `intro caption ${i + 1} needs zh, py and en`);
    if (i) assert.ok(c.at > AREA.intro[i - 1].at, `intro caption ${i + 1} comes before the one above it`);
  });
});
