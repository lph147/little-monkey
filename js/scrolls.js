// The Story Scroll at the waterfall, the area checklist, the word test at the cave door, Today's words and the Word Scroll.

/* ================= STORY, SLEEP, SCROLL ================= */
// The story questions to ask now: a story sentence with a word missing, and pictures to fill the gap.
// Quizzes only use words you've caught: a question is left out if you haven't caught its answer, and
// its wrong answers are the first 2 you have caught.
function storyQuestions(){
  return AREA.storyQuestions.filter(q => lvl(q.answer) >= 1).map(q => {
    const wrong = q.options.filter(w => w !== q.answer && lvl(w) >= 1).slice(0, 2);
    return {t:toks(q.zh), en:q.en, options:shuffle([q.answer, ...wrong]), answer:q.answer};
  }).filter(q => q.options.length > 1);
}
function storyScroll(){
  return new Promise(res => {
    const firstRead = !here().story;   // the English shows under each sentence the first time; after that, behind English
    STORY.forEach(s => hear(s.t)); save();
    openCard(`<p class="label">Story Scroll</p><p class="small">Your story so far, in words you've met. Tap any word you're unsure of.</p>
      ${STORY.map((s,i) => `<div class="sent" data-i="${i}">${s.pic ? `<span class="spic" aria-hidden="true">${picHTML(s.pic)}</span>` : ''}<div>${lineHTML(s.t)}<div class="sentence-en" ${firstRead ? '' : 'hidden'}>${esc(s.en)}</div></div></div>`).join('')}
      <div class="gloss">Tap a word for its meaning.</div>
      <div class="actions"><button class="btn grow" data-a="read">🔊 Read it to me</button>${firstRead ? '<button class="btn primary" data-a="ok">Questions</button>'
        : '<button class="btn" data-a="en">English</button><button class="btn" data-a="ok">Questions</button><button class="btn primary" data-a="close" data-b>Close</button>'}</div>`);
    // (read before: A closes it, so the questions never start again by accident; they're on their own button)
    on('[data-a=close]', () => { stopSpeech(); closeCard(); res(); });
    bindTokens(sheet);
    on('[data-a=en]', e => { sheet.querySelectorAll('.sent .sentence-en').forEach(x => x.hidden = false); e.currentTarget.remove(); });
    on('[data-a=read]', () => {
      let i = 0;
      const next = () => {
        sheet.querySelectorAll('.sent').forEach(s => s.classList.remove('reading'));
        if (i >= STORY.length || modal.hidden) return;
        const el = sheet.querySelector(`.sent[data-i="${i}"]`); if (el){ el.classList.add('reading'); el.scrollIntoView({block:'nearest'}); }
        const text = STORY[i].t.join(''); i++;
        say(text, () => setTimeout(next, 250));
      };
      next();
    });
    on('[data-a=ok]', async () => {
      stopSpeech();
      let right = 0;
      const qs = storyQuestions();
      for (const q of qs) if (await gapQ({label:'Story question', t:q.t, en:q.en, gap:q.answer, options:q.options})) right++;
      const firstTime = !here().story, end = AREA.storyEnd;
      here().story = true; if (firstTime) earn(end.reward); save(); buildMap();
      SFX.fanfare();
      openCard(`<div class="who" aria-hidden="true">📖</div><p class="label">${end.title}</p>
        <p>${qs.length ? `You got ${right} of ${qs.length} story questions.` : ''}${firstTime ? ` +${end.reward} ${MONEY()}` : ''}</p>
        ${end.text.map(p => `<p>${p}</p>`).join('\n        ')}
        <div class="actions"><button class="btn primary" data-a="done">Keep playing</button></div>`);
      on('[data-a=done]', () => { closeCard(); if (firstTime && end.rumble){ SFX.rumble(); shakeT = performance.now(); } res(); });
    });
  });
}
// The area's checklist (areaChecklist() in js/world.js), just what you've found so far, what's still to do first and
// then what you've done (decided 25 October 2026: in story order, what was left was far down the list), and a line
// saying there's more if some hasn't been found yet. onlyLeft: just what's left before the exit test.
function checklistHTML(onlyLeft){
  const all = areaChecklist(), items = all.filter(([t, done, exitTest, found]) => found && (!onlyLeft || (!done && !exitTest)));
  const more = all.some(([, , , found]) => !found);
  const ordered = [...items.filter(([, done]) => !done), ...items.filter(([, done]) => done)];
  return `<ul class="checklist">${ordered.map(([t, done]) => `<li class="${done ? 'done' : ''}"><span>${esc(t)}</span></li>`).join('')}${more ? '<li class="more">More to find as you play</li>' : ''}</ul>`;
}
function infoBox(who, html){   // who: a picture over it, or an animal's or a battle's scene, down its left as in the questions (or none)
  return new Promise(res => {
    const top = !who ? '' : who.startsWith('<div class="scene') ? who : `<div class="who" aria-hidden="true">${who}</div>`;
    openCard(`${top}${html}<div class="actions"><button class="btn primary" data-a="ok">OK</button></div>`);
    on('[data-a=ok]', () => { closeCard(); res(); });
  });
}
const PASS = 0.8;
// Words split into rounds of size (the last at least 3, or it joins the one before), with no two look-alikes in a round
// when that can be helped, as no two are answers in a question: the words with the most look-alikes go first, each into
// the first round with room and the fewest of its look-alikes (none, if it can). The rounds come in a random order.
function roundsApart(words, size){
  const sizes = []; for (let i = 0; i < words.length; i += size) sizes.push(Math.min(size, words.length - i));
  if (sizes.length > 1 && sizes[sizes.length - 1] < 3) sizes[sizes.length - 2] += sizes.pop();
  const rounds = sizes.map(() => []), many = w => words.filter(o => alike(o, w)).length;
  for (const w of [...words].sort((a, b) => many(b) - many(a))){   // (sort keeps the rest in the order given)
    const clashes = r => r.filter(o => alike(o, w)).length;
    rounds.filter((r, i) => r.length < sizes[i]).sort((a, b) => clashes(a) - clashes(b))[0].push(w);
  }
  return shuffle(rounds);
}
// Matching words to their pictures, in rounds of about 4 (the cave door test and the training ground).
// Gives the words you missed first time, or null if you stop.
function matchWords(words, title, stopLabel){
  return new Promise(res => {
    const rounds = roundsApart(words, 4);
    const missed = new Set();
    let r = 0, picked = null, stopped = false;   // (stopped: the next round never comes, even if a round has just been matched)
    function render(){
      const set = rounds[r], left = shuffle(set), right = shuffle(set);
      openCard(`<p class="label">${title} · ${r + 1} of ${rounds.length}</p>
        <p class="small">Tap a word, then tap its picture.</p>
        <div class="match" data-nav><div class="col">${left.map(w => `<button class="mw" data-w="${w}"><ruby>${w}<rt class="${S.pinyin ? '' : 'hid'}">${WORDS[w].py}</rt></ruby></button>`).join('')}</div>
        <div class="col">${right.map(w => `<button class="mp" data-w="${w}">${picHTML(w)}</button>`).join('')}</div></div>
        <div class="feedback" aria-live="polite"></div>
        <div class="actions"><button class="btn" data-a="quit" data-b>${stopLabel}</button></div>`);
      picked = null;
      const fb = sheet.querySelector('.feedback');
      sheet.querySelectorAll('.mw').forEach(bt => bt.onclick = () => {
        if (bt.classList.contains('done')) return;
        sheet.querySelectorAll('.mw.sel').forEach(x => x.classList.remove('sel'));
        bt.classList.add('sel'); picked = bt.dataset.w; say(picked); fb.textContent = '';
      });
      sheet.querySelectorAll('.mp').forEach(bt => bt.onclick = () => {
        if (bt.classList.contains('done')) return;
        if (!picked){ fb.textContent = 'Tap a word first.'; return; }
        const wbtn = sheet.querySelector(`.mw[data-w="${picked}"]`);
        if (bt.dataset.w === picked){
          SFX.right(); bt.classList.add('done'); wbtn.classList.remove('sel'); wbtn.classList.add('done'); picked = null;
          if (![...sheet.querySelectorAll('.mw')].some(x => !x.classList.contains('done'))){
            setTimeout(() => { if (stopped) return; r++; if (r < rounds.length) render(); else res(missed); }, 450);
          }
        } else {
          SFX.wrong(); missed.add(picked); bt.classList.add('shake'); setTimeout(() => bt.classList.remove('shake'), 400);
          fb.textContent = 'Not that one. Try again.';
        }
      });
      on('[data-a=quit]', () => { stopped = true; closeCard(); res(null); });
    }
    render();
  });
}
// The words you missed, as chips you can tap to hear.
const chipHTML = w => `<button class="chip" data-w="${w}"><ruby>${w}<rt class="${S.pinyin ? '' : 'hid'}">${WORDS[w].py}</rt></ruby></button>`;   // a word to tap and hear
const missedHTML = missed => missed.size ? `<p class="small">Words to practise:</p><div class="chips">${[...missed].map(chipHTML).join('')}</div><div class="gloss">Tap a word to hear it.</div>` : '';
const bindMissed = () => sheet.querySelectorAll('.chip').forEach(bt => bt.onclick = () => { const w = bt.dataset.w; say(w); sheet.querySelector('.gloss').innerHTML = `<b>${w}</b> ${WORDS[w].py} · ${esc(WORDS[w].en)}`; });
async function wordTest(){   // the exit test at the cave door: every word with a picture you've caught
  const words = shuffle(ORDER.filter(w => WORDS[w].pic && lvl(w) >= 1));
  const missed = await matchWords(words, 'Word test', 'Stop test');
  if (!missed) return false;
  const right = words.length - missed.size, need = Math.ceil(words.length * PASS), pass = right >= need;
  missed.forEach(w => reviewed(w, false));   // missed: near the front of the review list
  save();
  if (pass) SFX.fanfare(); else SFX.wrong();
  return new Promise(res => {
    openCard(`<div class="who" aria-hidden="true">${pass ? '🏆' : '📜'}</div>
      <p class="label">${pass ? 'Test passed!' : 'Not quite yet'}</p>
      <p>You matched <b>${right} of ${words.length}</b> words right first time. You needed ${need}.</p>
      ${missedHTML(missed)}
      ${pass ? '' : `<p>${AREA.exit.tryAgain}</p>`}
      <div class="actions"><button class="btn primary" data-a="ok">${pass ? AREA.exit.passButton : AREA.exit.failButton}</button></div>`);
    bindMissed();
    on('[data-a=ok]', () => { closeCard(); res(pass); });
  });
}

