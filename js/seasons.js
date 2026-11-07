// The seasons (Area 2, chapter 1: the master's year, decided 7 November 2026 from the plan and its mock-ups): you live a
// whole year at the immortal's cave, spring, summer, autumn and winter, each with its own look, its own weather and its
// own things to do, then seven years go by. While the area's seasons say (seasons.if), its places are in the season
// kept in its progress (seasons.key: 0 spring, 1 summer, 2 autumn, 3 winter), each place drawn as usual, then its colours
// changed for the season, as the mock-ups were made: the ground (seasonal: each kind of ground has its own way of
// changing, so a thing standing on it, such as a chopping block, keeps its own colours), and each big object on its own
// picture (seasonObject: a pine keeps its needles under the snow, a willow loses its leaves, a roof takes the snow).
// Summer is the look as drawn. A place borrowed from an area before (Flower Fruit Mountain's, in chapter 2) is in its own
// season, the seasons' home ({if, season}: home in autumn, decided 7 November 2026, so it feels different from Area 1).
// (Loaded after js/havoc.js: it wraps the grounds the other looks draw, and adds to OBJECT_ART and LOOKS.)

const SEASON_NAMES = ['spring', 'summer', 'autumn', 'winter'];
function seasonNow(){   // the season the place you're in is in, or null for none
  const s = AREA.seasons, p = PLACES[PLACE] || {};
  if (!s || p.noSeason || !S || !here()) return null;
  if (p.borrowed) return s.home && matches(s.home.if) ? s.home.season : null;   // (home, in its own season)
  if (!matches(s.if)) return null;
  return SEASON_NAMES[here()[s.key] || 0] || null;
}
const seasonLook = () => { const s = seasonNow(); return s === 'summer' ? null : s; };   // the colours to change to (none in summer)
let drawSeason = null;   // the season the map is being drawn in, set as it's drawn (buildMap, js/art.js)

/* ---- changing colours ---- */
const toHsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn){ const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60; }
  return [h, s, l]; };
const fromHsl = (h, s, l) => { h = ((h % 360) + 360) % 360 / 360; s = clamp(s, 0, 1); l = clamp(l, 0, 1);
  if (!s){ const v = Math.round(l * 255); return (v << 16) | (v << 8) | v; }
  const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, f = t => { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1/6 ? p + (q - p) * 6 * t : t < 1/2 ? q : t < 2/3 ? p + (q - p) * (2/3 - t) * 6 : p; };
  return (Math.round(f(h + 1/3) * 255) << 16) | (Math.round(f(h) * 255) << 8) | Math.round(f(h - 1/3) * 255); };
const greenish = (h, s) => h >= 62 && h <= 175 && s > .12;
const isWet = (h, s) => h > 175 && h < 228 && s > .2;
const isRipe = (h, s, l) => (h < 22 || h > 325) && s > .4 && l > .45;   // a peach or an apple among the leaves
const KEEP = -1, GONE = -2;   // (a colour that stays as it is; one that goes, see-through)
// smooth noise, for patches (of trodden snow, say), 0 to 1
const noiseAt = (x, y, g, k) => { const gx = Math.floor(x / g), gy = Math.floor(y / g), fx = x / g - gx, fy = y / g - gy;
  const top = rnd(gx, gy, k) * (1 - fx) + rnd(gx + 1, gy, k) * fx, bot = rnd(gx, gy + 1, k) * (1 - fx) + rnd(gx + 1, gy + 1, k) * fx; return top * (1 - fy) + bot * fy; };
