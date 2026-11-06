// Collecting several of something at one spot, one at a time, such as the six bowls from the cave's stack or three
// handfuls of fresh grass for the hungry cow (decided 6 November 2026, after playing it: filling the senior pupil's buckets
// one at a time, the pool rested after each, as anything does once you've done it, and A seemed not to give the next).
// While there are more to take, A takes the next at once: no resting, and no stopping first to close the message the last
// one left (but anything else you're told just then, A closes first). Once you have them all, it rests, as ever, so one more
// A never starts anything.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const tick = () => new Promise(r => setImmediate(r));
const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '猴子', '朋友', '河', '鱼', '木头', '桌子', '碗', '家', '学校', '老师', '同学',
  '一', '二', '三', '四', '五', '六', '红色', '黄色', '白色', '谢谢', '不客气', '没关系', '水果', '我', '要', '有', '牛'];
const BOWLS = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2, feast: 2, flowers: 'done', schoolFlowers: true, shop: 4, bowls: 'asked'};
function game(area, pos){
  const g = loadGame({dom: true, save: {version: 32, started: true, w: Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}])), shells: 0, areas: {1: area}, pos}});
  g.run("mode = 'play'; save = () => {}; placePlayer(); globalThis.__now = 5000; performance.now = () => __now");   // (the pretend browser's clock, which the test moves on)
  g.run('for (const t of getTasks()) S.tasksSeen[t.id] = 1');   // (no new task waiting to be announced once a message closes)
  g.run('{ const t0 = toast; toast = m => { t0(m); clearTimeout(msgT); }; }');   // (the pretend browser runs every waiting timer at once, so a message would close itself at once: it stays up, as for its few seconds on a phone)
  return g;
}
async function through(g){   // presses A through whatever is showing, until it's over, as a player does
  for (let i = 0; i < 60; i++){
    await tick(); g.flush(); g.run('__now += 50');
    if (g.run('!!talkNext || !modal.hidden')) g.run('pressA()');
    else if (!g.run('busy || !!acting')) return;
  }
  throw new Error('it never ended');
}
const label = g => { g.run('updateCtx(performance.now())'); return g.el('#aLabel').textContent; };

test('six bowls from the cave’s stack: A takes the next at once, each time, with no waiting and no message to close first; then it rests', async () => {
  const g = game(BOWLS, {place: 'cave', x: 9, y: 4, dir: 'up'});
  assert.equal(g.run('tileAt(9, 3).look'), 'bowlStack');
  for (let i = 1; i <= 6; i++){
    g.run('pressA()'); await through(g);
    assert.equal(g.run('(here().picked.bowls || []).length'), i, `bowl ${i}, from one press of A`);
    if (i < 6){
      assert.ok(g.run('newMessage()'), 'what you’re told is up');
      assert.ok(!g.run('justFinished(9, 3)') && !g.run('messageFirst()'), 'but A goes straight to the next bowl, not resting, nor closing the message first');
      assert.equal(label(g), 'Take', 'and says so');
    }
    if (i === 2){   // something else you're told just then, such as a new task, is never skipped: A closes it first, then takes the next at once
      g.run("__now += 100; toast('Something new!')");
      assert.ok(g.run('messageFirst()'), 'A closes news that came up after the last bowl first');
      assert.equal(label(g), 'OK');
      g.run('pressA()'); await tick();
      assert.ok(g.run("$('#saybox').hidden"), 'closed');
      assert.equal((g.run('(here().picked.bowls || []).length')), 2, 'and no bowl taken with it');
      assert.ok(!g.run('justFinished(9, 3)'), 'nor any rest after it');
      assert.equal(label(g), 'Take');
    }
  }
  assert.equal(g.run('here().holding.bowls'), '碗', 'all six');
  assert.equal(label(g), 'OK', 'then A closes the message, as ever');
  g.run('pressA()'); await tick();
  assert.ok(g.run('justFinished(9, 3)'), 'and the stack rests: one more A starts nothing');
});

test('three handfuls of fresh grass for the hungry cow, by the brook: one press of A each, straight after the last', async () => {
  const g = game({...BOWLS, bowls: 'done', cow: 4, cowWaits: 'slope', cowFood: 'asked'}, {place: 'southSlope', x: 12, y: 25, dir: 'left'});
  assert.equal(g.run("tileAt(11, 25).look === 'tallGrass' && !!tileAt(11, 25).onLook"), true, 'the fresh grass in front of you');
  for (let i = 1; i <= 3; i++){ g.run('pressA()'); await through(g); assert.equal(g.run('(here().picked.cowFood || []).length'), i, `handful ${i}`); }
  assert.equal(g.run('here().holding.cowFood'), '草', 'three handfuls, for the cow');
});
