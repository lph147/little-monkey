// Treasures and trading (decided 9 November 2026, the trade plan and its proposal page, built as one batch at the owner's
// request): treasures to find all over Flower Fruit Mountain once the old monkey has told you about them, the 老板 buying
// them (卖, taught by your first sale), tools and things for the Water Curtain Cave to spend your shells on (words you catch
// only by buying them), your lantern at night, and the Ready to sail? card at the raft. Loaded after js/daynight.js.
// Daily wishes, the plan's last part, wait: the owner hasn't decided what they want them to be (DESIGN.md).

/* ================= TREASURES ================= */
// Every treasure there is (the word bank's treasures page), for the bag's Treasures tab and whoever buys them.
const TREASURE_WORDS = Object.keys(WORD_BANK).filter(w => WORD_BANK[w].category === 'treasures');
// The area each treasure is found in, and what it says about it (its price, its clue, what you say to sell it): this area's
// own, or an earlier one's (such as Flower Fruit Mountain's, sold in the human world).
const TREASURE_INFO = Object.fromEntries(TREASURE_WORDS.map(w => [w, (AREAS.find(A => A.treasures && A.treasures[w]) || {treasures:{[w]:{}}}).treasures[w]]));
// The spots here: this area's own (AREA.treasures, once its treasuresIf matches), and an earlier area's in the places borrowed
// from it, at home (Flower Fruit Mountain's, in the human world's chapter 2: decided 9 November 2026, anything you missed
// can still be found later in the story), found once there or here, as kept with that area's finds. Each: the treasure's
// word (w) and what it says (t), which of its spots (i), where (x, y, place), the area it's kept with (from), its own look
// and colour if it has one, and its key in the finds (t:word:i).
const TREASURE_SPOTS = (() => {
  const out = [], hereFrom = (n, id) => Object.keys(PLACES).find(k => PLACES[k].borrowed && PLACES[k].borrowed.from === n && PLACES[k].borrowed.id === id);
  for (const A of [AREA, ...AREAS.filter(a => a.number < AREA.number)]) for (const [w, t] of Object.entries(A.treasures || {})) (t.spots || []).forEach((s, i) => {
    const place = A === AREA ? placeOf(s) : hereFrom(A.number, placeOf(s));
    if (place && PLACES[place]) out.push({w, t, i, x:s[0], y:s[1], place, from:A.number, own:A === AREA, ...(s[3] || {}), key:`t:${w}:${i}`});
  });
  return out;
})();
const findsOf = n => { if (n === AREA.number) return here().finds; const a = S.areas[n] = S.areas[n] || {}; return a.finds = a.finds || {}; };
const dayNo = () => (S.clock && S.clock.n) || 0;   // (the day it is: js/daynight.js)
// Gold glints in the water after heavy rain (大雨) that day, from when the rain began till the day ends (never in winter, when it snows).
const goldToday = () => clockOn() && rainHeavy() && seasonNow() !== 'winter' && (S.clock.t || 0) >= RAIN_AT(dayNo()) * DAY_MS;
const spotTaken = sp => { const f = findsOf(sp.from)[sp.key]; return sp.t.daily ? f === dayNo() : !!f; };   // (a daily one: taken today; else, for good)
// A spot now: 'here' (you can take it), 'shut' (you can see it but not take it now, such as a clam by day), or null.
function spotNow(sp){
  if ((sp.own && !matches(AREA.treasuresIf || {})) || spotTaken(sp)) return null;
  const w = sp.t.when, now = !w || (w === 'day' ? !isNight() : w === 'night' ? isNight() : w === 'rain' ? goldToday() : true);
  return now ? 'here' : sp.t.shut ? 'shut' : null;
}
const spotAt = (x, y) => TREASURE_SPOTS.find(sp => sp.place === PLACE && sp.x === x && sp.y === y && spotNow(sp));
const spotLooks = sp => spotNow(sp) === 'shut' ? sp.t.shut : sp.look || sp.t.look;   // its picture on the map now (MAP_ICONS)
// The treasures still to find in a place, now (the map's close-up: js/map.js), and whether one is only out by day or at night.
const treasuresIn = id => [...new Set(TREASURE_SPOTS.filter(sp => sp.place === id && spotNow(sp)).map(sp => sp.w))];
const treasureTime = w => { const t = TREASURE_INFO[w] || {}; return t.when === 'day' || t.when === 'night' ? t.when : null; };
// Each thing of one colour among them, such as a red feather (红色的羽毛), for the voices and CHINESE.md (COLOURED, js/world.js).
const colouredThings = () => TREASURE_SPOTS.filter(sp => sp.colour).map(sp => ({word:sp.w, colour:sp.colour}));
// Its glint now and then (as things hidden off the path: glintsNow, js/draw.js), at night only close by, or further with
// your lantern.
const NIGHT_GLINT = 3, LANTERN_GLINT = 7;
function treasureGlints(now){
  const out = [], far = isNight() ? (hasTool('灯笼') ? LANTERN_GLINT : NIGHT_GLINT) : Infinity;
  for (const sp of TREASURE_SPOTS){
    if (sp.place !== PLACE || spotNow(sp) !== 'here' || Math.max(Math.abs(sp.x - pl.x), Math.abs(sp.y - pl.y)) > far) continue;
    const t = (now + sp.x * 977 + sp.y * 613) % GLINT_EVERY;
    if (t < GLINT_MS) out.push([sp.x, sp.y, Math.sin(t / GLINT_MS * Math.PI)]);
  }
  return out;
}
// Taking a treasure (A at it): what you do there (its how), with questions on words you know first for the rarer ones, as
// in reeling in a fish; a wrong answer and it slips away for now, nothing lost; then it's yours, in your bag (as many as you
// like: treasures do nothing else), and the first of its kind is a new word, with its card.
async function takeTreasure(sp){
  const t = sp.t, w = sp.w, pic = sp.colour ? (PICTURES[`${sp.colour} 的 ${w}`] ? `${sp.colour} 的 ${w}` : w) : w;
  if (spotNow(sp) === 'shut'){ SFX.bump(); toast(fill(t.shutNote)); return; }
  if (t.needs && !hasTool(t.needs)){ SFX.bump(); toast(fill(t.without)); return; }
  pl.dir = dirOf(sp.x - pl.x, sp.y - pl.y) || pl.dir;
  for (let n = 1; n <= (t.questions || 0); n++){
    if (t.how === 'hit') await STEPS.hit({hit:'jade'});
    if (t.how === 'dig') await STEPS.hit({hit:'earth', with:'铲子'});
    const q = nextWords(trainable(), 1)[0];
    if (q && !await catchQ(q, n, t.questions, pic, fill(t.ask || 'Quick:'))){ SFX.wrong(); toast(fill(t.slip || 'It slipped away! Try again.')); return; }
  }
  await pickUpAct(w, {at:[sp.x, sp.y], pic, ...(t.how === 'hit' || t.how === 'dig' ? {reach:'down'} : {})});
  findsOf(sp.from)[sp.key] = t.daily ? dayNo() : 1;
  S.bag[w] = (S.bag[w] || 0) + 1; save(); SFX.chime();
  if (lvl(w) === 0) await showNotice(w, {note:fill(t.note), ...(pic !== w ? {pic} : {})});
  else if (sp.colour && lvl(sp.colour) >= 1){ useWord(w); await showPicked(coloured({word:w, colour:sp.colour}), `You have ${S.bag[w]}.`, {label:'You found', pic}); }
  else useWord(w);
  toast(fill(t.took || `You found {${w}}!`));
  if (!talkingTo) await runEvents();
}