const SNOW = (l, top = .8) => fromHsl(206, .2, clamp(top + l * .18, 0, .97));
// (a patch, its edge broken up a little, so it melts into the snow round it rather than ending in a hard line)
const patchy = (x, y, g, k, t) => { const n = noiseAt(x, y, g, k); return n > t || (n > t - .06 && rnd(x, y, k + 1) < (n - t + .06) / .06); };
const LEAF_FALL = [0xE08A3A, 0xC8502A, 0xF0C050];
const PETALS = [0xF7B9CB, 0xFFE3EC, 0xFFFFFF];
// Autumn's gold, for anything green and growing: one gold for the grass, a path's grassy edges, and at home the long
// grass, the grass at a cliff's lip and foot and the tufts on the rock, so where one square's grass runs on into the
// next, such as over the top of a cliff, there's no seam; and the leaves fallen on it.
const AUTUMN_GOLD = (h, s, l) => greenish(h, s) ? fromHsl(50 - (1 - l) * 14, .42, l * .96) : KEEP;
const FALLEN = (c, x, y) => rnd(x >> 1, y >> 1, 3) > .986 ? LEAF_FALL[Math.floor(rnd(x, y, 4) * 3)] : c;
// Each kind of ground, each season: base(h, s, l) gives its new colour (KEEP or GONE), the same for every pixel of that
// colour; at(colour, x, y) can change one pixel by where it is (map pixels), such as a flower dotted on the grass.
const GROUND_RULES = {
  spring: {
    green: {base:(h, s, l) => greenish(h, s) ? fromHsl(h - 10, s * 1.12, l * 1.05) : KEEP,
      at:(c, x, y, l) => l > .45 && rnd(x, y, 7) > .994 ? PETALS[Math.floor(rnd(x, y, 8) * 3)] : c},   // (little flowers in the grass)
    field: {base:(h, s, l) => greenish(h, s) ? fromHsl(h - 8, s * 1.15, l * 1.06) : KEEP}
  },
  autumn: {
    green: {base:AUTUMN_GOLD, at:FALLEN},   // (fallen leaves)
    field: {base:(h, s, l) => greenish(h, s) ? fromHsl(44, .6, clamp(l * 1.05, 0, .75)) : KEEP},   // (ripe rice, gold)
    swept: {base:() => KEEP, at:(c, x, y) => rnd(x, y, 5) > .993 ? LEAF_FALL[Math.floor(rnd(x, y, 6) * 3)] : c},
    earth: {base:AUTUMN_GOLD, at:(c, x, y) => rnd(x, y, 5) > .991 ? LEAF_FALL[Math.floor(rnd(x, y, 6) * 3)] : c}   // (a path's grassy edges, gold as the grass)
  },
  winter: {
    green: {base:(h, s, l) => SNOW(l)},   // snow, its shading kept
    field: {base:(h, s, l) => l < .38 ? fromHsl(30, .14, clamp(.56 + l * .4, 0, .78)) : SNOW(l, .84)},   // stubble and furrows, faint under the snow
    earth: {base:(h, s, l) => SNOW(l, .8), at:(c, x, y, l) => patchy(x, y, 6, 13, .76) ? fromHsl(32, .12, clamp(.66 + l * .14, 0, .82)) : c},   // trodden, the earth showing in patches
    sand: {base:(h, s, l) => SNOW(l, .84), at:(c, x, y, l) => patchy(x, y, 7, 17, .8) ? fromHsl(40, .18, clamp(.74 + l * .14, 0, .88)) : c},   // a little sand showing through
    swept: {base:(h, s, l) => fromHsl(212, s * .35 + .04, clamp(l + (.92 - l) * .28, 0, .95))},   // swept clear, cold and pale
    water: {base:(h, s, l) => isWet(h, s) ? fromHsl(h + (205 - h) * .3, s * .8, l * .96) : KEEP},
    rockTop: {base:(h, s, l) => l > .56 ? fromHsl(210, .12, clamp(.88 + l * .1, 0, .98)) : fromHsl(210, s * .5, clamp(l * 1.06, 0, .9))},
    face: {base:(h, s, l) => greenish(h, s) ? SNOW(l, .78) : fromHsl(210, s * .55, clamp(l + (.9 - l) * .12, 0, .95))},
    wood: {base:(h, s, l) => fromHsl(h, s * .8, clamp(l + (.9 - l) * .1, 0, .95))}
  }
};
// At home in its own season (a place borrowed from an area before: the seasons' home), everything green and growing
// turns, not only the ground between: the long grass, bushes and flowers, the grass at a cliff's lip and foot and hanging
// over it, the tufts on the rock (and the lichen on the lookout's stone), and the grass round the top of the steps
// (decided 7 November 2026, after playing it: green edges on the golden grass). Only at home, so the master's year
// looks as it was.
const HOME_RULES = {
  autumn: {
    plant: {base:AUTUMN_GOLD, at:FALLEN},
    face: {base:AUTUMN_GOLD, at:(c, x, y) => c === KEEP ? c : FALLEN(c, x, y)},   // (leaves on its grass, never on the rock)
    rockTop: {base:AUTUMN_GOLD},
    swept: {base:AUTUMN_GOLD, at:GROUND_RULES.autumn.swept.at}
  }
};
// The rule for a kind of ground, in the season the map's being drawn in (none: as drawn).
const groundRule = kind => drawSeason && (((PLACES[PLACE] || {}).borrowed && (HOME_RULES[drawSeason] || {})[kind]) || (GROUND_RULES[drawSeason] || {})[kind]);
// Each kind of big object, each season.
const OBJECT_RULES = {
  spring: {
    evergreen: {base:(h, s, l) => greenish(h, s) ? fromHsl(h - 6, s * 1.05, l * 1.03) : KEEP},
    deciduous: {base:(h, s, l) => greenish(h, s) ? fromHsl(h - 10, s * 1.12, l * 1.05) : KEEP},
    willow: {base:(h, s, l) => greenish(h, s) ? fromHsl(h - 16, s * 1.2, clamp(l * 1.1, 0, .82)) : KEEP}
  },
  autumn: {
    evergreen: {base:(h, s, l) => greenish(h, s) ? fromHsl(h - 6, s * .85, l * .95) : KEEP},
    deciduous: {base:(h, s, l) => greenish(h, s) ? fromHsl(8 + l * 40, .78, clamp(l * 1.02, .22, .7)) : isRipe(h, s, l) ? GONE : KEEP,
      at:(c, x, y) => c !== KEEP && c !== GONE && rnd(x >> 1, y >> 1, 9) < .14 ? GONE : c, leafy:true},
    willow: {base:(h, s, l) => greenish(h, s) ? fromHsl(46, .55, clamp(l * 1.05, .25, .72)) : KEEP}
  },
  winter: {
    evergreen: {base:(h, s, l) => greenish(h, s) ? fromHsl(h, s * .5, l * .84) : KEEP, layers:true},   // dull in the cold, snow on each layer of its needles
    deciduous: {base:(h, s, l) => greenish(h, s) || isRipe(h, s, l) ? GONE : KEEP},   // bare
    willow: {base:(h, s, l) => greenish(h, s) ? fromHsl(44, .38, clamp(l * .9, .25, .62)) : KEEP, at:(c, x, y) => c !== KEEP && rnd(x, y, 21) < .45 ? GONE : c},   // bare twigs
    building: {base:() => KEEP, roof:true},
    thing: {base:() => KEEP}
  }
};
const OBJECT_KIND = {pine:'evergreen', twistedPine:'evergreen', oldTree:'evergreen', bamboo:'evergreen', bambooFence:'evergreen', ashPine:'evergreen',
  willow:'willow', tree:'deciduous', peachTree:'deciduous', appleTree:'deciduous', bush:'deciduous', hollowTree:'deciduous',
  jHouse:'building', mudHouse:'building', teahouse:'building', townSchool:'building', whiteWall:'building', wallGate:'building', stallBuns:'building',
  stallShoes:'building', stallFruit:'building', stallChanger:'building', stallKites:'building', shopHut:'building',
  rockPeach:'own', myTree:'own', myTreeWrapped:'own', snowman:'own', brazier:'own'};   // ('own': drawn for the season by its own picture)

