// Snacks and meals (decided 5 November 2026, after playing it): food you can carry is a snack (the bag's tab: 零食
// língshí Snacks); a meal, such as the granny's bowl of rice, you eat there and then (the eat step): your monkey sits
// and eats it, and your health is full.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 400 && !done; i++){ await tick(); g.flush(); } await p; }
function game(area = {}, more = {}){
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, w: {'饭': {lv: 1, ok: 1}, '桃子': {lv: 1, ok: 1}}, areas: {1: {raft: 3}, 2: {landed: 1, dressed: 2, back: 1, child: 3, part: 1, ...area}},
    pos: {place: 'village', x: 21, y: 12, dir: 'right'}, ...more}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; toast = t => { __notes.push(t); }; placePlayer()");
  return g;
}

test('a meal is eaten there and then: your monkey eats it, and your health is full', async () => {
  const g = game();
  g.run('S.health = 5');
  let during = null;
  g.run("globalThis.__seen = []; { const was = drawEating; drawEating = (e, ...a) => { __seen.push(e.w); return was(e, ...a); }; }");
  g.run("globalThis.__eating = STEPS.eat({eat: '饭', note: 'Yum!'})");
  during = get(g, 'pl.eating && pl.eating.w');
  await play(g, '__eating');
  assert.equal(during, '饭', 'eating it');
  assert.deepEqual([get(g, 'S.health === maxHealth()'), get(g, 'pl.eating'), get(g, '__notes')], [true, null, ['Yum!']]);
  assert.equal(get(g, "S.bag['饭'] || 0"), 0, 'nothing in your bag');
  assert.equal(g.run("'饭' in FOOD"), false, 'rice isn’t a snack');
});

test('your bag’s food is 零食 língshí Snacks', () => {
  const g = game({lunch: 'asked', holding: {lunch: '饭'}}, {bag: {'桃子': 2}});
  g.run('bagPage(() => {})');
  const tab = g.el('#sheet').querySelector('.bagtabs .tab[data-tab=food]');
  assert.equal(tab.textContent.replace(/\s+/g, ' ').trim(), '零食 língshí Snacks', 'its name, with its pinyin');
  assert.equal(get(g, "BAG_TABS[0].zh + ' ' + BAG_TABS[0].py + ' ' + BAG_TABS[0].name"), '零食 língshí Snacks');
});

test('a game from before, with rice in its bag for the hungry farmer: it’s carried for him now', async () => {
  const g = game({farmer: 2, lunch: 'asked'}, {bag: {'饭': 1}});
  await play(g, 'runEvents()');
  assert.equal(get(g, 'here().holding.lunch'), '饭');
});
