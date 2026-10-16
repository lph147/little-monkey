// Plays Flower Fruit Mountain from a new game to passing the word test at the cave door, the way a
// player would: standing in front of things and pressing A, stepping into flowers and tall grass,
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
  // Notice what the game asks, as a player hears and reads it: the word in a question, the sentence to build.
  run(`(() => { const pq = pictureQ, tl = tiles;
    pictureQ = q => { globalThis.__q = q; return pq(q); };
    tiles = (who, target, extras, prompt) => { globalThis.__tiles = target; return tl(who, target, extras, prompt); }; })()`);

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
    if (sheet.querySelector('.slots')){   // word tiles: tap the next word of the sentence
      const target = get('__tiles'), placed = sheet.querySelectorAll('.slots .tile').length;
      if (placed < target.length){
        sheet.querySelectorAll('.bank .tile').find(b => b.querySelector('ruby').firstChild.textContent === target.at(placed)).click();
        return;
      }
    }
    const word = sheet.querySelectorAll('.mw').find(b => !b.classList.contains('done'));
    if (word){ word.click(); sheet.querySelector(`.mp[data-w="${word.dataset.w}"]`).click(); return; }   // matching: a word, then its picture
    const items = sheet.querySelectorAll('[data-n]');
    if (items.length){ (items.find(b => plan.buy && b.textContent.startsWith(plan.buy)) || sheet.querySelector('[data-a=no]')).click(); return; }
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
  const stand = (x, y, dir) => run(`S.pos = {x:${x}, y:${y}, dir:'${dir}'}; placePlayer();`);
  const pressAt = (x, y, dir, what) => { stand(x, y, dir); return act('pressA()', what); };   // face something and press A
  const stepOn = (x, y, what) => { stand(x, y, 'down'); return act(`arrive(${x}, ${y})`, what); };

  // A new game: How to play, then born from the stone
  await act('startGame()', 'starting a new game');
  assert.ok(knows('石头'), 'you should learn 石头 when you are born');

  // The old monkey, and the first words
  await stepOn(9, 3, 'taking the first step on the path');
  assert.ok(knows('路'), 'the first step on the path should teach 路');
  await pressAt(9, 5, 'right', 'meeting the old monkey');
  assert.equal(area().elder, 1, 'the old monkey should have said hello');
  assert.ok(knows('你好'), 'the old monkey should teach 你好');
  await pressAt(8, 4, 'left', 'looking at the cliff');
  await pressAt(12, 7, 'down', 'looking at the tree');
  await stepOn(8, 2, 'walking into the flowers');
  await stepOn(4, 7, 'walking into the tall grass');
  for (const w of ['山', '树', '花', '草']) assert.ok(knows(w), `${w} should be learned`);
  await pressAt(9, 5, 'right', 'talking to the old monkey again');
  assert.equal(area().elder, 2, 'once you know 4 words, the old monkey should tell you about the animals');
  assert.ok(knows('动物'), 'the old monkey should teach 动物');

  // The little monkey
  await pressAt(12, 12, 'left', 'meeting the little monkey');
  await pressAt(12, 12, 'left', 'talking to the little monkey again');
  assert.ok(knows('猴子') && knows('朋友'), 'the little monkey should teach 猴子, then 朋友');

  // The hungry monkey: the wrong fruit first, then the right one
  await pressAt(13, 6, 'up', 'meeting the hungry monkey');
  assert.equal(area().hungry, 'asked', 'the hungry monkey should ask for something to eat');
  await pressAt(2, 7, 'left', 'picking an apple');
  assert.equal(area().holding.hungry, '苹果', 'you should be holding the apple');
  await pressAt(13, 6, 'up', 'giving the hungry monkey the apple');
  assert.equal(area().holding.hungry, undefined, 'the apple is given back');
  await pressAt(2, 6, 'left', 'picking a peach');
  await pressAt(13, 6, 'up', 'giving the hungry monkey the peach');
  assert.equal(area().hungry, 'done', 'the hungry monkey should take the peach');

  // The thirsty monkey, then the rocks roll away
  await pressAt(2, 11, 'down', 'meeting the thirsty monkey');
  await pressAt(11, 8, 'down', 'collecting water from the pond');
  await pressAt(2, 11, 'down', 'giving the thirsty monkey the water');
  assert.equal(area().thirsty, 'done', 'the thirsty monkey should take the water');
  assert.equal(area().gate, true, 'the rocks should have rolled away');

  // The shop owner, and the animals in the tall grass
  await pressAt(14, 8, 'down', 'meeting the shop owner');
  assert.ok(knows('老板'), 'the shop owner should teach 老板');
  for (let i = 0; i < 40 && get('S.met').length < 4; i++) await stepOn(5 + (i % 3), 7, 'walking in the tall grass');
  assert.equal(get('S.met').length, 4, 'all four animals should be found');
  assert.ok(['rabbit', 'fox', 'squirrel', 'goat'].every(a => get('S.friends').includes(a)), 'every animal answered right becomes a friend');

  // The practice post: matching pictures, then listening for words without pictures
  await pressAt(6, 6, 'up', 'training at the practice post');
  assert.ok(get("S.w['要'].n || S.w['我'].n"), 'a word without a picture was heard right');

  // The headband, then an apple to eat in an animal encounter
  plan.buy = '头带';
  await pressAt(14, 8, 'down', 'buying the headband');
  assert.deepEqual(area().bought, ['头带'], 'you should have bought the headband');
  plan.buy = '苹果';
  await pressAt(14, 8, 'down', 'buying an apple');
  plan.buy = null;
  assert.equal(get('S.bag')['苹果'], 1, 'you should have an apple in your bag');
  plan.eat = true;
  for (let i = 0; i < 12 && get('S.bag')['苹果'] === 1; i++) await stepOn(5 + (i % 3), 7, 'meeting an animal with an apple in your bag');
  assert.equal(get('S.bag')['苹果'], 0, 'the apple should be eaten');

  // The story at the waterfall
  await pressAt(17, 1, 'right', 'reading the story at the waterfall');
  assert.equal(area().story, true, 'the story at the waterfall should be read');

  // The cave door: the word test, and the end of the area
  assert.equal(run('areaDone()'), true, 'everything before the test should be done');
  await pressAt(3, 4, 'up', 'taking the word test at the cave door');
  assert.equal(area().done, true, 'the word test should be passed');
  assert.ok(get('areaChecklist()').every(([, done]) => done), 'the whole checklist should be ticked');
  const back = get('AREA.exit.returnTo');
  assert.deepEqual(get('[S.pos.x, S.pos.y]'), [back.x, back.y], 'you are put back by the cave door');
});
