// Day and night animals (the polish plan, agreed 8 November 2026): day animals sleep at night where they live, curled up
// with little Zs (A says they're fast asleep), the owl and the mouse only come out after dark, and wild creatures change
// with the time of day: wasps only by day, snakes mostly by day, wolves and spiders more at night, and a night creature to
// fight, the weasel (黄鼠狼), only after dark. The story never waits for night: an animal it needs stays up (awake).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knows = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
const WORDS = knows(['石头', '山', '花', '草', '树', '动物', '水果', '桃子', '苹果', '河', '水', '鱼', '棍子', '蛇', '羊', '松鼠', '兔子', '猫头鹰', '老鼠']);
const CH1 = {elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, chapter: 1, cave: 6, shop: 3};
function game(pos, save = {}){
  const g = loadGame({dom: true, save: {version: 37, started: true, w: WORDS, areas: {1: CH1}, friends: ['sheep', 'squirrel', 'rabbit'], pos, ...save}});
  g.run("mode = 'play'; placePlayer(); say = () => {}; globalThis.__said = []; toast = m => { __said.push(m); }");
  const get = expr => JSON.parse(g.run(`JSON.stringify(${expr})`));
  return {g, run: code => g.run(code), get};
}
const DAY = 'S.clock.t = DAY_MS * .3', NIGHT = 'S.clock.t = DAY_MS * NIGHT + 1';

test('the sheep by day: awake at its spot, and you can meet it; at night: fast asleep there, with little Zs', async () => {
  const {run, get} = game({place: 'meadow', x: 5, y: 17, dir: 'down'});
  run(DAY);
  assert.equal(get("ANIMALS.find(a => a.id === 'sheep').time"), 'day');
  assert.equal(run('promptFor(5, 18)'), 'Meet');
  run(NIGHT);
  assert.equal(run('promptFor(5, 18)'), 'Look', 'asleep: A looks');
  await run('interact(5, 18)');
  assert.ok(get('__said').some(m => /The 羊 \(sheep\) is fast asleep\. Shh! Come back in the daytime\./.test(m)));
  assert.equal(run('walkable(5, 18)'), false, 'still there: you can’t walk through it, and nothing vanishes in front of you');
  run("globalThis.__zs = 0; const z = sleepZs; sleepZs = (...a) => { __zs++; return z(...a); }; drawWorld(performance.now())");
  assert.ok(run('__zs') >= 1, 'little Zs drift up from it');
});

test('the owl only comes out after dark: by day it’s asleep on its pine, and you can’t play; at night, its eyes glint', async () => {
  const {run, get} = game({place: 'darkPines', x: 11, y: 4, dir: 'up'});
  run(DAY);
  assert.equal(run('promptFor(11, 2)'), 'Look');
  await run('interact(11, 2)');
  assert.ok(get('__said').some(m => /fast asleep\. Shh! It comes out after dark\./.test(m)));
  run(NIGHT);
  assert.equal(run('promptFor(11, 2)'), 'Meet', 'at night, awake');
  run("globalThis.__glint = 0; const gl = glinting; glinting = (...a) => { __glint++; return gl(...a); }; drawWorld(performance.now())");
  assert.ok(run('__glint') >= 1, 'its eyes glinting in the gloom');
  run(DAY); run('__glint = 0; drawWorld(performance.now())');
  assert.equal(run('__glint'), 0, 'not while it sleeps');
});

test('in the long grass: the rabbit hides only by day, the mouse only at night', () => {
  const {run, get} = game({place: 'melonField', x: 4, y: 4, dir: 'down'}, {w: {...WORDS, ...knows(['西瓜'])}});
  const hiding = () => get("ANIMALS.filter(a => (!a.at && (!a.hides || a.hides === PLACE)) && inChapter(a) && awakeNow(a)).map(a => a.id)");
  run(DAY);
  assert.ok(hiding().includes('rabbit') && !hiding().includes('mouse'), 'by day: the rabbit, not the mouse');
  run(NIGHT);
  assert.ok(hiding().includes('mouse') && !hiding().includes('rabbit'), 'at night: the mouse, not the rabbit');
});

