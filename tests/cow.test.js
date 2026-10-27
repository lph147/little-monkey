// Chapter 1: the cow, a rescue (planned 26 October 2026; versions 1 and 2 built the same day). Once the feast's quests
// begin, the thirsty monkey has come up from the meadow to the home ground, by the road, with a !: 山上有牛！ (牛 just for
// listening). The troop clears the bushes past the bridge at the bottom of the home ground, the way south to the pasture
// (牧场): a way winding down through dark pines, long grass grown over it three times (wolves too), then out between two
// big rocks into a sunny pasture with a spring. The first time you go in, a cow moos beyond the pines. By its spring you
// find the cow: 牛, said as you meet it, and it says 我怕狼！ (I'm scared of wolves!). Win its word game, and it trusts
// you: 好！我们去你家吧！, and it follows you home. As you come into the gap between the rocks, a wolf leaps out (just the
// once); lose any battle on the way, and the cow runs back to its spring, till you fetch it. Home, it stays by the thirsty
// monkey, till the troop builds it a pen by the road as you watch (version 3), and you lead it in: 这是你的家！, it thanks
// you, and gives you some of its milk (牛奶), which the thirsty monkey wants to drink (我要喝牛奶！); the rest is for the
// feast, on a second table the troop sets up beside the first. In its pen: 我有家了！.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const FEAST = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bees: 1};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '水', '河', '猴子', '朋友', '桥', '同学', '棍子', '有', '没有', '狼',
  '我', '要', '吃', '桌子', '家', '没关系', '谢谢', '不客气'];
// A game with the feast's quests begun (area: more progress; more: more of the save), standing at pos. Its word game asks
// (__asks) and you say Play if __play; you win it if __win. A battle (__fights: its enemy and what's said as it begins) ends
// as __fight says: lost, and you're carried back to rest under the big tree, as in a real one.
function game(pos, area = {}, more = {}){
  const w = Object.fromEntries([...KNOWN, ...(more.knows || [])].map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 30, started: true, areas: {1: {...FEAST, ...area}}, pos, w, following: more.following || [], friends: more.friends || []}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__sounds = []; globalThis.__asks = []; globalThis.__fights = []");
  g.run("globalThis.__play = false; globalThis.__win = true; globalThis.__fight = 'won'");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w + (o.note ? ' (' + o.note + ')' : '') + (o.quiet ? ', quiet' : ', said')); rec(w).lv = Math.max(rec(w).lv, 1); }");
  g.run("for (const k of ['moo', 'howl', 'chime', 'bump', 'encounter', 'turn']) SFX[k] = () => { __sounds.push(k); }");
  g.run("globalThis.__said = []; showDialog = async (who, line) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");   // (who says what)
  g.run("confirmBox = async (who, text) => { __asks.push(text); return __play; }; encounter = async foe => { if (__win && !S.friends.includes(foe.id)) S.friends.push(foe.id); return __win; }");
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; gapQ = async o => { __said.push('gap: ' + o.t.join('') + ' (' + o.gap + ')'); return true; }");
  g.run("fight = async (id, opts) => { __fights.push([id, opts.meet || null]); if (__fight === 'lost'){ S.pos = {place: 'homeGround', x: 17, y: 8, dir: 'up'}; placePlayer(); } return __fight; }");
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
const walkTo = (g, x, y, dir) => {   // a step onto the square next to you, anyone following you stepping after you
  g.run(`followersStep(performance.now()); Object.assign(pl, {x: ${x}, y: ${y}, px: ${x} * T, py: ${y} * T, dir: '${dir}', mv: null})`);
  return play(g, `arrive(${x}, ${y}).then(runEvents)`);
};
const pressAgain = g => play(g, 'interact(...facing()).then(runEvents)');   // A again, where you stand
const item = (g, re) => get(g, `areaChecklist().find(([t]) => ${re}.test(t)) || null`);
const npc = (g, id) => get(g, `(n => n && [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === '${id}'))`);
const cowTasks = g => get(g, "getTasks().filter(t => /^cow/.test(t.id)).map(t => t.text)");
const COW_HOME = '好！我们去你家吧！';

