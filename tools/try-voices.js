// The voice test: makes the same tricky words and lines in a few of Azure's Mandarin voices, so we
// can hear which suits the game before making a clip for every word (DESIGN.md, Next steps).
// Run it with `npm run try-voices`, then listen at http://127.0.0.1:8000/tools/try-voices.html (npm start).
// It needs your keys in voice-key.txt (Azure's, and Google's for Google's voices), which stays on this computer
// (.gitignore keeps it off GitHub). `node tools/try-voices.js --list-google` lists Google's Mandarin voices.
// Clips go in tools/try-voices/, with list.json saying which there are. Clips already made are skipped,
// so running it again only makes what's missing. Nothing here touches the game.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KEY_FILE = path.join(ROOT, 'voice-key.txt');
const OUT = path.join(__dirname, 'try-voices');

// Each round of the test, what it compares and why (shown at the top of the page).
// rate: slower or faster (left out: RATE, below, the game's clips so far; null: normal speed); tidy: no silence before
// or after, and short pauses between sentences; style: one of the voice's speaking styles. `only` limits a voice to some items.
// Round 1 (19 October 2026) compared Xiaoxiao, Xiaoxiao HD, Yunxi and Xiaoyou, and Yunze for the old monkey: Yunxi chosen,
// with Yunze for the old monkey. Round 2: in the game Yunxi sounded slow and exaggerated, with breaths, on a Pixel 8 Pro;
// of Yunxi as it was, at normal speed, tidy, and tidy and chatty, tidy and chatty was best for sentences, and giving the
// pinyin fixed 只. Single words sounded clearer in the Pixel's own woman's voice (a native speaker agreed), so round 3
// looks for a woman's voice for words said on their own: Xiaoxiao (the first column) was chosen. Round 4: in the game,
// 水, 草 and 喝 sounded strange said on their own (third tones, and a word with two readings). Given the pinyin, all ten
// came out byte for byte the same as before (the voice already read them right), so it compares Xiaoxiao as in the
// game, 20% and 35% slower, and Xiaoxiao HD: all sounded much the same, and still strange, while the Pixel's own voice
// (Google's) sounded much better. Round 5 tries Google's voices. noPinyin: the voice isn't given an item's ph.
// provider: 'google' for Google's voices (Azure's otherwise); speed: Google's speaking rate (1 is normal).
const ROUND = 'Round 5: Google’s voices for words on their own, since This device (your Pixel’s voice, which is Google’s) sounded much better than Xiaoxiao on single words. Which is as good as This device? Do the longer words (猴子, 苹果, 不客气) sound good too?';
const VOICES = [   // Google's names checked with --list-google once the key is in; change any that aren't there
  {id:'r5-xiaoxiao', name:'zh-CN-XiaoxiaoNeural', rate:null, tidy:true, label:'Xiaoxiao', about:'as in the game now'},
  {id:'r5-g-standard', provider:'google', name:'cmn-CN-Standard-A', label:'Google Standard', about:'Google’s plainest voice'},
  {id:'r5-g-wavenet', provider:'google', name:'cmn-CN-Wavenet-A', label:'Google WaveNet', about:'Google’s older natural voice'},
  {id:'r5-g-chirp-1', provider:'google', name:'cmn-CN-Chirp3-HD-Kore', label:'Google HD 1', about:'Google’s newest voices'},
  {id:'r5-g-chirp-2', provider:'google', name:'cmn-CN-Chirp3-HD-Aoede', label:'Google HD 2', about:'another of the newest'},
];