/* ================= THE CAVE'S THINGS ================= */
// Things for the Water Curtain Cave from the shop (AREA.decor; and at home in a later area, the area's whose cave it
// borrows): where each goes here, in the save's decor once set up (decorNew, bought and still to set up).
const DECOR_SPOTS = (() => {
  const A = [AREA, ...AREAS.filter(a => a.number < AREA.number)].find(a => a.decor);
  if (!A) return [];
  return Object.entries(A.decor).map(([w, d]) => {
    const id = A === AREA ? placeOf(d.at) : Object.keys(PLACES).find(k => PLACES[k].borrowed && PLACES[k].borrowed.from === A.number && PLACES[k].borrowed.id === placeOf(d.at));
    return id ? {w, d, x:d.at[0], y:d.at[1], place:id} : null;
  }).filter(Boolean);
})();
const hasTool = w => (S.tools || []).includes(w);
const decorUp = w => (S.decor || []).includes(w);
const decorAt = (x, y) => DECOR_SPOTS.find(ds => ds.place === PLACE && ds.x === x && ds.y === y && decorUp(ds.w));
let decorSetting = null;   // one being set up now, as you watch: {w, t0}
const DECOR_MS = 1400;
// Something in the way: a treasure that blocks (a rock with jade in it), or a thing for the cave that does (the drum).
function thingBlocks(x, y){
  const sp = TREASURE_SPOTS.find(s => s.place === PLACE && s.x === x && s.y === y && s.t.block && spotNow(s));
  const ds = DECOR_SPOTS.find(d => d.place === PLACE && d.x === x && d.y === y && d.d.block && (decorUp(d.w) || (decorSetting && decorSetting.w === d.w)));
  return !!(sp || ds);
}
// What A says at a treasure or a thing for the cave, and what it does.
function thingLabel(x, y){
  const sp = spotAt(x, y); if (sp) return spotNow(sp) === 'shut' ? 'Look' : sp.t.needs && !hasTool(sp.t.needs) ? 'Look' : sp.t.label || 'Take';
  const ds = decorAt(x, y); return ds ? ds.d.label || 'Look' : '';
}
async function thingAct(x, y){
  const sp = spotAt(x, y); if (sp) return takeTreasure(sp);
  const ds = decorAt(x, y); if (!ds) return;
  const d = ds.d;
  if (d.dance){ dancingUntil = performance.now() + DANCE_MS; for (let i = 0; i < 3; i++){ SFX.drum(); await sleep(260); } }
  else if (d.chime) SFX.chime();
  else SFX.blip();
  toast(fill(ds.w === '鱼缸' && S.jarFish && d.fishNote ? d.fishNote : d.note));
}
// The little monkeys dancing to your drum, a hop at a time (charPos, js/draw.js); and the wind chime, tinkling now and then
// as you walk past it.
let dancingUntil = 0, chimeAt = 0;
const DANCE_MS = 2600;
function danceHop(n, now){
  if (now > dancingUntil || n.person || n.cart || n.flies || n.look) return 0;
  return Math.round(Math.abs(Math.sin(now / 170 + n.x * 1.3)) * 5);
}
// Setting up what you've bought, as you watch, the next time you're in the cave (the decorate step, an event's), a thing
// at a time, each dropping into place with a knock, and then what you say (line, by: who says it), such as 好看！
async function decorate(s, who){
  const list = (S.decorNew || []).filter(w => DECOR_SPOTS.some(ds => ds.w === w && ds.place === PLACE));
  for (const w of list){
    decorSetting = {w, t0:performance.now()};
    await sleep(DECOR_MS * .55); SFX.tock(); shakeT = performance.now() - 450;
    await sleep(DECOR_MS * .45);
    decorSetting = null;
    S.decorNew.splice(S.decorNew.indexOf(w), 1); S.decor.push(w); save();
    const ds = DECOR_SPOTS.find(d => d.w === w);
    toast(fill(`Your {${w}} is up in the cave!`));
    await sleep(400);
    if (ds.d.chime) SFX.chime();
  }
  if (list.length && s.by && s.line && AREA.lines[s.line]) await showDialog(speaker(s.by), AREA.lines[s.line]);
}
// Drawing the treasures (their picture on the map now: MAP_ICONS, content/pictures.js) and the cave's things, with a fish in
// the jar once one lives there; each low in its square, a little up for one that says (the vase, on the table).
const thingPics = {};
const thingPic = k => thingPics[k] || (thingPics[k] = MAP_ICONS[k] ? sprite(MAP_ICONS[k].rows, MAP_ICONS[k].palette) : null);
function drawThings(cx, cy, now){
  const put = (k, x, y, up = 0, drop = 0) => { const c = thingPic(k), X = x*T - cx, Y = y*T - cy - up - drop; if (c && X > -T && Y > -T * 2 && X < VW*T && Y < VH*T) b.drawImage(c, X, Y); };
  for (const sp of TREASURE_SPOTS) if (sp.place === PLACE && spotNow(sp)) put(spotLooks(sp), sp.x, sp.y);
  for (const ds of DECOR_SPOTS){
    if (ds.place !== PLACE) continue;
    if (decorUp(ds.w)) put(ds.w === '鱼缸' && S.jarFish && ds.d.fishLook ? ds.d.fishLook : ds.d.look, ds.x, ds.y, ds.d.up || 0);
    else if (decorSetting && decorSetting.w === ds.w){   // dropping into place, as the troop sets it up
      const k = Math.min(1, (now - decorSetting.t0) / (DECOR_MS * .55));
      put(ds.d.look, ds.x, ds.y, ds.d.up || 0, Math.round((1 - k * k) * 40));
    }
    if (ds.d.chime && decorUp(ds.w) && now > chimeAt && Math.abs(pl.x - ds.x) + Math.abs(pl.y - ds.y) <= 2 && mode === 'play'){ chimeAt = now + 4000 + Math.random() * 5000; SFX.chime(); }   // (tinkling as you walk past)
  }
}

