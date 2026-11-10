// The art of the rest of the game, from the second art review (decided 6 November 2026): Flower Fruit Mountain's places,
// the teacher's mountain and the demon's lair. The 老板's shop and stall had red and white stripes like a seaside kiosk,
// the lair's dead trees were the pine wood's thin grey poles, and the master's room sat in the top left of the screen.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
function game(pos){   // a game in the human world, at pos
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, shells: 12, areas: {1: {chapter: 1, raft: 3, done: true}, 2: {landed: 1, dressed: 2}}, pos}});
  g.run("mode = 'play'; save = () => {}");
  g.run('placePlayer()');
  return g;
}
function mountainGame(pos){   // a game on Flower Fruit Mountain, at pos
  const g = loadGame({dom: true, save: {version: 34, started: true, pos}});
  g.run("mode = 'play'; save = () => {}");
  g.run('placePlayer()');
  return g;
}
// what a drawing fills, each [colour, x, y, w, h], and where it clips what it draws to a shape, ['clip']
const drawn = (g, code) => get(g, `(() => { const out = [], ctx = {fillStyle: '', fillRect(x, y, w, h){ out.push([this.fillStyle, x, y, w, h]); },
  save(){}, restore(){}, beginPath(){}, rect(){}, clip(){ out.push(['clip']); }}; ${code}; return out; })()`);

test('the 老板’s shop and his stall: a plain cloth awning, not red and white stripes', () => {
  const g = game({place: 'highRoad', x: 16, y: 9, dir: 'up'});
  const cloth = get(g, 'AWNING[1]');
  for (const [what, code] of [['his shop', 'shopHut(ctx, 0, 32, 48, 32, 3)'], ['his stall', 'stall(ctx, 0, 32, 48)']]){
    const fills = drawn(g, code).map(([c]) => c);
    assert.ok(!fills.includes('#F4F1EA') && !fills.includes('#C0392B'), what + ': no stripes');
    assert.ok(fills.filter(c => c === cloth).length >= 40, what + ': the cloth');
  }
});

test('the dead trees on the demon’s mountain: gnarled and burnt black, branches clawing up, not the pine wood’s grey pole', () => {
  const g = game({place: 'highRoad', x: 16, y: 9, dir: 'up'});
  const X = 32, Y = 32, tree = drawn(g, 'OBJECT_ART.ashPine(ctx, {x: 2, y: 2, w: 1, h: 1})'), grey = get(g, 'BARE');
  assert.ok(!tree.some(([c]) => grey.includes(c)), 'none of the dead pine’s grey');
  assert.ok(tree.some(([c, x, y]) => x <= X + 2 && y < Y - 6) && tree.some(([c, x, y]) => x >= X + 14 && y < Y - 6), 'branches up to the left and to the right');
  assert.ok(tree.every(([c, x, y]) => y >= Y - g.run('PIECE_UP')), 'no higher than a big object can reach');
});

test('a place smaller than the screen, such as the master’s room, sits in its middle, with dark round it', () => {
  const g = game({place: 'masterRoom', x: 4, y: 4, dir: 'up'});
  assert.deepEqual(get(g, '[COLS, ROWS, camX(), camY()]'), [9, 7, -48, -24], 'nine squares by seven, in the middle of fifteen by ten');
  const blits = c => get(g, `(() => { const out = []; b.drawImage = (c, ...a) => out.push(a); ${c}; return out; })()`);
  assert.deepEqual(blits('drawLayer(mapCanvas, camX(), camY())'), [[0, 0, 144, 112, 48, 24, 144, 112]], 'the whole room, drawn where it shows: never anything off its edges');
  g.run("enterPlace('town')");
  const [cx, cy, w, h] = get(g, '[camX(), camY(), COLS*T - VW*T, ROWS*T - VH*T]');
  assert.ok(cx >= 0 && cx <= w && cy >= 0 && cy <= h, 'a bigger place: the screen on the map, as before');
  assert.deepEqual(blits('drawLayer(mapCanvas, 0, 0)'), [[0, 0, 240, 160, 0, 0, 240, 160]], 'the screen’s worth of it');
  assert.deepEqual(blits('drawLayer(mapCanvas, -1, 0)'), [[0, 0, 239, 160, 1, 0, 239, 160]], 'and shaking past its edge, only what’s there');
});

