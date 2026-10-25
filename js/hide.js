// Hide and seek (the area's hideSeek): a little monkey hides while you count to ten, and calls out where it is, such as
// 我在桌子下面！ (I'm under the table!): its English every time, with the word for the place left in Chinese, so finding it
// tests that word, never 下面 or 里 (decided 25 October 2026). It only hides where you know the word. Press A at where you
// think it is: the wrong place, and it calls out again; after two wrong guesses its tail pokes out. Finding it the first
// time earns shells. Kept in the save (here().hide): where it's hiding now (spot, or null), your wrong guesses, how many
// times you've found it (won), and where it hid last (last), so it hides somewhere new each time.

/* ================= HIDE AND SEEK ================= */
const HIDE = AREA.hideSeek || null;
const TAIL_AFTER = 2;   // wrong guesses before its tail pokes out
const hideState = () => here().hide;
const hiding = () => !!HIDE && !!hideState().spot;
const hideSpot = id => HIDE.spots.find(p => p.id === id);
const hideSpots = () => HIDE.spots.filter(p => lvl(p.word) >= 1);   // where it can hide: where you know the word
let dimT = 0, dimOn = false;   // the screen going dark while you count (and light again)
// The hiding place at (x, y), in the place you're in, while it's hiding: what A looks at.
function hideSpotAt(x, y){
  if (!hiding() || PLACE !== HIDE.place) return null;
  return hideSpots().find(p => p.at.some(a => a[0] === x && a[1] === y)) || null;
}
// Its clue, the line it calls out from where it's hiding: the speech box shows its English every time, with the place's
// word in Chinese (cluedEn), bold green as in the Chinese.
function hideClue(p){ return showDialog(speaker(HIDE.by), L[p.say], {clue:p.word, teach:p.word}); }
// A line's English with {word} (or {word|its English here}) as the word itself, in Chinese with its pinyin, to tap (the
// clue's English).
function cluedEn(en, word){
  const [a, b] = en.split(new RegExp(`\\{${word}(?:\\|[^}]*)?\\}`));
  return `<span>${esc(a.trim())}</span>${lineHTML([word], word)}<span>${esc((b || '').trim())}</span>`;
}
// The clue on your Tasks page while it's hiding (a task with clue), to read and hear again.
const clueTaskHTML = p => `<div class="taskclue">${lineHTML(L[p.say].t, p.word)}<div class="gloss"></div><div class="sentence-en clue">${cluedEn(L[p.say].en, p.word)}</div><button class="tbtn" data-a="clue">🔊 Hear it</button></div>`;
// Talking to the little monkey: it asks you to play (Play or Not now), hides while you count, and calls out where it is.
async function hideSeek(who, last){
  const spots = hideSpots();
  if (spots.length < 2){ await showNarration(fill(HIDE.notYet), last); return; }
  if (!await confirmBox(speaker(who), fill(HIDE.ask), 'Play', 'Not now')) return STOP;
  const st = hideState(), choices = spots.filter(p => p.id !== st.last);
  const p = choices[Math.floor(Math.random() * choices.length)];
  Object.assign(st, {spot:p.id, wrong:0, last:p.id}); save();
  dimOn = true; dimT = performance.now();   // you cover your eyes: the screen goes dark, and it runs off to hide
  placeCharacters();
  await showDialog(speaker('player'), L[HIDE.count]);
  dimOn = false; dimT = performance.now();
  await showDialog(speaker('player'), L[HIDE.coming]);
  await hideClue(p);
}
// A at a hiding place: found it, or not here (and it calls out again).
async function lookForHider(p){
  const st = hideState();
  if (p.id !== st.spot){
    st.wrong++; save(); SFX.bump();
    await showNarration(fill(st.wrong >= TAIL_AFTER ? HIDE.tail : HIDE.notHere), false, {note:true});
    await hideClue(hideSpot(st.spot));
    return;
  }
  const first = !st.won;
  Object.assign(st, {spot:null, wrong:0, won:(st.won || 0) + 1});
  const n = ALL_NPCS.find(c => c.id === HIDE.by), [ox, oy] = freeNear(p.out);
  Object.assign(n, {place:PLACE, x:ox, y:oy, dir:dirOf(pl.x - ox, pl.y - oy), mv:{fx:p.at[0][0], fy:p.at[0][1], t0:performance.now(), dur:STEP, far:true}});   // it jumps out
  NPCS = ALL_NPCS.filter(c => c.place === PLACE && !S.following.includes(c.id));
  pl.dir = dirOf(ox - pl.x, oy - pl.y); SFX.chime();
  if (first) S.shells += HIDE.shells;
  save();
  await showDialog(speaker('player'), L[HIDE.found]);
  SFX.fanfare();
  await showNarration(fill(HIDE.result.replace('{where}', p.where)) + (first ? ` +${HIDE.shells} 🐚` : '') + ' ' + fill(HIDE.again), true);
  goHome(n);
}
// The nearest square to (x, y) you can walk on that's free (not yours, nor anyone's): where it jumps out to.
function freeNear([x, y]){   // (the fewest steps away first, so it jumps out beside you, not on a slant)
  const free = (a, b) => !!tileAt(a, b).walk && !(a === pl.x && b === pl.y) && !npcAt(a, b), near = [];
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) near.push([dx, dy]);
  const best = near.sort(([a, b], [c, d]) => (Math.abs(a) + Math.abs(b)) - (Math.abs(c) + Math.abs(d))).find(([dx, dy]) => free(x + dx, y + dy));
  return best ? [x + best[0], y + best[1]] : [x, y];
}
// Back to where it stands, a step at a time (waiting if you're in its way), while you play on.
async function goHome(n){
  for (let tries = 0; tries < 60; tries++){
    const m = (n.moves || []).find(m => matches(m.if)) || n.home;
    if (n.place !== PLACE || (n.x === m.x && n.y === m.y)) break;
    const [x, y] = pathTo([n.x, n.y], [m.x, m.y], {blocked:[pl.x, pl.y]})[0] || [];
    const busy = x === undefined || (x === pl.x && y === pl.y) || (pl.mv && x === pl.mv.tx && y === pl.mv.ty);
    if (!busy){ n.mv = {fx:n.x, fy:n.y, t0:performance.now(), dur:STEP}; n.dir = dirOf(x - n.x, y - n.y); n.parity = (n.parity || 0) ^ 1; n.x = x; n.y = y; }
    await sleep(STEP);
  }
  placeCharacters();
}
// Its tail, poking out of where it's hiding (spot.tail: [x, y, 'left' or 'right'], the side of that square it pokes out
// of), once you've guessed wrong twice; it wags now and then.
function drawHideTail(cx, cy, now){
  if (!hiding() || PLACE !== HIDE.place || hideState().wrong < TAIL_AFTER) return;
  const [x, y, side] = hideSpot(hideState().spot).tail, way = side === 'right' ? 1 : -1;
  const X = x*T + (way > 0 ? T - 4 : 3) - cx, Y = y*T + 11 - cy, wag = Math.floor(now / 350) % 4 === 0 ? -1 : 0;
  const curl = [[0,0],[1,0],[2,1],[3,1],[4,0],[5,-1],[5,-2 + wag],[4,-3 + wag]];
  curl.forEach(([dx, dy]) => R(b, X + dx*way, Y + dy - 1, 1, 3, '#43260F'));
  curl.slice(0, -1).forEach(([dx, dy]) => R(b, X + dx*way, Y + dy, 1, 1, '#C98B4F'));
}
// The screen going dark while you count with your eyes covered, and light again after.
function drawDim(now){
  const k = clamp((now - dimT) / 300, 0, 1), a = dimOn ? k : 1 - k;
  if (a <= 0) return;
  b.globalAlpha = a * .62; R(b, 0, 0, VW*T, VH*T, '#0B1024'); b.globalAlpha = 1;
}
