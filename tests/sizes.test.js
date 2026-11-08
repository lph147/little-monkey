// Big and small creatures (the polish plan, agreed 8 November 2026): once you know 大 and 小, one wild creature in four is
// small (half its health and hits, the usual shells) and one in four big (one and a half times its health and hits, and
// twice the shells), big ones twice as likely at night. You see which at once, on the map and in the fight, and its name
// says it, on its plate and aloud (大蛇！ 小蜘蛛！). Bosses and story battles stay as they are.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const tick = () => new Promise(r => setImmediate(r));
const knows = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
const WORDS = knows(['石头', '山', '花', '草', '树', '桃子', '苹果', '河', '水', '鱼', '棍子', '蛇', '野猪', '蜘蛛', '狼', '黄蜂']);
const SIZES = knows(['大', '小']);
function fighting(w = {...WORDS, ...SIZES}, save = {}){
  const game = loadGame({dom: true, save: {version: 37, started: true, w, areas: {1: {elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 1, chapter: 1}}, ...save}});
  game.run("mode = 'play'; placePlayer(); globalThis.__q = null; const q = pictureQ; pictureQ = o => { __q = o; return q(o); }; globalThis.__said = []; say = (t, done) => { __said.push(t); if (done) done(); }");
  const sheet = game.el('#sheet');
  const run = code => game.run(code);
  const get = expr => JSON.parse(game.run(`JSON.stringify(${expr})`));
  const flush = async () => { for (let i = 0; i < 20; i++){ await tick(); game.flush(); } };
  return {game, sheet, run, get, flush};
}

test('not till you know both 大 and 小: before then, every wild creature is its usual size', () => {
  const g = fighting(WORDS);
  for (const r of [0, .3, .6, .9]){ g.run(`Math.random = () => ${r}`); assert.equal(g.run("pickSize('snake')"), null); }
  const h = fighting({...WORDS, ...knows(['大'])});
  h.run('Math.random = () => .9');
  assert.equal(h.run("pickSize('snake')"), null, 'both words');
});

test('by day, half are their usual size, a quarter little and a quarter big; at night, big ones are twice as likely', () => {
  const g = fighting();
  g.run('S.clock.t = DAY_MS * .3');
  const sizes = () => [0, .3, .49, .5, .6, .74, .75, .9, .99].map(r => (g.run(`Math.random = () => ${r}`), g.run("pickSize('snake')")));
  assert.deepEqual(sizes(), [null, null, null, 'small', 'small', 'small', 'big', 'big', 'big'], 'by day');
  g.run('S.clock.t = DAY_MS * NIGHT + 1');
  assert.deepEqual(sizes(), [null, 'small', 'small', 'big', 'big', 'big', 'big', 'big', 'big'], 'at night: a quarter usual, a quarter little, half big');
});

test('little: half the health and hits, the usual shells; big: one and a half times, and twice the shells', () => {
  const g = fighting();
  const at = (id, size) => g.get(`(f => [f.health, f.hits, f.reward])(sized(ENEMIES.${id}, ${JSON.stringify(size)}))`);
  assert.deepEqual(at('snake', null), [20, 10, 1]);
  assert.deepEqual(at('snake', 'small'), [10, 5, 1]);
  assert.deepEqual(at('snake', 'big'), [30, 15, 2]);
  assert.deepEqual(at('wolf', 'small'), [15, 5, 2]);
  assert.deepEqual(at('wolf', 'big'), [45, 15, 4]);
  assert.deepEqual(g.get("(f => [foeZh(f), foePy(f), f.meet, f.away, foeThe(f)])(sized(ENEMIES.snake, 'big'))"),
    ['大蛇', 'dà shé', 'A big {蛇} hisses at you!', 'The big {蛇} slithers away into the grass.', 'the big 蛇 (snake)'], 'its name says it, and so does what you’re told');
  assert.deepEqual(g.get("(f => [foeZh(f), foePy(f), f.hide])(sized(ENEMIES.spider, 'small'))"), ['小蜘蛛', 'xiǎo zhīzhū', 'The little {蜘蛛} scurries out of sight…']);
});

