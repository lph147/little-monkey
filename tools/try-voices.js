// The voice test: makes the same tricky words and lines in a few of Azure's Mandarin voices, so we
// can hear which suits the game before making a clip for every word (DESIGN.md, Next steps).
// Run it with `npm run try-voices`, then listen at http://127.0.0.1:8000/tools/try-voices.html (npm start).
// It needs your Azure key in voice-key.txt, which stays on this computer (.gitignore keeps it off GitHub).
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
// looks for a woman's voice for words said on their own: Xiaoxiao (the first column) was chosen.
const ROUND = 'Round 3: a woman’s voice for single words (new-word cards, tapping a word, listening questions). Sentences will be Yunxi, tidy and chatty, as chosen in round 2. Which is as clear as This device, or clearer? Do you hear any breathing?';
const VOICES = [
  {id:'w-xiaoxiao', name:'zh-CN-XiaoxiaoNeural', rate:null, tidy:true, label:'Xiaoxiao', about:'Microsoft’s main voice: very clear'},
  {id:'w-xiaoxiao-hd', name:'zh-CN-Xiaoxiao:DragonHDFlashLatestNeural', rate:null, tidy:true, label:'Xiaoxiao HD', about:'the same woman, newer and more natural'},
  {id:'w-xiaochen', name:'zh-CN-XiaochenNeural', rate:null, tidy:true, label:'Xiaochen', about:'calm and clear'},
  {id:'w-xiaoyi', name:'zh-CN-XiaoyiNeural', rate:null, tidy:true, label:'Xiaoyi', about:'younger and livelier'},
];

// `ph` gives the voice the pinyin (tone numbers, a space before each), to see if a reading can be fixed.
const ITEMS = [
  {id:'shan', zh:'山', py:'shān', en:'mountain', listen:'One short syllable: high and level.'},
  {id:'houzi', zh:'猴子', py:'hóuzi', en:'monkey', listen:'子 is light and short.'},
  {id:'zhi-fixed', zh:'只', py:'zhī', en:'(counts animals)', ph:'zhi 1', listen:'zhī, high and level (given its pinyin, as the game does).'},
  {id:'yizhi', zh:'一只', py:'yì zhī', en:'a, one (animal)', listen:'一 changes to yì (falling) before zhī.'},
  {id:'shuiguo', zh:'水果', py:'shuǐguǒ', en:'fruit', listen:'Two third tones: the first one rises, like shuíguǒ.'},
  {id:'bukeqi', zh:'不客气', py:'bú kèqi', en:'you’re welcome', listen:'不 changes to bú, and 气 is light.'},
  {id:'nihao', zh:'你好', py:'nǐ hǎo', en:'hello', listen:'Two third tones again: like ní hǎo.'},
  {id:'pingguo', zh:'苹果', py:'píngguǒ', en:'apple', listen:'Rising, then low.'},
  {id:'pubu', zh:'瀑布', py:'pùbù', en:'waterfall', listen:'Two falling tones.'},
  {id:'xiexie', zh:'谢谢', py:'xièxie', en:'thank you', listen:'The second 谢 is light.'},
];

const RATE = '-15%';   // a little slower than normal: the game's clips so far
const clipFile = (voice, item) => `${voice.id}-${item.id}.mp3`;
const wanted = () => VOICES.flatMap(v => ITEMS.filter(i => !v.only || v.only.includes(i.id)).map(i => [v, i]));

function readKey(file = KEY_FILE){
  if (!fs.existsSync(file)) return {};
  const get = name => (fs.readFileSync(file, 'utf8').match(new RegExp(`^[ \\t]*${name}[ \\t]*=[ \\t]*(\\S*)`, 'm')) || [])[1] || '';
  return {key:get('key'), region:get('region') || 'eastus'};
}

function ssml(voice, item, full = true){   // full: with the voice's speed, style and silences (false: just the words)
  const rate = full && (voice.rate === undefined ? RATE : voice.rate);
  let said = item.ph ? `<phoneme alphabet="sapi" ph="${item.ph}">${item.zh}</phoneme>` : item.zh;
  if (rate) said = `<prosody rate="${rate}">${said}</prosody>`;
  if (full && voice.style) said = `<mstts:express-as style="${voice.style}">${said}</mstts:express-as>`;
  const tidy = full && voice.tidy ? '<mstts:silence type="Leading-exact" value="0ms"/><mstts:silence type="Tailing-exact" value="0ms"/><mstts:silence type="Sentenceboundary-exact" value="250ms"/>' : '';
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">`
    + `<voice name="${voice.name}">${tidy}${said}</voice></speak>`;
}

const pause = ms => new Promise(r => setTimeout(r, ms));

// One clip from Azure. Throws an Error with a plain-English message if it can't.
async function makeClip({key, region}, voice, item){
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
  const azure = readKey();
  if (!azure.key){
    console.log('No key yet. Open voice-key.txt in the project folder, paste KEY 1 from the Azure portal straight after "key=", save it, and run this again.');
    process.exitCode = 1; return;
  }
  fs.mkdirSync(OUT, {recursive:true});
  const todo = wanted().filter(([v, i]) => !fs.existsSync(path.join(OUT, clipFile(v, i))));
  console.log(todo.length ? `Making ${todo.length} clips (slowly: the free tier allows about 20 a minute)…` : 'All the clips are already made.');
  const failed = new Set();
  for (const [voice, item] of todo){
    if (failed.has(voice.id)) continue;
    try {
      fs.writeFileSync(path.join(OUT, clipFile(voice, item)), await makeClip(azure, voice, item));
      console.log(`  ${voice.label}: ${item.zh}`);
    } catch(e) {
      console.log(`  ${voice.label}: ${e.message}`);
      if (/key|reach/.test(e.message)){ writeList(); process.exitCode = 1; return; }
      failed.add(voice.id);   // skip the rest of this voice, keep going with the others
    }
    await pause(3200);
  }
  const n = writeList();
  console.log(`${n} of ${wanted().length} clips ready. Listen at http://127.0.0.1:8000/tools/try-voices.html (npm start).`);
  if (failed.size) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = {VOICES, ITEMS, KEY_FILE, clipFile, ssml, readKey, makeClip, pause};
