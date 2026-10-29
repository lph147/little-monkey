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

// Words a voice reads wrongly on its own: ph, the pinyin to give it (tone numbers, a space before each). Azure's voices
// take it; Google's are given it too, but if a clip comes out just as it does without it (Google's custom pronunciations
// are for English so far), google is a word that sounds the same for it to say instead, or by another voice, which takes
// the pinyin, says the word (decided 22 October 2026: Google's voice said 只 as zhǐ and 吧 as bā).
const SAY_AS = {
  '只': {ph:'zhi 1', google:'知'},   // the counting word, zhī, not zhǐ (only): 知 (to know) sounds just the same
  '吧': {ph:'ba 5', by:{name:'zh-CN-XiaoxiaoNeural'}},   // light, not bā (as in 酒吧, a bar): Azure's Xiaoxiao, a woman's voice
};

const CJK = /[一-鿿]/;
const said = zh => zh.replace(/ /g, '');   // content writes sentences with spaces between words; the game says them without
const short = name => name.replace(/^zh-CN-|Neural$/g, '').replace(/^cmn-CN-/, 'google-').toLowerCase();   // zh-CN-YunxiNeural → yunxi, cmn-CN-Wavenet-A → google-wavenet-a
const code = (voice, text) => crypto.createHash('sha1').update(`${voice.name}|${voice.style || ''}|tidy|${text}|${SAY_AS[text] ? JSON.stringify(SAY_AS[text]) : ''}`).digest('hex').slice(0, 10);
const settings = voice => ({...voice, rate: null, tidy: true});   // as tools/try-voices.js makes them