test('trees as in a Chinese painting: broad flat layers of leaves on branches, in three lopsided shapes; the fruit trees to match', () => {
  const g = game({place: 'highRoad', x: 16, y: 9, dir: 'up'});
  const [wood, leaf, peach] = [get(g, 'WOOD'), get(g, 'LEAF'), get(g, 'PEACHES')], X = 32, Y = 32;
  assert.ok(get(g, '[...TREE_LAYERS, ...TALL_LAYERS].flat()').every(([x, y, rx, ry]) => rx >= 1.5 * ry), 'every layer of leaves broad and flat, not a ball');
  const big = drawn(g, 'OBJECT_ART.tree(ctx, {x: 2, y: 2, w: 2, h: 2})');
  assert.ok(big.some(([c, x, y]) => c === wood[1] && y < Y + 18 && (x < X + 13 || x > X + 19)), 'branches up from its trunk into the leaves');
  const shape = (x, w) => JSON.stringify(drawn(g, `OBJECT_ART.tree(ctx, {x: ${x}, y: 2, w: ${w}, h: ${w}})`).filter(([c]) => c === leaf[0]).map(([c, rx, ry, rw, rh]) => [rx - x * 16, ry, rw, rh]));
  for (const w of [1, 2]) assert.equal(new Set([0, 1, 2, 3, 4, 5].map(x => shape(x, w))).size, 3, (w === 2 ? 'big trees' : 'tall trees') + ': three shapes, so a row of them isn’t all the same');
  const fruitTree = drawn(g, 'OBJECT_ART.peachTree(ctx, {x: 2, y: 2, w: 1, h: 1})');
  assert.equal(fruitTree.filter(([c, x, y, w, h]) => c === peach[0] && w === 2 && h === 2).length, 7, 'a peach tree, full of peaches');
  assert.ok(fruitTree.some(([c, x, y]) => c === wood[1] && y < Y + 6 && (x < X + 6 || x > X + 9)), 'its branches');
});

test('the hot springs: pools in the rock, edged with rounded stones where they meet the grass, not a cream border', () => {
  const g = mountainGame({place: 'meadow', x: 5, y: 5, dir: 'up'});
  g.run("enterPlace('hotSprings')");
  const [edge, middle] = get(g, `(() => { const pool = (x, y) => tileAt(x, y).look === 'hotPool', all = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (pool(x, y)) all.push([x, y, pool(x, y - 1) && pool(x, y + 1) && pool(x - 1, y) && pool(x + 1, y)]);
    return [all.find(([x, y, inside]) => !pool(x, y - 1) && pool(x, y + 1)), all.find(([x, y, inside]) => inside)]; })()`);
  const pool = ([x, y]) => drawn(g, `LOOKS.hotPool(ctx, ${x * 16}, ${y * 16}, ${x}, ${y})`).map(([c]) => c);
  assert.ok(!pool(edge).includes('#E9DDB8'), 'no cream border');
  assert.ok(pool(edge).includes('#8C867A') && pool(edge).includes('#7CC46B'), 'stones along its edge, and the grass it meets');
  if (middle) assert.ok(!pool(middle).includes('#8C867A'), 'and none in the middle of a pool');
});

