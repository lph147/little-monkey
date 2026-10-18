// Plays Flower Fruit Mountain from a new game to the end of what's built (chapter 1, part A), the way a
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
  async function act(code, what){   // start something, then answer its cards until it's finished
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
  }
  const stand = (x, y, dir) => run(`S.pos = {place:PLACE, x:${x}, y:${y}, dir:'${dir}'}; placePlayer();`);   // in the place you're in
  const pressAt = (x, y, dir, what) => { stand(x, y, dir); return act('pressA()', what); };   // face something and press A
  const stepOn = (x, y, what) => { stand(x, y, 'down'); return act(`arrive(${x}, ${y})`, what); };

  // A new game: How to play, then born from the stone
  await act('startGame()', 'starting a new game');
  assert.ok(knows('石头'), 'you should learn 石头 when you are born');

  // The old monkey, and the first words
  await stepOn(9, 3, 'taking the first step on the path');
  assert.ok(!knows('路'), "the path doesn't teach 路 yet (it waits for chapter 1)");
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
  assert.equal(area().hungry, 'asked', 'the hungry monkey should ask for some fruit');
  await pressAt(2, 6, 'left', 'picking a peach');
  assert.equal(area().holding.hungry, '桃子', 'you should be holding the peach');
  await pressAt(13, 6, 'up', 'giving the hungry monkey the peach');
  assert.equal(area().holding.hungry, undefined, 'the peach is given back');
  assert.deepEqual(area().wanted, {hungry: '苹果'}, 'he wants the apple instead');
  await pressAt(20, 17, 'right', 'picking an apple from the tree across the river');
  await pressAt(13, 6, 'up', 'giving the hungry monkey the apple');
  assert.equal(area().hungry, 'done', 'the hungry monkey should take the apple');

  // The thirsty monkey, then the rocks roll away
  await pressAt(2, 11, 'down', 'meeting the thirsty monkey');
  await pressAt(11, 8, 'down', 'collecting water from the pond');
  await pressAt(2, 11, 'down', 'giving the thirsty monkey the water');
  assert.equal(area().thirsty, 'done', 'the thirsty monkey should take the water');
  assert.equal(area().gate, false, 'the rocks stay until the rest of the prologue is done');

  // The big monkey, in the middle meadow: a red, a yellow and a white flower, for shells
  await pressAt(4, 10, 'right', 'meeting the big monkey');
  assert.equal(area().flowers, 'asked', 'the big monkey should ask for flowers');
  await pressAt(11, 6, 'down', 'picking a red flower');
  assert.ok(knows('红'), 'the first red flower should teach 红');
  await pressAt(11, 6, 'down', 'trying another red flower');
  assert.equal(get('here().picked.flowers.length'), 1, 'one flower of each colour');
  await pressAt(11, 16, 'down', 'picking a yellow flower in the south');
  await pressAt(16, 9, 'right', 'picking a white flower by the river');
  for (const w of ['黄', '白']) assert.ok(knows(w), `picking should teach ${w}`);
  assert.equal(area().holding.flowers, '花', 'you should be holding 3 flowers');
  const peaches = get('S.shells');
  await pressAt(4, 10, 'right', 'giving the big monkey the flowers');
  assert.equal(area().flowers, 'done', 'the big monkey should take the flowers');
  assert.ok(get('S.shells') > peaches, 'and give you peaches for them');

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
  plan.buy = '苹果';
  await pressAt(11, 15, 'down', 'buying an apple');
  plan.buy = null;
  assert.equal(get('S.bag')['苹果'], 1, 'you should have an apple in your bag');
  plan.eat = true;
  await pressAt(13, 19, 'up', 'meeting the squirrel with an apple in your bag');
  assert.equal(get('S.bag')['苹果'], 0, 'the apple should be eaten');

  assert.equal(area().gate, true, 'with everything done, the rocks should have rolled away');

  // Up the stream: you set off alone, find the waterfall, come back down and lead the troop up
  await pressAt(15, 2, 'left', 'talking to the old monkey where the rocks were');
  assert.equal(area().climb, 1, 'you should set off up the path');
  await stepOn(15, 0, 'going up the mountain path');
  assert.equal(run('PLACE'), 'path', 'you should be on the mountain path');
  assert.ok(knows('路'), 'arriving on the mountain path should teach 路');
  assert.ok(knows('棍子'), 'the big monkey should give you a stick');
  for (const [x, y] of [[3, 12], [4, 12], [5, 12], [6, 12], [7, 12]]) await stepOn(x, y, 'walking through the long grass');
  assert.ok(knows('蛇'), 'a snake should jump out of the long grass, and be chased away');
  assert.equal(get('S.hearts'), 5, 'every dodge right: no hearts lost');
  await pressAt(8, 2, 'right', 'chasing the wild boar off the path');
  assert.equal(area().boar, 1, 'the wild boar should run off');
  assert.ok(knows('野猪'));
  await pressAt(15, 1, 'right', 'finding the waterfall');
  assert.equal(area().climb, 2, 'you should find the waterfall');
  assert.ok(knows('瀑布'), 'the waterfall should teach 瀑布');
  await stepOn(5, 16, 'going back down the path');
  assert.equal(run('PLACE'), 'meadow', 'you should be back in the meadow');
  await pressAt(15, 2, 'left', 'telling the old monkey about the waterfall');
  assert.equal(area().climb, 3, 'the troop should follow you up');
  await stepOn(15, 0, 'going back up the mountain path');

  // The story at the waterfall
  await pressAt(15, 1, 'right', 'reading the story at the waterfall');
  assert.equal(area().story, true, 'the story at the waterfall should be read');

  // The prologue is done, so chapter 1 begins (its title card was answered along the way)
  assert.equal(area().chapter, 1, 'chapter 1 should begin once the prologue is done');

  // Chapter 1, part A: the dare at the waterfall, the jump, the cave, and telling the old monkey
  assert.deepEqual(get("ALL_NPCS.filter(n => ['elder', 'big', 'playful'].includes(n.id)).map(n => [n.id, n.x, n.y])"), [['elder', 13, 1], ['big', 14, 2], ['playful', 12, 2]], 'the troop gathers at the waterfall');
  await pressAt(14, 1, 'left', 'hearing the dare at the waterfall');
  assert.ok(knows('跳'), 'the dare should teach 跳');
  assert.equal(area().cave, 1);
  await pressAt(15, 1, 'right', 'jumping through the waterfall');
  assert.equal(run('PLACE'), 'cave', 'you should be in the Water Curtain Cave');
  assert.ok(knows('洞'), 'going in should teach 洞');
  await stepOn(7, 6, 'crossing the iron bridge');
  await pressAt(1, 2, 'up', 'looking at the stone beds');
  await pressAt(3, 5, 'up', 'looking at the stone table');
  await pressAt(9, 4, 'up', 'looking at the stone bowls');
  await pressAt(12, 5, 'up', 'reading the stone tablet');
  for (const w of ['桥', '床', '碗', '桌子']) assert.ok(knows(w), `${w} should be found in the cave`);
  await stepOn(7, 13, 'walking out through the water curtain');
  assert.equal(run('PLACE'), 'path', 'you should be back by the waterfall');
  assert.deepEqual(get('[S.pos.x, S.pos.y]'), [15, 1]);
  await pressAt(14, 1, 'left', 'telling the old monkey about the cave');
  assert.equal(area().cave, 3, 'the old monkey should hear about the cave');
  assert.ok(get('areaChecklist()').slice(0, 3).every(([, done]) => done), 'part A of chapter 1 should be ticked off');

  // Chapter 1, part B: leading the troop in, home, becoming king, and counting them in
  await pressAt(15, 1, 'right', 'leading the troop into the cave');
  assert.equal(run('PLACE'), 'cave');
  assert.equal(area().cave, 4, 'the troop should follow you in');
  assert.deepEqual(get("ALL_NPCS.filter(n => ['elder', 'big', 'playful'].includes(n.id)).map(n => n.place)"), ['cave', 'cave', 'cave']);
  await pressAt(6, 10, 'up', 'hearing what the old monkey calls the cave');
  assert.ok(knows('家'), 'the old monkey should teach 家');
  await pressAt(9, 9, 'up', 'being made king');
  assert.ok(knows('王'), 'the big monkey should teach 王');
  assert.equal(get('yourName().zh'), '美猴王', 'you should be called 美猴王 now');
  for (const n of [1, 2, 3]){
    await pressAt(6, 10, 'up', `counting monkey ${n} into the cave`);
    assert.equal(area().count, n);
  }
  for (const w of ['一', '二', '三']) assert.ok(knows(w), `counting should teach ${w}`);
  assert.ok(get("['troop1', 'troop2', 'troop3'].every(id => ALL_NPCS.find(n => n.id === id).place === 'cave')"), 'the whole troop should be in the cave');
  assert.ok(get('areaChecklist()').every(([, done]) => done), 'all of chapter 1 so far should be ticked off');
});
