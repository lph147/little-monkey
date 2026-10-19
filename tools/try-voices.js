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

// `only` limits a voice to some items: the older man is just for the old monkey's line.
const VOICES = [
  {id:'xiaoxiao', name:'zh-CN-XiaoxiaoNeural', label:'Xiaoxiao', about:'a woman: Microsoft’s main Mandarin voice'},
  {id:'xiaoxiao-hd', name:'zh-CN-Xiaoxiao:DragonHDFlashLatestNeural', label:'Xiaoxiao HD', about:'the same woman, newest technology'},
  {id:'yunxi', name:'zh-CN-YunxiNeural', label:'Yunxi', about:'a young man'},
  {id:'xiaoyou', name:'zh-CN-XiaoyouNeural', label:'Xiaoyou', about:'a child'},
  {id:'yunze', name:'zh-CN-YunzeNeural', label:'Yunze', about:'an older man (just the old monkey’s line)', only:['laohouzi']},
];

// `ph` gives the voice the pinyin (tone numbers, a space before each), to see if a reading can be fixed.
const ITEMS = [
  {id:'shan', zh:'山', py:'shān', en:'mountain', listen:'One short syllable on its own, as on a word card: high and level.'},
  {id:'houzi', zh:'猴子', py:'hóuzi', en:'monkey', listen:'子 is light and short.'},
  {id:'zhi', zh:'只', py:'zhī', en:'(counts animals)', listen:'Said alone, it should be zhī (high and level), the counting word, not zhǐ (“only”).'},
  {id:'zhi-fixed', zh:'只', py:'zhī', en:'(counts animals)', ph:'zhi 1', listen:'The same word, with its pinyin given to the voice: does the fix work?'},
  {id:'yizhi', zh:'一只', py:'yì zhī', en:'a, one (animal)', listen:'一 changes to yì (falling) before zhī.'},
  {id:'shuiguo', zh:'水果', py:'shuǐguǒ', en:'fruit', listen:'Two third tones: the first one rises, like shuíguǒ.'},
  {id:'bukeqi', zh:'不客气', py:'bú kèqi', en:'you’re welcome', listen:'不 changes to bú, and 气 is light.'},
  {id:'nihao', zh:'你好！', py:'nǐ hǎo!', en:'Hello!', listen:'Two third tones again: like ní hǎo.'},
  {id:'kankan', zh:'去看看！', py:'qù kànkan!', en:'Go and take a look!', listen:'The second 看 is light.'},
  {id:'e', zh:'我饿了。我要吃水果！', py:'wǒ è le. wǒ yào chī shuǐguǒ!', en:'I’m hungry. I want to eat some fruit!', listen:'了 is light, with a natural pause between the two sentences.'},
  {id:'taozi', zh:'你有桃子吗？', py:'nǐ yǒu táozi ma?', en:'Do you have a peach?', listen:'It sounds like a question.'},
  {id:'laohouzi', zh:'我是老猴子。这是花果山。', py:'wǒ shì lǎo hóuzi. zhè shì Huāguǒ Shān.', en:'I’m the old monkey. This is Flower Fruit Mountain.', listen:'花果山 said as one name.'},
  {id:'hua', zh:'我要红色、黄色和白色的花！', py:'wǒ yào hóngsè, huángsè hé báisè de huā!', en:'I want red, yellow and white flowers!', listen:'A list, with small pauses.'},
];

const RATE = '-15%';   // a little slower than normal, like the game's voice now
const clipFile = (voice, item) => `${voice.id}-${item.id}.mp3`;
const wanted = () => VOICES.flatMap(v => ITEMS.filter(i => !v.only || v.only.includes(i.id)).map(i => [v, i]));

function readKey(file = KEY_FILE){
  if (!fs.existsSync(file)) return {};
  const get = name => (fs.readFileSync(file, 'utf8').match(new RegExp(`^[ \\t]*${name}[ \\t]*=[ \\t]*(\\S*)`, 'm')) || [])[1] || '';
  return {key:get('key'), region:get('region') || 'eastus'};
}

function ssml(voice, item, slow = true){
  const said = item.ph ? `<phoneme alphabet="sapi" ph="${item.ph}">${item.zh}</phoneme>` : item.zh;
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">`
    + `<voice name="${voice.name}">${slow ? `<prosody rate="${RATE}">${said}</prosody>` : said}</voice></speak>`;
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
        body:ssml(voice, item, tries < 1)   // if Azure doesn't like the slower speed for this voice, try once at normal speed
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
  const list = {voices:VOICES.map(({id, label, about, only}) => ({id, label, about, only})), items:ITEMS.map(({ph, ...i}) => i), made};
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
module.exports = {VOICES, ITEMS, KEY_FILE, clipFile, ssml, readKey};
