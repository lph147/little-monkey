// The journey and the story's parts (decided 5 November 2026, after playing it: the human world felt aimless, and never
// said why you were there): the area's goal and the part you're in at the top of the Tasks page; each part's title card
// as it begins (the furthest you've reached); the story's main task first, ★, the rest under Also; and the checklist
// just the part you're in.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 400 && !done; i++){ await tick(); g.flush(); } await p; }
function game(area = {}, pos = {place: 'village', x: 16, y: 14, dir: 'up'}){
  const w = Object.fromEntries(['猴子', '人', '衣服', '帽子', '不', '是', '什么'].map(x => [x, {lv: 1, ok: 1}]));
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, w, areas: {1: {raft: 3}, 2: {landed: 1, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__boxes = []; infoBox = async (who, html) => { __boxes.push(html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }; placePlayer()");
  return g;
}

test('as you land, the first part’s card says why you’re here: to find an immortal', async () => {
  const g = game({}, {place: 'shore', x: 11, y: 16, dir: 'up'});
  await play(g, 'runEvents()');
  const [card] = get(g, '__boxes');
  assert.match(card, /^Part 1 Dressing like a person You’ve crossed the sea to find an immortal/);
  assert.equal(get(g, 'here().part'), 0);
  await play(g, 'runEvents()');
  assert.equal(get(g, '__boxes.length'), 1, 'once');
});

test('the Tasks page: your journey and the part you’re in, then the story’s main task first (a gold star), the rest under Also', () => {
  const g = game({dressed: 2, back: 1, child: 3, part: 1});
  g.run('tasksPage(() => {})');
  const sheet = g.el('#sheet');
  assert.match(sheet.querySelector('.journey').textContent.replace(/\s+/g, ' '), /Your journey Find an immortal who can teach you never to grow old\. ?Part 2: Learning to talk\.$/, 'the goal and the part (what to do: the main task, below)');
  const items = sheet.querySelectorAll('.tasks li').map(li => (li.classList.contains('main') ? '* ' : '') + li.textContent.replace(/\s+/g, ' ').trim());
  assert.match(items[0], /^\* Learn to talk like the villagers/, 'the main task first');
  assert.equal(items[1], 'Also', 'then the rest');
  assert.ok(items.slice(2).every(t => !t.startsWith('*')));
});

test('a part, once reached, stays: going back to an earlier place doesn’t take you back a part', async () => {
  const g = game({dressed: 2, back: 1, child: 3, exchanged: 1, part: 3});
  await play(g, 'runEvents()');
  assert.equal(get(g, 'partNow().id'), 'town');
  assert.equal(get(g, '__boxes.length'), 0, 'no card: already there');
});

test('the checklist is just the part you’re in', () => {
  const g = game({dressed: 2, back: 1, child: 3, part: 1});
  const items = get(g, 'areaChecklist().map(c => c[0])');
  assert.ok(items.includes('Go up to the village'));
  assert.ok(!items.some(t => /goose|鹅|farmer|town/.test(t)), 'nothing from the other parts');
});