test('once the feast’s quests begin, the thirsty monkey is by the road at the home ground, with news: 山上有牛！, and the troop clears the way south', async () => {
  const before = game({place: 'homeGround', x: 21, y: 10, dir: 'down'}, {feast: 2, bees: 0});
  assert.equal(npc(before, 'thirsty')[0], 'meadow', 'in the meadow, till the feast’s quests begin');
  const g = game({place: 'homeGround', x: 21, y: 10, dir: 'down'});
  assert.deepEqual(npc(g, 'thirsty'), ['homeGround', 21, 11], 'up at the home ground, by the road');
  assert.equal(g.run("AREA.bubbles.thirsty.find(b => matches(b.if)).show"), '!');
  assert.equal(g.run('tileAt(16, 21).look'), 'bush', 'the way south: thick bushes, till then');
  assert.ok(!g.run('walkable(16, 21)'));
  await press(g, 21, 10, 'down');
  assert.deepEqual(get(g, '__said'), ['thirsty: 山上有牛！'], 'there’s a cow on the mountain!');
  assert.equal(g.run("lvl('牛')"), 0, '牛 just for listening, till you find the cow');
  assert.equal(get(g, 'here().cow'), 1);
  assert.match(get(g, '__notes').join(' '), /He heard a cow mooing beyond the pines, while he was looking for fresh water\. It’s lost and all alone, and wolves live in those pines!/);
  assert.match(get(g, '__notes').join(' '), /The troop has cleared a way south, over the bridge at the bottom of the home ground\. Go and find the cow!/);
  assert.equal(g.run('tileAt(16, 21).look'), 'path', 'the bushes are gone');
  assert.equal(g.run("AREA.bubbles.thirsty.find(b => matches(b.if))"), undefined, 'his ! has gone');
  assert.deepEqual(cowTasks(g), ['Find the lost cow: south over the bridge, and through the pines'], 'cow: just its English, till you’ve caught it');
  assert.deepEqual(item(g, /lost cow/), ['Find the lost cow on the mountain', false, false, true]);
  g.run('__said.length = 0');
  await press(g, 21, 10, 'down');
  assert.deepEqual(get(g, '__said'), ['thirsty: 山上有牛！'], 'again, with what to do under it');
});

test('south, over the bridge: the pasture (牧场), where a cow moos beyond the pines the first time you go in', async () => {
  const g = game({place: 'homeGround', x: 16, y: 20, dir: 'down'}, {cow: 1});
  await play(g, 'arrive(16, 21).then(runEvents)');
  assert.deepEqual([g.run('PLACE'), get(g, '[S.pos.x, S.pos.y, S.pos.dir]')], ['pasture', [16, 1, 'down']], 'in at the top, among the pines');
  assert.deepEqual(get(g, 'PLACES.pasture.name'), {zh: '牧场', py: 'mùchǎng', en: 'The pasture'});
  assert.ok(get(g, '__sounds').includes('moo'), 'a moo, from beyond the pines');
  assert.match(get(g, '__notes').join(' '), /Dark pines, and long grass where wolves hide\. Somewhere beyond them, a cow moos, long and sad…/);
  assert.equal(get(g, 'here().cow'), 2);
  g.run('__sounds.length = 0; __notes.length = 0');
  await play(g, 'runEvents()');
  assert.deepEqual([get(g, '__sounds'), get(g, '__notes')], [[], []], 'only the first time');
  assert.deepEqual(get(g, "LEGEND.n.wild"), ['wolf', 'wolf', 'snake', 'spider'], 'its long grass: wolves come down from the pines');
  assert.deepEqual(get(g, '[PLACES.pasture.battleMusic, PLACES.pasture.backdrop]'), ['pineBattle', 'pines'], 'battles among the pines, as in the pine wood');
  for (const [x, y] of [[8, 5], [9, 6], [15, 8], [16, 9], [20, 12], [21, 13]]) assert.equal(g.run(`tileAt(${x}, ${y}).look`), 'longGrass', `long grass grown over the way at ${x},${y}`);
  for (const [x, y] of [[19, 13], [22, 13], [19, 14], [22, 14]]) assert.ok(!g.run(`walkable(${x}, ${y})`), `the big rocks either side of the gap, at ${x},${y}`);
  assert.equal(g.run('tileAt(28, 18).look'), 'water', 'the spring');
  assert.deepEqual(npc(g, 'cow'), ['pasture', 31, 18], 'the cow, by its spring');
  assert.equal(g.run("AREA.bubbles.cow.find(b => matches(b.if)).show"), '!');
  g.run("S.pos = {place: PLACE, x: 16, y: 1, dir: 'up'}; placePlayer()");
  await play(g, 'arrive(16, 0).then(runEvents)');
  assert.deepEqual([g.run('PLACE'), get(g, '[S.pos.x, S.pos.y]')], ['homeGround', [16, 20]], 'back up to the home ground, below the bridge');
});

