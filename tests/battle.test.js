// Battles (18 October 2026): from the end of the prologue, wild creatures jump out of the long grass on the mountain
// path. Both sides have hearts; every hit or miss depends on knowing the word. Losing isn't punished.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const tick = () => new Promise(r => setImmediate(r));
const knows = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
const WORDS = knows(['石头', '山', '花', '草', '树', '桃子', '苹果', '河', '水', '鱼', '棍子', '蛇', '野猪']);
function fighting(save = {}){
  const game = loadGame({dom: true, save: {version: 24, started: true, w: WORDS, areas: {1: {elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 1}}, ...save}});
  game.run("mode = 'play'; globalThis.__q = null; const q = pictureQ; pictureQ = o => { __q = o; return q(o); }; say = () => {}");
  const sheet = game.el('#sheet');
  const run = code => game.run(code);
  const flush = async () => { for (let i = 0; i < 20; i++){ await tick(); game.flush(); } };
  const choose = async act => { sheet.querySelector(`.act[data-act="${act}"]`).click(); await flush(); };
  const answer = async right => {   // answer the question that's open, rightly or wrongly, then Next
    const i = run('__q.answerIdx'), opts = sheet.querySelectorAll('.opt').filter(o => !o.hidden);
    (right ? sheet.querySelector(`.opt[data-i="${i}"]`) : opts.find(o => +o.dataset.i !== i)).click();
    sheet.querySelector('[data-a=next]').click(); await flush();
  };
  return {game, sheet, run, flush, choose, answer};
}

test('you can only fight once the big monkey has given you the stick', () => {
  const g = fighting();
  assert.equal(g.run('canBattle()'), true);
  const without = loadGame({save: {version: 24, started: true, w: knows(['石头', '山'])}});
  assert.equal(without.run('canBattle()'), false);
});

test('your turn: hit, eat (a peach, when you’re hurt) or run; a hit takes one of its hearts; it runs off when they are gone', async () => {
  const g = fighting({hearts: 4, bag: {'桃子': 1}});
  g.run("globalThis.__r = null; battle('snake').then(r => { __r = r; })"); await g.flush();
  assert.deepEqual(g.sheet.querySelectorAll('.act').map(b => b.dataset.act), ['hit', 'eat', 'run']);
  assert.match(g.sheet.textContent, /蛇/, 'the snake’s name on its plate');
  await g.choose('hit'); await g.answer(true);   // a hit
  await g.answer(true);                         // its turn: you dodge
  await g.choose('hit'); await g.answer(true);   // a second hit: it runs off
  assert.match(g.sheet.textContent, /You win!/);
  g.run("document.querySelector('#sheet [data-a=ok]') || 0"); g.sheet.querySelector('[data-a=ok]').click(); await g.flush();
  assert.equal(g.run('__r'), 'won');
  assert.equal(g.run('S.hearts'), 4, 'no hearts lost');
  assert.equal(g.run('S.shells'), 1, 'a shell for chasing it off');
});

test('Run away chosen with the D-pad: A presses it, even when the phone drops the focus (as an iPhone does)', async () => {
  const g = fighting();
  g.run("globalThis.__r = null; battle('snake').then(r => { __r = r; })"); await g.flush();
  assert.equal(g.run('chosenBtn().dataset.act'), 'hit', 'Hit to start with');
  g.run("navFocus('right')");   // from Hit to Run away
  assert.equal(g.sheet.querySelector('.navsel').dataset.act, 'run', 'the gold outline is on Run away');
  g.run("navFocus('right')");
  assert.equal(g.run('chosenBtn().dataset.act'), 'run', 'right again stays on Run away: it doesn’t wrap round to Hit');
  assert.equal(g.run('buttonLabels(0)[0]'), 'Run away', 'and A says so');
  g.run('document.activeElement && document.activeElement.blur()');   // touching the D-pad or A on an iPhone
  assert.equal(g.run('buttonLabels(0)[0]'), 'Run away', 'A still says Run away');
  await g.run('pressA()'); await g.flush();
  assert.equal(g.run('__r'), 'ran', 'A ran away, instead of hitting');
  assert.equal(g.run('modal.hidden'), true);
});

test('a wrong dodge costs a heart, and your hearts stay down after the battle', async () => {
  const g = fighting();
  g.run("battle('snake')"); await g.flush();
  await g.choose('hit'); await g.answer(false);   // a miss
  await g.answer(false);                          // its turn: you don't dodge
  assert.equal(g.run('S.hearts'), 4);
  await g.choose('run');
  assert.equal(g.run('modal.hidden'), true, 'running away ends the battle');
  assert.equal(JSON.parse(g.run('localStorage.getItem(KEY)')).hearts, 4, 'saved');
});

