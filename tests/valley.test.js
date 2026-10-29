// Chapter 1: the bees' valley, 百花谷 (the bees' step 2, 25 October 2026). At the end of the riverside, the way east along
// the stream, it has rock all round, beds of flowers to look at, and tall flowers in patches all over, where the wasps (and
// next, the bees) hide, so you never see either till it comes out: wasps jump out to fight by chance, as snakes do from long
// grass. Tall flowers have grown across the way in, between the rocks, so you meet a wasp or two. A swarm of bees hangs in
// front of the queen's old hollow tree, in a nook of the cliff, and won't let you by.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const BEES_BEGUN = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, shop: 3, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bees: 1};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '水', '河', '猴子', '朋友', '桥', '蝴蝶', '同学', '棍子'];
// A game where the hungry monkey has sent you east to find the bees (area: more progress), standing at pos
function game(pos, area = {}, known = KNOWN){
  const w = Object.fromEntries(known.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 30, started: true, w, met: ['rabbit', 'butterfly'], friends: ['butterfly'], areas: {1: {...BEES_BEGUN, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__sounds = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w + (o.note ? ' (' + o.note + ')' : '')); rec(w).lv = Math.max(rec(w).lv || 0, 1); }");
  g.run("SFX.buzz = () => { __sounds.push('buzz'); }");
  g.run("globalThis.__said = []; globalThis.__hints = []; showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); if (o.hint) __hints.push(o.hint); }");   // (who says what, and the hints under it)
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
const face = (g, x, y, dir) => g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`);
const press = (g, x, y, dir) => { face(g, x, y, dir); return play(g, 'interact(...facing()).then(runEvents)'); };
const item = (g, re) => get(g, `areaChecklist().find(([t]) => ${re}.test(t)) || null`);

test('at the end of the riverside, the way goes on into the bees’ valley; the first time, the butterfly flutters in after you and tells you about it, and the checklist ticks it off', async () => {
  const g = game({place: 'riverside', x: 46, y: 7, dir: 'right'});
  assert.deepEqual(get(g, 'getTasks().map(t => [t.text, t.target])'), [['Follow the stream east, along the riverside, to find where bees live', [47, 7]]],
    'the task’s arrow points the way on, at the riverside’s end');
  assert.deepEqual(item(g, /Follow the stream east/), ['Follow the stream east to find where bees live', false, false, true]);
  assert.deepEqual(get(g, "ALL_NPCS.filter(n => n.id === 'guide').map(n => [n.place, n.x, n.y, n.look, n.flies])"), [['flowerValley', 0, 10, '蝴蝶', true]],
    'a butterfly, at the valley’s way in, as you come');
  await play(g, 'arrive(47, 7).then(runEvents)');
  assert.deepEqual(get(g, '[PLACE, pl.x, pl.y, pl.dir, here().bees]'), ['flowerValley', 1, 10, 'right', 2], 'in the valley, at the way in, the bees’ valley found');
  assert.deepEqual(get(g, 'PLACES[PLACE].name'), {zh: '百花谷', py: 'Bǎihuā Gǔ', en: 'Valley of a Hundred Flowers'});
  assert.deepEqual(get(g, '__said'), ['guide: 花里有蜜蜂，也有黄蜂！'], 'the butterfly: there are bees in the flowers, and wasps too! (called 蝴蝶, as it looks like one)');
  assert.deepEqual(get(g, "animalName('guide')"), {zh: '蝴蝶', py: 'húdié'});
  assert.ok(!get(g, '__notes').some(t => /^card: /.test(t)), 'you know 蝴蝶 already: no card');
  assert.match(get(g, '__notes').join(' '), /A valley full of flowers! Six bees are hiding in the tall flowers, and wasps too\. Where the tall flowers shake, a bee is hiding: walk in to meet it\. Make friends with all six bees! Each one stays out over the flowers once you’ve met it\. Watch out for the wasps: they zoom out to fight\./);
  assert.deepEqual(get(g, "[NPCS.map(n => n.id), ALL_NPCS.find(n => n.id === 'guide').place]"), [[], 'gone'], 'and it flutters back the way you came, to its flowers');
  assert.deepEqual(get(g, '__sounds'), ['buzz'], 'with the hum of bees');
  assert.equal(item(g, /Follow the stream east/)[1], true, 'ticked off');
  assert.deepEqual(get(g, 'getTasks().map(t => [t.text, t.target])'), [['Make friends with the six bees hiding in the tall flowers (0/6)', null]], 'the bees: no arrow, finding them is the game');
  assert.deepEqual(item(g, /six/), ['Make friends with the six bees in their valley (0/6)', false, false, true]);
  g.run('__notes.length = 0');
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__notes'), [], 'only the first time');
  face(g, 1, 10, 'left');
  await play(g, 'arrive(0, 10).then(runEvents)');
  assert.deepEqual(get(g, '[PLACE, pl.x, pl.y]'), ['riverside', 46, 7], 'and back the way you came');
});

test('a game that passed the butterfly by on the riverside: it teaches 蝴蝶 as it flutters into the valley after you', async () => {
  const g = game({place: 'riverside', x: 46, y: 7, dir: 'right'}, {}, KNOWN.filter(w => w !== '蝴蝶'));
  await play(g, 'arrive(47, 7).then(runEvents)');
  assert.deepEqual(get(g, '__notes').slice(0, 1), ['card: 蝴蝶 (A butterfly has fluttered after you, from the wildflowers on the riverside!)'], 'its card first, said straight away');
  assert.deepEqual(get(g, '__said'), ['guide: 花里有蜜蜂，也有黄蜂！'], 'then what it says');
  assert.ok(g.run("lvl('蝴蝶') >= 1"));
});

test('tall flowers have grown across the way in, between the rocks: there’s no way round them', () => {
  const g = game({place: 'flowerValley', x: 1, y: 10, dir: 'right'}, {bees: 2});
  assert.equal(g.run('tileAt(6, 10).look'), 'tallFlowers');
  // every way from the way in to the rest of the valley, never stepping in tall flowers
  const reach = get(g, `(() => { const seen = new Set(['1,10']), todo = [[1, 10]];
    while (todo.length){ const [x, y] = todo.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const a = x + dx, b = y + dy, k = a + ',' + b;
      if (seen.has(k) || !walkable(a, b) || tileAt(a, b).look === 'tallFlowers') continue; seen.add(k); todo.push([a, b]); } }
    return seen.size; })()`);
  assert.ok(reach < 12, `only the way in itself, round the tall flowers (reached ${reach} squares)`);
  assert.ok(g.run('walkable(12, 9) && walkable(25, 8)'), 'the valley beyond: open ground');
});

test('wasps jump out of the tall flowers to fight; the first time, its card teaches 黄蜂', async () => {
  const g = game({place: 'flowerValley', x: 6, y: 10, dir: 'right'}, {bees: 2});
  assert.deepEqual(get(g, "tileAt(6, 10).wild"), ['wasp'], 'the tall flowers: where wasps live');
  assert.deepEqual(get(g, 'ENEMIES.wasp.word'), '黄蜂');
  assert.equal(g.run('sceneLook("花")'), ' flowers', 'a battle here: among the flowers, the valley’s cliffs behind');
  g.run("fight = async id => { __notes.push('fight: ' + id); await showNotice(ENEMIES[id].word, {note: fill(ENEMIES[id].meetNote)}); return 'won'; }");   // (the battle itself: tests/battle.test.js)
  g.run('Math.random = () => 0');   // (as soon as it can: five steps in tall flowers)
  for (const [x, y] of [[6, 10], [7, 10], [8, 10], [8, 11], [9, 11]]){ face(g, x, y, 'right'); await play(g, `arrive(${x}, ${y})`); if (get(g, '__notes').length) break; }
  assert.deepEqual(get(g, '__notes'), ['fight: wasp', 'card: 黄蜂 (A wasp zooms out of the tall flowers!)']);
  assert.ok(g.run("lvl('黄蜂') >= 1"));
  assert.deepEqual(get(g, "MADE['黄蜂'].parts.map(p => p[0] + ' ' + p[2])"), ['黄 yellow', '蜂 bee'], 'how it’s made: 黄 (yellow, as in 黄色) + 蜂 (bee), a yellow bee');
  assert.ok(g.run("alike('黄蜂', '蜜蜂')"), 'a wasp and a bee are look-alikes: never two answers in one question');
});

test('a swarm of bees hangs in front of the queen’s old hollow tree, and won’t let you by; A at it says why', async () => {
  const g = game({place: 'flowerValley', x: 25, y: 8, dir: 'up'}, {bees: 2});
  assert.equal(g.run('tileAt(25, 7).look'), 'swarm');
  assert.ok(!g.run('walkable(24, 7) || walkable(25, 7) || walkable(26, 7) || walkable(27, 7)'), 'right across the nook’s mouth');
  assert.equal(g.run('pathTo([25, 8], [25, 6]).length'), 0, 'no way round it to the old tree');
  assert.deepEqual(get(g, "mapObjects().filter(o => o.look === 'hollowTree').map(o => [o.x, o.y, o.w, o.h])"), [[25, 4, 2, 2]], 'the old hollow tree: one big tree, two squares by two');
  await press(g, 25, 8, 'up');
  assert.deepEqual(get(g, '__sounds'), ['buzz']);
  assert.match(get(g, '__notes').join(' '), /A swarm of bees hangs in front of the old tree, buzzing\. They won’t let you by till the six bees hiding in the tall flowers are your friends \(0 of 6\)\./);
});

// A bee's questions (right: whether you win it over), noted with what you're told if you don't
const stubGame = (g, right) => g.run(`encounter = async foe => { __notes.push('play: ' + foe.hz + (foe.another ? ', another' : ''));
  if (!${right} && foe.lose) __notes.push('lose: ' + fill(foe.lose)); if (${right}) { if (!S.friends.includes(foe.id)) S.friends.push(foe.id); } return ${right}; }`);   // (the questions themselves: tests/encounter.test.js)
// A bee coming out of the tall flowers: its rustle set where it hides (at), then you step in from the left, and it comes out
// in front of you, if it can
async function meetBee(g, right = true, [x, y] = [15, 11]){
  g.run(`rustle = {x: ${x}, y: ${y}, a: ANIMALS.find(a => a.id === 'bee')}`);
  stubGame(g, right);
  face(g, x, y, 'right');
  await play(g, `arrive(${x}, ${y}).then(runEvents)`);
}
const SIX = [[15, 11], [9, 14], [19, 15], [25, 14], [12, 18], [20, 16]];   // where six bees hide, far apart (each comes out on the square to its right)

test('only bees hide in the valley’s tall flowers, the flowers shaking where one is; step in and it buzzes out, never a wasp there', async () => {
  const g = game({place: 'flowerValley', x: 12, y: 13, dir: 'up'}, {bees: 2});
  assert.deepEqual(get(g, "tileAt(15, 11).animals"), ['bee']);
  g.run('Math.random = () => 0');
  for (const [x, y] of [[12, 12], [12, 11], [12, 10], [12, 9]]){ face(g, x, y, 'up'); await play(g, `arrive(${x}, ${y})`); }   // (four steps: then one hides)
  assert.equal(g.run('rustle && rustle.a.id'), 'bee', 'a bee hides, and only a bee: the rabbit hides in grass, not here');
  assert.equal(g.run('tileAt(rustle.x, rustle.y).look'), 'tallFlowers');
  assert.ok(g.run('Math.abs(rustle.x - pl.x) + Math.abs(rustle.y - pl.y) >= 3'), 'at least three steps away');
  g.run("wildSteps = 99; fight = async id => { __notes.push('fight: ' + id); return 'won'; }");   // (a wasp would jump out on the very next step)
  await meetBee(g);
  assert.deepEqual(get(g, '__notes').slice(0, 2), ['card: 蜜蜂 (A bee buzzes out of the tall flowers! Answer its questions to make friends.)', 'play: 蜜蜂'],
    'the first teaches 蜜蜂; then its questions; and no wasp on the square where it was hiding');
});

test('each bee you make friends with is counted aloud, 一！ to 一，二，三，四，五，六！; the sixth sends you to find the queen, they fly off to join the swarm, and it flies aside', async () => {
  const g = game({place: 'flowerValley', x: 14, y: 11, dir: 'right'}, {bees: 2});
  for (const at of SIX) await meetBee(g, true, at);
  assert.deepEqual(get(g, '__said').filter(t => t.startsWith('player')), ['player: 一！', 'player: 一，二！', 'player: 一，二，三！', 'player: 一，二，三，四！', 'player: 一，二，三，四，五！', 'player: 一，二，三，四，五，六！'],
    'you count your bee friends aloud, each time one more');
  assert.match(get(g, '__notes').join(' '), /Your first 蜜蜂 \(bee\) friend! It stays out over the flowers now\. Five more bees to make friends with!.*Five 蜜蜂 \(bee\) friends! Just one more to make friends with\./);
  assert.equal(get(g, '__notes').filter(t => t === 'play: 蜜蜂, another').length, 5, 'each one after the first: another bee, a new friend');
  assert.deepEqual(get(g, '__hints'), [1, 2, 3, 4, 5].map(n => `Another 蜜蜂 (bee), a new one! Answer its questions to make friends with it too (${n} of 6 so far).`),
    'before each one’s questions after the first (whose card teaches 蜜蜂): another bee, a new one, never your friend wanting to play again');
  assert.ok(get(g, '__said').filter(t => t === 'bee: 我们玩吧！').length === 6, 'each bee says it wants to play, before its questions');
  assert.deepEqual(get(g, '__said').filter(t => t.startsWith('bee') && t !== 'bee: 我们玩吧！'), ['bee: 去找蜂王吧！'], 'the sixth: go and find the queen!');
  assert.deepEqual(get(g, '[here().beeFriends, here().bees, S.friends.filter(f => f === "bee").length, here().out]'), [6, 3, 1, {}],
    'six bee friends (one friend in your Friends list, the bee), flown off to the swarm: out no more');
  assert.ok(g.run('walkable(25, 7) && walkable(26, 7)'), 'the swarm has flown aside: the way to the old tree is open');
  assert.match(get(g, '__notes').join(' '), /Your six 蜜蜂 \(bee\) friends fly off to join the swarm by the old tree, and the swarm flies aside: the way to it is open!/);
  assert.equal(item(g, /six/)[1], true, 'ticked off');
  g.run('__said.length = 0; __hints.length = 0');
  await meetBee(g);
  assert.deepEqual([get(g, 'here().beeFriends'), get(g, '__said'), get(g, '__hints'), get(g, 'here().out')], [6, ['bee: 我们玩吧！'], ['Your 朋友 (friend) wants to play again! Answer its questions.'], {}],
    'after six, a bee comes out to play now and then, like your other friends: no more counting, and it doesn’t stay out');
  assert.match(g.run('goalText()'), /Find out who lives in the old hollow 树 \(tree\), up in the bees’ valley/, 'next: who lives in the old tree?');
});

test('each bee you meet stays out, hovering where it came out, so you can see they’re six different bees; you can’t walk through one, and A meets it', async () => {
  const g = game({place: 'flowerValley', x: 14, y: 11, dir: 'right'}, {bees: 2});
  await meetBee(g);
  assert.deepEqual(get(g, 'here().out'), {bee: [[16, 11, 1]]}, 'your first bee friend, out where it came out, in front of you');
  for (const at of SIX.slice(1, 3)) await meetBee(g, true, at);
  assert.deepEqual(get(g, 'here().out'), {bee: [[16, 11, 1], [10, 14, 1], [20, 15, 1]]}, 'each new one out where it came out');
  assert.deepEqual(get(g, 'outHere().map(o => [o.x, o.y, o.friend])'), [[16, 11, true], [10, 14, true], [20, 15, true]]);
  assert.ok(!g.run('walkable(16, 11)') && g.run("animalAt(16, 11).id === 'bee'"), 'you can’t walk through one');
  assert.equal(g.run('promptFor(16, 11)'), 'Meet');
  g.run('__hints.length = 0; __notes.length = 0');
  await press(g, 15, 11, 'right');
  assert.deepEqual(get(g, '__hints'), ['Your 朋友 (friend) wants to play again! Answer its questions.'], 'one that’s your friend already: this time it is the same bee');
  assert.deepEqual(get(g, '[here().beeFriends, __notes]'), [3, ['play: 蜜蜂']], 'no more counting for it');
  g.run('PLACE = "riverside"');
  assert.deepEqual(get(g, 'outHere()'), [], 'only in their valley');
});

test('lose a bee’s game, and it stays out, with a ! over it, till you play again: A at it; no more bees hide while all those still to make friends with are out', async () => {
  const g = game({place: 'flowerValley', x: 14, y: 11, dir: 'right'}, {bees: 2});
  await meetBee(g, false);
  assert.deepEqual(get(g, '[here().beeFriends, here().out]'), [0, {bee: [[16, 11, 0]]}], 'not your friend yet, but it stays out where it came out');
  assert.ok(get(g, '__notes').includes('lose: The 蜜蜂 (bee) hovers over the flowers: it still wants to play. Press A at it to try again.'));
  assert.ok(g.run("outAt(16, 11) && !outAt(16, 11).friend"), 'one that still wants to play (drawn with a ! over it)');
  g.run('__hints.length = 0; __notes.length = 0');
  stubGame(g, true);
  await press(g, 15, 11, 'right');
  assert.deepEqual(get(g, '__hints'), ['This 蜜蜂 (bee) still wants to play! Answer its questions to make friends (0 of 6 so far).']);
  assert.deepEqual(get(g, '[here().beeFriends, here().out]'), [1, {bee: [[16, 11, 1]]}], 'won over: your first bee friend, still out where it was');
  // five friends out, and the sixth out too, waiting: nothing more hides, so you go back to it
  g.run('here().beeFriends = 5; here().out.bee = [[16, 11, 1], [10, 14, 1], [20, 15, 1], [26, 14, 1], [13, 18, 1], [21, 16, 0]]; rustle = null; stepsSince = 99; Math.random = () => 0');
  g.run('hideAnimal()');
  assert.equal(g.run('rustle'), null, 'the last bee is out already, waiting for you');
  g.run('here().out.bee.pop(); hideAnimal()');
  assert.equal(g.run('rustle && rustle.a.id'), 'bee', 'with one still hiding, the flowers shake where it is');
  assert.ok(g.run('!outAt(rustle.x, rustle.y)'), 'never where a bee is out');
});

test('a bee never stays out where it would shut a way: at the way in, it goes back into the flowers instead', async () => {
  const g = game({place: 'flowerValley', x: 2, y: 10, dir: 'right'}, {bees: 2});
  assert.ok(g.run('keepsClear(3, 10)'), 'the way in is two squares wide: one can stay');
  g.run('here().out.bee = [[3, 11, 0]]');
  assert.ok(!g.run('keepsClear(3, 10)'), 'not both: that would shut the way in');
  assert.ok(!g.run('keepsClear(0, 10)'), 'nor on a way out');
  stubGame(g, false);
  await play(g, "wildAppears(ANIMALS.find(a => a.id === 'bee'), {x: 3, y: 10, d: 'right'})");
  assert.deepEqual(get(g, 'here().out'), {bee: [[3, 11, 0]]}, 'it doesn’t stay');
  assert.ok(!get(g, '__notes').some(t => t.startsWith('lose:')), 'it goes back into the flowers, as an animal does');
});

test('the valley’s flowers: tall flowers hide your feet; the beds are low flowers you walk on, each its own colour', () => {
  const g = game({place: 'flowerValley', x: 1, y: 10, dir: 'right'}, {bees: 2});
  assert.ok(get(g, 'HIDES_FEET').includes('tallFlowers'));
  const looks = get(g, "[...new Set(MAP.join('').split('').map(c => LEGEND[c].look))].filter(l => /^(red|yellow|white|pink|blue|orange)Bed$/.test(l)).sort()");
  assert.deepEqual(looks, ['blueBed', 'orangeBed', 'pinkBed', 'redBed', 'whiteBed', 'yellowBed']);
  assert.ok(get(g, "Object.values(LEGEND).filter(t => /^(red|yellow|white|pink|blue|orange)Bed$/.test(t.look)).every(t => t.walk && !t.wild)"), 'you can walk on them, and nothing jumps out');
});
