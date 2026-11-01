// The prologue in a clear order (decided 31 October 2026, after a new player walked off and talked to everyone at once):
// the old monkey calls you over on your first step, before anything else.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const born = (area = {}) => {
  const g = loadGame({dom: true, save: {version: 33, started: true, w: {'石头': {lv: 1, ok: 0}}, areas: {1: area}, pos: {place: 'meadow', x: 9, y: 2, dir: 'up'}}});
  g.run("mode = 'play'; placePlayer(); globalThis.__talked = []; talk = async n => { __talked.push(n.id); }");
  return g;
};
const step = async (g, x, y) => {
  g.run(`S.pos = {place: 'meadow', x: ${x}, y: ${y}, dir: 'down'}; placePlayer(); globalThis.__done = false; arrive(${x}, ${y}).then(runEvents).then(() => __done = true)`);
  for (let i = 0; i < 20 && !g.run('__done'); i++){ await new Promise(r => setImmediate(r)); g.flush(); }
};

test('just born, your first step brings the old monkey calling you over: a ! over him, you turn to him, and he talks', async () => {
  const g = born();
  await step(g, 9, 3);
  assert.deepEqual(get(g, '__talked'), ['elder']);
  assert.equal(get(g, 'pl.dir'), 'up', 'you turn towards him, up by your stone');
});

test('once you’ve said hello, he lets you go about', async () => {
  const g = born({elder: 1});
  await step(g, 9, 3);
  assert.deepEqual(get(g, '__talked'), []);
});

// Then the meadow in order: your first 4 words; then the animals and the meadow's words; then the troop.
const meadow = (area, words = []) => loadGame({save: {version: 33, started: true, w: Object.fromEntries(['石头', '你好', ...words].map(w => [w, {lv: 1, ok: 0}])),
  areas: {1: area}, pos: {place: 'meadow', x: 9, y: 3, dir: 'down'}}});
const bubbles = g => get(g, "['hungry', 'thirsty', 'playful', 'big'].map(id => ((AREA.bubbles[id] || []).find(b => matches(b.if)) || {}).show || '')");
const partFor = (g, id) => get(g, `AREA.talk.${id}.find(p => !p.if || matches(p.if)).do.map(s => s.say || s.reply || s.message || s.request || Object.keys(s)[0])`);

test('the troop waits till the old monkey sends you to meet them: no ! over them, and they send you back to what he asked', () => {
  // what they say names what the old monkey asked for, as it is now (the message whose if matches)
  const says = g => get(g, "AREA.talk.hungry.find(p => matches(p.if)).do.filter(s => !s.if || matches(s.if)).map(s => s.say || s.reply || fill(s.message))");
  const stages = [
    [{elder: 1}, [], /^First, learn 4 words/],
    [{elder: 1}, ['山', '花', '草', '树'], /^First, go back to the old monkey: he wants to see the words you’ve learned/],
    [{elder: 2}, ['动物'], /^First, find the 动物 \(animals\) and learn the words for the meadow/],
    [{elder: 2}, ['动物', '山', '河', '树', '鱼', '鸟'], /^First, go back to the old monkey: he wants to hear the words for the meadow/, ['rabbit', 'sheep', 'squirrel']]];
  for (const [area, words, line, met] of stages){
    const g = meadow(area, words);
    if (met) g.run(`S.met = ${JSON.stringify(met)}`);
    assert.deepEqual(bubbles(g), ['', '', '', ''], `no ! over the troop (${JSON.stringify(area)})`);
    for (const id of ['hungry', 'thirsty', 'playful', 'big']) assert.deepEqual(partFor(g, id).slice(0, 2), ['hi', '你好'], id);
    const said = says(g);
    assert.equal(said.length, 3, 'hello, your hello, and one message: ' + said.join(' / '));
    assert.match(said[2], line);
  }
  const g = meadow({elder: 2, meadowCheck: 1}, ['猴子']);
  assert.deepEqual(bubbles(g), ['!', '!', '!', '!'], 'then each has a !');
  assert.ok(get(g, 'getTasks().some(t => t.id === "troop")'), 'and your tasks say to meet them');
  const started = meadow({elder: 1, hungry: 'asked', holding: {}});
  assert.notEqual(partFor(started, 'hungry')[0], 'hi', 'a game that has started his request carries on');
});

test('the old monkey checks the meadow’s words once you’ve found its animals too, then sends you to the troop, teaching 猴子', () => {
  const words = ['山', '河', '树', '鱼', '鸟'];
  const bubble = met => { const g = meadow({elder: 2}, words); g.run(`S.met = ${JSON.stringify(met)}`); return get(g, "(AREA.bubbles.elder.find(b => matches(b.if)) || {}).show || ''"); };
  assert.equal(bubble(['rabbit', 'sheep']), '', 'not with an animal still to find');
  assert.equal(bubble(['rabbit', 'sheep', 'squirrel']), '!');
  const g = meadow({elder: 2}, words); g.run("S.met = ['rabbit', 'sheep', 'squirrel']");
  const steps = get(g, "AREA.talk.elder.find(p => matches(p.if)).do");
  assert.ok(steps.some(s => s.match) && steps.some(s => s.say === 'findMonkeys' && s.teach === '猴子') && steps.some(s => s.newWord === '猴子'));
  assert.ok(steps.findIndex(s => s.match) < steps.findIndex(s => s.newWord === '猴子'), 'after the match: practice, then the new word');
});

test('the little monkey teaches just 朋友; the troop’s monkey across the river says nothing of a shop that isn’t there yet', () => {
  const g = meadow({elder: 2, meadowCheck: 1}, ['猴子']);
  const steps = get(g, "AREA.talk.playful.find(p => matches(p.if)).do");
  assert.deepEqual(steps.filter(s => s.newWord).map(s => s.newWord), ['朋友']);
  assert.ok(!partFor(g, 'troop2').includes('bossHasApples'), 'no 老板 in the prologue');
});

test('the rocks rolling away waits till the conversation you’re in has ended (1 November 2026: they rolled away unseen while the thirsty monkey thanked you)', async () => {
  const g = loadGame({dom: true, save: {version: 33, started: true, met: ['rabbit', 'sheep', 'squirrel'],
    w: Object.fromEntries(['石头', '你好', '山', '河', '树', '鱼', '鸟', '动物', '猴子', '朋友', '我', '水果', '桃子', '苹果', '吃', '喝'].map(w => [w, {lv: 1, ok: 2}])),
    areas: {1: {elder: 2, meadowCheck: 1, hungry: 'done', thirsty: 'asked', holding: {thirsty: '水'}}}, pos: {place: 'meadow', x: 2, y: 11, dir: 'down'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__log = []; showDialog = async () => {}; replyWith = async () => true; gapQ = async () => true; showNotice = async w => setSeen(w)");
  g.run("toast = m => __log.push(['toast', m, here().gate]); confirmBox = async () => { __log.push(['game', here().gate]); return false; }");
  let done = false; Promise.resolve(g.run("talk(ALL_NPCS.find(n => n.id === 'thirsty')).then(runEvents)")).then(() => { done = true; });
  for (let i = 0; i < 200 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  const log = get(g, '__log');
  assert.equal(get(g, 'here().gate'), true, 'the rocks roll away');
  assert.ok(log.some(e => e[0] === 'game' && e[1] === false), 'not while he’s still talking to you (his word game)');
  assert.ok(log.some(e => e[0] === 'toast' && /rocks north of the meadow have rolled away/.test(e[1])), 'and you’re told');
});
