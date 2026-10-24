// When a conversation ends, you can tell, and one more A doesn't start it all again (decided 22 October 2026: you
// couldn't tell, and pressing A to clear the message that came up where the speech box had been talked to the same
// character again, from the start). Its last line says Done; a message that has come up since you last moved or turned
// is closed by A; and what you've just finished with rests until you turn, take a step or 2 seconds go by, unless who
// you're facing has something new for you (a ! or ? over them, and not what they've just said).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const tick = () => new Promise(r => setImmediate(r));
const knowing = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
function game(area, pos, words = ['石头', '你好', '山']){
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(words), areas: {1: area}, pos}});
  g.run("mode = 'play'; placePlayer(); globalThis.__now = 5000; performance.now = () => __now");   // (the pretend browser's clock, which the test moves on)
  g.run('for (const t of getTasks()) S.tasksSeen[t.id] = 1');   // (no new task waiting to be announced once a message closes)
  return g;
}
const OLD_MONKEY = {place: 'meadow', x: 7, y: 2, dir: 'up'}, HUNGRY_MONKEY = {place: 'meadow', x: 13, y: 6, dir: 'up'};
const label = g => { g.run('updateCtx(performance.now())'); return [g.el('#aLabel').textContent, g.el('#bLabel').textContent]; };

// Presses A through whatever is showing (lines, cards) until it's over, as a player does.
async function through(g){
  for (let i = 0; i < 40; i++){
    await tick();
    if (g.run('!!talkNext || !modal.hidden')) g.run('pressA()');
    else if (!g.run('busy')) return;
  }
  throw new Error('it never ended');
}

test('pressing A to clear the message after a conversation closes it, and doesn’t start the conversation again', async () => {
  const g = game({elder: 2}, HUNGRY_MONKEY);
  g.run('pressA()');   // the hungry monkey asks for fruit, and teaches 水果
  await through(g);
  assert.equal(g.el('#saybox').hidden, false, 'a message has come up where the speech box was');
  assert.deepEqual(label(g), ['OK', 'Close'], 'A says OK');
  g.run('pressA()'); await tick();
  assert.equal(g.el('#saybox').hidden, true, 'A closes it');
  assert.ok(!g.run('!!talkNext || !modal.hidden || busy'), 'and nothing starts again');
});

test('the last line of a conversation says Done, not ▼ Next, so you can tell it’s ending', async () => {
  const g = game({elder: 1}, OLD_MONKEY);   // two words of four: he says to go and learn some more
  g.run("pressA()"); await tick();
  assert.equal(g.el('#talk').querySelector('[data-a=ok]').textContent, '▼', 'his line: what to do comes after it');
  g.run("pressA()"); await tick();
  assert.ok(g.el('#talk').querySelector('.talknote'), 'what to do, the last thing in the conversation');
  const b = g.el('#talk').querySelector('[data-a=ok]');
  assert.equal(b.textContent, 'Done');
  assert.equal(b.dataset.label, 'Done');
  assert.deepEqual(label(g), ['Done', ''], 'A says Done');
});

