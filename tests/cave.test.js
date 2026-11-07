// Area 2, chapter 1, inside the Cave of the Slanting Moon and Three Stars (built 5 November 2026), played from the open
// stone door to the end of the chapter: the master (师父) and your name (名字, 孙悟空); I spy with a pupil; the senior
// pupil's chores (叶子, 扫, 桶, 斧头), fetched by their word; the lecture and seven years going by; the master's riddle
// (头), the night (晚上, 月亮, 星星) and his back door; changing into things (变); the cloud somersault (飞), and flying by
// cloud from the map; showing off as a pine tree (松树); and home (回家), with the chapter's end card.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');
const {watchBeside, besideTasks} = require('./beside');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const FROM_BEFORE = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水', '吃', '喝', '要', '我', '猴子', '河', '鱼', '羊', '朋友', '家', '有', '鸟', '小', '大',
  '谢谢', '再见', '木头', '三', '四', '人', '是', '不', '什么', '钱', '风', '歌', '洞', '门', '房子', '狗', '猫', '鸡', '牛', '船', '云', '鹤', '天'];
const CHAPTER = ['云', '鹤', '天', '师父', '名字', '春天', '夏天', '秋天', '冬天', '叶子', '扫', '桶', '斧头', '头', '晚上', '月亮', '星星', '变', '飞', '松树', '回家'];
function game(pos, area = {}){
  const w = Object.fromEntries(FROM_BEFORE.map(x => [x, {lv: 2, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, shells: 0, coins: 5, met: [], friends: [],
    areas: {1: {chapter: 1, raft: 3, done: true}, 2: {landed: 1, dressed: 2, back: 1, child: 3, years: 1, boat: 2, song: 1, chapter: 1, woodFetch: 4, sky: 1, door: 2, ...area}}, pos, w}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__asked = 0; globalThis.__scenes = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }; pictureQ = async o => { __asked++; if (o.onAnswer) o.onAnswer(true, o.answerIdx); return true; }; closeCard = () => {}");
  g.run("globalThis.__said = []; showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('') + (o.noEn ? ' (no English)' : '')); }");
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; storyScene = async id => { __scenes.push(id); }; practiseFirst = async () => true");
  g.run("STEPS.chapter = async s => { here().chapter = s.chapter; __notes.push('chapter: ' + s.chapter); }");   // (its card: tests/parts.test.js)
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 2000 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const knows = (g, w) => g.run(`lvl('${w}')`) >= 1;
const p = (g, k) => get(g, `here().${k}`);
// Somewhere to stand to press A at a square with this word (I spy)
const besideWord = (g, w) => get(g, `(() => { for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (tileAt(x, y).word === '${w}')
  for (const [dx, dy, d] of [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']]) if (walkable(x + dx, y + dy) && !npcAt(x + dx, y + dy)) return [x + dx, y + dy, d]; return null; })()`);

test('inside the cave, from the master to the end of the chapter', async () => {
  const g = game({place: 'cave', x: 14, y: 6, dir: 'up'});
  watchBeside(g);   // (no task about someone as you finish with them, still beside them: they go straight on)
  // the master: who he is (师父), and, going straight on, your name (名字): 孙悟空
  await press(g, 14, 6, 'up');
  assert.deepEqual(said(g), ['master: 你来了。', 'master: 我是你的师父。', 'master: 你叫什么名字？', 'player: 我没有真正的名字。大家都叫我美猴王。', 'master: 你叫孙悟空。']);
  const first = notes(g);
  assert.ok(first.includes('card: 师父'));
  assert.ok(first.includes('card: 春天'), 'it’s spring as you arrive');
  assert.equal(get(g, 'yourName().zh'), '孙悟空', 'your name, from now on');
  // I spy with a pupil: she says what she sees, only in Chinese, and you press A at it
  await press(g, 10, 9, 'left');
  const spying = get(g, 'here().spying');
  assert.equal(spying.list.length, 3);
  assert.match(said(g).at(-1), /^spyPupil: 我看见.*！ \(no English\)$/);
  const other = ['树', '水', '石头', '木头', '门', '房子', '桃子'].find(w => !spying.list.includes(w));
  await press(g, ...besideWord(g, other));
  assert.ok(notes(g).some(n => /Not that one/.test(n)), 'something else: not that one');
  const coins = get(g, 'S.coins');
  for (const w of spying.list) await press(g, ...besideWord(g, w));
  assert.deepEqual([p(g, 'spyGame'), get(g, 'S.coins'), get(g, '!!here().spying')], [1, coins + 2, false], 'all three found');
  // the master's year: spring's done, and evening comes; to bed, and you wake in the summer
  assert.equal(p(g, 'evening'), 1, 'evening, once spring’s done');
  assert.deepEqual(get(g, 'getTasks().filter(t => t.main && t.id.startsWith("c1")).map(t => t.id)'), ['c1bed'], 'time for bed');
  notes(g);
  await press(g, 4, 4, 'up');
  assert.deepEqual(get(g, '__scenes'), ['toSummer'], 'the night, and the cave turning');
  assert.deepEqual([p(g, 'season'), p(g, 'evening'), g.run('pl.x'), g.run('pl.y')], [1, 0, 4, 4], 'summer, out of your room in the morning');
  let n = notes(g);
  assert.ok(n.some(x => /box: Part 3 Summer/.test(x)) && n.includes('card: 夏天'), 'summer’s part, and its word');
  assert.ok(n.findIndex(x => /Part 3/.test(x)) < n.indexOf('card: 夏天'), 'its part first, then its word');
  // summer: water for the senior pupil, three buckets (桶)
  said(g);
  await press(g, 17, 9, 'right');
  assert.deepEqual(said(g), ['senior: 这是桶。', 'senior: 我要三桶水。 (no English)']);
  g.run('howManyCard = async () => 3');
  await press(g, 21, 8, 'up');   // (at the pool: how many? three, filled one after another)
  assert.deepEqual(p(g, 'carrying'), {word: '水', n: 3});
  await press(g, 17, 9, 'right');
  assert.deepEqual(said(g), ['senior: 对！谢谢！'], 'his thanks');
  assert.equal(p(g, 'evening'), 1, 'summer’s done');
  await press(g, 4, 4, 'up');
  assert.equal(p(g, 'season'), 2, 'autumn');
  assert.ok(notes(g).includes('card: 秋天'));
  assert.equal(get(g, 'tileAt(9, 7).look'), 'leafPile', 'leaves have fallen in the courtyard');
  // autumn: the leaves (叶子), sweeping them (扫), then the axe (斧头) and firewood
  await press(g, 17, 9, 'right');
  assert.deepEqual(said(g), ['senior: 很多叶子！', 'senior: 你扫叶子吧。'], 'the leaves, and going straight on, sweeping them');
  n = notes(g);
  assert.ok(n.includes('card: 叶子') && n.includes('card: 扫'));
  for (const [x, y] of [[9, 7], [17, 7], [12, 10], [19, 12], [8, 13]]) await press(g, x, y + 1, 'up');
  assert.equal(g.run('counter("leavesSwept")'), 5);
  assert.equal(g.run('tileAt(9, 7).look'), 'paving', 'swept up');
  said(g);
  await press(g, 17, 9, 'right');
  assert.deepEqual(said(g), ['senior: 很好！', 'senior: 这是斧头。', 'senior: 我要四块木头。 (no English)']);
  g.run('howManyCard = async () => 4');
  const asked = get(g, '__asked');
  await press(g, 23, 13, 'up');   // (at a chopping block: how many? four, chopped one after another)
  assert.equal(get(g, '__asked'), asked + 4, 'a question a log');
  await press(g, 17, 9, 'right');
  assert.deepEqual([p(g, 'sweep'), p(g, 'axeFetch'), p(g, 'evening')], [2, 2, 1], 'autumn’s done');
  await press(g, 4, 4, 'up');
  assert.equal(p(g, 'season'), 3, 'winter');
  assert.ok(notes(g).includes('card: 冬天'));
  assert.equal(get(g, 'tileAt(9, 7).look'), 'paving', 'no leaves in winter');
  // winter: the year's last day; then to bed, and seven years go by
  said(g);
  await press(g, 14, 6, 'up');
  assert.equal(p(g, 'newYear'), 1);
  assert.equal(p(g, 'evening'), 1);
  g.run('__scenes.length = 0');
  await press(g, 4, 4, 'up');
  assert.deepEqual(get(g, '__scenes'), ['caveYears']);
  assert.deepEqual([p(g, 'grown'), get(g, 'seasonNow()')], [1, null], 'seven years on: the year’s seasons are over');
  // the lecture, now after the years (as in the book), and, going straight on, the riddle: three taps on your head (头);
  // the master goes in
  said(g); notes(g);
  const lecture = get(g, '__asked');
  await press(g, 14, 6, 'up');
  assert.equal(get(g, '__asked'), lecture + 4, 'his lecture');
  assert.equal(g.run('tileAt(5, 9).look'), 'rockPeach', 'the sapling grown into a peach tree');
  assert.equal(get(g, 'ALL_NPCS.find(n => n.id === "little1").place'), 'cave');
  assert.equal(said(g).at(-1), 'master: 一，二，三！');
  assert.ok(notes(g).includes('card: 头'));
  assert.equal(get(g, 'ALL_NPCS.find(n => n.id === "master").place'), 'masterRoom');
  // the night (晚上): the moon in the pool (月亮), three stars over his back door (星星), and in
  await press(g, 4, 4, 'up');
  assert.equal(g.run('PLACE'), 'caveNight');
  assert.ok(notes(g).includes('card: 晚上'));
  assert.equal(g.run('PLACES[PLACE].night'), true);
  await press(g, 23, 8, 'up');
  assert.ok(notes(g).includes('card: 月亮'));
  await press(g, 19, 4, 'up');
  assert.ok(notes(g).includes('card: 星星'));
  assert.equal(g.run('promptFor(19, 3)'), 'Go in');
  await press(g, 19, 4, 'up');
  assert.equal(g.run('PLACE'), 'masterRoom');
  // his secret (变), a first change, and back to bed
  said(g);
  await press(g, 4, 3, 'up');
  assert.deepEqual(said(g), ['master: 你来了。', 'master: 我教你变。', 'master: 变！']);
  assert.ok(notes(g).includes('card: 变'));
  assert.deepEqual([g.run('PLACE'), p(g, 'riddle'), get(g, 'pl.form')], ['cave', 3, null]);
  // his tests: three changes; then the cloud somersault (飞), and flying by cloud from the map
  const before = get(g, '__asked');
  await press(g, 14, 6, 'up');
  assert.deepEqual([get(g, '__asked') - before, p(g, 'tests')], [3, 1]);
  assert.ok(notes(g).includes('card: 飞'), 'and going straight on, 飞');
  assert.ok(get(g, '__scenes').includes('somersault'));
  assert.equal(g.run('canFly()'), true, 'now you can fly by cloud');
  assert.deepEqual(get(g, 'landingIn("shore")'), [17, 1], 'landing where the way into it leaves you');
  // showing off: a pine tree (松树); the master is angry, and sends you home (回家)
  said(g);
  await press(g, 12, 12, 'down');
  assert.deepEqual(said(g), ['darePupil: 你变松树吧！', 'player: 变！', 'darePupil: 好！好！']);
  assert.ok(notes(g).includes('card: 松树'));
  said(g);
  await press(g, 14, 6, 'up');
  assert.deepEqual(said(g), ['master: 你走吧！', 'master: 你回家吧。', 'player: 再见']);
  const end = notes(g);
  assert.ok(end.includes('card: 回家'));
  assert.ok(get(g, '__scenes').includes('flyHome'));
  assert.ok(end.includes('chapter: 2'), 'chapter 2 begins: home to Flower Fruit Mountain');
  assert.deepEqual([g.run('PLACE'), g.run('pl.x'), g.run('pl.y')], ['ffmMeadow', 9, 2], 'landing by your stone');
  assert.deepEqual(CHAPTER.filter(w => !knows(g, w)), [], 'all of chapter 1’s words');
  assert.deepEqual(get(g, 'AREA.checklist.filter(c => c.chapter === 1 && !matches(c.done)).map(c => c.text)').filter(t => !/crane|鹤|woodcutter/.test(t)), [], 'the chapter’s checklist done (but for what’s on the climb)');
  assert.deepEqual(besideTasks(g), [], 'no task ever sends you to someone you’re standing with, just as you finish talking to them: they go straight on');
});

test('flying by cloud: Fly here on a place you’ve been, on the map, once you can; it takes you there', async () => {
  const g = game({place: 'cave', x: 14, y: 10, dir: 'down'}, {named: 1, teacher: 1, grown: 1, lecture: 1, riddle: 3, tests: 1, fly: 1, visited: ['shore', 'cave']});
  g.run("S.w['地图'] = {lv: 2, ok: 2}");
  g.run("closeUp('shore')");
  assert.ok(g.run("!!sheet.querySelector('[data-a=fly]')"), 'Fly here');
  await play(g, "sheet.querySelector('[data-a=fly]').click()");
  assert.equal(g.run('PLACE'), 'shore');
  g.run("closeUp('shore')");
  assert.ok(g.run("!sheet.querySelector('[data-a=fly]')"), 'not where you are');
});

test('changing into something: you hear what, and turn into what you chose, there on the map, then back', async () => {
  const g = game({place: 'cave', x: 14, y: 10, dir: 'down'}, {named: 1});
  g.run("pictureQ = async o => { __asked++; o.onAnswer(false, (o.answerIdx + 1) % 3); return false; }; globalThis.__forms = []; { const was = becomeForm; becomeForm = async (w, ms, said) => { __forms.push(w); return was(w, 10, said); }; }");
  g.run("globalThis.__toldAs = []; { const t = toast; toast = m => { __toldAs.push(pl.form); t(m); }; }");
  await play(g, 'STEPS.turnInto({turnInto: 1})');
  const [form] = get(g, '__forms');
  assert.ok(form && get(g, `AREA.changes.includes('${form}') || !!WORDS['${form}'].pic`), 'into the one you chose');
  assert.ok(notes(g).some(n => /not what you heard/.test(n)), 'the wrong one, and you’re told');
  assert.deepEqual(get(g, '__toldAs'), [form], 'as you change, while you’re it, not once you’re back (7 November 2026: the next question covered it at once)');
  assert.equal(get(g, 'pl.form'), null, 'and back again');
});

test('the room in the rock is only yours once the master has taken you as his pupil (6 November 2026, after playing it: it said your room as you arrived)', async () => {
  const g = game({place: 'cave', x: 4, y: 4, dir: 'up'}, {caveSeen: 1});
  await press(g, 4, 4, 'up');
  assert.ok(notes(g).some(n => /^A pupil’s room/.test(n)), 'just arrived: a pupil’s room');
  g.run('here().teacher = 1');
  await press(g, 4, 4, 'down'); await press(g, 4, 4, 'up');
  assert.ok(notes(g).some(n => /^Your room/.test(n)), 'his pupil: your room');
});
