// Plays the Eastern Sea (Area 3: Chapters 5 and 6) from the phone's test save, a game at the end of Chapter 4 at the iron
// bridge (tools/area3-start.json), diving in, to the Great White Planet's invitation at the end of Chapter 6, the way a
// player would, as tests/playthrough.test.js plays Flower Fruit Mountain: standing in front of things and pressing A,
// stepping into the seaweed where it rustles, pressing A through what characters say, and answering every card (telling
// your staff what to do, and the book of names, as a player would). It catches a change that makes the area impossible to
// finish: a task that never appears, a card that can't be closed, a way that never opens.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadGame} = require('./fake-browser');
const {watchBeside, besideTasks} = require('./beside');

test('the Eastern Sea can be played from the dive to the end of Area 3', async () => {
  const start = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tools', 'area3-start.json'), 'utf8'));
  const game = loadGame({dom: true, save: {...start, area: 3}});   // (as the dive leaves it: the sail step, then the page loads again in Area 3)
  watchBeside(game);
  const run = code => game.run(code);
  const get = expr => JSON.parse(run(`JSON.stringify(${expr})`));
  const sheet = game.el('#sheet'), talkBox = game.el('#talk');
  const talking = () => run('!!talkNext');
  const open = () => !run('modal.hidden') || talking();
  const cardText = () => (talking() ? talkBox : sheet).textContent.replace(/\s+/g, ' ').trim();
  const knows = w => run(`lvl(${JSON.stringify(w)})`) >= 1;
  const area = () => get('here()');

  run('Math.random = () => 0');
  run(`(() => { const pq = pictureQ; pictureQ = q => { globalThis.__q = q; return pq(q); }; })()`);
  run(`globalThis.__said = []; (() => { const s = say; say = (text, end) => { __said.push(text); return s(text, end); }; })()`);
  run(`(() => { const tc = tellCard; tellCard = id => { globalThis.__tellId = id; return tc(id); }; })()`);   // (what you're telling your staff, so you can choose)
  run("globalThis.__parts = []; (() => { const p = partsCheck; partsCheck = async () => { const was = here().part; await p(); if (here().part !== was && partNow()) __parts.push(partNow().name + ': ' + partNow().title); }; })()");
  run("globalThis.__scenes = []; storyScene = async id => { __scenes.push(id); }");   // (each scene plays by itself, with its pictures: its own test draws it)

  const tick = () => new Promise(r => setImmediate(r));
  async function settle(){
    for (let i = 0; i < 1000; i++){
      if (run('!!race && !busy')) run('bHeld = true; pl.x = race.to; bHeld = false');   // a race with the dolphin: you run to the finish, and win
      await tick();
      if (game.flush()) continue;
      await tick();
      if (!game.flush()) return;
    }
    throw new Error('the game kept setting timers');
  }
  function answer(){   // do what a player would on the card that's open
    if (talking()){ run('pressA()'); return; }
    if (sheet.querySelector('.tells')){   // telling your staff what to do: the right thing
      const right = get('AREA.telling[__tellId].right');
      sheet.querySelectorAll('.tells .opt').find(b => b.querySelector('.hz').textContent === right).click(); return;
    }
    if (sheet.querySelector('.bookpage')){   // the book of names: yours, then the troop's
      const ok = sheet.querySelector('[data-a=ok]');
      if (!ok.hidden){ ok.click(); return; }
      const names = get('AREA.books.names.names'), btns = sheet.querySelectorAll('.bname');
      const you = btns.find(b => b.querySelector('.bz').textContent === names.find(n => n.you).zh);
      const next = you.classList.contains('crossed') ? btns.find(b => !b.classList.contains('crossed') && names.find(n => n.zh === b.querySelector('.bz').textContent).monkey) : you;
      next.click(); return;
    }
    const opts = sheet.querySelectorAll('.opt').filter(o => !o.hidden && !o.disabled);
    if (opts.length){ (sheet.querySelector(`.opt[data-i="${run('__q && __q.answerIdx')}"]`) || opts[0]).click(); return; }
    const word = sheet.querySelectorAll('.mw').find(b => !b.classList.contains('done'));
    if (word){ word.click(); sheet.querySelector(`.mp[data-w="${word.dataset.w}"]`).click(); return; }
    const items = sheet.querySelectorAll('[data-n]');
    if (items.length){ sheet.querySelector('[data-a=no]').click(); return; }
    run('pressA()');   // the main button: OK, Next, Begin, Lift it, Another row, Got it...
  }
  const caught = () => get('Object.keys(WORDS).filter(w => lvl(w) >= 1)');
  const deadEnds = [];
  async function act(code, what, most = 1){   // start something, then answer its cards until it's finished (teaching at most this many words)
    const before = caught();
    let done = false, failed = null, last = '', same = 0;
    Promise.resolve(run(code)).then(() => { done = true; }, e => { failed = e; done = true; });
    for (let i = 0; i < 3000 && !done; i++){
      await settle();
      if (done || !open()) continue;
      const now = cardText() + sheet.querySelectorAll('.done, .crossed, [disabled], [hidden]').length;
      same = now === last ? same + 1 : 0; last = now;
      if (same > 20) break;
      answer();
    }
    if (failed) throw failed;
    assert.ok(done, `stuck while ${what}: ${open() ? cardText() : 'no card open'}`);
    await settle();
    assert.ok(!open(), `a card was left open after ${what}: ${cardText()}`);
    const learned = caught().filter(w => !before.includes(w));
    assert.ok(learned.length <= most, `at most ${most} new word${most > 1 ? 's' : ''}, but ${what} taught ${learned.join(' and ')}`);
    if (!get('getTasks().length')) deadEnds.push(what);
  }
  const stand = (x, y, dir) => run(`S.pos = {place:PLACE, x:${x}, y:${y}, dir:'${dir}'}; placePlayer();`);
  const pressAt = (x, y, dir, what, most) => { stand(x, y, dir); return act('finishedAt = null; pressA()', what, most); };
  const stepOn = (x, y, what, dir = 'down') => { stand(x, y, dir); return act(`arrive(${x}, ${y}).then(runEvents)`, what); };
  const goTo = (place, x, y, dir) => run(`S.pos = {place:'${place}', x:${x}, y:${y}, dir:'${dir}'}; placePlayer();`);
  // up to someone (a character, or an animal at its spot), from the first free square beside them, facing them, and A
  const SIDES = [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down']];
  function beside(x, y){
    for (const [dx, dy, dir] of SIDES) if (get(`walkable(${x + dx}, ${y + dy}) && !npcAt(${x + dx}, ${y + dy}) && !animalAt(${x + dx}, ${y + dy})`)) return [x + dx, y + dy, dir];
    throw new Error(`nowhere to stand beside ${x}, ${y} in ${get('PLACE')}`);
  }
  async function talkTo(id, what, most){
    const n = get(`(n => n && [n.x, n.y, n.place])(NPCS.find(n => n.id === '${id}'))`);
    assert.ok(n && n.length, `${id} is here (${get('PLACE')}), to talk to: ${what}`);
    const [x, y, dir] = beside(n[0], n[1]);
    await pressAt(x, y, dir, what, most);
  }
  async function meet(id, what){
    const a = get(`(a => a.at)(ANIMALS.find(a => a.id === '${id}'))`);
    const [x, y, dir] = beside(a[0], a[1]);
    await pressAt(x, y, dir, what);
    assert.ok(get('S.friends').includes(id), `${id} is your friend: ${what}`);
  }
  async function through(x, y, to, what){   // into the way at x, y (the place you're in), and on to the next place
    await stepOn(x, y, what);
    assert.equal(get('PLACE'), to, `${what}: in ${to}`);
  }

  // Chapter 5: the dive, and the seabed
  await act('arriveInArea()', 'diving from the iron bridge');
  assert.deepEqual([get('PLACE'), area().landed], ['seabed', 1], 'on the seabed');
  await talkTo('turtle', 'meeting the sea turtle: 泡泡');
  assert.ok(knows('泡泡'));
  await pressAt(10, 6, 'up', 'a shell: 贝壳');
  await pressAt(9, 7, 'down', 'the sand: 沙子');
  await pressAt(2, 4, 'left', 'the seaweed: 水草');
  await talkTo('turtle', 'the sea turtle again: it swims ahead to the seaweed (游)');
  assert.equal(area().turtle, 2);
  // five starfish in the seaweed: walking up and down beside it till it rustles, then stepping in
  run('rustle = null');
  const paces = [[3, 12], [3, 11], [4, 12], [2, 10], [3, 10], [6, 13], [5, 13], [2, 7], [2, 6], [2, 5]];
  for (let i = 0; i < 200 && get('here().starFriends') < 5; i++){
    const r = get('rustle');
    if (r) await stepOn(r.x, r.y, `stepping into the rustling seaweed (${get('here().starFriends')} starfish found)`);
    else { const [x, y] = paces[i % paces.length]; if (get(`walkable(${x}, ${y}) && !animalAt(${x}, ${y}) && !npcAt(${x}, ${y})`)) await stepOn(x, y, 'walking beside the seaweed'); }
  }
  assert.equal(area().starFriends, 5, 'all five starfish');
  await talkTo('turtle', 'telling the turtle: all five starfish');
  assert.equal(area().turtle, 3);

  // The seaweed forest: the turtle's 小心！ and your first shark; the octopus and its feet
  goTo('seabed', 22, 6, 'right');
  await through(23, 6, 'forest', 'east into the seaweed forest');
  stand(2, 7, 'right'); await act('arrive(2, 7).then(runEvents)', 'into the forest: the turtle’s 小心！, then a shark (鲨鱼)', 2);
  assert.ok(knows('小心') && knows('鲨鱼') && area().forest === 1, '小心, and your first shark');
  await meet('octopus', 'the octopus among the rocks');
  await talkTo('octopus', 'counting the octopus’s feet (脚, 几)', 2);
  assert.equal(area().octopus, 1);
  // a jellyfish in the tall seaweed: walking through it till one drifts out (never three of one creature in a row: after
  // two sharks, a jellyfish)
  for (let i = 0; i < 60 && !knows('水母'); i++) await stepOn(8 + i % 8, 6, 'walking through the tall seaweed', 'right');
  assert.ok(knows('水母'), 'a jellyfish (水母), out of the tall seaweed');

  // The coral reef: coral, the seahorse, the dolphin's races
  goTo('forest', 24, 7, 'right');
  await through(25, 7, 'reef', 'east to the coral reef');
  await pressAt(2, 8, 'left', 'the coral: 珊瑚');
  await meet('seahorse', 'the seahorse among the coral');
  await talkTo('dolphin', 'racing the dolphin (海豚, 快, 慢)', 3);
  await talkTo('dolphin', 'racing the dolphin again, and winning');
  assert.equal(area().dolphin, 2);

  // The trench: across the currents (as they drop), the edge of the deep (深), the whale, the light (光)
  goTo('reef', 24, 7, 'right');
  await through(25, 7, 'trench', 'east to the trench');
  goTo('trench', 4, 8, 'down');   // (across the currents while they're calm)
  await stepOn(4, 9, 'at the edge of the deep');
  assert.ok(knows('深') && area().trench === 1);
  await meet('whale', 'the whale, from the edge');
  goTo('trench', 19, 12, 'down');
  await stepOn(19, 13, 'down the slope to the very bottom: the light');
  assert.equal(area().trench, 2);
  await stepOn(19, 14, 'into the light');
  await through(19, 15, 'palace', 'down into the light: the Dragon Palace');

  // The palace gate: the sea guard, the gold dragons (龙), counting the soldiers by tens (兵, 百), the lobster
  await stepOn(12, 13, 'up to the palace gate: the sea guard stops you', 'up');
  assert.equal(area().palace, 1);
  await pressAt(8, 5, 'up', 'a gold dragon coiled round a pillar: 龙');
  await talkTo('crab', 'counting the shrimp soldiers with the crab general', 2);
  assert.equal(area().palace, 2);
  await meet('lobster', 'the lobster at the palace door');
  assert.equal(area().palace, 3);
  await pressAt(12, 5, 'up', 'in through the palace door');
  assert.equal(get('PLACE'), 'hall');

  // The throne hall: 欢迎, the pillars (柱子), the weapons all too light (重, 斤, 轻, 千, 多少), the Dragon Queen's idea
  assert.equal(area().hall, 1, 'the Dragon King has welcomed you');
  await pressAt(4, 3, 'left', 'a pillar: 柱子');
  await talkTo('dragonKing', 'trying the Dragon King’s weapons', 5);
  assert.equal(area().hall, 2);
  await talkTo('dragonQueen', 'the Dragon Queen’s whisper');
  assert.equal(area().hall, 3);
  goTo('hall', 12, 1, 'up');
  await through(12, 0, 'treasury', 'into the treasury');

  // The staff: 长, 短, 金色, 万, 给; and you'd like clothes too
  await pressAt(7, 6, 'up', 'the iron pillar: telling it what to do, and the staff', 5);
  assert.deepEqual([area().staff, area().weapon, area().gifts], [4, '金箍棒', 1], 'the staff is yours, and his brothers are coming');

  // The drum and the bell (鼓, 钟), and the three dragon kings' gifts
  goTo('treasury', 7, 10, 'down');
  await through(7, 11, 'hall', 'back to the throne hall');
  await pressAt(5, 3, 'up', 'beating the drum', 1);
  await pressAt(10, 3, 'up', 'ringing the bell: 钟');
  assert.equal(area().gifts, 3);
  for (const k of ['southKing', 'westKing', 'northKing']) await talkTo(k, `the gift of the ${k}`);
  assert.equal(area().gifts, 4);
  assert.ok(get('["金色 的 帽子", "金色 的 衣服", "白色 的 鞋"].every(w => wearing(w))'), 'in the dragon kings’ gifts');

  // Home through the seaweed forest (a shark meets your staff), and the turtle swims you home: Chapter 6
  goTo('forest', 23, 7, 'left');
  await stepOn(22, 7, 'back through the seaweed forest: a shark meets your staff', 'left');
  assert.equal(area().home, 1);
  goTo('seabed', 11, 6, 'down');
  await talkTo('turtle', 'the sea turtle: home');
  assert.deepEqual([get('PLACE'), area().chapter, area().home], ['ffmCave', 1, 3], 'home in the Water Curtain Cave: Chapter 6, and the old monkey’s welcome');

  // Home with the staff: the little monkeys can't lift it; up to the sky, down to a needle, into your ear (针, 耳朵, 在)
  goTo('ffmHomeGround', 2, 9, 'right');
  for (const x of [3, 4, 5]) await stepOn(x, 9, 'out to the troop at the home ground', 'right');
  stand(6, 9, 'right'); await act('arrive(6, 9).then(runEvents)', 'up to the little monkeys: your staff to the sky, a needle (针), into your ear (耳朵): 在我的耳朵里！ (在)', 3);
  assert.equal(area().ear, 1, 'your staff in your ear');
  assert.equal(get('inHand()'), null);

  // The staff around the mountain
  goTo('ffmMeadow', 2, 10, 'up');
  await talkTo('baby5', 'the little monkey under the tallest peach tree: 高');
  await pressAt(2, 8, 'left', 'your staff up into the peach tree');
  await talkTo('big', 'the big monkey and the boulder');
  await pressAt(14, 5, 'up', 'your staff, levering the boulder aside');
  await pressAt(13, 10, 'left', 'your staff across the pond to the little island', 1);
  for (const x of [12, 11, 10]) await stepOn(x, 10, 'over the bridge to the island', 'left');
  goTo('ffmCave', 1, 10, 'left');
  await talkTo('baby2', 'the little monkey in the Water Curtain Cave');
  await pressAt(1, 10, 'left', 'your staff into the crack, for her pearl', 1);
  goTo('ffmHomeGround', 3, 12, 'left');
  await talkTo('traineeStick', 'the little monkey in training tries your staff');
  assert.equal(get('counter("staffSpots")'), 5, 'all five spots');
  await stepOn(4, 11, 'back at the home ground: the feast for your staff');
  assert.equal(area().feast, 1);

  // The dream: the officers and their rope (绳子), the lamps (灯), the ten kings (怕, 找, 毛笔), the book of names; waking (醒, 梦)
  goTo('ffmCave', 1, 2, 'up');
  await pressAt(1, 2, 'up', 'going to bed after the feast: the dream');
  assert.equal(get('PLACE'), 'underworld');
  await act('runEvents()', 'two officers come for you with a rope');
  assert.equal(area().dream, 3);
  await pressAt(5, 7, 'left', 'a lamp beside the road: 灯');
  stand(7, 5, 'up'); await act('arrive(7, 5).then(runEvents)', 'up into the hall: the ten kings (怕, 找), the book of names (毛笔); waking at home (醒, 梦)', 5);
  assert.deepEqual([get('PLACE'), area().dream], ['ffmCave', 5], 'woken at home: the troop won’t grow old');

  // Trouble in Heaven, and the Great White Planet's invitation (请): the end of Area 3
  assert.equal(area().invite, 1);
  goTo('ffmHomeGround', 2, 9, 'right');
  await stepOn(3, 9, 'out to the home ground: the Great White Planet comes down on his cloud', 'right');
  assert.equal(area().invite, 3, 'invited to Heaven');
  assert.deepEqual(get('getTasks().map(t => t.id)'), ['continued']);

  assert.deepEqual(get('__parts'), ['Part 1: The seabed', 'Part 2: The seaweed forest', 'Part 3: The coral reef', 'Part 4: The trench', 'Part 5: The Dragon King’s palace', 'Part 6: Too light!',
    'Part 7: The iron pillar', 'Part 8: The drum and the bell', 'Part 1: Home with the staff', 'Part 2: The staff around the mountain', 'Part 3: The dream', 'Part 4: Trouble in Heaven'], 'the story, part by part');
  assert.deepEqual(get('__scenes'), ['dive', 'brothers', 'swimHome', 'staffSky', 'staffFeast', 'dreamIn', 'heaven', 'planetCloud']);
  assert.ok(get('areaChecklist()').every(([, done]) => done), 'every job on the checklist done');
  assert.deepEqual(deadEnds, [], 'your tasks were never empty');
  assert.deepEqual(besideTasks(game), [], 'no task ever sends you to someone you’re standing with, just as you finish talking to them');
  // Every word of the Eastern Sea caught
  assert.deepEqual(get('Object.keys(WORD_BANK).filter(w => WORD_BANK[w].area === 3 && lvl(w) < 1)'), [], 'the words this player hasn’t caught');
  // Everything said on the way has a voice clip
  const clips = require('../tools/make-voices').plan().clips, said = get('__said');
  assert.ok(said.length > 50, 'the game should say plenty aloud');
  const missing = [...new Set(said)].filter(t => !Object.values(clips).some(c => c[t]));
  assert.deepEqual(missing, [], 'these are said but have no voice clip');
});
