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
// (Google's) sounded much better. Round 5 tries Google's voices: Google Standard (cmn-CN-Standard-A) was chosen. noPinyin: the voice isn't given an item's ph.
// provider: 'google' for Google's voices (Azure's otherwise); speed: Google's speaking rate (1 is normal).
// Round 6 (15 November 2026): voices for Area 3's new characters (the Eastern Sea, Chapters 5 and 6), before they speak in the
// game. Round 5's choice stands for words on their own (Google Standard), and Yunxi (chatty) and Yunze for lines.
const ROUND = 'Round 6: voices for the Eastern Sea’s new characters. The Dragon King, the Great White Planet and the ten kings of the underworld want older men’s voices, each unlike the others and unlike the old monkey’s (Yunze, here to compare). The Dragon Queen wants a woman’s. The sea turtle could be kind and old, or speak as the other animal friends do (Yunxi). Which suits each?';
const VOICES = [
  {id:'r6-yunxi', name:'zh-CN-YunxiNeural', rate:null, tidy:true, style:'chat', label:'Yunxi (chatty)', about:'everyone’s voice now', only:["turtle1","turtle2","turtle3"]},
  {id:'r6-yunze', name:'zh-CN-YunzeNeural', rate:null, tidy:true, label:'Yunze', about:'the old monkey’s voice now, to compare', only:["king1","king2","king3"]},
  {id:'r6-yunye', name:'zh-CN-YunyeNeural', rate:null, tidy:true, label:'Yunye', about:'a grown man, a storyteller', only:["king1","king2","king3","planet1","planet2","below1","below2"]},
  {id:'r6-yunyang', name:'zh-CN-YunyangNeural', rate:null, tidy:true, label:'Yunyang', about:'a deep, steady man', only:["king1","king2","king3","planet1","planet2","below1","below2"]},
  {id:'r6-yunhao', name:'zh-CN-YunhaoNeural', rate:null, tidy:true, label:'Yunhao', about:'a lively man', only:["king1","king2","king3","below1","below2"]},
  {id:'r6-yunjian', name:'zh-CN-YunjianNeural', rate:null, tidy:true, label:'Yunjian', about:'a strong, bold man', only:["king1","king2","king3","below1","below2"]},
  {id:'r6-xiaorui', name:'zh-CN-XiaoruiNeural', rate:null, tidy:true, label:'Xiaorui', about:'an older woman', only:["queen1","queen2","turtle1","turtle2","turtle3"]},
  {id:'r6-xiaoqiu', name:'zh-CN-XiaoqiuNeural', rate:null, tidy:true, label:'Xiaoqiu', about:'a calm, grown woman', only:["queen1","queen2","turtle1","turtle2","turtle3"]},
  {id:'r6-xiaohan', name:'zh-CN-XiaohanNeural', rate:null, tidy:true, label:'Xiaohan', about:'a warm woman', only:["queen1","queen2","turtle1","turtle2","turtle3"]},
];

// Lines each character will say (drafts for the native speaker, as in the Area 3 plan).
const ITEMS = [
  {id:'king1', zh:'欢迎！欢迎！', py:'Huānyíng! Huānyíng!', en:'Welcome! Welcome! (the Dragon King)', listen:'Grand, and pleased to see you.'},
  {id:'king2', zh:'这个多少斤？', py:'Zhège duōshao jīn?', en:'How many jin is this one? (the Dragon King)', listen:'A question, kindly.'},
  {id:'king3', zh:'一万三千五百斤！给你！', py:'Yíwàn sānqiān wǔbǎi jīn! Gěi nǐ!', en:'Thirteen thousand five hundred jin! Here you are! (the Dragon King)', listen:'Big numbers, said clearly.'},
  {id:'queen1', zh:'宝库里有一根铁柱子，它有光！', py:'Bǎokù li yǒu yì gēn tiě zhùzi, tā yǒu guāng!', en:'In the treasury there’s an iron pillar, and it’s glowing! (the Dragon Queen)', listen:'A whisper of a secret.'},
  {id:'queen2', zh:'你好！你是谁？', py:'Nǐ hǎo! Nǐ shì shéi?', en:'Hello! Who are you? (the Dragon Queen)', listen:'Kind, curious.'},
  {id:'turtle1', zh:'你好！好久不见！', py:'Nǐ hǎo! Hǎojiǔ bú jiàn!', en:'Hello! Long time no see! (the sea turtle)', listen:'An old friend, glad to see you.'},
  {id:'turtle2', zh:'你在泡泡里！', py:'Nǐ zài pàopao li!', en:'You’re in a bubble! (the sea turtle)', listen:'Amused.'},
  {id:'turtle3', zh:'小心！有鲨鱼！', py:'Xiǎoxīn! Yǒu shāyú!', en:'Careful! A shark! (the sea turtle)', listen:'A warning.'},
  {id:'planet1', zh:'玉皇大帝请你去天宫。', py:'Yùhuáng Dàdì qǐng nǐ qù Tiāngōng.', en:'The Jade Emperor invites you to Heaven. (the Great White Planet)', listen:'Gentle, wise, very old.'},
  {id:'planet2', zh:'你好，孙悟空！', py:'Nǐ hǎo, Sūn Wùkōng!', en:'Hello, Sun Wukong! (the Great White Planet)', listen:'Warm.'},
  {id:'below1', zh:'找你的名字！', py:'Zhǎo nǐ de míngzi!', en:'Find your name! (one of the ten kings)', listen:'Stern, but scared of you.'},
  {id:'below2', zh:'我们怕你！', py:'Wǒmen pà nǐ!', en:'We’re scared of you! (the ten kings)', listen:'Nervous.'},
];

