// Names that stand out in English text (decided 9 November 2026, the four ideas plan, as in Dredge): a Chinese word you
// know green, as in sentences (tap it to hear it, on the Tasks page); people gold; places blue; all bold. Only names, from
// the game's own lists of who's who and where's where, so no text needs rewriting; never the English under a Chinese line.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadGame} = require('./fake-browser');

const knowing = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
function game(save = {}){
  const g = loadGame({dom: true, save: {version: 42, started: true, ...save}});
  g.run("mode = 'play'; placePlayer(); globalThis.__said = []; say = w => { __said.push(w); }");
  return {g, sheet: g.el('#sheet'), run: code => g.run(code), hl: text => g.run(`hlText(${JSON.stringify(text)})`)};
}
const spans = (html, kind) => [...html.matchAll(new RegExp(`<span class="hl-${kind}"[^>]*>([^<]*)</span>`, 'g'))].map(m => m[1]);

test('a Chinese word, as your tasks write one you know, green, its English after it plain; people gold; places blue', () => {
  const {hl} = game();
  const h = hl('Give the 水 (water) to the thirsty monkey, by the riverside');
  assert.equal(h, 'Give the <span class="hl-zh" data-say="水">水</span> (water) to the <span class="hl-who">thirsty monkey</span>, by the <span class="hl-where">riverside</span>');
  assert.deepEqual(spans(hl('Your 老师 (teacher) has an exam for you at school'), 'who'), [], 'its English isn’t looked at for names: 老师 (teacher)');
  assert.deepEqual(spans(hl('Two of something is 两: counting is still 二: 一，二，三！'), 'zh'), ['两', '二', '一，二，三'], 'Chinese on its own in a note, too');
  assert.match(hl('Two of something is 两.'), /data-say="两"/, 'a word, to tap and hear');
  assert.doesNotMatch(hl('一，二，三！'), /data-say/, 'a count isn’t one word');
});

test('only names: “monkey” on its own, “the troop” or “the village” stay plain; the longest first; people in the plural too', () => {
  const {hl} = game();
  assert.equal(hl('The troop’s monkey goes to the village.'), 'The troop’s monkey goes to the village.');
  assert.deepEqual(spans(hl('Find the little monkeys: the big monkey knows'), 'who'), ['little monkeys', 'big monkey']);
  assert.deepEqual(spans(hl('The meadow, the pine wood and Flower Fruit Mountain'), 'where'), ['meadow', 'pine wood', 'Flower Fruit Mountain'], 'the area too, a name');
  const two = game({area: 2, areas: {1: {chapter: 1, done: true}, 2: {chapter: 1}}});
  assert.deepEqual(spans(two.hl('Go to the master’s room'), 'where'), ['master’s room'], 'a place, not the master');
  assert.deepEqual(spans(two.hl('The master wants to see you, and the fishermen'), 'who'), ['master', 'fishermen']);
  assert.equal(two.hl('Sail across the sea'), 'Sail across the sea', 'not an area’s English that isn’t a name');
});

test('the rest of the text is safe: < and & show as written', () => {
  const {hl} = game();
  assert.equal(hl('a < b & c'), 'a &lt; b &amp; c');
});

test('in your tasks, with a tap on a green word saying it (not choosing its task); in the checklist, what’s left, what’s done plain', () => {
  const {sheet, run} = game({w: knowing(['石头', '你好', '山', '水', '河', '桃子', '动物']), areas: {1: {elder: 2, meadowCheck: 1, hungry: 'asked', thirsty: 'asked', holding: {}, gate: false}}, pos: {place: 'meadow', x: 13, y: 6, dir: 'up'}});
  run('tasksPage(() => {})');
  const tasks = sheet.querySelector('.tasks');
  assert.ok(tasks.querySelectorAll('.hl-who').length > 0, 'people in your tasks');
  const word = tasks.querySelector('.hl-zh[data-say]');
  assert.ok(word, 'a word you know');
  run("globalThis.__followed = 0; const f = followTask; followTask = (...a) => { __followed++; return f(...a); }");
  word.onclick({stopPropagation(){}});
  assert.deepEqual(JSON.parse(run('JSON.stringify(__said)')), [word.dataset.say], 'tapping it says it');
  assert.equal(run('__followed'), 0, 'and doesn’t choose its task');
  run("S.areas[1].hungry = 'done'; tasksPage(() => {}, 'list')");
  const done = sheet.querySelectorAll('.checklist li.done');
  assert.ok(done.every(li => !li.querySelector('.hl-zh, .hl-who, .hl-where')), 'what’s done stays plain');
});