test('Done is only on the last line: a line with anything after it to press A for has ▼ Next; when unsure, ▼', async () => {
  const g = game({elder: 1}, OLD_MONKEY);
  g.run("globalThis.__cards = []; showNotice = async w => { __cards.push(w); setSeen(w); }; chooseReply = async choices => choices[0]");
  const buttons = async steps => {   // the button on each line of a conversation with these steps, pressing A on each
    g.run(`AREA.talk.elder = [{do:${JSON.stringify(steps)}}]; globalThis.__over = false; talk(ALL_NPCS.find(n => n.id === 'elder')).then(() => { __over = true; })`);
    const seen = [];
    for (let i = 0; i < 20 && !g.run('__over'); i++){
      await tick();
      if (!g.run('!!talkNext')) continue;
      seen.push(g.el('#talk').querySelector('[data-a=ok]').textContent);
      g.run('talkNext()');
    }
    return seen;
  };
  assert.deepEqual(await buttons([{say: 'hi'}, {say: 'go'}, {set: {elder: 1}}]), ['▼', 'Done'], 'the story changing after it shows nothing');
  assert.deepEqual(await buttons([{say: 'hi'}, {message: 'Off you go!'}]), ['▼', 'Done'], 'a line of the story, last');
  assert.deepEqual(await buttons([{say: 'hi'}, {reply: '你好'}]), ['▼', 'Done'], 'your reply, last');
  assert.deepEqual(await buttons([{say: 'hi'}, {newWord: '石头'}]), ['Done'], 'a word you know isn’t taught again: nothing after it');
  assert.deepEqual(await buttons([{say: 'hi'}, {newWord: '花'}]), ['▼'], 'a new word’s card after it');
  assert.deepEqual(JSON.parse(g.run('JSON.stringify(__cards)')), ['花']);
  assert.deepEqual(await buttons([{say: 'hi'}, {say: 'go', if: {elder: 5}}]), ['Done'], 'a step whose if doesn’t match');
  assert.deepEqual(await buttons([{say: 'hi'}, {set: {elder: 5}}, {say: 'go', if: {elder: 5}}]), ['▼', 'Done'], 'unless the story changes before it: then it might');
});

test('a monkey asking again for what it wants: Done, unless it teaches a word after', async () => {
  const lines = async words => {
    const g = game({elder: 2, hungry: 'asked'}, HUNGRY_MONKEY, words);
    g.run("globalThis.__over = false; request(REQUESTS.find(r => r.id === 'hungry'), speaker('hungry'), true).then(() => { __over = true; })");
    const seen = [];
    for (let i = 0; i < 20 && !g.run('__over'); i++){
      await tick();
      if (g.run('!!talkNext')){ seen.push(g.el('#talk').querySelector('[data-a=ok]').textContent); g.run('talkNext()'); }
      else if (!g.run('modal.hidden')){ seen.push('card'); g.run('pressA()'); }
    }
    return seen;
  };
  assert.deepEqual(await lines(['石头', '你好', '水果']), ['Done']);
  assert.deepEqual(await lines(['石头', '你好']), ['▼', 'card', 'card', 'card'], '水果 is new: its card comes after, and how it’s made (A once to see it come together at once)');
});

test('a message that came up since you last moved or turned: A closes it (not if pressed just as it came up), and B still does', async () => {
  const g = game({elder: 2}, HUNGRY_MONKEY);
  g.run("globalThis.__talks = 0; talk = async () => { __talks++; }");
  g.run("toast('New task: Find some fruit for the hungry monkey')");
  assert.deepEqual(label(g), ['OK', 'Close']);
  g.run('__now = 5100'); g.run('pressA(5100)'); await tick();
  assert.equal(g.el('#saybox').hidden, false, 'pressed just as it came up: it stays, to be read');
  g.run('__now = 5500'); g.run('pressA(5500)'); await tick();
  assert.equal(g.el('#saybox').hidden, true, 'a moment later, A closes it');
  assert.equal(g.run('__talks'), 0, 'without talking to the hungry monkey');
  g.run("toast('New task: Find some fruit for the hungry monkey')"); g.run('pressB()');
  assert.equal(g.el('#saybox').hidden, true, 'B closes it too');
  g.run("__now = 9000; toast('You picked a flower.'); __now = 9500; tryStep('left', 9500); tryStep('up', 9600)");   // you turn away, and back
  assert.equal(label(g)[0], 'Talk', 'once you’ve moved on, A is as ever');
  g.run('pressA()'); await tick();
  assert.equal(g.run('__talks'), 1);
});

