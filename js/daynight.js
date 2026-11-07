// Day and night, and rain (decided 7 November 2026, the owner's idea: the seasons, the evening and the night were only in
// the master's year, and everywhere else it was always a summer's day). Where the area's dayNight.if matches (Flower
// Fruit Mountain from chapter 1, once the troop has its home in the Water Curtain Cave; the human world always), a clock
// runs while you're out on the map, never in a card, a battle, a scene or a conversation: a day is DAY_MS, about 15
// minutes of day, the light warming towards evening, then about 5 minutes of night, and dawn (S.clock: t, how far into
// today, n, the days gone by, and what you've done today, for the recap at bedtime; an old game starts in the morning).
// At night it's dark blue, a tint you can still see through on a phone, lamplit windows and fires glowing through it, the
// moon and stars over the places outdoors, and fireflies on Flower Fruit Mountain; the troop sleeps in the Water Curtain
// Cave and the human world's streets are quieter (the area's dayNight.sleep: who sleeps where, js/world.js's
// placeCharacters asking nightSpot), but anyone with a ! or ? over them, following you, in a lesson or hiding stays up, and
// someone you're beside never vanishes in front of you (they go to bed once you've gone). Sleeping (the sleep step) skips
// to the next morning, after a recap of the day: the words you caught, the questions you answered and the friends you
// made, with a quick review of the day's words if you like (bedtimeCard). Every so often in the daytime it rains outdoors
// for a minute or two (rainNow: one spell a day, at its own time), never in winter, light or heavy (rainHeavy); the first
// rain teaches 下雨, and the first heavy rain 大雨 (下大雨了！).
// (Loaded after js/snowball.js: it draws over everything js/draw.js and js/seasons.js draw.)

/* ---- the clock ---- */
const DAY_MS = 20 * 60000;                     // a day, on the map
const DUSK = .65, NIGHT = .75, DAWN = .975;    // where in the day evening begins (13 minutes in), night (15) and dawn (19½)
const NIGHT_DARK = .5, INDOOR_DARK = .22;      // how dark it gets at night, outdoors and indoors (a cave, the classroom)
const NIGHT_FADE_MS = 900;                           // someone going to bed or getting up, fading out or in, while you're there
const clockOn = () => !!(AREA.dayNight && S && S.clock && S.areas && S.areas[AREA.number] && matches(AREA.dayNight.if || {}));
const dayFrac = () => ((S.clock.t || 0) % DAY_MS + DAY_MS) % DAY_MS / DAY_MS;
function dayPart(){ if (!clockOn()) return null; const f = dayFrac(); return f < DUSK ? 'day' : f < NIGHT ? 'evening' : f < DAWN ? 'night' : 'dawn'; }
const isNight = () => { const p = dayPart(); return p === 'night' || p === 'dawn'; };   // (who's asleep: from nightfall till the day begins)
const indoors = (id = PLACE) => !!(PLACES[id] || {}).indoors;
function newDay(c = S.clock){ Object.assign(c, {turn0:S.turn || 0, friends0:[...S.friends], caught:[]}); }   // what's done today starts again (the recap)
function noteCaught(w){ if (S.clock && !(S.clock.caught || (S.clock.caught = [])).includes(w)) S.clock.caught.push(w); }   // a word caught today (setSeen, js/state.js)
// The clock runs a frame at a time (update, js/input.js), while you're out on the map; a frame's time at most a quarter
// of a second, so a pause (a card, the page hidden) never jumps it on. It's saved now and then, and whenever the game is.
let clockLast = 0, clockSaved = 0;
function tickClock(now){
  const dt = clockLast ? clamp(now - clockLast, 0, 250) : 0; clockLast = now;
  if (sleepAt){ nightPasses(now); return; }   // (asleep at bedtime: the night going by)
  if (!clockOn() || !modal.hidden || talkNext) return;
  S.clock.t = (S.clock.t || 0) + dt;
  if (S.clock.t >= DAY_MS){ S.clock.t -= DAY_MS; S.clock.n = (S.clock.n || 0) + 1; newDay(); }   // (a new day, without sleeping: today starts again)
  if (Math.abs(S.clock.t - clockSaved) > 30000){ clockSaved = S.clock.t; save(); }
}
// Night falling or the day coming (or rain beginning or stopping), since the world was last placed for it: everyone's
// placed again, those going to bed or getting up fading out or in (nightFall), and the area's events run (the first night
// teaches 晚上, the first rain 下雨). update (js/input.js) asks, whenever you're free to move.
let clockSeen = null, nightFall = false;
function clockNews(){
  const k = (isNight() ? 'n' : 'd') + (rainingHere() ? 'r' : '');
  if (clockSeen === null || k === clockSeen){ clockSeen = k; return false; }
  const was = clockSeen; clockSeen = k;
  if (was[0] !== k[0]){ nightFall = true; try { placeCharacters(); } finally { nightFall = false; } }
  return true;
}

