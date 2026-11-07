// The master's year (Area 2's chapter 1: decided 7 November 2026, from the plan, https://claude.ai/artifact/5YyrWEC2JSY5JiuyRhyr3m):
// a whole year in the immortal's cave, a season at a time (how each season looks: js/seasons.js). Here: the master's
// classes, one a season (the class step), each opening with a check that you listened last time (the recap step); counting
// on from ten with bundles of sticks (countOn); turning to face the way the master says (face questions, for 北边 南边
// 东边 西边); morning training with the pupils, everyone striking together, counted aloud (drill); and pouring a bucket
// of water over your own little peach tree (pour).

/* ================= COUNTING IN TENS ================= */
const TEENS = ['十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十'];
const TO_TWENTY = [...COUNTING, ...TEENS];   // counting aloud up to twenty, as everyone strikes together
const numberOf = w => TO_TWENTY.indexOf(w) + 1;
const ONES = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
// Sticks, as the master counts with them: a bundle of ten tied round its middle with red string for each ten, the rest
// loose beside it (as the word pictures of 十一 to 二十 have them, tools/draw-pictures.js). n: how many; untied: the
// first ten still loose (being tied: k, how far, 0 to 1, the string going round last).
const STICKS = {wood:'#C8955A', light:'#E2B47A', end:'#8A5A2B', ink:'#3A2614', string:'#D83A3A', knot:'#9A1F1F', H:20};
function sticksCanvas(n, {untied = false, k = 1} = {}){
  const bundles = untied ? 0 : Math.floor(n / 10), loose = n - bundles * 10, H = STICKS.H;
  const W = Math.max(4, 2 + bundles * 14 + loose * 5);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  let x = 1;
  for (let i = 0; i < bundles; i++){ bundleAt(g, x, 1, H - 2, i === bundles - 1 ? k : 1); x += 14; }
  for (let i = 0; i < loose; i++) stickAt(g, x + i * 5, 1, H - 2);   // (a gap between each, so you can count them)
  return c;
}
function stickAt(g, x, y, h){   // a loose stick, two pixels wide, outlined, its ends darker
  R(g, x, y, 4, h, STICKS.ink);
  R(g, x + 1, y + 1, 2, h - 2, STICKS.wood); R(g, x + 1, y + 1, 1, h - 2, STICKS.light); R(g, x + 1, y + 1, 2, 1, STICKS.end); R(g, x + 1, y + h - 2, 2, 1, STICKS.end);
}
function bundleAt(g, x, y, h, k = 1){   // ten sticks packed tight, tied round the middle (k: how far round the string is)
  R(g, x, y, 12, h, STICKS.ink);
  for (let i = 0; i < 10; i++) R(g, x + 1 + i, y + 1, 1, h - 2, i % 2 ? STICKS.wood : STICKS.light);
  R(g, x + 1, y + 1, 10, 1, STICKS.end); R(g, x + 1, y + h - 2, 10, 1, STICKS.end);
  if (k <= 0) return;
  const m = y + Math.floor(h / 2) - 1, w = Math.round(12 * Math.min(1, k));
  R(g, x, m - 1, w, 4, STICKS.ink); R(g, x + 1, m, Math.max(0, w - 2), 2, STICKS.string);   // the string round it
  if (k >= 1){ R(g, x - 1, m, 2, 2, STICKS.knot); R(g, x - 1, m - 1, 1, 1, STICKS.ink); }   // and its knot
}
const sticksHTML = (n, o) => `<img class="sticks" alt="" src="${sticksCanvas(n, o).toDataURL()}">`;

// A number question: the master says a number, and you choose it, from it and the two nearest it that you know (pool),
// each with its characters (and its pinyin once you've answered), drawn as sticks (sticks: n of them, for 一 to 十, as
// he holds them up) or as its own picture (十一 to 二十). label: what it's about; who: whose face is beside it.
async function numberQ(w, {pool = TEENS, label = 'Listen. Which is it?', who = 'master', sticks = false} = {}){
  const n = numberOf(w), near = shuffle(pool.filter(x => x !== w && lvl(x) >= 1 && !NOT_HOW_MANY.includes(x))).sort((a, b) => Math.abs(numberOf(a) - n) - Math.abs(numberOf(b) - n));
  const opts = shuffle([w, ...apart(w, near, 2, true)]);
  const art = o => sticks ? `<span class="count sticksopt">${sticksHTML(numberOf(o))}</span>` : `<span class="ico">${picHTML(o)}</span>`;
  const ok = await pictureQ({head:`<div class="qhead lessonhead"><div class="who" aria-hidden="true">${portrait(who)}</div><p class="label">${esc(fill(label))}</p></div>`,
    body:'<div class="hearit"><button class="sayBig" data-a="say" aria-label="Hear it again">🔊</button></div>',
    options:opts.map(o => `${art(o)}<span class="under"><span class="cap">${o}</span>${laterPy(o)}</span>`),
    answerIdx:opts.indexOf(w), word:w, type:'listen', onShow:() => setTimeout(() => say(w), 300)});
  closeCard();
  scored(ok);
  return ok;
}

// Counting sticks (the master holds some up: 这是几？, What number is this?): you count them, and choose the number, its
// characters and pinyin (as in a number lesson, when reading), from it and the two nearest it you know (pool).
async function countSticksQ(w, {pool, line = 'whatNumber', who = 'master'} = {}){
  const n = numberOf(w), near = shuffle(pool.filter(x => x !== w && lvl(x) >= 1 && !NOT_HOW_MANY.includes(x))).sort((a, b) => Math.abs(numberOf(a) - n) - Math.abs(numberOf(b) - n));
  const opts = shuffle([w, ...near.slice(0, 2)]), l = L[line], text = l.t.join('');
  hear(l.t);
  const ok = await pictureQ({head:`<div class="qhead lessonhead"><div class="who" aria-hidden="true">${portrait(who)}</div>${lineHTML(l.t)}<button class="tbtn" data-a="ask" aria-label="Hear the question again">🔊</button></div>`,
    body:`<div class="countq"><div class="count sticksopt big">${sticksHTML(n)}</div><div class="sentence-en">${esc(l.en)}</div></div><div class="gloss"></div>`,
    options:opts.map(o => `${o}<span class="cap">${WORDS[o].py}</span>`), text:true, answerIdx:opts.indexOf(w), word:w, type:'read',
    onShow:() => { say(text, null, who); on('[data-a=ask]', () => say(text, null, who)); }});
  closeCard();
  scored(ok);
  return ok;
}

