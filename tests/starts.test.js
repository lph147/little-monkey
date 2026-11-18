// Starting at any part of the story, for testing (Start at…, js/starts.js; decided 17 November 2026): a switch players
// never see, five taps on the version number; then an empty game can start just before any part, from the games the
// playthrough tests keep (tools/starts/, made by npm run starts: tests/starts.js).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadGame} = require('./fake-browser');
const {DIR} = require('./starts');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const POINTS = get(loadGame(), 'startPoints().map(p => ({area: p.area, i: p.i, file: p.file, name: p.chapter.name + ", " + p.name + ": " + p.title}))');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('a start for every part of the story but the very first (a new game), and nothing else in tools/starts/', () => {
  assert.equal(POINTS[0].file, null, 'the meadow, the very first part: a new game');
  const files = POINTS.filter(p => p.file).map(p => path.basename(p.file)).sort();
  assert.deepEqual(fs.readdirSync(DIR).sort(), files, 'run npm run starts to make them again');
  assert.ok(POINTS.length >= 39, 'every part, of every area');
});

for (const p of POINTS.filter(p => p.file)) test(`starting at ${p.name}: a game just before it begins, there to play`, () => {
  const text = read(p.file), g = loadGame({dom: true, save: text}), s = JSON.parse(text);
  assert.deepEqual(get(g, `readSaveFile(${JSON.stringify(text)}).error || null`), null, 'it reads as a save');
  const area = s.area || 1, prev = POINTS[POINTS.indexOf(p) - 1];
  assert.equal(area, p.i ? p.area : prev.area, p.i ? 'in its own area' : 'in the area before (it begins as you sail or dive)');
  g.run("mode = 'play'; save = () => {}; continueGame(SLOT)");
  assert.equal(get(g, 'here().part'), prev.i, 'just before it begins: the part before it, reached');
  assert.ok(get(g, 'walkable(pl.x, pl.y) && !exitAt(pl.x, pl.y)'), `standing somewhere you can walk (${get(g, '[PLACE, pl.x, pl.y]')})`);
  assert.ok(get(g, 'getTasks().some(t => t.main) || !/coming soon/.test(tasksHint())'), 'with a main task, or a hint saying what’s next (a lesson ready, at school)');
});

// The title screen and an empty game's card, with a start fetched as the web would send it
function title(){
  const g = loadGame({dom: true});
  g.run("globalThis.__fetched = []; fetch = f => { __fetched.push(f); return Promise.resolve(__files[f] ? {ok: true, text: () => Promise.resolve(__files[f])} : {ok: false, status: 404}); }; globalThis.__files = {}");
  g.run('save = () => { localStorage.setItem(slotKey(SLOT), JSON.stringify(S)); }');
  return g;
}
const buttons = g => g.el('#sheet').querySelectorAll('button');
const press = (g, label) => { const b = buttons(g).find(b => b.textContent.replace(/\s+/g, ' ').trim().startsWith(label)); assert.ok(b, `a button: ${label}`); b.click(); };
async function settle(g){ for (let i = 0; i < 50; i++){ await new Promise(r => setImmediate(r)); g.flush(); } }

test('five taps on the version number turn testing on, for this device, and five more turn it off', () => {
  const g = title();
  assert.equal(get(g, "$('#version').onclick === tapVersion"), true, 'the version number, on the title screen');
  g.run('slotCard(2)');
  assert.ok(!buttons(g).some(b => /Start at/.test(b.textContent)), 'an empty game’s card: New game and Load from a file, as players see it');
  for (let i = 0; i < 4; i++) g.run('tapVersion()');
  assert.equal(get(g, 'testing()'), false, 'four taps: nothing');
  g.run('tapVersion()');
  assert.equal(get(g, 'testing()'), true, 'five: testing is on');
  assert.equal(g.storage.get('xiaohouzi-v2-testing'), '1', 'kept for this device, not in a game');
  assert.match(get(g, "$('#version').textContent"), /testing/, 'the version number says so');
  g.run('slotCard(2)');
  assert.ok(buttons(g).some(b => /Start at/.test(b.textContent)), 'now an empty game can start at any part');
  for (let i = 0; i < 5; i++) g.run('tapVersion()');
  assert.equal(get(g, 'testing()'), false, 'five more: off');
  assert.doesNotMatch(get(g, "$('#version').textContent"), /testing/);
});