/* ---- who sleeps where ---- */
// The area's dayNight.sleep: a list of {who, if, place, at, stay}. who: 'monkeys' (the troop: no look of an animal's, not
// flying, not a person) or 'people'; if: while it applies; place and at: where they sleep, a spot each ([x, y, facing],
// facing 'bed' for one lying in a bed), the first to go to bed the first spot, and anyone more than its spots elsewhere in
// it, out of sight; with no place, they go indoors, out of sight; stay: those who stay up all the same, such as the night
// market's stallholders.
const isMonkey = c => !c.person && !c.look && !c.flies && !c.cart;
const CHARACTER = new Map(AREA.characters.map(c => [c.id, c]));
const ruleFor = n => { const c = CHARACTER.get(n.id) || {};
  return (AREA.dayNight && AREA.dayNight.sleep || []).find(r => (r.who === 'people' ? !!c.person : isMonkey(c)) && (!r.if || matches(r.if)) && !(r.stay || []).includes(n.id)); };
// Staying up: with a ! or ? over them, something kept for you, in a lesson, hiding, or out of their place for the story
// just now (someone a step has walked somewhere and parked).
const staysUp = n => S.following.includes(n.id) || inClass.has(n.id) || !!keptFor(n) || (AREA.bubbles[n.id] || []).some(b => matches(b.if)) || (HIDE && HIDE.by === n.id) || n.calls > performance.now();
let placedIn = null;   // the place characters were last placed for (placeCharacters): a fresh place puts everyone where they are tonight
const ghosts = [];     // those fading out where they were, as they go to bed or get up while you're there: {n, x, y, dir, asleep, bed, t0}
// Where everyone sleeps tonight (placeCharacters asks once each time it places them): a Map from each sleeper's id to
// {place, x, y, facing, bed} (place 'gone': indoors, or elsewhere in the cave, out of sight). Each rule's spots go to its
// characters in the content's order, whether they're up or not, so no-one moves from bed to bed as others get up.
function nightPlan(){
  const plan = new Map();
  if (!isNight()) return plan;
  const count = new Map();
  for (const n of ALL_NPCS){
    const r = ruleFor(n); if (!r) continue;
    const i = count.get(r) || 0; count.set(r, i + 1);
    if (staysUp(n)) continue;
    const at = r.place && (r.at || [])[i];
    plan.set(n.id, at ? {place:r.place, x:at[0], y:at[1], facing:at[2] === 'bed' ? 'down' : at[2], bed:at[2] === 'bed'} : {place:'gone', x:-9, y:-9});
  }
  return plan;
}
// Where n is tonight, from the plan: its spot, or null if it's up. Someone beside you, up, stays up till you've gone,
// except as night falls: then they go to bed, fading out (nightFall).
function nightSpot(n, plan){
  const spot = plan.get(n.id);
  if (!spot || (!n.asleep && n.place === PLACE && placedIn === PLACE && !nightFall)) return null;
  return spot;
}
// Someone going to bed or getting up while you're there (placeCharacters): they fade out where they were, and in where
// they are now.
function sleptOrWoke(n, was){
  const now = performance.now();
  if (was.here) ghosts.push({n, x:was.x, y:was.y, dir:was.dir, asleep:was.asleep, bed:was.bed, t0:now});
  if (n.place === PLACE) n.fadeIn = now;
}
function asleepNote(n){ const c = CHARACTER.get(n.id), en = c && c.name ? c.name.en : 'monkey'; return `The ${en.charAt(0).toLowerCase() + en.slice(1)} is fast asleep. Shh!`; }
const fadeOf = (n, now) => n.fadeIn && now - n.fadeIn < NIGHT_FADE_MS ? (now - n.fadeIn) / NIGHT_FADE_MS : 1;
// Asleep: lying in a bed, under a blanket, or curled up on the floor, eyes shut, little Zs floating up from them; a little
// one smaller. A at them: they're fast asleep (interact, js/world.js).
function drawSleeper(n, X, Y, now, bed){
  const small = SMALL.has(n.kind);
  if (bed){ drawInBed(n.kind, X, Y); }
  else {
    const spr = sittingSprite(n.kind, n.dir === 'left' ? 'left' : 'right', true, true), px = small ? SMALL_PX : T;
    R(b, X + 3, Y + 15, 10, 1, 'rgba(0,0,0,.22)');
    b.drawImage(spr, X + (T - px) / 2, Y + T - px + 1, px, px);
  }
  const ph = ((now + n.x * 731 + n.y * 377) % 2600) / 2600;   // a Z drifting up now and then
  b.globalAlpha *= 1 - ph; zee(X + 10 + Math.round(ph * 6), Y - 2 - Math.round(ph * 12), 3 + Math.round(ph * 2), '#CFE8F7'); b.globalAlpha = 1;
}
function drawInBed(kind, X, Y){   // in a stone bed: its head on the pillow, the rest under a blanket (as you are: drawAsleep, js/draw.js)
  b.drawImage(asleepSpriteOf(kind), X + 2, Y - 1);
  const pal = PALS[kind] || PALS.player;
  R(b, X + 1, Y + 6, 14, 7, '#2E2A26'); R(b, X + 2, Y + 6, 12, 6, '#8A6A9E'); R(b, X + 2, Y + 6, 12, 1, '#B49AC4');
  R(b, X + 4, Y + 5, 8, 2, '#8A6A9E'); R(b, X + 4, Y + 5, 8, 1, '#B49AC4'); R(b, X + 2, Y + 11, 12, 1, '#5E4A70');
  R(b, X + 11, Y + 6, 3, 2, pal.f || '#8C5A33');
}
function asleepSpriteOf(kind){
  const k = 'asleepOf' + kind; if (spriteCache[k]) return spriteCache[k];
  return spriteCache[k] = sprite(ASLEEP, PALS[kind] || PALS.player);
}
function drawGhosts(cx, cy, now){   // those fading out, going to bed or getting up
  for (let i = ghosts.length - 1; i >= 0; i--){
    const g = ghosts[i], p = (now - g.t0) / NIGHT_FADE_MS;
    if (p >= 1){ ghosts.splice(i, 1); continue; }
    const X = g.x*T - cx, Y = g.y*T - cy;
    if (X < -T || Y < -T || X > VW*T || Y > VH*T) continue;
    b.globalAlpha = 1 - p;
    if (g.asleep) drawSleeper({...g.n, x:g.x, y:g.y, dir:g.dir}, X, Y, now, g.bed);
    else drawEntityMonkey(g.n.kind, X, Y, g.dir, now, 0, 0, g.x + g.y);
    b.globalAlpha = 1;
  }
}