test('by its spring, you find the cow: 牛, said as you meet it, then 我怕狼！ and its word game, to win its trust', async () => {
  const g = game({place: 'pasture', x: 31, y: 17, dir: 'down'}, {cow: 2});
  await press(g, 31, 17, 'down');   // (Not now, to its game)
  assert.equal(get(g, '__notes')[0], 'card: 牛 (A cow, lost and all alone, by the spring. It looks up at you, trembling.), said', 'its card, said straight away: you found it');
  assert.deepEqual(get(g, '__said'), ['cow: 我怕狼！'], 'I’m scared of wolves!');
  assert.deepEqual(get(g, '__asks'), ['The 牛 (cow) is too scared of the wolves to go anywhere. Play a word game with it, to win its trust? Win, and it follows you home.']);
  assert.equal(get(g, 'here().cow'), 3);
  assert.equal(g.run("AREA.bubbles.cow.find(b => matches(b.if)).show"), '!', 'it waits for you to play, with a !');
  assert.deepEqual(cowTasks(g), ['Win the 牛 (cow)’s trust with its word game, by its spring in the pasture']);
  assert.deepEqual(item(g, /lost 牛/), ['Find the lost 牛 (cow) on the mountain', true, false, true], 'found: ticked off');
  assert.deepEqual(item(g, /trust/), ['Win the 牛 (cow)’s trust with its word game', false, false, true]);
  assert.equal(get(g, "AREA.found['牛']"), 'Lost and all alone by its spring, in the pasture south of the home ground.', 'its page in the Word Scroll says where');
  g.run('__said.length = 0; __notes.length = 0; __asks.length = 0; __win = false; __play = true');
  await press(g, 31, 17, 'down');
  assert.deepEqual([get(g, '__said'), get(g, '__asks').length], [['cow: 我怕狼！'], 1], 'again: no card, 我怕狼！ and its game');
  assert.deepEqual(get(g, '[here().cow, S.following]'), [3, []], 'lost: it stays by its spring, till you win');
});

test('win the cow’s word game, and it trusts you: 好！我们去你家吧！, and it follows you, a friend', async () => {
  const g = game({place: 'pasture', x: 31, y: 17, dir: 'down'}, {cow: 3}, {knows: ['牛']});
  g.run('__play = true');
  await press(g, 31, 17, 'down');
  assert.deepEqual(get(g, '__said'), ['cow: 我怕狼！', `cow: ${COW_HOME}`], 'OK! Let’s go to your home!');
  assert.deepEqual(get(g, '[here().cow, S.following, S.friends]'), [4, ['cow'], ['cow']], 'it follows you, your friend now');
  assert.match(get(g, '__notes').join(' '), /The 牛 \(cow\) trusts you, and follows you! Lead it home to the thirsty monkey, back through the pines\. Watch out for wolves!/);
  assert.equal(g.run("AREA.bubbles.cow.find(b => matches(b.if))"), undefined, 'no ! now');
  assert.deepEqual(cowTasks(g), ['Lead the 牛 (cow) home to the thirsty monkey, back through the pines. Watch out for wolves!']);
  assert.deepEqual(get(g, "getTasks().find(t => t.id === 'cow4').target"), [16, 0], 'its arrow: the way home, out at the top');
  assert.deepEqual(item(g, /trust/), ['Win the 牛 (cow)’s trust with its word game', true, false, true]);
  assert.deepEqual(item(g, /past the wolves/), ['Lead the 牛 (cow) home, past the wolves', false, false, true]);
  g.run('__said.length = 0');
  await pressAgain(g);   // (A at it again, before you walk on)
  assert.deepEqual(get(g, '__said'), [`cow: ${COW_HOME}`]);
});

test('leading the cow home: a wolf leaps out at the gap between the rocks (just the once), and the way is clear', async () => {
  const g = game({place: 'pasture', x: 20, y: 16, dir: 'up'}, {cow: 4}, {knows: ['牛'], following: ['cow'], friends: ['cow']});
  await walkTo(g, 20, 15, 'up');
  assert.deepEqual(get(g, '__fights'), [], 'not yet, on the trail below the rocks');
  await walkTo(g, 20, 14, 'up');
  assert.deepEqual(get(g, '__fights'), [['wolf', 'A {狼} leaps out of the long grass between the rocks! It wants the {牛}!']], 'into the gap: a wolf leaps out at you');
  assert.ok(get(g, '__sounds').includes('encounter'), 'with a !, as a wild one does from long grass');
  assert.equal(get(g, 'here().cowWolf'), 1);
  assert.match(get(g, '__notes').join(' '), /The 牛 \(cow\) is safe, and the way home is clear\. Lead it on, back through the pines!/);
  assert.deepEqual(get(g, 'S.following'), ['cow'], 'still following you');
  await walkTo(g, 20, 13, 'up');
  assert.equal(get(g, '__fights').length, 1, 'gone for good');
  const off = game({place: 'pasture', x: 20, y: 15, dir: 'up'}, {cow: 4}, {knows: ['牛'], friends: ['cow']});
  await walkTo(off, 20, 14, 'up');
  assert.deepEqual(get(off, '__fights'), [], 'only while the cow is following you');
});

