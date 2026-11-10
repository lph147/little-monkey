// Screen size, then the game's data, built from the content files in content/ (they load first).

const $ = s => document.querySelector(s);
const T = 16, STEP = 270, TURN_DELAY = 130;
// The screen shows 15 columns and 10 rows of the map: the shape of a Game Boy Advance's screen.
const VW = 15, VH = 10;

/* ================= DATA ================= */
// The rest of the engine uses these names. They are filled in from the content files.
// The areas, in story order. The game plays one at a time (AREA): the one the game you're playing is in (its save's area),
// chosen as the page loads, so everything below is built from it. Going to another (sailing on, or continuing a game that's
// in another area) saves, notes where to go (GO_KEY, for this tab only) and loads the page again: toArea in js/main.js
// (decided 4 November 2026: the human world, Area 2's prologue).
const AREAS = [FLOWER_FRUIT_MOUNTAIN, ACROSS_THE_SEA];
const GO_KEY = 'xiaohouzi-v2-go';
function areaToPlay(){
  try { const go = JSON.parse(sessionStorage.getItem(GO_KEY) || 'null'); if (go && go.area) return go.area; } catch(e) {}
  try {
    const slots = JSON.parse(localStorage.getItem('xiaohouzi-v2-slots') || '{}'), n = [1, 2, 3].includes(slots.active) ? slots.active : 1;
    const s = JSON.parse(localStorage.getItem(n === 1 ? 'xiaohouzi-v2' : `xiaohouzi-v2-game${n}`) || 'null');
    return (s && s.area) || 1;
  } catch(e) { return 1; }
}
const AREA = AREAS.find(a => a.number === areaToPlay()) || AREAS[0];   // the area being played
const toks = zh => zh.split(' ');     // '我 饿 了 。' becomes ['我','饿','了','。']
const WORDS = {};                     // the words and phrases you can collect here, and those of the areas before it (still yours)
const GLOSS = {};                     // every other word, as [pinyin, English], for tapping on
for (const [w, d] of Object.entries(WORD_BANK)){
  if (d.area && d.area <= AREA.number){ const {area, ...word} = d; WORDS[w] = word; }
  else GLOSS[w] = [d.py, d.en];
}
// The area's words, in Word Scroll order. A word for later (later: in the word bank, such as 蜜蜂 till the troop's bees) only
// counts, and is in the Word Scroll, once the game you're playing has caught it (decided 22 October 2026: a word nothing
// teaches made the words impossible to finish): wordsForGame, as a game starts.
const ORDER = Object.keys(WORDS).filter(w => !WORDS[w].phrase && !WORDS[w].later);
function wordsForGame(){ ORDER.length = 0; ORDER.push(...Object.keys(WORDS).filter(w => !WORDS[w].phrase && (!WORDS[w].later || lvl(w) >= 1))); }
const PHRASES = Object.keys(WORDS).filter(w => WORDS[w].phrase);  // its phrases (你好, 谢谢…), a collection of their own
const PUNCT = new Set(['！','。','，','？','、','……']);
const L = {};                         // what the characters say
for (const [k, line] of Object.entries(AREA.lines)) L[k] = {t:toks(line.zh), en:line.en};
const STORY = AREA.story.map(s => ({t:toks(s.zh), en:s.en, pic:s.pic}));
const sceneCaps = list => list.map(c => ({t:c.at, words:toks(c.zh), en:c.en, teach:c.teach}));
const CAPS = sceneCaps(AREA.intro);   // the opening's captions (the other scenes': AREA.scenes, played by playScene in js/main.js)