/* ---- the light ---- */
// How the light is now: dark (0 to 1, how far into the night), warm (the evening's glow) and rose (dawn's), or null by day.
function lightNow(){
  const p = dayPart(); if (!p || p === 'day') return null;
  const f = dayFrac();
  if (p === 'evening'){ const k = (f - DUSK) / (NIGHT - DUSK); return {dark:k * k, warm:Math.sin(Math.min(1, k * 1.3) * Math.PI), rose:0}; }
  if (p === 'night') return {dark:1, warm:0, rose:0};
  const k = (f - DAWN) / (1 - DAWN); return {dark:1 - k, warm:0, rose:Math.sin(k * Math.PI)};
}
// The light, each frame, over the world (drawWorld, js/draw.js): the evening's warmth, then the dark blue of night, lamplit
// windows and doorways, lanterns and fires glowing through it, and outdoors the moon and stars, and fireflies; at dawn,
// a rosy light. Not in a place that's always night (its own night, js/mountain.js), nor in the master's year's evening
// (js/seasons.js draws its own).
function drawDaylight(cx, cy, sh, now){
  const L = lightNow(); if (!L) return;
  const P = PLACES[PLACE] || {};
  if (P.night || (AREA.seasons && AREA.seasons.evening && seasonNow() && matches(AREA.seasons.evening))) return;
  const W = VW*T, inside = indoors();
  if (L.warm){ b.globalAlpha = L.warm * (inside ? .07 : .2); R(b, 0, 0, W, sh, '#FF8A3C'); b.globalAlpha = L.warm * .08; R(b, 0, 0, W, sh, '#6A2A6A'); }
  if (L.dark){ b.globalAlpha = L.dark * (inside ? INDOOR_DARK : NIGHT_DARK); R(b, 0, 0, W, sh, '#0A1030'); }
  if (L.rose){ b.globalAlpha = L.rose * .14; R(b, 0, 0, W, sh, '#FF9EB0'); }
  b.globalAlpha = 1;
  if (L.dark > .25) lamplight(cx, cy, Math.min(1, (L.dark - .25) / .5), now);
  if (!inside && L.dark > .4 && !GLOOM) nightSky(W, sh, now, Math.min(1, (L.dark - .4) / .4));
  if (!inside && L.dark > .6 && (AREA.number === 1 || P.borrowed) && fireflyPlace()) fireflies(cx, cy, sh, now, (L.dark - .6) / .4);   // (on Flower Fruit Mountain)
  if (!inside && L.dark > .6 && mode === 'play' && now > cricketAt){ cricketAt = now + 2500 + Math.random() * 4500; SFX.cricket(); }   // crickets, now and then
}
// Lamplight at night: the windows and doors of the houses, warm yellow, a soft glow round them; the teahouse's lanterns;
// and any fire, drawn again over the dark, as it shines (drawFires, js/year.js).
const LIT_HOUSES = ['jHouse', 'townSchool', 'teahouse'];
let cricketAt = 0;
function lamplight(cx, cy, k, now){
  const glow = (x, y, w, h, a) => { b.globalAlpha = a * .18 * k; R(b, x - 2, y - 2, w + 4, h + 4, '#FFC870'); b.globalAlpha = a * .85 * k; R(b, x, y, w, h, '#F4CF7A'); };
  for (const p of OBJECT_PIECES){
    const X = p.x * T - cx, Y = p.y * T - cy, W = p.w * T, H = p.h * T;
    if (X > VW*T + 8 || Y > VH*T + 8 || X + W < -8 || Y + H < -8) continue;
    const flick = .9 + .1 * Math.sin(now / 400 + p.x * 3);
    if (LIT_HOUSES.includes(p.look)){
      const d = doorOf(X, W, Y + H);
      if (W >= 64) for (const wx of [X + 8, X + W - 16, ...(W >= 112 ? [X + Math.round(W / 4) - 4, X + Math.round(W * 3 / 4) - 4] : [])]) glow(wx + 1, d.y + 2, 6, 6, flick);
      else if (W >= 48) for (const wx of [X + 6, X + W - 12]) glow(wx + 1, d.y + 2, 4, 6, flick);
      b.globalAlpha = .35 * k; R(b, d.x + 1, d.y + 1, 8, 15, '#F4CF7A');   // light round the door's edges
      if (p.look === 'teahouse') for (const lx of [X + 10, X + W - 12]){ b.globalAlpha = .3 * k * flick; disc(b, lx + 1, Y + H - 30, 6, '#FF6A40'); b.globalAlpha = .9 * k; oval(b, lx + 1, Y + H - 30, 3, 4, '#F05A40'); }
    } else if (p.look === 'mudHouse'){
      const y0 = p.y * T - 6 - cy, h0 = H + 6, roofH = Math.round(h0 * .5);
      glow(X + 7, y0 + roofH + 8, 5, 3, flick);
    }
    b.globalAlpha = 1;
  }
  b.globalAlpha = 1;
  if (typeof drawFires === 'function') drawFires(cx, cy, now);
}
// The night sky over a place outdoors: the moon, and stars twinkling (as the cave by night's: drawNight, js/mountain.js).
function nightSky(W, sh, now, a){
  b.globalAlpha = a;
  disc(b, W - 34, 18, 7, '#F2EBC2'); disc(b, W - 30, 15, 7, '#1A2448');   // the moon
  b.globalAlpha = a * .25; disc(b, W - 35, 19, 11, '#F2EBC2');
  for (const [x, y] of [[W - 56, 12], [W - 48, 26], [W - 62, 30], [W - 90, 14], [W - 120, 22]]){ const tw = (now / 400 + x) % 6 < 1; b.globalAlpha = a; R(b, x - 1, y, 3, 1, '#FFF6C8'); R(b, x, y - 1, 1, 3, '#FFF6C8'); if (tw) R(b, x - 2, y, 5, 1, '#FFFFFF'); }
  for (let i = 0; i < 22; i++){ b.globalAlpha = a * (.5 + .5 * Math.sin(now / 700 + i * 2.1)); R(b, Math.floor(rnd(i, 7, 940) * W), Math.floor(rnd(i, 8, 941) * Math.min(sh, VH*T) * .35), 1, 1, '#C8D0F0'); }
  b.globalAlpha = 1;
}
// Fireflies, on Flower Fruit Mountain at night (not in winter, nor among thick trees): little green-gold lights drifting
// and blinking over the grass.
const fireflyPlace = () => { const s = seasonNow(); return !GLOOM && s !== 'winter' && s !== 'autumn'; };
function fireflies(cx, cy, sh, now, a){
  const W = VW*T;
  for (let i = 0; i < 12; i++){
    const x = ((rnd(i, 11, 950) * (W + 60) + Math.sin(now / 1900 + i * 1.7) * 18 - cx * .9) % (W + 60) + W + 60) % (W + 60) - 30;
    const y = ((rnd(i, 12, 951) * (sh + 40) + Math.cos(now / 2300 + i) * 12 - cy * .9) % (sh + 40) + sh + 40) % (sh + 40) - 20;
    const blink = Math.max(0, Math.sin(now / 520 + i * 2.4));
    if (blink < .2) continue;
    b.globalAlpha = a * blink * .35; R(b, Math.round(x) - 1, Math.round(y) - 1, 3, 3, '#D8F27A');
    b.globalAlpha = a * blink; R(b, Math.round(x), Math.round(y), 1, 1, '#F6FFB0');
  }
  b.globalAlpha = 1;
}