test('lose a battle while leading the cow home, and it runs back to its spring; talk to it there, and it follows you again', async () => {
  const g = game({place: 'pasture', x: 20, y: 15, dir: 'up'}, {cow: 4}, {knows: ['牛'], following: ['cow'], friends: ['cow']});
  g.run("__fight = 'lost'");
  await walkTo(g, 20, 14, 'up');
  assert.deepEqual([g.run('PLACE'), get(g, '[S.pos.x, S.pos.y]')], ['homeGround', [17, 8]], 'you rest under the big tree');
  assert.deepEqual(get(g, '[S.following, here().cow, here().cowWolf]'), [[], 4, 0], 'without the cow: it still trusts you, and the wolf’s still there');
  assert.deepEqual(npc(g, 'cow'), ['pasture', 31, 18], 'back by its spring');
  assert.match(get(g, '__notes').join(' '), /Frightened, the 牛 \(cow\) ran back to its spring in the pasture\. Go and fetch it again!/);
  assert.deepEqual(cowTasks(g), ['The 牛 (cow) ran back to its spring, frightened: go and fetch it']);
  g.run("setPlace('pasture'); S.pos = {place: 'pasture', x: 31, y: 17, dir: 'down'}; placePlayer(); placeCharacters()");
  assert.equal(g.run("AREA.bubbles.cow.find(b => matches(b.if)).show"), '!', 'waiting for you, with a !');
  g.run('__said.length = 0; __asks.length = 0');
  await press(g, 31, 17, 'down');
  assert.deepEqual([get(g, '__said'), get(g, '__asks')], [[`cow: ${COW_HOME}`], []], 'no word game this time: it trusts you');
  assert.deepEqual(get(g, 'S.following'), ['cow'], 'and it follows you again');
  assert.match(get(g, '__notes').join(' '), /The 牛 \(cow\) follows you again\. Lead it home to the thirsty monkey!/);
});

test('home: as you come up to the thirsty monkey by the road, the cow stops following you, and stands by him', async () => {
  const g = game({place: 'homeGround', x: 16, y: 10, dir: 'right'}, {cow: 4, cowWolf: 1}, {knows: ['牛'], following: ['cow'], friends: ['cow']});
  assert.deepEqual(get(g, "getTasks().find(t => t.id === 'cow4').target"), [21, 11], 'the arrow: over the thirsty monkey');
  for (const x of [17, 18]) await walkTo(g, x, 10, 'right');
  assert.deepEqual(get(g, '[here().cow, S.following]'), [4, ['cow']], 'not yet');
  await walkTo(g, 19, 10, 'right');
  assert.deepEqual(get(g, '[here().cow, S.following]'), [5, []], 'home');
  assert.deepEqual(npc(g, 'cow'), ['homeGround', 22, 11], 'it stands by him, near the road');
  assert.ok(get(g, '__sounds').includes('moo'));
  assert.deepEqual(get(g, '__said'), ['thirsty: 太好了！'], 'he’s thrilled');
  assert.match(get(g, '__notes').join(' '), /You’ve brought the 牛 \(cow\) home, safe from the wolves! Now it needs a safe place to live: the troop is going to build it a home of its own, by the road\./);
  assert.deepEqual(cowTasks(g), ['Talk to the thirsty monkey: the troop is ready to build the 牛 (cow) a home'], 'next, its own home (version 3)');
  assert.deepEqual(item(g, /past the wolves/), ['Lead the 牛 (cow) home, past the wolves', true, false, true]);
  g.run('__said.length = 0; __notes.length = 0; __sounds.length = 0');
  await press(g, 22, 10, 'down');
  assert.deepEqual([get(g, '__said'), get(g, '__sounds')], [[], ['moo']], 'A at it: a happy moo');
  assert.match(get(g, '__notes').join(' '), /The 牛 \(cow\) munches the grass by the road, safe from the wolves, waiting for a home of its own\./);
  assert.equal(g.run("AREA.bubbles.thirsty.find(b => matches(b.if)).show"), '!', 'and the thirsty monkey has a !: the troop is ready to build it a home');
});

