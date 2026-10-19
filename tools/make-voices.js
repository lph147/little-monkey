// Makes a voice clip for every piece of Chinese in the game, so every device hears the same voice, even
// offline. Run it with:  npm run voices   (or: node tools/make-voices.js)
// It reads the content: every word in the word bank and every Chinese line, sentence, story and caption in
// the area. Each is said by one of the area's `voices`: `words` says each word on its own, `everyone` the
// lines, and a character with their own voice (the old monkey) their lines. Every voice is made at normal
// speed, with no silence before or after and short pauses between sentences (chosen in the voice tests). Clips go in audio/<voice>/, named by a code made from what they say,
// and content/voices.js lists them for the game. It only makes clips that are missing, and removes ones
// nothing says any more, so run it after changing any Chinese (a test reminds you).
// It needs the Azure key in voice-key.txt (see tools/try-voices.js), which stays on this computer.
// When a native speaker records the game, their recordings replace these files under the same names.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {loadGame, ROOT} = require('../tests/fake-browser');
const {readKey, makeClip, pauseAfter, pause} = require('./try-voices');

const AUDIO = path.join(ROOT, 'audio');
const INDEX = path.join(ROOT, 'content', 'voices.js');

// Words a voice reads wrongly on its own, with the pinyin to give it (tone numbers, a space before each).
const SAY_AS = {
  '只': 'zhi 1',   // the counting word, not zhǐ (only)
};

const CJK = /[一-鿿]/;
const said = zh => zh.replace(/ /g, '');   // content writes sentences with spaces between words; the game says them without
const short = name => name.replace(/^zh-CN-|Neural$/g, '').replace(/^cmn-CN-/, 'google-').toLowerCase();   // zh-CN-YunxiNeural → yunxi, cmn-CN-Wavenet-A → google-wavenet-a
const code = (voice, text) => crypto.createHash('sha1').update(`${voice.name}|${voice.style || ''}|tidy|${text}|${SAY_AS[text] || ''}`).digest('hex').slice(0, 10);
const settings = voice => ({...voice, rate: null, tidy: true});   // as tools/try-voices.js makes them

// What each of the area's voices says: {role: {voice, texts}}, from the content (role: words, everyone or a character's id).
function wanted(){
  const game = loadGame();
  const get = expr => JSON.parse(game.run(`JSON.stringify(${expr})`));
  const AREA = get('AREA'), BANK = get('WORD_BANK');
  const all = new Set();
  for (const w of Object.keys(BANK)) if (BANK[w].phrase) all.add(w + '！');   // your replies (iSay in js/world.js)
  (function walk(o){   // every Chinese string in the area, except English text that mentions a word ({水})
    if (typeof o === 'string'){ if (CJK.test(o) && !/[A-Za-z]/.test(o)) all.add(said(o)); }
    else if (o && typeof o === 'object') for (const k in o) walk(o[k]);
  })(AREA);

  // Who says each line (the game's speaker(s.by || who)): a say step in a character's talk is theirs unless
  // it's `by` someone else; elsewhere (events, things you look at) only `by` says who. Requests are their asker's.
  const sayers = {};   // line key → Set of character ids
  const add = (key, id) => { if (id) (sayers[key] = sayers[key] || new Set()).add(id); };
  (function steps(o, owner){
    if (Array.isArray(o)) return o.forEach(x => steps(x, owner));
    if (!o || typeof o !== 'object') return;
    if (typeof o.say === 'string') add(o.say, o.by || owner);
    for (const k in o) steps(o[k], owner);
  })([AREA.events, AREA.legend], null);
  for (const [id, parts] of Object.entries(AREA.talk)) (function steps(o){
    if (Array.isArray(o)) return o.forEach(steps);
    if (!o || typeof o !== 'object') return;
    if (typeof o.say === 'string') add(o.say, o.by || id);
    for (const k in o) steps(o[k]);
  })(parts);
  for (const r of Object.values(AREA.requests)) for (const k of [r.ask, r.offer, r.thanks, r.wrong, r.wrongAnswer]) if (k) add(k, r.from);
  const words = Object.keys(BANK);   // said on their own, in the words voice; everything else is a line
  const out = {words: {voice: AREA.voices.words, texts: words}, everyone: {voice: AREA.voices.everyone, texts: [...all].filter(t => !BANK[t])}};
  for (const [key, ids] of Object.entries(sayers)) for (const id of ids) if (AREA.voices[id] && !out[id] && AREA.lines[key]) out[id] = {voice: AREA.voices[id], texts: []};
  for (const [key, ids] of Object.entries(sayers)) for (const id of ids) if (out[id] && id !== 'words' && id !== 'everyone' && AREA.lines[key]) out[id].texts.push(said(AREA.lines[key].zh));
  return out;
}

