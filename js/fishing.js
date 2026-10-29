// Fishing (decided 29 October 2026): once you have a rod (the area's fishing: rod, and has, when you have it), A at water
// where fish live (a legend's fishing) casts your line there. The float bobs on the water till a fish bites, a little
// while later; it dips under with a splash and a ! over you, and you press A to hook it (in BITE_MS: too slow, and it gets
// away). Then you reel it in by answering questions on words you know: one for a little fish, more for a big one (each
// size's questions), in a row; get one wrong, and it slips off the hook. No harm done either way: cast again. B stops.
// What bites: a little fish till bigIf matches (such as knowing 小, from your first catch); after that, a big one gets
// likelier with every bite, sure by the bigWithin-th, or bites straight away if you've bait in your bag (bait: one goes
// on your hook). Caught: a card with its picture (each size's pic) and caught, then its steps, the first part whose if
// matches, such as letting a little one go, or taking a big one to the feast.
// Water can say what lives in it (a legend's fishing, as a kind of catch, such as 'shrimp', decided 29 October 2026): there,
// that's always what bites, with its own questions, picture and steps. One that nibbles (nibbles: how many times, from
// and to) twitches the float first, tiny rings round it (its nibble, what you're told), before it bites: press A on a
// twitch, and you've pulled too soon (tooSoon). Wait for it to go right under.

/* ================= FISHING ================= */
let fishing = null;   // your line in the water now: {x, y (the square it's in), t0 (cast), bite (when a fish bit, or null), nibble (a twitch now), hooked, press (what A or B does now)}
const BITE_WAIT = [1600, 4200];   // how long till a fish bites (ms): somewhere between these
const BITE_MS = 2500;   // how long you have to press A once it has
const NIBBLE_MS = 900;   // how long a nibble twitches the float
const FISH = AREA.fishing || null;
const canFish = () => !!FISH && matches(FISH.has);
// Till A or B is pressed (keys: which of 'a' and 'b' count now), or ms has gone by: gives 'a', 'b' or 'time'.
function fishWait(ms, keys){
  return new Promise(res => {
    const t = setTimeout(() => { fishing.press = null; res('time'); }, ms);
    fishing.press = k => { if (!keys.includes(k)) return false; clearTimeout(t); fishing.press = null; res(k); return true; };
  });
}
// A pressed while you're fishing: true if fishing took it (input.js asks first).
const fishPress = k => !!(fishing && fishing.press && fishing.press(k));
// What bites next: 'big' or 'small' (and whether bait went on your hook), or what lives in this water (kind), such as shrimp.
function whatBites(kind){
  if (kind) return {size:kind};
  if (!matches(FISH.bigIf || {})) return {size:'small'};
  if (FISH.bait && (S.bag[FISH.bait] || 0) > 0){ S.bag[FISH.bait]--; save(); return {size:'big', bait:true}; }
  const casts = (here().fishCasts || 0) + 1;
  here().fishCasts = casts; save();
  return {size:Math.random() < casts / (FISH.bigWithin || 4) ? 'big' : 'small'};
}
// A question while you reel it in (n of total), on a word you know: you hear it while it's new, and choose its picture
// from three you know, with their characters; once you know it, you read it, and choose from the pictures alone, as in PE
// (js/pe.js). Gives whether you were right.
async function fishQ(w, n, total){
  const listen = lvl(w) <= 1, q = wordQuestion(w, null, listen ? 'listen' : 'read');
  const ok = await pictureQ({head:`<div class="qhead lessonhead"><div class="who" aria-hidden="true">${picHTML(FISH.rod)}</div><p class="label">${esc(fill(FISH.reel))}${total > 1 ? ` (${n} of ${total})` : ''} ${listen ? 'Listen.' : 'Read it.'} Which is it?</p></div>`,
    body:listen ? '<div class="hearit"><button class="sayBig" data-a="say" aria-label="Hear it again">🔊</button></div>'
      : `<div class="word"><div class="big">${w}</div>${S.pinyin ? `<div class="py">${WORDS[w].py}</div>` : ''}</div>`,
    options:q.options, answerIdx:q.answerIdx, word:w, onShow:() => { if (listen) setTimeout(() => say(w), 300); }});
  closeCard();
  if (ok) answer(w, true, listen ? 'listen' : 'read'); else reviewed(w, false);
  return ok;
}
// Fishing at the water square (x, y) you're facing: cast, a bite, hooked, reeled in (or not), and what you've caught.
async function goFishing(x, y){
  pl.dir = dirOf(x - pl.x, y - pl.y) || pl.dir;
  const kind = typeof tileAt(x, y).fishing === 'string' ? tileAt(x, y).fishing : null, k = kind && FISH[kind];
  fishing = {x, y, t0:performance.now(), bite:null, nibble:false, hooked:false, press:null};
  SFX.swish();
  let got = null;
  try {
    toast(fill(FISH.cast));
    const wait = () => BITE_WAIT[0] + Math.random() * (BITE_WAIT[1] - BITE_WAIT[0]);
    const nibbles = k && k.nibbles ? k.nibbles[0] + Math.floor(Math.random() * (k.nibbles[1] - k.nibbles[0] + 1)) : 0;
    for (let i = 0; i < nibbles; i++){   // a nibble: wait, don't pull!
      if (await fishWait(wait() * (i ? .5 : 1), ['b']) === 'b'){ toast(fill(FISH.stop)); return; }
      fishing.nibble = true; SFX.blip(); toast(fill(k.nibble));
      const r = await fishWait(NIBBLE_MS, ['a', 'b']);
      fishing.nibble = false;
      if (r === 'a'){ SFX.splash(); toast(fill(k.tooSoon)); return; }
      if (r === 'b'){ toast(fill(FISH.stop)); return; }
    }
    if (await fishWait(nibbles ? wait() * .5 : wait(), ['b']) === 'b'){ toast(fill(FISH.stop)); return; }
    fishing.bite = performance.now(); SFX.splash(); toast(fill(FISH.bite));
    const r = await fishWait(BITE_MS, ['a', 'b']);
    if (r !== 'a'){ toast(fill(r === 'b' ? FISH.stop : FISH.missed)); return; }
    closeMessage();
    const {size, bait} = whatBites(kind), f = FISH[size];
    fishing.hooked = true; SFX.blip();
    if (bait) toast(fill(FISH.baited));
    const words = nextWords(trainable(), f.questions);
    let shells = 0;
    for (let i = 0; i < words.length; i++){
      const need = needsPractice(words[i]);
      if (!await fishQ(words[i], i + 1, words.length)){ SFX.splash(); toast(fill(FISH.slipped)); return; }
      if (need) shells++;
    }
    if (shells){ S.shells += shells; save(); }
    if (size === 'big') here().fishCasts = 0;
    got = size;
  } finally { fishing = null; }
  SFX.fanfare();
  const f = FISH[got];
  await infoBox(`<span class="ico">${picHTML(f.pic)}</span>`, `<p>${esc(fill(f.caught))}</p>`);
  const part = (f.steps || []).find(p => !p.if || matches(p.if));
  if (part) await runSteps(part.do);
}