test('eating a peach brings a heart back, on your turn', async () => {
  const g = fighting({hearts: 3, bag: {'桃子': 2}});
  g.run("battle('snake')"); await g.flush();
  assert.match(g.sheet.querySelector('.act[data-act=eat]').textContent, /Eat: 桃子 \(peach\) ×2/);
  await g.choose('eat');
  assert.equal(g.run('S.hearts'), 4);
  assert.equal(g.run("S.bag['桃子']"), 1);
  assert.match(g.sheet.textContent, /a heart comes back/);
});

test('with full hearts, or only an apple, there’s nothing to eat on your turn', async () => {
  for (const save of [{hearts: 5, bag: {'桃子': 2}}, {hearts: 3, bag: {'苹果': 2}}]){
    const g = fighting(save);
    g.run("battle('snake')"); await g.flush();
    assert.deepEqual(g.sheet.querySelectorAll('.act').map(b => b.dataset.act), ['hit', 'run']);
  }
});

test('an apple takes away a wrong answer, when you hit or dodge, without using your turn', async () => {
  const g = fighting({bag: {'苹果': 2}});
  g.run("battle('snake')"); await g.flush();
  await g.choose('hit');
  const shown = () => g.sheet.querySelectorAll('.opt').filter(o => !o.hidden).length;
  const before = shown();
  g.sheet.querySelector('[data-a=eat]').click(); await g.flush();
  assert.equal(shown(), before - 1, 'one answer goes');
  assert.ok(!g.sheet.querySelector(`.opt[data-i="${g.run('__q.answerIdx')}"]`).hidden, 'never the right one');
  assert.equal(g.run("S.bag['苹果']"), 1);
  assert.equal(g.sheet.querySelector('[data-a=eat]'), null, 'one apple a question');
  await g.answer(true);
  assert.ok(g.sheet.querySelector('[data-a=eat]'), 'dodging, you can eat one too');
});

test('the wild boar is a big enemy: you can’t run from it', async () => {
  const g = fighting();
  g.run("battle('boar')"); await g.flush();
  assert.deepEqual(g.sheet.querySelectorAll('.act').map(b => b.dataset.act), ['hit']);
});

test('losing isn’t punished: you rest in the meadow with full hearts', async () => {
  const g = fighting({hearts: 1, pos: {place: 'path', x: 8, y: 13, dir: 'down'}});
  g.run("globalThis.__r = null; battle('snake').then(r => { __r = r; })"); await g.flush();
  await g.choose('hit'); await g.answer(false);
  await g.answer(false);   // the last heart
  assert.match(g.sheet.textContent, /Ouch!/);
  g.sheet.querySelector('[data-a=ok]').click(); await g.flush();
  assert.equal(g.run('__r'), 'lost');
  assert.equal(g.run('S.hearts'), 5);
  assert.equal(g.run('S.pos.place'), 'meadow');
});

test('once you’ve found the cave, losing puts you by a bed in the cave instead', async () => {
  const g = fighting({hearts: 1, areas: {1: {elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 3, story: true, cave: 2}}, pos: {place: 'path', x: 8, y: 13, dir: 'down'}});
  g.run("globalThis.__r = null; battle('snake').then(r => { __r = r; })"); await g.flush();
  await g.choose('hit'); await g.answer(false);
  await g.answer(false);   // the last heart
  assert.match(g.sheet.textContent, /Water Curtain Cave/, 'it says where you go');
  g.sheet.querySelector('[data-a=ok]').click(); await g.flush();
  assert.equal(g.run('__r'), 'lost');
  assert.equal(g.run('S.hearts'), 5);
  assert.deepEqual(JSON.parse(g.run('JSON.stringify(S.pos)')), {place: 'cave', x: 3, y: 2, dir: 'up'}, 'by a bed');
  assert.equal(g.run('PLACE'), 'cave');
});

test('when you’re hurt, the old monkey lets you rest', () => {
  const g = fighting({hearts: 2});
  const part = g.run("JSON.stringify(AREA.talk.elder.find(p => !p.if || matches(p.if)).do.map(s => Object.keys(s)[0]))");
  assert.deepEqual(JSON.parse(part), ['rest', 'message']);
  g.run('STEPS.rest({})');
  assert.equal(g.run('S.hearts'), 5);
});