/* ================= THE MASTER'S CLASSES ================= */
// A class (the class step: its name, class; the words it teaches, taught; its steps, do): the pupils sit in front of the
// hall, and the master teaches. Its name is over every card in it (lessonBar, as at school), and at its end, a card says
// what it taught and how you did. Questions in it count (classScore).
let classScore = null;
const scored = ok => { if (classScore){ classScore.asked++; if (ok) classScore.right++; } };
function classEnd(s, sc){
  const words = (s.taught || []).filter(w => WORDS[w]);
  return new Promise(res => {
    openCard(`<p class="lessonbar">${esc(fill(s.class))}</p>
      <div class="ldone"><span class="pics${words.length > 1 ? ' three' : ''}">${words.slice(0, 3).map(picHTML).join('')}</span><div><div class="big">✓ Class over!</div>
        ${words.length ? `<div class="w">${wordsPy(words.length > 4 ? [words[0], words[words.length - 1]] : words)}</div>` : ''}
        ${sc && sc.asked ? `<div class="small">${sc.right} of ${sc.asked} right</div>` : ''}</div></div>
      ${s.end ? `<p class="small">${esc(fill(s.end))}</p>` : ''}
      <div class="actions"><button class="btn primary" data-a="ok" data-b>OK</button></div>`);
    SFX.fanfare();
    on('[data-a=ok]', () => { closeCard(); res(); });
  });
}

// Which way each side is, in the cave (its map: the hall at the top, the way out at the bottom, the waterfall on the
// right, the peach garden on the left), and so everywhere: up the screen is north, as on a map.
const WAYS = {'北边':'up', '南边':'down', '东边':'right', '西边':'left'};
// A face question: the master says which way (line: his line, such as 看北边！, its English hidden while it's a check:
// check), and you turn to face it with the D-pad, and press A (the speech box's turn: js/cards.js). Right, and you're
// told so; wrong, and you turn to face the right way, so you see it. Gives whether you were right.
async function faceQ(who, line, w, {check = false} = {}){
  if (pl.dir === WAYS[w]){ pl.dir = shuffle(Object.values(WAYS).filter(d => d !== WAYS[w]))[0]; S.pos.dir = pl.dir; pl.turnT = performance.now(); }   // (never facing it already: you'd have nothing to do)
  await showDialog(speaker(who), L[line], {noEn:check, turn:'Turn to face that way with the arrows, then press A.', ok:'This way'});
  const ok = pl.dir === WAYS[w];
  answer(w, ok, 'listen'); scored(ok);
  if (ok){ SFX.right(); await showNarration(`Yes! That’s ${wz(w)}.`); return true; }
  SFX.wrong(); pl.dir = WAYS[w]; S.pos.dir = pl.dir; pl.turnT = performance.now(); save();
  await showNarration(`Not quite: ${wz(w)} is this way.`);
  return false;
}

// Counting on (the countOn step: the master's first class, spring): ten loose sticks, tied together into a bundle of ten,
// 十; then a stick more at a time, A for each, as the master counts on, 十一, 十二…, each said and shown, ten (gold, the
// bundle) and so many more (the loose sticks); and at twenty, a second bundle, 二十, two tens. Then they're yours: 十一
// to 二十, all at once (they're made of numbers you know, decided in the plan), in your Word Scroll.
function countOn(){
  return new Promise(res => {
    let n = 10, tied = 0;
    const show = () => {
      const w = n === 10 ? '十' : TO_TWENTY[n - 1], tens = n === 20 ? '二十' : n > 10 ? `<span class="ten">十</span><span class="more">${w.slice(1)}</span>` : `<span class="ten">十</span>`;
      const note = n === 10 ? (tied ? 'Ten sticks, tied together: a bundle of ten. That’s 十.' : 'Ten sticks: 十. Watch the master tie them together…')
        : n === 20 ? 'Two bundles of ten: 二十, two tens.'
        : `A bundle of ten and ${ONES[n - 11]} more: ${w}, ten and ${ONES[n - 11]}.`;
      openCard(`<p class="label">Counting on, from ten</p>
        <div class="counton"><div class="cstk">${sticksHTML(n === 10 ? 10 : n, {untied:n === 10 && tied < 1, k:tied})}</div>
          <div class="cnum">${n === 20 ? '<span class="more">二</span><span class="ten">十</span>' : tens}</div><div class="py">${n === 10 ? WORDS['十'].py : WORDS[w].py}</div>
          <p class="note">${esc(note)}</p></div>
        <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button><button class="btn primary" data-a="next">${n === 20 ? 'Got it' : n === 10 && tied < 1 ? 'Tie them' : 'One more ▸'}</button></div>`);
      on('[data-a=say]', () => say(w));
      on('[data-a=next]', next);
    };
    const next = async () => {
      if (n === 10 && tied < 1){   // tying the bundle: the string goes round, and its knot
        for (const k of [.35, .7, 1]){ tied = k; show(); SFX.tock(); await sleep(260); }
        say('十'); return;
      }
      if (n === 20){ closeCard(); for (const w of TEENS) if (lvl(w) === 0) setSeen(w); SFX.word(); toast('十一 to 二十 added to your Word Scroll'); res(); return; }
      n++; show(); SFX.blip(); say(TO_TWENTY[n - 1]);
    };
    show(); say('十');
  });
}