/* ================= TRAINING GROUND ================= */
const TRAINING_WORDS = 8, TRAINING_MIN = 4;   // words to match per session, and how many you need to start
const trainable = () => ORDER.filter(w => WORDS[w].pic && lvl(w) >= 1);   // caught words with a picture
const unpictured = () => ORDER.filter(w => !WORDS[w].pic && lvl(w) >= 1);   // caught words without a picture (我 要), practised by filling gaps in sentences sentences
const practiceWords = () => [...trainable(), ...unpictured()].filter(needsPractice);   // words that need practice (new, or missed since), that you can practise
const trainingCalls = () => trainable().length >= TRAINING_MIN && practiceWords().length > 0;   // the practice post shows a !
// The words to practise: from the front of the review list (js/state.js), in a random order.
const trainingWords = () => shuffle(nextWords(trainable(), TRAINING_WORDS));
// The area's sentences you complete: in requests, the shop and the wardrobe, and those just for practising a word without a
// picture that none of them has (practiceSentences, such as 我有桃子 for 有).
const SENTENCES = () => [...REQUESTS.flatMap(r => r.choices ? Object.values(r.choices) : [r]), ...(AREA.shop ? AREA.shop.items : []), ...(AREA.wardrobe || []), ...(AREA.practiceSentences || [])];
// A sentence for practising a word without a picture (such as 我 or 要): one you've met in a request, the
// shop or the wardrobe (or one of the area's practice sentences), with every word caught, and that word missing (gap): of
// its words without a picture, one that needs practice, the one nearest the front of the review list (decided 24 October
// 2026: 我有桃子 could miss out 我, ahead of 有 in the list, while only 有 needed practice), preferring a sentence with one.
// not: sentences already asked (their words, joined), such as in a big word game.
function practiceSentence(not = []){
  const all = SENTENCES().map(b => ({t:toks(b.sentence), en:b.sentenceEn})).filter(b => b.t.every(w => lvl(w) >= 1) && b.t.some(w => !WORDS[w].pic) && !not.includes(b.t.join('')))
    .map(b => { const ws = reviewOrder(shuffle(b.t.filter(w => !WORDS[w].pic))); return {...b, gap:ws.find(needsPractice) || ws[0]}; });
  const need = all.filter(b => needsPractice(b.gap));
  return shuffle(need.length ? need : all)[0] || null;
}
// Fill the gap in a sentence (from practiceSentence). A right choice earns a shell if the word needed practice.
// Gives {right, shells}.
async function gapRound(b, who){
  const need = needsPractice(b.gap), right = await gapQ({who, t:b.t, en:b.en, gap:b.gap});
  const shells = right && need ? 1 : 0;
  earn(shells); save();
  return {right, shells};
}
// After a session: a word matched first time moves back in the review list, a missed one goes near the front (the
// gold squares stay the same). Each word that needed practice, matched first time, earns a shell. Gives how many shells.
function trained(words, missed){
  let shells = 0;
  for (const w of words){
    const ok = !missed.has(w);
    if (ok && needsPractice(w)) shells++;
    reviewed(w, ok);
    addToday(w);
  }
  earn(shells); save();
  return shells;
}
// A practice session: match words to their pictures, then fill the gap in a sentence. At the practice post, or in a
// lesson at school (the lesson step), with who's face; kind: what it's called. Gives whether you finished it.
const PRACTICE = {
  post:{what:'A practice post.', title:'Training', start:'Start', done:'Training done'},
  lesson:{what:'A lesson.', title:'Lesson', start:'Start', done:'Lesson over'}
};
async function trainingGround(){ await practise(`<img class="portrait" alt="" src="${SPR.post.toDataURL()}">`); }
async function practise(who, kind = PRACTICE.post){
  const have = trainable().length;
  if (have < TRAINING_MIN){ await infoBox(who, `<p>${kind.what} Come back once you've learned ${TRAINING_MIN} words with pictures (${have}/${TRAINING_MIN}).</p>`); return false; }
  const words = trainingWords(), sentence = practiceSentence();
  const need = [...words, ...(sentence ? [sentence.gap] : [])].filter(needsPractice).length;
  const ask = 'Practise matching words to their pictures' + (sentence ? `, then fill the gap in a sentence with ${wz(sentence.gap)}. ` : '. ') + (need
    ? `${need} of them ${need === 1 ? 'needs' : 'need'} practice: each one you get right first time earns a ${MONEY()}.`
    : 'None of these words need practice right now, so there’s no ' + (coinsNow() ? '🪙 money' : '🐚 shells') + ' this time.');
  if (!await confirmBox(who, ask, kind.start, 'Not now')) return false;
  const missed = await matchWords(words, kind.title, 'Stop');
  if (!missed) return false;
  const right = words.length - missed.size, filled = sentence ? await gapRound(sentence, who) : null, shells = trained(words, missed) + (filled ? filled.shells : 0);
  SFX.fanfare();
  await new Promise(res => {
    openCard(`<div class="who" aria-hidden="true">${who}</div><p class="label">${kind.done}</p>
      <p>You matched <b>${right} of ${words.length}</b> words right first time.${filled ? (filled.right ? ' You filled the gap right.' : ' You filled the gap.') : ''}${shells ? ` +${shells} ${MONEY()}` : ''}</p>
      ${missedHTML(missed)}
      <div class="actions"><button class="btn primary" data-a="ok">OK</button></div>`);
    bindMissed();
    on('[data-a=ok]', () => { closeCard(); res(); });
  });
  return true;
}
// Quick practice (练习, decided 30 October 2026): questions on the words you know, from the title screen (Practise, for the
// game you'd continue) or the menu's 练习 tile, without walking anywhere. You choose how many with − and +, in fives, up to
// QUICK.most or as many as you can be asked about (askable: your words with pictures, and those without that a sentence
// you've met can ask about, with its gap), 10 to start with. The words that need it most come first (the review list),
// each asked about as its level calls for (listen while it's new, read once you recognise it), and every QUICK.gapEvery-th
// a sentence with a word missing, as the word games do, and the third of every QUICK.phraseEvery a What do you say?
// question on a phrase, once you know enough (phraseQ, js/quiz.js); never a new word. Every answer counts in your game, as practice
// anywhere does (moving words on, and towards the waits), but earns no shells: it's a tool beside the game, not part of it.
// Stop, or B, ends it where you are. The end card says how you did, the words that moved up a level, and those you missed;
// again: the same number again. back: where Back and Done go (the title, or the menu).
const QUICK = {step:5, most:50, first:10, gapEvery:5, phraseEvery:6};   // (phraseEvery: a What do you say? question, js/quiz.js, the third of each six)
const QUICK_NAME = () => `<span class="hz">练习</span>${S.pinyin ? ' <span class="spy">liànxí</span>' : ''} Practice`;
const sentenceWords = () => [...new Set(SENTENCES().map(b => toks(b.sentence)).filter(t => t.every(w => lvl(w) >= 1)).flat().filter(w => !WORDS[w].pic))];
const askable = () => trainable().length + sentenceWords().length;
function quickSizes(){   // the numbers − and + step through: fives, up to the most you can be asked about
  const top = Math.min(QUICK.most, askable()), sizes = [];
  for (let k = QUICK.step; k <= top; k += QUICK.step) sizes.push(k);
  if (!sizes.length || sizes.at(-1) !== top) sizes.push(top);
  return sizes;
}
const levelPips = i => `<span class="pips">${[1, 2, 3, 4].map(j => `<i class="${i >= j ? 'on' : ''}"></i>`).join('')}</span>`;   // a level's gold squares
function quickPractice(back){
  const have = trainable().length;
  if (have < TRAINING_MIN){
    openCard(`<p class="label">${QUICK_NAME()}</p><p>Learn ${TRAINING_MIN} words with pictures first (${have}/${TRAINING_MIN}): things that sparkle ✨ have words.</p><div class="actions"><button class="btn primary" data-a="back" data-b>OK</button></div>`);
    on('[data-a=back]', back); return;
  }
  const sizes = quickSizes();
  let at = Math.max(0, sizes.findIndex(k => k >= Math.min(QUICK.first, sizes.at(-1))));
  const all = wordsCaught(), need = practiceWords().length, lv = [1, 2, 3, 4].map(i => ORDER.filter(w => lvl(w) === i).length);
  openCard(`<p class="label">${QUICK_NAME()}</p>
    <div class="stats"><span>${all} ${all === 1 ? 'word' : 'words'} caught</span><span><b>${need}</b> need${need === 1 ? 's' : ''} practice</span></div>
    <div class="qplevels">${MASTERY.map((m, i) => `<span>${levelPips(i + 1)} ${m} <b>${lv[i]}</b></span>`).join('')}</div>
    <div class="qpcount" data-nav><button class="btn" data-a="less" aria-label="Fewer">−</button><b class="qpn" aria-live="polite"></b><button class="btn" data-a="more" aria-label="More">+</button>
      <span class="qpq"></span></div>
    <p class="small">The words that need it most come first.</p>
    <div class="actions"><button class="btn" data-a="back" data-b>Back</button><button class="btn primary" data-a="go" data-label="Start">Start</button></div>`);
  const show = () => {
    sheet.querySelector('.qpn').textContent = sizes[at]; sheet.querySelector('.qpq').textContent = sizes[at] === 1 ? 'question' : 'questions';
    sheet.querySelector('[data-a=less]').disabled = at === 0; sheet.querySelector('[data-a=more]').disabled = at === sizes.length - 1;
  };
  show();
  on('[data-a=less]', () => { if (at > 0){ at--; SFX.blip(); show(); } });
  on('[data-a=more]', () => { if (at < sizes.length - 1){ at++; SFX.blip(); show(); } });
  on('[data-a=back]', back);
  on('[data-a=go]', () => quickRun(sizes[at], back));
}
async function quickRun(n, back){
  const before = Object.fromEntries(ORDER.map(w => [w, lvl(w)]));
  const pics = nextWords(trainable(), n);   // (more than it needs: every QUICK.gapEvery-th is a sentence, when there is one)
  const missed = new Set(), sentences = [], phrases = [];
  let right = 0, asked = 0, stopped = false, stop;
  const stopping = new Promise(res => { stop = () => { stopped = true; res(null); }; });
  for (let i = 0, p = 0; i < n && !stopped; i++){
    lessonBar = `${QUICK_NAME()} · ${i + 1} of ${n}`;
    const gapHere = (i % QUICK.gapEvery === QUICK.gapEvery - 1 || p >= pics.length), b = gapHere ? practiceSentence(sentences) : null;
    const ph = !b && i % QUICK.phraseEvery === 2 ? phraseToAsk(phrases) : null;
    let ok, w;
    if (b){ sentences.push(b.t.join('')); w = b.gap; ok = await Promise.race([gapQ({t:b.t, en:b.en, gap:b.gap, stop}), stopping]); }
    else if (ph){ phrases.push(ph); w = ph; ok = await Promise.race([phraseQ({phrase:ph, stop}), stopping]); }
    else {
      if (p >= pics.length) break;   // (nothing left to ask about)
      w = pics[p++];
      const q = wordQuestion(w);
      ok = await Promise.race([pictureQ({head:'', body:q.body, word:w, type:q.type, options:q.options, text:q.text, answerIdx:q.answerIdx, stop,
        onShow:() => { if (q.type !== 'read') setTimeout(() => say(w), 300); }}), stopping]);
    }
    if (stopped) break;
    asked++; if (ok) right++; else missed.add(w);
  }
  lessonBar = null; closeCard(); save();
  const up = ORDER.filter(x => lvl(x) > before[x]);
  if (asked) SFX.fanfare();
  openCard(`<p class="label">${stopped && asked < n ? 'Practice stopped' : 'Practice done!'}</p>
    <p>${asked ? `You got <b>${right} of ${asked}</b> right first time.` : 'No questions answered this time.'}</p>
    ${up.length ? `<p class="small">${up.length === 1 ? 'A word' : `${up.length} words`} moved up a level:</p>
      <div class="qpup">${[4, 3, 2, 1].map(l => [l, up.filter(x => lvl(x) === l)]).filter(([, ws]) => ws.length)
        .map(([l, ws]) => `<div class="qprow"><span class="qplv">${levelPips(l)} ${MASTERY[l - 1]}</span><div class="chips">${ws.map(chipHTML).join('')}</div></div>`).join('')}</div>` : ''}
    ${missed.size ? `<p class="small">Words to practise:</p><div class="chips">${[...missed].map(chipHTML).join('')}</div>` : ''}
    ${up.length || missed.size ? '<div class="gloss">Tap a word to hear it.</div>' : ''}
    <div class="actions"><button class="btn" data-a="again" data-b data-label="${n} more">${n} more</button><button class="btn primary" data-a="done">Done</button></div>`);   // (Done is A: you chose how many, so you'll most likely stop there)
  bindMissed();
  on('[data-a=done]', back);
  on('[data-a=again]', () => quickRun(n, back));
}
async function nextArea(){
  here().done = true; save(); SFX.fanfare(); fadeT = performance.now();
  await sleep(700);
  await infoBox('⛰️', `<p class="label">${AREA.name.en} complete!</p>
    <div class="stats"><span>${wordsCaught()} of ${ORDER.length} words caught</span><span>${S.friends.length} friends</span>${moneyHTML()}</div>
    <p>${AREA.exit.done}</p>
    <p class="small">${AREA.exit.notBuilt}</p>`);
  const back = AREA.exit.returnTo;   // until the next area is built, you're put back here
  S.pos = {place:placeOf(back), x:back.x, y:back.y, dir:back.facing}; placePlayer(); save();
}
const todaysWords = () => S.today.d === todayKey() ? S.today.ids.filter(w => WORDS[w] && lvl(w) > 0) : [];   // not words since removed from the game
function scrollCard(w){   // a word in the Word Scroll: caught, heard (a shadow of its picture, not giving it away) or not met yet
  if (lvl(w) > 0) return `<button class="card${isNewWord(w) ? ' new' : ''}" data-w="${w}" data-label="Open">${isNewWord(w) ? '<span class="newtag">new</span>' : ''}${WORDS[w].pic ? `<div class="c" aria-hidden="true">${picHTML(w)}</div><div class="hz">${w}</div>` : `<div class="c hz">${w}</div>`}<div class="p">${WORDS[w].py}</div>${pips(w)}</button>`;
  const faded = S.scroll.has && WORDS[w].pic;   // (in the old monkey's scroll, its picture faded, till you catch it: js/scrolls.js)
  if (S.heard[w]) return `<div class="card heard" aria-label="Heard ${S.heard[w]} times, not caught yet"><div class="c ${faded ? 'faded' : 'sil'}" aria-hidden="true">${WORDS[w].pic ? picHTML(w) : '？'}</div><div class="p">heard ${S.heard[w]}×</div></div>`;
  return `<div class="card unseen"><div class="c${faded ? ' faded' : ''}" aria-hidden="true">${faded ? picHTML(w) : '？'}</div><div class="p"></div></div>`;
}
const MASTERY = ['Caught', 'Recognised', 'Read', 'Used'];   // what each gold square means
// An example sentence with the word in it: the first line, then story sentence, that has it, preferring one you've seen.
// If none has it: the example written for it in the area, then a sentence you complete (such as 我要头带).
function exampleFor(w){
  const all = [...Object.values(L).map(l => [l, !!S.lines[l.t.join('')]]), ...STORY.map(s => [s, !!here().story])].filter(([s]) => s.t.includes(w));
  const pick = all.find(([, seen]) => seen) || all[0];
  if (pick) return pick[0];
  const ex = AREA.examples[w];
  if (ex) return {t:toks(ex.zh), en:ex.en};
  const done = SENTENCES().find(b => toks(b.sentence).includes(w));
  return done && {t:[...toks(done.sentence), '。'], en:done.sentenceEn};
}
// A caught word's page in the Word Scroll, or Friends. Its English waits behind the English button, which then shows how
// it's made, if it has a story (madeCard, js/cards.js), whose Back comes back here (en: with the English showing, and the
// word not said again).
function wordPage(w, back, from = 'Word Scroll', en = false){
  const d = WORDS[w], ex = exampleFor(w), made = hasMade(w), alike = !!soundsLike(w), more = made ? 'How it’s made' : alike ? 'Sounds like' : '';   // (what English becomes: then how it's made, then the word that sounds like it)
  if (!en) say(w);
  const howBtn = `<button class="btn" data-a="made">${more}</button>`;
  openCard(`<p class="label">${from} · ${CATEGORIES[d.category].name}</p>
    <div class="word side"><div class="pic" aria-hidden="true">${picHTML(w)}</div><div class="big">${w}</div><div class="py">${d.py}</div><div class="en"${en ? '' : ' hidden'}>${esc(d.en)}</div>
      <p class="mastery">${pips(w)} ${MASTERY[lvl(w) - 1]}</p>
      <div class="wordmore"><p class="note">Found: ${esc(fill(AREA.found[w] || AREA.name.en))}</p>
      ${ex ? `<p class="label examplehead">Example</p>${lineHTML(ex.t, w)}<div class="sentence-en"${en ? '' : ' hidden'}>${esc(ex.en)}</div>${Object.keys(S.lines).length <= TAP_TIP_LINES ? '<div class="gloss tip">Tap any word to see what it means.</div>' : ''}` : ''}</div></div>
    <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button>${en ? (more ? howBtn : '') : '<button class="btn" data-a="en">English</button>'}<button class="btn primary" data-a="ok" data-b>Back</button></div>`);
  bindTokens(sheet);
  const page = () => wordPage(w, back, from, true), sounds = () => soundsCard(w, made ? how : page);
  const how = () => madeCard(w, page, alike ? sounds : null, 'Sounds like ▸'), next = () => made ? how() : sounds();
  on('[data-a=say]', () => say(w));
  on('[data-a=en]', e => {
    sheet.querySelectorAll('.word .en, .sentence-en').forEach(x => x.hidden = false);
    const b = e.currentTarget; if (more){ b.setAttribute('data-a', 'made'); b.textContent = more; b.onclick = next; } else b.remove();
    const p = sheet.querySelector('.primary'); if (p) p.focus();
  });
  on('[data-a=made]', next);
  on('[data-a=ok]', back);
}
const heardWords = () => Object.keys(GLOSS).filter(w => S.heard[w]).sort((a, b) => S.heard[b] - S.heard[a]);   // words this area doesn't teach, most heard first
const SCROLL_WORDS = () => [...ORDER, ...PHRASES];   // everything in the Word Scroll: the area's words, then its phrases
// The Word Scroll's tabs, as [id, name]: a tab for each category the area has words in (Phrases among them), then Today,
// then Heard once you've heard a word this area doesn't teach.
const scrollTabs = () => [
  ...Object.entries(CATEGORIES).filter(([id]) => SCROLL_WORDS().some(w => WORDS[w].category === id)).map(([id, c]) => [id, c.tab]),
  ['today', 'Today'], ...(heardWords().length ? [['heard', 'Heard']] : [])
];
let scrollTab = null;   // the tab the Word Scroll is open at; it opens there again next time
function scrollPage(tab){   // what a tab of the Word Scroll shows
  if (tab === 'today'){
    const ids = todaysWords(), need = practiceWords().length;
    return `<p class="label cathead">Today’s words <span class="catn">${ids.length}</span></p>
      ${ids.length ? `<div class="grid" data-nav>${ids.map(scrollCard).join('')}</div>` : '<p>You haven’t met any words yet today.</p>'}
      <p class="small">${need} ${need === 1 ? 'word needs' : 'words need'} practice: practise ${esc(practiseWhere())}, or meet animals in the tall grass.</p>`;
  }
  if (tab === 'heard'){
    const heard = heardWords();
    return `<p class="label cathead">Heard</p><p class="small">Words you've heard in sentences. You'll catch them in later areas.</p>
      <div class="chips" data-nav>${heard.map(w => `<button class="chip" data-h="${w}" data-label="Hear it"><ruby>${w}<rt class="${S.pinyin ? '' : 'hid'}">${info(w)[0]}</rt></ruby> <span class="small">${S.heard[w]}×</span></button>`).join('')}</div>`;
  }
  const ws = SCROLL_WORDS().filter(w => WORDS[w].category === tab), pages = scrollPages().filter(p => p.cat === tab);
  if (pages.length < 2) return `<p class="label cathead">${CATEGORIES[tab].name} <span class="catn">${ws.filter(w => lvl(w) > 0).length}/${ws.length}${pages[0] ? sealHTML(pages[0]) : ''}</span></p>
    ${pages[0] ? sealNote(pages[0]) : ''}<div class="grid" data-nav>${ws.map(scrollCard).join('')}</div>`;
  return `<p class="label cathead">${CATEGORIES[tab].name} <span class="catn">${ws.filter(w => lvl(w) > 0).length}/${ws.length}</span></p>
    ${pages.map(p => `<p class="pagehead"><span>${esc(areaOf(p.area).name.en)}</span> <span class="catn">${p.words.filter(w => lvl(w) > 0).length}/${p.words.length}${sealHTML(p)}</span></p>
      ${sealNote(p)}<div class="grid" data-nav>${p.words.map(scrollCard).join('')}</div>`).join('')}`;
}
/* ---- the old monkey's scroll ---- */
// The Word Scroll, given a story (decided 8 November 2026, the polish plan): long ago someone drew everything on the
// mountain in an old scroll, with its name, but the pictures have faded, and every word you catch brings one back. The old
// monkey gives it you as he checks your first words (the scroll step: scrollGiven), so they're the first pictures you see
// come back; from then on a word you haven't caught shows its picture faded. Each page is one area's words of one kind,
// such as Flower Fruit Mountain's animals (scrollPages); once you've caught every word on it, it's full, and whoever seals
// pages now (the area's scroll.by: {who, if, say}, the old monkey; in the human world, the master) has a ! for you
// (sealFor), stamps it with a red seal, 好, good, and gives you something for it (scrollGift): a page of twelve words or more
// something to wear, a headband in a colour you know and haven't got; of seven or more, a snack (the area's scroll.snacks,
// the first you know); and a smaller one, shells. Kept in the save's scroll: has, and sealed, each page as 'area:kind'.
const areaOf = n => AREAS.find(a => a.number === n) || AREA;
const pageKey = p => `${p.area}:${p.cat}`;
function scrollPages(){   // every page so far, as {area, cat, words}, in the scroll's order: this area's and those before it
  const pages = [];
  for (const a of AREAS.filter(a => a.number <= AREA.number)) for (const cat of Object.keys(CATEGORIES)){
    const words = Object.keys(WORDS).filter(w => WORD_BANK[w].area === a.number && WORDS[w].category === cat && (!WORDS[w].later || lvl(w) >= 1));
    if (words.length) pages.push({area:a.number, cat, words});
  }
  return pages;
}
const pageFull = p => p.words.every(w => lvl(w) >= 1);
const pageSealed = p => S.scroll.sealed.includes(pageKey(p));
const sealsWaiting = () => S.scroll.has ? scrollPages().filter(p => pageFull(p) && !pageSealed(p)) : [];   // full pages not sealed yet
const sealer = () => ((AREA.scroll || {}).by || []).find(b => !b.if || matches(b.if)) || null;   // who seals pages now ({who, say}), if anyone
const sealFor = n => !!n && S.scroll.has && (sealer() || {}).who === n.id && sealsWaiting().length > 0;   // they have a ! for you: a page to seal
const sealPart = () => ({seal:true, do:[{say:sealer().say}, {seal:true}]});   // what they do when you talk to them then, or straight after what they had for the story (talk, js/world.js)
const SEAL_ZH = '好';   // what the seal says: good
const sealHTML = p => pageSealed(p) ? ` <span class="seal" role="img" aria-label="Sealed: a full page">${SEAL_ZH}</span>` : '';
function sealNote(p){   // under a full page's heading, till it's sealed: who to show it to
  if (!S.scroll.has || pageSealed(p) || !pageFull(p)) return '';
  const by = sealer();
  return `<p class="sealwait">Full! ${by ? `Show it to ${esc(theName(by.who))}, for a red seal.` : 'It waits for a red seal.'}</p>`;
}
// What you're given for a full page (its steps), by its size.
function scrollGift(p){
  const n = p.words.length;
  if (n >= 12){
    const band = CLOTHES.find(c => c.colours && lvl(c.colour) >= 1 && !S.wardrobe.owned.includes(c.item));
    if (band) return [{give:band.item}, {message:`And a ${WORDS[band.colour].en.split(',')[0]} {头带|headband} for you! Put it on from the menu: 衣服 (clothes).`}];
  }
  if (n >= 7){
    const snack = ((AREA.scroll || {}).snacks || []).find(w => WORDS[w] && lvl(w) >= 1 && (AREA.food || {})[w] && !bagFull(w));   // (one with room in your bag: never kept for you, in the way of what they have for the story)
    if (snack) return [{bag:snack, note:`And a {${snack}} for your bag!`}];
  }
  const k = Math.min(15, Math.max(3, n));   // (shells, one a word, from 3 to 15)
  return [{shells:k, note:`And ${k} ${MONEY()} for you!`}];
}
// The old monkey gives you his scroll (the scroll step): what it is, and its first pictures coming back, the words you
// know, one after another, among others still faded.
async function scrollGiven(who){
  const has = SCROLL_WORDS().filter(w => WORDS[w].pic), known = has.filter(w => lvl(w) >= 1).slice(0, 8);   // (one row of eight)
  const more = has.filter(w => lvl(w) === 0 && WORD_BANK[w].area === AREA.number).slice(0, Math.max(0, 8 - known.length));
  S.scroll.has = true; S.scrollNew = (S.scrollNew || []).filter(w => !known.includes(w)); save();   // (the words it shows you, seen)
  const shown = infoBox(null, `<p class="label">The old scroll</p>
    <div class="oldscroll"><div class="grid">${[...known, ...more].map(w => `<div class="card${lvl(w) ? ' back' : ''}"><div class="c faded" aria-hidden="true">${picHTML(w)}</div><div class="hz">${lvl(w) ? w : ''}</div></div>`).join('')}</div></div>
    <p>${esc(cap(theName(who)))} gives you a very old scroll. Long ago, someone drew everything on the mountain in it, with its name, but the pictures have faded. Every word you catch brings one back!</p>
    <p class="small">Open it any time: MENU, then 词 (words). A full page gets a red seal, and a present.</p>`);
  sheet.querySelectorAll('.oldscroll .card.back').forEach((c, i) => setTimeout(() => {   // the words you know, coming back
    if (!c.isConnected) return;
    c.querySelector('.c').classList.remove('faded'); c.classList.add('shine'); SFX.word();
  }, 700 + i * 500));
  await shown;
}
// A full page sealed (the seal step): the page, every picture back, the red seal stamped on it, then a present.
async function sealCard(p, who){
  const name = CATEGORIES[p.cat].name, other = p.area !== AREA.number ? ` · ${esc(areaOf(p.area).name.en)}` : '';
  const shown = infoBox(null, `<p class="label">Your scroll · ${esc(name)}${other}</p>
    <div class="oldscroll sealpage"><div class="grid">${p.words.map(w => `<div class="card"><div class="c${WORDS[w].pic ? '' : ' hz'}" aria-hidden="true">${WORDS[w].pic ? picHTML(w) : w}</div></div>`).join('')}</div>
      <span class="seal stamp" role="img" aria-label="A red seal">${SEAL_ZH}</span></div>
    <p>The ${esc(name.toLowerCase())} page is full! ${esc(cap(theName(who)))} stamps it with a red seal: ${SEAL_ZH} (hǎo), good.</p>`);
  setTimeout(() => { SFX.tock(); SFX.right(); }, 450);   // (the stamp coming down: its look, css/game.css)
  await shown;
}
// New in your Word Scroll: the words you've caught but not seen there yet (S.scrollNew, the newest last, noted as you catch
// each: setSeen in js/state.js). No message says a word's gone into your scroll (decided 8 November 2026, the gentler
// prologue: 41 of them in the prologue alone), and no glow either (decided 9 November 2026, after playing it: the MENU
// button glowed after every word, and the menu then showed nothing new): the menu's 词 tile says how many words are new,
// and the scroll opens on the page with the newest, each tagged new, with a gold dot on each other tab that has some, till
// you've seen the page it's on (Today's page too).
const scrollNew = () => (S.scrollNew || []).filter(w => WORDS[w] && lvl(w) >= 1 && SCROLL_WORDS().includes(w));
const isNewWord = w => (S.scrollNew || []).includes(w);
const tabWords = tab => tab === 'today' ? todaysWords() : tab === 'heard' ? [] : SCROLL_WORDS().filter(w => WORDS[w].category === tab);
function seenOn(tab){   // the page you're looking at: its new words seen, tagged new this once
  const there = new Set(tabWords(tab));
  if (!(S.scrollNew || []).some(w => there.has(w))) return;
  S.scrollNew = S.scrollNew.filter(w => !there.has(w)); save();
}
async function sealPages(who){   // every full page, sealed one after another, each with its present
  for (const p of sealsWaiting()){
    await sealCard(p, who);
    S.scroll.sealed.push(pageKey(p)); save();
    await runSteps(scrollGift(p), who);
  }
}
function openScroll(back, top, tab){   // top: where to scroll to, to come back to the same place. tab: the tab to open at
  const tabs = scrollTabs(), fresh = scrollNew();
  if (tab) scrollTab = tab;
  else if (fresh.length) scrollTab = WORDS[fresh[fresh.length - 1]].category;   // (new words: the page with the newest)
  if (!tabs.some(([id]) => id === scrollTab)) scrollTab = tabs[0][0];
  const dots = new Set(fresh.map(w => WORDS[w].category));   // (each other tab with new words: a gold dot)
  openCard(`<p class="label">Word Scroll · ${wordsCaught()} of ${ORDER.length} caught</p>
    <div class="scrolltabs" role="tablist">${tabs.map(([id, name]) => `<button class="tab" role="tab" data-tab="${id}" aria-selected="${id === scrollTab}">${name}${dots.has(id) && id !== scrollTab ? '<span class="newdot" aria-hidden="true"></span>' : ''}</button>`).join('')}</div>
    ${scrollPage(scrollTab)}
    <div class="gloss">${scrollTab === 'heard' ? 'Tap a word to hear it.' : 'Tap a word to see its page.'}</div>
    <p class="small">Gold squares show how well you know a word: caught, recognised, read, used. Shadows are words you've heard but not caught yet.</p>
    <div class="actions"><button class="btn primary" data-a="ok" data-b>${back ? 'Back' : 'Close'}</button></div>`);
  seenOn(scrollTab);   // (its new words, seen: tagged this once)
  if (top) sheet.scrollTop = top;
  const chosen = sheet.querySelector('.tab[aria-selected="true"]'), row = sheet.querySelector('.scrolltabs');
  if (chosen && row) row.scrollLeft = Math.max(0, chosen.offsetLeft - row.offsetLeft - 24) || 0;   // the tabs are one row: the chosen one in view
  sheet.querySelectorAll('.tab').forEach(b => b.onclick = () => { if (b.dataset.tab !== scrollTab){ SFX.turn(); openScroll(back, 0, b.dataset.tab); } });
  sheet.querySelectorAll('.card[data-w]').forEach(b => b.onclick = () => {
    const at = sheet.scrollTop;
    SFX.blip(); wordPage(b.dataset.w, () => {   // back from its page, still on the same word
      openScroll(back, at, scrollTab); const c = sheet.querySelector(`.card[data-w="${b.dataset.w}"]`); if (c){ markNav(c); c.focus({preventScroll:true}); }
    });
  });
  sheet.querySelectorAll('.chip[data-h]').forEach(b => b.onclick = () => {
    const w = b.dataset.h, [py, en] = info(w); say(w);
    sheet.querySelector('.gloss').innerHTML = `<b>${w}</b> ${py} · ${esc(en)}`;
  });
  on('[data-a=ok]', () => { if (typeof back === 'function') back(); else closeCard(); });
}