test('wild creatures jump out of the long grass, now and then, not every step', async () => {
  const g = fighting();
  g.run("globalThis.__fights = 0; wildBattle = async () => { __fights++; return 'ran'; }; Math.random = () => 0");
  const t = 'AREA.legend.n';   // the long grass
  for (let i = 0; i < 10; i++) await g.run(`wildStep(${t})`);
  assert.equal(g.run('__fights'), 2, 'one battle every few steps at most');
  g.run('Math.random = () => .99');
  for (let i = 0; i < 6; i++) await g.run(`wildStep(${t})`);
  assert.equal(g.run('__fights'), 2, 'and only by chance');
});

test('the wild boar blocks the way at the top until you chase it off', () => {
  const at = save => loadGame({save: {version: 24, started: true, ...save}}).run("placeCharacters(); ALL_NPCS.find(n => n.id === 'boar').place");
  assert.equal(at({areas: {1: {gate: true, climb: 1}}}), 'falls');
  assert.equal(at({areas: {1: {gate: true, climb: 1, boar: 1}}}), 'gone', 'chased off');
  assert.equal(at({areas: {1: {gate: true, climb: 3}}}), 'gone', 'a game past the waterfall never meets it');
});

test('the Water Curtain Cave has its own music, slower and echoing; outside, the area’s comes back', () => {
  const g = fighting();
  g.run("enterPlace('cave')");
  assert.equal(g.run('song'), 'cave');
  g.run("enterPlace('falls')");
  assert.equal(g.run('song'), 'home');
  assert.ok(g.run('SONGS.cave.bpm') < g.run('SONGS.home.bpm'), 'slower');
  assert.ok(g.run('SONGS.cave.echo[0]') > g.run('SONGS.home.echo[0]'), 'with a longer echo');
  assert.equal(g.run("SONGS.cave.events.filter(e => e.k === 'mel').reduce((n, e) => n + e.d, 0)"), g.run('SONGS.cave.beats'), 'its tune fills its loop');
  assert.ok(g.run('SONGS.cave.events.filter(e => e.m).every(e => [0, 2, 4, 7, 9].includes(e.m % 12))'), 'only the five notes of the pentatonic scale');
  assert.ok(g.run("Object.values(PLACES).every(p => !p.music || SONGS[p.music])"), 'every place’s music is a song');
});

test('a battle has its own music, quicker but calm; the area’s comes back afterwards', async () => {
  const g = fighting();
  assert.equal(g.run('song'), 'home');
  g.run("battle('snake')"); await g.flush();
  assert.equal(g.run('song'), 'battle');
  await g.choose('run');
  assert.equal(g.run('song'), 'home', 'back to the area’s music');
  assert.ok(g.run('SONGS.battle.bpm') > g.run('SONGS.home.bpm'), 'quicker');
  assert.equal(g.run("SONGS.battle.events.filter(e => e.k === 'mel').reduce((n, e) => n + e.d, 0)"), g.run('SONGS.battle.beats'), 'its tune fills its loop');
  assert.ok(g.run('SONGS.battle.events.filter(e => e.m).every(e => [0, 2, 4, 7, 9].includes(e.m % 12))'), 'only the five notes of the pentatonic scale: nothing tense');
});

test('once the big monkey gives you the stick, your monkey holds it on the map: small, so the staff can replace it later', () => {
  const game = loadGame({save: {version: 28, started: true, w: knows(['石头', '山']), areas: {1: {elder: 2, gate: true, climb: 0}}}});
  const rows = (kind, dir) => game.run(`JSON.stringify(monkeyRows('${kind}', '${dir}', false, 0))`);
  const stickIn = r => JSON.parse(r).filter(row => /[kl]/.test(row)).length;   // how many rows the stick is in
  const dirs = ['down', 'up', 'left', 'right'];
  for (const d of dirs) assert.equal(stickIn(rows('player', d)), 0, `no stick before you have one (facing ${d})`);
  game.run("portrait('player')");
  game.run("S.w['棍子'] = {lv: 1, due: 0, ok: 0}");
  assert.equal(game.run('inHand()'), '棍子', 'the area’s weapon, once you can fight');
  for (const d of dirs){
    const r = JSON.parse(rows('player', d));
    assert.ok(r.every(row => row.length === 16), 'still 16 pixels across');
    assert.ok(stickIn(rows('player', d)) >= 5, `in your hand, facing ${d}`);
    assert.ok(stickIn(rows('player', d)) <= 7, `and small: less than half your height, so a staff can be longer (facing ${d})`);
  }
  game.run("portrait('player')");
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(Object.keys(portraitCache))')), ['player', 'player棍子'], 'your picture in the speech box is drawn again, holding it');
  for (const d of dirs) assert.equal(stickIn(rows('elder', d)), 0, 'only your monkey holds it');
  assert.equal(stickIn(game.run("JSON.stringify(monkeyRows('player', 'up', false, 0, true))")), 0, 'but not in a battle’s scene, which has its own stick to swing, nor meeting an animal');
  assert.match(game.run('fight.toString() + encounter.toString()'), /monkeySprite\('player', 'up', false, 0, true\)[\s\S]*monkeySprite\('player', 'up', false, 0, true\)/, 'the battle and the meeting both draw your monkey with empty hands');
  assert.ok(game.run('HELD[BATTLES.weapon].len') < 16 / 2);
});