// A place borrowed from an area before this one, as you left it (decided 5 November 2026: Area 2's chapter 2, home to Flower
// Fruit Mountain after twenty years): in the content, {borrow: its id there, from: that area's number, and anything of its
// own}. Its map, with every square its story changed there changed for good (each letter's becomes, worked out from that
// area's progress once you've finished it, its left); its legend's looks, words and ways of walking (BORROW_KEEPS), not
// what A did there then (its story's steps, gathering; but its signs and tablets still say what they said, and anything
// that only looked, looksKept), with the borrowing place's own wild creatures (wild) in its
// long grass (where wild creatures or animals lived there); its ways to the other places borrowed from there (those that were open at the end); its music, sounds that
// always play, gloom and battle backdrop. Anything of its own (legend, name, music, noMap...) goes over that, and squares
// of its own on the map (put: [x, y, letter], such as the feast's tables, bare once the little demons have taken
// everything off them). Never on a map of this area's own: it gives noMap instead.
const BORROW_KEEPS = ['look', 'walk', 'word', 'landmark', 'note', 'colour', 'ledge', 'hop', 'vent', 'fishing', 'partOf', 'learnOnStep', 'stepNote', 'pick', 'wild'];
function wasLeft(cond, left){   // does an area's progress at its end (left) match an if from that area's content?
  return Object.entries(cond || {}).every(([k, want]) => {
    if (k === 'any') return want.some(c => wasLeft(c, left));
    const have = left[k];
    if (want && typeof want === 'object') return (want.atLeast === undefined || (have || 0) >= want.atLeast) && (want.below === undefined || (have || 0) < want.below);
    return typeof want === 'number' ? (have || 0) === want : (have ?? false) === want;
  });
}
// What A did at a square there that only looked at it (decided 7 November 2026, after playing it: the hillside's lookout
// said Look, and nothing happened): the part of its onLook that matched at the end, if all it does is say what it is
// (messages) or show the view from it (scenes, borrowed too if this area hasn't one of that name, such as the lookout's),
// with its label (Read, for a sign).
const LOOK_STEPS = ['message', 'scene'];
function looksKept(t, left, from){
  const part = (t.onLook || []).find(p => wasLeft(p.if, left));
  if (!part || !part.do.length || !part.do.every(s => !s.if && Object.keys(s).length === 1 && LOOK_STEPS.includes(Object.keys(s)[0]))) return null;
  for (const s of part.do) if (s.scene && !AREA.scenes[s.scene] && (from.scenes || {})[s.scene]) AREA.scenes[s.scene] = from.scenes[s.scene];
  const label = part.label || t.label;
  return [{...(label ? {label} : {}), do:part.do}];
}
function borrowPlace(own, places){
  const from = AREAS.find(a => a.number === own.from), src = from.places[own.borrow], left = from.left || {};
  const legend = {...from.legend, ...(src.legend || {})}, idHere = id => Object.keys(places).find(k => { const q = places[k], b = q.borrowed || {id:q.borrow, from:q.from}; return b.id === id && b.from === own.from; });
  const settled = ch => { for (let i = 0; i < 9 && legend[ch] && legend[ch].becomes; i++){ const b = legend[ch].becomes.find(e => wasLeft(e.if, left)); if (!b) break; ch = b.to; } return ch; };
  const map = src.map.map(row => [...row].map(settled).join(''));
  const used = new Set(map.join('')), keep = {};
  for (const ch of used){
    const t = legend[ch]; if (!t) continue;
    keep[ch] = Object.fromEntries(Object.entries(t).filter(([k]) => BORROW_KEEPS.includes(k)));
    if (t.wild || (t.animals && own.wild)) keep[ch].wild = own.wild || [];   // (and in the long grass where animals hid there)
    if (t.animals && AREA.pastAnimals) keep[ch].animals = 'past';   // (where that area's animals hid, they hide again: only those, PAST_ANIMALS)
    if (t.pick){ const {if:c, ...pick} = t.pick; if (wasLeft(c, left)) keep[ch].pick = pick; else delete keep[ch].pick; }   // (fruit to pick, if there was at the end)
    if (t.action === 'sign') Object.assign(keep[ch], {action:'sign', sign:t.sign || from.sign});   // (writing, such as the cave's tablet: its own, or that area's sign)
    const looks = looksKept(t, left, from); if (looks) keep[ch].onLook = looks;   // (what it is, or the view from it)
  }
  for (const [x, y, ch] of own.put || []) map[y] = [...map[y]].map((c, i) => i === x ? ch : c).join('');   // (squares of its own: put, [x, y, letter]; what was there kept in its legend, to become again)
  const exits = (src.exits || []).filter(e => idHere(e.to) && wasLeft(e.if, left) && wasLeft(e.when, left)).map(({if:_, when:__, ...e}) => ({...e, to:idHere(e.to)}));
  const {borrow, from:_f, wild, put:_p, ...rest} = own;
  return {name:src.name, music:src.music, gloom:src.gloom, battleMusic:src.battleMusic, backdrop:src.backdrop, sounds:(src.sounds || []).filter(s => typeof s === 'string' || !s.if),
    ...rest, legend:{...keep, ...(own.legend || {})}, exits:[...exits, ...(own.exits || [])], map, borrowed:{from:own.from, id:own.borrow}};
}
for (const [id, p] of Object.entries(AREA.places)) if (p.borrow) AREA.places[id] = borrowPlace(p, AREA.places);
// An earlier area's animals at home here, in its borrowed places (AREA.pastAnimals: from its chapter; decided 9 November
// 2026, the trade plan: anything you missed there can still be found later in the story, such as Flower Fruit Mountain's
// in the human world's chapter 2): each one standing at its spot or hiding in its long grass as it did, its places those
// here (hiding anywhere: in any borrowed place's), but never one of a kind that's many, one that leaves its spot, one that
// sleeps somewhere else, one of a group, one the story wakes, nor one with this area's own id.
const PAST_ANIMALS = (() => {
  const P = AREA.pastAnimals; if (!P) return [];
  const mine = new Set([...AREA.animals.map(a => a.id), ...AREA.characters.map(c => c.id)]), out = [];
  for (const A of AREAS.filter(a => a.number < AREA.number)) for (const a of A.animals || []){
    if (a.many || a.leaves || a.sleepsAt || a.stopsYou || a.group || a.awake || a.waits || mine.has(a.id)) continue;
    const there = p => (Array.isArray(p) ? p[2] : p) || Object.keys(A.places)[0];
    const here = id => Object.keys(AREA.places).find(k => (AREA.places[k].borrowed || {}).from === A.number && AREA.places[k].borrowed.id === id);
    const at = a.at ? here(there(a.at)) : null, hides = a.hides ? here(a.hides) : null;
    if ((a.at && !at) || (a.hides && !hides)) continue;
    out.push({...a, chapter:P.chapter, past:true, at:a.at ? [a.at[0], a.at[1], at] : null, hides, roams:(a.roams || []).map(here).filter(Boolean)});
  }
  return out;
})();
// The area's places, small maps you move between, and the one you're in. A position in the content is
// in the first place unless it says another: [x, y, 'place'], or place:'id' (placeOf gives which).
const PLACES = AREA.places, FIRST_PLACE = Object.keys(PLACES)[0];
const placeOf = p => (Array.isArray(p) ? p[2] : p && p.place) || FIRST_PLACE;
let PLACE = null, MAP = [], COLS = 0, ROWS = 0;   // the place you're in, and its map (see setPlace)
let LEGEND = AREA.legend;             // what each map letter is: the area's legend, and the place's own if it has one (setPlace)
const REQUESTS = Object.entries(AREA.requests).map(([id, r]) => ({id, ...r}));   // characters asking you to bring something
const requestFrom = who => REQUESTS.find(r => r.from === who);
// Something that comes in colours, in the shop or your wardrobe (colours: the colour words it comes in; colour: its own, the
// colour of its word's picture), such as a headband: each colour a thing of its own, named as the content writes a few
// words, 蓝色 的 头带 (a blue headband), and in its own colour just its word (头带: the red one, as a save has always called
// it). Each: item (that name), word (头带) and colour.
function inColours(i){
  if (!i.colours) return [{...i, word:i.item}];
  return i.colours.map(c => ({...i, word:i.item, colour:c, item:c === i.colour ? i.item : `${c} 的 ${i.item}`}));
}
const CLOTHES = (AREA.wardrobe || []).flatMap(inColours);   // everything you could wear (the wardrobe's), in each of its colours
const ALL_NPCS = AREA.characters.map(c => ({id:c.id, place:placeOf(c), x:c.x, y:c.y, dir:c.facing, kind:c.id, label:c.label, look:c.look, word:c.word, flies:!!c.flies, small:!!c.small && !c.person,   // (small: a little one, such as a baby monkey or a calf, drawn smaller: js/draw.js)
  colour:c.colour, pecks:!!c.pecks, shoo:c.shoo, scuttles:!!c.scuttles, cart:!!c.cart,   // (scuttles: sideways, as a crab does: scuttle, js/world.js; cart: a cart, drawCart in js/havoc.js)
     // (a bird: its colour; pecking at its square; what you're told as you shoo it off: shooAway, js/world.js)
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