test('ponds and streams: their banks curve round where they turn, not a square corner', () => {
  const g = mountainGame({place: 'meadow', x: 5, y: 5, dir: 'up'});
  const water = (x, y) => drawn(g, `LOOKS.water(ctx, ${x * 16}, ${y * 16}, ${x}, ${y})`), [lip, edge] = get(g, 'BANK_EARTH');
  assert.deepEqual(get(g, '[tileAt(12, 9).look, tileAt(13, 9).look, tileAt(12, 8).look, tileAt(12, 11).look, tileAt(13, 11).look, tileAt(12, 12).look, tileAt(10, 10).look]'),
    ['water', 'post', 'tree', 'water', 'grass', 'grass', 'water'], 'the meadow’s pond, its east end: the top corner and the bottom one');
  for (const [x, y, where, inCorner] of [[12, 9, 'top right', (px, py) => px > 12 * 16 + 10 && py < 9 * 16 + 5], [12, 11, 'bottom right', (px, py) => px > 12 * 16 + 10 && py > 11 * 16 + 10]]){
    const corner = water(x, y), dots = c => corner.filter(([col, px, py, w, h]) => col === c && w === 1 && h === 1 && inCorner(px, py));
    assert.ok(corner.some(([c]) => c === 'clip'), where + ': the grass coming into the corner');
    assert.ok(dots(edge).length >= 5, where + ': the bank’s dark edge following the curve');
    assert.ok(dots(lip).length >= 5, where + ': and its pale lip, outside it');
  }
  assert.equal(water(10, 10).filter(([c]) => c === 'clip').length, 0, 'in the middle of the pond, nothing');
  const g2 = game({place: 'highRoad', x: 16, y: 9, dir: 'up'});
  g2.run("enterPlace('caveNight')");
  assert.deepEqual(get(g2, '[tileAt(22, 7).look, tileAt(23, 7).look]'), ['water', 'moonWater'], 'the cave’s pool at night, the moon shining in it');
  const pool = drawn(g2, 'LOOKS.water(ctx, 352, 112, 22, 7)');
  assert.ok(!pool.some(([c, x, y, w, h]) => c === '#2C6B9E' && x === 352 + 14 && w === 2 && h === 16), 'no bank against the moon, which is water too');
  assert.ok(!pool.some(([c]) => c === lip || c === edge), 'and no earth round a pool in the rock');
});

// A slight improvement to the original look (decided 10 November 2026, after a trial of a new look was taken out: the
// owner found the water's edges poor, ruler-straight, a frame round the water, and liked a bank where the colour changes).
test('the water’s edge: a bank of earth where it meets the ground, wandering against grass, a pixel in, in short runs that carry on from square to square; against rock, as it always was', () => {
  const g = mountainGame({place: 'meadow', x: 5, y: 5, dir: 'up'});
  const water = (x, y) => drawn(g, `LOOKS.water(ctx, ${x * 16}, ${y * 16}, ${x}, ${y})`), [lip, edge] = get(g, 'BANK_EARTH'), DEEP = '#2C6B9E', GLINT = '#8ACFF0';
  assert.deepEqual(get(g, '[tileAt(18, 5).look, tileAt(17, 5).look, tileAt(18, 6).look, tileAt(17, 6).look, tileAt(18, 0).look, tileAt(17, 0).look, tileAt(19, 5).look, tileAt(20, 5).look]'),
    ['water', 'grass', 'water', 'grass', 'water', 'cliffFace', 'water', 'tree'], 'the river: grass on its west bank, at the top the cliff, and trees on its east bank');
  // against grass, to the west: on each of its sixteen rows the lip at the square's edge or a pixel in, the dark edge inside it, then the bank's shadow on the water
  const rowsOf = (x, y, c, from) => { const rows = new Array(16).fill(-1); for (const [col, px, py, w, h] of water(x, y)) if (col === c && w === 1 && px - x * 16 >= from && px - x * 16 <= from + 1) for (let i = 0; i < h; i++) rows[py - y * 16 + i] = px - x * 16 - from; return rows; };
  const a = rowsOf(18, 5, lip, 0), b = rowsOf(18, 6, lip, 0);
  assert.ok(a.every(v => v === 0 || v === 1) && a.includes(0) && a.includes(1), `the bank wanders: ${a.join('')}`);
  assert.equal(rowsOf(18, 5, edge, 1).join(''), a.join(''), 'its dark edge with it');
  assert.equal(rowsOf(18, 5, DEEP, 2).join(''), a.join(''), 'and its shadow on the water (the light comes from the left)');
  const run = [...a, ...b];   // (rows 80 to 111 of the map: runs of three, wherever they fall)
  for (let i = 0; i < run.length; i++) assert.equal(run[i], run[Math.max(0, Math.floor((80 + i) / 3) * 3 - 80)], `row ${80 + i} is as the first of its run of three`);
  assert.notEqual(Math.floor(95 / 3), Math.floor(96 / 3)); assert.equal(Math.floor(96 / 3), Math.floor(98 / 3));   // (a run starts at each multiple of three, so some lie across two squares, such as rows 111 to 113)
  assert.ok(water(18, 5).some(([c]) => c === 'clip'), 'and the grass comes in with it');
  assert.ok(water(18, 5).filter(([c]) => c === lip).length < 16, 'drawn a run at a time, not a pixel at a time');
  // to the east, under the trees: the bank the same, but no shadow on the water on that side
  const east = water(19, 5);
  assert.ok(east.some(([c, px, py, w]) => c === lip && w === 1 && px >= 19 * 16 + 14) && east.some(([c, px, py, w]) => c === edge && w === 1 && px >= 19 * 16 + 13), 'the east bank: its lip and its edge');
  assert.ok(!east.some(([c]) => c === DEEP), 'no shadow there');
  // against the cliff: no earth, the water dark at its edge, its line of light whole
  const top = water(18, 0);
  assert.ok(!top.some(([c]) => c === lip || c === edge), 'no earth against rock');
  assert.ok(top.some(([c, px, py, w, h]) => c === DEEP && px === 18 * 16 && w === 2 && h === 16) && top.some(([c, px, py, w, h]) => c === GLINT && px === 18 * 16 + 2 && w === 1 && h === 16), 'as it always was');
  assert.ok(get(g, 'NO_EARTH').every(l => !get(g, 'GRASSY').includes(l)), 'nothing that’s rock is ground with grass under it');
});