// The colours of the pixels in g's box [x, y, w, h] (ox, oy: where its top left is on the map), changed by rule.
const caches = new Map();
function recolourBox(g, [bx, by, w, h], rule, key, ox = bx, oy = by){
  if (w <= 0 || h <= 0) return;
  let cache = caches.get(key); if (!cache) caches.set(key, cache = new Map());
  const img = g.getImageData(bx, by, w, h), d = img.data;
  for (let i = 0, n = 0; i < d.length; i += 4, n++){
    if (d[i + 3] < 8) continue;
    const rgb = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    let c = cache.get(rgb), l = -1;
    if (c === undefined){ const hsl = toHsl(d[i], d[i + 1], d[i + 2]); c = rule.base(...hsl); cache.set(rgb, c); }
    if (rule.at){ if (rule.at.length > 3) l = toHsl(d[i], d[i + 1], d[i + 2])[2]; c = rule.at(c, ox + n % w, oy + Math.floor(n / w), l); }
    if (c === KEEP) continue;
    if (c === GONE){ d[i + 3] = 0; continue; }
    d[i] = c >> 16 & 255; d[i + 1] = c >> 8 & 255; d[i + 2] = c & 255;
  }
  g.putImageData(img, bx, by);
}

/* ---- the ground ---- */
// Each ground the looks draw, wrapped: drawn first on a scratch canvas, its colours changed for the season, then onto
// the map. Only the outermost ground changes (a ground drawing another inside it, such as the pier over the sea, is
// changed once, as the pier). What stands on a ground (a stump on the moss, a stone in the stream) is drawn after it,
// in its own colours. What's dotted about (fallen leaves, flowers, trodden patches) goes by where its square is on the
// map, so it's the same wherever the square's drawn, such as the grass you walk through, on a little canvas of its own.
const SCRATCH = 8;   // (room round the square, for anything that reaches out of it)
const scratch = document.createElement('canvas'); scratch.width = scratch.height = T + 2 * SCRATCH;
const scg = scratch.getContext('2d');
let groundDepth = 0;
function seasonal(fn, kind){
  const wrapped = function(g, X, Y, ...rest){
    const rule = !groundDepth && groundRule(kind);
    if (!rule) return fn(g, X, Y, ...rest);
    groundDepth++;
    try {
      scg.clearRect(0, 0, scratch.width, scratch.height);
      scg.save(); scg.translate(SCRATCH - X, SCRATCH - Y); fn(scg, X, Y, ...rest); scg.restore();
      const [x, y] = rest, mx = typeof x === 'number' ? x*T : X, my = typeof y === 'number' ? y*T : Y;   // (its square, on the map)
      recolourBox(scg, [0, 0, scratch.width, scratch.height], rule, rule, mx - SCRATCH, my - SCRATCH);
      g.drawImage(scratch, X - SCRATCH, Y - SCRATCH);
    } finally { groundDepth--; }
  };
  wrapped.unwrapped = fn;
  return wrapped;
}
const GROUND_KIND = {grass:'green', tall:'green', lawn:'green', mossStone:'green', path:'earth', earth:'earth', sand:'sand', paving:'swept', slab:'swept',
  pier:'swept', stoneSteps:'swept', veg:'field', rice:'field', canal:'water', waterBase:'water', seaBase:'water', heights:'rockTop', karstTop:'rockTop',
  slabs:'rockTop', cliffFace:'face', karstFace:'face', chainFace:'face', planks:'wood', loosePlank:'wood',
  longGrass:'plant', tallGrass:'plant', woodGrass:'plant', bush:'plant', bank:'plant', fern:'plant', mushrooms:'plant', hoofprints:'plant', grassPlot:'plant', melonVines:'plant',
  tallFlowers:'plant', whiteFlowers:'plant', yellowFlowers:'plant', redFlowers:'plant', pinkFlowers:'plant', blueFlowers:'plant', orangeFlowers:'plant',
  flowerBed:'plant', colourBed:'plant'};   // ('plant': changes only at home, HOME_RULES)