// Version 3: its own home, a pen by the road, built as you watch; leading it in; its thank-you, milk; the feast's new table
test('its own home: the thirsty monkey’s ! (the troop is ready), and the troop builds the cow a pen by the road as you watch; it follows you to its gate', async () => {
  const g = game({place: 'homeGround', x: 21, y: 10, dir: 'down'}, {cow: 5, cowWolf: 1}, {knows: ['牛'], friends: ['cow']});
  assert.equal(g.run("AREA.bubbles.thirsty.find(b => matches(b.if)).show"), '!');
  assert.deepEqual(cowTasks(g), ['Talk to the thirsty monkey: the troop is ready to build the 牛 (cow) a home']);
  assert.deepEqual([g.run('tileAt(23, 11).look'), g.run('tileAt(22, 12).look')], ['grass', 'grass'], 'open grass, till then');
  await press(g, 21, 10, 'down');
  const notes = get(g, '__notes').join(' ');
  assert.match(notes, /The troop is ready to build the 牛 \(cow\) a safe home of its own, here by the road\. Watch!/);
  assert.match(notes, /A safe home for the 牛 \(cow\): a fence with a gate, a shelter with hay, and a trough of fresh water, fed by a bamboo pipe \(the thirsty monkey’s idea\)\. Lead the 牛 \(cow\) in through its gate!/);
  assert.deepEqual(get(g, '[here().cow, S.following]'), [7, ['cow']], 'built, and the cow follows you');
  assert.deepEqual(get(g, "mapObjects().filter(o => o.look === 'pen').map(o => [o.x, o.y, o.w, o.h])"), [[23, 11, 7, 4]], 'one pen, seven squares by four (its gate and inside part of it)');
  assert.equal(g.run('tileAt(22, 12).look'), 'sign', 'its sign');
  assert.deepEqual(cowTasks(g), ['Lead the 牛 (cow) in through the gate of its new home']);
  assert.deepEqual(get(g, "getTasks().find(t => t.id === 'cow7').target"), [24, 11], 'the arrow: its gate');
  assert.equal(g.run("(AREA.bubbles.cow.find(b => matches(b.if)) || {}).show || null"), null, 'no ! over it: it’s following you');
});

test('the pen: in through its gate, and about inside it, but not through its fences, its shelter or its trough', () => {
  const g = game({place: 'homeGround', x: 24, y: 10, dir: 'down'}, {cow: 7, cowWolf: 1});
  const open = (x, y) => g.run(`walkable(${x}, ${y})`);
  assert.ok(open(24, 11), 'its gate');
  for (const [x, y] of [[24, 12], [25, 12], [26, 12], [25, 13], [26, 13], [27, 13], [28, 13]]) assert.ok(open(x, y), `inside, at ${x},${y}`);
  for (const [x, y] of [[23, 11], [25, 11], [29, 11], [23, 12], [29, 13], [23, 14], [26, 14], [29, 14]]) assert.ok(!open(x, y), `its fence, at ${x},${y}`);
  assert.ok(!open(27, 12) && !open(28, 12), 'its shelter');
  assert.ok(!open(24, 13), 'its trough');
});

test('if the cow isn’t following you to its new home, it has a !: talk to it, and it follows you', async () => {
  const g = game({place: 'homeGround', x: 22, y: 10, dir: 'down'}, {cow: 7, cowWolf: 1}, {knows: ['牛'], friends: ['cow']});
  assert.equal(g.run("AREA.bubbles.cow.find(b => matches(b.if)).show"), '!');
  assert.deepEqual(cowTasks(g), ['Talk to the 牛 (cow), and lead it in through the gate of its new home']);
  await press(g, 22, 10, 'down');
  assert.deepEqual(get(g, 'S.following'), ['cow']);
  assert.match(get(g, '__notes').join(' '), /The 牛 \(cow\) follows you\. Lead it in through the gate of its new home!/);
  assert.equal(g.run('matches(BATTLES.afterLoss[0].if)'), false, 'losing a battle now, it doesn’t run back to the pasture: only on the way home from there');
});

test('into its home: lead it in through the gate, and 这是你的家！ It thanks you, and gives you some of its milk (牛奶, said straight away), and the thirsty monkey wants some: 我要喝牛奶！', async () => {
  const g = game({place: 'homeGround', x: 24, y: 10, dir: 'down'}, {cow: 7, cowWolf: 1}, {knows: ['牛'], friends: ['cow'], following: ['cow']});
  await walkTo(g, 24, 11, 'down');
  assert.deepEqual(get(g, '[here().cow, S.following]'), [7, ['cow']], 'in its gate: not yet');
  await walkTo(g, 24, 12, 'down');
  assert.deepEqual(get(g, '[here().cow, S.following]'), [8, []], 'inside: home');
  assert.deepEqual(npc(g, 'cow'), ['homeGround', 28, 13], 'it goes to its shelter');
  assert.deepEqual(get(g, '__said'), ['player: 这是你的家！', 'cow: 谢谢你！', 'player: 不客气', 'thirsty: 我要喝牛奶！']);
  assert.ok(get(g, '__notes').includes('card: 牛奶 (Safe and happy in its new home, the 牛 (cow) gives you some milk: its thank-you!), said'), 'said straight away: no one said it first');
  assert.deepEqual(get(g, '[here().milk, here().holding.milk]'), ['asked', '牛奶']);
  assert.deepEqual(get(g, "getTasks().filter(t => t.id === 'milk').map(t => t.text)"), ['Give the 牛奶 (milk) to the thirsty monkey']);
  assert.equal(g.run("AREA.bubbles.thirsty.find(b => matches(b.if)).show"), '?');
  assert.deepEqual(item(g, /into its new home/), ['Lead the 牛 (cow) into its new home', true, false, true]);
  assert.deepEqual(item(g, /thirsty monkey some/), ['Give the thirsty monkey some 牛奶 (milk)', false, false, true]);
});