test('the water’s edge elsewhere: damp sand on the shore; earth over the shallows’ pale water, never under it; and the log bridge’s shadow between the banks', () => {
  const g = mountainGame({place: 'meadow', x: 5, y: 5, dir: 'up'});
  const [lip] = get(g, 'BANK_EARTH'), [sandLip, sandEdge] = get(g, 'BANK_SAND');
  const look = (x, y) => drawn(g, `LOOKS[tileAt(${x}, ${y}).look](ctx, ${x * 16}, ${y * 16}, ${x}, ${y})`);
  const find = test => get(g, `(() => { for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if ((${test})(x, y)) return [x, y]; return null; })()`);
  g.run("enterPlace('shore')");
  const bySand = find("(x, y) => tileAt(x, y).look === 'water' && tileAt(x - 1, y).look === 'sand'");
  assert.ok(bySand, 'the river running out over the sand');
  const sandy = look(...bySand);
  assert.ok(sandy.some(([c]) => c === sandLip) && sandy.some(([c]) => c === sandEdge), 'its bank there is damp sand');
  g.run("enterPlace('riverside')");
  assert.deepEqual(get(g, '[tileAt(27, 3).look, tileAt(26, 3).look]'), ['shallows', 'path'], 'the riverside’s brook, clear and shallow');
  const brook = look(27, 3).map(([c]) => c);
  assert.ok(brook.indexOf(lip) > brook.lastIndexOf('rgba(90,175,215,.28)'), 'its bank of earth is over the pale water');
  g.run("enterPlace('darkPines')");
  assert.deepEqual(get(g, '[tileAt(23, 18).look, tileAt(23, 17).look, tileAt(23, 19).look]'), ['water', 'needles', 'water'], 'the dark pines’ stream, where a dead pine will fall across it: the bank above, more of the stream below');
  assert.ok(drawn(g, 'LOOKS.logBridge(ctx, 23 * 16, 18 * 16, 23, 18)').some(([c, x, y, w, h]) => c === '#2C6B9E' && x === 23 * 16 + 11 && y === 18 * 16 + 2 && w === 2 && h === 14), 'the log’s shadow on the water starts under the bank');
});