(function wrapGrounds(){
  const tables = [LOOKS, GROUNDS, GROUND_UNDER];
  for (const [name, kind] of Object.entries(GROUND_KIND)){
    const fn = typeof globalThis[name] === 'function' ? globalThis[name] : LOOKS[name];   // (a look by its name, or only in LOOKS)
    if (typeof fn !== 'function') continue;
    const w = seasonal(fn, kind);
    if (globalThis[name] === fn) globalThis[name] = w;   // (so a look that draws it by its name, such as a stump on its ground, gets it for the season)
    for (const t of tables) for (const k of Object.keys(t)) if (t[k] === fn) t[k] = w;
  }
})();
// Where snow lies on the ground (and footprints show in it), in winter: not on paving swept clear, nor bridges, planks or water.
const NO_SNOW = new Set(['paving', 'slab', 'pier', 'plankH', 'plankV', 'windPlank', 'loosePlank', 'steps', 'hopStone', 'archBridge', 'bridge', 'leafPile']);
const snowyAt = (x, y) => { const t = tileAt(x, y); return drawSeason === 'winter' && !!t.walk && !NO_SNOW.has(t.look) && !WATERY.includes(t.look); };

/* ---- big objects ---- */
// A big object's picture for the season (under: with its shadow, for what goes under the characters), drawn once, on a
// canvas as big as its piece (pieceOf, js/art.js), its colours changed by its kind; in winter, snow on everything's top
// edges (snowCaps), on each layer of an evergreen's needles, and on roofs.
function seasonObject(p, under){
  const kind = OBJECT_KIND[p.look] || 'thing', rule = (OBJECT_RULES[drawSeason] || {})[kind];
  const c = document.createElement('canvas'); c.width = p.pw; c.height = p.ph;
  const g = c.getContext('2d'); g.translate(-p.x0, -p.y0);
  shadows = under; OBJECT_ART[p.look](g, p); shadows = true;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (kind === 'own') return c;
  if (rule) recolourBox(g, [0, 0, p.pw, p.ph], rule, `${drawSeason}:${kind}`, p.x0, p.y0);
  if (drawSeason === 'winter'){
    if (rule && rule.layers) snowOnLayers(g, p.pw, p.ph);
    if (rule && rule.roof) snowOnRoof(g, p);
    snowCaps(g, p.pw, p.ph);
  }
  return c;
}
const solid = a => a > 200;
// Snow along the top of everything: a pixel with nothing over it turns white, the one under it pale.
function snowCaps(g, w, h){
  const img = g.getImageData(0, 0, w, h), d = img.data, caps = [];
  for (let y = 1; y < h; y++) for (let x = 0; x < w; x++){ const i = (y * w + x) * 4; if (solid(d[i + 3]) && !solid(d[i + 3 - w * 4])) caps.push(i); }
  for (const i of caps){
    d[i] = 244; d[i + 1] = 248; d[i + 2] = 252;
    const j = i + w * 4; if (j < d.length && solid(d[j + 3])){ d[j] = Math.round(d[j] * .35 + 224 * .65); d[j + 1] = Math.round(d[j + 1] * .35 + 231 * .65); d[j + 2] = Math.round(d[j + 2] * .35 + 239 * .65); }
  }
  g.putImageData(img, 0, 0);
}
// Snow on each layer of leaves or needles: where a green pixel has something darker over it, or nothing.
function snowOnLayers(g, w, h){
  const img = g.getImageData(0, 0, w, h), d = img.data, snow = [];
  const at = i => toHsl(d[i], d[i + 1], d[i + 2]), leaf = i => solid(d[i + 3]) && greenish(...at(i).slice(0, 2)) || (solid(d[i + 3]) && at(i)[0] > 60 && at(i)[0] < 180 && at(i)[1] > .05);
  for (let y = 1; y < h; y++) for (let x = 0; x < w; x++){
    const i = (y * w + x) * 4, u = i - w * 4;
    if (!leaf(i)) continue;
    if (!solid(d[u + 3]) || at(u)[2] < at(i)[2] - .06) snow.push(i);
  }
  for (const i of snow){ d[i] = 240; d[i + 1] = 245; d[i + 2] = 250; }
  g.putImageData(img, 0, 0);
}
// Snow on a roof: the top of the building's picture, but its darkest lines, blended towards white, most at the top.
function snowOnRoof(g, p){
  const top = Math.round(p.ph * .44), img = g.getImageData(0, 0, p.pw, top), d = img.data;
  for (let i = 0; i < d.length; i += 4){
    if (!solid(d[i + 3]) || toHsl(d[i], d[i + 1], d[i + 2])[2] < .2) continue;
    const y = Math.floor(i / 4 / p.pw), k = .8 - y / top * .32;
    d[i] = Math.round(d[i] * (1 - k) + 240 * k); d[i + 1] = Math.round(d[i + 1] * (1 - k) + 244 * k); d[i + 2] = Math.round(d[i + 2] * (1 - k) + 250 * k);
  }
  g.putImageData(img, 0, 0);
}