/* ================= MORNING TRAINING ================= */
// Morning training with the pupils (the drill step: how many rounds; label: what's going on), led by the senior pupil: he
// calls out how many strikes, a number from 十一 to 二十 (a number question), and everyone strikes together, counted
// aloud, you with your stick and the pupils with their staffs, wherever they stand, facing their own way (decided in the
// plan: you practise the new numbers straight away). Nobody's staff shows the rest of the time.
const DRILL = {strike:640};
let drillAt = null;   // while the pupils are training with you: {who: their ids, t0: when the last strike began}
const inDrill = n => !!drillAt && drillAt.who.includes(n.id);
async function drillStrikes(n, who){
  drillAt = {who, t0:-1e9};
  for (let i = 1; i <= n; i++){
    const now = performance.now();
    drillAt.t0 = now; swing = {t0:now, x:pl.x + DV[pl.dir][0], y:pl.y + DV[pl.dir][1]}; SFX.swish(.06);
    await sleep(SWING_MS * SWING_CONTACT); SFX.thwack(.06); say(TO_TWENTY[i - 1]); toast(`${TO_TWENTY[i - 1]}！`);
    await sleep(Math.max(DRILL.strike, SWING_MS) - SWING_MS * SWING_CONTACT);
  }
  await sleep(300); clearMessage();
}
// A pupil's staff in the drill: held upright beside them, raised over their head, then struck down in front of them (as
// your stick is), from the side, the front or behind (points in their square's pixels: its end in their hand, then its
// tip; drawn over them, but from behind, over their head only).
const STAFF = {
  right:{rest:[[11, 12], [11, -1]], up:[[10, 6], [3, -4]], down:[[11, 10], [20, 13]]},
  down:{rest:[[13, 14], [13, 0]], up:[[12, 4], [4, -3]], down:[[11, 11], [3, 15]]},
  up:{rest:[[2, 14], [2, 0]], up:[[4, 4], [12, -3]], down:[[4, 7], [12, -2]]}
};
function drawStaff(X, Y, dir, phase){
  const s = STAFF[dir === 'left' ? 'right' : dir][phase], flip = dir === 'left', px = ([x, y]) => [flip ? 15 - x : x, y];
  const [[x0, y0], [x1, y1]] = s.map(px), n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
  for (let i = 0; i <= n; i++){ const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); R(b, X + x - 1, Y + y, 3, 1, STICKS.ink); }
  for (let i = 0; i <= n; i++){ const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); R(b, X + x, Y + y, 1, 1, i % 4 === 0 ? STICKS.end : STICKS.wood); }
}
// Lining up for the drill (at: where each one stands, by id, and you, [x, y] or [x, y, facing]; facing: the way everyone
// faces, but for any who say otherwise): the pupils leap to their places, out of theirs for now (inClass), and you walk to
// yours (decided 7 November 2026, after trying it: training where you stood, you and the senior pupil struck at each
// other). Gives who moved, to go back after (drillBack).
async function drillLineUp(at, facing){
  const now = performance.now(), moved = [];
  for (const [id, [x, y, dir]] of Object.entries(at)){
    const n = id !== 'you' && NPCS.find(c => c.id === id);
    if (!n) continue;
    inClass.add(id); moved.push(n);
    if (n.x !== x || n.y !== y) n.mv = {fx:n.x, fy:n.y, t0:now, dur:LEAP_MS, far:true};
    n.x = x; n.y = y; n.dir = dir || facing;
  }
  if (moved.length) SFX.turn();
  if (at.you) await walkTo(at.you[0], at.you[1], at.you[2] || facing);
  await sleep(LEAP_MS);
  return moved;
}
function drillBack(moved){
  const was = moved.map(n => [n, n.x, n.y]);
  moved.forEach(n => inClass.delete(n.id)); placeCharacters();
  const now = performance.now();
  for (const [n, fx, fy] of was) if (n.x !== fx || n.y !== fy) n.mv = {fx, fy, t0:now, dur:LEAP_MS, far:true};
}
// You walk to a square, a step at a time, the shortest way (as when someone leads you there), and turn to face dir.
async function walkTo(x, y, dir){
  held = null; queued = null;
  for (const [px, py] of pathTo([pl.x, pl.y], [x, y])){
    pl.dir = dirOf(px - pl.x, py - pl.y); pl.mv = {fx:pl.x, fy:pl.y, tx:px, ty:py, t0:performance.now(), led:true}; pl.parity ^= 1;
    await sleep(STEP);
    pl.x = px; pl.y = py; pl.px = px * T; pl.py = py * T; pl.mv = null;
  }
  pl.dir = dir || pl.dir; pl.turnT = performance.now();
  S.pos = {place:PLACE, x:pl.x, y:pl.y, dir:pl.dir}; save();
}
// A pupil in the drill (draw.js draws them with this): striking in time with you.
function drawDrill(n, X, Y, now){
  const t = (now - drillAt.t0) / SWING_MS, phase = t < 0 || t > 1.6 ? 'rest' : t < SWING_CONTACT ? 'up' : 'down', dir = n.dir;
  if (dir === 'up') drawStaff(X, Y, dir, phase);   // (from behind, it's in front of them)
  drawEntityMonkey(n.kind, X, Y - (phase === 'down' ? 0 : phase === 'up' ? 1 : 0), dir, now, 0, 0, n.x + n.y);
  if (dir !== 'up') drawStaff(X, Y, dir, phase);
}

