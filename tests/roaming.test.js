// Friends in the grass (decided 30 October 2026: outside the hillside and the bees' valley, every rustle in the tall grass
// was the rabbit, and the long walks were all fights). Once an animal is your friend, it can hide in the tall grass of the
// places it roams too, never where it lives, so you never see two of it at once; and the four long walks have patches of
// friendly tall grass, never touching the long grass where snakes, spiders and wolves live.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const knowing = words => Object.fromEntries(words.map(hz => [hz, {lv: 2, due: 0, ok: 2}]));
const WORDS = ['石头', '你好', '山', '花', '草', '树', '动物', '兔子', '羊', '松鼠', '山羊', '鹿', '狐狸', '蝴蝶', '猫头鹰', '水', '河', '鱼', '鸟'];
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2, build: 2, school: 2};
const game = friends => loadGame({save: {version: 32, started: true, w: knowing(WORDS), met: [...friends], friends: [...friends], areas: {1: CHAPTER_ONE}}});
// Who hides in a place's tall grass, over many tries.
const hiding = (g, place) => [...new Set(get(g, `(enterPlace('${place}'), Array.from({length: 400}, () => { rustle = null; stepsSince = HIDE_AFTER; hideAnimal(); return rustle && rustle.a.id; }))`))].filter(Boolean).sort();

test('a friend hides in the tall grass of the places it roams; before you’re friends, only the rabbit and the fox, as before', () => {
  const ALL = ['rabbit', 'sheep', 'squirrel', 'goat', 'deer', 'fox', 'butterfly', 'owl'];
  const g = game(ALL);
  assert.deepEqual(hiding(g, 'path'), ['goat', 'rabbit', 'squirrel'], 'the mountain path: the meadow’s squirrel and goat');
  assert.deepEqual(hiding(g, 'valley'), ['goat', 'rabbit', 'sheep'], 'the river valley: the sheep and goat');
  assert.deepEqual(hiding(g, 'southSlope'), ['deer', 'fox', 'goat', 'rabbit'], 'the south slope');
  assert.deepEqual(hiding(g, 'pineWood'), ['fox', 'rabbit', 'squirrel'], 'the pine wood: never a second deer, where it lives');
  assert.deepEqual(hiding(g, 'melonField'), ['butterfly', 'rabbit']);
  assert.deepEqual(hiding(g, 'meadow'), ['rabbit'], 'the meadow’s animals live there, at their own spots');
  assert.deepEqual(hiding(g, 'riverside'), ['fox', 'rabbit'], 'not the butterfly, which lives there');
  const met = game([]);
  met.run("S.met = ['deer', 'goat', 'fox']");   // (met, but not won over)
  assert.deepEqual(hiding(met, 'southSlope'), ['rabbit'], 'met but not your friend: it stays at home');
  assert.deepEqual(hiding(met, 'hillside'), ['fox', 'rabbit'], 'the fox still lives on the hillside');
});

test('the bees and the owl never wander, and every place an animal roams has tall grass to hide in', () => {
  const g = game([]);
  assert.deepEqual(get(g, "ANIMALS.filter(a => ['bee', 'owl'].includes(a.id)).map(a => a.roams.length)"), [0, 0]);
  const missing = get(g, `ANIMALS.flatMap(a => a.roams.filter(p => !PLACES[p] || a.place === p ||
    !PLACES[p].map.some(r => [...r].some(c => { const t = Object.assign({}, AREA.legend, PLACES[p].legend || {})[c]; return t && t.animals === true; }))).map(p => a.id + ' ' + p))`);
  assert.deepEqual(missing, [], 'a place it roams: real, not where it lives, and with tall grass any animal can hide in');
});

test('a friend jumping out of the grass where it roams is drawn jumping out, not left at its own spot', () => {
  const g = loadGame({dom: true, save: {version: 32, started: true, w: knowing(WORDS), met: ['deer'], friends: ['deer'], areas: {1: CHAPTER_ONE}, pos: {place: 'southSlope', x: 10, y: 21, dir: 'left'}}});
  g.run('placePlayer(); SFX.encounter = () => {}');
  g.run("wildAppears(ANIMALS.find(a => a.id === 'deer'), {x: 9, y: 21, d: 'left'})");
  assert.deepEqual(get(g, '[foe.a.id, foe.spot]'), ['deer', false]);
});

test('the new tall grass on the long walks, never touching long grass', () => {
  const g = game([]);
  const tall = get(g, `Object.fromEntries(['path', 'valley', 'southSlope', 'pineWood'].map(p => [p, PLACES[p].map.join('').split('').filter(c => {
    const t = Object.assign({}, AREA.legend, PLACES[p].legend || {})[c]; return t && t.animals === true; }).length]))`);
  assert.deepEqual(tall, {path: 13, valley: 12, southSlope: 23, pineWood: 25});
  const touching = get(g, `Object.entries(PLACES).flatMap(([p, pl]) => { const leg = Object.assign({}, AREA.legend, pl.legend || {}), at = (x, y) => leg[(pl.map[y] || '')[x]] || {};
    return pl.map.flatMap((r, y) => [...r].flatMap((c, x) => { const t = leg[c]; if (!t || t.animals !== true) return [];
      return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => at(x + dx, y + dy).wild) ? [p + ' ' + x + ',' + y] : []; })); })`);
  assert.deepEqual(touching, [], 'tall grass friends hide in never touches long grass, so you can tell them apart');
  assert.equal(get(g, "PLACES.pineWood.legend['ĝ'].look"), 'woodGrass', 'in the pine wood’s clearings, tall grass on the wood’s own floor');
});
