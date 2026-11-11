// Story so far (decided 9 November 2026, the four ideas plan): from Story so far ▸ in the Tasks page's journey box, every
// part of the story you've reached, chapter by chapter, each with the card you read as it began (or its story line, for a
// part that begins with its chapter's own card), the scenes you can watch again under the part they happen in (they were
// in Settings), and the part you're in at the end, marked Now. An area before this one folds into one line at the top.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const tick = () => new Promise(r => setImmediate(r));
const FEAST = {elder: 2, chapter: 1, cave: 6, count: 3, school: 2, feast: 1, part: 6};   // (chapter 1, food for the feast: the school built)
function game(save){
  const g = loadGame({dom: true, save: {version: 42, started: true, ...save}});
  g.run("mode = 'play'; placePlayer(); save = () => {}");
  return {g, sheet: g.el('#sheet'), run: code => g.run(code)};
}
const text = el => el.textContent.replace(/\s+/g, ' ').trim();
const parts = sheet => sheet.querySelectorAll('.storypart').map(p => text(p.querySelector('.sp-name')).replace(/\s*Now$/, '') + (p.classList.contains('now') ? ' (now)' : ''));   // (each part's name, and the one you're in)

test('Story so far ▸, in the Tasks page’s journey box, opens it; ◂ Tasks goes back, Back closes it', () => {
  const {sheet, run} = game({areas: {1: FEAST}});
  run('globalThis.__closed = false; tasksPage(() => { __closed = true; closeCard(); })');
  sheet.querySelector('.journey .storybtn').click();
  assert.match(text(sheet.querySelector('.label')), /Story so far/);
  sheet.querySelector('[data-a=tasks]').click();
  assert.match(text(sheet.querySelector('.label')), /^Tasks/, '◂ Tasks: the Tasks page');
  sheet.querySelector('.journey .storybtn').click();
  run('pressB()');
  assert.equal(run('__closed'), true, 'Back: closed, as from the Tasks page');
});

test('every part you’ve reached, chapter by chapter, with its card; the one you’re in last, marked Now, with what you’re doing; nothing after it', () => {
  const {sheet, run} = game({areas: {1: FEAST}});
  run('storyPage(() => {})');
  assert.deepEqual(sheet.querySelectorAll('.storych').map(text), ['Prologue: The Water Curtain Cave', 'Chapter 1: The Great Feast']);
  assert.deepEqual(parts(sheet), ['The meadow · Part 1', 'Up the river · Part 2', 'The waterfall · Part 3', 'A home for the troop · Part 4',
    'A new home ground · Part 1', 'The school · Part 2', 'Food for the feast · Part 3 (now)'], 'not The feast, still to come');
  const now = sheet.querySelector('.storypart.now');
  assert.match(text(now), /The old monkey has news: the troop will have a great feast! It needs food from all over the mountain\./, 'its card');
  assert.equal(text(now.querySelector('.sp-now')), 'Now: Find food for the feast: press A at its big table to see what it still needs.');
  assert.equal(sheet.querySelectorAll('.storypart.now').length, 1);
});

test('a part that begins with its chapter’s own card has a story line of its own instead: every part has one or the other', () => {
  const {sheet, run} = game({areas: {1: FEAST}});
  run('storyPage(() => {})');
  assert.match(text(sheet.querySelectorAll('.storypart')[0]), /You’ve just been born from a stone, high on Flower Fruit Mountain\. A troop of monkeys lives here in the meadow: go and meet them\./);
  assert.match(text(sheet.querySelectorAll('.storypart')[4]), /The troop has a new home ground, by the waterfall\. The big monkey wants to build a school there, out of wood and stones\./);
  for (const area of [1, 2]){
    const missing = JSON.parse(run(`JSON.stringify(AREAS.find(a => a.number === ${area}).parts.filter(p => !(p.card === false ? p.story : p.text)).map(p => p.id))`));
    assert.deepEqual(missing, [], `area ${area}: a card’s text, or a story line for a part with no card`);
  }
});