// `ph` gives the voice the pinyin (tone numbers, a space before each), to see if a reading can be fixed.
const ITEMS = [
  {id:'shui', zh:'水', py:'shuǐ', en:'water', ph:'shui 3', listen:'Third tone: dips low, then rises.'},
  {id:'cao', zh:'草', py:'cǎo', en:'grass', ph:'cao 3', listen:'Third tone: dips low, then rises.'},
  {id:'he1', zh:'喝', py:'hē', en:'to drink', ph:'he 1', listen:'hē, high and level (not hè, to shout).'},
  {id:'niao', zh:'鸟', py:'niǎo', en:'bird', ph:'niao 3', listen:'Third tone.'},
  {id:'wo', zh:'我', py:'wǒ', en:'I, me', ph:'wo 3', listen:'Third tone.'},
  {id:'hao', zh:'好', py:'hǎo', en:'good', ph:'hao 3', listen:'hǎo, third tone (not hào).'},
  {id:'you', zh:'有', py:'yǒu', en:'to have', ph:'you 3', listen:'Third tone.'},
  {id:'he2', zh:'和', py:'hé', en:'and', ph:'he 2', listen:'hé, rising (it has other readings).'},
  {id:'yao', zh:'要', py:'yào', en:'to want', ph:'yao 4', listen:'yào, falling (not yāo).'},
  {id:'le', zh:'了', py:'le', en:'(a change)', ph:'le 5', listen:'le, light (not liǎo).'},
  {id:'shan', zh:'山', py:'shān', en:'mountain', listen:'High and level.'},
  {id:'houzi', zh:'猴子', py:'hóuzi', en:'monkey', listen:'子 is light and short.'},
  {id:'pingguo', zh:'苹果', py:'píngguǒ', en:'apple', listen:'Rising, then low.'},
  {id:'bukeqi', zh:'不客气', py:'bú kèqi', en:'you’re welcome', listen:'不 changes to bú, and 气 is light.'},
];

const RATE = '-15%';   // a little slower than normal: the game's clips so far
const clipFile = (voice, item) => `${voice.id}-${item.id}.mp3`;
const wanted = () => VOICES.flatMap(v => ITEMS.filter(i => !v.only || v.only.includes(i.id)).map(i => [v, i]));

function readKey(file = KEY_FILE){
  if (!fs.existsSync(file)) return {};
  const get = name => (fs.readFileSync(file, 'utf8').match(new RegExp(`^[ \\t]*${name}[ \\t]*=[ \\t]*(\\S*)`, 'm')) || [])[1] || '';
  return {key:get('key'), region:get('region') || 'eastus', google:get('google')};
}

function ssml(voice, item, full = true){   // full: with the voice's speed, style and silences (false: just the words)
  const rate = full && (voice.rate === undefined ? RATE : voice.rate);
  let said = item.ph && !voice.noPinyin ? `<phoneme alphabet="sapi" ph="${item.ph}">${item.zh}</phoneme>` : item.zh;
  if (rate) said = `<prosody rate="${rate}">${said}</prosody>`;
  if (full && voice.style) said = `<mstts:express-as style="${voice.style}">${said}</mstts:express-as>`;
  const tidy = full && voice.tidy ? '<mstts:silence type="Leading-exact" value="0ms"/><mstts:silence type="Tailing-exact" value="0ms"/><mstts:silence type="Sentenceboundary-exact" value="250ms"/>' : '';
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">`
    + `<voice name="${voice.name}">${tidy}${said}</voice></speak>`;
}

const pause = ms => new Promise(r => setTimeout(r, ms));