// What each of the area's voices says: {role: {voice, texts}}, from the content (role: words, everyone or a character's id).
function wanted(){
  const game = loadGame();
  const get = expr => JSON.parse(game.run(`JSON.stringify(${expr})`));
  const AREA = get('AREA'), BANK = get('WORD_BANK');
  const all = new Set();
  for (const w of Object.keys(BANK)) if (BANK[w].phrase) all.add(w + '！');   // your replies (iSay in js/world.js)
  (function walk(o){   // every Chinese string in the area, except English text that mentions a word ({水}), and the parts
    // shown in how a name is made (made) or in a tip's example, which nothing says
    if (typeof o === 'string'){ if (CJK.test(o) && !/[A-Za-z]/.test(o)) all.add(said(o)); }
    else if (o && typeof o === 'object') for (const k in o) if (k !== 'made' && k !== 'example') walk(o[k]);
  })(AREA);
  for (const c of get('COLOURED()')) all.add(said(c.zh));   // and what each thing of one colour is called, such as 粉色的花 (js/world.js)
  for (const c of get('COLOUR_SENTENCES()')) all.add(said(c.zh));   // and sentences with a colour in them, such as 我要蓝色的头带 at the shop (js/world.js)

  // Who says each line (the game's speaker(s.by || who)): a say step in a character's talk is theirs unless
  // it's `by` someone else; elsewhere (events, things you look at) only `by` says who. Requests are their asker's.
  const sayers = {};   // line key → Set of character ids
  const add = (key, id) => { if (id) (sayers[key] = sayers[key] || new Set()).add(id); };
  (function steps(o, owner){
    if (Array.isArray(o)) return o.forEach(x => steps(x, owner));
    if (!o || typeof o !== 'object') return;
    if (typeof o.say === 'string') add(o.say, o.by || owner);
    for (const k in o) steps(o[k], owner);
  })([AREA.events, AREA.legend, ...Object.values(AREA.places).map(p => p.legend || {})], null);
  for (const [id, parts] of Object.entries(AREA.talk)) (function steps(o){
    if (Array.isArray(o)) return o.forEach(steps);
    if (!o || typeof o !== 'object') return;
    if (typeof o.say === 'string') add(o.say, o.by || id);
    for (const k in o) steps(o[k]);
  })(parts);
  for (const r of Object.values(AREA.requests)) for (const k of [r.ask, r.offer, r.thanks, r.wrong, r.wrongAnswer]) if (k) add(k, r.from);
  for (const l of AREA.lessons || []) for (const k of [...Object.values(l.teach || {}), ...(l.things || []).map(t => t.ask), ...[l.race, l.jog].filter(Boolean).flatMap(x => [x.start, x.end])]) add(k, l.by);   // the teacher's, in a lesson
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

// A clip of text in a voice, said right if it's in SAY_AS (make: makeClip, or a pretend one in the tests). Google's voice
// is given the pinyin, and it's checked: if the clip comes out just the same as without it (made twice, in case Google
// never sends the same clip twice), Google took no notice, so it says the word that sounds the same, or the other voice
// says the word. Says which it did.
async function sayRight(make, keys, voice, text, log = console.log){
  const as = SAY_AS[text];
  if (!as) return make(keys, voice, {zh: text});
  if (voice.provider !== 'google') return make(keys, voice, {zh: text, ph: as.ph});
  const plain = await make(keys, voice, {zh: text}), again = await make(keys, voice, {zh: text});
  const given = await make(keys, voice, {zh: text, ph: as.ph}).catch(e => { log(`    ${text}: Google won’t take the pinyin (${e.message})`); return null; });
  if (given && plain.equals(again) && !given.equals(plain)){ log(`    ${text}: Google took the pinyin, ${as.ph}`); return given; }
  if (as.google){ log(`    ${text}: Google takes no notice of the pinyin, so it says ${as.google}, which sounds the same`); return make(keys, voice, {zh: as.google}); }
  if (as.by){ log(`    ${text}: Google takes no notice of the pinyin, so ${as.by.name} says it, with the pinyin`); return make(keys, settings(as.by), {zh: text, ph: as.ph}); }
  throw new Error(`Google takes no notice of the pinyin for ${text}: give it a word that sounds the same (google) or another voice (by) in SAY_AS`);
}

function indexText({clips, who}){
  return `// The voice clips: for each voice, what it says and the clip that says it (audio/<voice>/<clip>.mp3).
// Made by tools/make-voices.js: change the Chinese or the area's voices and run  npm run voices , not here.
const VOICE_CLIPS = ${JSON.stringify(clips, null, 1)};
const VOICE_OF = ${JSON.stringify(who)};   // which voice says what: words on their own, everyone's lines, and characters with their own
`;
}

async function main(){
  const azure = readKey();
  const p = plan();
  const todo = Object.entries(p.clips).flatMap(([v, texts]) => Object.entries(texts).filter(([, c]) => !fs.existsSync(clipPath(v, c))).map(([t, c]) => [v, t, c]));
  const needs = provider => todo.some(([v]) => (p.voices[v].provider || 'azure') === provider);   // only the keys for clips still to make
  if ((needs('azure') && !azure.key) || (needs('google') && !azure.google)){ console.log(`A key is missing: paste ${needs('azure') && !azure.key ? 'KEY 1 from the Azure portal after "key="' : 'the API key from Google Cloud after "google="'} in voice-key.txt, then run this again.`); process.exitCode = 1; return; }
  console.log(todo.length ? `Making ${todo.length} clips (Azure's slowly: its free tier allows about 20 a minute)…` : 'Every clip is already made.');
  let n = 0;
  for (const [v, text, c] of todo){
    try {
      const audio = await sayRight(makeClip, azure, settings(p.voices[v]), text);
      fs.mkdirSync(path.join(AUDIO, v), {recursive: true});
      fs.writeFileSync(clipPath(v, c), audio);
      console.log(`  ${++n}/${todo.length} ${v}: ${text}`);
    } catch(e) {
      console.log(`  ${v}: ${text}: ${e.message}`);
      process.exitCode = 1; break;
    }
    await pause(pauseAfter(p.voices[v]));
  }
  if (process.exitCode){ console.log('Stopped: run it again to carry on (it keeps what it made).'); return; }   // (the clips in use stay as they were till then)
  // Clips nothing says any more, and voices nobody uses
  if (fs.existsSync(AUDIO)) for (const v of fs.readdirSync(AUDIO)){
    const keep = new Set(Object.values(p.clips[v] || {}).map(c => c + '.mp3'));
    for (const f of fs.readdirSync(path.join(AUDIO, v))) if (!keep.has(f)){ fs.unlinkSync(path.join(AUDIO, v, f)); console.log(`  removed ${v}/${f}`); }
    if (!fs.readdirSync(path.join(AUDIO, v)).length) fs.rmdirSync(path.join(AUDIO, v));
  }
  fs.writeFileSync(INDEX, indexText(p));
  console.log(`Wrote content/voices.js: ${Object.values(p.clips).reduce((s, c) => s + Object.keys(c).length, 0)} clips.`);
}

module.exports = {plan, indexText, clipPath, INDEX, SAY_AS, sayRight};
if (require.main === module) main();