/* ================= THE STEPS ================= */
const POUR = {ms:1700, tip:500}, KNEEL_MS = 750;
Object.assign(STEP_OPTIONS, {class:['taught', 'do', 'end'], recap:['from', 'sticks', 'count', 'label', 'lines'], face:['line', 'check'], numbers:['label'], drill:['at', 'facing', 'label'], writeName:['py', 'label']});
Object.assign(STEPS, {
  // A class with the master (class: its name, over every card; taught: the words it teaches, for its end card; do: its
  // steps; end: a line on its end card, such as what's next).
  async class(s, who){
    const was = lessonBar; lessonBar = esc(fill(s.class)); classScore = {right:0, asked:0};
    let r;
    try { r = await runSteps(s.do, who); } finally { lessonBar = was; }
    const sc = classScore; classScore = null;
    if (r === STOP) return STOP;
    await classEnd(s, sc);
  },
  // Did you listen last time? (recap: how many questions, on words from from, those needing practice first.) Numbers you
  // know: count the sticks the master holds up and choose the number (count: his line, such as 这是几？), or hear it and
  // choose its sticks (sticks); or the four sides (lines: each one's line, such as 看北边！), turning to face each.
  async recap(s, who){
    const pool = s.from.filter(w => WORDS[w] && lvl(w) >= 1 && !NOT_HOW_MANY.includes(w));
    const words = nextWords(pool, Math.min(s.recap, pool.length));
    for (const w of words){
      if (s.lines) await faceQ(who, s.lines[w], w, {check:true});
      else if (s.count) await countSticksQ(w, {pool, line:s.count, who});
      else await numberQ(w, {pool, sticks:!!s.sticks, who, label:s.label || 'Listen. Which is it?'});
    }
  },
  // Turning to face the way the master says (face: the side's word; line: his line), as he teaches it.
  async face(s, who){ await faceQ(who, s.line, s.face, {check:!!s.check}); },
  // Counting on from ten, with sticks (countOn): the master's first class.
  async countOn(){ await countOn(); },
  // Numbers from 十一 to 二十 to choose, as you hear them (numbers: how many), the ones needing practice first.
  async numbers(s, who){
    const pool = TEENS.filter(w => lvl(w) >= 1);
    for (const w of nextWords(pool, Math.min(s.numbers, pool.length))) await numberQ(w, {pool, who, label:s.label || 'Listen. Which is it?'});
  },
  // Morning training (drill: how many rounds; at: where everyone lines up, the pupils training with you and the one
  // leading it, who, and you; facing: the way you all face): each round, the number of strikes he calls out (a number
  // question), then everyone strikes that many times together, counted aloud; then back to their places.
  async drill(s, who){
    const pool = TEENS.filter(w => lvl(w) >= 1);
    if (!pool.length) return;
    held = null; queued = null;
    const moved = await drillLineUp(s.at || {}, s.facing || 'right'), all = Object.keys(s.at || {}).filter(id => id !== 'you');
    try {
      for (let i = 1; i <= s.drill; i++){
        const w = nextWords(pool, 1)[0];
        await numberQ(w, {pool, who, label:`${fill(s.label || 'How many strikes?')} (${i} of ${s.drill})`});
        await drillStrikes(numberOf(w), all);
      }
    } finally { drillAt = null; drillBack(moved); }
    SFX.chime();
  },
  // You crouch down at what you face, your paws on the ground, for a moment (kneel: what you're doing), such as planting
  // your little tree before it comes up out of the ground (the plant step).
  async kneel(s){ startAct('kneel', {what:s.kneel}); await sleep(KNEEL_MS); acting = null; },
  // Lighting a fire (light: what the story becomes, such as {fire:2}): you kneel at what you face, such as the brazier,
  // the wood you're carrying goes in, and the flames rise (drawFires; the brazier's look changes with the story).
  async light(s){
    startAct('kneel', {what:'火'}); SFX.scuffle();
    await sleep(KNEEL_MS); acting = null;
    delete here().carrying; Object.assign(here(), s.light); save(); placeCharacters(); refreshMap();
    fireLit = performance.now(); SFX.swish(.2); await sleep(900);
  },
  // Writing practice (writeName: what you write, such as 孙悟空; py: its pinyin, a syllable a character; label): a
  // character at a time, with a brush, on practice paper (writeCard).
  async writeName(s){ await writeCard(s.writeName, {py:s.py || '', label:s.label}); },
  // You pour the bucket you're carrying over what you face (pour: what's in it, 水), such as your little peach tree: held
  // out over it, tipped up, the water pouring out and splashing at its foot (ACTS.pour, js/draw.js); then you're carrying
  // nothing.
  async pour(s){
    startAct('pour', {what:s.pour});
    await sleep(POUR.tip); SFX.splash(.12);
    await sleep(POUR.ms - POUR.tip - 300); SFX.splash(.06);
    await sleep(300);
    acting = null; delete here().carrying; save();   // (it's empty now)
  }
});

