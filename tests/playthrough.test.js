// Plays Flower Fruit Mountain from a new game to the end of what's built (chapter 1: the school, its lessons and its flowers), the way a
// player would: standing in front of things and pressing A, stepping into flowers and rustling grass,
// pressing A through what characters say, and answering every card. It catches a change that makes the area impossible to finish, such as a
// task that never appears, a card that can't be closed or a door that never opens.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

test('Flower Fruit Mountain can be played from start to finish', async () => {
  const game = loadGame({dom: true});
  const run = code => game.run(code);
  const get = expr => JSON.parse(run(`JSON.stringify(${expr})`));
  const sheet = game.el('#sheet'), talkBox = game.el('#talk');
  const talking = () => run('!!talkNext');   // someone is saying a line in the speech box
  const open = () => !run('modal.hidden') || talking();
  const cardText = () => (talking() ? talkBox : sheet).textContent.replace(/\s+/g, ' ').trim();
  const knows = w => run(`lvl(${JSON.stringify(w)})`) >= 1;
  const area = () => get('here()');

  run('Math.random = () => 0');   // the same every time: e.g. the first animal you haven't met jumps out, on your third step in the grass
  // Notice what the game asks, as a player hears and reads it: the word in a question or the gap.
  run(`(() => { const pq = pictureQ; pictureQ = q => { globalThis.__q = q; return pq(q); }; })()`);
  run(`globalThis.__said = []; (() => { const s = say; say = (text, end) => { __said.push(text); return s(text, end); }; })()`);   // everything said aloud, to check it has a voice clip

  const tick = () => new Promise(r => setImmediate(r));
  async function settle(){   // let the game finish what it's doing, including anything it waits for (timers)
    for (let i = 0; i < 1000; i++){
      await tick();
      if (game.flush()) continue;
      await tick();
      if (!game.flush()) return;
    }
    throw new Error('the game kept setting timers');
  }

  const plan = {buy: null, eat: false};   // what to choose in the shop, and whether to eat an apple
  function answer(){   // do what a player would on the card that's open
    if (talking()){ run('pressA()'); return; }   // a line in the speech box: A moves on
    const opts = sheet.querySelectorAll('.opt').filter(o => !o.hidden && !o.disabled);
    if (opts.length){
      const eat = sheet.querySelector('[data-a=eat]');
      if (eat && plan.eat){ eat.click(); plan.eat = false; return; }
      sheet.querySelector(`.opt[data-i="${run('__q.answerIdx')}"]`).click(); return;
    }
    const word = sheet.querySelectorAll('.mw').find(b => !b.classList.contains('done'));
    if (word){ word.click(); sheet.querySelector(`.mp[data-w="${word.dataset.w}"]`).click(); return; }   // matching: a word, then its picture
    const items = sheet.querySelectorAll('[data-n]');
    if (items.length){ (items.find(b => plan.buy && b.querySelector('.szh').textContent === plan.buy) || sheet.querySelector('[data-a=no]')).click(); return; }
    run('pressA()');   // the main button: OK, Got it, Next, Start, Give it, Say it...
  }
  const caught = () => get('Object.keys(WORDS).filter(w => lvl(w) >= 1)');
  async function act(code, what){   // start something, then answer its cards until it's finished
    const before = caught();
    let done = false, failed = null, last = '', same = 0;
    Promise.resolve(run(code)).then(() => { done = true; }, e => { failed = e; done = true; });
    for (let i = 0; i < 2000 && !done; i++){
      await settle();
      if (done || !open()) continue;
      const now = cardText() + sheet.querySelectorAll('.done, [disabled], [hidden]').length;
      same = now === last ? same + 1 : 0; last = now;
      if (same > 20) break;   // pressing changes nothing: stuck
      answer();
    }
    if (failed) throw failed;
    assert.ok(done, `stuck while ${what}: ${open() ? cardText() : 'no card open'}`);
    await settle();
    assert.ok(!open(), `a card was left open after ${what}: ${cardText()}`);
    const learned = caught().filter(w => !before.includes(w));
    assert.ok(learned.length <= 1, `one new word at a time, but ${what} taught ${learned.join(' and ')}`);
  }
  const stand = (x, y, dir) => run(`S.pos = {place:PLACE, x:${x}, y:${y}, dir:'${dir}'}; placePlayer();`);   // in the place you're in
  const pressAt = (x, y, dir, what) => { stand(x, y, dir); return act('finishedAt = null; pressA()', what); };   // face something and press A (after a moment, as a player does: what you've just finished with rests)
  const stepOn = (x, y, what) => { stand(x, y, 'down'); return act(`arrive(${x}, ${y})`, what); };
  // A walk, one square after another (from to to, along a row or a column, then the next leg), as a player walks it
  async function walk(legs, what){
    for (let i = 1; i < legs.length; i++){
      const [[fx, fy], [tx, ty]] = [legs[i - 1], legs[i]], dx = Math.sign(tx - fx), dy = Math.sign(ty - fy);
      for (let x = fx + dx, y = fy + dy; ; x += dx, y += dy){
        if (dy === 1 && run(`!!tileAt(${x}, ${y}).ledge`)){ y++; }   // hopping down a ledge
        await stepOn(x, y, what);
        if (x === tx && y === ty) break;
      }
    }
  }

  // A new game: How to play, then born from the stone
  await act('startGame()', 'starting a new game');
  assert.ok(knows('石头'), 'you should learn 石头 when you are born');

  // The old monkey, and the first words
  await stepOn(9, 3, 'taking the first step on the path');
  assert.ok(!knows('路'), "the path doesn't teach 路 yet (it waits for the mountain path)");
  await pressAt(7, 2, 'up', 'meeting the old monkey');
  assert.equal(area().elder, 1, 'the old monkey should have said hello');
  assert.ok(knows('你好'), 'the old monkey should teach 你好');
  await pressAt(8, 4, 'left', 'looking at the cliff');
  await pressAt(12, 7, 'down', 'looking at the tree');
  await stepOn(11, 7, 'walking into the flowers');
  await stepOn(4, 7, 'walking into the tall grass');
  for (const w of ['山', '树', '花', '草']) assert.ok(knows(w), `${w} should be learned`);
  await pressAt(7, 2, 'up', 'talking to the old monkey again');
  assert.equal(area().elder, 2, 'once you know 4 words, the old monkey should tell you about the animals');
  assert.ok(knows('动物'), 'the old monkey should teach 动物');

  // The little monkey
  await pressAt(15, 19, 'down', 'meeting the little monkey');
  await pressAt(15, 19, 'down', 'talking to the little monkey again');
  assert.ok(knows('猴子') && knows('朋友'), 'the little monkey should teach 猴子, then 朋友');

  // The hungry monkey wants fruit: whichever you bring first, he wants the other
  await pressAt(13, 6, 'up', 'meeting the hungry monkey');
  await pressAt(13, 6, 'up', 'talking to the hungry monkey again, before finding any fruit');   // (he used to say nothing)
  assert.equal(area().hungry, 'asked', 'the hungry monkey should ask for some fruit');
  await pressAt(2, 6, 'left', 'picking a peach');
  assert.equal(area().holding.hungry, '桃子', 'you should be holding the peach');
  await pressAt(13, 6, 'up', 'giving the hungry monkey the peach');
  assert.equal(area().holding.hungry, undefined, 'the peach is given back');
  assert.deepEqual(area().wanted, {hungry: '苹果'}, 'he wants the apple instead');
  assert.ok(get('getTasks()').some(t => t.text === 'Find the apple the hungry monkey wants'), 'a task names a word you haven’t caught in plain English');
  await pressAt(20, 17, 'right', 'picking an apple from the tree across the river');
  assert.ok(get('getTasks()').some(t => t.text === 'Give the 苹果 (apple) to the hungry monkey'), 'once caught, in Chinese and English');
  await pressAt(13, 6, 'up', 'giving the hungry monkey the apple');
  assert.equal(area().hungry, 'done', 'the hungry monkey should take the apple');
  assert.ok(knows('要') && !knows('不客气'), 'your first request teaches 要, so your reply 不客气 waits: one new word at a time');
  assert.ok(!knows('没关系'), 'he said 没关系 when you said sorry, but you haven’t said it yet');
  await pressAt(13, 6, 'up', 'talking to the hungry monkey once he has eaten: he says sorry for being fussy');
  assert.ok(knows('没关系'), 'you reply 没关系 (that’s OK), and catch it');

  // The thirsty monkey, then the rocks roll away
  await pressAt(2, 11, 'down', 'meeting the thirsty monkey');
  await pressAt(11, 8, 'down', 'looking at the pond');
  assert.ok(knows('鱼') && area().holding.thirsty === undefined, 'A at the pond shows you its fish first, not the water');
  await pressAt(11, 8, 'down', 'collecting water from the pond');
  await pressAt(2, 11, 'down', 'giving the thirsty monkey the water');
  assert.equal(area().thirsty, 'done', 'the thirsty monkey should take the water');
  assert.equal(area().gate, false, 'the rocks stay until the rest of the prologue is done');

  // The rest of the words for the meadow, which the old monkey asked you to learn: the river, and a bird
  assert.ok(get('getTasks()').some(t => t.text.startsWith('Learn the words for the meadow (3/5). Still to find: the river and a bird.')), 'your tasks say which are left');
  await pressAt(17, 10, 'right', 'looking at the river');
  run('birds.push({tx:9, ty:7, x:9*T + 4, y:7*T + 6, t0:performance.now(), until:performance.now() + 60000, from:1})');   // a little bird lands on the grass
  await pressAt(9, 6, 'down', 'looking at the little bird');
  for (const w of ['河', '鸟']) assert.ok(knows(w), `${w} should be learned`);
  assert.ok(!get('getTasks()').some(t => t.text.startsWith('Learn the words for the meadow')), 'with all five, that task is done');

  // The big monkey, in the middle meadow, has nothing to ask yet: his flowers wait for chapter 1 (decided 22 October 2026)
  await pressAt(4, 10, 'right', 'saying hello to the big monkey');
  assert.equal(area().flowers, 'not asked', 'he doesn’t ask for flowers');
  for (const w of ['红色', '黄色', '白色']) assert.ok(!knows(w), `${w} waits for school`);
  assert.ok(!knows('不客气'), 'no one has thanked you with nothing else new yet, so 不客气 waits too');

  // The shop owner, and the animals in the tall grass
  await pressAt(11, 15, 'down', 'meeting the shop owner');
  assert.ok(knows('老板'), 'the shop owner should teach 老板');
  await pressAt(13, 19, 'up', 'meeting the squirrel in the big tree');
  await pressAt(5, 18, 'left', 'meeting the goat on the cliff');
  for (let i = 0; i < 30 && get('S.met').length < 4; i++){   // walk about until the grass rustles, then step in
    const r = get('rustle');
    if (r) await stepOn(r.x, r.y, 'stepping into the rustling grass'); else await stepOn(9, 7, 'walking about');
  }
  assert.equal(get('S.met').length, 4, 'all four animals should be found');
  assert.ok(['rabbit', 'fox', 'squirrel', 'goat'].every(a => get('S.friends').includes(a)), 'every animal answered right becomes a friend');

  // The practice post: matching pictures, then listening for words without pictures
  await pressAt(13, 10, 'up', 'training at the practice post');
  assert.ok(get("S.w['要'].n || S.w['我'].n"), 'a word without a picture was heard right');

  // The headband, then an apple to eat in an animal encounter
  plan.buy = '头带';
  await pressAt(11, 15, 'down', 'buying the headband');
  assert.deepEqual(area().bought, ['头带'], 'you should have bought the headband');
  assert.ok(!knows('谢谢'), 'the headband was new, so your reply 谢谢 waits');
  plan.buy = '苹果';
  await pressAt(11, 15, 'down', 'buying an apple');
  plan.buy = null;
  assert.equal(get('S.bag')['苹果'], 1, 'you should have an apple in your bag');
  assert.ok(knows('谢谢'), 'buying something you know, you say 谢谢');
  plan.eat = true;
  await pressAt(13, 19, 'up', 'meeting the squirrel with an apple in your bag');
  assert.equal(get('S.bag')['苹果'], 0, 'the apple should be eaten');

  assert.equal(area().gate, true, 'with everything done, the rocks should have rolled away');

  // Up the stream: you set off alone, find the waterfall, come back down and lead the troop up
  await pressAt(15, 2, 'left', 'talking to the old monkey where the rocks were');
  assert.equal(area().climb, 1, 'you should set off up the path');
  assert.ok(knows('再见') && !knows('棍子'), 'the old monkey says goodbye, and you say it back');
  stand(15, 1, 'up');
  await act('arrive(15, 1).then(runEvents)', 'walking up past the big monkey');
  assert.ok(knows('棍子'), 'the big monkey should stop you, and give you a stick');
  await stepOn(15, 0, 'going up the mountain path');
  assert.equal(run('PLACE'), 'path', 'you should be on the mountain path');
  assert.ok(knows('路'), 'arriving on the mountain path should teach 路');
  for (const [x, y] of [[13, 14], [12, 14], [11, 14], [10, 14], [9, 14]]) await stepOn(x, y, 'walking through the long grass');
  assert.ok(knows('蛇'), 'a snake should jump out of the long grass, and be chased away');
  assert.equal(get('S.hearts'), 5, 'every dodge right: no hearts lost');
  await pressAt(15, 15, 'left', 'meeting the rabbit by the long grass');
  await stepOn(16, 0, 'going on up to the river valley');
  assert.equal(run('PLACE'), 'valley', 'you should be in the river valley');
  await pressAt(19, 4, 'up', 'playing with the goat over the first bridge');
  assert.equal(area().goatPlayed, 1, 'the goat should have played a word game with you');
  await stepOn(5, 0, 'going on up, deep into the mountains');
  assert.equal(run('PLACE'), 'falls', 'you should be deep in the mountains');
  await pressAt(7, 4, 'up', 'chasing the wild boar out of the narrow way');
  assert.equal(area().boar, 1, 'the wild boar should run off');
  assert.ok(knows('野猪'));
  await pressAt(5, 1, 'left', 'finding the waterfall');
  assert.equal(area().climb, 2, 'you should find the waterfall');
  assert.ok(knows('瀑布'), 'the waterfall should teach 瀑布');
  stand(7, 4, 'down');
  await act('arrive(7, 4).then(runEvents)', 'walking down the narrow way, past the goat');
  assert.equal(area().ledgeTip, 1, 'the goat below the waterfall should stop you, to tell you that you can hop down the ledges');
  for (const [x, y, place] of [[5, 12, 'valley'], [19, 12, 'path'], [16, 19, 'meadow']]){
    await stepOn(x, y, 'going back down');
    assert.equal(run('PLACE'), place, `going back down, you should reach the ${place}`);
  }
  await pressAt(15, 2, 'left', 'telling the old monkey about the waterfall');
  assert.equal(area().climb, 3, 'the troop should follow you up');
  assert.deepEqual(get('S.following'), ['playful', 'big', 'elder'], 'the little monkey, the big monkey and the old monkey follow you');
  for (const [x, y] of [[15, 0], [16, 0], [5, 0]]) await stepOn(x, y, 'going back up to the waterfall');
  assert.equal(run('PLACE'), 'falls');
  assert.deepEqual(get("FOLLOWERS.map(n => n.place)"), ['falls', 'falls', 'falls'], 'the troop comes with you');
  stand(7, 2, 'up');
  await act('arrive(7, 2).then(runEvents)', 'coming out of the narrow way by the waterfall, with the troop');
  assert.equal(area().climb, 4, 'the troop should be up at the waterfall');
  assert.deepEqual(get('S.following'), [], 'and stop following you');

  // The story at the waterfall
  await pressAt(5, 1, 'left', 'reading the story at the waterfall');
  assert.equal(area().story, true, 'the story at the waterfall should be read');

  // There's no prologue: it's chapter 1 all the way, with no chapter card part way through
  assert.equal(area().chapter, 0, 'still chapter 1');

  // The end of the prologue: the dare at the waterfall, the jump, the cave, and telling the old monkey
  assert.deepEqual(get("ALL_NPCS.filter(n => ['elder', 'big', 'playful'].includes(n.id)).map(n => [n.id, n.x, n.y])"), [['elder', 9, 1], ['big', 10, 2], ['playful', 5, 2]], 'the troop gathers at the waterfall');
  await pressAt(8, 1, 'right', 'hearing the dare at the waterfall');
  assert.ok(knows('跳'), 'the dare should teach 跳');
  assert.equal(area().cave, 1);
  await pressAt(5, 1, 'left', 'jumping through the waterfall');
  assert.equal(run('PLACE'), 'cave', 'you should be in the Water Curtain Cave');
  assert.ok(knows('洞'), 'going in should teach 洞');
  await stepOn(7, 6, 'crossing the iron bridge');
  await pressAt(1, 2, 'up', 'looking at the stone beds');
  await pressAt(3, 5, 'up', 'looking at the stone table');
  await pressAt(9, 4, 'up', 'looking at the stone bowls');
  await pressAt(5, 10, 'down', 'reading the stone tablet');
  for (const w of ['床', '碗', '桌子']) assert.ok(knows(w), `${w} should be found in the cave`);
  assert.ok(!knows('桥'), 'the bridge doesn’t teach 桥 (it waits for chapter 1)');
  await stepOn(7, 13, 'walking out through the water curtain');
  assert.equal(run('PLACE'), 'falls', 'you should be back by the waterfall');
  assert.deepEqual(get('[S.pos.x, S.pos.y]'), [5, 1]);
  await pressAt(8, 1, 'right', 'telling the old monkey about the cave');
  assert.equal(area().cave, 3, 'the old monkey should hear about the cave');
  assert.ok(get('areaChecklist()').slice(0, 3).every(([, done]) => done), 'the start of the prologue’s checklist should be ticked off');

  // Then leading the troop in, home, counting them in, and becoming king
  await pressAt(5, 1, 'left', 'leading the troop into the cave');
  assert.equal(run('PLACE'), 'cave');
  assert.equal(area().cave, 4, 'the troop should follow you in');
  assert.deepEqual(get("ALL_NPCS.filter(n => ['elder', 'big', 'playful'].includes(n.id)).map(n => n.place)"), ['cave', 'cave', 'cave']);
  await pressAt(6, 10, 'up', 'hearing what the old monkey calls the cave');
  assert.ok(knows('家'), 'the old monkey should teach 家');
  run("globalThis.__scenes = []; storyScene = async id => { __scenes.push(id); }");   // (the scene plays by itself, with its pictures; its own test plays it)
  for (const n of [1, 2, 3]){
    await pressAt(6, 10, 'up', `counting monkey ${n} into the cave`);
    assert.equal(area().count, n);
  }
  for (const w of ['一', '二', '三']) assert.ok(knows(w), `counting should teach ${w}`);
  assert.deepEqual(get('__scenes'), [], 'the third monkey teaches 三: becoming king waits till you talk to him again');
  await pressAt(6, 10, 'up', 'talking to the old monkey, with the whole troop home');
  assert.deepEqual(get('__scenes'), ['becomingKing'], 'with the whole troop home, they make you king: the scene, told like the opening');
  assert.ok(knows('王'), 'becoming king teaches 王');
  assert.equal(get('yourName().zh'), '美猴王', 'you should be called 美猴王 now');
  await pressAt(9, 9, 'up', 'talking to the big monkey, now you’re king');
  assert.ok(get('__said').includes('你是我们的王！'), 'he hails you as king');
  assert.ok(get("['troop1', 'troop2', 'troop3'].every(id => ALL_NPCS.find(n => n.id === id).place === 'cave')"), 'the whole troop should be in the cave');
  assert.ok(get('AREA.checklist.filter(c => !c.chapter).every(c => matches(c.done))'), 'all of the prologue should be ticked off');
  assert.equal(area().chapter, 1, 'the prologue is over, and chapter 1 begins, with its card');

  // Chapter 1: the old monkey shows you the troop's new home ground, beside the waterfall
  await pressAt(6, 10, 'up', 'talking to the old monkey at the start of chapter 1');
  assert.equal(area().home, 1, 'he tells you about the troop’s new home ground');
  assert.deepEqual(get('S.following'), ['elder'], 'and follows you there');
  await stepOn(7, 13, 'walking out through the water curtain');
  assert.equal(run('PLACE'), 'falls');
  stand(19, 2, 'right');
  await act('arrive(19, 2).then(runEvents)', 'walking along beside the waterfall, where the troop has cleared a way, to the home ground');
  assert.equal(run('PLACE'), 'homeGround', 'you should be at the home ground');
  assert.equal(area().home, 2, 'with the old monkey');
  assert.deepEqual(get("(({place, x, y}) => [place, x, y])(ALL_NPCS.find(n => n.id === 'elder'))"), ['homeGround', 10, 6], 'by the school’s plot');
  assert.ok(get('__said').includes('这里很大！'), 'he says how big it is');
  assert.ok(get('areaChecklist()').filter(([, , , found]) => found).every(([, done]) => done), 'chapter 1 so far is ticked off');

  // Chapter 1: the big monkey marks out the school's plot, and wants wood and small stones to build it, from the pine wood
  // up the hill
  assert.equal(run('tileAt(8, 2).look'), 'grass', 'the home ground is open ground when you come: no plots yet');
  await pressAt(15, 5, 'up', 'talking to the big monkey at the home ground');
  assert.equal(run('tileAt(8, 2).look'), 'plot', 'he marks out the school’s plot as you watch');
  assert.equal(area().build, 1, 'he wants wood and small stones');
  assert.deepEqual([area().wood, area().stones], ['asked', 'asked']);
  stand(25, 0, 'up');
  await act('arrive(25, 0).then(runEvents)', 'going up through the bushes he cleared');
  assert.equal(run('PLACE'), 'hillside', 'up the hillside to the pine wood');
  assert.deepEqual(get('[S.pos.x, S.pos.y]'), [9, 26]);
  run('globalThis.__fights = 0; (() => { const b = wildBattle; wildBattle = (...a) => { __fights++; return b(...a); }; })()');
  await walk([[9, 26], [9, 17], [17, 17], [17, 12], [16, 12], [16, 10], [10, 10], [10, 1]], 'walking up the hillside, through its long grass');
  assert.ok(get('__fights') >= 1, `something jumps out of the long grass on the way up (${get('__fights')})`);
  await stepOn(9, 0, 'going into the pine wood');
  assert.equal(run('PLACE'), 'pineWood', 'you should be in the pine wood');
  assert.deepEqual(get('[S.pos.x, S.pos.y]'), [16, 26], 'at the way in, at the bottom');
  await pressAt(17, 21, 'right', 'meeting a squirrel in the clearing where the ways part');
  assert.ok(get('__said').includes('你要木头吗？'), 'it asks if you want wood');
  await pressAt(2, 19, 'up', 'knocking down a dry, dead pine in the hollow to the west, with your stick');
  assert.ok(knows('木头'), 'the first piece of wood teaches 木头');
  assert.equal(run('tileAt(2, 18).look'), 'stump', 'the dead pine is down');
  await stepOn(15, 13, 'crossing the only bridge over the stream');
  assert.ok(knows('桥'), 'chapter 1’s bridges teach 桥');
  await pressAt(2, 3, 'up', 'knocking down another dead pine, among the oldest pines over the stream');
  await pressAt(3, 11, 'down', 'picking up a small stone by the stream');
  await pressAt(28, 18, 'right', 'picking up another small stone, on the shore of the pool');
  assert.deepEqual([run('counter("woodGot")'), run('counter("stonesGot")')], [2, 2], 'two of each, counted');
  assert.ok(get('__said').includes('二'), 'you count them aloud');
  await pressAt(22, 5, 'right', 'breaking the cracked rock');
  assert.ok(run('tileAt(23, 5).walk'), 'the way into the glade is open');
  await pressAt(30, 2, 'right', 'knocking down the dead pine in the glade');
  await pressAt(30, 7, 'up', 'picking up the small stone in the glade');
  assert.deepEqual(area().holding, {wood: '木头', stones: '石头'}, 'three of each: you have them all');
  await pressAt(29, 3, 'right', 'meeting the deer in the sunny glade');
  assert.ok(knows('鹿') && get('S.friends').includes('deer'), 'the deer teaches 鹿, and becomes your friend');
  assert.equal(run('counter("woodAnimalsLeft")'), 0, 'the animal in the pine wood is found');
  for (let i = 0; i < 5 && !knows('狼'); i++) await stepOn(15, 17, 'walking through the long grass below the bridge, where wolves live');
  assert.ok(knows('狼'), 'a wolf jumps out of the long grass, teaching 狼');
  stand(16, 29, 'down');
  await act('arrive(16, 29).then(runEvents)', 'going back down to the hillside');
  assert.equal(run('PLACE'), 'hillside');
  assert.deepEqual(get('[S.pos.x, S.pos.y]'), [9, 1]);
  run('__fights = 0');
  await walk([[9, 1], [9, 10], [9, 12], [3, 12], [3, 17], [9, 17], [9, 28]], 'walking down the hillside, hopping down a ledge');
  assert.ok(get('__fights') >= 1, `something jumps out of the long grass on the way down too (${get('__fights')})`);
  await stepOn(9, 29, 'going back down to the home ground');
  assert.equal(run('PLACE'), 'homeGround');
  await pressAt(15, 5, 'up', 'giving the big monkey the wood and the stones');
  assert.deepEqual([area().wood, area().stones, area().build], ['done', 'done', 2], 'he takes them');
  assert.ok(!knows('不客气'), 'no reply to his thanks: the school comes next, teaching 学校, so 不客气 waits');

  // Chapter 1: the troop builds the school at once, and you go in: the class greets its teacher, the little monkey is
  // your classmate, and the teacher gives you a lesson
  assert.deepEqual(get('__scenes').slice(-1), ['buildingSchool'], 'and the troop builds the school straight away, told like the opening: the frame goes up, then the walls, the roof and the sign');
  assert.ok(knows('学校'), 'the school teaches 学校');
  assert.equal(run('tileAt(8, 2).look'), 'school', 'the school stands on its plot');
  stand(11, 5, 'up');
  await act('arrive(11, 4).then(runEvents)', 'walking in through the school’s door');
  assert.equal(run('PLACE'), 'school', 'you should be in the classroom');
  await pressAt(7, 3, 'up', 'talking to the old monkey at the front of the class');
  assert.ok(knows('老师') && get('__said').includes('老师好！'), 'the class greets the old monkey, their teacher: 老师');
  assert.equal(area().school, 2);
  await pressAt(4, 5, 'left', 'talking to the little monkey at school');
  assert.ok(knows('同学'), 'you’re classmates: 同学');
  const shellsBefore = get('S.shells');
  await pressAt(7, 3, 'up', 'a lesson with the teacher');
  assert.ok(get('__said').includes('上课！') && get('__said').includes('下课！'), 'class begins, and is over');
  assert.ok(get('S.shells') >= shellsBefore, 'shells for words that needed practice');
  assert.ok(knows('四'), 'the first lesson teaches a new number: 四');
  for (let i = 0; i < 25 && (run('counter("numbersKnown")') < 7 || run('counter("coloursKnown")') < 9); i++) await pressAt(7, 3, 'up', `lesson ${i + 2}`);
  for (const n of ['五', '六', '七', '八', '九', '十']) assert.ok(knows(n), `the number lessons teach ${n}`);
  for (const c of ['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色']) assert.ok(knows(c), `the colour lessons teach ${c}`);
  assert.deepEqual(get('__scenes').filter(id => id.startsWith('paint')), ['paintLanterns', 'paintSign', 'paintSteps', 'paintDoor', 'paintRoof', 'paintWindows', 'paintWalls', 'paintPillars', 'paintBlossom'],
    'each colour lesson ends with the class painting a part of the school');
  assert.deepEqual(Object.keys(get('paintedParts()')).sort(), ['blossom', 'door', 'lanterns', 'pillars', 'roof', 'sign', 'steps', 'walls', 'windows'], 'and it’s all painted');
  await pressAt(7, 3, 'up', 'a lesson once you know the numbers to ten and the colours: practice');
  assert.ok(get('areaChecklist()').filter(([, , , found]) => found).every(([, done]) => done), 'chapter 1 so far is ticked off');

  // Chapter 1: the school painted in every colour, the big monkey wants flowers to plant in front of it, a red, a yellow
  // and a white one, picked at the home ground; each shows what it is as you pick it, and he plants them as you watch
  stand(7, 8, 'down');
  await act('arrive(7, 9).then(runEvents)', 'walking out of the school');
  assert.equal(run('PLACE'), 'homeGround');
  await pressAt(15, 5, 'up', 'talking to the big monkey, now the school is painted');
  assert.ok(get('__said').includes('学校很好看！') && get('__said').includes('我们来种花吧！'), 'the school looks lovely: let’s plant flowers!');
  assert.equal(area().flowers, 'asked');
  for (const x of [26, 27, 28]) await pressAt(x, 3, 'up', 'picking a flower at the top of the home ground');
  assert.deepEqual(area().picked.flowers, ['红色', '黄色', '白色'], 'one of each colour');
  assert.ok(['红色的花', '黄色的花', '白色的花'].every(t => get('__said').includes(t)), 'each said as you pick it: 红色的花, a red flower');
  await pressAt(15, 5, 'up', 'giving the big monkey the flowers');
  assert.ok(knows('不客气'), 'with nothing else new, you reply 不客气 to his thanks');
  assert.deepEqual([area().flowers, area().schoolFlowers, run('tileAt(10, 5).look')], ['done', true, 'flowerBed'], 'he plants them in front of the school');
  assert.ok(get('areaChecklist()').every(([, done]) => done), 'chapter 1 so far is ticked off');
  // Every word the game counts can be caught: all but those you can do without (戴, wear, for putting the headband on in
  // your wardrobe; and 睡觉, sleep, by the cave's beds). (The spider, which the prologue's long grass didn't send this
  // player, jumps out on the hillside.)
  assert.deepEqual(get('ORDER.filter(w => lvl(w) < 1)').sort(), ['戴', '睡觉'].sort(), 'the words this player hasn’t caught');

  // Everything said on the way has a voice clip (npm run voices makes them)
  const clips = require('../tools/make-voices').plan().clips, said = get('__said');
  assert.ok(said.length > 50, 'the game should say plenty aloud');
  const missing = [...new Set(said)].filter(t => !Object.values(clips).some(c => c[t]));   // in one of the voices
  assert.deepEqual(missing, [], 'these are said but have no voice clip: tools/make-voices.js should find them in the content');
});