/* ---- rain ---- */
// One spell of rain a day, RAIN_MS long, at its own time in the day (RAIN_AT: the first day's, after a while; later days'
// anywhere in the morning and afternoon), never at night, nor in winter (it snows: js/seasons.js); fading in and out over
// RAIN_FADE. Outdoors only. Each day's rain is light or heavy (heavy on about RAIN_HEAVY of the days, by the day, so it
// stays as it began), and looks it; never heavy till you know 雨, nor on the day you learnt it, so the first rain you see
// is a light one, teaching 雨, and heavy rain teaches 大雨 another day (decided 7 November 2026, the owner's idea).
const RAIN_MS = 100000, RAIN_FADE = 6000, RAIN_HEAVY = 1 / 3;
const RAIN_AT = n => n === 0 ? .3 : .06 + rnd(n, 3, 960) * .5;
const heavyDay = n => rnd(n, 7, 962) < RAIN_HEAVY;   // is day n's rain heavy?
const rainHeavy = () => heavyDay(S.clock.n || 0) && lvl('雨') >= 1 && !(S.clock.caught || []).includes('雨');
function rainNow(){   // how hard it's raining now, 0 to 1 (0 when it isn't)
  if (!clockOn() || isNight() || seasonNow() === 'winter') return 0;
  const start = RAIN_AT(S.clock.n || 0) * DAY_MS, t = (S.clock.t || 0) - start;
  if (t < 0 || t > RAIN_MS) return 0;
  return Math.min(1, t / RAIN_FADE, (RAIN_MS - t) / RAIN_FADE);
}
const rainingHere = () => rainNow() > 0 && !indoors() && !(PLACES[PLACE] || {}).night;
const rainHere = () => rainingHere() && (rainHeavy() ? 'heavy' : 'light');   // how it's raining where you are: 'heavy', 'light', or false
// The rain, over the world: the sky a little darker, streaks slanting down, and little splashes on the ground. Heavy rain
// as it always was; light rain fewer, shorter and fainter drops, falling a little slower, the sky barely darker, and few
// splashes. No sound (decided 7 November 2026, after playing it: its rush, every few seconds, wasn't wanted).
const RAIN_LOOKS = {heavy:{dark:.16, drops:110, len:5, fall:4, splashes:14}, light:{dark:.07, drops:50, len:3, fall:5, splashes:5}};
function drawRain(cx, cy, sh, now){
  const k = rainNow(); if (!k || indoors() || (PLACES[PLACE] || {}).night) return;
  const W = VW*T, L = RAIN_LOOKS[rainHeavy() ? 'heavy' : 'light'];
  b.globalAlpha = L.dark * k; R(b, 0, 0, W, sh, '#1A2436');
  b.globalAlpha = .55;
  for (let i = 0; i < Math.round(L.drops * k); i++){
    const x = Math.floor(rnd(i, 4, 973) * (W + 40)) - Math.floor(now / 12 + cx) % 40, y = ((rnd(i, 5, 974) * sh + now / L.fall - cy) % sh + sh) % sh;
    for (let j = 0; j < L.len; j++) R(b, x - Math.floor(j / 2), Math.round(y) + j, 1, 1, '#D8E4F4');
  }
  b.globalAlpha = .7;
  for (let i = 0; i < Math.round(L.splashes * k); i++){   // splashes on the ground, a ring for a moment
    const ph = (now / 420 + rnd(i, 6, 975)) % 1, sx = Math.floor(rnd(i, Math.floor(now / 420 + rnd(i, 6, 975)), 976) * W), sy = Math.floor(rnd(i, Math.floor(now / 420 + rnd(i, 6, 975)), 977) * sh);
    if (ph < .5){ const r = Math.round(ph * 4); R(b, sx - r, sy, 1 + 2 * r, 1, '#E8F0FA'); }
  }
  b.globalAlpha = 1;
}

