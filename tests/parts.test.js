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
  const g = game({part: -1}, {place: 'shore', x: 11, y: 16, dir: 'up'});   // (a game just arrived: not into a part yet)
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
  assert.match(sheet.querySelector('.journey').textContent.replace(/\s+/g, ' '), /Your journey Find someone who knows where the immortals live: an immortal can teach you never to grow old\. ?Part 2: Learning to talk\./, 'the goal and the part (what to do: the main task, below)');
  const items = sheet.querySelectorAll('.tasks li').map(li => (li.classList.contains('main') ? '* ' : '') + li.textContent.replace(/\s+/g, ' ').trim());
  assert.match(items[0], /^\* (Help the people of the village|Ask the)/, 'the main task first: asking where the immortals are');
  assert.ok(items.includes('Also'), 'then the rest');
  assert.ok(items.slice(2).every(t => !t.startsWith('*')));
});

test('a part, once reached, stays: going back to an earlier place doesn’t take you back a part', async () => {
  const g = game({dressed: 2, back: 1, child: 3, exchanged: 1, part: 3});
  await play(g, 'runEvents()');
  assert.equal(get(g, 'partNow().id'), 'town');
  assert.equal(get(g, '__boxes.length'), 0, 'no card: already there');
});

test('the checklist is just the part you’re in, and anything from before that’s still to do: never what’s to come', () => {
  const g = game({dressed: 2, back: 1, child: 3, part: 1});
  const items = () => get(g, 'areaChecklist().map(c => c[0])');
  assert.ok(items().includes('Go up to the village'));
  assert.ok(!items().some(t => /farmer|town/.test(t)), 'nothing from the parts to come');
  assert.ok(items().includes('Make friends with the goose on the sand'), 'the goose, from the part before, till you’ve made friends with it');
  assert.ok(!items().includes('Dress like a person'), 'but not what’s done there');
  g.run("S.friends.push('goose')");
  assert.ok(!items().some(t => /goose|鹅/.test(t)), 'and once it’s done, it’s gone');
});

test('a game from before the story had parts starts at the part it’s reached, without its card; after that, each part’s card shows as it begins', async () => {
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, areas: {1: {raft: 3}, 2: {landed: 1, dressed: 2, back: 1, child: 3}}, pos: {place: 'village', x: 16, y: 14, dir: 'up'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__boxes = []; infoBox = async (who, html) => { __boxes.push(html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }; placePlayer()");
  assert.equal(get(g, 'here().part'), null, 'from before parts');
  await play(g, 'runEvents()');
  assert.equal(get(g, 'partNow().id'), 'talk');
  assert.equal(get(g, '__boxes.length'), 0, 'no card: it began before');
  g.run('here().exchanged = 1');
  await play(g, 'runEvents()');
  assert.equal(get(g, 'partNow().id'), 'town');
  assert.match(get(g, '__boxes')[0], /^Part 4 The market town/, 'the next one’s card, as it begins');
  assert.equal(get(loadGame({dom: true}), 'here().part'), -1, 'a new game: not into a part yet, so each card shows');
});