test('bosses stay as they are: the wild boar and the bear; and so do story battles', () => {
  const g = fighting();
  g.run('Math.random = () => .9');
  assert.equal(g.run("pickSize('boar')"), null);
  assert.equal(g.run("pickSize('bear')"), null);
  assert.equal(g.run("pickSize('snake')"), 'big');
  assert.equal(g.run("sized(ENEMIES.bear, 'big').health"), 80, 'never sized');
});

test('a big one jumps out of the long grass: bigger on the map, then its name on its plate and said aloud, 大蛇, a longer health bar, and twice the shells', async () => {
  const g = fighting();
  g.run("S.clock.t = DAY_MS * .3; wildSteps = 99; globalThis.__rs = [0, 0, .9]; Math.random = () => __rs.length ? __rs.shift() : .9; globalThis.__seen = null; const wb = wildBattle; wildBattle = (id, spot, opts) => { __seen = opts.size; return wb(id, spot, opts); }");
  g.run("globalThis.__r = null; wildStep({wild: ['snake']}).then(r => { __r = r; })");
  for (let i = 0; i < 60 && !g.sheet.querySelector('.act'); i++){ await g.flush(); g.run('0'); }
  assert.equal(g.run('__seen'), 'big');
  assert.equal(g.run('foe && foe.size'), 'big');
  assert.deepEqual(g.get('[foe.a.spr.width, foe.a.spr.height]'), [22, 22], 'bigger on the map: 22 pixels, as a big animal is');
  assert.ok(g.get('__said').includes('大蛇'), 'its name said aloud');
  assert.ok(g.sheet.querySelector('.scene.size-big'), 'bigger in the fight');
  assert.match(g.sheet.querySelector('.plate .name').textContent, /大蛇/);
  assert.match(g.sheet.querySelector('.plate .name').textContent, /dà shé/);
  assert.equal(g.sheet.querySelector('.plate .hp').getAttribute('aria-label'), 'Health: 30 of 30', 'one and a half times the health');
  assert.match(g.sheet.textContent, /A big 蛇 \(snake\) hisses at you!/);
});

test('a little one: smaller on the map and in the fight', async () => {
  const g = fighting();
  g.run("S.clock.t = DAY_MS * .3; wildSteps = 99; globalThis.__rs = [0, 0, .6]; Math.random = () => __rs.length ? __rs.shift() : .6");   // (the chance it jumps out, which one, then its size)
  g.run("wildStep({wild: ['spider']})");
  for (let i = 0; i < 60 && !g.sheet.querySelector('.act'); i++){ await g.flush(); g.run('0'); }
  assert.deepEqual(g.get('[foe.size, foe.a.spr.width]'), ['small', 11], 'as the little ones are drawn: 11 pixels');
  assert.ok(g.sheet.querySelector('.scene.size-small'));
  assert.match(g.sheet.querySelector('.plate .name').textContent, /小蜘蛛/);
  assert.equal(g.sheet.querySelector('.plate .hp').getAttribute('aria-label'), 'Health: 10 of 10');
});

test('every sized name has its line for the voices and the Chinese sheet, once each', () => {
  const g = fighting();
  const names = g.get('SIZED().map(c => c.zh)');
  assert.deepEqual(names, ['小 蛇', '大 蛇', '小 蜘蛛', '大 蜘蛛', '小 狼', '大 狼', '小 黄蜂', '大 黄蜂']);
  const a2 = loadGame({save: {version: 37, started: true, area: 2, w: {}}});
  assert.deepEqual(JSON.parse(a2.run('JSON.stringify(SIZED())')), [{zh: '小 妖怪', en: 'A little demon!'}, {zh: '大 妖怪', en: 'A big demon!'}], 'the little demons at home: once each, though two kinds have its word');
  assert.equal(a2.run("sized(ENEMIES.demon, 'big').meet"), 'A big {妖怪} jumps out at you!', 'a little demon already says “little”: a big one says big, never “a big little demon”');
});