/* ---- the peach trees, and the saplings, by season ---- */
// The cave's peach trees: in blossom in spring, green with peaches in summer, gold in autumn, bare and snowy in winter.
const BLOSSOM = ['#8E3A55', '#D86F92', '#F2A0BA', '#FFD0DE', '#FFF2F6'], AUTUMN_LEAF = ['#5A2A14', '#A4461E', '#D06A2A', '#EDA04A', '#F7C873'];
function withLeaves(cols, draw){ const was = [...LEAF]; cols.forEach((c, i) => { LEAF[i] = c; }); try { draw(); } finally { was.forEach((c, i) => { LEAF[i] = c; }); } }
function bareBranches(g, bx, by, size = 1, snow = true){   // a bare tree's twigs, from its trunk's top (bx, by), snow along each
  const pts = new Set(), line = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) pts.add(Math.round(x0 + (x1 - x0) * i / n) + ',' + Math.round(y0 + (y1 - y0) * i / n)); };
  const s = size;
  line(bx, by, bx - 7 * s, by - 9 * s); line(bx, by, bx + 7 * s, by - 10 * s); line(bx, by, bx + s, by - 13 * s);
  line(bx - 4 * s, by - 5 * s, bx - 10 * s, by - 6 * s); line(bx + 4 * s, by - 6 * s, bx + 10 * s, by - 4 * s); line(bx - 5 * s, by - 7 * s, bx - 4 * s, by - 12 * s); line(bx + 5 * s, by - 8 * s, bx + 7 * s, by - 13 * s);
  for (const k of pts){ const [x, y] = k.split(',').map(Number); R(g, x, y, 1, 1, y > by - 6 * s ? WOOD[0] : WOOD[1]); }
  if (snow) for (const k of pts){ const [x, y] = k.split(',').map(Number); if (!pts.has(x + ',' + (y - 1))) R(g, x, y - 1, 1, 1, '#F4F8FC'); }
}
function peachInSeason(g, o, season){
  const X = o.x*T, Y = o.y*T;
  if (season === 'winter'){   // bare, snow on its twigs, and on the ground round it
    groundShadow(g, X+8, Y+14, 10, 2); trunk(g, X+6, Y+6, 4, 9); R(g, X+5, Y+5, 6, 1, '#F4F8FC');
    bareBranches(g, X+8, Y+6, 1);
    return;
  }
  if (season === 'spring'){
    withLeaves(BLOSSOM, () => { groundShadow(g, X+8, Y+14, 10, 2); trunk(g, X+6, Y+6, 4, 9); limbs(g, [[X+7, Y+6, X+2, Y+1, 1], [X+9, Y+6, X+14, Y+1, 1]]);
      cloudLeaves(g, [[8, 4, 11, 4], [3, -2, 6, 3], [13, -2, 6, 3], [8, -7, 7, 3]], X, Y, o.x*31 + o.y); });
    for (const [cx, cy] of [[2, 3], [12, -3], [7, 6], [15, 2], [4, -5]]) R(g, X+cx, Y+cy, 2, 1, '#6FAE57');   // a few new leaves
    return;
  }
  if (season === 'autumn'){
    withLeaves(AUTUMN_LEAF, () => { groundShadow(g, X+8, Y+14, 10, 2); trunk(g, X+6, Y+6, 4, 9); limbs(g, [[X+7, Y+6, X+2, Y+1, 1], [X+9, Y+6, X+14, Y+1, 1]]);
      cloudLeaves(g, [[8, 4, 10, 4], [3, -2, 5, 3], [13, -1, 5, 3], [8, -6, 6, 3]], X, Y, o.x*31 + o.y); });
    return;
  }
  OBJECT_ART.peachTree(g, o);   // summer: green, full of peaches
}
OBJECT_ART.rockPeach = (g, o) => peachInSeason(g, o, drawSeason);
// A young peach tree, newly planted (the cave's saplings), by season.
const saplingSummer = LOOKS.sapling;
LOOKS.sapling = (g, X, Y, x, y) => {
  if (!drawSeason) return saplingSummer(g, X, Y, x, y);
  mossStone(g, X, Y, x, y);
  oval(g, X + 8, Y + 14, 4, 1, 'rgba(30,45,25,.28)'); R(g, X + 7, Y + 6, 2, 8, '#6B4A2A');
  if (drawSeason === 'winter'){ for (const [x0, y0, x1, y1] of [[8, 7, 5, 4], [8, 6, 11, 3], [8, 6, 8, 2]]){ R(g, X + Math.min(x0, x1), Y + Math.min(y0, y1), Math.abs(x1 - x0) || 1, 1, '#6B4A2A'); } R(g, X + 7, Y + 5, 2, 1, '#F4F8FC'); return; }
  const col = drawSeason === 'spring' ? ['#F2A0BA', '#FFD0DE'] : ['#D06A2A', '#EDA04A'];
  for (const [dx, dy] of [[-3, 0], [3, -1], [-2, -3], [2, -4], [0, -5]]){ oval(g, X + 8 + dx, Y + 7 + dy, 2, 1, col[0]); R(g, X + 7 + dx, Y + 6 + dy, 2, 1, col[1]); }
};

