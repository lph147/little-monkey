// PE at school (体育, decided 28 October 2026): a lesson series of kind pe (the area's lessons), out on its place (at), such
// as the sports ground. The class goes out with a quick fade, the teacher and the troop standing where its class says;
// each word has its own lesson there, a race (race, teaching 跑: you against two classmates) or a jog round the track
// (jog, teaching 跑步), then questions on the word, as in every lesson, and the class goes back in.

/* ================= PE ================= */
let race = null;   // the race on now: {to: the finish's column}; while it's on, you can only run along your lane
const RACE_WAIT = 1500;   // your classmates set off when you do, or after this long (ms) if you don't
// Out to (or back from) a place, during a lesson: a quick fade, as through a way, and you're at at ([x, y, facing]).
async function moveClass(place, at){
  closeTalk(); fadeT = performance.now(); SFX.blip();
  await sleep(FADE_MS);
  S.pos = {place, x:at[0], y:at[1], dir:at[2] || pl.dir}; placePlayer(); stepClear();
  if (PLACES[place].name) showPlaceName();
}
// The class where the lesson says (each character id: [x, y, facing]), in the place you're in, till the lesson ends and
// they go back to where they belong (inClass, js/world.js).
function standClass(where){
  for (const [id, [x, y, facing]] of Object.entries(where)){
    const n = ALL_NPCS.find(c => c.id === id);
    if (n){ Object.assign(n, {place:PLACE, x, y, dir:facing || 'down', mv:null}); inClass.add(id); }
  }
  NPCS = ALL_NPCS.filter(n => n.place === PLACE && !S.following.includes(n.id));
}
// A step for a character (n) to (x, y), taking ms: running, with dust behind (drawRunDust, js/draw.js).
function runStep(n, x, y, ms){
  n.dir = dirOf(x - n.x, y - n.y) || n.dir; n.mv = {fx:n.x, fy:n.y, t0:performance.now(), dur:ms, run:true}; n.parity = (n.parity || 0) ^ 1; n.x = x; n.y = y;
}
// The race (r, in s's lesson; again: a lesson done again, so nothing is taught): the teacher beats the big drum and starts
// it with his line (start: teaching its word, then its card), and it's on: hold B to run. Your classmates (racers, each
// at the start of its lane) set off when you do, a step every ms, faster than you walk and slower than you run; the
// first to the finish (to) wins. He says end, however you did; the first time you win, there's a prize of shells. Gives
// whether you won.
async function runRace(s, r, face, again){
  const racers = Object.entries(r.racers).map(([id, [x, y]]) => ({n:ALL_NPCS.find(c => c.id === id), x, y})).filter(o => o.n);
  standClass(Object.fromEntries(racers.map(o => [o.n.id, [o.x, o.y, 'right']])));
  SFX.drum(); await sleep(250); SFX.drum();
  await showDialog(face, L[r.start], again ? {} : {teach:r.word});
  if (!again) await showNotice(r.word, {quiet:true, ...(s.note && s.note[r.word] ? {note:fill(s.note[r.word])} : {})});
  closeTalk(); toast(fill(r.go));
  const from = pl.x;
  race = {to:r.to}; held = null; queued = null; busy = false;   // (it's on: you can move)
  let place = 0, you = 0;   // (the order you all get there in)
  try {
    for (let t = 0; t < RACE_WAIT && pl.x === from && !pl.mv; t += 30) await sleep(30);   // (till you set off)
    const running = racers.map(async o => { while (o.n.x < r.to){ runStep(o.n, o.n.x + 1, o.n.y, r.ms); await sleep(r.ms); } o.at = ++place; });
    while (!(pl.x >= r.to && !pl.mv)) await sleep(30);
    you = ++place; busy = true; held = null; queued = null; race = null;   // (you're there: the race is over for you)
    await Promise.all(running);   // (and they run on to the finish)
  } finally { busy = true; race = null; }
  const won = you === 1;
  closeMessage();
  await showDialog(face, L[r.end]);
  if (won && !here().raceWon){ here().raceWon = 1; S.shells += r.prize; save(); SFX.fanfare(); await showNarration(`${fill(r.won)} +${r.prize} 🐚`); }
  else await showNarration(fill(won ? r.won : r.lost));
  return won;
}
// Jogging round the track (j; again: nothing taught): the teacher says start (teaching its word, then its card), and leads
// the class once round the loop (its corners, in order), a step every ms: you behind him, your classmates behind you
// (the race's racers); then he says end.
function jogLoop(j){   // every square round its loop, from the first corner
  const loop = [];
  j.loop.forEach(([x, y], i) => { const [tx, ty] = j.loop[(i + 1) % j.loop.length]; for (let k = 0, n = Math.abs(tx - x) + Math.abs(ty - y); k < n; k++) loop.push([x + Math.sign(tx - x) * k, y + Math.sign(ty - y) * k]); });
  return loop;
}
const jogStart = j => { const loop = jogLoop(j), [x, y] = loop[loop.length - 1]; return [x, y, dirOf(loop[0][0] - x, loop[0][1] - y)]; };   // where you stand: behind the teacher
async function runJog(s, j, face, again, who){
  const loop = jogLoop(j), at = i => loop[(i % loop.length + loop.length) % loop.length];
  const line = [ALL_NPCS.find(c => c.id === who), null, ...Object.keys((s.race || {}).racers || {}).map(id => ALL_NPCS.find(c => c.id === id))];   // (null: you)
  const dirTo = i => dirOf(at(i + 1)[0] - at(i)[0], at(i + 1)[1] - at(i)[1]);
  standClass(Object.fromEntries(line.map((n, k) => n && [n.id, [...at(-k), dirTo(-k)]]).filter(Boolean)));
  await showDialog(face, L[j.start], again ? {} : {teach:j.word});
  if (!again) await showNotice(j.word, {quiet:true, ...(s.note && s.note[j.word] ? {note:fill(s.note[j.word])} : {})});
  closeTalk();
  for (let i = 1; i <= loop.length; i++){
    line.forEach((n, k) => {
      const [x, y] = at(i - k);
      if (n) runStep(n, x, y, j.ms);
      else { pl.dir = dirOf(x - pl.x, y - pl.y) || pl.dir; pl.mv = {fx:pl.x, fy:pl.y, tx:x, ty:y, t0:performance.now(), dur:j.ms, led:true, run:true}; pl.parity ^= 1; }
    });
    await sleep(j.ms);
    if (pl.mv && pl.mv.led){ pl.x = pl.mv.tx; pl.y = pl.mv.ty; pl.px = pl.x * T; pl.py = pl.y * T; pl.mv = null; }   // (there, even if no frame has been drawn)
  }
  S.pos = {place:PLACE, x:pl.x, y:pl.y, dir:pl.dir};
  await showDialog(face, L[j.end]);
}
// A question on a word, in a PE lesson (with the teacher: who): you hear it while it's new, and choose its picture from
// three you know, with their characters; once you know it, you read it, and choose from the pictures alone. Gives
// whether you were right.
async function peQ({who, w}){
  const listen = lvl(w) <= 1, q = wordQuestion(w, null, listen ? 'listen' : 'read');
  const ok = await pictureQ({head:`<div class="qhead lessonhead"><div class="who" aria-hidden="true">${portrait(who)}</div><p class="label">${listen ? 'Listen.' : 'Read it.'} Which is it?</p></div>`,
    body:listen ? '<div class="hearit"><button class="sayBig" data-a="say" aria-label="Hear it again">🔊</button></div>'
      : `<div class="word"><div class="big">${w}</div>${S.pinyin ? `<div class="py">${WORDS[w].py}</div>` : ''}</div>`,
    options:q.options, answerIdx:q.answerIdx, word:w, onShow:() => { if (listen) setTimeout(() => say(w), 300); }});
  closeCard();
  if (ok) answer(w, true, listen ? 'listen' : 'read'); else reviewed(w, false);
  return ok;
}
// A PE lesson (a lesson series of kind pe, with the teacher: who), teaching words (one, its race's or its jog's), or done
// again (again): out to its place (at; out: what you're told), the class where it says (class), the race or the jog,
// then questions on the word (five: it three times and twice another action you know), each right answer earning a shell
// if it needed practice, and back in (back). Gives how you did: {right, asked, shells, won} (the timetable's end card).
async function peLesson(series, words, who, {again = false} = {}){
  const face = speaker(who), w = words[0], home = {...S.pos};
  let right = 0, shells = 0, asked = 0, won;
  await showNarration(fill(series.out));
  const racing = !!series.race && series.race.word === w, jogging = !racing && !!series.jog && series.jog.word === w;
  await moveClass(series.at, racing ? series.race.you : jogging ? jogStart(series.jog) : [1, 4, 'right']);
  standClass(series.class || {});
  try {
    if (racing) won = await runRace(series, series.race, face, again);
    else if (jogging) await runJog(series, series.jog, face, again, who);
    const others = shuffle(picWords().filter(x => x !== w && WORDS[x].category === WORDS[w].category && lvl(x) >= 1));
    for (const x of lessonAsks([w], others)[0]){
      const need = needsPractice(x);
      asked++;
      if (await peQ({who, w:x})){ right++; if (need) shells++; }
    }
    S.shells += shells; save();
  } finally {
    inClass.clear();
    if (series.back) toast(fill(series.back));
    await moveClass(home.place, [home.x, home.y, home.dir]);
  }
  return {right, asked, shells, won};
}
LESSON_KINDS.pe = peLesson;