/* ================= THE LANTERN ================= */
// Your lantern from the shop (灯笼): at night, carried in your paw, a warm glow round you, and night treasures glint from
// further away (treasureGlints).
function drawLanternLight(cx, cy, now){
  const L = lightNow(); if (!hasTool('灯笼') || !L || L.dark < .3 || (PLACES[PLACE] || {}).night) return;
  const k = Math.min(1, (L.dark - .3) / .4), flick = .92 + .08 * Math.sin(now / 130) * Math.sin(now / 47);
  const X = Math.round(pl.px - cx) + 8, Y = Math.round(pl.py - cy) + 9;
  for (const [r, a] of [[30, .06], [21, .07], [13, .09]]){ b.globalAlpha = a * k * flick; disc(b, X, Y, r, '#FFC870'); }
  b.globalAlpha = 1;
  const c = thingPic('lantern'); if (c){ const [dx] = DV[pl.dir]; b.drawImage(c, X + (dx < 0 ? -15 : 3), Y - 6, 9, 9); }   // (in your paw, at your side: small)
}

/* ================= SELLING ================= */
// A shop that buys treasures (its sells: when; the 老板's once you've sold him your first pine nuts), once you know 卖: its
// tabs, 买 Buy and 卖 Sell (decided 9 November 2026, the trade plan). Where nothing's for sale, the Sell tab alone.
const canSell = sh => !!sh && !!sh.sells && matches(sh.sells) && lvl('卖') >= 1;
const priceOf = w => (TREASURE_INFO[w] || {}).price || 1;
function shopTabs(sh, now){
  if (!canSell(sh) || !(sh.items || []).length) return '';
  const tab = (id, zh, py, en) => `<button class="tab" role="tab" data-shoptab="${id}" aria-selected="${now === id}">${zh} <span class="tpy">${py}</span> ${en}</button>`;
  return `<div class="scrolltabs shoptabs" role="tablist">${tab('buy', '买', WORDS['买'].py, 'Buy')}${tab('sell', '卖', WORDS['卖'].py, 'Sell')}</div>`;
}
// The Sell tab: each treasure you're carrying, how many and what it fetches; those you haven't found yet as shadows, with a
// clue and their price, so you know what to look for. Choose one and say it, 我要卖＿, the treasure missing.
async function sellCard(face, sh, asked = false){
  if (!asked && sh.sellAsk && AREA.lines[sh.sellAsk]) await showDialog(face, AREA.lines[sh.sellAsk]);
  const tile = w => {
    const n = S.bag[w] || 0, known = lvl(w) >= 1, price = `<span class="sprice">${MONEY()} ${priceOf(w)}</span>`;
    if (n > 0) return `<button class="shopitem" data-w="${w}" data-label="Sell"><span class="spic" aria-hidden="true">${picHTML(w)}</span><span class="scount">×${n}</span>
      <span class="szh">${w}</span><span class="spy">${WORDS[w].py}</span><span class="sen">${esc(WORDS[w].en)}</span>${price}</button>`;
    return `<div class="shopitem shadow"><span class="spic" aria-hidden="true">${picHTML(w)}</span>${known ? `<span class="szh">${w}</span><span class="spy">${WORDS[w].py}</span>` : '<span class="szh">？</span>'}
      <span class="sclue">${esc(fill((TREASURE_INFO[w] || {}).clue || ''))}</span>${price}</div>`;
  };
  const w = await new Promise(res => {
    openCard(`<div class="qhead">${face}<p class="prompt">You have ${MONEY()} ${money()}. What will you sell?</p></div>${shopTabs(sh, 'sell')}
      <div class="menu shopgrid sellgrid">${TREASURE_WORDS.map(tile).join('')}</div>
      <div class="actions"><button class="btn" data-a="no" data-b>Not now</button></div>`);
    const first = sheet.querySelector('button.shopitem'); if (first) first.focus();
    on('[data-a=no]', () => { closeCard(); res(null); });
    sheet.querySelectorAll('button.shopitem').forEach(b => b.onclick = () => { closeCard(); res(b.dataset.w); });
    sheet.querySelectorAll('[data-shoptab=buy]').forEach(b => b.onclick = () => { SFX.turn(); closeCard(); res('buy'); });
  });
  if (w === 'buy') return shop(face, sh, true);
  if (!w) return;
  await sellOne(w, face, sh);
  if (TREASURE_WORDS.some(x => (S.bag[x] || 0) > 0)) return sellCard(face, sh, true);   // (more to sell: the tab again)
}
// Selling one: you say it (its sell sentence, the treasure missing; the first time, 卖 missing instead: first), and offer
// another than you pointed at and they're puzzled, and ask again, as when you buy; then they count the money into your paw,
// aloud, and you say thank you, and they say you're welcome.
async function sellOne(w, face, sh, first = false){
  const t = TREASURE_INFO[w] || {}, sentence = toks(t.sell || `我 要 卖 ${w}`), price = priceOf(w), seen = {};
  const q = {who:face, t:sentence, en:t.sellEn || `I want to sell ${enOf(w)}.`, gap:first ? '卖' : w, ...(first ? {wrong:['买', '吃']} : {})};
  if (!await gapQ({...q, seen}) && sh.sellPuzzled){
    const n = NPCS.find(c => c.id === sh.who);
    if (n) n.puzzled = true;
    try {
      do {
        await showNarration(fill(sh.sellPuzzled.replace('{item}', `{${w}}`)));
        if (sh.sellAsk && AREA.lines[sh.sellAsk]) await showDialog(face, AREA.lines[sh.sellAsk]);
      } while (!await gapQ({...q, options:reshuffled(seen.options || [q.gap], q.gap), again:true, seen}));
    } finally { if (n) delete n.puzzled; }
  }
  sentence.filter(x => lvl(x) >= 1).forEach(useWord);
  S.bag[w]--; save();
  await countMoney(face, price, sh);
  earn(price); save(); SFX.fanfare();
  if (sh.reply && await replyWith(sh.reply, {about:`${theOne(sh)} counted ${price} ${MONEY()} into your paw.`, who:sh.who}) && sh.welcome && AREA.lines[sh.welcome]) await showDialog(face, AREA.lines[sh.welcome]);
  toast(`+${price} ${MONEY()} for the ${lvl(w) >= 1 ? wz(w) : enOf(w)}.`);
  if (!talkingTo) await runEvents();
}
// The money, counted into your paw a piece at a time, aloud, each said in full before the next (decided 9 November 2026:
// the money stays shells, never the word 贝壳, the Eastern Sea's surprise; so they're counted, 一，二，三……).
// (who's buying: the shop owner, or the money changer, as a sentence starts)
const theOne = sh => { const en = (NAMES[sh.who] || {en:'someone'}).en.replace(/^(the|an?) /i, ''); return `The ${en.charAt(0).toLowerCase() + en.slice(1)}`; };
async function countMoney(face, n, sh){
  openCard(`<div class="qhead">${face}<p class="prompt">${esc(theOne(sh))} counts ${n === 1 ? 'it' : 'them'} into your paw.</p></div>
    <div class="coincount" aria-live="polite"></div>`);
  const row = sheet.querySelector('.coincount');
  for (let i = 1; i <= n; i++){
    const num = COUNTING[i - 1] || String(i), known = WORDS[num] && lvl(num) >= 1;
    row.insertAdjacentHTML('beforeend', pixelIcons(`<span class="cc"><span class="cci">${MONEY()}</span><span class="ccn${known ? ' known' : ''}">${num}</span>${S.pinyin && WORDS[num] ? `<span class="ccp">${WORDS[num].py}</span>` : ''}</span>`));
    SFX.blip();
    if (WORDS[num]) await sayFully(num, 520); else await sleep(400);
  }
  await sleep(500);
  closeCard();
}