// Your own little peach tree (the master's year: planted and watered in spring), as it grows: just planted in spring, a
// few blossoms and leaves on a thin stem, fresh earth round it; taller in summer, a small crown of leaves; gold in autumn,
// its first leaves falling; bare in winter, snow on its twigs, and once you've wrapped it (myTreeWrapped), straw bound round
// its trunk against the frost; and seven years on, a big tree, full of peaches.
function myTree(g, o){
  const X = o.x*T, Y = o.y*T, p = here(), wrapped = o.look === 'myTreeWrapped';
  if (p.grown) return OBJECT_ART.peachTree(g, o);
  const season = p.season || 0, earth = () => { oval(g, X+8, Y+14, 5, 1, '#5A4030'); oval(g, X+8, Y+14, 3, 1, '#6E5038'); };
  if (season === 0){
    earth(); R(g, X+7, Y+5, 2, 9, WOOD[1]); R(g, X+7, Y+5, 1, 9, WOOD[2]);
    limbs(g, [[X+8, Y+8, X+4, Y+5, 1], [X+8, Y+7, X+12, Y+4, 1]]);
    for (const [dx, dy, c] of [[-4, -4, 'p'], [4, -5, 'p'], [0, -6, 'p'], [-2, -1, 'g'], [3, -2, 'g'], [1, -4, 'p']]){
      if (c === 'p'){ R(g, X+8+dx-1, Y+9+dy, 3, 1, '#F2A0BA'); R(g, X+8+dx, Y+8+dy, 1, 3, '#F2A0BA'); dot(g, X+8+dx, Y+9+dy, '#FFE3EC'); }
      else { R(g, X+8+dx, Y+9+dy, 2, 1, '#5E9E44'); dot(g, X+8+dx, Y+9+dy, '#8BC46A'); }
    }
    return;
  }
  groundShadow(g, X+8, Y+14, 6, 2);
  trunk(g, X+7, Y+3, 2, 12);
  if (season === 3){
    bareBranches(g, X+8, Y+4, .55);
    if (wrapped) for (let y = Y+7; y <= Y+13; y++){ R(g, X+6, y, 4, 1, (y - Y) % 2 ? '#D9B866' : '#B8963E'); dot(g, X+5 + ((y - Y) % 3 ? 0 : 5), y, '#A88A3E'); }   // straw, bound round its trunk
    return;
  }
  withLeaves(season === 2 ? AUTUMN_LEAF : LEAF, () => {
    limbs(g, [[X+8, Y+5, X+4, Y+1, 1], [X+8, Y+4, X+12, Y+1, 1]]);
    cloudLeaves(g, [[8, 2, 6, 3], [5, -2, 4, 2], [11, -2, 4, 2]], X, Y, o.x*31 + o.y);
  });
  if (season === 2) for (const [dx, dy, c] of [[-5, 13, '#D06A2A'], [4, 14, '#EDA04A'], [6, 12, '#A4461E']]) R(g, X+8+dx, Y+dy, 2, 1, c);   // its first leaves, fallen
}
OBJECT_ART.myTree = myTree; OBJECT_ART.myTreeWrapped = myTree;
Object.assign(LOOKS, {myTree:LOOKS.mossStone, myTreeWrapped:LOOKS.mossStone});