/* ================= WRITING YOUR NAME ================= */
// Your name, 孙悟空, as pixel characters (as everything written in the world is: HANZI, js/art.js), for the writing card
// and the plaque over your door.
Object.assign(HANZI, {
  '孙': [".####...#...", "...#....#...", "..#.....#...", "..#...#.#.#.", "..#..#..#..#", "####.#..#..#", "..#.#...#...", "..#.....#...", "..#.....#...", ".##....##..."],
  '悟': ["..#..######", "..#...#....", "#.##.#####.", "#.#...#..#.", "..#..######", "..#........", "..#..#####.", "..#..#...#.", "..#..#...#.", "..#..#####."],
  '空': ["....#.....", ".....#....", "##########", "#..#..#..#", "..#....#..", ".#......#.", "..######..", "....#.....", "....#.....", "....#.....", "##########"]
});
// The order a character's pixels are written in, as a brush would: stroke by stroke (each run of touching pixels, top
// first, then left), each from its top-left end along its length.
function brushOrder(rows){
  const on = (x, y) => y >= 0 && y < rows.length && x >= 0 && x < rows[y].length && rows[y][x] === '#', seen = new Set(), out = [];
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++){
    if (!on(x, y) || seen.has(x + ',' + y)) continue;
    const q = [[x, y]]; seen.add(x + ',' + y);
    while (q.length){
      const [a, b] = q.shift(); out.push([a, b]);
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1], [-1, 0], [0, -1]]){ const k = (a + dx) + ',' + (b + dy); if (on(a + dx, b + dy) && !seen.has(k)){ seen.add(k); q.push([a + dx, b + dy]); } }
    }
  }
  return out;
}
const WRITE = {px:5, box:16, ms:1100};   // each pixel drawn 5 × 5, in a box 16 pixels square (room round the character); a character takes 1.1 s
// Writing practice (the writeName step: what, such as 孙悟空): a sheet of practice paper, a red-lined box for each
// character; A writes the next, the brush going stroke by stroke, its pinyin under it once it's written. Nothing to get
// wrong. Then your name is said, whole.
function writeCard(text, {label = 'Writing practice', py = ''} = {}){
  const chars = [...text], pys = py.split(' ');
  return new Promise(res => {
    let done = 0, busyWriting = false;
    const size = WRITE.box * WRITE.px;
    openCard(`<p class="label">${esc(label)}</p>
      <div class="writepad">${chars.map((c, i) => `<div class="wbox"><canvas width="${size}" height="${size}" data-i="${i}"></canvas><div class="py" data-py="${i}"></div></div>`).join('')}</div>
      <p class="note writenote">Press A to write each character with the brush.</p>
      <div class="actions"><button class="btn primary" data-a="next">Write ▸</button></div>`);
    const boxes = [...sheet.querySelectorAll('.wbox canvas')];
    boxes.forEach(cv => paper(cv.getContext('2d'), size));
    on('[data-a=next]', async () => {
      if (busyWriting) return;
      if (done === chars.length){ closeCard(); res(); return; }
      busyWriting = true;
      const i = done, rows = HANZI[chars[i]], g = boxes[i].getContext('2d'), order = brushOrder(rows);
      const ox = Math.floor((WRITE.box - rows[0].length) / 2) * WRITE.px, oy = Math.floor((WRITE.box - rows.length) / 2) * WRITE.px;
      for (let k = 0; k < order.length; k++){
        const [x, y] = order[k];
        R(g, ox + x * WRITE.px, oy + y * WRITE.px, WRITE.px, WRITE.px, '#1E1A16');
        if (k % 6 === 0) SFX.sweep();
        await sleep(WRITE.ms / order.length);
      }
      const p = sheet.querySelector(`[data-py="${i}"]`); if (p) p.textContent = pys[i] || '';
      done++; busyWriting = false;
      const btn = sheet.querySelector('[data-a=next]');
      if (done === chars.length){ SFX.chime(); say(text); if (btn) btn.textContent = 'Done'; const n = sheet.querySelector('.writenote'); if (n) n.textContent = `${text} ${py}: your name, in your own hand!`; }
    });
  });
}
// Practice paper: cream, with a red box and its dashed guide lines (田字格), to write in.
function paper(g, size){
  R(g, 0, 0, size, size, '#F6EED8');
  g.fillStyle = '#D9544A'; g.fillRect(0, 0, size, 2); g.fillRect(0, size - 2, size, 2); g.fillRect(0, 0, 2, size); g.fillRect(size - 2, 0, 2, size);
  for (let i = 4; i < size - 4; i += 6){ R(g, i, size / 2 - 1, 3, 1, '#E8A49C'); R(g, size / 2 - 1, i, 1, 3, '#E8A49C'); }
}
// A wooden plaque over a door (a place's plaques: {at:[x, y], text, if}), its writing in gold: such as your name over
// your room, once you've written it. Drawn on the map under everyone, its bottom on the top of the square.
function drawPlaques(cx, cy){
  for (const p of (PLACES[PLACE] || {}).plaques || []){
    if (p.if && !matches(p.if)) continue;
    const [w, h] = writtenSize(p.text), W = w + 6, H = h + 4, X = p.at[0] * T + 8 - Math.floor(W / 2) - cx, Y = p.at[1] * T - H + 1 - cy;
    if (X + W < 0 || Y + H < 0 || X > VW * T || Y > VH * T) continue;
    R(b, X, Y, W, H, '#2A1610'); R(b, X + 1, Y + 1, W - 2, H - 2, '#C9A04A'); R(b, X + 2, Y + 2, W - 4, H - 4, '#4A2416');
    R(b, X + 2, Y + H - 1, W - 4, 1, 'rgba(0,0,0,.25)');
    write(b, p.text, X + 3, Y + 2, '#F0CE6E');
  }
}

/* ================= SPARRING ================= */
// A pupil you spar with (an enemy with person: their id), as they look on the map, from the front, holding a staff upright
// in their hand (the battle's picture: foePic, js/battle.js).
const personPicCache = {};
function personPic(kind){
  if (personPicCache[kind]) return personPicCache[kind];
  const rows = personRows(kind, 'down', false, 0).map(r => [...r]);
  for (let y = 0; y < 16; y++){ rows[y][14] = y === 0 || y === 15 ? 'O' : 'L'; if (rows[y][15] === '.') rows[y][15] = 'O'; if (rows[y][13] === '.') rows[y][13] = 'O'; }
  const pal = {...PERSON_PAL, ...PALS[kind]};
  return personPicCache[kind] = {rows:rows.map(r => r.join('')), palette:{...pal, n:shade(pal.c, -.25), L:STICKS.wood, O:STICKS.ink}};
}
// The courtyard of the immortal's cave, behind a sparring match: the sky over the rock, the lecture hall under its dark
// roof, and the paving; and under snow in winter (the cave's backdrop: courtyard, or courtyardSnow).
function courtyardBackdrop(snow){
  const W = 72, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), sky = g.createLinearGradient(0, 0, 0, 34);
  sky.addColorStop(0, snow ? '#B9C7D6' : '#86BEE8'); sky.addColorStop(1, snow ? '#E2E8EE' : '#D4ECF8'); g.fillStyle = sky; g.fillRect(0, 0, W, 34);
  R(g, 0, 22, W, 32, '#8E9AA0');   // the rock round the courtyard
  for (let x = 0; x < W; x += 5){ const h = 3 + Math.floor(rnd(x, 2, 9) * 6); R(g, x, 22 - h, 5, h + 1, '#A3AEB3'); R(g, x, 22 - h, 5, 1, snow ? '#F4F8FC' : '#C2CBCF'); }
  for (let i = 0; i < 16; i++) R(g, Math.floor(rnd(i, 4, 1) * W), 26 + Math.floor(rnd(i, 5, 2) * 24), 1, 3, '#77838A');   // cracks
  R(g, 14, 36, 44, 18, '#F2ECDD'); R(g, 14, 36, 44, 1, '#C9C0AC');   // the hall's white walls
  for (const x of [18, 26, 42, 50]){ R(g, x, 41, 4, 5, '#7A5232'); R(g, x + 1, 42, 2, 3, '#C9A06A'); }   // its windows
  R(g, 32, 40, 8, 14, '#6B3A22'); R(g, 33, 41, 3, 13, '#8A4E2E'); R(g, 36, 41, 3, 13, '#8A4E2E');   // its doors
  R(g, 10, 30, 52, 7, '#3E4248'); R(g, 8, 36, 56, 2, '#2C3036');   // its dark roof
  if (snow){ R(g, 10, 29, 52, 2, '#F4F8FC'); R(g, 12, 31, 48, 1, '#DCE6EE'); }
  R(g, 0, 54, W, H - 54, snow ? '#E8EEF3' : '#A9AFB0');   // the paving
  for (let y = 56; y < H; y += 6) for (let x = (y % 12 ? 0 : 6); x < W; x += 12) R(g, x, y, 11, 1, snow ? '#D2DCE4' : '#8F9697');
  if (snow) for (let i = 0; i < 60; i++) R(g, Math.floor(rnd(i, 7, 3) * W), Math.floor(rnd(i, 8, 4) * H), 1, 1, '#FFFFFF');
  return c;
}
Object.assign(BACKDROPS, {courtyard:() => courtyardBackdrop(false), courtyardSnow:() => courtyardBackdrop(true)});
if (document.documentElement) for (const name of ['courtyard', 'courtyardSnow']) document.documentElement.style.setProperty(`--backdrop-${name}`, `url(${BACKDROPS[name]().toDataURL()})`);

