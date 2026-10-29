// Chapter 1 (decided 27 October 2026): the troop sets out the feast's tables bare, peaches and apples piled on one, and the
// hungry monkey wants bowls: 我们要碗！碗在水帘洞里。 They're in the Water Curtain Cave, where the troop lived: you fetch six,
// counting them, and bring them back. They go on the tables one at a time, and the big monkey, who makes things for the
// troop, has made chopsticks out of wood (teaching 筷子): 我做了筷子！ Later, when the yoghurt goes on the second table, he's
// made spoons for it (teaching 勺子): 我做了勺子！ One new word at a time, so not both at once.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const BARE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2, feast: 2, flowers: 'done', schoolFlowers: true, shop: 3};   // (the big monkey's flowers planted: his ! is for what he's made)
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '猴子', '朋友', '河', '鱼', '木头', '桌子', '碗', '家', '学校', '老师', '同学',
  '一', '二', '三', '四', '五', '六', '红色', '黄色', '白色', '谢谢', '不客气', '没关系', '水果', '我', '要', '有', '酸奶'];
function game(area = {}, pos = {place: 'homeGround', x: 19, y: 8, dir: 'up'}, version = 32){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version, started: true, w, shells: 0, areas: {1: {...BARE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__knocks = []");
  g.run("showDialog = async (who, line, opts = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('') + (opts.teach ? ' [' + opts.teach + ']' : '')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run("showNotice = async (w, o = {}) => { __notes.push('card: ' + w + (o.note ? ' (' + o.note + ')' : '')); rec(w).lv = Math.max(rec(w).lv || 0, 1); }");
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; gapQ = async o => { __said.push('gap: ' + o.t.join('') + ' (' + o.gap + ')'); return true; }");
  g.run("SFX.tock = () => { __knocks.push(settingUp.objects.map(o => o.look + ' ' + o.stage).join(', ')); }");
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 600 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`); return play(g, 'interact(...facing()).then(runEvents)'); };
const bubble = (g, id) => get(g, `((AREA.bubbles.${id} || []).find(b => matches(b.if)) || {}).show || null`);
const tables = g => get(g, "mapObjects().filter(o => /^(feast|milk)Table/.test(o.look)).map(o => o.look)");

test('the tables are set out bare, and the hungry monkey wants bowls: 我们要碗！碗在水帘洞里。', async () => {
  const g = game();
  assert.deepEqual(tables(g), ['feastTableBare', 'milkTableBare'], 'peaches and apples piled on the big one, the second bare');
  assert.equal(bubble(g, 'hungry'), '!');
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Talk to the hungry monkey by the big 桌子 (table)']);
  await press(g, 19, 8, 'up');
  assert.deepEqual(get(g, '__said'), ['hungry: 这是我们的大桌子！', 'hungry: 我们要碗！碗在水帘洞里。']);
  assert.equal(g.run('here().bowls'), 'asked');
  assert.match(get(g, '__notes').join(' '), /The hungry monkey wants six 碗 \(bowls\) for the feast\. They’re in the Water Curtain Cave!/);
  const task = get(g, 'getTasks()[0]');
  assert.equal(task.text, 'Fetch six 碗 (bowls) from the Water Curtain Cave (0/6)');
  assert.deepEqual(get(g, "AREA.tasks.find(t => t.id === 'bowls').arrow"), [9, 3, 'cave'], 'its arrow: to the cave’s stacks of bowls');
  assert.equal(bubble(g, 'hungry'), null, 'no ! till you bring them');
  assert.deepEqual(get(g, "areaChecklist().find(([t]) => /bowls/.test(t))"), ['Fetch 碗 (bowls) for the feast from the Water Curtain Cave', false, false, true]);
});

test('in the cave, A at the stacks of bowls takes six, one at a time, counting them', async () => {
  const g = game({bowls: 'asked'}, {place: 'cave', x: 9, y: 4, dir: 'up'});
  assert.equal(get(g, 'tileAt(9, 3).look'), 'bowlStack', 'white bowls with a blue band, as 碗’s picture and the tables’ bowls');
  assert.ok(get(g, 'COLLECTABLE.some(([x, y]) => x === 9 && y === 3)'), 'sparkling');
  assert.equal(get(g, 'promptFor(9, 3)'), 'Take');
  for (let i = 0; i < 6; i++) await press(g, 9 + (i % 2), 4, 'up');
  const notes = get(g, '__notes');
  assert.equal(notes.filter(n => /You take a 碗 \(bowl\) from the stack/.test(n)).length, 5, 'one at a time');
  assert.match(notes.join(' '), /六 \(six\)! You have six 碗 \(bowls\)\. Take them to the hungry monkey, at the feast’s tables!/, 'counting them in Chinese, to six');
  assert.equal(get(g, 'here().holding.bowls'), '碗');
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)').slice(0, 1), ['Take the 碗 (bowls) to the hungry monkey, at the feast’s tables']);
  g.run('__notes.length = 0');
  await press(g, 9, 4, 'up');
  assert.deepEqual(get(g, '__notes'), ['card: 碗 (Stacks of bowls, ready for the troop.)'], 'after that, just looking at them');
});

test('bring them back: they go on the tables one at a time; and the big monkey has made chopsticks (筷子): 我做了筷子！', async () => {
  const g = game({bowls: 'asked', holding: {bowls: '碗'}});
  assert.equal(bubble(g, 'hungry'), '?');
  await press(g, 19, 8, 'up');
  assert.deepEqual(get(g, '__said'), ['hungry: 碗！太好了！', 'gap: 我们要碗 (碗)', 'hungry: 谢谢你！', 'player: 不客气', 'hungry: 我们有碗了！']);
  assert.deepEqual(get(g, '__knocks'), ['feastTableBowls 1, milkTableEmpty 0', 'feastTableBowls 2, milkTableEmpty 0', 'feastTableBowls 3, milkTableEmpty 0',
    'feastTableBowls 3, milkTableEmpty 1', 'feastTableBowls 3, milkTableEmpty 2', 'feastTableBowls 3, milkTableEmpty 3'],
    'a bowl at a time, three on each table');
  assert.deepEqual(tables(g), ['feastTableBowls', 'milkTableEmpty']);
  assert.deepEqual(get(g, '[here().bowls, here().tableware]'), ['done', 1]);
  assert.match(get(g, '__notes').join(' '), /The bowls go on the feast’s tables\. And the big monkey has made something for the feast: go and see him!/);
  assert.deepEqual([bubble(g, 'hungry'), bubble(g, 'big')], [null, '!'], 'the big monkey has a ! (not in the same go: 不客气 was new just now, in a game that hadn’t said it before)');
  assert.deepEqual(get(g, 'getTasks().map(t => [t.text, t.target])')[0], ['The big monkey has made something for the feast: go and see him', [15, 4]]);
  g.run('__said.length = 0; __notes.length = 0; __knocks.length = 0');
  await press(g, 15, 5, 'up');
  assert.deepEqual(get(g, '__said'), ['big: 我做了筷子！ [筷子]']);
  assert.ok(get(g, '__notes').includes('card: 筷子 (The big monkey has made chopsticks out of 木头 (wood), a pair for every monkey.)'));
  assert.deepEqual(get(g, '__knocks'), ['feastTable 1'], 'then the cup of chopsticks goes on the big table');
  assert.deepEqual(tables(g), ['feastTable', 'milkTableEmpty']);
  assert.equal(g.run('here().tableware'), 2);
  assert.match(get(g, '__notes').join(' '), /A bamboo cup of the big monkey’s chopsticks goes on the feast’s big table\. Now ask the hungry monkey what else the feast needs!/);
  assert.deepEqual([bubble(g, 'hungry'), bubble(g, 'big')], ['!', null], 'and the hungry monkey has news: what the feast still needs');
  g.run('__said.length = 0');
  await press(g, 19, 8, 'up');
  assert.deepEqual(get(g, '__said'), ['hungry: 这是我们的大桌子！', 'hungry: 我们有桃子，也有苹果！', 'hungry: 我们没有蜂蜜！ [没有]']);
  assert.equal(g.run('here().feast'), 3);
});

test('when the yoghurt goes on the second table, the big monkey has made spoons for it (勺子): 我做了勺子！', async () => {
  const g = game({feast: 3, bowls: 'done', tableware: 2, bees: 11, cow: 9, milk: 'done', milkTable: 1, dairy: 3}, {place: 'homeGround', x: 22, y: 9, dir: 'up'});
  g.run("rec('筷子').lv = 1");
  await play(g, 'runEvents()');
  assert.equal(g.run('here().milkTable'), 2);
  assert.match(get(g, '__notes').join(' '), /with a wooden spoon in it! The big monkey made the spoon, for the 酸奶 \(yoghurt\): go and see him!/);
  assert.equal(bubble(g, 'big'), '!');
  assert.deepEqual(get(g, "getTasks().filter(t => t.id === 'spoons').map(t => t.text)"), ['The big monkey has made something for the 酸奶 (yoghurt): go and see him']);
  assert.ok(!get(g, "SPARKLES.some(s => s.word === '勺子' && matches(s.if))"), 'no sparkle on the spoon: he tells you');
  await press(g, 15, 5, 'up');
  assert.deepEqual(get(g, '__said'), ['big: 我做了勺子！ [勺子]']);
  assert.ok(get(g, '__notes').includes('card: 勺子 (The big monkey has made wooden spoons, for eating the 酸奶 (yoghurt).)'));
  assert.equal(get(g, "AREA.bubbles.big.filter(b => matches(b.if)).some(b => 'spoons' in b.if)"), false, 'his ! for the spoons has gone (one now is for the garden: tests/garden.test.js)');
  assert.equal(g.run('here().spoons'), 2);
});

test('a game whose tables were set out with their bowls and chopsticks keeps them (save version 31)', () => {
  const set = game({feast: 3}, undefined, 31);
  assert.deepEqual(get(set, '[here().bowls, here().tableware]'), ['done', 2]);
  assert.deepEqual(tables(set), ['feastTable', 'milkTableEmpty']);
  const before = game({feast: 1}, undefined, 31);
  assert.deepEqual(get(before, '[here().bowls, here().tableware]'), ['not asked', 0], 'one before the tables: it fetches them');
});
