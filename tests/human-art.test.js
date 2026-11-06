// The human world's art, from the art proposal (decided 6 November 2026, after playing it: the high road's rice sacks and
// old tree stood on squares of the wrong ground, a well looked like a bowl, people seemed to have an eye missing, houses
// were too small, with clay pots in front of their doors, and the long grass looked like another game's).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
function game(pos, area = {}){
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, shells: 12, areas: {1: {chapter: 1, raft: 3, done: true}, 2: {landed: 1, dressed: 2, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}");
  g.run('placePlayer()');
  return g;
}
const HOUSES = ['jHouse', 'mudHouse', 'townSchool', 'teahouse'];

test('things stand on the ground round them: the rice sacks on the verge, the old tree and the willows on the grass', () => {
  const g = game({place: 'highRoad', x: 16, y: 9, dir: 'up'});
  assert.equal(g.run("tileAt(16, 6).look + ' ' + (groundUnder(16, 6) === lawn)"), 'sacks true', 'the sacks: on the verge, not the lane in front of them');
  assert.equal(g.run("tileAt(19, 2).look + ' ' + [[19, 2], [20, 2], [19, 3], [20, 3]].every(([x, y]) => groundUnder(x, y) === LOOKS.grass)"), 'oldTree true', 'every square of the old tree: grass, not flagstones');
  assert.equal(g.run("tileAt(3, 5).look + ' ' + (groundUnder(3, 5) === LOOKS.grass)"), 'willow true', 'a willow by the road: grass, not a square of the village’s lawn');
  g.run("enterPlace('town')");
  assert.ok(g.run("[[2, 18], [8, 18]].every(([x, y]) => tileAt(x, y).look === 'willow' && groundUnder(x, y) === paving)"), 'in town, a willow on the flagstones');
});

test('no house has anything standing in front of its door', () => {
  const g = game({place: 'highRoad', x: 16, y: 9, dir: 'up'});
  const blocked = get(g, `Object.entries(AREA.places).filter(([id, p]) => p.map && !p.borrowed).flatMap(([id, p]) => {
    const leg = {...AREA.legend, ...(p.legend || {})}, at = (x, y) => leg[(p.map[y] || '')[x]] || {}, taken = new Set(), out = [];
    p.map.forEach((row, y) => [...row].forEach((ch, x) => {
      const l = at(x, y).look; if (!${JSON.stringify(HOUSES)}.includes(l) || taken.has(x + ',' + y)) return;
      let w = 1, h = 1; while (at(x + w, y).look === l) w++; while (at(x, y + h).look === l) h++;
      for (let a = 0; a < w; a++) for (let c = 0; c < h; c++) taken.add((x + a) + ',' + (y + c));
      const mid = x + w / 2, cols = Number.isInteger(mid) ? [mid - 1, mid] : [Math.floor(mid)];
      for (const c of cols) if (!at(c, y + h).walk) out.push(id + ': ' + l + ' at ' + x + ',' + y + ' has ' + at(c, y + h).look + ' at its door');
    }));
    return out;
  })`);
  assert.deepEqual(blocked, []);
});