/* ---- bedtime ---- */
// What you've done today (since you last woke, or the day began): the words you caught, how many questions you answered,
// and the friends you made.
function today(){
  const c = S.clock || {};
  return {words:(c.caught || []).filter(w => WORDS[w] && lvl(w) >= 1), questions:Math.max(0, (S.turn || 0) - (c.turn0 || 0)), friends:S.friends.filter(f => !(c.friends0 || []).includes(f))};
}
const friendText = id => { const a = ANIMALS.find(x => x.id === id), c = CHARACTER.get(id);
  return a && WORDS[a.hz] ? chipHTML(a.hz) : c && c.name ? `<span class="fname">${c.name.zh} <span class="small">${esc(c.name.en)}</span></span>` : ''; };
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
// Before you sleep, the day's recap (decided 7 November 2026, the owner's idea: going to bed is a moment to look back on
// what you've learned): today's new words, to tap and hear, how many questions you answered and your new friends; and a
// quick review, REVIEW questions on today's words, if you like. Gives false for Not now (you don't go to sleep), true to
// sleep. With nothing done today, nothing to show: you just sleep.
const REVIEW = 5;
function bedtimeCard(){
  const d = today();
  if (!d.words.length && !d.questions && !d.friends.length) return Promise.resolve(true);
  return new Promise(res => {
    const show = () => {
      openCard(`<div class="who" aria-hidden="true">🌙</div><p class="label">Time for bed</p>
        <p>What you did today:</p>
        <div class="stats"><span>${plural(d.words.length, 'new word')}</span><span>${plural(d.questions, 'question')} answered</span>${d.friends.length ? `<span>${plural(d.friends.length, 'new friend')}</span>` : ''}</div>
        ${d.words.length ? `<div class="chips">${d.words.map(chipHTML).join('')}</div><div class="gloss">Tap a word to hear it.</div>` : ''}
        ${d.friends.length ? `<p class="small">New friends: ${d.friends.map(friendText).join(' ')}</p>` : ''}
        <div class="actions"><button class="btn" data-a="no" data-b data-label="Not now">Not now</button>${reviewable(d).length ? `<button class="btn" data-a="review" data-label="Review">Quick review</button>` : ''}<button class="btn primary" data-a="sleep">Sleep</button></div>`);
      bindMissed();
      on('[data-a=no]', () => { closeCard(); res(false); });
      on('[data-a=sleep]', () => { closeCard(); res(true); });
      if (sheet.querySelector('[data-a=review]')) on('[data-a=review]', async () => { const r = await reviewToday(d); await reviewDone(r); res(true); });
    };
    show();
  });
}
// The words a quick review asks about: today's with pictures, and, if that's fewer than REVIEW, the words you know that
// need it most (the review list).
function reviewable(d){
  const mine = shuffle(d.words.filter(w => WORDS[w].pic)).slice(0, REVIEW);
  return mine.length >= REVIEW ? mine : [...mine, ...nextWords(trainable().filter(w => !mine.includes(w)), REVIEW - mine.length)];
}
async function reviewToday(d){
  const words = reviewable(d);
  let right = 0;
  for (const [i, w] of words.entries()){
    lessonBar = `Today’s words · ${i + 1} of ${words.length}`;
    const q = wordQuestion(w);
    if (await pictureQ({head:'', body:q.body, word:w, type:q.type, options:q.options, text:q.text, answerIdx:q.answerIdx,
      onShow:() => { if (q.type !== 'read') setTimeout(() => say(w), 300); }})) right++;
  }
  lessonBar = null; save();
  return {right, asked:words.length};
}
function reviewDone(r){
  SFX.fanfare();
  return new Promise(res => {
    openCard(`<div class="who" aria-hidden="true">🌙</div><p class="label">Review done!</p><p>You got <b>${r.right} of ${r.asked}</b> right first time. Now, time to sleep.</p>
      <div class="actions"><button class="btn primary" data-a="sleep">Sleep</button></div>`);
    on('[data-a=sleep]', () => { closeCard(); res(); });
  });
}
// Asleep at bedtime (the sleep step): the night goes by while you sleep, the light turning to evening, night and dawn
// (tickClock), then it's the next morning: a new day, your health full, everyone up for the day.
const BEDTIME_MS = 4200;
let sleepLen = 2400;   // how long you're asleep (the dark, and Zs floating up: js/draw.js)
function nightPasses(now){ if (sleepAt && sleepAt.from !== undefined){ const k = clamp((now - sleepT) / sleepLen, 0, 1); S.clock.t = sleepAt.from + (DAY_MS - 1 - sleepAt.from) * k; } }
function morning(){
  S.clock.t = 0; S.clock.n = (S.clock.n || 0) + 1; newDay();
  S.health = maxHealth(); save();
  ghosts.length = 0; placeCharacters(); clockSeen = null;
}
const goodMorning = () => fill((AREA.dayNight && AREA.dayNight.morning) || 'Good morning! You wake up with your health full.');