test('the milk for the thirsty monkey: 牛奶！太好了！, the gap in 我要喝牛奶, his thanks and your 不客气; the rest is for the feast, in a bowl on its second table, with a jug of it, as you come up to it: 我们有牛奶了！', async () => {
  const g = game({place: 'homeGround', x: 21, y: 12, dir: 'up'}, {cow: 8, cowWolf: 1, milk: 'asked', holding: {milk: '牛奶'}}, {knows: ['牛', '牛奶'], friends: ['cow']});
  await press(g, 21, 12, 'up');   // (from below him: off the road, not yet near the feast's table)
  assert.deepEqual(get(g, '__said'), ['thirsty: 牛奶！太好了！', 'gap: 我要喝牛奶 (牛奶)', 'thirsty: 谢谢你！', 'player: 不客气']);
  assert.deepEqual(get(g, '[here().milk, here().cow, here().holding.milk || null, here().milkTable]'), ['done', 9, null, 0]);
  assert.match(get(g, '__notes').join(' '), /The thirsty monkey drinks some of the 牛奶 \(milk\)\. The rest is for the feast, in a bowl on its second 桌子 \(table\)\./);
  assert.deepEqual(get(g, "getTasks().filter(t => t.id === 'milkTable').map(t => [t.text, t.target])"), [['Go and see the 牛奶 (milk) go on the feast’s second 桌子 (table)', [22, 8]]]);
  assert.equal(g.run('tileAt(22, 7).look'), 'milkTableEmpty', 'not there yet: the feast’s second table, set out with the first, its bowls empty');
  g.run('__said.length = 0; __notes.length = 0');
  await walkTo(g, 20, 10, 'up');   // on the road, coming up to it
  assert.equal(g.run('here().milkTable'), 1);
  assert.deepEqual(get(g, "mapObjects().filter(o => /^milkTable/.test(o.look)).map(o => [o.look, o.x, o.y, o.w])"), [['milkTable', 21, 7, 3]], 'three squares wide, beside the first');
  assert.deepEqual([g.run('tileAt(21, 8).look'), g.run('tileAt(23, 8).look')], ['stoneStool', 'stoneStool'], 'with its two stools');
  assert.deepEqual(get(g, '__said'), ['hungry: 我们有牛奶了！']);
  assert.match(get(g, '__notes').join(' '), /The 牛 \(cow\)’s milk goes on the feast’s second 桌子 \(table\): a bowl full, and a jug of it!/);
  assert.deepEqual(get(g, "AREA.feastList.foods.filter(f => (!f.show || matches(f.show)) && f.have && matches(f.have)).map(f => f.yes.zh)").slice(-1), ['我们 有 牛奶 。'], 'on the feast’s list');
  assert.deepEqual(cowTasks(g).concat(get(g, "getTasks().filter(t => /^milk/.test(t.id)).map(t => t.id)")), []);
  assert.deepEqual(item(g, /on the feast’s second/), ['See the 牛奶 (milk) go on the feast’s second 桌子 (table)', true, false, true]);
});

test('at home: A at the cow in its pen, a moo and 我有家了！; A at its fence calls it too; its sign says whose home it is', async () => {
  const g = game({place: 'homeGround', x: 27, y: 13, dir: 'right'}, {cow: 9, cowWolf: 1, milk: 'done', milkTable: 1}, {knows: ['牛', '牛奶'], friends: ['cow']});
  assert.deepEqual(npc(g, 'cow'), ['homeGround', 28, 13]);
  await press(g, 27, 13, 'right');
  assert.deepEqual([get(g, '__said'), get(g, '__sounds')], [['cow: 我有家了！'], ['moo']]);
  g.run('__said.length = 0');
  await press(g, 26, 10, 'down');   // from the road, facing its fence
  assert.deepEqual(get(g, '__said'), ['cow: 我有家了！'], 'over the fence');
  g.run('__notes.length = 0');
  await press(g, 21, 12, 'right');
  assert.match(get(g, '__notes').join(' '), /The 牛 \(cow\)’s home\. Your friend the cow lives here, safe from the wolves\./);
});