/* ================= THE STEPS ================= */
Object.assign(STEPS, {
  // Selling to the one you're talking to: the first time, a treasure in your bag (sell: its word, or true for the first you
  // have) with 卖 missing (first), and after that their Sell tab.
  async sell(s, who){
    const sh = Object.values(SHOPS).find(x => x.who === who) || Object.values(SHOPS)[0], face = speaker(who);
    if (s.first){
      const w = typeof s.sell === 'string' ? s.sell : TREASURE_WORDS.find(x => (S.bag[x] || 0) > 0);
      if (w && (S.bag[w] || 0) > 0) await sellOne(w, face, sh, true);
      return;
    }
    await sellCard(face, sh, true);
  },
  decorate,   // setting up what you've bought for the cave, as you watch
  jarFish(){ S.jarFish = true; save(); },   // a little fish lives in your fish jar from now on
  // The Ready to sail? card (below); Not yet: what changes (wait, such as the raft waiting at the shore, the troop gone home)
  // and what you're told (later), and the steps after it don't run.
  async readyToSail(s){
    const r = await readyCard();
    if (r === STOP){ Object.assign(here(), s.wait || {}); save(); placeCharacters(); if (s.later) toast(fill(s.later)); }
    return r;
  }
});
Object.assign(STEP_OPTIONS, {readyToSail:['wait', 'later']});