/* ---- the weather ---- */
// Over everything, each frame (drawWorld, js/draw.js): what falls in the season (petals, leaves, snow), drifting with
// the world as you walk (rain, now and then, is the day's: js/daynight.js); and in the evening (seasons.evening), the
// light turning to evening, and the first sign of the season to come falling here and there, such as the first
// snowflakes in autumn. In autumn at home (the seasons' home, chapter 2), and indoors, nothing falls indoors.
const FALLING = {
  spring: {n:26, speed:10, sway:9, draw:(x, y, i) => R(b, x, y, 2, 1, i % 3 ? '#F7B9CB' : '#FFE3EC')},
  autumn: {n:24, speed:12, sway:8, draw:(x, y, i) => { const c = ['#E08A3A', '#C8502A', '#F0C050'][i % 3]; R(b, x, y, 2, 1, c); R(b, x + (i % 2), y + 1, 1, 1, c); }},
  winter: {n:70, speed:14, sway:4, draw:(x, y, i) => { b.globalAlpha = .9; R(b, x, y, i % 4 ? 1 : 2, i % 4 ? 1 : 2, '#FFFFFF'); b.globalAlpha = 1; }}
};
const NEXT = {spring:'summer', summer:'autumn', autumn:'winter'};
function fallOver(f, n, cx, cy, sh, now){
  const W = VW*T, H = sh;
  for (let i = 0; i < n; i++){
    const sp = f.speed * (.6 + rnd(i, 1, 970) * .8);
    const x = ((rnd(i, 2, 971) * (W + 40) + Math.sin(now / 700 + i) * f.sway - cx) % (W + 40) + W + 40) % (W + 40) - 20;
    const y = ((rnd(i, 3, 972) * (H + 40) + now / 1000 * sp - cy) % (H + 40) + H + 40) % (H + 40) - 20;
    f.draw(Math.round(x), Math.round(y), i);
  }
}
function drawWeather(cx, cy, sh, now){
  const s = seasonNow(); if (!s || (PLACES[PLACE] || {}).indoors) return;
  const W = VW*T, evening = !!(AREA.seasons.evening && matches(AREA.seasons.evening));
  if (FALLING[s]) fallOver(FALLING[s], evening && s === 'spring' ? 10 : FALLING[s].n, cx, cy, sh, now);
  if (evening){
    b.globalAlpha = .2; R(b, 0, 0, W, sh, '#FF8A3C'); b.globalAlpha = .12; R(b, 0, 0, W, sh, '#4A2A6A'); b.globalAlpha = 1;
    const next = FALLING[NEXT[s]];
    if (next) fallOver(next, s === 'autumn' ? 22 : 8, cx + 37, cy + 11, sh, now);   // (the first of what's to come)
  }
}