// What to ask Google for (its Text-to-Speech API): the words, the voice, and MP3 at its speed.
function googleRequest(voice, item){
  return {input:{text:item.zh}, voice:{languageCode:'cmn-CN', name:voice.name},
    audioConfig:{audioEncoding:'MP3', sampleRateHertz:24000, ...(voice.speed ? {speakingRate:voice.speed} : {})}};
}
async function makeGoogleClip(key, voice, item){
  for (let tries = 0; ; tries++){
    let res;
    try {
      res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(googleRequest(voice, item))});
    } catch(e) { throw new Error('Couldn’t reach Google. Are you online?'); }
    if (res.ok){
      const audio = Buffer.from((await res.json()).audioContent || '', 'base64');
      if (!audio.length) throw new Error('Google sent back an empty clip.');
      return audio;
    }
    const why = (await res.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 160);
    if (res.status === 401 || res.status === 403) throw new Error(`Google didn’t accept the key. Check it’s pasted whole after "google=" in voice-key.txt, that the Cloud Text-to-Speech API is enabled, and that billing is set up. (${why})`);
    if (res.status === 429 && tries < 4){ console.log('  Google says slow down: waiting half a minute…'); await pause(30000); continue; }
    if (res.status === 400) throw new Error(`Google has no voice called ${voice.name}, or didn’t like the request (${why}): run node tools/try-voices.js --list-google.`);
    throw new Error(`Google said no (${res.status} ${res.statusText}).`);
  }
}
// Google's Mandarin voices: [{name, gender}].
async function googleVoices(key){
  const res = await fetch(`https://texttospeech.googleapis.com/v1/voices?languageCode=cmn-CN&key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error(`Google said no (${res.status}): check the key in voice-key.txt, and that the Cloud Text-to-Speech API is enabled.`);
  return ((await res.json()).voices || []).map(v => ({name:v.name, gender:v.ssmlGender}));
}
// One clip, from Google or Azure (keys: readKey()'s). Throws an Error with a plain-English message if it can't.
const makeClip = (keys, voice, item) => voice.provider === 'google' ? makeGoogleClip(keys.google, voice, item) : makeAzureClip(keys, voice, item);
const pauseAfter = voice => voice.provider === 'google' ? 300 : 3200;   // Azure's free tier allows about 20 a minute
async function makeAzureClip({key, region}, voice, item){
  for (let tries = 0; ; tries++){
    let res;
    try {
      res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method:'POST',
        headers:{'Ocp-Apim-Subscription-Key':key, 'Content-Type':'application/ssml+xml',
          'X-Microsoft-OutputFormat':'audio-24khz-48kbitrate-mono-mp3', 'User-Agent':'little-monkey-try-voices'},
        body:ssml(voice, item, tries < 1)   // if Azure doesn't like the speed, style or silences for this voice, try once with just the words
      });
    } catch(e) { throw new Error('Couldn’t reach Azure. Are you online?'); }
    if (res.ok){
      const audio = Buffer.from(await res.arrayBuffer());
      if (!audio.length) throw new Error('Azure sent back an empty clip.');
      return audio;
    }
    if (res.status === 401 || res.status === 403) throw new Error('Azure didn’t accept the key. Check KEY 1 is pasted whole after "key=" in voice-key.txt, and the region is eastus.');
    if (res.status === 429 && tries < 4){ console.log('  Azure says slow down: waiting half a minute…'); await pause(30000); continue; }
    if (res.status === 400 && tries < 1) continue;
    throw new Error(`Azure said no (${res.status} ${res.statusText}). The voice may not be available in this region.`);
  }
}

function writeList(){
  const made = wanted().filter(([v, i]) => fs.existsSync(path.join(OUT, clipFile(v, i)))).map(([v, i]) => clipFile(v, i));
  const list = {round:ROUND, voices:VOICES.map(({id, label, about, only}) => ({id, label, about, only})), items:ITEMS.map(({ph, ...i}) => i), made};
  fs.writeFileSync(path.join(OUT, 'list.json'), JSON.stringify(list, null, 1) + '\n');
  return made.length;
}

async function main(){
  const keys = readKey();
  if (process.argv.includes('--list-google')){
    if (!keys.google){ console.log('No Google key yet: paste it after "google=" in voice-key.txt.'); process.exitCode = 1; return; }
    try { for (const v of await googleVoices(keys.google)) console.log(`${v.name} (${String(v.gender).toLowerCase()})`); } catch(e) { console.log(e.message); process.exitCode = 1; }
    return;
  }
  const missing = [VOICES.some(v => v.provider !== 'google') && !keys.key && 'KEY 1 from the Azure portal after "key="',
    VOICES.some(v => v.provider === 'google') && !keys.google && 'the API key from Google Cloud after "google="'].filter(Boolean);
  if (missing.length){
    console.log(`A key is missing. Open voice-key.txt in the project folder and paste ${missing.join(', and ')}. Save it, and run this again.`);
    process.exitCode = 1; return;
  }
  fs.mkdirSync(OUT, {recursive:true});
  const todo = wanted().filter(([v, i]) => !fs.existsSync(path.join(OUT, clipFile(v, i))));
  console.log(todo.length ? `Making ${todo.length} clips (Azure's slowly: its free tier allows about 20 a minute)…` : 'All the clips are already made.');
  const failed = new Set();
  for (const [voice, item] of todo){
    if (failed.has(voice.id)) continue;
    try {
      fs.writeFileSync(path.join(OUT, clipFile(voice, item)), await makeClip(keys, voice, item));
      console.log(`  ${voice.label}: ${item.zh}`);
    } catch(e) {
      console.log(`  ${voice.label}: ${e.message}`);
      if (/key|reach/.test(e.message)){ writeList(); process.exitCode = 1; return; }
      failed.add(voice.id);   // skip the rest of this voice, keep going with the others
    }
    await pause(pauseAfter(voice));
  }
  const n = writeList();
  console.log(`${n} of ${wanted().length} clips ready. Listen at http://127.0.0.1:8000/tools/try-voices.html (npm start).`);
  if (failed.size) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = {VOICES, ITEMS, KEY_FILE, clipFile, ssml, googleRequest, readKey, makeClip, pauseAfter, pause};
