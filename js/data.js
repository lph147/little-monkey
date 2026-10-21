// Screen size, then the game's data, built from the content files in content/ (they load first).

const $ = s => document.querySelector(s);
const T = 16, STEP = 270, TURN_DELAY = 130;
// The screen shows 15 columns and 10 rows of the map: the shape of a Game Boy Advance's screen.
const VW = 15, VH = 10;

/* ================= DATA ================= */
// The rest of the engine uses these names. They are filled in from the content files.
const AREA = FLOWER_FRUIT_MOUNTAIN;   // the area being played (the only one so far)
const toks = zh => zh.split(' ');     // '我 饿 了 。' becomes ['我','饿','了','。']
const WORDS = {};                     // the words and phrases you can collect here
const GLOSS = {};                     // every other word, as [pinyin, English], for tapping on
for (const [w, d] of Object.entries(WORD_BANK)){
  if (d.area === AREA.number){ const {area, ...word} = d; WORDS[w] = word; }
  else GLOSS[w] = [d.py, d.en];
}
const ORDER = Object.keys(WORDS).filter(w => !WORDS[w].phrase);    // the area's words, in Word Scroll order
const PHRASES = Object.keys(WORDS).filter(w => WORDS[w].phrase);  // its phrases (你好, 谢谢…), a collection of their own
const PUNCT = new Set(['！','。','，','？','、','……']);
const L = {};                         // what the characters say
for (const [k, line] of Object.entries(AREA.lines)) L[k] = {t:toks(line.zh), en:line.en};
const STORY = AREA.story.map(s => ({t:toks(s.zh), en:s.en, pic:s.pic}));
const sceneCaps = list => list.map(c => ({t:c.at, words:toks(c.zh), en:c.en, teach:c.teach}));
const CAPS = sceneCaps(AREA.intro);   // the opening's captions (the other scenes': AREA.scenes, played by playScene in js/main.js)

// The area's places, small maps you move between, and the one you're in. A position in the content is
// in the first place unless it says another: [x, y, 'place'], or place:'id' (placeOf gives which).
const PLACES = AREA.places, FIRST_PLACE = Object.keys(PLACES)[0];
const placeOf = p => (Array.isArray(p) ? p[2] : p && p.place) || FIRST_PLACE;
let PLACE = null, MAP = [], COLS = 0, ROWS = 0;   // the place you're in, and its map (see setPlace)
let LEGEND = AREA.legend;             // what each map letter is: the area's legend, and the place's own if it has one (setPlace)
const REQUESTS = Object.entries(AREA.requests).map(([id, r]) => ({id, ...r}));   // characters asking you to bring something
const requestFrom = who => REQUESTS.find(r => r.from === who);
const ALL_NPCS = AREA.characters.map(c => ({id:c.id, place:placeOf(c), x:c.x, y:c.y, dir:c.facing, kind:c.id, label:c.label, look:c.look, word:c.word,
  home:{place:placeOf(c), x:c.x, y:c.y, facing:c.facing}, moves:c.moves}));   // home: where the content puts them; moves: where they go as the story goes on (placeCharacters)
let NPCS = [], SPARKLES = [];         // the characters and sparkles in the place you're in
const TRAINING_TILES = [];            // where the practice posts are (the training action)
// Makes id the place you're in: its map, characters, sparkles and practice posts.
// (enterPlace in js/world.js does this and redraws the map.)
function setPlace(id){
  PLACE = id; MAP = PLACES[id].map; COLS = MAP[0].length; ROWS = MAP.length;
  LEGEND = PLACES[id].legend ? {...AREA.legend, ...PLACES[id].legend} : AREA.legend;   // (a place's own letters, such as the classroom's)
  NPCS = ALL_NPCS.filter(n => n.place === id);
  SPARKLES = AREA.sparkles.filter(s => placeOf(s.at) === id);
  TRAINING_TILES.length = 0;
  MAP.forEach((row, y) => [...row].forEach((ch, x) => {
    if (LEGEND[ch] && LEGEND[ch].action === 'training') TRAINING_TILES.push([x, y]);
  }));
}
const HIDING_WORD = (Object.values(LEGEND).find(t => t.animals) || {}).word;   // where animals hide, such as 草
const START = {...AREA.start, place:placeOf(AREA.start)};
setPlace(START.place);