test('the scenes to watch again sit under their parts, the opening under the first; one you haven’t seen isn’t there; every one names a part of its area', () => {
  const {sheet, run} = game({areas: {1: FEAST}});
  run('storyPage(() => {})');
  const under = id => { const p = sheet.querySelectorAll('.storypart').find(x => x.querySelector(`.watch[data-watch="${id}"]`)); return p ? text(p.querySelector('.sp-name')) : null; };
  assert.equal(under('opening'), 'The meadow · Part 1');
  assert.equal(under('becomingKing'), 'A home for the troop · Part 4');
  assert.equal(under('buildingSchool'), 'The school · Part 2');
  assert.equal(sheet.querySelector('.watch[data-watch="feast"]'), null, 'the feast: not held yet');
  for (const area of [1, 2]){
    const bad = JSON.parse(run(`(a => JSON.stringify(Object.entries(a.scenes || {}).filter(([, sc]) => sc.watch && !a.parts.some(p => p.id === sc.part)).map(([id]) => id)))(AREAS.find(a => a.number === ${area}))`));
    assert.deepEqual(bad, [], `area ${area}: each scene you can watch again is under a part`);
  }
});

test('Watch plays it, and once it ends you’re back in Story so far, on its button', async () => {
  const {sheet, run} = game({areas: {1: FEAST}});
  run('storyPage(() => {})');
  sheet.querySelector('.watch[data-watch="becomingKing"]').click();
  assert.equal(run('mode'), 'intro', 'the scene');
  run('scene.end()');   // (Skip)
  await tick(); await tick();
  assert.match(text(sheet.querySelector('.label')), /Story so far/);
  assert.equal(run('document.activeElement && document.activeElement.dataset.watch'), 'becomingKing');
  sheet.querySelector('.watch[data-watch="opening"]').click();
  assert.equal(run('mode'), 'intro');
  assert.equal(run("scene.caps[0].words.join('')"), run("sceneCaps(FLOWER_FRUIT_MOUNTAIN.intro)[0].words.join('')"), 'the opening, as it was');
});

test('Settings no longer has the scenes or the opening', () => {
  const {sheet, run} = game({areas: {1: FEAST}});
  run('openSettings()');
  assert.equal(sheet.querySelector('[data-m="scene"], [data-m="opening"]'), null);
});

test('in the human world, Flower Fruit Mountain folds into one line at the top; tap it for all its parts, with its scenes, and again to fold it', () => {
  const {sheet, run} = game({area: 2, areas: {1: {chapter: 1, raft: 3, done: true}, 2: {chapter: 1, part: 5, landed: 1, years: 1, boat: 2}}});
  run('storyPage(() => {})');
  const fold = sheet.querySelector('.storyfold');
  assert.match(text(fold), /^▸ Flower Fruit Mountain ?Born from a stone, king of the monkeys, the troop’s new home and the great feast, then a raft across the sea\. Tap to read it\.$/);
  // chapters numbered through the whole story (decided 11 November 2026): the human world carries on from Chapter 1
  assert.deepEqual(sheet.querySelectorAll('.storych').map(text), ['Chapter 2: The human world', 'Chapter 3: The teacher’s mountain'], 'then the human world’s story');
  assert.match(text(sheet.querySelector('.storypart.now')), /^The climb · Part 1 ?Now ?You’ve crossed the western sea, and the immortal lives up this mountain!/);
  assert.deepEqual(sheet.querySelectorAll('.watch').map(b => b.dataset.watch), ['drift', 'yearsPass', 'manyYearsLater', 'crossSea']);
  fold.click();
  assert.equal(sheet.querySelector('.storyfold').getAttribute('aria-expanded'), 'true');
  assert.equal(parts(sheet).length, 9 + 6, 'Flower Fruit Mountain’s nine parts, then the human world’s six');
  assert.ok(['opening', 'becomingKing', 'buildingSchool', 'feast'].every(id => sheet.querySelector(`.watch[data-watch="${id}"][data-area="1"]`)), 'with all its scenes, its story done');
  assert.deepEqual(sheet.querySelectorAll('.storych').map(text), ['Prologue: The Water Curtain Cave', 'Chapter 1: The Great Feast', 'Chapter 2: The human world', 'Chapter 3: The teacher’s mountain'],
    'unfolded, the chapters run on through both areas, never starting again');
  sheet.querySelector('.storyfold').click();
  assert.equal(parts(sheet).length, 6, 'folded again');
});

test('its names stand out, as in your tasks: people gold, places blue', () => {
  const {sheet, run} = game({areas: {1: FEAST}});
  run('storyPage(() => {})');
  const school = sheet.querySelectorAll('.storypart')[5];
  assert.deepEqual(school.querySelectorAll('.hl-who').map(text), ['old monkey']);
  assert.deepEqual(school.querySelectorAll('.hl-where').map(text), ['school']);
});