/* ================= READY TO SAIL? ================= */
// The card at your raft (decided 9 November 2026, the trade plan): each page of your scroll, red where words are still to
// find and with a gold 好 where it's full; your friends and treasures; where things are still to find (with a moon for
// those out only at night); and the words that need practice. Sail away (A), Not yet (B: the raft waits at the shore, the
// troop goes home), or Quick practice first, coming back to the card. Anything you miss can still be found later in the
// story. Gives STOP for Not yet, so the raft's steps stop.
function readyCard(){
  return new Promise(res => {
    const pages = scrollPages().filter(p => p.area === AREA.number);
    const pageRow = p => { const got = p.words.filter(w => lvl(w) >= 1).length, full = got === p.words.length;
      return `<span class="rpage${full ? ' full' : ''}"><span class="rname">${esc(CATEGORIES[p.cat].tab || CATEGORIES[p.cat].name)}</span><b>${full ? '<span class="rseal">好</span>' : `${got}/${p.words.length}`}</b></span>`; };
    const friends = ANIMALS.filter(a => inChapter(a)), met = friends.filter(a => S.friends.includes(a.id)).length;
    const found = TREASURE_WORDS.filter(w => (AREA.treasures || {})[w] && lvl(w) >= 1).length, kinds = TREASURE_WORDS.filter(w => (AREA.treasures || {})[w]).length;
    const still = here().visited.filter(id => PLACES[id] && PLACES[id].onMap).map(id => ({id, left:stillHere(id)})).filter(x => x.left.length)
      .sort((a, c) => c.left.length - a.left.length).slice(0, 4)
      .map(({id, left}) => `<span class="rstill">${esc(PLACES[id].name.en)} <b>${left.length}</b>${left.some(x => x.time === 'night') ? ' 🌙' : ''}</span>`).join('');
    const need = practiceWords().length;
    openCard(`<p class="label">Ready to sail?</p>
      <p class="small">Your Word Scroll</p><div class="rpages">${pages.map(pageRow).join('')}</div>
      <div class="stats"><span>${met}/${friends.length} animal friends</span>${kinds ? `<span>${found}/${kinds} treasures</span>` : ''}${need ? `<span><b>${need}</b> word${need === 1 ? '' : 's'} need practice</span>` : ''}</div>
      ${still ? `<p class="small">Still to find:</p><div class="rstills">${still}</div>` : ''}
      <p class="note">Anything you miss can still be found later in the story.</p>
      <div class="actions"><button class="btn" data-a="later" data-b>Not yet</button>${need ? '<button class="btn" data-a="practise">Quick practice</button>' : ''}<button class="btn primary" data-a="go">Sail away</button></div>`);
    on('[data-a=go]', () => { closeCard(); res(); });
    on('[data-a=later]', () => { closeCard(); res(STOP); });
    on('[data-a=practise]', () => { closeCard(); quickPractice(() => { closeCard(); readyCard().then(res); }); });
  });
}