/* ================= WINTER ================= */
// The fire (winter): a bronze brazier on three legs in the middle of the courtyard; you bring wood from the pile you filled
// in autumn and light it (the light step: kneeling at it, then the flames rising), and the pupils gather round it. Its
// flames, a place's fires (each {at:[x, y], if}), are drawn each frame over it, flickering, with sparks and a warm glow.
function brazierArt(t, X, Y, logs){
  const bronze = ['#3E2A1A', '#6A4A2A', '#9A6A38', '#C8924A'];
  for (const [lx, ly] of [[3, 11], [12, 11], [7, 12]]){ R(t, X + lx, Y + ly, 2, 4, bronze[1]); R(t, X + lx, Y + ly, 1, 4, bronze[2]); }   // its three legs
  oval(t, X + 8, Y + 9, 7, 3, bronze[1]); oval(t, X + 8, Y + 8, 7, 2, bronze[2]);   // the bowl
  R(t, X + 2, Y + 7, 12, 1, bronze[3]); R(t, X + 3, Y + 6, 10, 1, bronze[0]);       // its rim, and the dark inside
  if (logs){ R(t, X + 4, Y + 4, 8, 2, WOODS[2]); R(t, X + 6, Y + 3, 5, 2, WOODS[3]); R(t, X + 4, Y + 4, 1, 2, WOODS[4]); R(t, X + 11, Y + 4, 1, 2, '#E8C890'); }   // logs in it
}
OBJECT_ART.brazier = (g, o) => inked(g, o, t => brazierArt(t, o.x*T, o.y*T, false));
OBJECT_ART.brazierLit = (g, o) => inked(g, o, t => brazierArt(t, o.x*T, o.y*T, true));
Object.assign(LOOKS, {brazier:LOOKS.paving, brazierLit:LOOKS.paving});
OBJECT_KIND.brazierLit = 'own';   // (no snow on a brazier that's burning)
let fireLit = -1e9;   // when the fire was lit (its flames rising, the first moment)
function drawFires(cx, cy, now){
  for (const f of (PLACES[PLACE] || {}).fires || []){
    if (f.if && !matches(f.if)) continue;
    const X = f.at[0] * T + 8 - cx, Y = f.at[1] * T + 6 - cy, rise = clamp((now - fireLit) / 900, .15, 1);
    if (X < -24 || Y < -40 || X > VW*T + 24 || Y > VH*T + 24) continue;
    b.globalAlpha = .16 + .05 * Math.sin(now / 130); disc(b, X, Y - 2, 15, '#FFB050'); b.globalAlpha = 1;   // its warm glow
    for (const [k, col, w] of [[1, '#C8381E', 6], [.78, '#F07A22', 5], [.55, '#FFC64A', 3], [.32, '#FFF2B8', 2]]){   // the flames, from the outside in
      const h = Math.round((9 + 3 * Math.sin(now / 90 + k * 7)) * k * rise);
      for (let i = 0; i < h; i++){ const ww = Math.max(1, Math.round(w * (1 - i / (h + 1)) * (1 + .15 * Math.sin(now / 70 + i)))); R(b, X - Math.floor(ww / 2) + Math.round(Math.sin(now / 110 + i * .7) * (i / 6)), Y - i, ww, 1, col); }
    }
    for (let i = 0; i < 3; i++){ const p = ((now / 900 + i / 3) % 1), sx = X + Math.round(Math.sin(now / 300 + i * 2) * 4), sy = Y - 6 - Math.round(p * 18); if (p < .85) R(b, sx, sy, 1, 1, p < .5 ? '#FFE27A' : '#F07A22'); }   // sparks
  }
}
// Red lanterns hung for New Year (a place's lanterns: each {at:[x, y], if}), under the eaves, swaying a little, glowing.
function drawLanterns(cx, cy, now){
  for (const l of (PLACES[PLACE] || {}).lanterns || []){
    if (l.if && !matches(l.if)) continue;
    const sway = Math.round(Math.sin(now / 700 + l.at[0]) * 1), X = l.at[0] * T + 8 - cx + sway, Y = l.at[1] * T + 1 - cy;
    if (X < -16 || Y < -16 || X > VW*T + 16 || Y > VH*T + 16) continue;
    R(b, X, Y - 3, 1, 3, '#3A2A1E');                                                           // its cord
    b.globalAlpha = .18; disc(b, X, Y + 5, 9, '#FF7A4A'); b.globalAlpha = 1;                  // its glow
    R(b, X - 3, Y, 7, 1, '#C9A04A'); oval(b, X, Y + 5, 5, 4, '#C8241E'); oval(b, X - 1, Y + 4, 2, 2, '#E85A3A');   // the lantern, its gold caps
    R(b, X - 3, Y + 9, 7, 1, '#C9A04A'); R(b, X, Y + 10, 1, 3, '#E8C25A');                     // and its tassel
  }
}
// A snowman, built in the courtyard as you watch (setUp): its big ball, then the next, its head, then its face, stick
// arms and a red scarf (stage).
function snowmanArt(t, X, Y, stage){
  if (stage >= 1){ oval(t, X + 8, Y + 12, 6, 4, '#E4ECF2'); oval(t, X + 7, Y + 11, 4, 2, '#FFFFFF'); }
  if (stage >= 2){ oval(t, X + 8, Y + 6, 4, 3, '#E4ECF2'); oval(t, X + 7, Y + 5, 3, 2, '#FFFFFF'); }
  if (stage >= 3){ oval(t, X + 8, Y + 1, 3, 3, '#EEF3F7'); oval(t, X + 7, Y, 2, 2, '#FFFFFF'); }
  if (stage >= 4){
    R(t, X + 6, Y, 1, 1, '#1E1A16'); R(t, X + 9, Y, 1, 1, '#1E1A16'); R(t, X + 8, Y + 1, 2, 1, '#E8862A');   // coal eyes, a carrot nose
    R(t, X + 5, Y + 3, 7, 1, '#C8241E'); R(t, X + 10, Y + 4, 1, 2, '#C8241E');                           // a red scarf
    for (const [x0, y0, x1, y1] of [[4, 6, 0, 3], [12, 6, 15, 3]]) for (let i = 0; i <= 4; i++) R(t, X + Math.round(x0 + (x1 - x0) * i / 4), Y + Math.round(y0 + (y1 - y0) * i / 4), 1, 1, '#6A4220');   // stick arms
    for (const dy of [6, 8, 11]) R(t, X + 8, Y + dy, 1, 1, '#2A2420');   // buttons
  }
}
OBJECT_ART.snowman = (g, o) => inked(g, o, t => snowmanArt(t, o.x*T, o.y*T, o.stage ?? OBJECT_STAGES.snowman));
OBJECT_STAGES.snowman = 4;
OBJECT_KIND.snowman = 'own';
LOOKS.snowman = LOOKS.mossStone;
// The New Year's Eve dinner (setUp): a low red table, then bowls of rice (米饭), then the fish you brought, a fish on the
// New Year table for plenty (鱼 yú sounds like 余, more than enough).
function nyTableArt(t, X, Y, stage){
  if (stage >= 1){ R(t, X + 1, Y + 6, 14, 5, '#9A2A22'); R(t, X + 1, Y + 6, 14, 1, '#C8483A'); R(t, X + 2, Y + 11, 2, 4, '#6A1A16'); R(t, X + 12, Y + 11, 2, 4, '#6A1A16'); }
  if (stage >= 2) for (const bx of [3, 11]){ oval(t, X + bx, Y + 5, 2, 1, '#F4F4EE'); R(t, X + bx - 2, Y + 6, 5, 2, '#E8EEF2'); R(t, X + bx - 1, Y + 8, 3, 1, '#9AB8D0'); }   // two bowls of rice
  if (stage >= 3){ oval(t, X + 8, Y + 7, 4, 2, '#F2F2EA'); oval(t, X + 8, Y + 6, 3, 1, '#C8924A'); R(t, X + 4, Y + 6, 2, 1, '#A86A2A'); R(t, X + 11, Y + 5, 1, 3, '#A86A2A'); }   // the fish, on its plate
}
OBJECT_ART.nyTable = (g, o) => inked(g, o, t => nyTableArt(t, o.x*T, o.y*T, o.stage ?? OBJECT_STAGES.nyTable));
OBJECT_STAGES.nyTable = 3;
OBJECT_KIND.nyTable = 'own';
LOOKS.nyTable = LOOKS.paving;
// The supply basket at the foot of the mountain (the trip, winter): a big woven basket, its rope going up out of sight to
// the pupils at the top, who haul you up in it (the basketUp scene).
function supplyBasketArt(t, X, Y){
  R(t, X + 8, Y - 40, 1, 44, '#C8A86A');   // the rope, up out of sight
  for (let y = 0; y < 9; y++) R(t, X + 2 + (y > 6 ? 1 : 0), Y + 5 + y, 12 - (y > 6 ? 2 : 0), 1, y % 2 ? '#A8743E' : '#C89A5A');   // woven
  for (let x = 3; x < 14; x += 3) R(t, X + x, Y + 5, 1, 9, '#8A5A30');
  R(t, X + 1, Y + 4, 14, 2, '#6A4220'); R(t, X + 4, Y + 1, 1, 4, '#6A4220'); R(t, X + 11, Y + 1, 1, 4, '#6A4220'); R(t, X + 4, Y + 1, 8, 1, '#6A4220');   // its rim and handles
}
OBJECT_ART.supplyBasket = (g, o) => inked(g, o, t => supplyBasketArt(t, o.x*T, o.y*T));
LOOKS.supplyBasket = (g, X, Y, x, y) => LOOKS.grass(g, X, Y, x, y);