// Version 4: the little dairy (the game's owner's idea): yoghurt, then cheese, each ready once you've answered 8 more
// questions, anywhere
test('the little dairy: once the milk is on the feast’s table, the thirsty monkey has a !: the troop sets up a little table by the pen for him, and he says 我要做吃的！ (做 just for listening); your tasks count your questions', async () => {
  const g = game({place: 'homeGround', x: 21, y: 10, dir: 'down'}, {cow: 9, cowWolf: 1, milk: 'done', milkTable: 1}, {knows: ['牛', '牛奶'], friends: ['cow']});
  g.run('S.turn = 40');
  assert.equal(g.run("AREA.bubbles.thirsty.find(b => matches(b.if)).show"), '!');
  assert.deepEqual(get(g, "getTasks().filter(t => t.id === 'dairy').map(t => t.text)"), ['Talk to the thirsty monkey: he wants to make something with the 牛奶 (milk)']);
  await press(g, 21, 10, 'down');
  assert.deepEqual(get(g, '__said'), ['thirsty: 我要做吃的！']);
  assert.match(get(g, '__notes').join(' '), /The thirsty monkey takes some of the 牛奶 \(milk\) to a little table by the pen\. The troop sets it up for him, under a thatched roof\..*He’s making something from the 牛奶 \(milk\)! Practise your words \(8 questions, anywhere\), then come back and see what it is\./);
  assert.deepEqual(get(g, '[here().dairy, here().dairyTurn, counter("dairyWait")]'), [1, 40, 0], 'he starts counting your questions from now');
  assert.deepEqual(get(g, "mapObjects().filter(o => /^dairy/.test(o.look)).map(o => [o.look, o.x, o.y, o.w, o.h])"), [['dairy', 19, 11, 2, 2]], 'the little dairy, two squares by two, beside him');
  const later = game({place: 'homeGround', x: 21, y: 10, dir: 'down'}, {cow: 9, milk: 'done', milkTable: 1, dairy: 1});
  assert.equal(get(later, "ALL_NPCS.find(n => n.id === 'thirsty').dir"), 'left', 'he stands facing it (once you’ve gone: talking, he faces you)');
  assert.ok(get(g, "WORD_BANK['做']") && !get(g, "WORD_BANK['做'].area || null"), '做 is just for listening');
  assert.deepEqual(get(g, "getTasks().filter(t => /^dairy/.test(t.id)).map(t => t.text)"), ['The thirsty monkey is making something from the 牛奶 (milk): practise, then come back and see what it is (0/8)']);
  g.run('S.turn = 45');
  assert.match(get(g, "getTasks().find(t => t.id === 'dairyWait').text"), /\(5\/8\)$/, 'every question you answer counts');
  g.run('__said.length = 0');
  await press(g, 21, 10, 'down');
  assert.deepEqual(get(g, '[__said, here().dairy]'), [['thirsty: 我要做吃的！'], 1], 'not ready yet');
  await press(g, 20, 10, 'down');
  assert.match(get(g, '__notes').join(' '), /a pot with a cloth tied over it\. He’s making something!/, 'A at the dairy: what’s on it');
});

test('8 questions later: a chime, a message and a ! over him; 好了！, jars of yoghurt on his shelf, and 酸奶 (said straight away); then he makes something else, and the yoghurt goes on the feast’s table', async () => {
  const g = game({place: 'homeGround', x: 21, y: 10, dir: 'down'}, {cow: 9, cowWolf: 1, milk: 'done', milkTable: 1, dairy: 1, dairyTurn: 40}, {knows: ['牛', '牛奶'], friends: ['cow']});
  g.run('S.turn = 47; placePlayer()');
  await play(g, 'runEvents()');
  assert.equal(g.run('here().dairy'), 1, '7 questions: not yet');
  g.run('S.turn = 48');
  await play(g, 'runEvents()');
  assert.equal(g.run('here().dairy'), 2, '8: ready');
  assert.ok(get(g, '__sounds').includes('chime'));
  assert.match(get(g, '__notes').join(' '), /The thirsty monkey has finished making something from the 牛奶 \(milk\)\. Go and see what it is!/);
  assert.equal(g.run("AREA.bubbles.thirsty.find(b => matches(b.if)).show"), '!');
  assert.deepEqual(get(g, "getTasks().filter(t => /^dairy/.test(t.id)).map(t => [t.text, t.target])"), [['The thirsty monkey has made something from the 牛奶 (milk): go and see what it is!', [21, 11]]]);
  g.run('__notes.length = 0');
  await press(g, 21, 10, 'down');
  assert.deepEqual(get(g, '__said'), ['thirsty: 好了！', 'thirsty: 我要做吃的！']);
  assert.ok(get(g, '__notes').includes('card: 酸奶 (The milk has gone thick and sour: the thirsty monkey has made yoghurt!), said'), 'said straight away: no one says it first');
  assert.deepEqual(get(g, '[here().dairy, here().dairyTurn, counter("dairyWait")]'), [3, 48, 0], 'and he starts on something else, counting again');
  assert.equal(g.run('tileAt(19, 11).look'), 'dairyYog', 'jars of yoghurt on the dairy’s shelf');
  assert.equal(g.run('here().milkTable'), 2, 'on the road, near it: the yoghurt goes on the feast’s table at once');
  assert.equal(g.run('tileAt(22, 7).look'), 'milkTableYog');
  assert.match(get(g, '__notes').join(' '), /The thirsty monkey’s 酸奶 \(yoghurt\) goes in a bowl on the feast’s second table, with a wooden spoon in it!/);
  assert.deepEqual(get(g, "AREA.feastList.foods.filter(f => (!f.show || matches(f.show)) && f.have && matches(f.have)).map(f => f.yes.zh)").slice(-2), ['我们 有 牛奶 。', '我们 有 酸奶 。']);
  assert.deepEqual(get(g, "getTasks().filter(t => /^dairy/.test(t.id)).map(t => t.text)"), ['The thirsty monkey is making something else from the 牛奶 (milk): practise, then come back and see what it is (0/8)']);
  assert.deepEqual(item(g, /what the thirsty monkey makes/), ['Find out what the thirsty monkey makes from the 牛奶 (milk)', true, false, true]);
});

