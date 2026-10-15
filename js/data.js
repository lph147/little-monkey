// Screen size, then the game's data, built from the content files in content/ (they load first).

const $ = s => document.querySelector(s);
const T = 16, VW = 11, VH = 10, STEP = 270, TURN_DELAY = 130;

/* ================= DATA ================= */
// The rest of the engine uses these names. They are filled in from the content files.
const AREA = FLOWER_FRUIT_MOUNTAIN;   // the area being played (the only one so far)
const toks = zh => zh.split(' ');     // '我 饿 了 。' becomes ['我','饿','了','。']
const WORDS = {};                     // the words you can collect here, in Word Scroll order
const GLOSS = {};                     // every other word, as [pinyin, English], for tapping on
for (const [w, d] of Object.entries(WORD_BANK)){
  if (d.area === AREA.number){ const {area, ...word} = d; WORDS[w] = word; }
  else GLOSS[w] = [d.py, d.en];
}
const ORDER = Object.keys(WORDS);
const PUNCT = new Set(['！','。','，','？']);
const L = {};                         // what the characters say
for (const [k, line] of Object.entries(AREA.lines)) L[k] = {t:toks(line.zh), en:line.en};
const STORY = AREA.story.map(s => ({t:toks(s.zh), en:s.en}));
const CAPS = AREA.intro.map(c => ({t:c.at, zh:c.zh, py:c.py, en:c.en}));
const DAY = 86400000, INTERVALS = [1,3,7,21];

const MAP = AREA.map;
const COLS = MAP[0].length, ROWS = MAP.length;
const LEGEND = AREA.legend;           // what each map letter is
const REQUESTS = Object.entries(AREA.requests).map(([id, r]) => ({id, ...r}));   // characters asking you to bring something
const requestFrom = who => REQUESTS.find(r => r.from === who);
const NPCS = AREA.characters.map(c => ({id:c.id, x:c.x, y:c.y, dir:c.facing, kind:c.id, label:c.label, look:c.look, word:c.word}));
const SPARKLES = AREA.sparkles;
const EXIT_TILES = [];                // where the way out is (map tiles whose action is the cave door)
MAP.forEach((row, y) => [...row].forEach((ch, x) => { if (LEGEND[ch] && LEGEND[ch].action === 'caveDoor') EXIT_TILES.push([x, y]); }));
const HIDING_WORD = (Object.values(LEGEND).find(t => t.animals) || {}).word;   // where animals hide, such as 草
const START = AREA.start;
