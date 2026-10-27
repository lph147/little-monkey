// Plays Flower Fruit Mountain from a new game to the end of what's built (chapter 1: the school, its lessons and its flowers,
// the bees, home with their queen, and the lost cow, brought home from the pasture to its own pen), the way a
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
  async function act(code, what, most = 1){   // start something, then answer its cards until it's finished (teaching at most this many words)
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
    assert.ok(learned.length <= most, `one new word at a time, but ${what} taught ${learned.join(' and ')}`);
  }
  const stand = (x, y, dir) => run(`S.pos = {place:PLACE, x:${x}, y:${y}, dir:'${dir}'}; placePlayer();`);   // in the place you're in
  const pressAt = (x, y, dir, what, most) => { stand(x, y, dir); return act('finishedAt = null; pressA()', what, most); };   // face something and press A (after a moment, as a player does: what you've just finished with rests)
  const stepOn = (x, y, what) => { stand(x, y, 'down'); return act(`arrive(${x}, ${y})`, what); };
  // A walk, one square after another (from to to, along a row or a column, then the next leg), as a player walks it,
  // with whatever happens as you arrive on each (someone stopping you, say)
  async function walk(legs, what){
    for (let i = 1; i < legs.length; i++){
      const [[fx, fy], [tx, ty]] = [legs[i - 1], legs[i]], dx = Math.sign(tx - fx), dy = Math.sign(ty - fy);
      for (let x = fx + dx, y = fy + dy; ; x += dx, y += dy){
        while (dy === 1 && run(`!!tileAt(${x}, ${y}).ledge`)) y++;   // hopping down a ledge (or a bank two squares high)
        stand(x, y, dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right');
        await act(`arrive(${x}, ${y}).then(runEvents)`, what);
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
  await pressAt(7, 4, 'left', 'looking at the cliff');
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
  assert.ok(area().littleGame === 2 && get('S.friends').includes('playful'), 'then it wants to play a word game straight away (26 October 2026): won, its present');

  // The hungry monkey wants fruit: whichever you bring first, he wants the other
  await pressAt(13, 6, 'up', 'meeting the hungry monkey');
  assert.ok(knows('水果') && !knows('吃'), 'he asks for some fruit, teaching 水果 (fruit); 吃 (eat) waits');
  await pressAt(13, 6, 'up', 'talking to the hungry monkey again, before finding any fruit');   // (he used to say nothing)
  assert.equal(area().hungry, 'asked', 'the hungry monkey should ask for some fruit');
  await pressAt(2, 6, 'left', 'picking a peach');
  assert.ok(knows('桃子'), 'picking it teaches 桃子: the tree teaches its own fruit');
  assert.equal(area().holding.hungry, '桃子', 'you should be holding the peach');
  await pressAt(13, 6, 'up', 'giving the hungry monkey the peach');
  assert.equal(area().holding.hungry, undefined, 'the peach is given back');
  assert.deepEqual(area().wanted, {hungry: '苹果'}, 'he wants the apple instead');
  assert.ok(get('getTasks()').some(t => t.text === 'Find the apple the hungry monkey wants'), 'a task names a word you haven’t caught in plain English');
  await pressAt(20, 17, 'right', 'picking an apple from the tree across the river');
  assert.ok(get('getTasks()').some(t => t.text === 'Give the 苹果 (apple) to the hungry monkey'), 'once caught, in Chinese and English');
  await pressAt(13, 6, 'up', 'giving the hungry monkey the apple');
  assert.equal(area().hungry, 'done', 'the hungry monkey should take the apple');
  assert.ok(knows('吃') && !knows('要') && !knows('不客气'), 'giving him the apple teaches 吃, so your reply 不客气 waits: one new word at a time');
  assert.ok(!knows('没关系'), 'he said 没关系 when you said sorry, but you haven’t said it yet');
  await pressAt(13, 6, 'up', 'talking to the hungry monkey once he has eaten: he says sorry for being fussy');
  assert.ok(knows('没关系'), 'you reply 没关系 (that’s OK), and catch it');
  assert.deepEqual([area().hungryGame, get("S.bag['桃子']")], [2, 1], 'then he wants to play a word game: won, a peach for your bag');

  // The thirsty monkey, then the rocks roll away
  await pressAt(2, 11, 'down', 'meeting the thirsty monkey');
  await pressAt(11, 8, 'down', 'looking at the pond');
  assert.ok(knows('鱼') && area().holding.thirsty === undefined, 'A at the pond shows you its fish first, not the water');
  await pressAt(11, 8, 'down', 'collecting water from the pond');
  await pressAt(2, 11, 'down', 'giving the thirsty monkey the water');
  assert.equal(area().thirsty, 'done', 'the thirsty monkey should take the water');
  assert.ok(knows('要'), 'giving him the water teaches 要 (want)');
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
  assert.ok(knows('我'), 'he says who he is, teaching 我 (I)');
  assert.equal(area().flowers, 'not asked', 'he doesn’t ask for flowers');
  for (const w of ['红色', '黄色', '白色']) assert.ok(!knows(w), `${w} waits for school`);
  assert.ok(!knows('不客气'), 'no one has thanked you with nothing else new yet, so 不客气 waits too');

  // The shop owner, and the animals in the tall grass
  await pressAt(11, 15, 'down', 'meeting the shop owner');
  assert.ok(knows('老板'), 'the shop owner should teach 老板');
  await pressAt(3, 5, 'up', 'meeting the sheep at the foot of the cliffs, near your stone');
  assert.ok(knows('羊'), 'the sheep teaches 羊');
  await pressAt(13, 19, 'up', 'meeting the squirrel in the big tree');
  await pressAt(5, 16, 'left', 'meeting the goat on top of its rock');
  for (let i = 0; i < 30 && get('S.met').length < 4; i++){   // walk about until the grass rustles, then step in
    const r = get('rustle');
    if (r) await stepOn(r.x, r.y, 'stepping into the rustling grass'); else await stepOn(9, 7, 'walking about');
  }
  assert.equal(get('S.met').length, 4, 'all four animals should be found');
  assert.ok(['rabbit', 'sheep', 'squirrel', 'goat'].every(a => get('S.friends').includes(a)), 'every animal answered right becomes a friend');

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
  assert.equal(get('S.health'), 50, 'every dodge right: no health lost');
  await pressAt(15, 15, 'left', 'meeting the rabbit by the long grass');
  await stepOn(16, 0, 'going on up to the river valley');
  assert.equal(run('PLACE'), 'valley', 'you should be in the river valley');
  await pressAt(19, 4, 'up', 'playing with the goat over the first bridge');
  assert.equal(area().goatPlayed, 2, 'the goat should have played a word game with you, and given you its apple');
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
  assert.equal(area().ledgeTip, 1, 'the goat below the waterfall should stop you, to tell you that you can hop down the banks');
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
  assert.deepEqual(get('areaChecklist()').filter(([, done, , found]) => found && !done), [], 'chapter 1 so far is ticked off');

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
  assert.deepEqual(get('[S.pos.x, S.pos.y]'), [12, 43]);
  for (let i = 0; i < 30 && !get('S.met').includes('fox'); i++){   // walk about until its tall grass rustles, then step in
    const r = get('rustle');
    if (r) await stepOn(r.x, r.y, 'stepping into the rustling grass on the hillside'); else await stepOn(12, 42, 'walking about at the foot of the hillside');
  }
  assert.ok(knows('狐狸') && get('S.friends').includes('fox'), 'a fox jumps out of the hillside’s tall grass, teaching 狐狸, and becomes your friend');
  assert.equal(run('counter("hillAnimalsLeft")'), 0, 'the animal on the hillside is found');
  run('globalThis.__fights = 0;(() => { const b = wildBattle; wildBattle = (...a) => { __fights++; return b(...a); }; })()');
  await walk([[12, 43], [15, 43], [15, 38], [19, 38], [19, 34], [5, 34], [5, 26], [18, 26], [18, 19], [7, 19], [7, 13], [10, 13], [10, 6], [12, 6], [12, 1]],
    'walking up the hillside: through the gap in the hedge, over the brook, up the stone steps and through its long grass');
  assert.ok(get('__fights') >= 1, `something jumps out of the long grass on the way up (${get('__fights')})`);
  assert.equal(area().lookTip, 1, 'the goat on the lookout stopped you on the way up, to tell you about the view');
  await stepOn(12, 0, 'going into the pine wood, through the archway');
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
  assert.deepEqual(get('[S.pos.x, S.pos.y]'), [12, 1]);
  run('__fights = 0');
  await walk([[12, 1], [12, 6], [10, 6], [10, 18], [10, 22], [14, 22], [14, 34], [19, 34], [19, 38], [15, 38], [15, 43], [12, 43], [12, 44]], 'walking down the hillside, hopping down its banks');
  assert.ok(get('__fights') >= 1, `something jumps out of the long grass on the way down too (${get('__fights')})`);
  await stepOn(12, 45, 'going back down to the home ground');
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
  // The first lesson of each kind teaches three words, one after another (the school lessons are the exception to one new
  // word at a time, decided 24 October 2026); after that, one a lesson
  const shellsBefore = get('S.shells');
  await pressAt(7, 3, 'up', 'the first lesson with the teacher', 3);
  assert.ok(get('__said').includes('上课！') && get('__said').includes('下课！'), 'class begins, and is over');
  assert.ok(get('S.shells') > shellsBefore, 'shells for the words that needed practice');
  assert.ok(['四', '五', '六'].every(knows) && !knows('七'), 'the first lesson teaches three new numbers: 四, 五 and 六');
  // After a lesson that teaches new words, the next new word waits till you've answered 8 more questions, anywhere (decided
  // 26 October 2026): your tasks say so, and the teacher gives you a practice lesson, saying so first
  assert.match(get('getTasks().map(t => t.text).join(" / ")'), /Practise before your next lesson \(0\/8\)/);
  await pressAt(7, 3, 'up', 'a lesson while the next new word waits: practice', 0);
  assert.ok(!knows('红色'), 'practice: nothing new');
  assert.ok(!get('getTasks().some(t => t.id === "practise")') && run('!!lessonNow()'), 'practised: the colours are ready');
  await pressAt(7, 3, 'up', 'the first colour lesson', 3);
  assert.ok(['红色', '黄色', '白色'].every(knows) && !knows('黑色'), 'the first colour lesson teaches three: 红色, 黄色 and 白色');
  assert.deepEqual(get('__scenes').filter(id => id.startsWith('paint')), ['paintLanterns'], 'the class paints the lanterns red');
  assert.equal(run("((AREA.bubbles.big || []).find(b => matches(b.if)) || {}).show"), '!', 'and the big monkey has something to ask: the flowers, a side quest');
  // Then the old monkey's news, before any more lessons: 我们有家，也有学校！ teaches 有, and the troop will have a great
  // feast, at a big table under the big tree at the home ground
  await pressAt(7, 3, 'up', 'hearing the old monkey’s news');
  assert.ok(get('__said').includes('我们有家，也有学校！') && knows('有'), 'the old monkey’s news teaches 有');
  assert.equal(area().feast, 1);
  // The feast's big table: as you come up to the big tree at the home ground, the troop sets it up under it, as you
  // watch; then back to school for the rest of the lessons
  stand(7, 8, 'down');
  await act('arrive(7, 9).then(runEvents)', 'walking out of the school, to the big tree');
  stand(14, 8, 'right');
  await act('arrive(14, 8).then(runEvents)', 'coming up to the big tree');
  assert.deepEqual([area().feast, run('tileAt(17, 7).look')], [2, 'feastTableBare'], 'the troop sets out the feast’s tables, with no bowls');
  // The hungry monkey, beside it, wants bowls: they're in the cave, where the troop lived. You fetch six from its stacks,
  // counting them, and bring them back; they go on the tables, and the big monkey has made chopsticks, teaching 筷子
  await pressAt(19, 8, 'up', 'talking to the hungry monkey by the tables: no bowls');
  assert.ok(get('__said').includes('我们要碗！碗在水帘洞里。'), 'he wants bowls, from the cave');
  assert.equal(area().bowls, 'asked');
  await stepOn(0, 9, 'going west, to the waterfall');
  assert.equal(run('PLACE'), 'falls');
  await pressAt(5, 1, 'left', 'jumping through the waterfall, into the cave');
  assert.equal(run('PLACE'), 'cave');
  for (let i = 0; i < 6; i++) await pressAt(9, 4, 'up', 'taking a bowl from the stack');
  assert.equal(area().holding.bowls, '碗', 'six bowls, counted');
  await stepOn(7, 13, 'going out through the waterfall');
  assert.equal(run('PLACE'), 'falls');
  await stepOn(19, 2, 'going back along beside the waterfall, to the home ground');
  assert.equal(run('PLACE'), 'homeGround');
  await pressAt(19, 8, 'up', 'giving the hungry monkey the bowls');
  assert.equal(run('tileAt(17, 7).look'), 'feastTableBowls', 'the bowls go on the tables');
  await pressAt(15, 5, 'up', 'seeing what the big monkey has made for the feast');
  assert.ok(knows('筷子') && area().tableware === 2 && run('tileAt(17, 7).look') === 'feastTable', 'the big monkey’s chopsticks teach 筷子 (chopsticks), and a cup of them goes on the table');
  // Then what the troop has for the feast, and what it hasn't, 我们没有蜂蜜！, teaching 没有; then the feast's list, A at the
  // table
  await pressAt(19, 8, 'up', 'talking to the hungry monkey by the table');
  assert.ok(get('__said').includes('我们没有蜂蜜！') && knows('没有'), 'the hungry monkey teaches 没有');
  assert.equal(area().feast, 3);
  await pressAt(17, 8, 'up', 'looking at the feast’s list');
  assert.ok(get("!!S.lines['我们没有蜂蜜。'] && !!S.lines['我们有桃子。']"), 'the list shows what the troop has, and what the feast still needs');
  // A little monkey asks you to play hide and seek (a side quest): you count to ten with your eyes covered, and it calls
  // out where it's hiding, its English with the place's word in Chinese; A at the wrong place, and it calls out again;
  // after two wrong guesses its tail pokes out; found, it jumps out, with shells the first time
  await pressAt(13, 9, 'up', 'playing hide and seek with a little monkey');
  assert.ok(['我们来捉迷藏吧！', '一，二，三，四，五，六，七，八，九，十！', '我来了！'].every(t => get('__said').includes(t)), 'it asks you to play, and you count to ten');
  const hidden = area().hide.spot, clue = get('L[hideSpot(here().hide.spot).say].t.join("")');
  assert.ok(hidden && get('__said').includes(clue), 'it calls out where it’s hiding');
  assert.ok(!get("NPCS.some(n => n.id === 'hider')"), 'and it’s gone from where it stood');
  const LOOK = {tree: [19, 4, 'left'], table: [17, 8, 'up'], bridge: [16, 17, 'down'], water: [17, 15, 'right'], flowers: [25, 2, 'right']};   // where you stand to look at each place
  const wrong = Object.keys(LOOK).filter(id => id !== hidden && get(`lvl(hideSpot('${id}').word)`) >= 1).slice(0, 2);
  for (const id of wrong) await pressAt(...LOOK[id], `looking for the little monkey: ${id}, the wrong place`);
  assert.equal(area().hide.wrong, 2, 'two wrong guesses: its tail pokes out now');
  const shellsNow = get('S.shells');
  await pressAt(...LOOK[hidden], 'finding the little monkey');
  assert.ok(get('__said').includes('找到你了！'), 'found you!');
  assert.deepEqual([area().hide.spot, area().hide.won, get('S.shells') - shellsNow], [null, 1, 3], 'found, with 3 shells the first time');
  run('placeCharacters()');
  // The bees begin (25 October 2026): as the hungry monkey tells you there's no honey, the troop clears the bushes at the
  // east end of the road, and the riverside leads east along the stream. You walk it: through the long grass grown over the
  // way in the little wood (a snake jumps out), up through the wildflowers, where a butterfly flutters: A at it teaches
  // 蝴蝶, and its questions make it your friend
  assert.equal(area().bees, 1, 'the hungry monkey wants honey: the bees begin');
  assert.equal(run('tileAt(31, 9).look'), 'path', 'the bushes at the east end of the road are cleared');
  stand(30, 9, 'right');
  await act('arrive(31, 9).then(runEvents)', 'going east along the road, to the riverside');
  assert.equal(run('PLACE'), 'riverside');
  const shellsRiver = get('S.shells');
  await walk([[1, 7], [14, 7], [14, 5], [18, 5]], 'walking along the riverside, through the long grass in the little wood');
  assert.ok(get('S.shells') > shellsRiver, 'a battle in the long grass, won: shells');
  await pressAt(18, 5, 'up', 'meeting the butterfly over the wildflowers', 1);
  assert.ok(knows('蝴蝶') && get('S.friends').includes('butterfly'), 'the butterfly: 蝴蝶, and a new friend');
  // On, over the bridge and under the valley's rocks, through the long grass again, into the bees' valley (百花谷): tall
  // flowers grown across the way in, where a wasp jumps out, teaching 黄蜂; a swarm of bees in front of the queen's old tree
  await walk([[18, 5], [22, 5], [22, 7], [46, 7]], 'walking on along the riverside, over the bridge and under the rocks');
  await act('arrive(47, 7).then(runEvents)', 'into the bees’ valley');
  assert.deepEqual([run('PLACE'), area().bees], ['flowerValley', 2], 'the bees’ valley: found');
  assert.ok(get('__said').includes('花里有蜜蜂，也有黄蜂！'), 'the butterfly flutters in after you: there are bees in the flowers, and wasps too!');
  await walk([[1, 10], [8, 10], [8, 12], [12, 12], [12, 8], [25, 8]], 'walking into the valley, through the tall flowers grown across the way in');
  assert.ok(knows('黄蜂'), 'a wasp jumps out of the tall flowers: 黄蜂');
  await pressAt(25, 8, 'up', 'looking at the swarm in front of the old tree');
  assert.ok(!run('walkable(25, 7)'), 'the swarm won’t let you by');
  // The bees hide in the tall flowers, the flowers shaking where one is: step in and it buzzes out (the first teaches 蜜蜂),
  // and its questions make it your friend, counted aloud, 一！ to 一，二，三，四，五，六！; the sixth sends you to find the
  // queen (去找蜂王吧！), and the swarm in front of her old tree flies aside
  for (let i = 0; i < 60 && area().beeFriends < 6; i++){
    if (!run('!!rustle')){ for (const x of [12, 13, 12, 13]){ stand(x, 9, 'right'); await act(`arrive(${x}, 9).then(runEvents)`, 'walking about the valley'); } continue; }
    const [rx, ry] = get('[rustle.x, rustle.y]');
    stand(rx, ry, 'up');   // (stepping in where the flowers shake)
    await act(`arrive(${rx}, ${ry}).then(runEvents)`, 'meeting a bee in the tall flowers', 1);
  }
  assert.ok(knows('蜜蜂') && area().beeFriends === 6, 'six bee friends');
  assert.deepEqual(area().out, {}, 'each stayed out where you met it, till all six flew off to join the swarm');
  assert.ok(['一！', '一，二！', '一，二，三，四，五，六！', '去找蜂王吧！'].every(t => get('__said').includes(t)), 'counted aloud, and the sixth: go and find the queen!');
  assert.ok(area().bees === 3 && run('walkable(25, 7)'), 'the swarm has flown aside: the way to the old tree is open');
  // The queen bee (蜂王) comes out of her old tree as you press A at it: her card, 你要什么？, and you say 我们要蜂蜜！; her
  // word game (six questions, two of them sentences with a word missing) wins her over: 好！我们去你家吧！, and she and her
  // swarm follow you home, back along the riverside, to the wildflowers below the cliff; the hungry monkey is thrilled:
  // 我们有蜜蜂了！
  stand(25, 8, 'up');
  await walk([[25, 8], [25, 6]], 'up into the nook, where the swarm was, to the old tree');
  await pressAt(26, 6, 'up', 'pressing A at the old hollow tree: the queen bee comes out, and plays her word game', 1);
  assert.ok(knows('蜂王') && area().bees === 5, 'the queen bee: 蜂王, won over by her word game');
  assert.ok(['你要什么？', '我们要蜂蜜！', '好！我们去你家吧！'].every(t => get('__said').includes(t)), 'what she asks, what you want, and she’s coming');
  assert.deepEqual(get('S.following'), ['queen', 'beeSwarm'], 'she and her swarm follow you');
  stand(1, 10, 'left');
  await act('arrive(0, 10).then(runEvents)', 'back out of the valley, the bees following');
  stand(1, 7, 'left');
  await act('arrive(0, 7).then(runEvents)', 'back along the riverside to the home ground, the bees following');
  assert.equal(run('PLACE'), 'homeGround');
  assert.deepEqual([area().bees, get('S.following')], [6, []], 'home: the bees fly to the wildflowers below the cliff');
  await pressAt(20, 7, 'left', 'telling the hungry monkey the bees are home');
  assert.ok(get('__said').includes('我们有蜜蜂了！') && area().bees === 7, 'we have bees now!');
  // Talking to the queen by the wildflowers, the troop builds the bees a hive there (marked out, then set up a piece at a
  // time): 这是我们的家！, and they fly in. A at the hive takes honey, teaching 蜂蜜; the hungry monkey takes it (我要吃蜂蜜) and
  // pours it into the bowl on the feast's table: 我们有蜂蜜了！ After that, the hive fills your bag
  await walk([[20, 7], [27, 7]], 'walking over to the bees by the wildflowers');
  await pressAt(27, 7, 'up', 'talking to the queen bee: the troop builds the bees a hive');
  assert.ok(get('__said').includes('这是我们的家！') && area().bees === 10 && run('tileAt(28, 3).look') === 'hive', 'the bees’ hive, built: this is our home!');
  await pressAt(28, 5, 'up', 'taking honey from the hive', 1);
  assert.ok(knows('蜂蜜') && area().holding.honey === '蜂蜜', 'honey: 蜂蜜');
  await pressAt(20, 7, 'left', 'giving the hungry monkey the honey');
  assert.ok(get('__said').includes('我们有蜂蜜了！') && area().honey === 'done' && area().bees === 11, 'honey in the bowl on the feast’s table: we have honey now!');
  assert.equal(run('tileAt(17, 7).look'), 'feastTableHoney');
  await pressAt(28, 5, 'up', 'taking honey from the hive, for your bag');
  assert.equal(get("S.bag['蜂蜜']"), 2, 'honey in your bag: the hungry monkey’s, and the hive’s');
  stand(11, 5, 'up');
  await act('arrive(11, 4).then(runEvents)', 'walking back into the school');
  assert.equal(run('PLACE'), 'school');
  for (let i = 0; i < 50 && (run('counter("numbersKnown")') < 7 || run('counter("coloursKnown")') < 9); i++) await pressAt(7, 3, 'up', `lesson ${i + 3}`);   // (a new word, or practice while the next waits)
  for (const n of ['五', '六', '七', '八', '九', '十']) assert.ok(knows(n), `the number lessons teach ${n}`);
  for (const c of ['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色']) assert.ok(knows(c), `the colour lessons teach ${c}`);
  assert.deepEqual(get('__scenes').filter(id => id.startsWith('paint')), ['paintLanterns'], 'the red lesson ends with the class painting the lanterns (no other part of the school, since 24 October 2026)');
  assert.deepEqual(get('paintedParts()'), {lanterns: '红色'}, 'and they’re red');
  await pressAt(7, 3, 'up', 'a lesson once you know the numbers to ten and the colours: practice');
  assert.deepEqual(get('areaChecklist()').filter(([, done, , found]) => found && !done), [], 'chapter 1 so far is ticked off');

  // Chapter 1: once you know red, yellow and white, the big monkey wants flowers to plant in front of the school, one of
  // each colour, picked at the home ground (a side quest: this player has had every lesson first); each shows what it is
  // as you pick it, and he plants them as you watch
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

  // Chapter 1: the cow (26 October 2026). Since the feast's quests began, the thirsty monkey has been by the road at the
  // home ground, with news: 山上有牛！ (牛 just for listening); the troop clears the bushes past the bridge at the bottom of
  // the home ground, the way south, down the south slope and through the dark pines, to the pasture (牧场). In the pines, a
  // cow moos; by its spring in the pasture, you find it:
  // 牛, said as you meet it, and it's scared of the wolves: 我怕狼！ Its word game wins its trust: 好！我们去你家吧！, and
  // it follows you home. As you come into the gap between the big rocks, a bear rears up at you (beaten, it lumbers off
  // for good); and home, as you come up to the thirsty monkey, the cow stays by him
  await pressAt(21, 10, 'down', 'talking to the thirsty monkey, by the road');
  assert.ok(get('__said').includes('山上有牛！') && area().cow === 1, 'there’s a cow on the mountain!');
  assert.ok(!knows('牛'), '牛 is just for listening, till you find the cow');
  assert.equal(run('tileAt(16, 21).look'), 'path', 'the troop has cleared the bushes past the bridge');
  stand(16, 20, 'down');
  await act('arrive(16, 21).then(runEvents)', 'going south, over the bridge');
  assert.equal(run('PLACE'), 'southSlope', 'the south slope (27 October 2026)');
  // Down the south slope: hopping down the bank, the quick way; along to the lookout, where you see the cow far below by its
  // spring; then on down, the steps and the stepping stones, into the pines
  await walk([[12, 1], [12, 8], [12, 13], [6, 13], [6, 16]], 'down the south slope, hopping down a bank, to the lookout');
  await pressAt(6, 16, 'down', 'looking out from the lookout’s railing');
  assert.ok(area().cowSeen === 1 && get('__scenes').includes('cowView'), 'the cow, far below, by its spring');
  await walk([[6, 16], [6, 13], [21, 13], [21, 21], [13, 21], [13, 27], [3, 27], [3, 33], [12, 33], [12, 38]], 'down the steps, over the stepping stones and down more steps, to the pines');
  await act('arrive(12, 39).then(runEvents)', 'going on down, into the dark pines');
  assert.deepEqual([run('PLACE'), area().cow], ['darkPines', 2], 'the dark pines (黑松林): a cow moos, somewhere beyond them');
  // The way through the dark pines (27 October 2026): it forks; the cow's hoofprints show which way it went, down a narrow
  // gully where a great hollow pine lies along it, to crawl through; to a stream too deep to wade, where a dead pine on the
  // bank, knocked down with your stick, falls across it; over it, a rabbit by the way saw the cow go by (its word game won,
  // it shows you which way); and on, south, through long grass, out to the pasture
  await walk([[16, 1], [16, 4], [21, 4]], 'coming to where the way forks: hoofprints, going east');
  assert.equal(area().pastureTracks, 1, 'the hoofprints, seen');
  await walk([[21, 4], [28, 4], [28, 6]], 'following them east, to the top of a narrow gully');
  assert.equal(area().logSeen, 1, 'a great hollow pine, fallen along it');
  await walk([[28, 6], [28, 16], [23, 16], [23, 17]], 'crawling through the hollow pine, and along the stream’s bank');
  assert.deepEqual([area().streamSeen, run('walkable(23, 18)')], [1, false], 'the stream, too deep for a little monkey to wade');
  await pressAt(23, 17, 'right', 'knocking the dead pine on its bank down with the stick');
  assert.deepEqual([area().pastureLog, run('tileAt(23, 18).look'), run('walkable(23, 18)'), run('walkable(23, 19)')], [1, 'logBridge', true, true], 'it falls across the stream: a bridge');
  await walk([[23, 17], [23, 20], [20, 20], [20, 22]], 'over the fallen pine, to where the way forks again');
  await pressAt(20, 22, 'down', 'the rabbit by the way, and its word game');
  assert.ok(area().rabbitTold === 1 && ['你找牛吗？', '牛在那里！'].every(t => get('__said').includes(t)), 'the rabbit saw the cow, and shows you which way');
  await walk([[20, 22], [16, 22], [16, 28]], 'on, south, through the long grass');
  await act('arrive(16, 29).then(runEvents)', 'out of the pines, into the pasture');
  assert.equal(run('PLACE'), 'pasture', 'the pasture (牧场)');
  await pressAt(31, 17, 'down', 'finding the cow by its spring, and playing its word game');
  assert.ok(knows('牛') && get('__said').includes('我怕狼！') && get('__said').includes('好！我们去你家吧！'), 'the cow: 牛, scared of the wolves, then won over');
  assert.deepEqual([area().cow, get('S.following')], [4, ['cow']], 'it follows you home');
  await walk([[31, 17], [31, 16], [21, 16], [21, 14]], 'leading the cow into the gap between the rocks, where a bear rears up');
  assert.ok(area().cowWolf === 1 && knows('熊'), 'the bear at the rocks (熊, taught as you meet it), beaten');
  await walk([[21, 14], [21, 9], [20, 9], [20, 5], [16, 5], [16, 1]], 'on up, through the long grass, to the edge of the pines');
  await act('arrive(16, 0).then(runEvents)', 'back into the dark pines, with the cow');
  assert.deepEqual([run('PLACE'), get('S.following')], ['darkPines', ['cow']]);
  // The way home (version 3, 27 October 2026): at the long grass in the dark pines, the cow stops, scared of the wolves
  // in it: 我怕狼！ You go first, and a wolf leaps out at you; chase it off, and it follows you through
  await walk([[16, 28], [16, 27]], 'leading the cow up to the long grass in the dark pines');
  assert.deepEqual([area().cowWaits, get('S.following')], ['grass', []], 'it won’t go into the long grass: it waits for you');
  await walk([[16, 27], [16, 26]], 'going first into the long grass, where a wolf leaps out');
  assert.deepEqual([area().pinesWolf, area().cowWaits, get('S.following')], [1, 0, ['cow']], 'the wolf chased off, the cow follows you through');
  await walk([[16, 26], [16, 20], [23, 20], [23, 16], [28, 16], [28, 4], [16, 4], [16, 1]], 'back through the dark pines, over the fallen pine and through the hollow one, with the cow');
  await act('arrive(16, 0).then(runEvents)', 'back up to the south slope, with the cow');
  assert.deepEqual([run('PLACE'), get('S.following')], ['southSlope', ['cow']]);
  // Up the south slope, at the top of the steps from the pines, it stops again, hungry: 我饿了。 Pick it three handfuls of
  // fresh grass by the brook (counted 一 二 三), give it it (我要吃草), and it follows you on, up the steps
  await walk([[12, 38], [12, 33], [3, 33], [3, 27]], 'leading the cow up the steps from the pines');
  assert.ok(area().cowWaits === 'slope' && get('__said').includes('我饿了。'), 'the cow is hungry: it waits for you');
  await walk([[3, 27], [12, 27], [12, 25]], 'going to the fresh grass by the brook');
  for (let i = 0; i < 3; i++) await pressAt(12, 25, 'left', 'picking a handful of fresh grass for the cow');
  assert.equal(area().holding.cowFood, '草', 'three handfuls');
  await walk([[12, 25], [12, 27], [3, 27]], 'taking the grass back to the cow');
  await pressAt(3, 27, 'left', 'giving the cow the grass');
  assert.deepEqual([area().cowFood, area().cowWaits, get('S.following')], ['done', 0, ['cow']], 'fed, it follows you on');
  await walk([[3, 27], [13, 27], [13, 21], [21, 21], [21, 13], [3, 13], [3, 6], [12, 6], [12, 1]], 'up the south slope the long way, by its steps, with the cow');
  await act('arrive(12, 0).then(runEvents)', 'back to the home ground, with the cow');
  assert.deepEqual([run('PLACE'), get('S.following')], ['homeGround', ['cow']]);
  await walk([[16, 20], [16, 10], [19, 10]], 'leading the cow to the thirsty monkey, by the road');
  assert.deepEqual([area().cow, get('S.following'), get("[ALL_NPCS.find(n => n.id === 'cow')].map(n => [n.place, n.x, n.y])[0]")], [5, [], ['homeGround', 22, 11]], 'home: it stays by the thirsty monkey');
  // Its own home (version 3): the thirsty monkey's ! (the troop is ready), and the troop builds the cow a pen by the road
  // as you watch; it follows you in through the gate: 这是你的家！ It thanks you (谢谢你！, and you reply 不客气), and gives
  // you some of its milk (牛奶), which the thirsty monkey wants to drink: 我要喝牛奶！ Give it him (the gap in 我要喝牛奶),
  // and the rest is for the feast, in a bowl on its second table, with a jug of it, as you come up to it: 我们有牛奶了！
  await pressAt(21, 10, 'down', 'the troop building the cow a pen, by the road');
  assert.deepEqual([area().cow, get('S.following'), run('tileAt(23, 11).look')], [7, ['cow'], 'pen'], 'built, and the cow follows you');
  await walk([[21, 10], [24, 10], [24, 12]], 'leading the cow in through the gate of its new home');
  assert.deepEqual([area().cow, get('S.following'), area().milk], [8, [], 'asked'], 'home, in its pen; and its milk, for the thirsty monkey');
  assert.ok(knows('牛奶') && ['这是你的家！', '谢谢你！', '我要喝牛奶！'].every(t => get('__said').includes(t)), 'this is your home!');
  await walk([[24, 12], [24, 10], [21, 10]], 'out through the gate, back to the thirsty monkey');
  await pressAt(21, 10, 'down', 'giving the thirsty monkey the milk');
  assert.deepEqual([area().milk, area().cow, area().milkTable], ['done', 9, 1], 'he drinks some, and the rest is on the feast’s new table');
  assert.ok(get('__said').includes('我们有牛奶了！'));
  // The little dairy (version 4): the thirsty monkey takes some of the milk to a little table by the pen, set up as you
  // watch: 我要做吃的！ It's ready once you've answered 8 more questions, anywhere (practice lessons at school, here): 好了！,
  // and 酸奶 (yoghurt); then the same again for cheese (奶酪). Each goes on the feast's new table too
  await pressAt(21, 10, 'down', 'the thirsty monkey taking some milk to his little dairy');
  assert.deepEqual([area().dairy, run('tileAt(19, 11).look')], [1, 'dairy'], 'he’s making something: 我要做吃的！');
  for (const [word, done] of [['酸奶', 3], ['奶酪', 5]]){
    stand(11, 5, 'up');
    await act('arrive(11, 4).then(runEvents)', 'walking into the school, to practise');
    for (let i = 0; i < 12 && run('counter("dairyWait")') < 8; i++) await pressAt(7, 3, 'up', 'a practice lesson, while he makes it', 0);
    assert.equal(run('counter("dairyWait")'), 8, 'practised: 8 questions');
    stand(7, 8, 'down');
    await act('arrive(7, 9).then(runEvents)', 'walking out of the school');
    assert.equal(area().dairy, done - 1, 'it’s ready: a chime, and a ! over him');
    await pressAt(21, 10, 'down', `seeing what he’s made: ${word}`);
    assert.ok(knows(word) && area().dairy === done && get('__said').includes('好了！'), `好了！ ${word}`);
  }
  assert.deepEqual([area().milkTable, run('tileAt(22, 7).look')], [3, 'milkTableCheese'], 'the yoghurt and the cheese in the bowls on the feast’s second table');
  await pressAt(22, 8, 'up', 'looking at the feast’s second table: the spoon in the yoghurt, sparkling');
  assert.ok(knows('勺子'), '勺子 (spoon)');
  // Chapter 1: the big monkey's garden (version 1, 27 October 2026). With the feast's tables set, he wants seeds: 我们要种子！
  // He walks you down to the stream, where the troop marks out a garden. Wild melons grow in a sunny field east off the
  // south slope, where birds keep pecking at them: shoo them all away (A at each shows it, such as 红色的鸟), take a melon's
  // seeds (西瓜), and give them to him (这是西瓜的种子): the troop plants them in the garden as you watch
  await pressAt(15, 5, 'up', 'talking to the big monkey: he made the spoon');
  assert.ok(get('__said').includes('我做了勺子！') && area().spoons === 2, 'I made spoons!');
  await pressAt(15, 5, 'up', 'talking to the big monkey again: he wants seeds, for a garden');
  assert.ok(get('__said').includes('我们要种子！') && knows('种子'), 'we want seeds!');
  assert.deepEqual([area().garden, area().melonSeeds, run('tileAt(3, 16).look')], [1, 'asked', 'gardenBed'], 'the garden, marked out by the stream');
  stand(16, 20, 'down');
  await act('arrive(16, 21).then(runEvents)', 'going south, over the bridge');
  await walk([[12, 1], [12, 8], [12, 13], [24, 13]], 'down the south slope and east, where the troop has cleared the bushes');
  await act('arrive(25, 13).then(runEvents)', 'into the melon field');
  assert.equal(run('PLACE'), 'melonField', 'the melon field (瓜田)');
  for (const [x, y, dir] of [[13, 4, 'right'], [23, 5, 'right'], [16, 9, 'down'], [20, 11, 'right'], [12, 14, 'down']]) await pressAt(x, y, dir, 'shooing a bird off the melons');
  assert.equal(area().shooed.length, 5, 'the birds, all shooed away');
  await pressAt(12, 11, 'right', 'taking a melon’s seeds');
  assert.ok(knows('西瓜') && area().holding.melonSeeds === '种子', 'a wild watermelon, and its seeds');
  stand(1, 9, 'left');
  await act('arrive(0, 9).then(runEvents)', 'back out of the melon field');
  await walk([[24, 13], [3, 13], [3, 6], [12, 6], [12, 1]], 'back up the south slope, by its steps');
  await act('arrive(12, 0).then(runEvents)', 'back to the home ground');
  await pressAt(10, 13, 'left', 'giving the big monkey the seeds');
  assert.ok(get('__said').includes('这是西瓜的种子'), 'these are watermelon seeds');
  assert.deepEqual([area().melonSeeds, area().melonPlanted, run('tileAt(11, 14).look')], ['done', 1, 'gardenVines'], 'planted in the garden');
  // The garden, version 2: wild grapes on the cliffs (山崖), west off the hillside halfway up. From the top they're out of
  // reach; hop down the bank beside them, onto the ledge below, and pick them (葡萄); hop on down to the bottom, and back up
  // the stone steps. Give the big monkey their seeds (这是葡萄的种子), and the troop sets up a trellis for them
  stand(25, 0, 'up');
  await act('arrive(25, 0).then(runEvents)', 'going up to the hillside');
  await walk([[12, 43], [15, 43], [15, 38], [19, 38], [19, 34], [5, 34], [5, 26], [1, 26]], 'up the hillside, to the west end of its second terrace');
  await act('arrive(0, 26).then(runEvents)', 'west, through the cleared bushes, to the cliffs');
  assert.deepEqual([run('PLACE'), area().cliffsSeen], ['cliffs', 1], 'the cliffs (山崖)');
  await walk([[24, 5], [15, 5], [15, 8]], 'along the top, to above the grapes');
  await pressAt(15, 8, 'down', 'looking at the grapes from the top');
  assert.ok(!knows('葡萄') && run('walkable(15, 9)') === false, 'out of reach');
  await walk([[15, 8], [12, 8], [12, 11], [15, 11]], 'hopping down the bank beside them, onto the ledge below');
  await pressAt(15, 11, 'up', 'picking the grapes');
  assert.ok(knows('葡萄') && area().holding.grapeSeeds === '种子', 'grapes (葡萄), and their seeds');
  await walk([[15, 11], [13, 11], [13, 16], [13, 19], [13, 21], [22, 21], [22, 5], [24, 5]], 'hopping down to the bottom, and back up the stone steps');
  await act('arrive(25, 5).then(runEvents)', 'back east to the hillside');
  await walk([[1, 26], [5, 26], [5, 34], [19, 34], [19, 38], [15, 38], [15, 43], [12, 43], [12, 44]], 'back down the hillside');
  await act('arrive(12, 45).then(runEvents)', 'back to the home ground');
  await pressAt(10, 13, 'left', 'giving the big monkey the grape seeds');
  assert.ok(get('__said').includes('这是葡萄的种子'), 'these are grape seeds');
  assert.deepEqual([area().grapeSeeds, area().grapePlanted, run('tileAt(7, 14).look')], ['done', 1, 'trellis'], 'planted in the garden, with a trellis');
  // The garden, version 3: wild bananas in the hot spring valley (温泉谷), up the brook from the riverside, past the steam
  // vents between its big pools; pick one (香蕉) and give the big monkey its seeds (这是香蕉的种子): two banana plants
  stand(30, 9, 'right');
  await act('arrive(31, 9).then(runEvents)', 'going east along the road, to the riverside');
  await walk([[1, 7], [14, 7], [14, 5], [22, 5], [22, 7], [25, 7], [25, 1]], 'along the riverside, and up beside the brook');
  await act('arrive(25, 0).then(runEvents)', 'up the brook, through the cleared bushes, to the hot spring valley');
  assert.deepEqual([run('PLACE'), area().springsSeen], ['hotSprings', 1], 'the hot spring valley (温泉谷)');
  await walk([[13, 22], [13, 5], [9, 5]], 'up between the hot pools, past the steam, to the banana plants');
  await pressAt(9, 5, 'up', 'picking a banana');
  assert.ok(knows('香蕉') && area().holding.bananaSeeds === '种子', 'a banana (香蕉), and its seeds');
  await walk([[9, 5], [13, 5], [13, 22]], 'back down the valley');
  await act('arrive(13, 23).then(runEvents)', 'back down to the riverside');
  await walk([[25, 1], [25, 7], [1, 7]], 'back along the riverside');
  await act('arrive(0, 7).then(runEvents)', 'back to the home ground');
  await pressAt(10, 13, 'left', 'giving the big monkey the banana seeds');
  assert.ok(get('__said').includes('这是香蕉的种子'), 'these are banana seeds');
  assert.deepEqual([area().bananaSeeds, area().bananaPlanted, run('tileAt(3, 14).look')], ['done', 1, 'bananaHome'], 'two banana plants in the garden');
  // The garden, version 4: each fruit is ripe 8 questions after it was planted (practice lessons at school, here); the big
  // monkey picks each (好了！), and as you come up to the big tree they go on the feast's new table for the garden's fruit
  stand(11, 5, 'up');
  await act('arrive(11, 4).then(runEvents)', 'walking into the school, to practise while the fruit grows');
  for (let i = 0; i < 12 && run('counter("bananaWait")') < 8; i++) await pressAt(7, 3, 'up', 'a practice lesson, while the fruit grows', 0);
  assert.deepEqual([area().melonPlanted, area().grapePlanted, area().bananaPlanted], [2, 2, 2], 'all three ripe');
  stand(7, 8, 'down');
  await act('arrive(7, 9).then(runEvents)', 'walking out of the school');
  for (const fruit of ['西瓜', '葡萄', '香蕉']) await pressAt(10, 13, 'left', `the big monkey picking the ripe ${fruit}`);
  assert.deepEqual([area().melonPlanted, area().grapePlanted, area().bananaPlanted], [3, 3, 3], 'picked, for the feast');
  await walk([[10, 13], [10, 10], [13, 10]], 'walking up to the big tree');
  assert.deepEqual([area().fruitTable, area().melonPlanted, area().grapePlanted, area().bananaPlanted], [1, 4, 4, 4], 'on the feast’s new table');
  assert.deepEqual(get('[12, 13, 14].map(x => tileAt(x, 7).look)'), ['fruitTableMelon', 'fruitTableGrapes', 'fruitTableBananas']);
  assert.ok(['我们有西瓜了！', '我们有葡萄了！', '我们有香蕉了！'].every(t => get('__said').includes(t)), 'we have watermelon, grapes and bananas now!');
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