/* ---- footprints in the snow ---- */
// Walking through snow leaves your footprints behind you, a pair a step, filling in again as the snow falls on them: they
// fade by the time since you made them, not by the steps you've taken (decided 7 November 2026).
const PRINT_MS = 4500;
const prints = [];
let printMv = null;
function drawFootprints(cx, cy, now){
  if (drawSeason !== 'winter'){ prints.length = 0; return; }
  const m = pl.mv;
  if (m && m !== printMv && !m.slip){
    printMv = m;
    if (snowyAt(m.fx, m.fy)){
      const [dx, dy] = DV[pl.dir] || [0, 1], d = m.dur || STEP;
      prints.push({px:m.fx * T + 8 + dx * 2, py:m.fy * T + 13 + dy * 2, dir:pl.dir, foot:pl.parity, t:now, place:PLACE});
      prints.push({px:m.fx * T + 8 + dx * 9, py:m.fy * T + 13 + dy * 9, dir:pl.dir, foot:pl.parity ^ 1, t:now + d / 2, place:PLACE});
    }
  }
  while (prints.length && (now - prints[0].t > PRINT_MS || prints[0].place !== PLACE)) prints.shift();
  for (const p of prints){
    const age = now - p.t; if (age < 0) continue;
    const side = p.dir === 'up' || p.dir === 'down' ? [p.foot ? 2 : -2, 0] : [0, p.foot ? 1 : -1];
    const X = Math.round(p.px + side[0] - cx), Y = Math.round(p.py + side[1] - cy);
    b.globalAlpha = .5 * (1 - age / PRINT_MS);
    R(b, X - 1, Y - 1, 2, 2, '#8796AB'); R(b, X - 1, Y - 2, 1, 1, '#A3B0C2'); R(b, X, Y - 2, 1, 1, '#A3B0C2');
    b.globalAlpha = 1;
  }
}

/* ---- the scene between two seasons ---- */
// The night between two seasons, as you sleep (a scene with art 'seasonTurn', def.from and def.to): the courtyard, the
// hall and two peach trees, in one season and then, little by little, the next.
const SCENE_SEASON = {
  spring: {sky:'#A8D4F0', ground:'#A3B98A', yard:'#B9B4A8', fall:FALLING.spring},
  summer: {sky:'#7FB8E6', ground:'#8FAE70', yard:'#B3ADA2'},
  autumn: {sky:'#D6C49E', ground:'#B8A06A', yard:'#B8B0A0', fall:FALLING.autumn},
  winter: {sky:'#D8DEE4', ground:'#E8ECEE', yard:'#D2D6DA', fall:FALLING.winter}
};
const sceneCanvas = document.createElement('canvas');
function drawCourtyard(g, season, now){
  const W = VW*T, H = VH*T, s = SCENE_SEASON[season], was = drawSeason;
  R(g, 0, 0, W, 40, s.sky);
  drawSeason = season === 'summer' ? null : season;
  try {
    for (let x = 0; x < W; x += T){ karstFace(g, x, 40, 3, 1); karstFace(g, x, 56, 3, 2); }
    R(g, 0, 72, W, H - 72, s.ground); R(g, 64, 72, W - 64, H - 72, s.yard);
    for (let y = 72; y < H; y += 8) for (let x = 64 + (y / 8) % 2 * 8; x < W; x += 16) R(g, x, y, 15, 7, mix(s.yard, '#FFFFFF', .12));
    jHouse(g, {x:6, y:2, w:5, h:3});
    for (const [tx, ty] of [[1, 6], [1, 8]]) peachInSeason(g, {x:tx, y:ty, w:1, h:1}, season);
  } finally { drawSeason = was; }
}
function drawSeasonTurn(t, now, def){
  const W = VW*T, H = VH*T, k = clamp((t - 2.2) / 2.6, 0, 1);
  if (sceneCanvas.width !== W){ sceneCanvas.width = W; sceneCanvas.height = H; }
  drawCourtyard(b, def.from, now);
  if (k > 0){ const sg = sceneCanvas.getContext('2d'); drawCourtyard(sg, def.to, now); b.globalAlpha = k; b.drawImage(sceneCanvas, 0, 0); b.globalAlpha = 1; }
  const f = SCENE_SEASON[k < .5 ? def.from : def.to].fall;
  if (f) fallOver(f, f.n, 0, 0, H, now);
  const night = clamp(1 - Math.abs(t - 1.2) / 1.6, 0, 1) * .5;   // (night falls, then the morning comes)
  if (night > 0){ b.globalAlpha = night; R(b, 0, 0, W, H, '#0B1024'); b.globalAlpha = 1; }
}
Object.assign(SCENE_ART, {seasonTurn: drawSeasonTurn});