test('and again, 8 questions later: 好了！ and cheese (奶酪), on the dairy’s shelf and the feast’s table; the feast’s list has milk, yoghurt and cheese', async () => {
  const g = game({place: 'homeGround', x: 21, y: 12, dir: 'up'}, {cow: 9, cowWolf: 1, milk: 'done', milkTable: 2, dairy: 3, dairyTurn: 48}, {knows: ['牛', '牛奶', '酸奶'], friends: ['cow']});
  g.run('S.turn = 56; placePlayer()');
  await play(g, 'runEvents()');
  assert.equal(g.run('here().dairy'), 4);
  assert.match(get(g, '__notes').join(' '), /The thirsty monkey has made something else from the 牛奶 \(milk\)\. Go and see what it is!/);
  g.run('__notes.length = 0');
  await press(g, 21, 12, 'up');   // (from below him: off the road)
  assert.deepEqual(get(g, '__said'), ['thirsty: 好了！']);
  assert.ok(get(g, '__notes').includes('card: 奶酪 (Cheese! The thirsty monkey has made it from the cow’s milk too.), said'));
  assert.deepEqual(get(g, '[here().dairy, here().milkTable, tileAt(19, 11).look]'), [5, 2, 'dairyCheese']);
  assert.deepEqual(get(g, "getTasks().filter(t => t.id === 'cheeseTable').map(t => t.text)"), ['Go and see the 奶酪 (cheese) go on the feast’s second 桌子 (table)']);
  g.run('__notes.length = 0');
  await walkTo(g, 20, 10, 'up');
  assert.deepEqual(get(g, '[here().milkTable, tileAt(22, 7).look]'), [3, 'milkTableCheese']);
  assert.match(get(g, '__notes').join(' '), /And a round 奶酪 \(cheese\) for the feast, in the last bowl!/);
  assert.deepEqual(get(g, "AREA.feastList.foods.filter(f => (!f.show || matches(f.show)) && f.have && matches(f.have)).map(f => f.yes.zh)").slice(-3), ['我们 有 牛奶 。', '我们 有 酸奶 。', '我们 有 奶酪 。']);
  assert.deepEqual(get(g, "getTasks().filter(t => /^(dairy|cheese|yog|milk|cow)/.test(t.id)).map(t => t.id)"), [], 'the cow’s story, done for now');
  assert.deepEqual(item(g, /what else he makes/), ['Find out what else he makes from the 牛奶 (milk)', true, false, true]);
  g.run('__said.length = 0');
  await press(g, 21, 12, 'up');
  assert.deepEqual(get(g, '__said'), ['thirsty: 太好了！']);
  await press(g, 20, 13, 'up');
  assert.match(get(g, '__notes').join(' '), /Jars of 酸奶 \(yoghurt\) and a round 奶酪 \(cheese\) on the shelf, all made from the cow’s milk\./);
});

test('hidden in the pasture: shells under a boulder, and a peach behind a tree at its edge', () => {
  const g = game({place: 'pasture', x: 16, y: 1, dir: 'down'}, {cow: 3});
  const finds = get(g, "AREA.hidden.filter(h => h.at[2] === 'pasture').map(h => [h.id, h.at[0], h.at[1], tileAt(h.at[0], h.at[1]).look])");
  assert.deepEqual(finds, [['pastureBoulder', 4, 18, 'boulder'], ['pastureTree', 20, 23, 'tree']], 'at things you can’t walk through');
});