// Hauled up the mountain in the supply basket (the basketUp scene, winter's trip): the cliff sliding down past you, clouds
// drifting by, the rope going up, you in the basket with the rice and the fish; at the top, the pupils hauling.
function drawBasketUp(t, now){
  const W = VW*T, H = VH*T, rise = t * 34;
  for (let y = 0; y < H; y += 2) R(b, 0, y, W, 2, mix('#B9C7D6', '#E2E8EE', y / H));
  for (const side of [0, 1]) for (let y = -T; y < H + T; y += T){   // the cliff on either side, sliding down
    const yy = Math.round(((y + rise) % (H + 2 * T)) - T);
    for (let x = 0; x < 3; x++) karstFace(b, side ? W - (x + 1) * T : x * T, yy, x, Math.floor((y + rise) / T));
    R(b, side ? W - 3 * T : 3 * T - 2, yy, 2, T, '#7C878E');
  }
  for (let i = 0; i < 5; i++){ const cy = ((rnd(i, 7) * H + rise * (1.4 + i * .1)) % (H + 60)) - 30, cx = 40 + rnd(i, 8) * (W - 80); for (let k = 0; k < 4; k++) oval(b, Math.round(cx + k * 9), Math.round(cy + (k % 2) * 3), 9 - k, 4, '#F4F7FA'); }   // clouds drifting past
  const sway = Math.round(Math.sin(now / 500) * 2), bx = W / 2 - 12 + sway, by = H / 2 - 4;
  R(b, bx + 12, 0, 1, by, '#C8A86A');   // the rope
  b.drawImage(monkeySprite('player', 'down', false), bx + 4, by - 10, 16, 16);
  sackPic(bx + 16, by + 2);   // the rice
  for (let y = 0; y < 12; y++) R(b, bx + (y > 9 ? 1 : 0), by + 2 + y, 24 - (y > 9 ? 2 : 0), 1, y % 2 ? '#A8743E' : '#C89A5A');   // the basket
  R(b, bx - 1, by + 1, 26, 2, '#6A4220');
  if (t > 6){   // the top: the pupils, hauling
    const top = Math.round(Math.min(0, (t - 8) * 30)) - 4;
    R(b, 0, top - 10, W, 24, '#A3ADB2'); R(b, 0, top + 13, W, 2, '#7C878E');
    for (const [i, id] of [[0, 'senior'], [1, 'darePupil'], [2, 'pupil4']]) b.drawImage(monkeySprite(id, 'down', false, Math.floor(now / 250 + i) % 2), W / 2 - 34 + i * 22, top - 8, 16, 16);
  }
}
Object.assign(SCENE_ART, {basketUp: drawBasketUp});   // (its sounds: SCENE_SOUNDS, js/main.js)

