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
    openCard(`<p class="label">Story Scroll</p><p class="small">The story of your first day, in words you've met. Tap any word you're unsure of.</p>
      ${STORY.map((s,i) => `<div class="sent" data-i="${i}">${s.pic ? `<span class="spic" aria-hidden="true">${picHTML(s.pic)}</span>` : ''}<div>${lineHTML(s.t)}<div class="sentence-en" ${firstRead ? '' : 'hidden'}>${esc(s.en)}</div></div></div>`).join('')}
      <div class="gloss">Tap a word for its meaning.</div>
      <div class="actions"><button class="btn grow" data-a="read">🔊 Read it to me</button>${firstRead ? '' : '<button class="btn" data-a="en">English</button>'}<button class="btn primary" data-a="ok">Questions</button></div>`);
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
      for (const q of qs){
        hear(q.t);
        const gapped = q.t.map(w => w === q.answer ? GAP : w);
        const ok = await pictureQ({head:'<p class="label">Story question</p><p class="prompt">Which picture fills the gap?</p>',
          body: lineHTML(gapped) + `<div class="sentence-en" hidden>${esc(q.en)}</div><div class="gloss">Tap a word for its meaning. <button class="engbtn" data-a="qen">English</button></div>`,
          options:q.options.map(w => `<span class="ico">${picHTML(w)}</span><span class="cap">${w}</span>`), answerIdx:q.options.indexOf(q.answer),
          onShow:() => on('[data-a=qen]', e => { sheet.querySelector('.sentence-en').hidden = false; e.currentTarget.remove(); }),
          onAnswer:() => {   // fill the gap and say the whole sentence
            sheet.querySelector('.line').outerHTML = lineHTML(q.t, q.answer); bindTokens(sheet);
            say(q.t.join(''));
          }});
        if (ok){ right++; gainXP(XP.right); }
      }
      const firstTime = !here().story, end = AREA.storyEnd;
      here().story = true; if (firstTime){ S.peaches += end.reward; gainXP(XP.story); } save(); buildMap();
      first('story');
      SFX.fanfare();
      openCard(`<div class="who" aria-hidden="true">📖</div><p class="label">${end.title}</p>
        <p>${qs.length ? `You got ${right} of ${qs.length} story questions.` : ''}${firstTime ? ` +${end.reward} 🍑` : ''}</p>
        ${end.text.map(p => `<p>${p}</p>`).join('\n        ')}
        <div class="actions"><button class="btn primary" data-a="done">Keep playing</button></div>`);
      on('[data-a=done]', () => { closeCard(); if (firstTime && end.rumble){ SFX.rumble(); shakeT = performance.now(); } res(); });
    });
  });
}
function checklistHTML(onlyLeft){   // the area's checklist (areaChecklist() in js/world.js); onlyLeft: just what's left before the exit test
  const items = areaChecklist().filter(([t, done, exitTest]) => !onlyLeft || (!done && !exitTest));
  return `<ul class="checklist">${items.map(([t, done]) => `<li class="${done ? 'done' : ''}">${esc(t)}</li>`).join('')}</ul>`;
}
function infoBox(who, html){
  return new Promise(res => {
    openCard(`<div class="who" aria-hidden="true">${who}</div>${html}<div class="actions"><button class="btn primary" data-a="ok">OK</button></div>`);
    on('[data-a=ok]', () => { closeCard(); res(); });
  });
}
const PASS = 0.8;
// Matching words to their pictures, in rounds of about 4 (the cave door test and the training ground).
// Gives the words you missed first time, or null if you stop.
function matchWords(words, title, stopLabel){
  return new Promise(res => {
    const rounds = []; for (let i = 0; i < words.length; i += 4) rounds.push(words.slice(i, i + 4));
    if (rounds.length > 1 && rounds[rounds.length - 1].length < 3){ const last = rounds.pop(); rounds[rounds.length - 1].push(...last); }
    const missed = new Set();
    let r = 0, picked = null;
    function render(){
      const set = rounds[r], left = shuffle(set), right = shuffle(set);
      openCard(`<p class="label">${title} · ${r + 1} of ${rounds.length}</p>
        <p class="small">Tap a word, then tap its picture.</p>
        <div class="match"><div class="col">${left.map(w => `<button class="mw" data-w="${w}"><ruby>${w}<rt class="${S.pinyin ? '' : 'hid'}">${WORDS[w].py}</rt></ruby></button>`).join('')}</div>
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
            setTimeout(() => { r++; if (r < rounds.length) render(); else res(missed); }, 450);
          }
        } else {
          SFX.wrong(); missed.add(picked); bt.classList.add('shake'); setTimeout(() => bt.classList.remove('shake'), 400);
          fb.textContent = 'Not that one. Try again.';
        }
      });
      on('[data-a=quit]', () => { closeCard(); res(null); });
    }
    render();
  });
}
// The words you missed, as chips you can tap to hear.
const missedHTML = missed => missed.size ? `<p class="small">Words to practise:</p><div class="chips">${[...missed].map(w => `<button class="chip" data-w="${w}">${w}</button>`).join('')}</div><div class="gloss">Tap a word to hear it.</div>` : '';
const bindMissed = () => sheet.querySelectorAll('.chip').forEach(bt => bt.onclick = () => { const w = bt.dataset.w; say(w); sheet.querySelector('.gloss').innerHTML = `<b>${w}</b> ${WORDS[w].py} · ${esc(WORDS[w].en)}`; });
async function wordTest(){   // the exit test at the cave door: every word with a picture you've caught
  const words = shuffle(ORDER.filter(w => WORDS[w].pic && lvl(w) >= 1));
  const missed = await matchWords(words, 'Word test', 'Stop test');
  if (!missed) return false;
  const right = words.length - missed.size, need = Math.ceil(words.length * PASS), pass = right >= need;
  missed.forEach(w => { const rr = rec(w); rr.due = Date.now(); });
  if (pass && !here().done) gainXP(XP.exitTest);
  save();
  if (pass) SFX.fanfare(); else SFX.wrong();
  return new Promise(res => {
    openCard(`<div class="who" aria-hidden="true">${pass ? '🎉' : '📜'}</div>
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
const unpictured = () => ORDER.filter(w => !WORDS[w].pic && lvl(w) >= 1);   // caught words without a picture (我 要), practised by building sentences
const isDue = w => rec(w).due <= Date.now();   // a newly caught word is due straight away
const dueWords = () => [...trainable(), ...unpictured()].filter(isDue);   // words due for review that you can practise
const trainingCalls = () => trainable().length >= TRAINING_MIN && dueWords().length > 0;   // the practice post shows a !
// The words to practise: the ones due for review first, then the ones due soonest, in a random order.
const trainingWords = () => shuffle(shuffle(trainable()).sort((a, b) => rec(a).due - rec(b).due).slice(0, TRAINING_WORDS));
// A sentence to build at the practice post, for words without a picture: one you've built for a character
// (the area's requests and shop), with every word caught, preferring one with a word that's due.
function practiceSentence(){
  const all = [...REQUESTS, ...(AREA.shop ? AREA.shop.items : [])].map(b => ({...b, t:toks(b.build)}))
    .filter(b => b.t.every(w => lvl(w) >= 1) && b.t.some(w => !WORDS[w].pic));
  const due = all.filter(b => b.t.some(w => !WORDS[w].pic && isDue(w)));
  return shuffle(due.length ? due : all)[0] || null;
}
// Build the sentence from word tiles, with its English to go on. Built right first time, its words without
// a picture count as answered right, and each one that was due earns a peach. All its words count as used.
// Gives {first, peaches}.
async function buildRound(b, who){
  const bare = b.t.filter(w => !WORDS[w].pic), due = bare.filter(isDue);
  const rightFirst = await tiles(who, b.t, lvl(b.extraTile) >= 1 ? [b.extraTile] : [], `Build the sentence: “${esc(b.buildEn)}” Put the words in order.`);
  if (rightFirst) bare.forEach(w => answer(w, true, 'build'));
  b.t.forEach(useWord);
  const peaches = rightFirst ? due.length : 0;
  S.peaches += peaches; save();
  return {first:rightFirst, peaches};
}
// After a session: a word matched first time comes back later, a missed one straight away (the gold
// squares stay the same). Each due word matched first time earns a peach. Gives how many peaches.
function trained(words, missed){
  let peaches = 0;
  for (const w of words){
    const r = rec(w), ok = !missed.has(w);
    if (ok){ gainXP(isDue(w) ? XP.rightDue : XP.right); if (isDue(w)) peaches++; }
    if (ok){ r.ok = (r.ok || 0) + 1; r.due = Date.now() + INTERVALS[Math.min(r.ok - 1, 3)] * DAY; }
    else { r.ok = 0; r.due = Date.now(); }
    addToday(w);
  }
  S.peaches += peaches; save();
  return peaches;
}
async function trainingGround(){
  const who = `<img class="portrait" alt="" src="${SPR.post.toDataURL()}">`, have = trainable().length;
  if (have < TRAINING_MIN){ await infoBox(who, `<p>A practice post. Come back once you've learned ${TRAINING_MIN} words with pictures (${have}/${TRAINING_MIN}).</p>`); return; }
  const words = trainingWords(), sentence = practiceSentence(), bare = sentence ? sentence.t.filter(w => !WORDS[w].pic) : [];
  const due = [...words, ...bare].filter(isDue).length;
  const ask = 'Practise matching words to their pictures' + (sentence ? `, then build a sentence with ${bare.map(wz).join(' and ')}. ` : '. ') + (due
    ? `${due} of them ${due === 1 ? 'is' : 'are'} due for review: each one you get right first time earns a 🍑.`
    : 'None of your words are due for review right now, so there are no 🍑 this time.');
  if (!await confirmBox(who, ask, 'Start', 'Not now')) return;
  const missed = await matchWords(words, 'Training', 'Stop');
  if (!missed) return;
  const right = words.length - missed.size, built = sentence ? await buildRound(sentence, who) : null, peaches = trained(words, missed) + (built ? built.peaches : 0);
  SFX.fanfare();
  await new Promise(res => {
    openCard(`<div class="who" aria-hidden="true">${who}</div><p class="label">Training done</p>
      <p>You matched <b>${right} of ${words.length}</b> words right first time.${built ? (built.first ? ' You built the sentence right first time.' : ' You built the sentence.') : ''}${peaches ? ` +${peaches} 🍑` : ''}</p>
      ${missedHTML(missed)}
      <div class="actions"><button class="btn primary" data-a="ok">OK</button></div>`);
    bindMissed();
    on('[data-a=ok]', () => { closeCard(); res(); });
  });
}
async function nextArea(){
  here().done = true; save(); SFX.fanfare(); fadeT = performance.now();
  await sleep(700);
  await infoBox('⛰️', `<p class="label">${AREA.name.en} complete!</p>
    <div class="stats"><span>${ORDER.filter(w => lvl(w) > 0).length}/${ORDER.length} words</span><span>${S.friends.length} friends</span><span>🍑 ${S.peaches}</span></div>
    <p>${AREA.exit.done}</p>
    <p class="small">${AREA.exit.notBuilt}</p>`);
  const back = AREA.exit.returnTo;   // until the next area is built, you're put back here
  pl.x = back.x; pl.y = back.y; pl.dir = back.facing; pl.px = pl.x*T; pl.py = pl.y*T; S.pos = {x:back.x, y:back.y, dir:back.facing}; save();
}
const todaysWords = () => S.today.d === todayKey() ? S.today.ids.filter(w => WORDS[w] && lvl(w) > 0) : [];   // not words since removed from the game
function scrollCard(w){   // a word in the Word Scroll: caught, heard (a shadow of its picture, not giving it away) or not met yet
  if (lvl(w) > 0) return `<button class="card" data-w="${w}">${WORDS[w].pic ? `<div class="c" aria-hidden="true">${picHTML(w)}</div><div class="hz">${w}</div>` : `<div class="c hz">${w}</div>`}<div class="p">${WORDS[w].py}</div>${pips(w)}</button>`;
  if (S.heard[w]) return `<div class="card heard" aria-label="Heard ${S.heard[w]} times, not caught yet"><div class="c sil" aria-hidden="true">${WORDS[w].pic ? picHTML(w) : '？'}</div><div class="p">heard ${S.heard[w]}×</div></div>`;
  return `<div class="card unseen"><div class="c">？</div><div class="p"></div></div>`;
}
const MASTERY = ['Caught', 'Recognised', 'Read', 'Used'];   // what each gold square means
// An example sentence with the word in it: the first line, then story sentence, that has it, preferring one you've seen.
// If none has it: the example written for it in the area, then a sentence you build (such as 我要头带).
function exampleFor(w){
  const all = [...Object.values(L).map(l => [l, !!S.lines[l.t.join('')]]), ...STORY.map(s => [s, !!here().story])].filter(([s]) => s.t.includes(w));
  const pick = all.find(([, seen]) => seen) || all[0];
  if (pick) return pick[0];
  const ex = AREA.examples[w];
  if (ex) return {t:toks(ex.zh), en:ex.en};
  const built = [...REQUESTS, ...(AREA.shop ? AREA.shop.items : [])].find(b => toks(b.build).includes(w));
  return built && {t:[...toks(built.build), '。'], en:built.buildEn};
}
function wordPage(w, back){   // a caught word's page in the Word Scroll
  const d = WORDS[w], ex = exampleFor(w);
  say(w);
  openCard(`<p class="label">Word Scroll · ${CATEGORIES[d.category].name}</p>
    <div class="word"><div class="pic" aria-hidden="true">${picHTML(w)}</div><div class="big">${w}</div><div class="py">${d.py}</div><div class="en" hidden>${esc(d.en)}</div></div>
    <p class="mastery">${pips(w)} ${MASTERY[lvl(w) - 1]}</p>
    <p class="note">Found: ${esc(fill(AREA.found[w] || AREA.name.en))}</p>
    ${ex ? `<p class="label examplehead">Example</p>${lineHTML(ex.t, w)}<div class="sentence-en" hidden>${esc(ex.en)}</div><div class="gloss">Tap any word to see what it means.</div>` : ''}
    <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button><button class="btn" data-a="en">English</button><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
  bindTokens(sheet);
  on('[data-a=say]', () => say(w));
  on('[data-a=en]', e => { sheet.querySelectorAll('.word .en, .sentence-en').forEach(x => x.hidden = false); e.currentTarget.remove(); const p = sheet.querySelector('.primary'); if (p) p.focus(); });
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
    const ids = todaysWords(), due = ORDER.filter(w => lvl(w) >= 1 && rec(w).due <= Date.now() + DAY).length;
    return `<p class="label cathead">Today’s words <span class="catn">${ids.length}</span></p>
      ${ids.length ? `<div class="grid">${ids.map(scrollCard).join('')}</div>` : '<p>You haven’t met any words yet today.</p>'}
      <p class="small">${due} ${due === 1 ? 'word is' : 'words are'} due for review within a day: practise at the practice post, or meet animals in the tall grass.</p>`;
  }
  if (tab === 'heard'){
    const heard = heardWords();
    return `<p class="label cathead">Heard</p><p class="small">Words you've heard in sentences. You'll catch them in later areas.</p>
      <div class="chips">${heard.map(w => `<button class="chip" data-h="${w}">${w} <span class="small">${S.heard[w]}×</span></button>`).join('')}</div>`;
  }
  const ws = SCROLL_WORDS().filter(w => WORDS[w].category === tab);
  return `<p class="label cathead">${CATEGORIES[tab].name} <span class="catn">${ws.filter(w => lvl(w) > 0).length}/${ws.length}</span></p>
    <div class="grid">${ws.map(scrollCard).join('')}</div>`;
}
function openScroll(back, top, tab){   // top: where to scroll to, to come back to the same place. tab: the tab to open at
  const tabs = scrollTabs();
  if (tab) scrollTab = tab;
  if (!tabs.some(([id]) => id === scrollTab)) scrollTab = tabs[0][0];
  const seen = ORDER.filter(w => lvl(w) > 0).length;
  openCard(`<p class="label">Word Scroll · ${seen} of ${ORDER.length}</p>
    <div class="scrolltabs" role="tablist">${tabs.map(([id, name]) => `<button class="tab" role="tab" data-tab="${id}" aria-selected="${id === scrollTab}">${name}</button>`).join('')}</div>
    ${scrollPage(scrollTab)}
    <div class="gloss">${scrollTab === 'heard' ? 'Tap a word to hear it.' : 'Tap a word to see its page.'}</div>
    <p class="small">Gold squares show how well you know a word: caught, recognised, read, used. Shadows are words you've heard but not caught yet.</p>
    <div class="actions"><button class="btn primary" data-a="ok" data-b>${back ? 'Back' : 'Close'}</button></div>`);
  if (top) sheet.scrollTop = top;
  sheet.querySelectorAll('.tab').forEach(b => b.onclick = () => { if (b.dataset.tab !== scrollTab){ SFX.turn(); openScroll(back, 0, b.dataset.tab); } });
  sheet.querySelectorAll('.card[data-w]').forEach(b => b.onclick = () => {
    const at = sheet.scrollTop;
    SFX.blip(); wordPage(b.dataset.w, () => openScroll(back, at));
  });
  sheet.querySelectorAll('.chip[data-h]').forEach(b => b.onclick = () => {
    const w = b.dataset.h, [py, en] = info(w); say(w);
    sheet.querySelector('.gloss').innerHTML = `<b>${w}</b> ${py} · ${esc(en)}`;
  });
  on('[data-a=ok]', () => { if (typeof back === 'function') back(); else closeCard(); });
}