const RATE = '-15%';   // a little slower than normal: the game's clips so far
const clipFile = (voice, item) => `${voice.id}-${item.id}.mp3`;
const wanted = () => VOICES.flatMap(v => ITEMS.filter(i => !v.only || v.only.includes(i.id)).map(i => [v, i]));

// The keys, from voice-key.txt, or from GitHub's secrets (AZURE_TTS_KEY, its AZURE_TTS_REGION, GOOGLE_TTS_KEY) when GitHub makes the clips
// (.github/workflows/voices.yml).
function readKey(file = KEY_FILE, env = process.env){
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const get = name => (text.match(new RegExp(`^[ \\t]*${name}[ \\t]*=[ \\t]*(\\S*)`, 'm')) || [])[1] || '';
  return {key:get('key') || env.AZURE_TTS_KEY || '', region:get('region') || env.AZURE_TTS_REGION || 'eastus', google:get('google') || env.GOOGLE_TTS_KEY || ''};
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

// What to ask Google for (its Text-to-Speech API): the words, the voice, and MP3 at its speed. An item's pinyin (ph) goes
// as a custom pronunciation, in Google's way of writing it: a tone number after each syllable (zhi1, not zhi 1).
function googleRequest(voice, item){
  const ph = item.ph && !voice.noPinyin ? {customPronunciations:{pronunciations:[{phrase:item.zh, phoneticEncoding:'PHONETIC_ENCODING_PINYIN', pronunciation:item.ph.replace(/ (\d)/g, '$1')}]}} : {};
  return {input:{text:item.zh, ...ph}, voice:{languageCode:'cmn-CN', name:voice.name},
    audioConfig:{audioEncoding:'MP3', sampleRateHertz:24000, ...(voice.speed ? {speakingRate:voice.speed} : {})}};
}
async function makeGoogleClip(key, voice, item){
  for (let tries = 0; ; tries++){
    let res;
    try {
      res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method:'POST', headers:{'Content-Type':'application/json', 'X-Goog-Api-Key':key}, body:JSON.stringify(googleRequest(voice, item))});
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
  const res = await fetch('https://texttospeech.googleapis.com/v1/voices?languageCode=cmn-CN', {headers:{'X-Goog-Api-Key':key}});
  if (!res.ok) throw new Error(`Google said no (${res.status}): check the key in voice-key.txt, and that the Cloud Text-to-Speech API is enabled.`);
  return ((await res.json()).voices || []).map(v => ({name:v.name, gender:v.ssmlGender}));
}
// A Google voice whose name Google doesn't have is swapped for another woman's voice of the same kind (Standard,
// Wavenet, Chirp3-HD) that isn't used yet, and its description says which. (voices: those about to be made)
async function checkGoogleNames(key, voices){
  let have;
  try { have = await googleVoices(key); } catch(e) { return; }   // making the clips will say what's wrong
  const used = new Set(voices.map(v => v.name)), kind = name => name.replace(/-[^-]+$/, '');
  for (const v of new Set(voices.filter(v => v.provider === 'google'))){
    if (have.some(h => h.name === v.name)) continue;
    const swap = have.find(h => kind(h.name) === kind(v.name) && h.gender === 'FEMALE' && !used.has(h.name));
    if (!swap) continue;
    console.log(`  Google has no ${v.name}: using ${swap.name} instead.`);
    used.add(swap.name); v.about += ` (${swap.name.replace(/^cmn-CN-/, '')})`; v.name = swap.name;
  }
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
  // The clips still to make, for the voices there's a key for (the others are skipped, and said so).
  const hasKey = v => v.provider === 'google' ? !!keys.google : !!keys.key;
  const all = wanted().filter(([v, i]) => !fs.existsSync(path.join(OUT, clipFile(v, i)))), todo = all.filter(([v]) => hasKey(v));
  const missing = [all.some(([v]) => v.provider !== 'google' && !hasKey(v)) && 'KEY 1 from the Azure portal after "key="',
    all.some(([v]) => v.provider === 'google' && !hasKey(v)) && 'the API key from Google Cloud after "google="'].filter(Boolean);
  if (missing.length){
    console.log(`A key is missing, so ${[...new Set(all.filter(([v]) => !hasKey(v)).map(([v]) => v.label))].join(', ')} can't be made: open voice-key.txt in the project folder and paste ${missing.join(', and ')}.`);
    process.exitCode = 1;
    if (!todo.length){ if (fs.existsSync(OUT)) writeList(); return; }
  }
  if (todo.some(([v]) => v.provider === 'google')) await checkGoogleNames(keys.google, todo.map(([v]) => v));
  fs.mkdirSync(OUT, {recursive:true});
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
module.exports = {VOICES, ITEMS, KEY_FILE, clipFile, ssml, googleRequest, checkGoogleNames, readKey, makeClip, pauseAfter, pause};