test('what you’ve just finished with rests: A there does nothing, with its label blank, until you turn, take a step or 2 seconds go by', async () => {
  const g = game({elder: 2}, OLD_MONKEY);
  g.run("globalThis.__talks = 0; talk = async () => { __talks++; }");
  assert.equal(label(g)[0], 'Talk');
  g.run('pressA()'); await tick();
  assert.equal(g.run('__talks'), 1, 'A talks to him');
  assert.equal(label(g)[0], '', 'then A’s label is blank');
  g.run('__now = 6500'); g.run('pressA()'); await tick();
  assert.equal(g.run('__talks'), 1, 'and A does nothing, a second and a half later');
  assert.ok(!g.run('justFinished(8, 2)'), 'anything else is as ever');
  g.run('__now = 7100');
  assert.equal(label(g)[0], 'Talk', 'after 2 seconds, it’s back');
  g.run('pressA()'); await tick();
  assert.equal(g.run('__talks'), 2);
  g.run("__now = 7300; tryStep('left', 7300); tryStep('up', 7400)");   // turned away, and back
  g.run('pressA()'); await tick();
  assert.equal(g.run('__talks'), 3, 'turning away and back, at once');
  g.run("arrive = async () => { __now += 3000; shown(); }");   // a step that shows you something (such as someone who stops you, to talk)
  g.run('pl.mv = {fx:7, fy:3, tx:7, ty:2, t0:__now - 1000}; update(__now)'); await tick();
  assert.ok(g.run('justFinished(7, 1)'), 'what you face when it ends rests, too');
  g.run('pressA()'); await tick();
  assert.equal(g.run('__talks'), 3);
});

test('closing a message with A, what you face rests too, so a second A doesn’t start a conversation, unless they have something new for you', async () => {
  const second = pos => {
    const g = game({elder: 2}, pos);
    g.run("globalThis.__talks = 0; talk = async () => { __talks++; }");
    g.run("__now = 9000; toast('New task: Find some fruit for the hungry monkey'); __now = 12000");   // (read for a while)
    g.run('pressA()');
    return tick().then(() => { g.run('__now = 12400'); g.run('pressA()'); return tick(); }).then(() => g.run('__talks'));
  };
  assert.equal(await second(OLD_MONKEY), 0, 'the old monkey has nothing new: no conversation');
  assert.equal(await second(HUNGRY_MONKEY), 1, 'the hungry monkey has a !, something to ask you: A talks to him');
});

test('someone with something new for you, a ! or ? over them, and not what they’ve just said, talks at once (decided 23 October 2026: the old monkey taught 家 and went straight on to counting the troop in, but A did nothing)', async () => {
  const g = game({elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 4}, {place: 'cave', x: 6, y: 10, dir: 'up'},
    ['石头', '你好', '山', '瀑布', '洞', '床', '碗', '桌子', '跳']);
  g.run('pressA()'); await through(g);
  assert.equal(g.run('here().cave'), 5, 'he teaches 家');
  for (let i = 0; i < 5 && g.run('newMessage()'); i++){ g.run('__now += 600'); g.run('pressA()'); await tick(); }   // (closing what comes up)
  assert.ok(!g.run('justFinished(6, 9)'), 'with a ! and more to say, he doesn’t rest');
  assert.equal(label(g)[0], 'Talk');
  g.run('pressA()'); await through(g);
  assert.equal(g.run('here().count'), 1, 'A goes straight on: a monkey comes in, and you count it');
});

test('but someone who would say again what they’ve just said rests, even with a ! over them: such as after Not now', async () => {
  const g = game({elder: 1}, OLD_MONKEY, ['石头', '你好', '山', '树', '花', '草']);
  g.run('matchWords = async () => null');   // (Not now, when he checks your words)
  assert.equal(g.run("(AREA.bubbles.elder.find(b => matches(b.if)) || {}).show"), '!');
  g.run('pressA()'); await through(g);
  for (let i = 0; i < 5 && g.run('newMessage()'); i++){ g.run('__now += 600'); g.run('pressA()'); await tick(); }
  assert.ok(g.run('justFinished(7, 1)'), 'his check would start all over again: he rests');
  assert.equal(label(g)[0], '');
});