/* ================= LOOKS ================= */
// Lingzhi (灵芝), the mushroom of long life, growing out of the rock among the stone pillars: glossy red-brown caps shaped
// like kidneys, one over another on short stalks, each with a pale rim (on the mountain's mossy stone, in its season).
LOOKS.lingzhi = (g, X, Y, x, y) => {
  LOOKS.mossStone(g, X, Y, x, y);
  oval(g, X + 8, Y + 14, 6, 1, 'rgba(30,30,25,.28)');
  // a fan, as seen from the front and a little above: flat underneath (by), round on top (h rows), an ochre rim round its
  // curve, deep red-brown inside with a lighter ring, and a glint; outlined dark
  const fan = (cx, by, rx, h) => {
    const wAt = r => Math.round(rx * Math.sqrt(Math.max(0, 1 - (r / (h + .7)) ** 2)));
    for (let r = 0; r <= h; r++){ const w = wAt(r); R(g, cx - w - 1, by - r, 2 * w + 3, 1, '#3A1A10'); }
    R(g, cx - wAt(h) , by - h - 1, 2 * wAt(h) + 1, 1, '#3A1A10');
    for (let r = 0; r <= h; r++){
      const w = wAt(r), top = w - wAt(r + 1);   // (how far this row reaches past the one above: the rim's width there)
      R(g, cx - w, by - r, 2 * w + 1, 1, '#E0A43C');
      if (r < h){ const i = Math.max(1, top); R(g, cx - w + i, by - r, 2 * (w - i) + 1, 1, '#8E2E1E'); }
      if (r >= 1 && r < h - 1 && w > 3) R(g, cx - w + 3, by - r, 2 * (w - 3) + 1, 1, '#B44A28');
    }
    R(g, cx - wAt(0) + 1, by + 1, 2 * wAt(0) - 1, 1, '#5A2416');   // its flat underside, in shadow
    dot(g, cx - Math.max(1, Math.round(rx / 2)), by - h + 1, '#F2D8B0');   // a glint
  };
  R(g, X + 7, Y + 8, 2, 6, '#5A2E1A'); R(g, X + 8, Y + 8, 1, 6, '#7A4428'); R(g, X + 3, Y + 13, 1, 1, '#5A2E1A'); R(g, X + 12, Y + 13, 1, 1, '#5A2E1A');   // the stalks
  fan(X + 8, Y + 7, 6, 4);   // the big one, up on its stalk
  fan(X + 3, Y + 12, 2, 2); fan(X + 12, Y + 12, 2, 2);   // two little ones either side of it
};
// The first snow, settling on the stone by your room as autumn ends: a dusting of white, and flakes.
LOOKS.firstSnow = (g, X, Y, x, y) => {
  LOOKS.mossStone(g, X, Y, x, y);
  for (const [dx, dy, w] of [[3, 7, 4], [2, 8, 9], [4, 9, 8], [6, 10, 6], [9, 7, 3], [11, 9, 3]]) R(g, X + dx, Y + dy, w, 1, '#F4F8FC');
  for (const [dx, dy] of [[2, 3], [7, 2], [12, 4], [5, 12], [13, 12], [9, 13]]){ R(g, X + dx, Y + dy, 1, 1, '#FFFFFF'); }
  R(g, X + 4, Y + 10, 6, 1, '#D2DCE4');
};
// The first leaf of autumn, drifted down onto the stone by your room as summer ends: yellow, its stalk and veins brown.
LOOKS.fallenLeaf = (g, X, Y, x, y) => {
  LOOKS.mossStone(g, X, Y, x, y);
  oval(g, X + 8, Y + 11, 4, 1, 'rgba(30,30,25,.2)');
  for (const [dx, dy, w] of [[-1, -3, 2], [-3, -2, 6], [-4, -1, 8], [-4, 0, 8], [-3, 1, 6], [-1, 2, 2]]) R(g, X + 8 + dx, Y + 9 + dy, w, 1, '#E8B62E');
  R(g, X + 5, Y + 8, 3, 1, '#F6D45A'); R(g, X + 4, Y + 9, 8, 1, '#A87A1E'); R(g, X + 12, Y + 10, 2, 1, '#7A5418');   // its middle vein and stalk
};