test('in messages and notes; never the English under a Chinese line, which is a translation', () => {
  const {g, run} = game();
  run("toast('New task: Find some fruit for the hungry monkey')");
  assert.match(run("document.querySelector('#saybox').innerHTML"), /for the <span class="hl-who">hungry monkey<\/span>/);
  run("S.typed = false; showNarration('Look for the old monkey in the meadow.', true, {note: true})");
  assert.deepEqual(g.el('#talk').querySelectorAll('.hl-who, .hl-where').map(s => s.textContent), ['old monkey', 'meadow']);
  run("talkNext(); showDialog(speaker('hungry'), {t: ['老', '猴子', '在', '河', '边', '。'], en: 'The old monkey is by the river.'})");
  assert.equal(g.el('#talk').querySelector('.sentence-en').querySelectorAll('.hl-zh, .hl-who, .hl-where').length, 0, 'a translation, as it is');
});

test('the colours: green as in sentences, people and places their own, gold and blue in both themes, all bold', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'game.css'), 'utf8');
  assert.match(css, /\.hl-zh\{color:var\(--jade\);font-weight:700\}/);
  assert.match(css, /\.hl-who\{color:var\(--who\);font-weight:700\}/);
  assert.match(css, /\.hl-where\{color:var\(--where\);font-weight:700\}/);
  assert.equal((css.match(/--who:#[0-9A-F]{6}; --where:#[0-9A-F]{6};/g) || []).length, 3, 'light, and dark (both ways it’s chosen)');
});

test('nothing in either area is coloured by mistake: each person and place coloured in its tasks, checklist, story and messages is a name', () => {
  for (const area of [1, 2]){
    const {run} = game(area === 2 ? {area: 2, areas: {1: {chapter: 1, done: true}, 2: {chapter: 1}}} : {});
    const found = JSON.parse(run(`(() => {
      const texts = [], add = t => { if (typeof t === 'string') texts.push(t); else if (Array.isArray(t)) t.forEach(x => add(x && x.text !== undefined ? x.text : x)); };
      AREA.tasks.forEach(t => add(t.text)); AREA.checklist.forEach(c => add(c.text)); AREA.parts.forEach(p => { add(p.text); add(p.story); add(p.now); }); add(AREA.goal);
      const walk = v => { if (!v || typeof v !== 'object') return; if (Array.isArray(v)) return v.forEach(walk); if (typeof v.message === 'string') texts.push(v.message); Object.values(v).forEach(walk); };
      walk(AREA.talk); walk(AREA.events);
      const out = new Set();
      for (const t of texts){ let h; try { h = hlText(fill(t, false, true)); } catch(e) { continue; } for (const m of h.matchAll(/<span class="hl-(who|where)">([^<]*)<\\/span>/g)) out.add(m[2].toLowerCase()); }
      return JSON.stringify([...out]);
    })()`));
    assert.ok(found.length > 10, `area ${area}: plenty of names`);
    for (const plain of ['monkey', 'monkeys', 'troop', 'village', 'mountain', 'cave', 'sea', 'river', 'town', 'you'])
      assert.ok(!found.includes(plain), `area ${area}: “${plain}” isn’t a name`);
  }
});