// The list of clips for the game: {voice: {text: code}}, and who uses which voice.
// Each voice's clips are in a folder named after it (audio/yunxi/ and so on).
function plan(){
  const roles = wanted(), clips = {}, voices = {};
  for (const {voice, texts} of Object.values(roles)){
    const v = short(voice.name); voices[v] = voice;
    clips[v] = Object.fromEntries([...new Set([...Object.keys(clips[v] || {}), ...texts])].sort().map(t => [t, code(voice, t)]));
  }
  return {clips, who: Object.fromEntries(Object.entries(roles).map(([role, {voice}]) => [role, short(voice.name)])), voices};
}

const clipPath = (v, c) => path.join(AUDIO, v, c + '.mp3');

function indexText({clips, who}){
  return `// The voice clips: for each voice, what it says and the clip that says it (audio/<voice>/<clip>.mp3).
// Made by tools/make-voices.js: change the Chinese or the area's voices and run  npm run voices , not here.
const VOICE_CLIPS = ${JSON.stringify(clips, null, 1)};
const VOICE_OF = ${JSON.stringify(who)};   // which voice says what: words on their own, everyone's lines, and characters with their own
`;
}

async function main(){
  const azure = readKey();
  const p = plan(), google = Object.values(p.voices).some(v => v.provider === 'google');
  if (!azure.key || (google && !azure.google)){ console.log(`A key is missing: paste ${!azure.key ? 'KEY 1 from the Azure portal after "key="' : 'the API key from Google Cloud after "google="'} in voice-key.txt, then run this again.`); process.exitCode = 1; return; }
  const todo = Object.entries(p.clips).flatMap(([v, texts]) => Object.entries(texts).filter(([, c]) => !fs.existsSync(clipPath(v, c))).map(([t, c]) => [v, t, c]));
  console.log(todo.length ? `Making ${todo.length} clips (slowly: the free tier allows about 20 a minute, so about ${Math.ceil(todo.length * 3.3 / 60)} minutes)…` : 'Every clip is already made.');
  let n = 0;
  for (const [v, text, c] of todo){
    try {
      const audio = await makeClip(azure, settings(p.voices[v]), {zh: text, ph: SAY_AS[text]});
      fs.mkdirSync(path.join(AUDIO, v), {recursive: true});
      fs.writeFileSync(clipPath(v, c), audio);
      console.log(`  ${++n}/${todo.length} ${v}: ${text}`);
    } catch(e) {
      console.log(`  ${v}: ${text}: ${e.message}`);
      process.exitCode = 1; break;
    }
    await pause(pauseAfter(p.voices[v]));
  }
  // Clips nothing says any more, and voices nobody uses
  if (fs.existsSync(AUDIO)) for (const v of fs.readdirSync(AUDIO)){
    const keep = new Set(Object.values(p.clips[v] || {}).map(c => c + '.mp3'));
    for (const f of fs.readdirSync(path.join(AUDIO, v))) if (!keep.has(f)){ fs.unlinkSync(path.join(AUDIO, v, f)); console.log(`  removed ${v}/${f}`); }
    if (!fs.readdirSync(path.join(AUDIO, v)).length) fs.rmdirSync(path.join(AUDIO, v));
  }
  if (process.exitCode) { console.log('Stopped: run it again to carry on (it keeps what it made).'); return; }
  fs.writeFileSync(INDEX, indexText(p));
  console.log(`Wrote content/voices.js: ${Object.values(p.clips).reduce((s, c) => s + Object.keys(c).length, 0)} clips.`);
}

module.exports = {plan, indexText, clipPath, INDEX, SAY_AS};
if (require.main === module) main();
