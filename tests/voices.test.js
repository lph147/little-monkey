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
  assert.deepEqual(readKey(file), {key:'', region:'eastus', google:''});
  fs.writeFileSync(file, 'key= abc123 \nregion=\n');
  assert.deepEqual(readKey(file), {key:'abc123', region:'eastus', google:''});
});

test('every voice clip is made and listed (run npm run voices after changing any Chinese)', () => {
  const {plan, indexText, clipPath, INDEX} = require('../tools/make-voices');
  const p = plan();
  assert.ok(fs.existsSync(INDEX) && fs.readFileSync(INDEX, 'utf8') === indexText(p), 'content/voices.js is out of date: run npm run voices');
  const missing = Object.entries(p.clips).flatMap(([v, texts]) => Object.entries(texts).filter(([, c]) => !fs.existsSync(clipPath(v, c))).map(([t]) => `${v}: ${t}`));
  assert.deepEqual(missing, [], 'these clips are missing: run npm run voices');
});

test('words on their own have their own voice, the old monkey his for his lines, and everyone else the main one', () => {
  const {plan} = require('../tools/make-voices');
  const p = plan();
  assert.deepEqual(p.who, {words:'google-standard-a', everyone:'yunxi', elder:'yunze'});
  assert.ok(p.clips.yunze['我是老猴子。这是花果山。'], 'the old monkey says who he is in his own voice');
  assert.ok(!p.clips.yunze['我怕！'], 'the little monkey’s line isn’t in the old monkey’s voice');
  assert.ok(p.clips['google-standard-a']['猴子'] && p.clips['google-standard-a']['你好'], 'words (and phrases) on their own are in the words voice');
  assert.ok(p.clips.yunxi['你好！'] && !p.clips.yunxi['猴子'], 'lines, such as your reply, are in the main voice, and words aren’t');
  assert.ok(!p.clips['google-standard-a']['我怕！'], 'lines aren’t in the words voice');
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

test('the game says Chinese with its clips: words in the words voice, the old monkey in his own, other lines in the main one', async () => {
  const game = withClips();
  const clip = (text, who) => game.run(`clipFor(${JSON.stringify(text)}, ${JSON.stringify(who)})`);
  assert.match(clip('我是老猴子。这是花果山。', 'elder'), /^audio\/yunze\/\w+\.mp3$/);
  assert.match(clip('猴子', 'elder'), /^audio\/google-standard-a\//, 'a word on its own is in the words voice, whoever you’re with');
  assert.match(clip('猴子'), /^audio\/google-standard-a\//);
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

test('Google’s voices: the key is read from its own line, and a clip asks for the words in that voice', () => {
  const {readKey, googleRequest, pauseAfter} = require('../tools/try-voices');
  const os = require('os');
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'voices-')), 'voice-key.txt');
  fs.writeFileSync(file, 'key=azure123\nregion=eastus\n# a note\ngoogle=goog456\n');
  assert.deepEqual(readKey(file), {key:'azure123', region:'eastus', google:'goog456'});
  const voice = {provider:'google', name:'cmn-CN-Wavenet-A'};
  assert.deepEqual(googleRequest(voice, {zh:'水'}), {input:{text:'水'}, voice:{languageCode:'cmn-CN', name:'cmn-CN-Wavenet-A'}, audioConfig:{audioEncoding:'MP3', sampleRateHertz:24000}});
  assert.equal(googleRequest({...voice, speed:0.9}, {zh:'水'}).audioConfig.speakingRate, 0.9);
  assert.deepEqual(googleRequest(voice, {zh:'只', ph:'zhi 1'}).input, {text:'只', customPronunciations:{pronunciations:[
    {phrase:'只', phoneticEncoding:'PHONETIC_ENCODING_PINYIN', pronunciation:'zhi1'}]}}, 'the pinyin goes too, as Google writes it');
  assert.ok(pauseAfter(voice) < pauseAfter({name:'zh-CN-XiaoxiaoNeural'}), 'Azure’s free tier needs a longer pause between clips');
});

// Pinyin with tone numbers (zhi 1, ba 5) as the word bank writes it, with tone marks (zhī, ba)
const MARKS = {a:'āáǎà', e:'ēéěè', i:'īíǐì', o:'ōóǒò', u:'ūúǔù', ü:'ǖǘǚǜ'};
const marked = ph => [...ph.matchAll(/([a-zü]+) (\d)/g)].map(([, s, t]) => {
  if (t === '5') return s;   // a light syllable has no mark
  const v = /[ae]/.exec(s) || /o(?=u)/.exec(s) || [...s.matchAll(/[aeiouü]/g)].pop();
  return s.slice(0, v.index) + MARKS[v[0]][t - 1] + s.slice(v.index + 1);
}).join('');

test('a word the voice reads wrongly on its own has its pinyin, as the word bank says it (只 zhī, not zhǐ; 吧 ba, not bā)', () => {
  const {SAY_AS} = require('../tools/make-voices');
  const {loadGame} = require('./fake-browser');
  const bank = JSON.parse(loadGame().run('JSON.stringify(WORD_BANK)'));
  assert.ok(SAY_AS['只'] && SAY_AS['吧'], 'Google’s voice said 只 as zhǐ and 吧 as bā');
  for (const [w, as] of Object.entries(SAY_AS)){
    assert.ok(bank[w], `${w} isn't in the word bank`);
    assert.equal(marked(as.ph), bank[w].py.replace(/ /g, ''), `${w}'s pinyin, ${as.ph}, should say what the word bank does`);
    assert.ok(as.google || as.by, `${w} needs a way to be said right if Google takes no notice of its pinyin`);
  }
});

test('Google’s voice is given the pinyin; if it takes no notice, it says a word that sounds the same, or another voice says it', async () => {
  const {sayRight} = require('../tools/make-voices');
  const google = {provider:'google', name:'cmn-CN-Standard-A'}, quiet = () => {}, made = [];
  const said = (voice, item) => Buffer.from(`${voice.name} ${item.zh}${item.ph ? ' ' + item.ph : ''}`);
  const deaf = async (keys, voice, item) => { made.push([voice.name, item.zh, item.ph]); return said(voice, {zh: item.zh}); };   // (the pinyin changes nothing)
  assert.equal(String(await sayRight(deaf, {}, google, '只', quiet)), 'cmn-CN-Standard-A 知', 'Google says 知 (zhī), which sounds the same');
  assert.equal(String(await sayRight(deaf, {}, google, '吧', quiet)), 'zh-CN-XiaoxiaoNeural 吧', 'Azure’s Xiaoxiao says 吧');
  assert.deepEqual(made.at(-1), ['zh-CN-XiaoxiaoNeural', '吧', 'ba 5'], 'with its pinyin');
  const hears = async (keys, voice, item) => said(voice, item);
  assert.equal(String(await sayRight(hears, {}, google, '吧', quiet)), 'cmn-CN-Standard-A 吧 ba 5', 'if Google takes the pinyin, its own voice says it');
  const refuses = async (keys, voice, item) => { if (item.ph && voice.provider === 'google') throw new Error('400'); return said(voice, item); };
  assert.equal(String(await sayRight(refuses, {}, google, '只', quiet)), 'cmn-CN-Standard-A 知', 'or if Google won’t take it');
  let n = 0;
  const neverTheSame = async (keys, voice, item) => Buffer.from(`${voice.name} ${item.zh} ${n++}`);
  assert.match(String(await sayRight(neverTheSame, {}, google, '只', quiet)), /知/, 'if Google never sends the same clip twice, it can’t tell, so 知 it is');
  assert.equal(String(await sayRight(hears, {}, {name:'zh-CN-YunxiNeural'}, '只', quiet)), 'zh-CN-YunxiNeural 只 zhi 1', 'Azure’s voices take the pinyin');
  assert.equal(String(await sayRight(hears, {}, google, '山', quiet)), 'cmn-CN-Standard-A 山', 'other words are just said');
});

test('keys can come from GitHub’s secrets, and a Google voice it doesn’t have is swapped for one like it', async () => {
  const {readKey, checkGoogleNames} = require('../tools/try-voices');
  assert.deepEqual(readKey(path.join(__dirname, 'no-such-file.txt'), {GOOGLE_TTS_KEY:'g', AZURE_TTS_KEY:'a'}), {key:'a', region:'eastus', google:'g'});
  assert.equal(readKey(path.join(__dirname, 'no-such-file.txt'), {AZURE_TTS_KEY:'a', AZURE_TTS_REGION:'uksouth'}).region, 'uksouth', 'GitHub can be told the key’s region');
  const real = global.fetch;
  global.fetch = async () => ({ok:true, json: async () => ({voices:[
    {name:'cmn-CN-Wavenet-A', ssmlGender:'FEMALE'}, {name:'cmn-CN-Wavenet-B', ssmlGender:'MALE'}, {name:'cmn-CN-Wavenet-D', ssmlGender:'FEMALE'}]})});
  try {
    const voices = [{provider:'google', name:'cmn-CN-Wavenet-A', about:'one'}, {provider:'google', name:'cmn-CN-Wavenet-Z', about:'two'}];
    await checkGoogleNames('key', voices);
    assert.equal(voices[0].name, 'cmn-CN-Wavenet-A', 'a voice Google has stays');
    assert.equal(voices[1].name, 'cmn-CN-Wavenet-D', 'a missing one becomes another woman’s voice of the same kind, not one already used');
    assert.match(voices[1].about, /Wavenet-D/, 'and says so');
  } finally { global.fetch = real; }
});

test('the GitHub job uses the secrets, and only saves clips on its own branch', () => {
  const job = fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', 'voices.yml'), 'utf8');
  assert.match(job, /GOOGLE_TTS_KEY: \$\{\{ secrets\.GOOGLE_TTS_KEY \}\}/);
  assert.match(job, /branches: \[voices\]/, 'it runs for the voices branch, never main');
  const push = job.split('\n').filter(l => l.includes('git push'));
  assert.deepEqual(push.map(l => l.trim()), ['git push origin HEAD:${{ github.ref_name }}'], 'it pushes back to its own branch, never to main (the live site)');
});

test('a clip plays just its speech, without the silence around it', async () => {
  const game = withClips();
  // a pretend clip: 0.2 seconds of silence, half a second of sound, then 0.3 seconds of silence (at 1000 samples a second)
  const span = JSON.parse(game.run(`JSON.stringify(speechSpan({sampleRate: 1000, getChannelData: () => Float32Array.from({length: 1000}, (_, i) => i >= 200 && i < 700 ? 0.5 * Math.sin(i) + 0.3 : 0)}))`));
  assert.ok(Math.abs(span[0] - 0.16) < 0.01, 'it starts just before the sound');
  assert.ok(Math.abs(span[0] + span[1] - 0.74) < 0.01, 'and stops just after it');
});
