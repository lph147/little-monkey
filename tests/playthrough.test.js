// Plays Flower Fruit Mountain from a new game to the end of what's built (chapter 1: the school and its lessons), the way a
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
  await pressAt(11, 8, 'down', 'collecting water from the pond');
  await pressAt(2, 11, 'down', 'giving the thirsty monkey the water');
  assert.equal(area().thirsty, 'done', 'the thirsty monkey should take the water');
  assert.equal(area().gate, false, 'the rocks stay until the rest of the prologue is done');

  // The big monkey, in the middle meadow: a red, a yellow and a white flower, for shells
  await pressAt(4, 10, 'right', 'meeting the big monkey');
  assert.equal(area().flowers, 'asked', 'the big monkey should ask for flowers');
  await pressAt(11, 6, 'down', 'picking a red flower');
  assert.ok(knows('红色'), 'the first red flower should teach 红色');
  await pressAt(11, 6, 'down', 'trying another red flower');
  assert.equal(get('here().picked.flowers.length'), 1, 'one flower of each colour');
  await pressAt(11, 16, 'down', 'picking a yellow flower in the south');
  await pressAt(16, 9, 'right', 'picking a white flower by the river');
  for (const w of ['黄色', '白色']) assert.ok(knows(w), `picking should teach ${w}`);
  assert.equal(area().holding.flowers, '花', 'you should be holding 3 flowers');
  const peaches = get('S.shells');
  await pressAt(4, 10, 'right', 'giving the big monkey the flowers');
  assert.equal(area().flowers, 'done', 'the big monkey should take the flowers');
  assert.ok(knows('不客气'), 'with nothing else new, you reply 不客气');
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
  await pressAt(12, 5, 'up', 'reading the stone tablet');
  for (const w of ['床', '碗', '桌子']) assert.ok(knows(w), `${w} should be found in the cave`);
  assert.ok(!knows('桥'), 'the bridge doesn’t teach 桥 (it waits for chapter 1)');
  await stepOn(7, 13, 'walking out through the water curtain');
  assert.equal(run('PLACE'), 'falls', 'you should be back by the waterfall');
  assert.deepEqual(get('[S.pos.x, S.pos.y]'), [5, 1]);
  await pressAt(8, 1, 'right', 'telling the old monkey about the cave');
  assert.equal(area().cave, 3, 'the old monkey should hear about the cave');
  assert.ok(get('areaChecklist()').slice(0, 3).every(([, done]) => done), 'the start of the prologue’s checklist should be ticked off');

  // Then leading the troop in, home, becoming king, and counting them in
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
  assert.deepEqual(get("(({place, x, y}) => [place, x, y])(ALL_NPCS.find(n => n.id === 'elder'))"), ['homeGround', 8, 6], 'by the school’s plot');
  assert.ok(get('__said').includes('这里很大！'), 'he says how big it is');
  assert.ok(get('areaChecklist()').filter(([, , , found]) => found).every(([, done]) => done), 'chapter 1 so far is ticked off');

  // Chapter 1: the big monkey wants wood and small stones to build the school, from the pine wood up the hill
  await pressAt(13, 5, 'up', 'talking to the big monkey at the home ground');
  assert.equal(area().build, 1, 'he wants wood and small stones');
  assert.deepEqual([area().wood, area().stones], ['asked', 'asked']);
  stand(18, 0, 'up');
  await act('arrive(18, 0).then(runEvents)', 'going up through the bushes he cleared, to the pine wood');
  assert.equal(run('PLACE'), 'pineWood', 'you should be in the pine wood');
  await pressAt(10, 10, 'right', 'meeting a squirrel in the pine wood');
  assert.ok(get('__said').includes('你要木头吗？'), 'it asks if you want wood');
  await pressAt(3, 3, 'up', 'knocking down a dry, dead pine with your stick');
  assert.ok(knows('木头'), 'the first piece of wood teaches 木头');
  assert.equal(run('tileAt(3, 2).look'), 'stump', 'the dead pine is down');
  await pressAt(13, 3, 'up', 'knocking down another dead pine');
  await pressAt(3, 5, 'down', 'picking up a small stone by the stream');
  await pressAt(15, 9, 'up', 'picking up another small stone');
  assert.deepEqual([run('counter("woodGot")'), run('counter("stonesGot")')], [2, 2], 'two of each, counted');
  assert.ok(get('__said').includes('二'), 'you count them aloud');
  await pressAt(15, 4, 'right', 'breaking the cracked rock');
  assert.ok(run('tileAt(16, 4).walk'), 'the way into the little clearing is open');
  await pressAt(19, 3, 'up', 'knocking down the dead pine in the clearing');
  await pressAt(18, 3, 'up', 'picking up the small stone in the clearing');
  assert.deepEqual(area().holding, {wood: '木头', stones: '石头'}, 'three of each: you have them all');
  stand(10, 13, 'down');
  await act('arrive(10, 13).then(runEvents)', 'going back down to the home ground');
  assert.equal(run('PLACE'), 'homeGround');
  await pressAt(13, 5, 'up', 'giving the big monkey the wood and the stones');
  assert.deepEqual([area().wood, area().stones, area().build], ['done', 'done', 2], 'he takes them, and the troop gets to work');
  assert.equal(run('tileAt(6, 2).look'), 'frame', 'the school’s frame is up on its plot');

  // Chapter 1: the troop builds the school, and you go in: the class greets its teacher, the little monkey is your
  // classmate, and the teacher gives you a lesson
  await pressAt(13, 5, 'up', 'talking to the big monkey: the troop builds the school');
  assert.deepEqual(get('__scenes').slice(-1), ['buildingSchool'], 'the scene of the troop building it, told like the opening');
  assert.ok(knows('学校'), 'the school teaches 学校');
  assert.equal(run('tileAt(6, 2).look'), 'school', 'the school stands on its plot');
  stand(9, 5, 'up');
  await act('arrive(9, 4).then(runEvents)', 'walking in through the school’s door');
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
  for (let i = 0; i < 12 && run('counter("numbersKnown")') < 7; i++) await pressAt(7, 3, 'up', `number lesson ${i + 2}`);
  for (const n of ['五', '六', '七', '八', '九', '十']) assert.ok(knows(n), `the number lessons teach ${n}`);
  await pressAt(7, 3, 'up', 'a lesson once you know the numbers to ten: practice');
  assert.ok(get('areaChecklist()').every(([, done]) => done), 'chapter 1 so far is ticked off');

  // Everything said on the way has a voice clip (npm run voices makes them)
  const clips = require('../tools/make-voices').plan().clips, said = get('__said');
  assert.ok(said.length > 50, 'the game should say plenty aloud');
  const missing = [...new Set(said)].filter(t => !Object.values(clips).some(c => c[t]));   // in one of the voices
  assert.deepEqual(missing, [], 'these are said but have no voice clip: tools/make-voices.js should find them in the content');
});
