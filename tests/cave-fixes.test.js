// The immortal's cave, after playing it (6 November 2026): the heaps of leaves just vanished as you swept them, the doors
// in the rock looked like holes, a name too long for one line made the name plate taller than the face in it, a ring
// round a ring, and your answer to the master, 我没有名字 (I don't have a name), sounded wrong: everyone calls you 美猴王.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水', '吃', '喝', '要', '我', '猴子', '河', '鱼', '羊', '朋友', '家', '有', '鸟', '小', '大',
  '谢谢', '再见', '木头', '三', '四', '人', '是', '不', '什么', '钱', '风', '歌', '洞', '门', '房子', '狗', '猫', '鸡', '牛', '船', '云', '鹤', '天', '师父', '名字', '叶子', '扫'];
function game(pos, area = {}){   // in the cave, with the senior pupil's chores begun: the leaves to sweep
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 2, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, shells: 0, coins: 5, met: [], friends: [],
    areas: {1: {chapter: 1, raft: 3, done: true}, 2: {landed: 1, dressed: 2, back: 1, child: 3, years: 1, boat: 2, song: 1, chapter: 1, woodFetch: 4, sky: 1, door: 2, teacher: 1, named: 1, spyGame: 1, chores: 2, ...area}}, pos, w}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; toast = t => { __notes.push(t); }; showNarration = async t => { __notes.push(t); }");
  g.run('pictureQ = async o => { if (o.onAnswer) o.onAnswer(true, o.answerIdx); return true; }; closeCard = () => {}');
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 2000 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
// what a drawing fills, each [colour, x, y, w, h]
const drawn = (g, code) => get(g, `(() => { const out = [], ctx = {fillStyle: '', fillRect(x, y, w, h){ out.push([this.fillStyle, x, y, w, h]); },
  save(){}, restore(){}, beginPath(){}, rect(){}, clip(){}}; ${code}; return out; })()`);

test('sweeping a heap of leaves: three strokes of a broom, leaves flying off it, away from you, then the heap is gone', async () => {
  const g = game({place: 'cave', x: 12, y: 9, dir: 'down'});
  assert.equal(get(g, 'tileAt(12, 10).look'), 'leafPile', 'a heap of leaves in front of you');
  g.run(`globalThis.__strokes = []; globalThis.__brushes = 0; SFX.sweep = () => { __brushes++; };
    { const real = scatter; scatter = (x, y, kind, dir, n) => { __strokes.push({at: [x, y], kind, dir, n, sweeping: !!acting && acting.kind === 'sweep'}); return real(x, y, kind, dir, n); }; }`);
  await press(g, 12, 9, 'down');
  const strokes = get(g, '__strokes');
  assert.equal(strokes.length, 3, 'three strokes');
  assert.equal(g.run('__brushes'), 3, 'each with the brush of the broom');
  assert.ok(strokes.every(s => String(s.at) === '12,10' && s.kind === 'leaves' && s.dir === 'down' && s.sweeping), 'leaves flying off the heap, away from you, as you sweep it');
  assert.deepEqual(strokes.map(s => s.n), [4, 4, 10], 'the most on the last');
  assert.equal(g.run('acting'), null, 'and done');
  assert.equal(get(g, 'tileAt(12, 10).look'), 'paving', 'the heap’s gone');
  assert.equal(g.run("counter('leavesSwept')"), 1, 'one heap swept up');
  assert.ok(get(g, '__notes').some(n => /sweep up the leaves \(1\/5\)/.test(n)), 'and you’re told');
  const leaf = get(g, "chips.filter(c => c.float).map(c => [c.vy, c.c])");
  assert.ok(leaf.length >= 18 && leaf.every(([vy, c]) => vy > -40 && ['#C2552E', '#D8923A', '#E6B04A', '#9A6A2A'].includes(c)), 'leaves in the heap’s colours, tossed down, away from you');
});

