// The voice test (tools/try-voices.js): the Azure key never goes to GitHub, and the test lines
// are the game's own words.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {ITEMS, VOICES, ssml} = require('../tools/try-voices');

test('the key file is kept off GitHub', () => {
  const ignored = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8').split(/\r?\n/).map(l => l.trim());
  assert.ok(ignored.includes('voice-key.txt'), '.gitignore must list voice-key.txt, so the Azure key is never uploaded');
});

test('the voice test has a clip name and some speech for every voice and item', () => {
  assert.equal(new Set(ITEMS.map(i => i.id)).size, ITEMS.length, 'each item needs its own id');
  for (const v of VOICES) for (const id of v.only || []) assert.ok(ITEMS.some(i => i.id === id), `${v.label} is for ${id}, which isn't an item`);
  for (const v of VOICES) for (const i of ITEMS) assert.match(ssml(v, i), new RegExp(i.zh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('an empty key line reads as no key, not as the region on the next line', () => {
  const {readKey} = require('../tools/try-voices');
  const os = require('os');
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'voices-')), 'voice-key.txt');
  fs.writeFileSync(file, '# a note\r\nkey=\r\nregion=eastus\r\n');
  assert.deepEqual(readKey(file), {key:'', region:'eastus'});
  fs.writeFileSync(file, 'key= abc123 \nregion=\n');
  assert.deepEqual(readKey(file), {key:'abc123', region:'eastus'});
});

test('every voice clip is made and listed (run npm run voices after changing any Chinese)', () => {
  const {plan, indexText, clipPath, INDEX} = require('../tools/make-voices');
  const p = plan();
  assert.ok(fs.existsSync(INDEX) && fs.readFileSync(INDEX, 'utf8') === indexText(p), 'content/voices.js is out of date: run npm run voices');
  const missing = Object.entries(p.clips).flatMap(([v, texts]) => Object.entries(texts).filter(([, c]) => !fs.existsSync(clipPath(v, c))).map(([t]) => `${v}: ${t}`));
  assert.deepEqual(missing, [], 'these clips are missing: run npm run voices');
});

test('the old monkey has his own voice for his lines, and everyone else the main one', () => {
  const {plan} = require('../tools/make-voices');
  const p = plan();
  assert.deepEqual(p.who, {everyone:'yunxi', elder:'yunze'});
  assert.ok(p.clips.yunze['我是老猴子。这是花果山。'], 'the old monkey says who he is in his own voice');
  assert.ok(!p.clips.yunze['我怕！'], 'the little monkey’s line isn’t in the old monkey’s voice');
  assert.ok(p.clips.yunxi['猴子'] && p.clips.yunxi['你好！'], 'words and lines are in the main voice');
});

// The game with pretend sound: an AudioContext whose clips "play" (recorded in __played), clip files that load
// unless they're in __offline, and a device voice that records what it says (__spoken).
function withClips(){
  const {loadGame} = require('./fake-browser');
  const game = loadGame();
  game.run(`globalThis.__played = []; globalThis.__spoken = []; globalThis.__offline = false;
    globalThis.fetch = url => __offline ? Promise.reject(new Error('offline')) : Promise.resolve({ok: true, arrayBuffer: () => Promise.resolve(url)});
    window.AudioContext = class { constructor(){ this.state = 'running'; this.destination = {}; }
      decodeAudioData(data, ok){ ok({url: data}); }
      createBufferSource(){ const s = {connect(){}, start(){ __played.push(s.buffer.url); setTimeout(() => s.onended && s.onended(), 0); }, stop(){}}; return s; } };
    AC = null;
    globalThis.SpeechSynthesisUtterance = function(t){ this.text = t; };
    globalThis.speechSynthesis = {speaking: false, pending: false, getVoices: () => [{lang: 'zh-CN'}], cancel(){}, speak(u){ __spoken.push(u.text); setTimeout(() => u.onend && u.onend(), 0); }};`);
  return game;
}
const settle = game => new Promise(r => setImmediate(r)).then(() => { game.flush(); return new Promise(r => setImmediate(r)); }).then(() => game.flush());

test('the game says Chinese with its clips: the old monkey in his own voice, everyone else in the main one', async () => {
  const game = withClips();
  const clip = (text, who) => game.run(`clipFor(${JSON.stringify(text)}, ${JSON.stringify(who)})`);
  assert.match(clip('我是老猴子。这是花果山。', 'elder'), /^audio\/yunze\/\w+\.mp3$/);
  assert.match(clip('猴子', 'elder'), /^audio\/yunxi\//, 'a word he has no clip for is in the main voice');
  assert.match(clip('我是老猴子。这是花果山。', 'playful'), /^audio\/yunxi\//);
  assert.equal(clip('不在游戏里', 'elder'), null);
  game.run(`say('猴子')`); await settle(game);
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(__played)')), [clip('猴子')]);
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(__spoken)')), [], 'not the device voice');
});

test('without a clip, or offline before a clip was kept, the device voice says it', async () => {
  const game = withClips();
  game.run(`say('不在游戏里')`); await settle(game);
  game.run(`__offline = true; say('山')`); await settle(game);
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(__spoken)')), ['不在游戏里', '山']);
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(__played)')), []);
});

test('a line in the speech box is said in its speaker’s voice', () => {
  const game = withClips();
  game.run(`globalThis.__who = []; (() => { const s = say; say = (t, e, who) => { __who.push(who); return s(t, e, who); }; })();
    showDialog(speaker('elder'), {t: ['你好', '！'], en: 'Hello!'})`);
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(__who)')), ['elder']);
});

test('with the clips, the title screen doesn’t warn about a missing Chinese voice', () => {
  const game = withClips();
  game.run(`globalThis.speechSynthesis = undefined; delete globalThis.speechSynthesis; titleText()`);
  assert.doesNotMatch(game.el('#titleText').innerHTML, /class="small warn"/);
});