test('Start at…: the chapters, then a chapter’s parts; choosing one fills the empty game and plays on from there, with your settings', async () => {
  const g = title();
  g.run("localStorage.setItem(TESTING_KEY, '1'); S.sound = false; S.voiceSpeed = .8");   // (your settings: kept, as a new game keeps them)
  const p = POINTS.find(p => p.area === 1 && p.i === 4);   // (Chapter 1, part 1)
  g.run(`__files[${JSON.stringify(p.file)}] = ${JSON.stringify(read(p.file))}`);
  g.run('slotCard(2)'); press(g, 'Start at');
  assert.deepEqual(buttons(g).filter(b => b.dataset.k).map(b => b.querySelector('b').textContent), ['Prologue', 'Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5', 'Chapter 6'], 'the chapters, in order');
  press(g, 'Chapter 1');
  assert.deepEqual(buttons(g).filter(b => b.dataset.k).map(b => b.textContent.replace(/\s+/g, ' ').trim()), ['Part 1A new home ground', 'Part 2The school', 'Part 3Food for the feast', 'Part 4The feast', 'Part 5Setting sail'], 'its parts, as their cards name them');
  press(g, 'Part 1');
  await settle(g);
  assert.deepEqual(get(g, '__fetched'), [p.file], 'fetched only when it’s chosen');
  assert.deepEqual([get(g, 'SLOT'), get(g, 'mode'), get(g, 'here().part'), get(g, 'PLACE')], [2, 'play', 3, JSON.parse(read(p.file)).pos.place], 'Game 2, playing, just before Chapter 1 begins');
  assert.deepEqual([get(g, 'S.sound'), get(g, 'S.voiceSpeed')], [false, .8], 'with your settings');
  assert.ok(g.storage.get('xiaohouzi-v2-game2'), 'kept in Game 2');
});

test('the very first part is a new game; a part in another area loads the page again for it; and with no connection it says so', async () => {
  const g = title();
  g.run("localStorage.setItem(TESTING_KEY, '1'); globalThis.__new = []; newGame = n => { __new.push(n); }");
  g.run('slotCard(3)'); press(g, 'Start at'); press(g, 'Prologue'); press(g, 'Part 1');
  await settle(g);
  assert.deepEqual([get(g, '__new'), get(g, '__fetched')], [[3], []], 'the meadow: a new game in Game 3');
  const h = title(), five = POINTS.find(p => p.area === 3 && p.i === 0);
  h.run(`localStorage.setItem(TESTING_KEY, '1'); __files[${JSON.stringify(five.file)}] = ${JSON.stringify(read(five.file))}`);
  h.run('slotCard(2)'); press(h, 'Start at'); press(h, 'Chapter 5'); press(h, 'Part 1');
  await settle(h);
  assert.equal(h.reloads.count, 1, 'Chapter 5 begins in Area 2, at the iron bridge: the page loads again for it');
  assert.deepEqual(JSON.parse(h.session.get('xiaohouzi-v2-go')), {area: 2, slot: 2, action: 'continue'});
  assert.deepEqual([get(h, 'SLOT'), JSON.parse(h.storage.get('xiaohouzi-v2-game2')).area], [1, 2], 'kept in Game 2 as it is, never played on this page (its area isn’t this one)');
  const k = title();
  k.run("localStorage.setItem(TESTING_KEY, '1')");
  k.run('slotCard(2)'); press(k, 'Start at'); press(k, 'Chapter 6'); press(k, 'Part 2');
  await settle(k);
  assert.match(k.el('#sheet').textContent, /needs an internet connection/, 'nothing fetched: it says why');
  assert.equal(k.storage.get('xiaohouzi-v2-game2'), undefined, 'and Game 2 is still empty');
});