// The shapes of the water (decided 10 November 2026, after seeing them with their new banks).
test('the hillside’s brook runs off the map at both sides and is never pinched; the meadow’s pond is a rounded rectangle, its fish in it', () => {
  const g = mountainGame({place: 'meadow', x: 5, y: 5, dir: 'up'});
  const wet = (x, y) => get(g, `WATERY.includes(tileAt(${x}, ${y}).look)`);
  for (let y = 8; y <= 12; y++) for (let x = 8; x <= 13; x++) assert.equal(wet(x, y), x >= 9 && x <= 12 && y >= 9 && y <= 11, `the pond is four squares by three: (${x}, ${y})`);
  for (const [x, y, place] of get(g, 'AREA.fish')) if (!place) assert.ok(wet(x, y), `the fish at (${x}, ${y}) is in the pond`);
  g.run("enterPlace('hillside')");
  const rows = x => [34, 35, 36, 37, 38, 39].filter(y => wet(x, y)), cols = get(g, 'COLS');
  assert.ok(wet(0, 37) && wet(0, 38) && wet(cols - 1, 35) && wet(cols - 1, 36), 'the brook reaches the map’s edge, west and east');
  for (let x = 0; x < cols; x++){
    assert.ok(rows(x).length >= 2, `two squares wide or more at column ${x}`);
    if (x) assert.ok(rows(x).filter(y => rows(x - 1).includes(y)).length >= 2, `and as wide where it bends, between columns ${x - 1} and ${x}`);
  }
});

test('the sea of clouds below the mountain: long thin wisps running on from square to square, not round puffs', () => {
  const g = game({place: 'highRoad', x: 16, y: 9, dir: 'up'});
  const wisps = x => drawn(g, `cloudSea(ctx, ${x * 16}, 32, ${x}, 2)`).filter(([c]) => c === '#EAF0F5' || c === '#F4F7FA');
  const [a, b] = [wisps(3), wisps(4)];
  assert.ok(a.length && [...a, ...b].every(([c, x, y, w, h]) => c === '#EAF0F5' && h === 1 && w >= 12), 'each a long thin wisp');
  assert.ok(a.some(([c, x, y, w]) => x < 64 && x + w > 64 && b.some(([c2, x2, y2, w2]) => x2 === x && y2 === y && w2 === w)), 'one running on from one square into the next');
});

test('things stand on the ground round them, and shadows are see-through (6 November 2026, after playing it: chopping blocks and a boulder on squares of grass in the immortal’s cave, green shadows under its peach trees)', () => {
  const g = game({place: 'highRoad', x: 16, y: 9, dir: 'up'});
  const base = (x, y) => drawn(g, `LOOKS[tileAt(${x}, ${y}).look](ctx, ${x * 16}, ${y * 16}, ${x}, ${y})`).map(([c]) => c);
  g.run("enterPlace('cave')");
  for (const [x, y, what] of [[23, 12, 'a chopping block'], [25, 12, 'a chopping block'], [27, 13, 'the boulder']]){
    const fills = base(x, y);
    assert.equal(fills[0], '#A3AC9C', what + ' in the cave: on its mossy stone');
    assert.ok(!fills.includes('#7CC46B') && !fills.includes('#72B262'), what + ': no grass under it');
  }
  const tree = drawn(g, 'OBJECT_ART.rockPeach(ctx, {x: 3, y: 7, w: 1, h: 1})').map(([c]) => c);
  assert.ok(!tree.includes('#5DA651') && tree.includes(get(g, 'ROCK_SHADOW')), 'a peach tree in the cave: its shadow see-through, not green');
  g.run("enterPlace('villageLane')");
  assert.deepEqual([g.run('tileAt(4, 12).look'), base(4, 12)[0]], ['shoreRock', '#7CC46B'], 'the village lane’s rock, in the long grass: on grass, not a square of sand');
  const home = mountainGame({place: 'meadow', x: 5, y: 5, dir: 'up'});
  home.run("enterPlace('pineWood')");
  assert.equal(drawn(home, 'LOOKS.boulder(ctx, 400, 288, 25, 18)')[0][0], '#72B262', 'a boulder among the pines: on their floor');
  home.run("enterPlace('meadow')");
  const boulders = get(home, '(() => { const out = []; for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (tileAt(x, y).look === "boulder") out.push([x, y]); return out; })()');
  assert.ok(boulders.length && boulders.every(([x, y]) => drawn(home, `LOOKS.boulder(ctx, ${x * 16}, ${y * 16}, ${x}, ${y})`)[0][0] === '#7CC46B'), 'and the meadow’s boulders on its grass, as they were');
});
