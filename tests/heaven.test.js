// The opening (moved here from the lookout's view on 23 October 2026): as in the book, the light from the little monkey's eyes
// reaches heaven, and the Jade Emperor sends Thousand-Mile Eye and Wind-Following Ear out of the Southern Gate of Heaven
// (南天门) to look and listen. The view follows the light up into the sky, the two gods step out from behind the gate's
// pillars, and the view comes back down to the little monkey as the light fades; then 你好，小猴子！
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));

test('after the light shines from its eyes, the view follows it up to heaven, stays a moment, and comes back down', () => {
  const g = loadGame();
  const H = get(g, 'HEAVEN'), intro = get(g, 'AREA.intro'), eyes = intro.find(c => c.zh.includes('眼睛')).at;
  const up = t => g.run(`heavenUp(${t})`);
  assert.equal(up(eyes + .3), 0, 'the light first, from the mountain');
  assert.ok(up((H.up[0] + H.up[1]) / 2) > 0 && up((H.up[0] + H.up[1]) / 2) < 1, 'then up, following it');
  assert.equal(up(H.up[1] + .1), 1, 'up in the clouds');
  assert.equal(up(H.down[0] - .1), 1);
  assert.ok(up((H.down[0] + H.down[1]) / 2) > 0 && up((H.down[0] + H.down[1]) / 2) < 1, 'and back down');
  assert.equal(up(H.down[1] + .1), 0);
  assert.ok(H.up[0] > eyes && H.down[0] - H.out[1] >= 1.5, 'with time to see the gods');
  assert.ok(g.run(`eyeLight(${H.up[1]})`) === 1 && g.run(`eyeLight(${H.fade[1]})`) === 0 && H.fade[1] > H.down[0], 'the light, shining all the way up, fades as the view comes down');
  assert.equal(intro[intro.length - 1].zh, '你好 ， 小 猴子 ！');
  assert.equal(intro[intro.length - 1].at, H.hello, 'then: hello, little monkey!');
  assert.ok(H.hello > H.fade[1] && H.hello > H.down[1]);
});

test('up in the clouds, the gate of heaven, 南天门 on its plaque, and the two gods stepping out from behind its pillars to look', () => {
  const g = loadGame();
  const H = get(g, 'HEAVEN');
  g.run(`globalThis.__wrote = []; const write0 = write; write = (g, text, ...rest) => { __wrote.push(text); return write0(g, text, ...rest); };
    globalThis.__gods = []; b.drawImage = (img, x) => { if (img === GODS.eye || img === GODS.ear) __gods.push([img === GODS.eye ? 'eye' : 'ear', x]); };`);
  g.run(`drawScene(${H.out[0] - .1}, 0, 1)`);   // in heaven, the gods still behind the pillars
  g.run(`drawScene(${H.out[1] + .5}, 0, 1)`);   // out
  assert.deepEqual(get(g, '__wrote'), ['南天门', '南天门']);
  const [eye0, ear0, eye1, ear1] = get(g, '__gods');
  assert.deepEqual([eye0[0], ear0[0], eye1[0], ear1[0]], ['eye', 'ear', 'eye', 'ear']);
  assert.ok(eye1[1] < eye0[1] && ear1[1] > ear0[1], 'out: Thousand-Mile Eye to the left, Wind-Following Ear to the right');
  assert.equal(g.run(`godsOut(${H.down[0]})`), 1, 'and they stay out, looking');
  g.run('__wrote.length = 0');
  for (const t of [0, 5, 9, 10.9, 11.7, 13.4, 15.2, 16.5]) g.run(`drawScene(${t}, ${t * 1000}, 1)`);   // (the whole opening draws)
  g.run('drawScene(0, 0)');   // (and the title screen)
});

test('a little call as the gods step out, after the shimmer of the light', () => {
  const g = loadGame();
  const sounds = get(g, 'SCENE_SOUNDS.opening'), H = get(g, 'HEAVEN');
  assert.ok(sounds.some(([at, s]) => s === 'call' && at === H.out[0]));
  assert.ok(sounds.some(([at, s]) => s === 'shimmer' && at < H.out[0]));
});