test('the broom: in your hands, its head on the ground in front of you, swept from side to side', () => {
  const g = game({place: 'cave', x: 12, y: 9, dir: 'down'});
  const PX = 64, PY = 64, twigs = get(g, '[BROOM.twig, BROOM.tip]');
  for (const [dir, dx, dy] of [['down', 0, 1], ['up', 0, -1], ['left', -1, 0], ['right', 1, 0]]){
    const sides = [];
    for (const t of [0, 170, 340]){   // (the ends of a stroke, and its middle)
      const fills = get(g, `(() => { const out = []; b.fillRect = function(x, y, w, h){ out.push([this.fillStyle, x, y]); }; drawSweep('player', '${dir}', ${PX}, ${PY}, 0, ${t}); return out; })()`);
      const head = fills.filter(([c]) => twigs.includes(c));
      assert.ok(head.length >= 10, `${dir}: the broom’s head, a fan of twigs`);
      const x = head.reduce((a, [, x]) => a + x, 0) / head.length, y = head.reduce((a, [, , y]) => a + y, 0) / head.length;
      assert.ok(x >= PX + dx*16 - 1 && x <= PX + dx*16 + 16 && y >= PY + dy*16 - 1 && y <= PY + dy*16 + 16, `${dir}: on the square in front of you (${x.toFixed(1)}, ${y.toFixed(1)})`);
      sides.push(dy ? x : y);
    }
    assert.ok(Math.abs(sides[0] - sides[2]) >= 4, `${dir}: swept from one side to the other`);
  }
});

test('the doors in the rock are wooden doors, and the master’s back door stands open at night, lamplight inside', () => {
  const g = game({place: 'cave', x: 12, y: 9, dir: 'down'});
  for (const [x, y] of [[4, 3], [6, 3], [8, 3], [19, 3]]){
    assert.equal(get(g, `tileAt(${x}, ${y}).look`), 'rockDoor', `${x}, ${y}: a door in the rock`);
    const fills = drawn(g, `LOOKS.rockDoor(ctx, ${x * 16}, ${y * 16}, ${x}, ${y})`).map(([c]) => c);
    assert.ok(fills.includes('#5E3B22') && fills.includes('#E0B050'), 'a wooden door, with its rings');
    assert.ok(!fills.includes('#1E1A18'), 'not a dark hole');
  }
  g.run("enterPlace('caveNight')");
  assert.equal(get(g, 'tileAt(19, 3).look'), 'rockDoorOpen', 'by night, the master’s back door is open');
  const night = drawn(g, 'LOOKS.rockDoorOpen(ctx, 304, 48, 19, 3)').map(([c]) => c);
  assert.ok(night.includes(get(g, 'DOOR_LIGHT[0]')), 'lamplight inside');
  assert.ok(get(g, "FACES").includes('rockDoor') && get(g, "FACES").includes('rockDoorOpen'), 'in the rock’s face, which runs on round them');
});

test('a name on two lines keeps the plate as tall as the face, its end round the face', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'game.css'), 'utf8');
  const rule = sel => (css.match(new RegExp(sel.replace(/[.]/g, '\\.') + '\\{([^}]*)\\}')) || [])[1] || '';
  const rem = (r, prop) => parseFloat((r.match(new RegExp('(?:^|;)' + prop + ':([0-9.]+)rem')) || [])[1]);
  const plate = rule('.talkhead .speaker'), face = rule('.talkhead .face'), spk = rule('.talkhead .spk');
  const faceSize = rem(face, 'width'), radius = rem(plate, 'border-radius');
  assert.ok(faceSize > 0 && Math.abs(radius - faceSize / 2) < .01, 'the plate’s corners as round as the face: on one line, its end is the face’s ring');
  const lineHeight = parseFloat((spk.match(/line-height:([0-9.]+)/) || [])[1]);
  const twoLines = (rem(rule('.talkhead .spk-zh'), 'font-size') + rem(rule('.talkhead .spk-en'), 'font-size')) * lineHeight;
  assert.ok(twoLines <= faceSize - .2, `the name and its English under it fit in the face’s height (${twoLines.toFixed(2)}rem in ${faceSize}rem, less the borders)`);
  assert.match(face, /align-self:flex-start/, 'and longer still, the face stays at the plate’s top corner');
});

test('when the master asks your name, you have no real name: everyone calls you 美猴王', () => {
  const g = game({place: 'cave', x: 12, y: 9, dir: 'down'});
  assert.deepEqual(get(g, '[L.noName.t.join(""), L.noName.en]'), ['我没有真正的名字。大家都叫我美猴王。', 'I don’t have a real name. Everyone calls me Handsome Monkey King.']);
  assert.ok(['真正', '大家', '都'].every(w => get(g, `!WORDS['${w}'] && !!GLOSS['${w}']`)), 'its new words in the word bank, just for listening (not to catch)');
  assert.equal(get(g, "GLOSS['都'][0]"), 'dōu');
});