test('snakes and spiders jump out of the long grass; the bee moved to chapter 1, and a game that caught it keeps it', async () => {
  const {run, sheet, flush} = fighting({w: {...WORDS, '蜜蜂': {lv: 1, due: 0, ok: 0}}});
  assert.deepEqual(JSON.parse(run('JSON.stringify(AREA.legend.n.wild)')), ['snake', 'spider']);
  assert.ok(!run("'bee' in AREA.enemies"), 'no bees to fight: in chapter 1 you make friends with them');
  assert.ok(run("lvl('蜜蜂')") >= 1 && run("ORDER.includes('蜜蜂')"), 'a bee caught before stays in your words');
  run("globalThis.__card = null; showNotice = async (w, o) => { __card = [w, o && o.note]; setSeen(w); }; battle('spider')");
  await flush();
  assert.deepEqual(JSON.parse(run('JSON.stringify(__card)')), ['蜘蛛', 'A spider scuttles out of the long grass!'], 'its first meeting teaches 蜘蛛');
  assert.match(sheet.textContent, /蜘蛛/, 'then the battle');
});

// Fixed on 21 October 2026, after playing in the pine wood on a phone.
test('a reading question shows the word to read beside the question, above the answers (not under them)', () => {
  const g = fighting({w: {...WORDS, '山': {lv: 2, due: 0, ok: 0}}});
  const q = JSON.parse(g.run("JSON.stringify(wordQuestion('山', '蛇'))"));
  assert.equal(q.type, 'read');
  assert.match(q.body, /^<div class="askrow"><p class="prompt">Read it\. Which picture is it\?<\/p><div class="word"><div class="big">山<\/div><div class="py">shān<\/div><\/div><\/div>/,
    'in the question’s row, as a listening question has its 🔊: the answers come after it');
});

test('a creature that jumps out (or an animal you meet) looks at you, and away from you as it runs off', () => {
  const g = fighting();
  g.run("pl.x = 10; globalThis.__a = {spr: {width: 16, height: 16}, faces: 'left'}");
  assert.equal(g.run('towardsYou(__a, 11) === __a.spr'), true, 'on your right, looking left: at you');
  assert.equal(g.run('towardsYou(__a, 9) === __a.spr'), false, 'on your left, it’s turned round to look at you');
  assert.equal(g.run('towardsYou(__a, 9, true) === __a.spr'), true, 'and running off to the left, it looks where it’s going');
  assert.equal(g.run('towardsYou(__a, 10) === __a.spr'), true, 'above or below you: as it is');
  assert.equal(g.run("towardsYou({spr: __a.spr}, 9) === __a.spr"), true, 'one that looks at you anyway (no faces) is never turned');
  assert.equal(g.run("MAP_SPRITES['狼'].faces"), 'left');
  assert.equal(g.run("MAP_SPRITES['蛇'].faces"), 'right');
});

test('a battle in the pine wood has its own song and its pines behind the creature; anywhere else, the usual', async () => {
  const g = fighting({w: {...WORDS, '狼': {lv: 1, due: 0, ok: 0}}, areas: {1: {elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, chapter: 1, home: 2, build: 1, woodIn: 1}},
    pos: {place: 'pineWood', x: 15, y: 17, dir: 'up'}});
  g.run("placePlayer(); globalThis.__songs = []; playSong = name => __songs.push(name)");
  g.run("battle('wolf')"); await g.flush();
  assert.equal(g.run('__songs[0]'), 'pineBattle', 'the pine wood’s battle song');
  assert.ok(g.sheet.querySelector('.scene').className.split(' ').includes('pines'), 'among the pines');
  const meadow = fighting();
  meadow.run("globalThis.__songs = []; playSong = name => __songs.push(name)");
  meadow.run("battle('snake')"); await meadow.flush();
  assert.equal(meadow.run('__songs[0]'), 'battle');
  assert.ok(!meadow.sheet.querySelector('.scene').className.split(' ').includes('pines'));
});