test('wild creatures by the time of day: wasps only by day, the weasel only after dark, wolves and spiders more at night, snakes less', () => {
  const {run, get} = game({place: 'meadow', x: 5, y: 10, dir: 'down'});
  run(DAY);
  assert.deepEqual(get("['wasp', 'weasel', 'snake', 'spider', 'wolf'].map(foeWeight)"), [1, 0, 1, 1, 1]);
  assert.equal(run("pickFoe(['weasel'])"), null, 'no weasel by day');
  assert.equal(run("pickFoe(['wasp'])"), 'wasp');
  run(NIGHT);
  assert.deepEqual(get("['wasp', 'weasel', 'snake', 'spider', 'wolf'].map(foeWeight)"), [0, 1, .5, 2, 2]);
  assert.equal(run("pickFoe(['wasp'])"), null, 'no wasps at night: nothing jumps out of the bees’ valley’s tall flowers');
  assert.equal(run("pickFoe(['weasel'])"), 'weasel');
  run("Math.random = () => .99");
  assert.equal(run("pickFoe(['snake', 'spider'])"), 'spider', 'the spider more likely at night');
  assert.ok(get("Object.values(PLACES).filter(p => p.legend).some(p => Object.values(p.legend).some(t => (t.wild || []).includes('weasel')))"), 'the weasel lives in the long grass');
});

test('the weasel: 黄鼠狼, made of words you know (yellow + mouse + wolf), with its picture and its look on the map', () => {
  const {get} = game({place: 'meadow', x: 5, y: 10, dir: 'down'});
  assert.deepEqual(get("[WORDS['黄鼠狼'].py, WORDS['黄鼠狼'].en, MADE['黄鼠狼'].parts.map(p => p[0]).join('')]"), ['huángshǔláng', 'weasel', '黄鼠狼']);
  assert.ok(get("!!PICTURES['黄鼠狼'] && !!MAP_SPRITES['黄鼠狼'] && MAP_SPRITES['黄鼠狼'].faces === 'left'"));
  assert.deepEqual(get("[ENEMIES.weasel.day, ENEMIES.weasel.health, ENEMIES.weasel.hits]"), [0, 30, 10]);
});

test('the story never waits for night: the dog guarding the road stays up till it’s your friend, then sleeps at night', () => {
  const g = loadGame({save: {version: 37, started: true, area: 2, w: {}, friends: []}});
  const run = c => g.run(c);
  run('S.clock.t = DAY_MS * NIGHT + 1');
  assert.equal(run("awakeNow(ANIMALS.find(a => a.id === 'dog'))"), true, 'up: the story needs it');
  assert.equal(run("awakeNow(ANIMALS.find(a => a.id === 'goose'))"), false, 'the geese roost at night');
  run("S.friends.push('dog')");
  assert.equal(run("awakeNow(ANIMALS.find(a => a.id === 'dog'))"), false, 'once it’s your friend, it sleeps at night');
  assert.equal(run("awakeNow(ANIMALS.find(a => a.id === 'cat'))"), true, 'the cat prowls at night');
  run('S.clock.t = DAY_MS * .3');
  assert.equal(run("awakeNow(ANIMALS.find(a => a.id === 'cat'))"), false, 'and sleeps in the sun by day');
});

test('the Friends page says when: a sun or a moon by the clue of one only out by day or after dark', () => {
  const {g, run} = game({place: 'meadow', x: 5, y: 10, dir: 'down'}, {friends: []});
  run('friendsPage(() => {})');
  const sheet = g.el('#sheet');
  const owl = sheet.querySelector('[data-clue="owl"]');
  assert.ok(owl && owl.querySelector('.fnote img.icon'), 'a moon by the owl’s clue');
  owl.click();
  assert.match(sheet.textContent, /The dark pines, up an old dead pine, after dark/);
});
